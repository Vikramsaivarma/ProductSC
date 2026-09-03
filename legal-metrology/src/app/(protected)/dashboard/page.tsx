import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { StatCards } from '@/components/features/dashboard/StatCards';
import { DashboardCharts } from '@/components/features/dashboard/DashboardCharts';
import { RecentScansTable } from '@/components/features/dashboard/RecentScansTable';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: reports } = await supabase
    .from('compliance_reports')
    .select('id, product_id, overall_status, compliance_score, violations, reviewed_by, checked_at')
    .order('checked_at', { ascending: false });

  const allReports = reports ?? [];

  const totalScans = allReports.length;
  const compliantCount = allReports.filter((r) => r.overall_status === 'compliant').length;
  const partialCount = allReports.filter((r) => r.overall_status === 'partial').length;
  const nonCompliantCount = allReports.filter((r) => r.overall_status === 'non_compliant').length;
  const pendingReviews = allReports.filter((r) => !r.reviewed_by).length;
  const complianceRate = totalScans > 0 ? (compliantCount / totalScans) * 100 : 0;

  // Fetch product names for recent scans
  const recentProductIds = allReports.slice(0, 10).map((r) => r.product_id);
  const { data: products } = recentProductIds.length > 0
    ? await supabase
        .from('products')
        .select('id, name')
        .in('id', recentProductIds)
    : { data: [] };

  const productMap = new Map((products ?? []).map((p) => [p.id, p.name]));

  const recentScans = allReports.slice(0, 10).map((r) => ({
    product_id: r.product_id,
    product_name: productMap.get(r.product_id) ?? 'Unknown Product',
    overall_status: r.overall_status,
    compliance_score: r.compliance_score,
    checked_at: r.checked_at,
  }));

  // Compute top violated rules from violations JSON
  const ruleCounts = new Map<string, number>();
  for (const report of allReports) {
    if (!report.violations || !Array.isArray(report.violations)) continue;
    for (const violation of report.violations) {
      const rule =
        (violation as Record<string, unknown>).rule_code ??
        (violation as Record<string, unknown>).rule ??
        (violation as Record<string, unknown>).title;
      if (typeof rule === 'string') {
        ruleCounts.set(rule, (ruleCounts.get(rule) ?? 0) + 1);
      }
    }
  }

  const topViolatedRules = Array.from(ruleCounts.entries())
    .map(([rule, count]) => ({ rule, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Overview of your legal metrology compliance checks.
        </p>
      </div>

      <div className="space-y-6">
        <StatCards
          totalScans={totalScans}
          complianceRate={complianceRate}
          nonCompliant={nonCompliantCount}
          pendingReviews={pendingReviews}
        />

        <DashboardCharts
          pieData={{
            compliant: compliantCount,
            partial: partialCount,
            nonCompliant: nonCompliantCount,
          }}
          topViolatedRules={topViolatedRules}
        />

        <RecentScansTable scans={recentScans} />
      </div>
    </div>
  );
}
