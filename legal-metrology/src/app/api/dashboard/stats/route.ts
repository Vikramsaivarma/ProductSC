import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: reports, error } = await supabase
      .from('compliance_reports')
      .select('overall_status');

    if (error) {
      console.error('Failed to fetch dashboard stats:', error);
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }

    const totalScanned = reports?.length ?? 0;
    const compliantCount = reports?.filter((r) => r.overall_status === 'compliant').length ?? 0;
    const nonCompliantCount = reports?.filter((r) => r.overall_status === 'non_compliant').length ?? 0;
    const partialCount = reports?.filter((r) => r.overall_status === 'partial').length ?? 0;
    const complianceRate = totalScanned > 0
      ? Math.round((compliantCount / totalScanned) * 100)
      : 0;

    return NextResponse.json({
      totalScanned,
      compliantCount,
      nonCompliantCount,
      partialCount,
      complianceRate,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
