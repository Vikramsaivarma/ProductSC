# SMOKE_TEST.md — End-to-end checklist

Run through after deploy and after any significant schema/model change.

## Prerequisites
- [ ] Supabase schema applied (`001_initial_schema.sql` + `seed.sql`)
- [ ] `.env.local` populated (see `.env.example`)
- [ ] `GEMINI_API_KEY` references a working model (`gemini-3.6-flash`)

## Health
- [ ] `GET /api/health` → `{ status: 'ok', dbConnected: true }`

## Auth
- [ ] Sign up with `LMOFFICER2025` → redirected to `/dashboard`
- [ ] Sign up with `LMADMIN2025` → admin role applied
- [ ] Sign up with no code → viewer role
- [ ] Log out; unauthenticated access to `/dashboard` redirects to `/login`

## Upload → Report
- [ ] Officer uploads 2–3 label images (JPG/PNG)
- [ ] Redirected to a generated report
- [ ] Report shows score gauge, declarations table, font analysis chart
- [ ] Violations show rule code + suggestion

## Data / API
- [ ] `POST /api/analyze` returns 200 with `extractionId`, `reportId`
- [ ] `POST /api/analyze` returns 429 after 10 requests/hour (same user)
- [ ] Bad body → 422 `validation_failed`
- [ ] `GET /api/reports/pdf/[id]` returns `application/pdf` (20/hr rate limit)

## Dashboard + Search
- [ ] Statistics load (totalScanned, complianceRate, criticalViolations)
- [ ] Charts render from real dataset rows
- [ ] Search by product name/brand returns results

## Dataset ingestion
- [ ] `DATASET_USER_ID` set to an existing profile id
- [ ] `npm run process-dataset -- --data <dir>` processes without failures
- [ ] Products have `source='dataset_import'`, extractions + reports created
- [ ] `data/failures.jsonl` empty after successful run

## Bugs fixed in this iteration
- `gemini-2.0-flash-exp` 404 → migrated to `gemini-3.6-flash`
- `audit_log.user_id` nil-UUID FK error → omit when no user