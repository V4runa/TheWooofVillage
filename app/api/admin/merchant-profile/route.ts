import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";

export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    const { data, error } = await supabaseAdmin
      .from("merchant_profile")
      .select("*")
      .order("updated_at", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, profile: data ?? null });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Load merchant profile failed" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    const body = await req.json();

    // Load current (single-tenant pattern)
    const { data: existing, error: findErr } = await supabaseAdmin
      .from("merchant_profile")
      .select("*")
      .order("updated_at", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (findErr) return NextResponse.json({ error: findErr.message }, { status: 500 });

    const patch: Record<string, any> = {};

    const setStr = (key: string) => {
      if (typeof body?.[key] === "string") patch[key] = body[key].trim() || null;
    };

    // Strings
    setStr("display_name");
    setStr("tagline");
    setStr("about");
    setStr("instagram_url");
    setStr("facebook_url");
    setStr("tiktok_url");
    setStr("venmo_url");
    setStr("cashapp_url");
    setStr("paypal_url");
    setStr("zelle_recipient");
    setStr("phone");

    patch.updated_at = new Date().toISOString();

    // If no fields present, just return current
    if (Object.keys(patch).length <= 1 && existing) {
      return NextResponse.json({ ok: true, profile: existing });
    }

    if (existing?.id) {
      const { data: updated, error: upErr } = await supabaseAdmin
        .from("merchant_profile")
        .update(patch)
        .eq("id", existing.id)
        .select("*")
        .single();

      if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });
      return NextResponse.json({ ok: true, profile: updated });
    } else {
      // No row exists yet, insert a new one
      const { data: inserted, error: insErr } = await supabaseAdmin
        .from("merchant_profile")
        .insert({
          ...patch,
          created_at: new Date().toISOString(),
        })
        .select("*")
        .single();

      if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });
      return NextResponse.json({ ok: true, profile: inserted });
    }
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Update merchant profile failed" },
      { status: 500 }
    );
  }
}
