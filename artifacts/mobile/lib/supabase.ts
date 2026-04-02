import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          device_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          device_id: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      formulas: {
        Row: {
          id: string;
          device_id: string;
          product_type: string;
          product_name: string;
          tagline: string;
          data: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          device_id: string;
          product_type: string;
          product_name: string;
          tagline: string;
          data: any;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          formula_id: string;
          device_id: string;
          status: string;
          total_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          formula_id: string;
          device_id: string;
          status: string;
          total_price: number;
          created_at?: string;
        };
      };
    };
  };
};
