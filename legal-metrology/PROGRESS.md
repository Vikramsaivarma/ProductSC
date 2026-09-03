# Legal Metrology Compliance Checker — Progress & Handoff

State last updated during autonomous overnight session. This doc lets a fresh session (or teammate) pick up exactly where the project stands.

## Status: ALPHA — all code written, builds/tests green, DB integration pending

- Build: `npm run build` ✅ passes
- Lint: `npm run lint` ✅ passes
- Typecheck: `npx tsc --noEmit` ✅ passes
- Tests: `npm test` ✅ 7/7 pass (`validator.test.ts`)
- Credentials are in `.env.local` (gitignored — never commit)
- Supabase migrations created but **NOT applied** to the project

---

## 1. What is this?

Full-stack SIH 2024 (PS 26034) app. Officers upload packaged-commodity label photos; Gemini vision extracts the mandatory declarations and font metrics; a rule engine (12 checks LM-01..LM-12) validates against the Legal Metrology (Packaged Commodities) Rules 2011; results show on a dashboard + downloadable PDF report.

**Stack:** Next.js 14 App Router + TS + Tailwind, shadcn-style UI, Supabase (Auth/DB/Storage), Gemini 2.0 flash, jsPDF, Vitest.

## 2. Directory layout

See `README.md` for the full map. Key entry points:

- `src/app/api/analyze/route.ts` — POST handler: Gemini pipeline → rule validator → Supabase inserts (extraction + report).
- `src/lib/gemini/pipeline.ts` — extraction + font analysis + suggestions with retry/backoff, 55s timeout.
- `src/lib/rules/validator.ts` — orchestrates LM-01..LM-12, computes score + status.
- `src/lib/rules/checks/LM-*.ts` — one file per rule check.
- `supabase/migrations/001_initial_schema.sql` — full schema (tables, RLS, buckets, trigger, invite codes).
- `src/lib/pdf/generateReport.ts` — jsPDF government-style report.

## 3. Branches (local)

Repo root has feature branches (all with only a README so far). The app currently lives in the `legal-metrology/` subfolder on `main`. Branch plan to flesh out per the earlier git discipline:

- `backend/ai-vision-api`
- `frontend/dashboard-ui`
- `frontend/scanner-ui`
- `frontend/pdf-reports`
- `docs/legal-rules`
- `infra/db-types-and-setup`

## 4. What works

- Auth UI (email/password, magic link) + role-based route guards + invite-code role mapping.
- Upload flow: dropzone + camera → Supabase storage → product insert → `/api/analyze` → redirect to report.
- Gemini extraction pipeline + font analysis with typed Zod/schema validation.
- 12 rule checks LM-01..LM-12 + validator scoring.
- Dashboard (stat cards, pie chart, charts, recent scans), search with filters, report viewer + PDF.
- 7 Vitest cases covering the validator (compliant fixture, missing manufacturer, bad net qty, MRP inclusive-of-tax, imported country-of-origin, multi-failure non-compliant, score clamping).

## 5. What's LEFT (for later dev)

### A. Apply Supabase setup (highest priority)
1. Run `supabase/migrations/001_initial_schema.sql` in the Supabase SQL editor.
2. Confirm the `handle_new_user` trigger maps invite codes → roles; else handle role via `user_metadata` in the app (signup already sets `data.role`).
3. Create the storage bucket(s) referenced by the migration and used by `ProductUploader.tsx`.
4. Regenerate DB types: `npm run generate-types` (writes `src/types/database.ts`).

### B. Live API smoke test
1. `npm run dev`, sign up with `LMADMIN2025`, upload a real label photo, confirm a report is produced end-to-end.
2. Verify Gemini returns `structured` (the analyze route returns 502 if extraction is null).
3. Exercise the PDF endpoint `GET /api/reports/pdf/:id`.
4. Confirm dashboard/search server reads against a populated `compliance_reports` table.

### C. Hardening / polish (optional)
- The PDF endpoint is currently a stub — implement full generation from a stored report.
- The 6th spec test set is done; can expand with per-rule unit tests.
- Consider OCR of `8_1732871406 (1).pdf` (83 scanned pages) to cross-check the rule text; Gemini can read scanned pages directly so OCR may be unnecessary.

### D. Deployment
- `vercel.json` already sets timeouts (60s analyze, 30s pdf). Free-tier Vercel + Supabase free + Gemini free is the target.
- Set the 4 env vars in Vercel. Migrations still need to run against the production Supabase project.

## 6. Known notes / gotchas

- `.env.local` holds the live Supabase URL/anon/service-role and Gemini key. **Never commit.** Root `.gitignore` and `legal-metrology/.gitignore` both exclude it.
- The rule checks assume `StructuredData`/`FontAnalysisData` shapes defined in `src/lib/rules/types.ts` — keep the Gemini Zod schemas (`src/lib/gemini/schemas.ts`) in sync with those types.
- The two "Dynamic server usage ... cookies" logs during `next build` are **expected** (dashboard + search routes are dynamic); they do not fail the build.