# BUILD SPEC — Legal Metrology Compliance Checker

SIH 2024 · Problem Statement 26034 · Ministry of Consumer Affairs

> This is the single source of truth. Status markers: **[DONE]** = implemented, builds & tests green. **[PENDING]** = not yet implemented.

## Mission
Enforcement officers upload photos of packaged products. Google Gemini Vision extracts mandatory declarations (MRP, manufacturer, net quantity, mfg date, consumer care, etc.), a rule engine validates them against the Legal Metrology (Packaged Commodities) Rules, 2011, generates compliance reports (PDF), and provides dashboards.

## Tech Stack (do not deviate)
- Next.js 14 App Router, TypeScript strict
- Tailwind CSS + shadcn/ui (slate theme)
- Supabase for DB / Auth / Storage (`@supabase/ssr`)
- Google Gemini via `@google/generative-ai` — `gemini-2.0-flash-exp` (default), `gemini-1.5-pro` (fallback)
- Zod runtime validation, react-hook-form forms, Recharts charts
- jsPDF + jspdf-autotable for PDFs (already the chosen PDF lib)
- @tanstack/react-query client state
- Vitest tests, deployed on Vercel

## Environment Variables (in .env.local — never commit)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
Live values exist in `legal-metrology/.env.local` (gitignored).

## Folder Structure (current, in `legal-metrology/`)
```
src/
  app/
    (auth)/{login,signup}/page.tsx, layout.tsx
    (protected)/{dashboard,upload,reports/[id],reports/page,search,profile}/page.tsx
    api/{analyze,validate,reports/[id],reports/pdf/[id],dashboard/stats,search,health}/route.ts
    auth/callback/route.ts
    layout.tsx, page.tsx, globals.css, providers.tsx, error.tsx, not-found.tsx
  components/
    ui/         (shadcn-style)         [DONE]
    layout/     Navbar, UserNav        [DONE]
    features/   upload, dashboard, reports, search  [DONE]
  lib/
    supabase/{client,server,middleware}.ts   [DONE]
    gemini/{client,prompts,schemas,pipeline,usage}.ts  [DONE]
    rules/{validator.ts,types.ts,checks/LM-01..LM-12.ts}  [DONE]
    pdf/generateReport.ts (jsPDF)  [DONE]
    errors.ts   [DONE]
    rate-limit.ts  [PENDING]
    utils/{cn,formatters}.ts  [DONE]
  types/{domain.ts,database.ts,gemini.ts}  [DONE]
supabase/
  migrations/001_initial_schema.sql  [DONE]
  seed.sql (12 LM rules row)  [PENDING]
scripts/
  process-dataset.ts (offline batch processor)  [PENDING]
docs/
  ARCHITECTURE.md, API.md, DEPLOY.md, RULES_MAPPING.md, PROMPTS.md, DEMO_SCRIPT.md  [PENDING]
middleware.ts  [DONE]
vercel.json  [DONE]
```

## Database Schema
Tables `profiles`, `products`, `extractions`, `compliance_reports` are in `001_initial_schema.sql`. **[PENDING]** additions to match spec:
- `rules` (rule_code, title, description, legal_reference, category, severity, validation_config, is_active) + `supabase/seed.sql` inserting LM-01..LM-12
- `audit_log` (user_id, action, entity_type, entity_id, metadata, created_at)
- `rate_limits` (user_id, endpoint, requested_at) + index
- Storage buckets: `product-images` (auth write, public read), `reports` (auth only)

RLS + `handle_new_user()` trigger (invite codes LMADMIN2025 → admin, LMOFFICER2025 → officer, else viewer) already defined.

## API Contracts (freeze these)
- `POST /api/analyze` `{ productId, imageUrls }` → 200 `{ extractionId, reportId, structured, fontAnalysis, suggestions, score, status }`; 429 rate_limited; 422; 502 ai_service_error
- `POST /api/validate` `{ extractionId }` → `{ reportId, status, score, violations, passedChecks }` (currently takes structured data directly — normalize to extractionId)
- `GET /api/reports/[id]` → `{ product, extraction, report }`
- `GET /api/reports/pdf/[id]` → `application/pdf` stream [DONE]
- `GET /api/dashboard/stats` → aggregated stats [DONE]
- `GET /api/search?q&status&category` → `{ results, total }` [DONE]
- `GET /api/health` → `{ status, version, timestamp, dbConnected }` [DONE]

