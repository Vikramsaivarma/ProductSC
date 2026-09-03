'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface ViolationsPieChartProps {
  compliant: number;
  partial: number;
  nonCompliant: number;
}

const COLORS: Record<string, string> = {
  Compliant: '#22c55e',
  Partial: '#eab308',
  'Non-Compliant': '#ef4444',
};

export function ViolationsPieChart({ compliant, partial, nonCompliant }: ViolationsPieChartProps) {
  const data = [
    { name: 'Compliant', value: compliant },
    { name: 'Partial', value: partial },
    { name: 'Non-Compliant', value: nonCompliant },
  ].filter((item) => item.value > 0);

  const total = compliant + partial + nonCompliant;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance Distribution</CardTitle>
        <CardDescription>Breakdown of scan results across all products</CardDescription>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            No scan data available yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
