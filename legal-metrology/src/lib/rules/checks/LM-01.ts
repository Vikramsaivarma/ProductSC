import { CheckInput, CheckResult } from '../types';

export default function check(input: CheckInput): CheckResult {
  const d = input.structured_data;
  const name = d?.manufacturer_name;
  const address = d?.manufacturer_address;
  const hasName = !!name && String(name).trim().length > 0;
  const hasAddress = !!address && String(address).trim().length > 0;

  if (hasName && hasAddress) {
    return {
      passed: true,
      rule_code: 'LM-01',
      field: 'manufacturer_name, manufacturer_address',
      actual: `Name: ${name}, Address: ${address}`,
      expected: 'Non-empty manufacturer_name and manufacturer_address',
      suggestion: '',
    };
  }

  const missing = [];
  if (!hasName) missing.push('manufacturer_name');
  if (!hasAddress) missing.push('manufacturer_address');

  return {
    passed: false,
    rule_code: 'LM-01',
    field: missing.join(', '),
    actual: hasName && !hasAddress ? `Name: ${name}` : !hasName && hasAddress ? `Address: ${address}` : null,
    expected: 'Both manufacturer_name and manufacturer_address must be present',
    suggestion: `Add the missing ${missing.join(' and ')} on the product label as required under the Legal Metrology Act, 2009 and Packaged Commodities Rules, 2011.`,
  };
}
