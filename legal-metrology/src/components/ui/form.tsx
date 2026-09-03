'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/cn';

const Form = React.createContext<{ form: Record<string, unknown> } | null>(null);

function FormProvider({ children, ...props }: { children: React.ReactNode; form: Record<string, unknown> }) {
  return <Form.Provider value={{ form: props.form }}>{children}</Form.Provider>;
}

function useFormContext() {
  const ctx = React.useContext(Form);
  if (!ctx) throw new Error('useFormContext must be used within <Form>');
  return ctx.form;
}

function FormItem({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('space-y-2', className)}>{children}</div>;
}

function FormLabel({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('text-sm font-medium', className)} {...props} />;
}

function FormControl({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function FormDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />;
}

interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  error?: string;
}

function FormMessage({ className, error }: FormMessageProps) {
  if (!error) return null;
  return <p className={cn('text-sm text-destructive', className)}>{error}</p>;
}

export { FormProvider, FormItem, FormLabel, FormControl, FormDescription, FormMessage, useFormContext };