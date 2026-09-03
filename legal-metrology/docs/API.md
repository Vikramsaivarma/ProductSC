# API Reference

All routes are Next.js App Router handlers under `src/app/api/`. Every
mutating/data route requires an authenticated Supabase session.

## POST /api/analyze
Analyze product images with the Gemini pipeline and produce a compliance report.

**Body**
```json
{ "productId": "<uuid>", "imageUrls": ["https://.../label.jpg"] }
```

**Responses**
| Status | Body |
|--------|------|
| 200 | `{ extractionId, reportId, structured, fontAnalysis, suggestions, score, status }` |
| 401 | `{ error: "Unauthorized" }` |
| 422 | `{ error: "validation_failed", details }` |
| 429 | `{ error: "rate_limited", retryAfter }` (10/hr per user) |
| 404 | `{ error: "Product not found" }` |
| 502 | `{ error: "AI extraction failed" }` |

## POST /api/validate
Run the rule engine against an extraction and create/refresh the report.

**Body**
```json
{ "structured_data": {}, "font_analysis": {}, "package_weight_bucket": "<=200", "category": "food" }
```

## GET /api/reports/[id]
`id` = **product id**. Returns `{ product, extraction, report }` (latest each).

## GET /api/reports/pdf/[id]
`id` = **product id**. Returns `application/pdf` stream. Rate-limited (20/hr).

## GET /api/dashboard/stats?from&to&category&status
Returns aggregated dashboard stats:
`{ totalScanned, complianceRate, criticalViolations, pendingReviews, scanTrend[], violationsByCategory[], topViolatedRules[], recentScans[] }`.

## GET /api/search?q&status&category
Returns `{ results, total }` of matching scanned products.

## GET /api/health
Returns `{ status: 'ok', version, timestamp, dbConnected }`.

## Auth callback
`GET /auth/callback` — exchanges the OAuth/magic-link code for a session.

## Validation & security
- All request bodies validated with Zod.
- Rate limits stored in the `rate_limits` table, enforced via `src/lib/rate-limit.ts`.
- RLS policies in the schema enforce per-role data access (officer sees own,
  admin sees all, viewer reads all).