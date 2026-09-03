'use client';

import { CheckCircle, XCircle } from 'lucide-react';
import type { StructuredDeclarations } from '@/types/domain';

interface DeclarationsTableProps {
  declarations: StructuredDeclarations;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '';
  if (typeof value === 'object') {
    if ('value' in value && 'unit' in value) {
      return `${(value as { value: number; unit: string }).value} ${(value as { value: number; unit: string }).unit}`;
    }
    if ('value' in value && 'currency' in value) {
      const v = value as { value: number; currency: string; raw_string?: string };
      return v.raw_string ?? `${v.currency} ${v.value}`;
    }
    if ('month' in value && 'year' in value) {
      const v = value as { month: number; year: number };
      return `${String(v.month).padStart(2, '0')}/${v.year}`;
    }
    if ('name' in value) {
      const v = value as { name: string; phone?: string; email?: string };
      const parts = [v.name];
      if (v.phone) parts.push(v.phone);
      if (v.email) parts.push(v.email);
      return parts.join(', ');
    }
    return JSON.stringify(value);
  }
  return String(value);
}

const DECLARATION_FIELDS: { key: string; label: string }[] = [
  { key: 'manufacturer_name', label: 'Manufacturer' },
  { key: 'common_or_generic_name', label: 'Common Name' },
  { key: 'net_quantity', label: 'Net Quantity' },
  { key: 'mrp', label: 'MRP' },
  { key: 'mfg_date', label: 'Mfg Date' },
  { key: 'consumer_care', label: 'Consumer Care' },
  { key: 'country_of_origin', label: 'Country of Origin' },
  { key: 'unit_sale_price', label: 'Unit Price' },
];

export function DeclarationsTable({ declarations }: DeclarationsTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="w-1/3 px-4 py-3 text-left font-semibold">Declaration Field</th>
            <th className="px-4 py-3 text-left font-semibold">Extracted Value</th>
            <th className="w-16 px-4 py-3 text-center font-semibold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {DECLARATION_FIELDS.map(({ key, label }) => {
            const raw = (declarations as unknown as Record<string, unknown>)[key];
            const isPresent = raw !== null && raw !== undefined && raw !== '';
            const value = formatValue(raw);

            return (
              <tr key={key}>
                <td className="px-4 py-3 font-medium">{label}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {value || <span className="italic text-muted-foreground/50">Not found</span>}
                </td>
                <td className="px-4 py-3 text-center">
                  {isPresent ? (
                    <CheckCircle className="mx-auto h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="mx-auto h-5 w-5 text-red-500" />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
