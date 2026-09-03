'use client';

import { useState, useEffect, useCallback } from 'react';
import { SearchBar } from '@/components/features/search/SearchBar';
import { FilterSidebar } from '@/components/features/search/FilterSidebar';
import { ResultCard } from '@/components/features/search/ResultCard';
import { Skeleton } from '@/components/ui/skeleton';

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  status: 'compliant' | 'partial' | 'non_compliant';
  score: number;
  scanDate: string;
}

interface Filters {
  category: string;
  status: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({ category: 'all', status: 'all' });
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchResults = useCallback(async (q: string, f: Filters) => {
    setLoading(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (f.category !== 'all') params.set('category', f.category);
      if (f.status !== 'all') params.set('status', f.status);

      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      setResults(data.products ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults(query, filters);
  }, [query, filters, fetchResults]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Search Products</h1>
        <p className="text-muted-foreground">
          Find products and check their compliance status.
        </p>
      </div>

      <SearchBar value={query} onChange={setQuery} loading={loading} />

      <div className="flex gap-6">
        <FilterSidebar filters={filters} onChange={setFilters} />

        <div className="flex-1">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-lg border p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : !hasSearched ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="rounded-full bg-muted p-6 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-muted-foreground"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Start searching</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1">
                Type a product name or brand in the search bar above to find
                compliance reports.
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="rounded-full bg-muted p-6 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-muted-foreground"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                  <path d="M8 11h6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">No results found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1">
                No products match your search. Try adjusting your query or
                filters.
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                {results.length} result{results.length !== 1 && 's'} found
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((product) => (
                  <ResultCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
