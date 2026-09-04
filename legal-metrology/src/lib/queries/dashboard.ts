import { createClient } from '@/lib/supabase/server';

export async function getDashboardStats() {
  const supabase = await createClient();

  const { data: reports, error } = await supabase
    .from('compliance_reports')
    .select('overall_status, compliance_score, checked_at');

  if (error) return null;

  const totalScanned = reports?.length ?? 0;
  const compliantCount = reports?.filter((r) => r.overall_status === 'compliant').length ?? 0;
  const nonCompliantCount = reports?.filter((r) => r.overall_status === 'non_compliant').length ?? 0;
  const partialCount = reports?.filter((r) => r.overall_status === 'partial').length ?? 0;
  const complianceRate = totalScanned > 0
    ? Math.round((compliantCount / totalScanned) * 100)
    : 0;

  const avgScore = totalScanned > 0
    ? Math.round(reports!.reduce((sum, r) => sum + (r.compliance_score ?? 0), 0) / totalScanned)
    : 0;

  return {
    totalScanned,
    compliantCount,
    nonCompliantCount,
    partialCount,
    complianceRate,
    avgScore,
  };
}

export async function getScanTrend(days = 30) {
  const supabase = await createClient();
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from('compliance_reports')
    .select('checked_at, overall_status')
    .gte('checked_at', since.toISOString())
    .order('checked_at', { ascending: true });

  if (error) return [];

  const grouped: Record<string, { date: string; compliant: number; non_compliant: number; partial: number; total: number }> = {};

  for (const r of data ?? []) {
    const date = r.checked_at?.slice(0, 10) ?? 'unknown';
    if (!grouped[date]) {
      grouped[date] = { date, compliant: 0, non_compliant: 0, partial: 0, total: 0 };
    }
    grouped[date].total++;
    if (r.overall_status === 'compliant') grouped[date].compliant++;
    else if (r.overall_status === 'non_compliant') grouped[date].non_compliant++;
    else grouped[date].partial++;
  }

  return Object.values(grouped);
}

export async function getViolationsByCategory() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('compliance_reports')
    .select('violations, product:products(category)');

  if (error) return [];

  const counts: Record<string, number> = {};

  for (const r of data ?? []) {
    const category = (r.product as { category?: string })?.category ?? 'other';
    const violations = Array.isArray(r.violations) ? r.violations : [];
    counts[category] = (counts[category] ?? 0) + violations.length;
  }

  return Object.entries(counts).map(([category, count]) => ({ category, count }));
}

export async function getTopViolatedRules(limit = 10) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('compliance_reports')
    .select('violations');

  if (error) return [];

  const counts: Record<string, { rule_code: string; count: number }> = {};

  for (const r of data ?? []) {
    const violations = Array.isArray(r.violations) ? r.violations : [];
    for (const v of violations) {
      const code = (v as { rule_code?: string })?.rule_code ?? 'unknown';
      if (!counts[code]) counts[code] = { rule_code: code, count: 0 };
      counts[code].count++;
    }
  }

  return Object.values(counts)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export async function getRecentScans(limit = 20) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('compliance_reports')
    .select(`
      id,
      overall_status,
      compliance_score,
      checked_at,
      product:products(id, name, brand, category)
    `)
    .order('checked_at', { ascending: false })
    .limit(limit);

  if (error) return [];
  return data ?? [];
}
