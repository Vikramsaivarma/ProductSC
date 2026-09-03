import { CheckInput, CheckResult } from '../types';

export default function check(input: CheckInput): CheckResult {
  const d = input.structured_data;
  const coo = d?.country_of_origin;
  const imported = d?.is_imported === true;

  if (!imported) {
    return {
      passed: true,
      rule_code: 'LM-07',
      field: 'country_of_origin',
      actual: 'Not imported — rule not applicable',
      expected: 'country_of_origin required only for imported products',
      suggestion: '',
    };
  }

  const present = !!coo && String(coo).trim().length > 0;

  if (present) {
    return {
      passed: true,
      rule_code: 'LM-07',
      field: 'country_of_origin',
      actual: String(coo),
      expected: 'Non-empty country_of_origin for imported product',
      suggestion: '',
    };
  }

  return {
    passed: false,
    rule_code: 'LM-07',
    field: 'country_of_origin',
    actual: null,
    expected: 'Country of origin for imported product',
    suggestion: 'Declare the country of origin for this imported product as required under Rule 5(1) of the Packaged Commodities Rules, 2011.',
  };
}
