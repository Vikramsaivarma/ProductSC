import { CheckInput, CheckResult } from '../types';

const MRP_TAMPERING_INDICATORS = [
  'mrp_overprint',
  'mrp_altered',
  'mrp_tampered',
  'mrp_scratched',
  'mrp_obscured',
  'price_overprint',
  'price_altered',
  'erased_mrp',
];

export default function check(input: CheckInput): CheckResult {
  const d = input.structured_data;
  const elements: string[] = d?.suspicious_elements ?? [];

  const found = elements.filter((e) =>
    MRP_TAMPERING_INDICATORS.some((indicator) =>
      e.toLowerCase().includes(indicator.toLowerCase())
    )
  );

  if (found.length === 0) {
    return {
      passed: true,
      rule_code: 'LM-09',
      field: 'suspicious_elements',
      actual: null,
      expected: 'No MRP-related tampering indicators',
      suggestion: '',
    };
  }

  return {
    passed: false,
    rule_code: 'LM-09',
    field: 'suspicious_elements',
    actual: found.join(', '),
    expected: 'No suspicious elements indicating MRP tampering',
    suggestion: `Detected MRP-related tampering indicators: [${found.join(', ')}]. The product label may have been altered. Verify that MRP is genuinely printed and not overprinted, scratched, or obscured.`,
  };
}
