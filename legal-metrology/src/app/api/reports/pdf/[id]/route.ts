import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const { data: report, error: reportError } = await supabase
      .from('compliance_reports')
      .select('*')
      .eq('id', id)
      .single();

    if (reportError || !report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({
      reportId: id,
      status: report.overall_status,
      score: report.compliance_score,
      violations: report.violations,
      passedChecks: report.passed_checks,
      checkedAt: report.checked_at,
      message: 'PDF generation not yet implemented. This is a placeholder response.',
    });
  } catch (error) {
    console.error('PDF report error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
