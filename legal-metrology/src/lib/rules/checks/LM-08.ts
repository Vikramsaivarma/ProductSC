import { CheckInput, CheckResult } from '../types';

const MIN_HEIGHTS: Record<string, number> = {
  '<=200': 1.0,
  '200-500': 2.0,
  '>500': 4.0,
};

export default function check(input: CheckInput): CheckResult {
  if (!input.font_analysis) {
    return {
      passed: true,
      rule_code: 'LM-08',
      field: 'font_analysis',
      actual: null,
      expected: 'Text measurement data for net_quantity field',
      suggestion: 'Font analysis was not available. Collect font measurement data for compliance verification.',
    };
  }

  const fa = input.font_analysis;
  const textMeasurements = fa?.text_measurements;
  const netQtyMeasurement = textMeasurements?.find((m) => m.field.toLowerCase().includes('net'));

  if (!netQtyMeasurement) {
    return {
      passed: false,
      rule_code: 'LM-08',
      field: 'font_analysis.text_measurements.net_quantity',
      actual: null,
      expected: 'Height measurement for net_quantity text',
      suggestion: 'Font analysis did not detect a net_quantity field measurement. Ensure the net quantity text is clearly visible.',
    };
  }

  const height = typeof netQtyMeasurement.estimated_height_mm === 'number'
    ? netQtyMeasurement.estimated_height_mm
    : parseFloat(String(netQtyMeasurement.estimated_height_mm));

  const tier = input.package_weight_bucket || '<=200';
  const minHeight = MIN_HEIGHTS[tier] ?? 1.0;

  if (isNaN(height)) {
    return {
      passed: false,
      rule_code: 'LM-08',
      field: 'font_analysis.text_measurements.net_quantity.height',
      actual: String(netQtyMeasurement.estimated_height_mm),
      expected: `Numeric height >= ${minHeight}mm for ${tier} package tier`,
      suggestion: 'The measured height value for net quantity text is not a valid number.',
    };
  }

  if (height < minHeight) {
    return {
      passed: false,
      rule_code: 'LM-08',
      field: 'font_analysis.text_measurements.net_quantity.height',
      actual: `${height}mm`,
      expected: `Minimum ${minHeight}mm for ${tier} package tier`,
      suggestion: `Net quantity font height (${height}mm) is below the minimum ${minHeight}mm required for "${tier}" tier packages. Increase font size for better legibility.`,
    };
  }

  return {
    passed: true,
    rule_code: 'LM-08',
    field: 'font_analysis.text_measurements.net_quantity.height',
    actual: `${height}mm`,
    expected: `Minimum ${minHeight}mm for ${tier} package tier`,
    suggestion: '',
  };
}
