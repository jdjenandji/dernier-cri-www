import { createClient } from "@supabase/supabase-js";
import type { Station } from "@/types/station";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

// Create client with placeholder values for build time
// Runtime errors will occur if actual credentials are not provided
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Database {
  public: {
    Tables: {
      stations: {
        Row: Station;
        Insert: Omit<Station, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Station, "id" | "created_at" | "updated_at">>;
      };
    };
  };
}
