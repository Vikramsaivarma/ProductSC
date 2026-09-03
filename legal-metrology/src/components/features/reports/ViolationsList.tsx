'use client';

import { AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import type { Violation, Severity } from '@/types/domain';

interface ViolationsListProps {
  violations: Violation[];
}

const SEVERITY_CONFIG: Record<Severity, { label: string; badgeClass: string; borderClass: string }> = {
  critical: {
    label: 'Critical',
    badgeClass: 'bg-red-100 text-red-700 border-red-200',
    borderClass: 'border-l-red-500',
  },
  major: {
    label: 'Major',
    badgeClass: 'bg-orange-100 text-orange-700 border-orange-200',
    borderClass: 'border-l-orange-500',
  },
  minor: {
    label: 'Minor',
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
    borderClass: 'border-l-blue-500',
  },
};

const SEVERITY_ORDER: Severity[] = ['critical', 'major', 'minor'];

export function ViolationsList({ violations }: ViolationsListProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const grouped = SEVERITY_ORDER.map((severity) => ({
    severity,
    config: SEVERITY_CONFIG[severity],
    items: violations.filter((v) => v.severity === severity),
  })).filter((g) => g.items.length > 0);

  function toggle(ruleCode: string) {
    setExpanded((prev) => ({ ...prev, [ruleCode]: !prev[ruleCode] }));
  }

  if (violations.length === 0) {
    return (
      <div className="rounded-lg border bg-green-50 p-6 text-center text-green-700">
        No violations found — all checks passed.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {grouped.map(({ severity, config, items }) => (
        <div key={severity}>
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {config.label} ({items.length})
            </h3>
          </div>
          <div className="space-y-3">
            {items.map((v) => (
              <Card
                key={v.rule_code}
                className={`border-l-4 ${config.borderClass}`}
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between p-4 text-left"
                  onClick={() => toggle(v.rule_code)}
                >
                  <div className="flex items-center gap-3">
                    {expanded[v.rule_code] ? (
                      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <Badge variant="outline" className={config.badgeClass}>
                      {v.rule_code}
                    </Badge>
                    <CardTitle className="text-sm font-medium">{v.rule_title}</CardTitle>
                  </div>
                </button>
                {expanded[v.rule_code] && (
                  <CardContent className="border-t pt-4">
                    <dl className="grid gap-3 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-muted-foreground">Description</dt>
                        <dd className="mt-0.5">{v.rule_title}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Field</dt>
                        <dd className="mt-0.5 font-mono text-xs">{v.field}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Actual</dt>
                        <dd className="mt-0.5 text-red-600">
                          {v.actual ?? <span className="italic">Missing</span>}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Expected</dt>
                        <dd className="mt-0.5 text-green-600">{v.expected}</dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-muted-foreground">Suggestion</dt>
                        <dd className="mt-0.5">{v.suggestion}</dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-muted-foreground">Legal Reference</dt>
                        <dd className="mt-0.5 font-mono text-xs text-muted-foreground">
                          {v.rule_reference}
                        </dd>
                      </div>
                    </dl>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
