export type Role = 'admin' | 'officer' | 'viewer';
export type Category = 'food' | 'cosmetic' | 'personal_care' | 'electronics' | 'household' | 'other';
export type WeightBucket = '<=200' | '200-500' | '>500';
export type Status = 'compliant' | 'partial' | 'non_compliant';
export type Severity = 'critical' | 'major' | 'minor';

export interface StructuredDeclarations {
  manufacturer_name: string | null;
  manufacturer_address: string | null;
  packer_name: string | null;
  importer_name_address: string | null;
  common_or_generic_name: string | null;
  net_quantity: NetQuantity | null;
  mrp: MRP | null;
  mfg_date: MfgDate | null;
  expiry_or_best_before: string | null;
  consumer_care: ConsumerCare | null;
  country_of_origin: string | null;
  unit_sale_price: string | null;
  batch_number: string | null;
  fssai_number: string | null;
  declarations_visible_on_pdp: string[];
  suspicious_elements: string[];
  confidence: number;
}

export interface NetQuantity {
  value: number;
  unit: 'g' | 'kg' | 'ml' | 'l' | 'cm' | 'm' | 'piece';
}

export interface MRP {
  value: number;
  currency: 'INR';
  inclusive_of_taxes_declared: boolean;
  raw_string: string;
}

export interface MfgDate {
  month: number;
  year: number;
  raw: string;
}

export interface ConsumerCare {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface FontAnalysis {
  text_measurements: TextMeasurement[];
  contrast_assessment: 'good' | 'acceptable' | 'poor';
  readability_score: number;
  notes: string;
}

export interface TextMeasurement {
  field: string;
  estimated_height_mm: number;
  confidence: number;
  meets_requirement: boolean;
}

export interface Violation {
  rule_code: string;
  rule_title: string;
  rule_reference: string;
  severity: Severity;
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
  overall_status: Status;
  compliance_score: number;
  violations: Violation[];
  passed_checks: PassedCheck[];
}

export interface ExtractionRecord {
  id: string;
  product_id: string;
  raw_ocr_text: string;
  structured_data: StructuredDeclarations;
  font_analysis: FontAnalysis | null;
  ai_suggestions: Record<string, string>;
  model_used: string;
  confidence: number;
  tokens_used: number;
  created_at: string;
}

export interface ComplianceReport {
  id: string;
  product_id: string;
  extraction_id: string;
  overall_status: Status;
  compliance_score: number;
  violations: Violation[];
  passed_checks: PassedCheck[];
  reviewed_by: string | null;
  reviewed_at: string | null;
  checked_at: string;
}

export interface ProductRecord {
  id: string;
  name: string;
  brand: string | null;
  category: Category;
  package_weight_bucket: WeightBucket;
  image_urls: string[];
  uploaded_by: string;
  source: 'manual_upload' | 'dataset_import';
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
  organization: string | null;
  created_at: string;
}

export interface Rule {
  id: string;
  rule_code: string;
  title: string;
  description: string;
  legal_reference: string;
  category: string;
  severity: Severity;
  validation_config: Record<string, unknown>;
  is_active: boolean;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface SearchResult {
  product: ProductRecord;
  report: ComplianceReport | null;
  extraction: ExtractionRecord | null;
}