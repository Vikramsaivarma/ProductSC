# Architecture — Legal Metrology Compliance Checker

SIH 2024 · Problem 26034 · Ministry of Consumer Affairs

## High-level flow

```
┌──────────────┐   upload images    ┌──────────────────────────┐
│   Officer     │ ────────────────▶ │  /app/(protected)/upload  │
│  (browser)    │                   └────────────┬─────────────┘
└──────────────┘                                │ compress + store
                                                ▼
                                     supabase storage 'product-images'
                                                │ imageUrls
                                                ▼
┌───────────────────────────────  /api/analyze  ───────────────────────────────┐
│ 1. auth + Zod + rate limit (10/hr)                                           │
│ 2. runAnalysisPipeline                                                       │
│    • Call 1. gemini-3.6-flash → StructuredDeclarations (JSON schema)         │
│    • Call 2. gemini-3.6-flash → FontAnalysis (parallel w/ Call 1)            │
│    • Call 3. gemini-3.6-flash → Suggestions (if violations found)            │
│ 3. insert extraction                                                         │
│ 4. validateExtraction (rule engine, 12 checks)                               │
│ 5. insert compliance_report                                                  │
└──────────────────────────────────────────────────────────────────────────────┘
                                                │
          ┌──────────────┬─────────────────────┼────────────────────┬─────────────┐
          ▼              ▼                     ▼                    ▼             ▼
  /reports/[id]   /reports/pdf/[id]   /dashboard/stats      /search       /profile
   viewer + PDF    jsPDF stream        charts + KPIs       full-text      auth
```

## Serverless layout (Next.js 14 App Router, `src/app`)

- **API routes** under `src/app/api/**/route.ts`: `analyze`, `validate`,
  `reports/[id]`, `reports/pdf/[id]`, `dashboard/stats`, `search`, `health`,
  `auth/callback`.
- **Auth**: Supabase SSR via `src/lib/supabase/{server,client}.ts`; `middleware.ts`
  guards `/dashboard`, `/upload`, `/reports`, `/search`, `/profile`.
- **Roles**: `admin` (see/review all), `officer` (uploads + own), `viewer` (read-only).
  Invite codes `LMOFFICER2025` / `LMADMIN2025` via `handle_new_user` trigger.

## Gemini pipeline

`src/lib/gemini/pipeline.ts` — the three calls, orchestrated:
- Call 1 + Call 2 run in **parallel** (`Promise.all`), each with retry
  (exponential backoff, max 3) and a **55s total** `AbortController` budget.
- Call 1 failures are fatal; Call 2/3 failures degrade gracefully
  (`fontAnalysis: null` skips LM-08; empty suggestions).
- Structured output via `responseMimeType: "application/json"` + a Zod-derived
  `responseSchema` in `src/lib/gemini/schemas.ts`.
- Usage (tokens) recorded to `audit_log` via `src/lib/gemini/usage.ts`.

## Rule engine

`src/lib/rules/` — `checks/LM-01..LM-12.ts` plus `validator.ts`:
- Score starts at 100; subtract **15** per critical, **8** per major, **3** per minor.
- Status: `>=85` compliant, `60–84` partial, `<60` non_compliant.
- `validateExtraction(...)` returns `{ status, score, violations, passed_checks }`.

## Offline dataset pipeline

`scripts/process-dataset.ts` reads `data/<brand>/<product>/` (or flat),
uploads images, inserts `products(source='dataset_import')`, runs the Gemini
pipeline + rule engine, and writes `extractions` + `compliance_reports`.
Idempotent, resumable (`.processed.json`), Gemini-rate-limit aware, failures
logged to `data/failures.jsonl`.

## Data stores

- **Supabase Postgres**: `profiles`, `products`, `extractions`,
  `compliance_reports`, `rules`, `audit_log`, `rate_limits` (RLS enforced).
- **Supabase Storage**: `product-images` (public read, auth write),
  `reports` (auth only).
- **Schema**: see `supabase/migrations/001_initial_schema.sql` + `supabase/seed.sql`.

## Deployment

Next.js on Vercel (see `docs/DEPLOY.md`). Timeouts tuned in `vercel.json`
(60s analyze, 30s pdf). Env vars in `.env.example`. Batched DB apply via
`npm run schema-apply` (reads `DATABASE_URL`).