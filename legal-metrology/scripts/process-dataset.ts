/**
 * Offline dataset ingestion processor.
 *
 * Reads subfolders of /data/ (each subfolder = one product with its images),
 * optionally a metadata.json per product folder, then for each product:
 *   upload -> insert product -> Gemini pipeline -> rule engine -> insert extraction + report.
 *
 * Usage: npm run process-dataset [-- --data <dir>] [-- --dry]
 *
 * - Idempotent: skips a product if a product with matching (name, brand) already exists.
 * - Resumable: writes processed ids to .processed.json in the data dir.
 * - Rate-limit aware: sleeps ~4s between Gemini pipeline calls (respects 15 RPM free tier).
 * - Failure handling: logs to <data>/failures.jsonl.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { readdir, readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { runAnalysisPipeline } from '../src/lib/gemini/pipeline';
import { validateExtraction } from '../src/lib/rules/validator';

// Minimal .env.local loader (Next.js loads it automatically; tsx scripts do not).
async function loadEnvLocal(): Promise<void> {
  const p = path.resolve(process.cwd(), '.env.local');
  try {
    const content = await readFile(p, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
      if (process.env[key] === undefined) process.env[key] = value;
    }
  } catch {
    // .env.local absent; rely on shell env.
  }
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STATE_FILE = '.processed.json';
const FAILURES_FILE = 'failures.jsonl';
const GEMINI_RATE_LIMIT_MS = 4000; // ~15 RPM free tier

function resolveEnv(name: string): string {
  const val = process.env[name];
  if (!val) {
    console.error(`Missing required env var: ${name}. Add it to .env.local or the shell.`);
    process.exit(1);
  }
  return val;
}

function createSupabase(): SupabaseClient {
  const url = resolveEnv('NEXT_PUBLIC_SUPABASE_URL');
  const anon = resolveEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  return createClient(url, anon);
}

interface ProductMetadata {
  name?: string;
  brand?: string;
  category?: string;
  package_weight_bucket?: string;
}

interface ProcessedState {
  ids: string[];
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function readJson<T>(p: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(p, 'utf-8')) as T;
  } catch {
    return fallback;
  }
}

async function listProductDirs(dataDir: string): Promise<string[]> {
  const entries = await readdir(dataDir, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory())
    .map((e) => path.join(dataDir, e.name));
}

async function findImages(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const exts = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp']);
  return entries
    .filter((e) => e.isFile() && exts.has(path.extname(e.name).toLowerCase()))
    .map((e) => path.join(dir, e.name));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function uploadImages(client: SupabaseClient, dir: string): Promise<string[]> {
  const imagePaths = await findImages(dir);
  const urls: string[] = [];
  for (let i = 0; i < imagePaths.length; i++) {
    const file = imagePaths[i];
    const data = await readFile(file);
    const { data: uploaded, error } = await client.storage
      .from('product-images')
      .upload(`dataset/${Date.now()}-${i}-${path.basename(file)}`, data, {
        contentType: undefined,
        upsert: true,
      });
    if (error) {
      console.warn(`  ! failed to upload ${path.basename(file)}: ${error.message}`);
      continue;
    }
    const { data: publicUrl } = client.storage.from('product-images').getPublicUrl(uploaded!.path);
    urls.push(publicUrl.publicUrl);
  }
  return urls;
}

async function productExists(client: SupabaseClient, name: string, brand: string | null): Promise<boolean> {
  let query = client.from('products').select('id').eq('name', name).limit(1);
  if (brand) query = query.eq('brand', brand);
  const { count } = await query;
  return (count ?? 0) > 0;
}

async function processProduct(
  client: SupabaseClient,
  dir: string,
  opts: { dry: boolean }
): Promise<string | null> {
  const base = path.basename(dir);
  const meta = await readJson<ProductMetadata>(path.join(dir, 'metadata.json'), {});

  const name = meta.name ?? base.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const brand = meta.brand ?? null;
  const category = meta.category ?? 'other';
  const bucket = meta.package_weight_bucket ?? '<=200';

  if (await productExists(client, name, brand)) {
    console.log(`skipping "${name}" (already exists)`);
    return null;
  }

  console.log(`processing "${name}" (${base})`);

  const imageUrls = await uploadImages(client, dir);
  if (imageUrls.length === 0) {
    console.warn(`  ! no images uploaded for ${base}`);
    return null;
  }

  if (opts.dry) {
    console.log(`  [dry] uploaded ${imageUrls.length} image(s); would run analysis`);
    return null;
  }

  const { data: product, error: productError } = await client
    .from('products')
    .insert({
      name,
      brand,
      category,
      package_weight_bucket: bucket,
      image_urls: imageUrls,
      uploaded_by: process.env.DATASET_USER_ID,
      source: 'dataset_import',
    })
    .select('id')
    .single();

  if (productError || !product) {
    throw new Error(`insert product failed: ${productError?.message ?? 'no row'}`);
  }

  const pipelineResult = await runAnalysisPipeline({
    imageUrls,
    packageWeightBucket: bucket,
  });

  if (!pipelineResult.structured) {
    throw new Error(`analysis returned no structured extraction for ${base}`);
  }

  const extractionResult = validateExtraction({
    structured_data: pipelineResult.structured,
    font_analysis: pipelineResult.fontAnalysis,
    package_weight_bucket: bucket,
    category,
  });

  const { data: extraction, error: extractionError } = await client
    .from('extractions')
    .insert({
      product_id: product.id,
      raw_ocr_text: '',
      structured_data: pipelineResult.structured,
      font_analysis: pipelineResult.fontAnalysis,
      ai_suggestions: pipelineResult.suggestions,
      model_used: 'gemini-2.0-flash-exp',
      confidence: pipelineResult.structured.confidence ?? 0,
      tokens_used: pipelineResult.tokensUsed,
    })
    .select('id')
    .single();

  if (extractionError || !extraction) {
    throw new Error(`insert extraction failed: ${extractionError?.message ?? 'no row'}`);
  }

  const { error: reportError } = await client.from('compliance_reports').insert({
    product_id: product.id,
    extraction_id: extraction.id,
    overall_status: extractionResult.overall_status,
    compliance_score: extractionResult.compliance_score,
    violations: extractionResult.violations,
    passed_checks: extractionResult.passed_checks,
  });

  if (reportError) {
    throw new Error(`insert report failed: ${reportError.message}`);
  }

  console.log(`  done: ${name} -> ${extractionResult.overall_status} (${extractionResult.compliance_score})`);
  return product.id;
}

async function main(): Promise<void> {
  await loadEnvLocal();
  const argv = process.argv.slice(2);
  const dataDirArg = argv[argv.indexOf('--data') + 1];
  const dry = argv.includes('--dry');
  const dataDir = dataDirArg ? path.resolve(process.cwd(), dataDirArg) : DATA_DIR;

  if (!(await fileExists(dataDir))) {
    console.error(`Data dir not found: ${dataDir}. Place product subfolders there.`);
    process.exit(1);
  }

  const client = createSupabase();
  const state = await readJson<ProcessedState>(path.join(dataDir, STATE_FILE), { ids: [] });
  const failed: string[] = [];

  const dirs = await listProductDirs(dataDir);
  console.log(`Found ${dirs.length} product folder(s) in ${dataDir}`);

  for (const dir of dirs) {
    const base = path.basename(dir);
    // Resumable: skip already-processed ids (if product id persisted).
    if (state.ids.includes(dir)) {
      console.log(`already processed, skipping "${base}"`);
      continue;
    }
    try {
      const id = await processProduct(client, dir, { dry });
      if (id) {
        state.ids.push(dir);
        await writeFile(path.join(dataDir, STATE_FILE), JSON.stringify(state, null, 2));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ error on "${base}": ${msg}`);
      failed.push(base);
      await writeFile(path.join(dataDir, FAILURES_FILE), `${JSON.stringify({ ts: new Date().toISOString(), dir: base, error: msg })}\n`, { flag: 'a' });
    }
    // Respect Gemini free-tier rate limit between pipeline runs.
    await sleep(GEMINI_RATE_LIMIT_MS);
  }

  console.log(`\nDone. ${failed.length > 0 ? `Failures: ${failed.join(', ')}` : 'no failures.'}`);
  if (dry) console.log('Ran in dry mode — no analysis was performed.');
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});