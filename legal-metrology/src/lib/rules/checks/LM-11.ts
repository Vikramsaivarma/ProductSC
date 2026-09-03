import { CheckInput, CheckResult } from '../types';

const MISLEADING_TERMS = [
  'guaranteed',
  'cures',
  'treatment',
  'scientifically proven',
  '100% natural',
  'chemical free',
  'no side effects',
  'fda approved',
  'clinically tested',
  'miracle',
];

export default function check(input: CheckInput): CheckResult {
  const d = input.structured_data;
  const elements: string[] = d?.suspicious_elements ?? [];

  const found = elements.filter((e) =>
    MISLEADING_TERMS.some((term) =>
      e.toLowerCase().includes(term.toLowerCase())
    )
  );

  if (found.length === 0) {
    return {
      passed: true,
      rule_code: 'LM-11',
      field: 'suspicious_elements',
      actual: null,
      expected: 'No misleading terms detected',
      suggestion: '',
    };
  }

  return {
    passed: false,
    rule_code: 'LM-11',
    field: 'suspicious_elements',
    actual: found.join(', '),
    expected: 'No misleading terms or claims on the label',
    suggestion: `Detected potentially misleading terms: [${found.join(', ')}]. Review the label for claims that may mislead consumers about the product's properties, efficacy, or regulatory status.`,
  };
}
