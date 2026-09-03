import { CheckInput, CheckResult } from '../types';

const VALID_UNITS = ['g', 'kg', 'ml', 'l', 'oz', 'lb', 'tonne', 'gm', 'kgs', 'ltr', 'mltr'];

export default function check(input: CheckInput): CheckResult {
  const d = input.structured_data;
  const qty = d?.net_quantity;
  const rawValue = qty?.value;
  const unit = qty?.unit;

  const numericValue = typeof rawValue === 'number' ? rawValue : parseFloat(String(rawValue));

  if (!rawValue || isNaN(numericValue) || numericValue <= 0) {
    return {
      passed: false,
      rule_code: 'LM-03',
      field: 'net_quantity',
      actual: rawValue != null ? String(rawValue) : null,
      expected: 'A positive numeric net quantity value',
      suggestion: 'Declare the net quantity of the commodity with a valid positive number on the label.',
    };
  }

  if (!unit || typeof unit !== 'string') {
    return {
      passed: false,
      rule_code: 'LM-03',
      field: 'net_quantity.unit',
      actual: null,
      expected: `One of: ${VALID_UNITS.join(', ')}`,
      suggestion: 'Specify a valid unit of measurement (e.g., g, kg, ml, l) alongside the net quantity value.',
    };
  }

  const normalizedUnit = unit.toLowerCase().trim();
  if (!VALID_UNITS.includes(normalizedUnit)) {
    return {
      passed: false,
      rule_code: 'LM-03',
      field: 'net_quantity.unit',
      actual: unit,
      expected: `One of: ${VALID_UNITS.join(', ')}`,
      suggestion: `Replace "${unit}" with a recognized unit of measurement for net quantity declaration.`,
    };
  }

  return {
    passed: true,
    rule_code: 'LM-03',
    field: 'net_quantity',
    actual: `${numericValue} ${unit}`,
    expected: 'Positive net_quantity with valid unit',
    suggestion: '',
  };
}
