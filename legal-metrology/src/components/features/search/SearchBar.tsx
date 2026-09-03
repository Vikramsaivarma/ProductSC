'use client';

import { useRef, useCallback } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  loading?: boolean;
}

export function SearchBar({ value, onChange, loading }: SearchBarProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onChange(val);
      }, 300);
    },
    [onChange],
  );

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search by product name, brand, or keyword..."
        defaultValue={value}
        onChange={handleChange}
        className="pl-10 pr-10"
      />
      {loading && (
        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
      )}
    </div>
  );
}
