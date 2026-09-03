import { createClient } from '@/lib/supabase/server';
import { RateLimitError } from '@/lib/errors';

/**
 * Sliding-window rate limiter backed by the `rate_limits` table.
 * Each request row records (user_id, endpoint, requested_at). Within a window
 * we count rows newer than `windowSec` ago; if >= limit, reject.
 */
export async function checkRateLimit(
  userId: string,
  endpoint: string,
  limit: number,
  windowSec: number
): Promise<void> {
  const supabase = await createClient();
  const cutoff = new Date(Date.now() - windowSec * 1000).toISOString();

  // Count existing requests in the window (excluding the one we're about to add).
  const { count, error: countError } = await supabase
    .from('rate_limits')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('endpoint', endpoint)
    .gte('requested_at', cutoff);

  if (countError) {
    console.warn('Rate limit count failed, allowing request:', countError);
    return;
  }

  if ((count ?? 0) >= limit) {
    throw new RateLimitError(
      `Too many requests for ${endpoint}. Try again later.`,
      windowSec
    );
  }

  // Record this request.
  const { error: insertError } = await supabase
    .from('rate_limits')
    .insert({ user_id: userId, endpoint });

  if (insertError) {
    console.warn('Rate limit record insert failed:', insertError);
  }
}