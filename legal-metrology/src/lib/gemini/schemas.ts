import { z } from 'zod';
import { SchemaType, type ResponseSchema } from '@google/generative-ai';

export const NetQuantitySchema = z.object({
  value: z.number(),
  unit: z.enum(['g', 'kg', 'ml', 'l', 'cm', 'm', 'piece']),
});

export const MRPSchema = z.object({
  value: z.number(),
  currency: z.enum(['INR']),
  inclusive_of_taxes_declared: z.boolean(),
  raw_string: z.string(),
});

export const MfgDateSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
  raw: z.string(),
});

export const ConsumerCareSchema = z.object({
  name: z.string(),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
});

export const ExtractionResponseSchema = z.object({
  manufacturer_name: z.string().nullable(),
  manufacturer_address: z.string().nullable(),
  packer_name: z.string().nullable(),
  importer_name_address: z.string().nullable(),
  common_or_generic_name: z.string().nullable(),
  net_quantity: NetQuantitySchema.nullable(),
  mrp: MRPSchema.nullable(),
  mfg_date: MfgDateSchema.nullable(),
  expiry_or_best_before: z.string().nullable(),
  consumer_care: ConsumerCareSchema.nullable(),
  country_of_origin: z.string().nullable(),
  unit_sale_price: z.string().nullable(),
  batch_number: z.string().nullable(),
  fssai_number: z.string().nullable(),
  declarations_visible_on_pdp: z.array(z.string()),
  suspicious_elements: z.array(z.string()),
  confidence: z.number().min(0).max(1),
});

export const TextMeasurementSchema = z.object({
  field: z.string(),
  estimated_height_mm: z.number(),
  confidence: z.number().min(0).max(1),
  meets_requirement: z.boolean(),
});

export const FontAnalysisResponseSchema = z.object({
  text_measurements: z.array(TextMeasurementSchema),
  contrast_assessment: z.enum(['good', 'acceptable', 'poor']),
  readability_score: z.number().min(0).max(1),
  notes: z.string(),
});

export const SuggestionsResponseSchema = z.record(z.string(), z.string());

export type ExtractionResponse = z.infer<typeof ExtractionResponseSchema>;
export type FontAnalysisResponse = z.infer<typeof FontAnalysisResponseSchema>;
export type SuggestionsResponse = z.infer<typeof SuggestionsResponseSchema>;

const EXTRACTION_GEMINI_SCHEMA: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    manufacturer_name: { type: SchemaType.STRING, nullable: true },
    manufacturer_address: { type: SchemaType.STRING, nullable: true },
    packer_name: { type: SchemaType.STRING, nullable: true },
    importer_name_address: { type: SchemaType.STRING, nullable: true },
    common_or_generic_name: { type: SchemaType.STRING, nullable: true },
    net_quantity: {
      type: SchemaType.OBJECT,
      nullable: true,
      properties: {
        value: { type: SchemaType.NUMBER },
        unit: { type: SchemaType.STRING, format: 'enum' as const, enum: ['g', 'kg', 'ml', 'l', 'cm', 'm', 'piece'] },
      },
      required: ['value', 'unit'],
    },
    mrp: {
      type: SchemaType.OBJECT,
      nullable: true,
      properties: {
        value: { type: SchemaType.NUMBER },
        currency: { type: SchemaType.STRING, format: 'enum' as const, enum: ['INR'] },
        inclusive_of_taxes_declared: { type: SchemaType.BOOLEAN },
        raw_string: { type: SchemaType.STRING },
      },
      required: ['value', 'currency', 'inclusive_of_taxes_declared', 'raw_string'],
    },
    mfg_date: {
      type: SchemaType.OBJECT,
      nullable: true,
      properties: {
        month: { type: SchemaType.INTEGER },
        year: { type: SchemaType.INTEGER },
        raw: { type: SchemaType.STRING },
      },
      required: ['month', 'year', 'raw'],
    },
    expiry_or_best_before: { type: SchemaType.STRING, nullable: true },
    consumer_care: {
      type: SchemaType.OBJECT,
      nullable: true,
      properties: {
        name: { type: SchemaType.STRING },
        phone: { type: SchemaType.STRING, nullable: true },
        email: { type: SchemaType.STRING, nullable: true },
        address: { type: SchemaType.STRING, nullable: true },
      },
      required: ['name'],
    },
    country_of_origin: { type: SchemaType.STRING, nullable: true },
    unit_sale_price: { type: SchemaType.STRING, nullable: true },
    batch_number: { type: SchemaType.STRING, nullable: true },
    fssai_number: { type: SchemaType.STRING, nullable: true },
    declarations_visible_on_pdp: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    suspicious_elements: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    confidence: { type: SchemaType.NUMBER },
  },
  required: [
    'manufacturer_name', 'manufacturer_address', 'packer_name',
    'importer_name_address', 'common_or_generic_name', 'net_quantity',
    'mrp', 'mfg_date', 'expiry_or_best_before', 'consumer_care',
    'country_of_origin', 'unit_sale_price', 'batch_number',
    'fssai_number', 'declarations_visible_on_pdp', 'suspicious_elements',
    'confidence',
  ],
};

const FONT_ANALYSIS_GEMINI_SCHEMA: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    text_measurements: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          field: { type: SchemaType.STRING },
          estimated_height_mm: { type: SchemaType.NUMBER },
          confidence: { type: SchemaType.NUMBER },
          meets_requirement: { type: SchemaType.BOOLEAN },
        },
        required: ['field', 'estimated_height_mm', 'confidence', 'meets_requirement'],
      },
    },
    contrast_assessment: { type: SchemaType.STRING, format: 'enum' as const, enum: ['good', 'acceptable', 'poor'] },
    readability_score: { type: SchemaType.NUMBER },
    notes: { type: SchemaType.STRING },
  },
  required: ['text_measurements', 'contrast_assessment', 'readability_score', 'notes'],
};

const SUGGESTIONS_GEMINI_SCHEMA: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {},
};

export const GEMINI_SCHEMAS = {
  EXTRACTION: EXTRACTION_GEMINI_SCHEMA,
  FONT_ANALYSIS: FONT_ANALYSIS_GEMINI_SCHEMA,
  SUGGESTIONS: SUGGESTIONS_GEMINI_SCHEMA,
} as const;
