import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public, read-only merchant profile (contact + payment + social links).
 * Served from the server so the public site never depends on browser-side
 * Supabase env vars. All returned fields are already shown publicly on the site.
 */
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("merchant_profile")
      .select("*")
      .order("updated_at", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { ok: true, profile: data ?? null },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to load merchant profile" },
      { status: 500 }
    );
  }
}
