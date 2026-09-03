import { describe, it, expect } from 'vitest';
import { validateExtraction } from '@/lib/rules/validator';
import type { CheckInput, StructuredData } from '@/lib/rules/types';

function baseInput(overrides: Partial<StructuredData> = {}): CheckInput {
  const base: StructuredData = {
    manufacturer_name: 'Acme Foods Pvt Ltd',
    manufacturer_address: 'Plot 12, MIDC, Pune, Maharashtra',
    packer_name: null,
    importer_name_address: null,
    common_or_generic_name: 'Biscuits',
    net_quantity: { value: 250, unit: 'g' },
    mrp: { value: 49, currency: 'INR', inclusive_of_taxes_declared: true, raw_string: 'MRP Rs. 49/- (incl. of all taxes)' },
    mfg_date: { month: 6, year: 2025, raw: 'MFG: JUN 2025' },
    expiry_or_best_before: 'Best before 9 months from MFG',
    consumer_care: { name: 'Acme Foods', phone: '1800-123-4567', email: 'care@acme.test', address: 'Pune' },
    country_of_origin: null,
    is_imported: false,
    unit_sale_price: 'Rs. 19.60 / 100g',
    batch_number: 'B250617-A',
    fssai_number: '12345678901234',
    declarations_visible_on_pdp: [
      'manufacturer_name',
      'manufacturer_address',
      'common_or_generic_name',
      'net_quantity',
      'mrp',
      'mfg_date',
      'consumer_care',
      'best_before',
      'batch_number',
    ],
    suspicious_elements: [],
    confidence: 0.92,
    ...overrides,
  };

  return {
    structured_data: base,
    font_analysis: {
      text_measurements: [
        { field: 'net_quantity', estimated_height_mm: 2.5, confidence: 0.9, meets_requirement: true },
      ],
      contrast_assessment: 'good',
      readability_score: 0.88,
      notes: '',
    },
    package_weight_bucket: 'large',
    category: 'food',
  };
}

describe('validateExtraction', () => {
  it('returns compliant for a fully valid label', () => {
    const result = validateExtraction(baseInput({ is_imported: false, country_of_origin: null }));
    expect(result.overall_status).toBe('compliant');
    expect(result.compliance_score).toBeGreaterThanOrEqual(85);
    expect(result.violations).toHaveLength(0);
    expect(result.passed_checks.length).toBeGreaterThanOrEqual(10);
  });

  it('flags a missing manufacturer as a critical violation', () => {
    const result = validateExtraction(
      baseInput({ manufacturer_name: null, manufacturer_address: '' }),
    );
    const lm01 = result.violations.find((v) => v.rule_code === 'LM-01');
    expect(lm01).toBeDefined();
    expect(lm01?.severity).toBe('critical');
    expect(result.passed_checks.some((p) => p.rule_code === 'LM-01')).toBe(false);
  });

  it('rejects an invalid or absent net quantity', () => {
    const missing = validateExtraction(baseInput({ net_quantity: null }));
    expect(missing.violations.map((v) => v.rule_code)).toContain('LM-03');

    const zero = validateExtraction(baseInput({ net_quantity: { value: 0, unit: 'g' } }));
    expect(zero.violations.map((v) => v.rule_code)).toContain('LM-03');

    const badUnit = validateExtraction(baseInput({ net_quantity: { value: 100, unit: 'boxes' } }));
    expect(badUnit.violations.map((v) => v.rule_code)).toContain('LM-03');
  });

  it('requires MRP to be inclusive of taxes', () => {
    const result = validateExtraction(
      baseInput({ mrp: { value: 49, currency: 'INR', inclusive_of_taxes_declared: false, raw_string: 'MRP Rs.49' } }),
    );
    const lm04 = result.violations.find((v) => v.rule_code === 'LM-04');
    expect(lm04).toBeDefined();
    expect(lm04?.field).toBe('mrp.inclusive_of_taxes_declared');
  });

  it('flags an imported product without country of origin as a critical violation', () => {
    const result = validateExtraction(baseInput({ is_imported: true, country_of_origin: null }));
    const lm07 = result.violations.find((v) => v.rule_code === 'LM-07');
    expect(lm07).toBeDefined();
    expect(lm07?.severity).toBe('critical');
    expect(lm07?.suggestion.toLowerCase()).toContain('country of origin');
    expect(result.overall_status).toBe('compliant');
  });

  it('produces a non-compliant status when multiple critical checks fail', () => {
    const result = validateExtraction(
      baseInput({
        manufacturer_name: null,
        manufacturer_address: '',
        net_quantity: null,
        mrp: null,
        mfg_date: null,
        is_imported: true,
        country_of_origin: '',
        declarations_visible_on_pdp: [],
      }),
    );
    expect(result.overall_status).toBe('non_compliant');
    expect(result.compliance_score).toBeLessThan(60);
    for (const code of ['LM-01', 'LM-03', 'LM-04', 'LM-05', 'LM-07']) {
      expect(result.violations.map((v) => v.rule_code)).toContain(code);
    }
  });

  it('clamps the compliance score at zero when penalties exceed the base', () => {
    const result = validateExtraction(
      baseInput({
        manufacturer_name: null,
        manufacturer_address: '',
        common_or_generic_name: '',
        net_quantity: null,
        mrp: null,
        mfg_date: null,
        expiry_or_best_before: '',
        consumer_care: null,
        is_imported: true,
        unit_sale_price: null,
        country_of_origin: '',
        declarations_visible_on_pdp: [],
      }),
    );
    expect(result.compliance_score).toBeGreaterThanOrEqual(0);
    expect(result.overall_status).toBe('non_compliant');
  });
});