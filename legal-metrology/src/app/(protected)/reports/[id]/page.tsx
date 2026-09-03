'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScoreGauge } from '@/components/features/reports/ScoreGauge';
import { DeclarationsTable } from '@/components/features/reports/DeclarationsTable';
import { ViolationsList } from '@/components/features/reports/ViolationsList';
import { generateReportPDF } from '@/lib/pdf/generateReport';
import type { ComplianceReport, ProductRecord, ExtractionRecord, Status } from '@/types/domain';

const STATUS_CONFIG: Record<Status, { label: string; badgeClass: string }> = {
  compliant: { label: 'Compliant', badgeClass: 'bg-green-100 text-green-700 border-green-200' },
  partial: { label: 'Partially Compliant', badgeClass: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  non_compliant: { label: 'Non-Compliant', badgeClass: 'bg-red-100 text-red-700 border-red-200' },
};

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<ProductRecord | null>(null);
  const [extraction, setExtraction] = useState<ExtractionRecord | null>(null);
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch(`/api/reports/${id}`);
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error ?? `HTTP ${res.status}`);
        }
        const data = await res.json();
        setProduct(data.product);
        setExtraction(data.extraction);
        setReport(data.report);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load report');
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [id]);

  async function handleDownloadPDF() {
    if (!report || !product) return;
    setDownloading(true);
    try {
      await generateReportPDF({ report, product, extraction });
    } catch (e) {
      console.error('PDF generation failed:', e);
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return null;
  }

  if (error || !report || !product) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-lg font-medium text-muted-foreground">
              {error ?? 'Report not found'}
            </p>
            <Button variant="outline" className="mt-4" onClick={() => router.push('/reports')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = STATUS_CONFIG[report.overall_status];
  const declarations = extraction?.structured_data;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 text-muted-foreground"
          onClick={() => router.push('/reports')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Reports
        </Button>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle className="text-xl">{product.name}</CardTitle>
              {product.brand && (
                <Badge variant="secondary" className="text-xs">
                  {product.brand}
                </Badge>
              )}
              <Badge variant="outline" className="text-xs capitalize">
                {product.category.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className={status.badgeClass}>
                {status.label}
              </Badge>
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Compliance Score</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ScoreGauge score={report.compliance_score} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Report Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Status</dt>
                <dd className="font-medium">{status.label}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Score</dt>
                <dd className="font-medium">{report.compliance_score} / 100</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Violations</dt>
                <dd className="font-medium">{report.violations.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Passed Checks</dt>
                <dd className="font-medium">{report.passed_checks.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Checked At</dt>
                <dd className="font-medium">
                  {new Date(report.checked_at).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleDownloadPDF} disabled={downloading}>
          <Download className="mr-2 h-4 w-4" />
          {downloading ? 'Generating...' : 'Download PDF'}
        </Button>
      </div>

      {declarations && (
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Declarations Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <DeclarationsTable declarations={declarations} />
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Violations ({report.violations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ViolationsList violations={report.violations} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
