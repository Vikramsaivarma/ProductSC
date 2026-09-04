import { createClient } from '@/lib/supabase/server';

export async function getReportById(reportId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('compliance_reports')
    .select(`
      *,
      product:products(*),
      extraction:extractions(*)
    `)
    .eq('id', reportId)
    .single();

  if (error) return null;
  return data;
}

export async function getReportByProductId(productId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('compliance_reports')
    .select(`
      *,
      product:products(*),
      extraction:extractions(*)
    `)
    .eq('product_id', productId)
    .order('checked_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return null;
  return data;
}

export async function getAllReports(limit = 50, offset = 0) {
  const supabase = await createClient();
  const { data, error, count } = await supabase
    .from('compliance_reports')
    .select(`
      *,
      product:products(id, name, brand, category, image_urls),
      extraction:extractions(id, confidence)
    `, { count: 'exact' })
    .order('checked_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return { reports: [], total: 0 };
  return { reports: data ?? [], total: count ?? 0 };
}

export async function getReportsByStatus(status: string, limit = 50) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('compliance_reports')
    .select(`
      *,
      product:products(id, name, brand, category),
      extraction:extractions(id, confidence)
    `)
    .eq('overall_status', status)
    .order('checked_at', { ascending: false })
    .limit(limit);

  if (error) return [];
  return data ?? [];
}

export async function markReportReviewed(reportId: string, reviewedBy: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('compliance_reports')
    .update({
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', reportId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createComplianceReport(report: {
  product_id: string;
  extraction_id: string;
  overall_status: string;
  compliance_score: number;
  violations: unknown[];
  passed_checks: unknown[];
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('compliance_reports')
    .insert(report)
    .select()
    .single();

  if (error) throw error;
  return data;
}
