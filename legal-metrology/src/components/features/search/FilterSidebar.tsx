'use client';

import { Filter, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface Filters {
  category: string;
  status: string;
}

interface FilterSidebarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'food', label: 'Food' },
  { value: 'cosmetic', label: 'Cosmetic' },
  { value: 'personal_care', label: 'Personal Care' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'household', label: 'Household' },
  { value: 'other', label: 'Other' },
] as const;

const STATUSES = [
  { value: 'all', label: 'All Statuses' },
  { value: 'compliant', label: 'Compliant' },
  { value: 'partial', label: 'Partially Compliant' },
  { value: 'non_compliant', label: 'Non-Compliant' },
] as const;

export function FilterSidebar({ filters, onChange }: FilterSidebarProps) {
  const hasActiveFilters =
    filters.category !== 'all' || filters.status !== 'all';

  function updateFilter(key: keyof Filters, value: string) {
    onChange({ ...filters, [key]: value });
  }

  function clearFilters() {
    onChange({ category: 'all', status: 'all' });
  }

  return (
    <Card className="w-64 shrink-0">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={clearFilters}
            >
              <X className="mr-1 h-3 w-3" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={filters.category}
            onValueChange={(v) => updateFilter('category', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={filters.status}
            onValueChange={(v) => updateFilter('status', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
