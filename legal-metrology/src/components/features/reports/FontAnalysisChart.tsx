'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface FontMeasurement {
  field: string;
  estimated_height_mm: number;
  confidence: number;
  meets_requirement: boolean;
}

interface FontAnalysisChartProps {
  measurements: FontMeasurement[];
  packageWeightBucket?: string;
}

const THRESHOLDS: Record<string, number> = {
  '<=200': 1,
  '200-500': 2,
  '>500': 4,
};

export function FontAnalysisChart({ measurements, packageWeightBucket = '<=200' }: FontAnalysisChartProps) {
  const threshold = THRESHOLDS[packageWeightBucket] ?? 1;

  const data = measurements.map((m) => ({
    name: m.field.length > 20 ? m.field.slice(0, 18) + '...' : m.field,
    fullName: m.field,
    height: m.estimated_height_mm,
    meets: m.meets_requirement,
    confidence: Math.round(m.confidence * 100),
  }));

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center gap-4 text-xs text-muted-foreground">
        <span>Min required: {threshold}mm for {packageWeightBucket} tier</span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-green-500" /> Meets requirement
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-red-500" /> Below threshold
        </span>
      </div>
      <ResponsiveContainer width="100%" height={Math.max(200, data.length * 32)}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" domain={[0, 'auto']} unit="mm" tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(value, _name, props) => {
              const v = typeof value === 'number' ? value : Number(value);
              const p = props?.payload as { fullName: string; confidence: number } | undefined;
              return [`${v}mm (confidence: ${p?.confidence ?? 0}%)`, p?.fullName ?? ''];
            }}
          />
          <Bar dataKey="height" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.meets ? '#22c55e' : '#ef4444'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
