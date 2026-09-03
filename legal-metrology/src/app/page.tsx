'use client';

import Link from 'next/link';
import { Shield, ScanLine, FileText, BarChart3, ArrowRight, Scale } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: ScanLine,
      title: 'AI-Powered Scan',
      description: 'Upload label images and let Gemini Vision extract all mandatory declarations with high accuracy.',
    },
    {
      icon: Shield,
      title: 'Rule Validation',
      description: 'Automated checks against all 12 Legal Metrology (Packaged Commodities) Rules 2011.',
    },
    {
      icon: FileText,
      title: 'Official PDF Reports',
      description: 'Generate government-styled compliance reports with evidence, violations, and QR verification.',
    },
    {
      icon: BarChart3,
      title: 'Enforcement Dashboard',
      description: 'Real-time analytics on compliance rates, top violations, and officer performance.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
              <Scale className="h-4 w-4" />
              <span>SIH 2024 · Problem Statement 26034</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
              Legal Metrology Compliance Checker
            </h1>
            <p className="mx-auto max-w-2xl text-lg sm:text-xl text-muted-foreground mb-10">
              An AI-powered web app for enforcement officers to verify packaged commodity labels
              against the Legal Metrology (Packaged Commodities) Rules, 2011. Built with Next.js 14,
              Supabase, and Google Gemini Vision.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-input bg-background px-6 py-3 text-sm font-semibold hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-28 bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
              Built for Enforcement Teams
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Everything you need to scan, validate, and report on packaged commodity compliance.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-6">
                The Problem: Manual Label Verification is Slow & Error-Prone
              </h2>
              <ul className="space-y-4 text-lg text-muted-foreground">
                <li className="flex items-start gap-3">
                  <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span>Officers manually check 12+ mandatory declarations per package</span>
                </li>
                <li className="flex items-start gap-3">
                  <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span>Font size requirements (Rule 9) are nearly impossible to verify visually</span>
                </li>
                <li className="flex items-start gap-3">
                  <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span>No standardized reporting format for court-admissible evidence</span>
                </li>
                <li className="flex items-start gap-3">
                  <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span>Limited traceability and analytics across enforcement zones</span>
                </li>
              </ul>
            </div>
            <div className="rounded-xl border bg-card p-8">
              <h3 className="text-xl font-semibold text-foreground mb-4">Our Solution</h3>
              <div className="space-y-4 text-muted-foreground">
                <p>Upload a label photo → AI extracts all declarations → Rule engine validates each field → Instant compliance score & PDF report.</p>
                <div className="rounded-lg bg-primary/5 p-4 border border-primary/20">
                  <p className="font-medium text-primary">✓ Free tier compatible</p>
                  <p className="text-sm mt-1">Runs on Gemini 2.0 Flash free tier (15 RPM, 1M TPM)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
            Ready to Streamline Compliance Checks?
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Join enforcement officers across India using AI to verify packaged commodities faster and more accurately.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-foreground px-8 py-3 text-base font-semibold text-primary hover:bg-primary-foreground/90 transition-colors"
          >
            Start Free
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Legal Metrology Compliance Checker · Built for SIH 2024
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Documentation</a>
              <a href="#" className="hover:text-foreground transition-colors">API Reference</a>
              <a href="#" className="hover:text-foreground transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}