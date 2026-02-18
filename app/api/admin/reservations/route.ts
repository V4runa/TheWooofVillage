import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";

const ALLOWED = new Set(["new", "contacted", "closed", "all"]);

function clampInt(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    const url = new URL(req.url);

    const statusRaw = (url.searchParams.get("status") || "new").trim();
    const status = ALLOWED.has(statusRaw) ? statusRaw : "new";

    const limitRaw = Number(url.searchParams.get("limit") || "50");
    const limit = clampInt(Number.isFinite(limitRaw) ? limitRaw : 50, 1, 200);

    let q = supabaseAdmin
      .from("reservation_requests")
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
      .order("created_at", { ascending: false })
      .limit(limit);

    if (status !== "all") {
      q = q.eq("status", status);
    }

    const { data, error } = await q;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, reservations: data ?? [] });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "List reservations failed" },
      { status: 500 }
    );
  }
}
