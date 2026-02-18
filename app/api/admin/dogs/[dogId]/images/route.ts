import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";
import { extFromType } from "@/lib/admin/utils";

/* ============================================================
   POST → Upload image
   ============================================================ */
export async function POST(
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

    const form = await req.formData();
    const file = form.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "Missing file (field name must be 'file')" },
        { status: 400 }
      );
    }

    const alt = String(form.get("alt") || "").trim() || null;
    const contentType = (file as any)?.type || "application/octet-stream";

    const ext = extFromType(contentType);
    const uuid = crypto.randomUUID();

    /**
     * Storage model:
     * bucket: dogs
     * object: <dogId>/<uuid>.<ext>
     */
    const objectPath = `${dogId}/${uuid}.${ext}`;
    const storagePath = `dogs/${objectPath}`;

    const buffer = await file.arrayBuffer();

    const upload = await supabaseAdmin.storage.from("dogs").upload(objectPath, buffer, {
      contentType,
      upsert: false,
    });

    if (upload.error) {
      return NextResponse.json({ error: upload.error.message }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage.from("dogs").getPublicUrl(objectPath);
    const url = urlData.publicUrl;

    // Next sort order
    const { data: last, error: lastErr } = await supabaseAdmin
      .from("dog_images")
      .select("sort_order")
      .eq("dog_id", dogId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastErr) {
      // Cleanup orphaned upload
      await supabaseAdmin.storage.from("dogs").remove([objectPath]);
      return NextResponse.json({ error: lastErr.message }, { status: 500 });
    }

    const nextSort = (last?.sort_order ?? -1) + 1;

    const { data: image, error } = await supabaseAdmin
      .from("dog_images")
      .insert({
        dog_id: dogId,
        url,
        alt,
        sort_order: nextSort,
        storage_path: storagePath,
      })
      .select()
      .single();

    if (error) {
      // Cleanup orphaned upload
      await supabaseAdmin.storage.from("dogs").remove([objectPath]);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, image });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Upload failed" }, { status: 500 });
  }
}

/* ============================================================
   DELETE → Delete image (DB + Storage)
   ============================================================ */
export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ dogId: string }> }
) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    const { dogId } = await ctx.params;
    const { searchParams } = new URL(req.url);
    const imageId = searchParams.get("imageId");

    if (!dogId || !imageId) {
      return NextResponse.json({ error: "Missing dogId or imageId" }, { status: 400 });
    }

    const { data: image, error: findErr } = await supabaseAdmin
      .from("dog_images")
      .select("id, storage_path")
      .eq("id", imageId)
      .eq("dog_id", dogId)
      .maybeSingle();

    if (findErr || !image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Remove file from storage
    if (image.storage_path) {
      const objectPath = image.storage_path.replace(/^dogs\//, "");
      await supabaseAdmin.storage.from("dogs").remove([objectPath]);
    }

    // Remove DB row
    const { error: delErr } = await supabaseAdmin
      .from("dog_images")
      .delete()
      .eq("id", imageId)
      .eq("dog_id", dogId);

    if (delErr) {
      return NextResponse.json({ error: delErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Delete failed" }, { status: 500 });
  }
}

/* ============================================================
   PATCH → Reorder images
   Body: { orderedIds: string[] }
   ============================================================ */
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ dogId: string }> }
) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    const { dogId } = await ctx.params;

    const body = await req.json().catch(() => null);
    const orderedIds = body?.orderedIds;

    if (!dogId) {
      return NextResponse.json({ error: "Missing dogId" }, { status: 400 });
    }

    if (!Array.isArray(orderedIds)) {
      return NextResponse.json({ error: "orderedIds must be an array" }, { status: 400 });
    }

    // Simple + safe: update one-by-one (small litters; fine for now)
    for (let index = 0; index < orderedIds.length; index++) {
      const id = orderedIds[index];
      const { error } = await supabaseAdmin
        .from("dog_images")
        .update({ sort_order: index })
        .eq("id", id)
        .eq("dog_id", dogId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Reorder failed" }, { status: 500 });
  }
}
