import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { runAnalysisPipeline } from '@/lib/gemini/pipeline';
import { validateExtraction } from '@/lib/rules/validator';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, imageUrls } = body as { productId: string; imageUrls: string[] };

    if (!productId || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json(
        { error: 'productId and non-empty imageUrls array are required' },
        { status: 400 },
      );
    }

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('package_weight_bucket, category')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const pipelineResult = await runAnalysisPipeline({
      imageUrls,
      packageWeightBucket: product.package_weight_bucket,
    });

    if (!pipelineResult.structured) {
      return NextResponse.json({ error: 'AI extraction failed' }, { status: 502 });
    }

    const extractionResult = validateExtraction({
      structured_data: pipelineResult.structured,
      font_analysis: pipelineResult.fontAnalysis,
      package_weight_bucket: product.package_weight_bucket,
      category: product.category,
    });

    const { data: extraction, error: extractionError } = await supabase
      .from('extractions')
      .insert({
        product_id: productId,
        raw_ocr_text: '',
        structured_data: pipelineResult.structured,
        font_analysis: pipelineResult.fontAnalysis,
        ai_suggestions: pipelineResult.suggestions,
        model_used: 'gemini-2.0-flash-exp',
        confidence: pipelineResult.structured?.confidence ?? 0,
        tokens_used: pipelineResult.tokensUsed,
      })
      .select('id')
      .single();

    if (extractionError) {
      console.error('Failed to insert extraction:', extractionError);
      return NextResponse.json({ error: 'Failed to save extraction' }, { status: 500 });
    }

    const { data: report, error: reportError } = await supabase
      .from('compliance_reports')
      .insert({
        product_id: productId,
        extraction_id: extraction.id,
        overall_status: extractionResult.overall_status,
        compliance_score: extractionResult.compliance_score,
        violations: extractionResult.violations,
        passed_checks: extractionResult.passed_checks,
      })
      .select('id')
      .single();

    if (reportError) {
      console.error('Failed to insert compliance report:', reportError);
      return NextResponse.json({ error: 'Failed to save compliance report' }, { status: 500 });
    }

    return NextResponse.json({
      extractionId: extraction.id,
      reportId: report.id,
      structured: pipelineResult.structured,
      fontAnalysis: pipelineResult.fontAnalysis,
      suggestions: pipelineResult.suggestions,
      violations: extractionResult.violations,
      score: extractionResult.compliance_score,
      status: extractionResult.overall_status,
    });
  } catch (error) {
    console.error('Analysis error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
