import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDemoUserFromCookie } from '@/lib/auth/middleware';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const user = getDemoUserFromCookie(request as NextRequest);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
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

    return NextResponse.json({ product, extraction, report });
  } catch (error) {
    console.error('Report fetch error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}