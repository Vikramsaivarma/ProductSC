'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface RecentScan {
  product_id: string;
  product_name: string;
  overall_status: 'compliant' | 'partial' | 'non_compliant';
  compliance_score: number;
  checked_at: string;
}

interface RecentScansTableProps {
  scans: RecentScan[];
}

const STATUS_CONFIG: Record<
  RecentScan['overall_status'],
  { label: string; className: string }
> = {
  compliant: {
    label: 'Compliant',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  partial: {
    label: 'Partial',
    className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  non_compliant: {
    label: 'Non-Compliant',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
};

export function RecentScansTable({ scans }: RecentScansTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Scans</CardTitle>
        <CardDescription>Latest compliance check results</CardDescription>
      </CardHeader>
      <CardContent>
        {scans.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No scans yet. Upload a product label to get started.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Product Name</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 pr-4 font-medium">Score</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {scans.map((scan) => {
                  const status = STATUS_CONFIG[scan.overall_status];
                  return (
                    <tr key={scan.product_id} className="border-b last:border-0">
                      <td className="py-3 pr-4">
                        <Link
                          href={`/reports/${scan.product_id}`}
                          className="font-medium text-foreground hover:underline"
                        >
                          {scan.product_name}
                        </Link>
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-medium">{scan.compliance_score}%</td>
                      <td className="py-3 text-muted-foreground">
                        {new Date(scan.checked_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
