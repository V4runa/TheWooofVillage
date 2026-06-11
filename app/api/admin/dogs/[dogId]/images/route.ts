import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";
import { extFromType } from "@/lib/admin/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Guard against junk/oversized payloads. Client compresses to ~1600px first,
// so anything beyond this is almost certainly not a normal photo upload.
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15MB
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

    // Reject anything that isn't a real image up front so bad files fail fast
    // and clearly (instead of landing as an unreadable object in storage).
    if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a JPG, PNG, WEBP, or GIF image." },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "File is empty." }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: "Image is too large. Please use a photo under 15MB." },
        { status: 400 }
      );
    }

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

    // Retry the storage write a couple of times — object storage occasionally
    // returns transient errors, and a single retry stops a whole bulk upload
    // from losing one photo to a blip.
    let uploadError: { message: string } | null = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      const upload = await supabaseAdmin.storage
        .from("dogs")
        .upload(objectPath, buffer, { contentType, upsert: false });

      if (!upload.error) {
        uploadError = null;
        break;
      }
      uploadError = upload.error;
      if (attempt < 3) await sleep(250 * attempt);
    }

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 502 });
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

    // Run the per-row updates in parallel instead of sequentially to cut the
    // number of blocking round-trips (litters are small, so this is safe).
    const results = await Promise.all(
      orderedIds.map((id: string, index: number) =>
        supabaseAdmin
          .from("dog_images")
          .update({ sort_order: index })
          .eq("id", id)
          .eq("dog_id", dogId)
      )
    );

    const failed = results.find((r) => r.error);
    if (failed?.error) {
      return NextResponse.json({ error: failed.error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Reorder failed" }, { status: 500 });
  }
}
