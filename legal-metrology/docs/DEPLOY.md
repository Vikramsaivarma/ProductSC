# Deploy — Legal Metrology Compliance Checker

Target: **Vercel** (frontend/app) + **Supabase** (DB/Auth/Storage) on free tiers.

## Prerequisites

1. A **Vercel** account connected to GitHub.
2. A **Supabase** project (free tier).
3. A **Google Gemini API key** (free tier; enable the Generative Language API).

## 1. Supabase — apply schema (one-time)

Run these in the Supabase **SQL Editor** (Dashboard → SQL → New query):

1. `supabase/migrations/001_initial_schema.sql` — creates `profiles`,
   `products`, `extractions`, `compliance_reports`, `rules`, `audit_log`,
   `rate_limits`, storage buckets, RLS policies, and the `handle_new_user`
   trigger.
2. `supabase/seed.sql` — inserts the 12 LM rule reference rows (LM-01..LM-12).

> The schema must be applied before authentication, uploads, or the dataset
> processor will work.

## 2. Environment variables

Set the following in both **.env.local** (local dev) and **Vercel** (Project →
Settings → Environment Variables):

| Variable | Example / where to find |
|----------|-------------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API (anon/public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API (service_role — keep secret) |
| `GEMINI_API_KEY` | Google AI Studio → API key |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |

## 3. Deploy to Vercel

1. Push this branch to GitHub (`main`).
2. In Vercel, **Add New → Project** → import the GitHub repo.
3. Set the 5 environment variables above.
4. **Root Directory:** if the app lives in `legal-metrology/`, set the project
   root directory to `legal-metrology` (FrameWork preset: Next.js).
5. **Deploy.** Next.js is auto-detected.

Timeouts are already set in `vercel.json` (60s analyze, 30s pdf, 15s default).

## 4. Post-deploy verification

- [ ] `GET /api/health` returns `{ status: 'ok', dbConnected: true }`.
- [ ] Sign up with `LMOFFICER2025` → redirected to Dashboard.
- [ ] Sign up with `LMADMIN2025` → admin role applied.
- [ ] Upload a label image → report generated → PDF downloads.

## 5. Populate demo data (optional)

See `data/README.md`. After the dataset exists locally:

```bash
DATASET_USER_ID=<a-profile-id> npm run process-dataset
```

## Troubleshooting

- **"Report not found" on upload** — the schema likely isn't applied; re-run
  the two SQL files.
- **401 on API calls** — `NEXT_PUBLIC_SUPABASE_ANON_KEY` / URL mismatched, or
  auth session expired.
- **Build fails on Vercel** — ensure root directory points at `legal-metrology`
  and the lockfile (`package-lock.json`) is committed.
- **Analytics show no data** — the `compliance_reports` table is empty until
  uploads/dataset processing happen.