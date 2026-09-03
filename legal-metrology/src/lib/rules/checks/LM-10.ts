import { CheckInput, CheckResult } from '../types';

export default function check(input: CheckInput): CheckResult {
  const d = input.structured_data;
  const category = input.category?.toLowerCase() || '';
  const isFood = category.includes('food') || category.includes('beverage') || category.includes('edible');

  const qty = d?.net_quantity;
  const rawValue = qty?.value;
  const numericValue = typeof rawValue === 'number' ? rawValue : parseFloat(String(rawValue));

  if (!isFood || isNaN(numericValue) || numericValue <= 100) {
    return {
      passed: true,
      rule_code: 'LM-10',
      field: 'unit_sale_price',
      actual: isFood && numericValue > 100 ? null : `Category="${input.category}", net_qty=${numericValue}`,
      expected: 'unit_sale_price required only for food products with net_quantity > 100',
      suggestion: '',
    };
  }

  const usp = d?.unit_sale_price;
  const hasUnitPrice = !!usp && String(usp).trim().length > 0;

  if (hasUnitPrice) {
    return {
      passed: true,
      rule_code: 'LM-10',
      field: 'unit_sale_price',
      actual: String(usp),
      expected: 'Present unit_sale_price for food product with net_quantity > 100',
      suggestion: '',
    };
  }

  return {
    passed: false,
    rule_code: 'LM-10',
    field: 'unit_sale_price',
    actual: null,
    expected: 'Unit sale price declaration',
    suggestion: 'For food products with net quantity > 100 (g/ml), declare the unit sale price (price per unit of weight or volume) as per the Legal Metrology (Packaged Commodities) Rules.',
  };
}
