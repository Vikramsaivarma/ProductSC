import { CheckInput, CheckResult } from '../types';

export default function check(input: CheckInput): CheckResult {
  const d = input.structured_data;
  const mfg = d?.mfg_date;
  const month = mfg?.month;
  const year = mfg?.year;

  if (!month && !year) {
    return {
      passed: false,
      rule_code: 'LM-05',
      field: 'mfg_date',
      actual: null,
      expected: 'Month (1-12) and year of manufacture',
      suggestion: 'Declare the manufacturing date with both month and year on the label.',
    };
  }

  const monthNum = typeof month === 'number' ? month : parseInt(String(month), 10);
  if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    return {
      passed: false,
      rule_code: 'LM-05',
      field: 'mfg_date.month',
      actual: month != null ? String(month) : null,
      expected: 'A value between 1 and 12',
      suggestion: `Invalid manufacturing month "${month}". Must be between 1 (January) and 12 (December).`,
    };
  }

  const yearNum = typeof year === 'number' ? year : parseInt(String(year), 10);
  const currentYear = new Date().getFullYear();
  if (isNaN(yearNum) || yearNum < 2000 || yearNum > currentYear + 1) {
    return {
      passed: false,
      rule_code: 'LM-05',
      field: 'mfg_date.year',
      actual: year != null ? String(year) : null,
      expected: `A year between 2000 and ${currentYear + 1}`,
      suggestion: `Invalid manufacturing year "${year}". Must be between 2000 and ${currentYear + 1}.`,
    };
  }

  return {
    passed: true,
    rule_code: 'LM-05',
    field: 'mfg_date',
    actual: `${monthNum}/${yearNum}`,
    expected: 'Valid month (1-12) and reasonable year',
    suggestion: '',
  };
}
