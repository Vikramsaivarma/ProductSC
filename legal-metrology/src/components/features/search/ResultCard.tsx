'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  status: 'compliant' | 'partial' | 'non_compliant';
  score: number;
  scanDate: string;
}

const STATUS_CONFIG: Record<
  Product['status'],
  { label: string; variant: 'default' | 'secondary' | 'destructive' }
> = {
  compliant: { label: 'Compliant', variant: 'default' },
  partial: { label: 'Partial', variant: 'secondary' },
  non_compliant: { label: 'Non-Compliant', variant: 'destructive' },
};

function categoryLabel(category: string): string {
  return category
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function scoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 50) return 'text-yellow-600';
  return 'text-red-600';
}

interface ResultCardProps {
  product: Product;
}

export function ResultCard({ product }: ResultCardProps) {
  const status = STATUS_CONFIG[product.status];

  return (
    <Link href={`/reports/${product.id}`} className="group block">
      <Card className="transition-colors hover:border-primary/50">
        <CardHeader className="pb-2">
          <CardTitle className="group-hover:text-primary text-base leading-snug">
            {product.name}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{product.brand}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{categoryLabel(product.category)}</Badge>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Score</span>
            <span className={`font-semibold ${scoreColor(product.score)}`}>
              {product.score}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Scanned {format(new Date(product.scanDate), 'MMM d, yyyy')}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
