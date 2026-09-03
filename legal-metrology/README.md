# Legal Metrology Compliance Checker

A full-stack web app for the **Smart India Hackathon 2024** (Problem Statement 26034) that lets Legal Metrology department officers upload photos of packaged-commodity labels, extract the mandatory declarations with AI (vision), and automatically check them against the **Legal Metrology (Packaged Commodities) Rules, 2011**.

## Features

- **Upload & scan** packaged commodity labels (image/camera) → AI extracts declarations + font metrics.
- **Rule engine** — 12 machine-checkable rules (LM-01 … LM-12) with severity weighting.
- **Compliance report** — overall status (`compliant` / `partial` / `non_compliant`), score, violations, passed checks.
- **Dashboard** — stats, trend charts, violation breakdown.
- **Search** — filter scanned products across the department's database.
- **PDF report** — government-style downloadable compliance report.
- **Role-based auth** — `admin`, `officer`, `viewer` (invite-code signup).

## Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **UI:** shadcn-style components (Radix UI + cva)
- **AI/OCR:** Google Gemini 2.0 flash (vision extraction + font analysis)
- **Backend/DB:** Supabase (Postgres, Auth, Storage, RLS)
- **PDF:** jsPDF + autotable
- **Tests:** Vitest

## Getting Started

> The Supabase migrations and live API integration are **not applied yet** — the app is fully coded and builds/tests green, but DB calls require running the migration on your Supabase project (see Setup below).

### 1. Install

```bash
npm install
```

### 2. Environment

Copy `.env.example` to `.env.local` and fill in your credentials:

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
GEMINI_API_KEY=<your-gemini-api-key>
```

### 3. Supabase setup (deferred)

Run `supabase/migrations/001_initial_schema.sql` in the Supabase SQL editor. It creates the tables, RLS policies, storage buckets, and a `handle_new_user` trigger. It also seeds invite codes:

- `LMADMIN2025` → `admin`
- `LMOFFICER2025` → `officer`
- (no code) → `viewer`

### 4. Run

```bash
npm run dev        # http://localhost:3000
npm run build      # production build
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm test           # Vitest
```

## Project Layout

```
src/
  app/                     # App Router routes (pages + API handlers)
    (auth)/                # login, signup
    (protected)/           # dashboard, upload, search, reports, profile
    api/                   # analyze, validate, search, reports, dashboard/stats, health
  components/
    ui/                    # shadcn-style primitives
    features/              # upload, dashboard, reports, search
    layout/                # navbar, user nav
  lib/
    gemini/                # pipeline + schemas + prompts
    rules/                 # rule checks (LM-01..LM-12) + validator
    supabase/              # client / server / middleware
    pdf/                   # report generation
  types/                   # domain + DB types
supabase/migrations/       # SQL schema (not yet applied)
docs/legal-rules/          # rule reference + rules.json
```

## License

For SIH 2024 submission. All rule interpretations follow the Legal Metrology (Packaged Commodities) Rules, 2011 and are for reference/assistive purposes.