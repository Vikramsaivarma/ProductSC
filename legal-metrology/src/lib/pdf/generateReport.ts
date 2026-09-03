'use client';

import type jsPDF from 'jspdf';
import type { StructuredDeclarations } from '@/types/domain';

interface ReportPDFData {
  report: {
    id: string;
    overall_status: string;
    compliance_score: number;
    violations: Array<{
      rule_code: string;
      rule_title: string;
      severity: string;
      field: string;
      actual: string | null;
      expected: string;
      suggestion: string;
    }>;
    checked_at: string;
  };
  product: {
    id: string;
    name: string;
    brand: string | null;
    category: string;
    created_at: string;
  };
  extraction: {
    structured_data: StructuredDeclarations;
  } | null;
}

function addHeader(doc: jsPDF) {
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(24, 24, 27);
  doc.rect(0, 0, pageWidth, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Legal Metrology Compliance Report', 14, 14);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Ministry of Consumer Affairs, Food & Public Distribution', 14, 21);
  doc.text('Government of India — Legal Metrology (Packaged Commodities) Rules, 2011', 14, 27);

  doc.setFontSize(7);
  doc.text('CONFIDENTIAL', pageWidth - 14, 14, { align: 'right' });

  return 38;
}

function addFooter(doc: jsPDF, reportId: string) {
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setDrawColor(200, 200, 200);
  doc.line(14, pageHeight - 20, pageWidth - 14, pageHeight - 20);

  doc.setFontSize(7);
  doc.setTextColor(128, 128, 128);
  doc.text(`Report ID: ${reportId}`, 14, pageHeight - 14);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 14, pageHeight - 10);
  doc.text(
    'Disclaimer: This report is auto-generated and does not constitute legal advice.',
    pageWidth / 2,
    pageHeight - 14,
    { align: 'center' }
  );
}

function addSectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFillColor(230, 230, 235);
  doc.rect(14, y - 5, doc.internal.pageSize.getWidth() - 28, 9, 'F');
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, y + 1);
  return y + 12;
}

function formatFieldValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return 'N/A';
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if ('value' in obj && 'unit' in obj) {
      return `${obj.value} ${obj.unit}`;
    }
    if ('value' in obj && 'currency' in obj) {
      return obj.raw_string ? String(obj.raw_string) : `${obj.currency} ${obj.value}`;
    }
    if ('month' in obj && 'year' in obj) {
      return `${String(obj.month).padStart(2, '0')}/${obj.year}`;
    }
    if ('name' in obj) {
      const parts = [String(obj.name)];
      if (obj.phone) parts.push(String(obj.phone));
      if (obj.email) parts.push(String(obj.email));
      return parts.join(', ');
    }
    return JSON.stringify(value);
  }
  return String(value);
}

export async function generateReportPDF(data: ReportPDFData) {
  const jsPDFModule = await import('jspdf');
  const JsPDF = jsPDFModule.default;
  const autoTableModule = await import('jspdf-autotable');
  const autoTable = autoTableModule.default;

  const doc = new JsPDF('p', 'mm', 'a4');

  let y = addHeader(doc);

  // Product details
  y = addSectionTitle(doc, 'Product Details', y);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);

  const productInfo: [string, string][] = [
    ['Product Name', data.product.name],
    ['Brand', data.product.brand ?? 'N/A'],
    ['Category', data.product.category.replace('_', ' ').toUpperCase()],
    ['Date Added', new Date(data.product.created_at).toLocaleDateString('en-IN')],
  ];

  productInfo.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 60, y);
    y += 6;
  });

  y += 4;

  // Compliance summary
  y = addSectionTitle(doc, 'Compliance Summary', y);

  const statusColors: Record<string, [number, number, number]> = {
    compliant: [22, 163, 74],
    partial: [234, 179, 8],
    non_compliant: [220, 38, 38],
  };

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Score: ${data.report.compliance_score} / 100`, 14, y);

  const statusLabel =
    data.report.overall_status === 'compliant'
      ? 'COMPLIANT'
      : data.report.overall_status === 'partial'
        ? 'PARTIALLY COMPLIANT'
        : 'NON-COMPLIANT';

  const [r, g, b] = statusColors[data.report.overall_status] ?? [128, 128, 128];
  doc.setFillColor(r, g, b);
  doc.roundedRect(120, y - 6, 50, 8, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(statusLabel, 145, y - 1, { align: 'center' });

  y += 10;

  // Declarations table
  const declarations = data.extraction?.structured_data;
  if (declarations) {
    y = addSectionTitle(doc, 'Declarations Checklist', y);

    const declarationFields: [string, string][] = [
      ['Manufacturer', formatFieldValue(declarations.manufacturer_name)],
      ['Common Name', formatFieldValue(declarations.common_or_generic_name)],
      ['Net Quantity', formatFieldValue(declarations.net_quantity)],
      ['MRP', formatFieldValue(declarations.mrp)],
      ['Mfg Date', formatFieldValue(declarations.mfg_date)],
      ['Consumer Care', formatFieldValue(declarations.consumer_care)],
      ['Country of Origin', formatFieldValue(declarations.country_of_origin)],
      ['Unit Price', formatFieldValue(declarations.unit_sale_price)],
    ];

    autoTable(doc, {
      startY: y,
      head: [['Field', 'Value', 'Status']],
      body: declarationFields.map(([field, value]) => [
        field,
        value,
        value !== 'N/A' ? 'Present' : 'Missing',
      ]),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: {
        fillColor: [24, 24, 27],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 40, fontStyle: 'bold' },
        2: { cellWidth: 25, halign: 'center' },
      },
      alternateRowStyles: { fillColor: [248, 248, 250] },
    });

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  }

  // Violations table
  if (data.report.violations.length > 0) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    y = addSectionTitle(doc, 'Violations', y);

    const severityOrder = { critical: 0, major: 1, minor: 2 };
    const sorted = [...data.report.violations].sort(
      (a, b) =>
        (severityOrder[a.severity as keyof typeof severityOrder] ?? 3) -
        (severityOrder[b.severity as keyof typeof severityOrder] ?? 3)
    );

    autoTable(doc, {
      startY: y,
      head: [['Code', 'Severity', 'Field', 'Expected', 'Actual']],
      body: sorted.map((v) => [
        v.rule_code,
        v.severity.toUpperCase(),
        v.field,
        v.expected,
        v.actual ?? 'Missing',
      ]),
      styles: { fontSize: 7, cellPadding: 2.5 },
      headStyles: {
        fillColor: [24, 24, 27],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 18 },
        1: { cellWidth: 18, halign: 'center' },
        4: { cellWidth: 35 },
      },
      alternateRowStyles: { fillColor: [248, 248, 250] },
      didParseCell: (hookData) => {
        if (hookData.section === 'body' && hookData.column.index === 1) {
          const severity = String(hookData.cell.raw).toLowerCase();
          if (severity === 'critical') hookData.cell.styles.textColor = [220, 38, 38];
          else if (severity === 'major') hookData.cell.styles.textColor = [234, 88, 12];
          else hookData.cell.styles.textColor = [37, 99, 235];
        }
      },
    });
  }

  addFooter(doc, data.report.id);

  doc.save(`compliance-report-${data.product.name.replace(/\s+/g, '-')}-${data.report.id.slice(0, 8)}.pdf`);
}
