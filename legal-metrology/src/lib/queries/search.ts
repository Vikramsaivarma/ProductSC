import { createClient } from '@/lib/supabase/server';

export interface SearchFilters {
  q?: string;
  status?: string;
  category?: string;
  from?: string;
  to?: string;
}

export async function searchProducts(filters: SearchFilters) {
  const supabase = await createClient();

  let query = supabase
    .from('products')
    .select('*', { count: 'exact' });

  if (filters.q) {
    query = query.or(`name.ilike.%${filters.q}%,brand.ilike.%${filters.q}%`);
  }

  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  if (filters.from) {
    query = query.gte('created_at', filters.from);
  }

  if (filters.to) {
    query = query.lte('created_at', filters.to);
  }

  const { data: products, error: productsError } = await query;

  if (productsError) return { results: [], total: 0 };

  let results = products ?? [];

  if (filters.status && results.length > 0) {
    const productIds = results.map((p: { id: string }) => p.id);
    const { data: matchingReports } = await supabase
      .from('compliance_reports')
      .select('product_id')
      .in('product_id', productIds)
      .eq('overall_status', filters.status);

    const matchingIds = new Set(matchingReports?.map((r) => r.product_id) ?? []);
    results = results.filter((p: { id: string }) => matchingIds.has(p.id));
  }

  return { results, total: results.length };
}

export async function getProductWithReport(productId: string) {
  const supabase = await createClient();

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();

  if (!product) return null;

  const { data: report } = await supabase
    .from('compliance_reports')
    .select('overall_status, compliance_score')
    .eq('product_id', productId)
    .order('checked_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return { ...product, report };
}
