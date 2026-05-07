import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, processLock, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabaseHost = supabaseUrl?.split("://", 2)?.[1]?.split("/", 1)?.[0] ?? null;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        flowType: "pkce",
        lock: processLock,
      },
    })
  : null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your mobile app environment."
    );
  }

  return supabase;
}

export function getSupabaseUrl() {
  return supabaseUrl ?? null;
}

export function getSupabaseAnonKey() {
  return supabaseAnonKey ?? null;
}

export function getSupabaseHost() {
  return supabaseHost;
}
