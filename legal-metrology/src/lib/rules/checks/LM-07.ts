import { CheckInput, CheckResult } from '../types';

export default function check(input: CheckInput): CheckResult {
  const d = input.structured_data;
  const coo = d?.country_of_origin;
  const isImported = d?.is_imported === true;

  if (isImported && (coo === null || coo === undefined || String(coo).trim().length === 0)) {
    return {
      passed: false,
      rule_code: 'LM-07',
      field: 'country_of_origin',
      actual: null,
      expected: 'Country of origin required for imported product (Rule 6(10))',
      suggestion: 'Declare the country of origin for this imported product as required under Rule 6(10) of the Legal Metrology (Packaged Commodities) Rules, 2011.',
    };
  }

  if (!isImported && (coo === null || coo === undefined)) {
    return {
      passed: true,
      rule_code: 'LM-07',
      field: 'country_of_origin',
      actual: 'Not declared — assumed domestic',
      expected: 'Country of origin required for imported products (Rule 6(10))',
      suggestion: '',
    };
  }

  if (String(coo).trim().length === 0) {
    return {
      passed: false,
      rule_code: 'LM-07',
      field: 'country_of_origin',
      actual: 'Empty',
      expected: 'Country of origin declaration required (Rule 6(10))',
      suggestion: 'Declare the country of origin on the package.',
    };
  }

  return {
    passed: true,
    rule_code: 'LM-07',
    field: 'country_of_origin',
    actual: String(coo),
    expected: 'Country of origin declared',
    suggestion: '',
  };
}
