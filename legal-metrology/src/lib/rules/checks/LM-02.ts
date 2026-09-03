import { CheckInput, CheckResult } from '../types';

export default function check(input: CheckInput): CheckResult {
  const d = input.structured_data;
  const name = d?.common_or_generic_name;
  const present = !!name && String(name).trim().length > 0;

  if (present) {
    return {
      passed: true,
      rule_code: 'LM-02',
      field: 'common_or_generic_name',
      actual: String(name),
      expected: 'Non-empty common_or_generic_name',
      suggestion: '',
    };
  }

  return {
    passed: false,
    rule_code: 'LM-02',
    field: 'common_or_generic_name',
    actual: null,
    expected: 'A common or generic name describing the nature of the product',
    suggestion: 'Declare the common or generic name of the commodity on the label as required under Rule 5(1) of the Packaged Commodities Rules, 2011.',
  };
}
