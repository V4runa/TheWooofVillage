import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";

const ALLOWED = new Set(["new", "contacted", "closed"]);

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    const { id } = await ctx.params;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const body = await req.json().catch(() => ({}));
    const status = String(body?.status || "").trim();

    if (!ALLOWED.has(status)) {
      return NextResponse.json(
        { error: "Invalid status (new|contacted|closed)" },
        { status: 400 }
      );
    }

    const handled_at = status === "new" ? null : new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("reservation_requests")
      .update({ status, handled_at })
      .eq("id", id)
      .select(
        [
          "id",
          "created_at",
          "dog_id",
          "buyer_name",
          "buyer_phone",
          "buyer_email",
          "payment_method",
          "transaction_id",
          "note",
          "status",
          "handled_at",
          "dogs(name,slug)",
        ].join(",")
      )
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, reservation: data });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Update reservation failed" },
      { status: 500 }
    );
  }
}
