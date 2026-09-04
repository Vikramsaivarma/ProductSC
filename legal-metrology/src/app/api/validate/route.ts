import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateExtraction } from '@/lib/rules/validator';
import { getDemoUserFromCookie } from '@/lib/auth/middleware';

export async function POST(request: Request) {
  try {
    const user = getDemoUserFromCookie(request as NextRequest);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    const body = await request.json();
    const { extractionId } = body as { extractionId: string };

    if (!extractionId) {
      return NextResponse.json({ error: 'extractionId is required' }, { status: 400 });
    }

    const { data: extraction, error: extractionError } = await supabase
      .from('extractions')
      .select('*, products!inner(package_weight_bucket, category)')
      .eq('id', extractionId)
      .single();

    if (extractionError || !extraction) {
      return NextResponse.json({ error: 'Extraction not found' }, { status: 404 });
    }

    const product = extraction.products as unknown as {
      package_weight_bucket: string;
      category: string;
    };

    const engineResult = validateExtraction({
      structured_data: extraction.structured_data,
      font_analysis: extraction.font_analysis,
      package_weight_bucket: product.package_weight_bucket,
      category: product.category,
    });

    const { data: report, error: reportError } = await supabase
      .from('compliance_reports')
      .update({
        overall_status: engineResult.overall_status,
        compliance_score: engineResult.compliance_score,
        violations: engineResult.violations,
        passed_checks: engineResult.passed_checks,
      })
      .eq('extraction_id', extractionId)
      .select('id')
      .single();

    if (reportError) {
      console.error('Failed to update compliance report:', reportError);
      return NextResponse.json({ error: 'Failed to update compliance report' }, { status: 500 });
    }

    return NextResponse.json({
      reportId: report.id,
      status: engineResult.overall_status,
      score: engineResult.compliance_score,
      violations: engineResult.violations,
      passedChecks: engineResult.passed_checks,
    });
  } catch (error) {
    console.error('Validation error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}