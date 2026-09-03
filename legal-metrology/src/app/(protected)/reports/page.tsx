'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { createClient } from '@/lib/supabase/client';
import type { ComplianceReport, ProductRecord, Status } from '@/types/domain';

interface ReportRow {
  product: ProductRecord;
  report: ComplianceReport;
}

const STATUS_CONFIG: Record<Status, { label: string; badgeClass: string }> = {
  compliant: { label: 'Compliant', badgeClass: 'bg-green-100 text-green-700 border-green-200' },
  partial: { label: 'Partial', badgeClass: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  non_compliant: { label: 'Non-Compliant', badgeClass: 'bg-red-100 text-red-700 border-red-200' },
};

type FilterTab = 'all' | Status;

export default function ReportsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>('all');

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const { data: reports } = await supabase
        .from('compliance_reports')
        .select('*')
        .order('checked_at', { ascending: false });

      if (!reports || reports.length === 0) {
        setLoading(false);
        return;
      }

      const productIds = Array.from(new Set(reports.map((r) => r.product_id)));
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);

      const productMap = new Map<string, ProductRecord>(
        (products ?? []).map((p) => [p.id, p as unknown as ProductRecord])
      );

      const result: ReportRow[] = reports
        .filter((r) => productMap.has(r.product_id))
        .map((r) => ({
          product: productMap.get(r.product_id)!,
          report: r as unknown as ComplianceReport,
        }));

      setRows(result);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = filter === 'all' ? rows : rows.filter((r) => r.report.overall_status === filter);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Reports</h1>
        <p className="mt-2 text-muted-foreground">
          Browse and review all compliance reports.
        </p>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterTab)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="compliant">Compliant</TabsTrigger>
            <TabsTrigger value="partial">Partial</TabsTrigger>
            <TabsTrigger value="non_compliant">Non-Compliant</TabsTrigger>
          </TabsList>
        </Tabs>
        <span className="text-sm text-muted-foreground">
          {filtered.length} report{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                    Product Name
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right font-medium text-muted-foreground">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      No reports found.
                    </td>
                  </tr>
                ) : (
                  filtered.map(({ product, report }) => {
                    const status = STATUS_CONFIG[report.overall_status];
                    return (
                      <tr
                        key={report.id}
                        className="transition-colors hover:bg-muted/30"
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium">{product.name}</div>
                          {product.brand && (
                            <div className="text-xs text-muted-foreground">
                              {product.brand}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className={status.badgeClass}>
                            {status.label}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 font-mono">
                          {report.compliance_score}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {new Date(report.checked_at).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/reports/${product.id}`)}
                          >
                            <Eye className="mr-1.5 h-3.5 w-3.5" />
                            View
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
