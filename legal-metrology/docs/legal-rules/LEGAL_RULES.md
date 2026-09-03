# Legal Metrology (Packaged Commodities) Rules, 2011

Source: Legal Metrology (Packaged Commodities) Rules, 2011 under the Legal Metrology Act, 2009
Applicable to: All pre-packaged commodities sold in India

## Mandatory Declarations on Principal Display Panel (PDP)

Every pre-packaged commodity shall bear the following declarations on the principal display panel:

### Rule 6(1)(a) — Manufacturer/Packer/Importer Name & Address
- **Requirement:** Name and complete address of the manufacturer, or packer, or importer shall be declared.
- **Detection:** Look for "Manufactured by", "Packed by", "Imported by", "Marketed by" followed by name and address.
- **Scoring:** Critical violation if completely missing. Major if present but incomplete (missing city/state/pin).

### Rule 6(1)(b) — Common/Generic Name of Commodity
- **Requirement:** Common or generic name of the commodity shall be declared.
- **Detection:** Look for product category name (e.g., "Biscuits", "Shampoo", "Soap", "Chips").
- **Scoring:** Major violation if missing.

### Rule 6(1)(c) — Month & Year of Manufacture/Packing/Import
- **Requirement:** Month and year of manufacture or packing or import shall be declared.
- **Detection:** Look for "Mfg Date", "Manufactured on", "Packed on", "MFD", "MFG" followed by month/year.
- **Scoring:** Critical violation if missing.

### Rule 6(1)(d) — Consumer Care Details
- **Requirement:** Name and address of the person to whom complaints may be communicated, including phone number or email.
- **Detection:** Look for "Consumer Care", "Customer Care", "Contact", "Helpline" with phone/email/address.
- **Scoring:** Major violation if missing. Minor if phone/email is missing but name is present.

### Rule 6(1)(e) — Maximum Retail Price (MRP)
- **Requirement:** Maximum Retail Price (MRP) in rupees, including the words "inclusive of all taxes".
- **Detection:** Look for "MRP", "Maximum Retail Price", "Rs.", "₹" followed by amount, and "inclusive of all taxes".
- **Scoring:** Critical if MRP missing entirely. Critical if "inclusive of all taxes" phrase is missing.

### Rule 5 — Principal Display Panel Requirements
- **Requirement:** Mandatory declarations must appear on the Principal Display Panel (the panel visible at the point of sale).
- **Detection:** Check if key declarations are grouped on the same face of the package.
- **Scoring:** Minor violation if declarations are scattered across panels.

### Rule 8 — Net Quantity Declaration
- **Requirement:** Net quantity in terms of weight (g/kg), volume (ml/L), or number/count, in standard SI units.
- **Detection:** Look for weight/volume indicators like "500g", "250ml", "1L", "10 pcs".
- **Scoring:** Critical violation if missing. Major if using non-standard units.

### Rule 9 — Font Size for Net Quantity
- **Requirement:** The height of numerals and letters used for net quantity declaration must meet minimum standards:
  - Packages ≤ 200 g/ml: minimum 1mm font height
  - Packages 200-500 g/ml: minimum 2mm font height
  - Packages > 500 g/ml: minimum 4mm font height
- **Detection:** Estimate character height from OCR bounding boxes relative to image DPI and known reference objects.
- **Scoring:** Major violation if font size is below minimum.

### Rule 6(3) — MRP Integrity
- **Requirement:** MRP shall not be overprinted, overwritten, or covered by a sticker. It should be clearly legible and permanent.
- **Detection:** Look for signs of tampering: sticker over MRP, overwriting, different ink/color on MRP area.
- **Scoring:** Critical violation if MRP appears tampered.

### Rule 6(10) — Country of Origin (Imported Goods)
- **Requirement:** For imported goods, country of origin must be declared.
- **Detection:** Look for "Country of Origin", "Made in", "Product of".
- **Scoring:** Critical violation for imported goods if missing. N/A for domestically manufactured goods.

### Rule 6 — Unit Sale Price (Food Items > 100g)
- **Requirement:** For food commodities with net quantity exceeding 100g/ml, unit sale price per unit weight/volume shall be declared.
- **Detection:** Look for "Unit Price", "Rs./kg", "Rs./100g", "MRP per unit".
- **Scoring:** Major violation if missing for applicable products.

### Rule 6 — No Misleading Terms
- **Requirement:** No misleading terms or claims that deceive the consumer about quantity, quality, or nature of the product.
- **Detection:** Look for ambiguous terms like " FAMILY PACK", "JUMBO", "VALUE PACK" without clear quantity indication. Look for terms like "100%", "Pure", "Natural" without qualifiers.
- **Scoring:** Minor violation.

## Compliance Scoring

Start with **100 points**:
- Critical violation: **-15 points**
- Major violation: **-8 points**
- Minor violation: **-3 points**

### Status Thresholds
| Score | Status |
|-------|--------|
| ≥ 85 | Compliant |
| 60-84 | Partial |
| < 60 | Non-Compliant |

## Package Weight Tiers (for Rule 9 font size)

| Tier | Weight/Volume | Min Font Height |
|------|---------------|-----------------|
| Small | ≤ 200 g/ml | 1 mm |
| Medium | 200-500 g/ml | 2 mm |
| Large | > 500 g/ml | 4 mm |
