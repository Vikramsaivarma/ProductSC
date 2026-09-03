import { CheckInput, CheckResult } from '../types';

const KEY_DECLARATIONS = [
  'manufacturer_name',
  'manufacturer_address',
  'common_or_generic_name',
  'net_quantity',
  'mrp',
  'mfg_date',
  'consumer_care',
  'country_of_origin',
  'best_before',
  'expiry_date',
  'batch_number',
  'lot_number',
];

export default function check(input: CheckInput): CheckResult {
  const d = input.structured_data;
  const visibleList: string[] = d?.declarations_visible_on_pdp ?? [];

  const visibleKeys = new Set(visibleList.map((v) => v.trim().toLowerCase()));

  const presentKeys = KEY_DECLARATIONS.filter((key) => visibleKeys.has(key.toLowerCase()));

  const count = presentKeys.length;

  if (count >= 5) {
    return {
      passed: true,
      rule_code: 'LM-12',
      field: 'declarations_visible_on_pdp',
      actual: `${count} declarations visible`,
      expected: 'At least 5 key declarations visible on product detail page',
      suggestion: '',
    };
  }

  const missing = KEY_DECLARATIONS.filter((key) => !presentKeys.includes(key)).slice(0, 5);

  return {
    passed: false,
    rule_code: 'LM-12',
    field: 'declarations_visible_on_pdp',
    actual: `${count} declaration(s) visible`,
    expected: 'At least 5 key declarations visible',
    suggestion: `Only ${count} of ${KEY_DECLARATIONS.length} key declarations are visible on the PDP. Add missing declarations such as: ${missing.join(', ')}. Ensure all required information is visible to consumers.`,
  };
}
