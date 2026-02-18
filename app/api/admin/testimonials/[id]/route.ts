import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    const { id } = await ctx.params;
    const body = await req.json();

    const status = String(body?.status || "").trim();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    if (!["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status (pending|approved|rejected)" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("testimonials")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select(
        [
          "id",
          "created_at",
          "updated_at",
          "status",
          "author_name",
          "author_location",
          "rating",
          "message",
          "dog_id",
        ].join(",")
      )
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, testimonial: data });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Update testimonial failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    const { id } = await ctx.params;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const { error } = await supabaseAdmin.from("testimonials").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Delete testimonial failed" },
      { status: 500 }
    );
  }
}
