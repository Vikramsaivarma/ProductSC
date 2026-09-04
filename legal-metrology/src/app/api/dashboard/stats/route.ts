import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDemoUserFromCookie } from '@/lib/auth/middleware';

export async function GET(request: Request) {
  try {
    const user = getDemoUserFromCookie(request as NextRequest);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    const { data: reports, error } = await supabase
      .from('compliance_reports')
      .select('overall_status, compliance_score, violations, checked_at');

    if (error) {
      console.error('Failed to fetch dashboard stats:', error);
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }

    const all = reports ?? [];
    const totalScanned = all.length;
    const compliantCount = all.filter((r) => r.overall_status === 'compliant').length;
    const nonCompliantCount = all.filter((r) => r.overall_status === 'non_compliant').length;
    const partialCount = all.filter((r) => r.overall_status === 'partial').length;
    const complianceRate = totalScanned > 0
      ? Math.round((compliantCount / totalScanned) * 100)
      : 0;

    let criticalViolations = 0;
    const pendingReviews = 0;
    const ruleCounts: Record<string, { rule_code: string; count: number }> = {};
    const categoryCounts: Record<string, number> = {};

    for (const r of all) {
      const violations = Array.isArray(r.violations) ? r.violations : [];
      for (const v of violations) {
        const vObj = v as { rule_code?: string; severity?: string };
        if (vObj.severity === 'critical') criticalViolations++;
        const code = vObj.rule_code ?? 'unknown';
        if (!ruleCounts[code]) ruleCounts[code] = { rule_code: code, count: 0 };
        ruleCounts[code].count++;
      }
    }

    const topViolatedRules = Object.values(ruleCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const scanTrend = computeScanTrend(all);
    const recentScans = all
      .sort((a, b) => new Date(b.checked_at ?? 0).getTime() - new Date(a.checked_at ?? 0).getTime())
      .slice(0, 20)
      .map((r) => ({
        id: r.checked_at,
        overall_status: r.overall_status,
        compliance_score: r.compliance_score,
        checked_at: r.checked_at,
      }));

    return NextResponse.json({
      totalScanned,
      compliantCount,
      nonCompliantCount,
      partialCount,
      complianceRate,
      criticalViolations,
      pendingReviews,
      scanTrend,
      violationsByCategory: Object.entries(categoryCounts).map(([category, count]) => ({ category, count })),
      topViolatedRules,
      recentScans,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function computeScanTrend(reports: Array<{ checked_at: string | null; overall_status: string }>) {
  const grouped: Record<string, { date: string; compliant: number; non_compliant: number; partial: number; total: number }> = {};

  for (const r of reports) {
    const date = r.checked_at?.slice(0, 10) ?? 'unknown';
    if (!grouped[date]) {
      grouped[date] = { date, compliant: 0, non_compliant: 0, partial: 0, total: 0 };
    }
    grouped[date].total++;
    if (r.overall_status === 'compliant') grouped[date].compliant++;
    else if (r.overall_status === 'non_compliant') grouped[date].non_compliant++;
    else grouped[date].partial++;
  }

  return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
}
