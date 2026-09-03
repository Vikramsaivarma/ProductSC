'use client';

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface ViolationsPieChartProps {
  compliant: number;
  partial: number;
  nonCompliant: number;
}

interface ViolatedRule {
  rule: string;
  count: number;
}

interface DashboardChartsProps {
  pieData: ViolationsPieChartProps;
  topViolatedRules: ViolatedRule[];
}

const PIE_COLORS: Record<string, string> = {
  Compliant: '#22c55e',
  Partial: '#eab308',
  'Non-Compliant': '#ef4444',
};

const BAR_COLOR = '#6366f1';

export function DashboardCharts({ pieData, topViolatedRules }: DashboardChartsProps) {
  const { compliant, partial, nonCompliant } = pieData;
  const total = compliant + partial + nonCompliant;

  const pieChartData = [
    { name: 'Compliant', value: compliant },
    { name: 'Partial', value: partial },
    { name: 'Non-Compliant', value: nonCompliant },
  ].filter((item) => item.value > 0);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Distribution</CardTitle>
          <CardDescription>Breakdown of scan results</CardDescription>
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
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieChartData.map((entry) => (
                    <Cell key={entry.name} fill={PIE_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Top Violated Rules</CardTitle>
          <CardDescription>Most frequently triggered compliance rules</CardDescription>
        </CardHeader>
        <CardContent>
          {topViolatedRules.length === 0 ? (
            <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
              No violations recorded yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={topViolatedRules}
                layout="vertical"
                margin={{ left: 20, right: 20 }}
              >
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="rule" width={140} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill={BAR_COLOR} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
