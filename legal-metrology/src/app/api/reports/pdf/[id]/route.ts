import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { buildReportPDF, reportFileName } from '@/lib/pdf/generateReport';
import { checkRateLimit } from '@/lib/rate-limit';
import { RateLimitError } from '@/lib/errors';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const maxDuration = 30;

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await checkRateLimit(user.id, '/api/reports/pdf', 20, 3600);

    const { id } = await params;

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const { data: extraction } = await supabase
      .from('extractions')
      .select('*')
      .eq('product_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: report } = await supabase
      .from('compliance_reports')
      .select('*')
      .eq('product_id', id)
      .order('checked_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const bytes = await buildReportPDF({ report, product, extraction });
    const filename = reportFileName(product.name, report.id);

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, max-age=0, no-store',
      },
    });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json(
        { error: 'rate_limited', retryAfter: error.retryAfter },
        { status: 429 },
      );
    }
    console.error('PDF report error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}