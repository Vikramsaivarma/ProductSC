// Generated from Supabase schema - run `pnpm generate-types` after migrations
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: 'admin' | 'officer' | 'viewer';
          organization: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: 'admin' | 'officer' | 'viewer';
          organization?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: 'admin' | 'officer' | 'viewer';
          organization?: string | null;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          brand: string | null;
          category: 'food' | 'cosmetic' | 'personal_care' | 'electronics' | 'household' | 'other';
          package_weight_bucket: '<=200' | '200-500' | '>500';
          image_urls: string[];
          uploaded_by: string;
          source: 'manual_upload' | 'dataset_import';
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          brand?: string | null;
          category: 'food' | 'cosmetic' | 'personal_care' | 'electronics' | 'household' | 'other';
          package_weight_bucket: '<=200' | '200-500' | '>500';
          image_urls?: string[];
          uploaded_by: string;
          source?: 'manual_upload' | 'dataset_import';
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          brand?: string | null;
          category?: 'food' | 'cosmetic' | 'personal_care' | 'electronics' | 'household' | 'other';
          package_weight_bucket?: '<=200' | '200-500' | '>500';
          image_urls?: string[];
          uploaded_by?: string;
          source?: 'manual_upload' | 'dataset_import';
          created_at?: string;
        };
      };
      extractions: {
        Row: {
          id: string;
          product_id: string;
          raw_ocr_text: string;
          structured_data: Json;
          font_analysis: Json | null;
          ai_suggestions: Json;
          model_used: string;
          confidence: number;
          tokens_used: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          raw_ocr_text: string;
          structured_data: Json;
          font_analysis?: Json | null;
          ai_suggestions?: Json;
          model_used?: string;
          confidence?: number;
          tokens_used?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          raw_ocr_text?: string;
          structured_data?: Json;
          font_analysis?: Json | null;
          ai_suggestions?: Json;
          model_used?: string;
          confidence?: number;
          tokens_used?: number;
          created_at?: string;
        };
      };
      compliance_reports: {
        Row: {
          id: string;
          product_id: string;
          extraction_id: string;
          overall_status: 'compliant' | 'partial' | 'non_compliant';
          compliance_score: number;
          violations: Json;
          passed_checks: Json;
          reviewed_by: string | null;
          reviewed_at: string | null;
          checked_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          extraction_id: string;
          overall_status: 'compliant' | 'partial' | 'non_compliant';
          compliance_score: number;
          violations?: Json;
          passed_checks?: Json;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          checked_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          extraction_id?: string;
          overall_status?: 'compliant' | 'partial' | 'non_compliant';
          compliance_score?: number;
          violations?: Json;
          passed_checks?: Json;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          checked_at?: string;
        };
      };
      rules: {
        Row: {
          id: string;
          rule_code: string;
          title: string;
          description: string;
          legal_reference: string;
          category: string;
          severity: 'critical' | 'major' | 'minor';
          validation_config: Json;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          rule_code: string;
          title: string;
          description: string;
          legal_reference: string;
          category: string;
          severity: 'critical' | 'major' | 'minor';
          validation_config?: Json;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          rule_code?: string;
          title?: string;
          description?: string;
          legal_reference?: string;
          category?: string;
          severity?: 'critical' | 'major' | 'minor';
          validation_config?: Json;
          is_active?: boolean;
        };
      };
      audit_log: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          entity_type: string;
          entity_id: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          entity_type: string;
          entity_id: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action?: string;
          entity_type?: string;
          entity_id?: string;
          metadata?: Json;
          created_at?: string;
        };
      };
      rate_limits: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          requested_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          endpoint: string;
          requested_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          endpoint?: string;
          requested_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      handle_new_user: {
        Args: Record<PropertyKey, never>;
        Returns: unknown;
      };
    };
    Enums: {
      user_role: 'admin' | 'officer' | 'viewer';
      product_category: 'food' | 'cosmetic' | 'personal_care' | 'electronics' | 'household' | 'other';
      weight_bucket: '<=200' | '200-500' | '>500';
      compliance_status: 'compliant' | 'partial' | 'non_compliant';
      severity: 'critical' | 'major' | 'minor';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}