'use client';

import { Progress } from '@/components/ui/progress';

interface UploadProgressBarProps {
  value: number;
  label?: string;
}

export function UploadProgressBar({ value, label }: UploadProgressBarProps) {
  return (
    <div className="w-full space-y-2">
      {label && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-medium text-foreground">{Math.round(value)}%</span>
        </div>
      )}
      <Progress value={value} className="h-2" />
    </div>
  );
}
