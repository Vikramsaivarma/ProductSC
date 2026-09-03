# Pitch Deck — 10 Slides

> Markdown export for Marp. Run: `npx @marp-team/marp-cli slides.md --pdf`

## 1 — Title
**Legal Metrology Compliance Checker**
AI-powered inspection of packaged commodities · SIH 2024 · Problem 26034 · Ministry of Consumer Affairs

## 2 — The Problem
Field officers manually inspect thousands of packaged-goods labels against the
Legal Metrology (Packaged Commodities) Rules, 2011. Slow, inconsistent,
paper-heavy, and easy for bad actors to slip through.

## 3 — The Idea
Upload a product photo → **Gemini Vision** extracts every mandatory declaration →
a **deterministic rule engine** checks all 12 LM rules → instant, **PDF-ready**
compliance report + dashboard for enforcement teams.

## 4 — How it works (3 calls)
1. Extraction — read all labels → structured JSON
2. Font analysis — Rule 9 mm-height checks from images
3. Suggestions — actionable fixes w/ rule references

## 5 — Deterministic compliance
12 rules mapped to LM Rules 2011, with severity scoring:
- critical −15, major −8, minor −3
- ≥85 compliant · 60–84 partial · <60 non-compliant

## 6 — Architecture
Next.js 14 + Supabase (Auth/DB/Storage/RLS) + Gemini 3.6 Flash + jsPDF + Recharts.
`src/app/api` serverless; offline dataset pipeline for bulk demo data.

## 7 — Roles & security
Admin / Officer / Viewer w/ invite codes. Supabase RLS scopes data per role.
Rate-limited endpoints (10/hr analyze, 20/hr pdf). Zod-validated inputs.

## 8 — The dataset
Real sample products ingested through `scripts/process-dataset.ts` — the
dashboard is backed by **actual scanned labels**, not mock data.

## 9 — Impact
Faster inspections, standardized audits, digital evidence trail, PDF export for
official records — a practical tool for Legal Metrology departments.

## 10 — CTA / Demo
Try it live. Upload a label → get an audited, PDF-ready compliance report in seconds.