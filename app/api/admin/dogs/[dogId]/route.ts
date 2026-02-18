import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";
import { slugify, parseDateOrNull } from "@/lib/admin/utils";

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ dogId: string }> }
) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    const { dogId } = await ctx.params;
    const body = await req.json();

    if (!dogId) {
      return NextResponse.json({ error: "Missing dogId" }, { status: 400 });
    }

    // Only allow known fields (prevents accidental junk updates)
    const update: Record<string, any> = {};

    if (typeof body?.name === "string") update.name = body.name.trim();
    if (typeof body?.description === "string") update.description = body.description.trim() || null;
    if (typeof body?.status === "string") update.status = body.status.trim();
    if (typeof body?.breed === "string") update.breed = body.breed.trim() || null;
    if (typeof body?.sex === "string") update.sex = body.sex.trim() || null;
    if (typeof body?.color === "string") update.color = body.color.trim() || null;

    if (body?.age_weeks === null || typeof body?.age_weeks === "number")
      update.age_weeks = body.age_weeks;

    if (body?.deposit_amount_cents === null || typeof body?.deposit_amount_cents === "number")
      update.deposit_amount_cents = body.deposit_amount_cents;

    if (body?.price_amount_cents === null || typeof body?.price_amount_cents === "number")
      update.price_amount_cents = body.price_amount_cents;

    if (body?.sort_order === null || typeof body?.sort_order === "number")
      update.sort_order = body.sort_order;

    if (typeof body?.ready_date === "string") update.ready_date = parseDateOrNull(body.ready_date);

    // Slug control: only update if explicitly provided
    if (typeof body?.slug === "string") {
      const s = slugify(body.slug);
      if (!s) return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
      update.slug = s;
    }

    // If no updates, do nothing
    if (Object.keys(update).length === 0) {
      return NextResponse.json({ ok: true, dog: null });
    }

    update.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("dogs")
      .update(update)
      .eq("id", dogId)
      .select(
        [
          "id",
          "name",
          "description",
          "status",
          "deposit_amount_cents",
          "price_amount_cents",
          "cover_image_url",
          "breed",
          "sex",
          "age_weeks",
          "color",
          "ready_date",
          "sort_order",
          "slug",
          "created_at",
          "updated_at",
        ].join(",")
      )
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, dog: data });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Update dog failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ dogId: string }> }
) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    const { dogId } = await ctx.params;
    if (!dogId) {
      return NextResponse.json({ error: "Missing dogId" }, { status: 400 });
    }

    // 1) Delete storage objects under <dogId>/
    // We list everything in that "folder" and remove it.
    const bucket = supabaseAdmin.storage.from("dogs");

    let offset = 0;
    const limit = 100;
    const objectPaths: string[] = [];

    while (true) {
      const { data: items, error: listErr } = await bucket.list(dogId, {
        limit,
        offset,
        sortBy: { column: "name", order: "asc" },
      });

      if (listErr) {
        return NextResponse.json({ error: listErr.message }, { status: 500 });
      }

      const batch = (items ?? []).map((it) => `${dogId}/${it.name}`);
      objectPaths.push(...batch);

      if (!items || items.length < limit) break;
      offset += limit;
    }

    if (objectPaths.length > 0) {
      const { error: rmErr } = await bucket.remove(objectPaths);
      if (rmErr) {
        return NextResponse.json({ error: rmErr.message }, { status: 500 });
      }
    }

    // 2) Delete dog row (dog_images cascades in DB because FK is ON DELETE CASCADE)
    const { error: delErr } = await supabaseAdmin.from("dogs").delete().eq("id", dogId);
    if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Delete dog failed" },
      { status: 500 }
    );
  }
}
