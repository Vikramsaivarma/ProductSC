'use server';

import { createClient } from '@supabase/supabase-js';

interface TrackUsageParams {
  action: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  userId?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

export async function trackUsage(params: TrackUsageParams): Promise<void> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { error } = await supabase.from('audit_log').insert({
    ...(params.userId ? { user_id: params.userId } : {}),
    action: params.action,
    entity_type: 'gemini_api',
    entity_id: params.entityId ?? crypto.randomUUID(),
    metadata: {
      model: params.model,
      input_tokens: params.inputTokens,
      output_tokens: params.outputTokens,
      total_tokens: params.inputTokens + params.outputTokens,
      ...params.metadata,
    },
  });

  if (error) {
    console.error('Failed to track Gemini usage:', error.message);
  }
}
