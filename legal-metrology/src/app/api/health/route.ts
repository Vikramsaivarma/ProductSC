import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  let dbConnected = false;
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const client = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
      );
      const { error } = await client.from('profiles').select('id').limit(1);
      dbConnected = !error;
    }
  } catch {
    dbConnected = false;
  }

  return NextResponse.json({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    dbConnected,
  });
}