import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client (service role).
 *
 * Initialized lazily so that importing this module never throws at build /
 * page-data-collection time. The real client (and the env var check) is only
 * created the first time it is actually used at runtime.
 */
let cached: SupabaseClient | null = null;

function createSupabaseAdmin(): SupabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;

  // Prefer the new Supabase "secret key" (sb_secret_..., also injected by the
  // Vercel Marketplace integration as SUPABASE_SECRET_KEY); fall back to the
  // legacy service_role key for existing setups.
  const supabaseSecretKey =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SECRET_KEY / SUPABASE_SERVICE_ROLE_KEY in server environment."
    );
  }

  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: { persistSession: false },
  });
}

export function getSupabaseAdmin(): SupabaseClient {
  if (!cached) cached = createSupabaseAdmin();
  return cached;
}

/**
 * Backwards-compatible proxy: existing code can keep calling
 * `supabaseAdmin.from(...)`, `supabaseAdmin.storage...`, etc. The underlying
 * client is created on first property access rather than at module load.
 */
export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getSupabaseAdmin();
    const value = Reflect.get(client as object, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
