import { CheckInput, CheckResult } from '../types';

export default function check(input: CheckInput): CheckResult {
  const d = input.structured_data;
  const mrp = d?.mrp;
  const price = mrp?.value;
  const inclusive = mrp?.inclusive_of_taxes_declared;

  const numericPrice = typeof price === 'number' ? price : parseFloat(String(price));

  if (!price || isNaN(numericPrice) || numericPrice <= 0) {
    return {
      passed: false,
      rule_code: 'LM-04',
      field: 'mrp.value',
      actual: price != null ? String(price) : null,
      expected: 'A positive MRP value greater than zero',
      suggestion: 'Declare the Maximum Retail Price (MRP) with a valid positive numeric value on the label.',
    };
  }

  if (inclusive !== true) {
    return {
      passed: false,
      rule_code: 'LM-04',
      field: 'mrp.inclusive_of_taxes_declared',
      actual: String(inclusive),
      expected: 'true (MRP inclusive of all taxes)',
      suggestion: 'MRP must be inclusive of all taxes. Ensure the label explicitly states that the declared MRP includes applicable taxes.',
    };
  }

  return {
    passed: true,
    rule_code: 'LM-04',
    field: 'mrp',
    actual: `₹${numericPrice} (inclusive of taxes)`,
    expected: 'Positive MRP with inclusive_of_taxes_declared = true',
    suggestion: '',
  };
}
