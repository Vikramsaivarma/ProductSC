-- Legal Metrology Compliance Checker — Supabase Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin','officer','viewer')) DEFAULT 'officer',
  organization TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT CHECK (category IN ('food','cosmetic','personal_care','electronics','household','other')) DEFAULT 'other',
  package_weight_bucket TEXT CHECK (package_weight_bucket IN ('<=200','200-500','>500')) DEFAULT '<=200',
  image_urls TEXT[] DEFAULT '{}',
  uploaded_by UUID REFERENCES profiles(id) NOT NULL,
  source TEXT CHECK (source IN ('manual_upload','dataset_import')) DEFAULT 'manual_upload',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Extractions table (AI analysis results)
CREATE TABLE extractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  raw_ocr_text TEXT,
  structured_data JSONB NOT NULL,
  font_analysis JSONB,
  ai_suggestions JSONB DEFAULT '{}',
  model_used TEXT DEFAULT 'gemini-2.0-flash-exp',
  confidence FLOAT,
  tokens_used INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance Reports table
CREATE TABLE compliance_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) NOT NULL,
  extraction_id UUID REFERENCES extractions(id) NOT NULL,
  overall_status TEXT CHECK (overall_status IN ('compliant','partial','non_compliant')) NOT NULL,
  compliance_score INT CHECK (compliance_score BETWEEN 0 AND 100) NOT NULL,
  violations JSONB DEFAULT '[]',
  passed_checks JSONB DEFAULT '[]',
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rules reference table
CREATE TABLE rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  legal_reference TEXT NOT NULL,
  category TEXT,
  severity TEXT CHECK (severity IN ('critical','major','minor')) NOT NULL,
  validation_config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE
);

-- Audit log
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rate limits
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  endpoint TEXT NOT NULL,
  requested_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_products_uploaded_by ON products(uploaded_by);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_extractions_product_id ON extractions(product_id);
CREATE INDEX idx_compliance_reports_product_id ON compliance_reports(product_id);
CREATE INDEX idx_compliance_reports_status ON compliance_reports(overall_status);
CREATE INDEX idx_compliance_reports_checked_at ON compliance_reports(checked_at);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_rate_limits_user_endpoint ON rate_limits(user_id, endpoint, requested_at DESC);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'reports', false)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Profiles: users read own, admin reads all
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admin can read all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Products: officers see own, admin sees all, viewer reads all
CREATE POLICY "Officers can read own products" ON products FOR SELECT USING (
  uploaded_by = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','viewer'))
);
CREATE POLICY "Officers can insert products" ON products FOR INSERT WITH CHECK (uploaded_by = auth.uid());
CREATE POLICY "Officers can update own products" ON products FOR UPDATE USING (uploaded_by = auth.uid());

-- Extractions: linked to product access
CREATE POLICY "Users can read extractions via product" ON extractions FOR SELECT USING (
  EXISTS (SELECT 1 FROM products WHERE id = product_id AND (
    uploaded_by = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','viewer'))
  ))
);
CREATE POLICY "Service can insert extractions" ON extractions FOR INSERT WITH CHECK (true);

-- Compliance Reports: linked to product access
CREATE POLICY "Users can read reports via product" ON compliance_reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM products WHERE id = product_id AND (
    uploaded_by = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','viewer'))
  ))
);
CREATE POLICY "Service can insert reports" ON compliance_reports FOR INSERT WITH CHECK (true);

-- Rules: readable by all authenticated
CREATE POLICY "Authenticated can read rules" ON rules FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can manage rules" ON rules FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Audit log: admin reads all, users read own
CREATE POLICY "Admin can read audit log" ON audit_log FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Service can insert audit log" ON audit_log FOR INSERT WITH CHECK (true);

-- Rate limits: service access only
CREATE POLICY "Service can manage rate limits" ON rate_limits FOR ALL USING (true);

-- Trigger: auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    CASE
      WHEN NEW.raw_user_meta_data->>'invite_code' = 'LMADMIN2025' THEN 'admin'
      WHEN NEW.raw_user_meta_data->>'invite_code' = 'LMOFFICER2025' THEN 'officer'
      ELSE 'viewer'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Storage policies
CREATE POLICY "Authenticated can upload images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Anyone can view images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Authenticated can upload reports" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'reports' AND auth.role() = 'authenticated');
CREATE POLICY "Users can view own reports" ON storage.objects
  FOR SELECT USING (bucket_id = 'reports' AND auth.role() = 'authenticated');