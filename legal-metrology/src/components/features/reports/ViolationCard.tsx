import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface Violation {
  rule_code: string;
  rule_title?: string;
  severity: string;
  field: string;
  actual: string | null;
  expected: string;
  suggestion?: string;
}

const SEVERITY_CONFIG: Record<string, { icon: typeof AlertTriangle; color: string; badgeClass: string }> = {
  critical: {
    icon: AlertTriangle,
    color: 'text-red-500',
    badgeClass: 'bg-red-100 text-red-700 border-red-200',
  },
  major: {
    icon: AlertCircle,
    color: 'text-orange-500',
    badgeClass: 'bg-orange-100 text-orange-700 border-orange-200',
  },
  minor: {
    icon: Info,
    color: 'text-blue-500',
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
  },
};

export function ViolationCard({ violation }: { violation: Violation }) {
  const config = SEVERITY_CONFIG[violation.severity] ?? SEVERITY_CONFIG.minor;
  const Icon = config.icon;

  return (
    <Card className="border-l-4 border-l-current" style={{ borderLeftColor: config.color.replace('text-', '') }}>
      <CardContent className="flex gap-3 p-4">
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${config.color}`} />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-[10px]">
              {violation.rule_code}
            </Badge>
            <Badge variant="outline" className={`text-[10px] ${config.badgeClass}`}>
              {violation.severity}
            </Badge>
            <span className="text-sm font-medium">{violation.field}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Expected:</span> {violation.expected}
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Actual:</span> {violation.actual ?? 'Missing'}
          </p>
          {violation.suggestion && (
            <p className="mt-1 text-xs text-blue-600">{violation.suggestion}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