## Shared Types
`src/types/domain.ts` defines Role, Category, WeightBucket, Status, Severity, StructuredDeclarations, FontAnalysis, Violation, EngineResult. Keep in sync with `src/types/database.ts` (regenerate via `npm run generate-types`) and Zod schemas in `src/lib/gemini/schemas.ts`.

## 12 Rule Checks (LM-01..LM-12)
Implemented in `src/lib/rules/checks/`. Scoring: start 100; -15 critical, -8 major, -3 minor. Status: ≥85 compliant, 60-84 partial, <60 non_compliant. 7 Vitest cases pass.

| Code | Requirement | Reference | Severity |
|------|-------------|-----------|----------|
| LM-01 | Manufacturer name & complete address | Rule 6(1)(a) | critical |
| LM-02 | Common/generic name | Rule 6(1)(b) | major |
| LM-03 | Net quantity, standard SI units | Rule 8 | critical |
| LM-04 | MRP incl. "inclusive of all taxes" | Rule 6(1)(e) | critical |
| LM-05 | Month & year of mfg/pack/import | Rule 6(1)(c) | critical |
| LM-06 | Consumer care (name + phone/email) | Rule 6(1)(d) | major |
| LM-07 | Country of origin (imported) | Rule 6(10) | critical |
| LM-08 | Font size per tier (≤200→1mm, 200-500→2mm, >500→4mm) | Rule 9 | major |
| LM-09 | MRP integrity (no overwrite/sticker) | Rule 6(3) | critical |
| LM-10 | Unit sale price (food >100g) | Rule 6 | major |
| LM-11 | No misleading terms | Rule 6 | minor |
| LM-12 | Declarations on Principal Display Panel | Rule 5 | minor |

## Gemini Prompts
`src/lib/gemini/prompts.ts` holds CALL 1 (extraction), CALL 2 (font analysis), CALL 3 (suggestions) with `responseSchema` + temperature 0.1/0.2/0.3. `src/lib/gemini/pipeline.ts` runs calls 1+2 in parallel, retry w/ backoff (3 attempts), 55s AbortController timeout, fallbacks. See `docs/PROMPTS.md` (PENDING).

## Pipeline Rules
- Calls 1 & 2 in parallel via Promise.all; Call 3 after
- If Call 2 fails → `fontAnalysis = null`, LM-08 skips w/ warning
- If Call 3 fails → `suggestions = {}`
- Track usage/attempts via `src/lib/gemini/usage.ts`

## Rate Limiting [PENDING]
- `/api/analyze`: 10/hour per user
- `/api/reports/pdf`: 20/hour per user
- Implement `src/lib/rate-limit.ts` using `rate_limits` table; apply in both routes.

## Dataset Ingestion [PENDING — script scaffold]
`scripts/process-dataset.ts`: read `/data/<product>/` subfolders → upload images to storage → insert products (source='dataset_import') → Gemini pipeline → rule engine → insert extraction + report. Idempotent, resumable via `.processed.json`, respect Gemini 15 RPM (sleep ~4s), log failures to `data/failures.jsonl`, track tokens/cost. Run with `npm run process-dataset` (needs `tsx`).

## Roles + Invite Codes
Officer `LMOFFICER2025` (upload + view own), Admin `LMADMIN2025` (all + review), Viewer no code (read-only).

## Demo Prep
Seed ~15 demo products from processed dataset; cache Gemini responses as fixtures in `scripts/fixtures/`; pre-generate reports. [PENDING]

## Deliverables
- Working code: upload→report flow, dashboard, search, PDF export, 3-role auth, health check ✅
- Docs set in `/docs/`, pitch slides, demo video script [PENDING]

## Agent Rules
- Ask before installing deps not in stack, creating/modifying tables not in schema, or changing API contracts
- Ask if dataset structure is unclear
- Never commit `.env.local`, `/data/`, or `scripts/fixtures/`
- Every API route validates input with Zod
- Conventional Commits: `type(scope): description`
- Run `npm run lint` + `npx tsc --noEmit` before every commit
- If stuck >10 min or ambiguous, pause and ask