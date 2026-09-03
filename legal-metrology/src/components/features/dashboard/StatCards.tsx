'use client';

import { ScanLine, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatCardsProps {
  totalScans: number;
  complianceRate: number;
  nonCompliant: number;
  pendingReviews: number;
}

const statCards = [
  {
    key: 'totalScans' as const,
    title: 'Total Scans',
    icon: ScanLine,
    bgClass: 'bg-blue-500/10',
    iconClass: 'text-blue-500',
  },
  {
    key: 'complianceRate' as const,
    title: 'Compliance Rate',
    icon: CheckCircle,
    bgClass: 'bg-emerald-500/10',
    iconClass: 'text-emerald-500',
    suffix: '%',
  },
  {
    key: 'nonCompliant' as const,
    title: 'Non-Compliant',
    icon: XCircle,
    bgClass: 'bg-red-500/10',
    iconClass: 'text-red-500',
  },
  {
    key: 'pendingReviews' as const,
    title: 'Pending Reviews',
    icon: Clock,
    bgClass: 'bg-amber-500/10',
    iconClass: 'text-amber-500',
  },
];

export function StatCards({
  totalScans,
  complianceRate,
  nonCompliant,
  pendingReviews,
}: StatCardsProps) {
  const values = { totalScans, complianceRate, nonCompliant, pendingReviews };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map(({ key, title, icon: Icon, bgClass, iconClass, suffix }) => (
        <Card key={key}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {title}
            </CardTitle>
            <div className={`rounded-md p-2 ${bgClass}`}>
              <Icon className={`h-4 w-4 ${iconClass}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {key === 'complianceRate'
                ? `${complianceRate.toFixed(1)}${suffix}`
                : values[key].toLocaleString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
