import { CheckInput, CheckResult } from '../types';

export default function check(input: CheckInput): CheckResult {
  const d = input.structured_data;
  const cc = d?.consumer_care;
  const name = cc?.name;
  const phone = cc?.phone;
  const email = cc?.email;

  const hasName = !!name && String(name).trim().length > 0;
  const hasPhone = !!phone && String(phone).trim().length >= 10;
  const hasEmail = !!email && String(email).trim().includes('@');

  if (hasName && (hasPhone || hasEmail)) {
    const contact = hasPhone ? `Phone: ${phone}` : `Email: ${email}`;
    return {
      passed: true,
      rule_code: 'LM-06',
      field: 'consumer_care',
      actual: `${name}, ${contact}`,
      expected: 'Consumer care name with phone or email',
      suggestion: '',
    };
  }

  const missing: string[] = [];
  if (!hasName) missing.push('name');
  if (!hasPhone && !hasEmail) missing.push('phone or email');

  return {
    passed: false,
    rule_code: 'LM-06',
    field: `consumer_care.${missing.join(', ')}`,
    actual: hasName ? `Name: ${name}` : null,
    expected: 'Consumer care name and at least one of phone (>=10 digits) or email',
    suggestion: `Add consumer care ${missing.join(' and ')} details on the label as required under Rule 5(2) of the Packaged Commodities Rules, 2011.`,
  };
}
