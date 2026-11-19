import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/rest\/v1\/?$/, "");
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);
export const supabase: SupabaseClient | null = isSupabaseConfigured ? createClient(url!, anonKey!, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }) : null;
