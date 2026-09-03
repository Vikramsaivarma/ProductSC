import { CheckInput, CheckResult, EngineResult, PassedCheck, Violation } from './types';

import lm01 from './checks/LM-01';
import lm02 from './checks/LM-02';
import lm03 from './checks/LM-03';
import lm04 from './checks/LM-04';
import lm05 from './checks/LM-05';
import lm06 from './checks/LM-06';
import lm07 from './checks/LM-07';
import lm08 from './checks/LM-08';
import lm09 from './checks/LM-09';
import lm10 from './checks/LM-10';
import lm11 from './checks/LM-11';
import lm12 from './checks/LM-12';

interface RuleMeta {
  check: (input: CheckInput) => CheckResult;
  title: string;
  reference: string;
  severity: Violation['severity'];
}

const RULES: Record<string, RuleMeta> = {
  'LM-01': { check: lm01, title: 'Manufacturer Details', reference: 'Rule 5(1)(a) PCI Rules, 2011', severity: 'critical' },
  'LM-02': { check: lm02, title: 'Common/Generic Name', reference: 'Rule 5(1)(b) PCI Rules, 2011', severity: 'major' },
  'LM-03': { check: lm03, title: 'Net Quantity Declaration', reference: 'Section 9 LMA 2009 / Rule 5(1)(d)', severity: 'critical' },
  'LM-04': { check: lm04, title: 'MRP Declaration', reference: 'Rule 5(1)(e) PCI Rules, 2011', severity: 'critical' },
  'LM-05': { check: lm05, title: 'Manufacturing Date', reference: 'Rule 5(1)(f) PCI Rules, 2011', severity: 'critical' },
  'LM-06': { check: lm06, title: 'Consumer Care Details', reference: 'Rule 5(2) PCI Rules, 2011', severity: 'major' },
  'LM-07': { check: lm07, title: 'Country of Origin (Imported)', reference: 'Rule 5(1)(m) PCI Rules, 2011', severity: 'critical' },
  'LM-08': { check: lm08, title: 'Font Size - Net Quantity', reference: 'Rule 10(1) PCI Rules, 2011', severity: 'major' },
  'LM-09': { check: lm09, title: 'MRP Tampering Detection', reference: 'Section 36 LMA 2009', severity: 'critical' },
  'LM-10': { check: lm10, title: 'Unit Sale Price (Food)', reference: 'Rule 5(4) PCI Rules, 2011', severity: 'major' },
  'LM-11': { check: lm11, title: 'Misleading Terms', reference: 'Section 2(1)(j) LMA 2009', severity: 'minor' },
  'LM-12': { check: lm12, title: 'PDP Declaration Visibility', reference: 'Rule 5(1) PCI Rules, 2011', severity: 'minor' },
};

const SEVERITY_PENALTY: Record<Violation['severity'], number> = {
  critical: 15,
  major: 8,
  minor: 3,
};

export function validateExtraction(input: CheckInput): EngineResult {
  let score = 100;
  const violations: Violation[] = [];
  const passedChecks: PassedCheck[] = [];

  for (const [code, meta] of Object.entries(RULES)) {
    const result = meta.check(input);

    if (result.passed) {
      passedChecks.push({
        rule_code: code,
        rule_title: meta.title,
        field: result.field,
        value: result.actual ?? '',
      });
    } else {
      score -= SEVERITY_PENALTY[meta.severity];
      violations.push({
        rule_code: code,
        rule_title: meta.title,
        rule_reference: meta.reference,
        severity: meta.severity,
        field: result.field,
        actual: result.actual,
        expected: result.expected,
        suggestion: result.suggestion,
      });
    }
  }

  const clampedScore = Math.max(0, score);

  let overall_status: EngineResult['overall_status'];
  if (clampedScore >= 85) {
    overall_status = 'compliant';
  } else if (clampedScore >= 60) {
    overall_status = 'partial';
  } else {
    overall_status = 'non_compliant';
  }

  return {
    overall_status,
    compliance_score: clampedScore,
    violations,
    passed_checks: passedChecks,
  };
}
