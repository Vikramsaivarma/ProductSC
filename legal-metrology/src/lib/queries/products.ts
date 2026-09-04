import { createClient } from '@/lib/supabase/server';

export async function getProductById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export async function getProductsByUser(userId: string, limit = 50, offset = 0) {
  const supabase = await createClient();
  const { data, error, count } = await supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('uploaded_by', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return { products: [], total: 0 };
  return { products: data ?? [], total: count ?? 0 };
}

export async function getAllProducts(limit = 50, offset = 0) {
  const supabase = await createClient();
  const { data, error, count } = await supabase
    .from('products')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return { products: [], total: 0 };
  return { products: data ?? [], total: count ?? 0 };
}

export async function searchProducts(query: string, filters?: { category?: string; status?: string }) {
  const supabase = await createClient();

  let dbQuery = supabase
    .from('products')
    .select('*', { count: 'exact' });

  if (query) {
    dbQuery = dbQuery.or(`name.ilike.%${query}%,brand.ilike.%${query}%`);
  }

  if (filters?.category) {
    dbQuery = dbQuery.eq('category', filters.category);
  }

  const { data: products, error: productsError } = await dbQuery;

  if (productsError) return { results: [], total: 0 };

  let results = products ?? [];

  if (filters?.status && results.length > 0) {
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

export async function createProduct(product: {
  name: string;
  brand?: string;
  category: string;
  package_weight_bucket: string;
  image_urls: string[];
  uploaded_by: string;
  source?: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select('id')
    .single();

  if (error) throw error;
  return data;
}
