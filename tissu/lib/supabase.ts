import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

export type ScanType = 'label' | 'url';

export interface ScanRecord {
  id?: string;
  user_id: string;
  type: ScanType;
  result_json: AnalysisResult;
  created_at?: string;
}

export interface WishlistItem {
  id?: string;
  user_id: string;
  item_data_json: ExploreItem;
  created_at?: string;
}

export interface AnalysisResult {
  productName?: string;
  brand?: string;
  price?: string;
  imageUrl?: string;
  fibers: { name: string; percentage: number }[];
  country?: string;
  care?: string[];
  rn?: string;
  fiberDescriptions: { name: string; description: string }[];
  durability: { score: number; summary: string; tags: string[] };
  sustainability: { score: number; summary: string; tags: string[] };
}

export interface ExploreItem {
  id: string;
  image: string;
  brand: string;
  name: string;
  price: string;
  link: string;
}

export interface ExploreEdit {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  tag: string;
  items: ExploreItem[];
}
