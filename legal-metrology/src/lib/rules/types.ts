export interface StructuredData {
  manufacturer_name: string | null;
  manufacturer_address: string | null;
  packer_name: string | null;
  importer_name_address: string | null;
  common_or_generic_name: string | null;
  net_quantity: { value: number; unit: string } | null;
  mrp: { value: number; currency: string; inclusive_of_taxes_declared: boolean; raw_string: string } | null;
  mfg_date: { month: number; year: number; raw: string } | null;
  expiry_or_best_before: string | null;
  consumer_care: { name: string; phone?: string; email?: string; address?: string } | null;
  country_of_origin: string | null;
  is_imported?: boolean;
  unit_sale_price: string | null;
  batch_number: string | null;
  fssai_number: string | null;
  declarations_visible_on_pdp: string[];
  suspicious_elements: string[];
  confidence: number;
}

export interface FontAnalysisData {
  text_measurements: {
    field: string;
    estimated_height_mm: number;
    confidence: number;
    meets_requirement: boolean;
  }[];
  contrast_assessment: 'good' | 'acceptable' | 'poor';
  readability_score: number;
  notes: string;
}

export interface CheckInput {
  structured_data: StructuredData;
  font_analysis: FontAnalysisData | null;
  package_weight_bucket: string;
  category: string;
}

export interface CheckResult {
  passed: boolean;
  rule_code: string;
  field: string;
  actual: string | null;
  expected: string;
  suggestion: string;
}

export interface Violation {
  rule_code: string;
  rule_title: string;
  rule_reference: string;
  severity: 'critical' | 'major' | 'minor';
  field: string;
  actual: string | null;
  expected: string;
  suggestion: string;
}

export interface PassedCheck {
  rule_code: string;
  rule_title: string;
  field: string;
  value: string;
}

export interface EngineResult {
  overall_status: 'compliant' | 'partial' | 'non_compliant';
  compliance_score: number;
  violations: Violation[];
  passed_checks: PassedCheck[];
}