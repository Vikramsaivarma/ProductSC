# RULES_MAPPING — LM-01..LM-12 → Legal Metrology (Packaged Commodities) Rules, 2011

Each check maps to a rule from the **Legal Metrology (Packaged Commodities) Rules,
2011**, registered in `rules` (see `supabase/seed.sql`).

| Code | Title | Legal Reference | Severity | Scoring penalty |
|------|-------|-----------------|----------|-----------------|
| LM-01 | Manufacturer name & complete address | Rule 6(1)(a) | critical | -15 |
| LM-02 | Common / generic name of commodity | Rule 6(1)(b) | major | -8 |
| LM-03 | Net quantity in standard SI units (g/kg/ml/L/cm/m/piece) | Rule 8 | critical | -15 |
| LM-04 | MRP with ₹/Rs. + *"inclusive of all taxes"* | Rule 6(1)(e) | critical | -15 |
| LM-05 | Month & year of manufacture / pack / import | Rule 6(1)(c) | critical | -15 |
| LM-06 | Consumer care (name + phone or email) | Rule 6(1)(d) | major | -8 |
| LM-07 | Country of origin (imported goods) | Rule 6(10) | critical | -15 |
| LM-08 | Font size per package tier | Rule 9 | major | -8 |
| LM-09 | MRP integrity (no overwrite / sticker) | Rule 6(3) | critical | -15 |
| LM-10 | Unit sale price (food, net qty > 100g/ml) | Rule 6 | major | -8 |
| LM-11 | No misleading terms without qualifiers | Rule 6 | minor | -3 |
| LM-12 | Declarations on Principal Display Panel (PDP) | Rule 5 | minor | -3 |

## Rule 9 font-size tiers (LM-08)

| Package weight bucket | Minimum text height |
|-----------------------|---------------------|
| `<=200` g/ml | 1 mm |
| `200-500` g/ml | 2 mm |
| `>500` g/ml | 4 mm |

## Scoring

Start **100**. Subtract `15` per critical, `8` per major, `3` per minor.

| Score | Status |
|-------|--------|
| >= 85 | compliant |
| 60–84 | partial |
| < 60  | non_compliant |

## Source files

- Checks: `src/lib/rules/checks/LM-01.ts` … `LM-12.ts`
- Engine: `src/lib/rules/validator.ts`
- Types: `src/lib/rules/types.ts`
- Tests: `src/lib/rules/__tests__/validator.test.ts`
- DB reference rows: `supabase/seed.sql`