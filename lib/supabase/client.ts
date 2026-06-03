import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser-side Supabase client (anon key).
 *
 * Initialized lazily via a proxy so importing this module never throws during
 * the server prerender pass of client components at build time. The env check
 * runs on first actual use.
 */
let cached: SupabaseClient | null = null;

function createSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  // Prefer the new publishable key (sb_publishable_..., also injected by the
  // Vercel Marketplace integration as NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  // fall back to the legacy anon key for existing setups.
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "Missing Supabase env vars. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)."
    );
  }

  return createClient(supabaseUrl, supabasePublishableKey);
}

export function getSupabase(): SupabaseClient {
  if (!cached) cached = createSupabaseClient();
  return cached;
}

export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getSupabase();
    const value = Reflect.get(client as object, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
