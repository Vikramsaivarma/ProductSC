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

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') ?? '';
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    let query = supabase
      .from('products')
      .select('*', { count: 'exact' });

    if (q) {
      query = query.or(`name.ilike.%${q}%,brand.ilike.%${q}%`);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data: products, error: productsError } = await query;

    if (productsError) {
      console.error('Search query error:', productsError);
      return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }

    let results = products ?? [];

    if (status && results.length > 0) {
      const productIds = results.map((p) => p.id);
      const { data: matchingReports } = await supabase
        .from('compliance_reports')
        .select('product_id')
        .in('product_id', productIds)
        .eq('overall_status', status);

      const matchingIds = new Set(matchingReports?.map((r) => r.product_id) ?? []);
      results = results.filter((p) => matchingIds.has(p.id));
    }

    return NextResponse.json({ results, total: results.length });
  } catch (error) {
    console.error('Search error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}