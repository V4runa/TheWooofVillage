import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { extFromType } from "@/lib/admin/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public review photo upload.
 *
 * Lets a reviewer attach real photos to the (pending) testimonial they just
 * submitted, instead of pasting an image URL. Guard rails keep it spam-safe:
 *  - Rate limited per IP.
 *  - Only attaches to a PENDING testimonial created very recently.
 *  - Caps total photos per review and per-file size/type.
 *  - All reviews are still manually approved before they ever show publicly.
 */

const BUCKET = "testimonials";
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15MB
const MAX_IMAGES_PER_REVIEW = 6;
const ATTACH_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

let bucketReady = false;

async function ensureBucket() {
  if (bucketReady) return;
  // createBucket is idempotent enough for our needs: if it already exists we
  // simply ignore the "already exists" error.
  const { error } = await supabaseAdmin.storage.createBucket(BUCKET, {
    public: true,
  });
  if (error && !/exist/i.test(error.message)) {
    throw new Error(error.message);
  }
  bucketReady = true;
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const limit = rateLimit(`testimonial-img:${getClientIp(req)}`, 20, 60_000);
    if (!limit.ok) {
      return NextResponse.json(
        { ok: false, error: "Too many uploads. Please wait a moment and try again." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
      );
    }

    const { id } = await ctx.params;
    if (!id) {
      return NextResponse.json({ ok: false, error: "Missing review id" }, { status: 400 });
    }

    // Only allow attaching to a fresh, still-pending review.
    const { data: review, error: findErr } = await supabaseAdmin
      .from("testimonials")
      .select("id,status,created_at")
      .eq("id", id)
      .maybeSingle();

    if (findErr) {
      return NextResponse.json({ ok: false, error: findErr.message }, { status: 500 });
    }
    if (!review) {
      return NextResponse.json({ ok: false, error: "Review not found." }, { status: 404 });
    }
    if (review.status !== "pending") {
      return NextResponse.json(
        { ok: false, error: "This review can no longer be edited." },
        { status: 403 }
      );
    }
    const createdMs = new Date(review.created_at as string).getTime();
    if (Number.isFinite(createdMs) && Date.now() - createdMs > ATTACH_WINDOW_MS) {
      return NextResponse.json(
        { ok: false, error: "This review can no longer be edited." },
        { status: 403 }
      );
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { ok: false, error: "Missing file (field name must be 'file')" },
        { status: 400 }
      );
    }

    const contentType = file.type || "application/octet-stream";
    if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
      return NextResponse.json(
        { ok: false, error: "Unsupported file type. Please upload a JPG, PNG, WEBP, or GIF image." },
        { status: 400 }
      );
    }
    if (file.size === 0) {
      return NextResponse.json({ ok: false, error: "File is empty." }, { status: 400 });
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { ok: false, error: "Image is too large. Please use a photo under 15MB." },
        { status: 400 }
      );
    }

    // Cap the number of photos per review.
    const { count, error: countErr } = await supabaseAdmin
      .from("testimonial_images")
      .select("id", { count: "exact", head: true })
      .eq("testimonial_id", id);

    if (countErr) {
      return NextResponse.json({ ok: false, error: countErr.message }, { status: 500 });
    }
    const existing = count ?? 0;
    if (existing >= MAX_IMAGES_PER_REVIEW) {
      return NextResponse.json(
        { ok: false, error: `You can add up to ${MAX_IMAGES_PER_REVIEW} photos.` },
        { status: 400 }
      );
    }

    await ensureBucket();

    const ext = extFromType(contentType);
    const uuid = crypto.randomUUID();
    const objectPath = `${id}/${uuid}.${ext}`;
    const buffer = await file.arrayBuffer();

    let uploadError: { message: string } | null = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      const upload = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(objectPath, buffer, { contentType, upsert: false });
      if (!upload.error) {
        uploadError = null;
        break;
      }
      uploadError = upload.error;
      if (attempt < 3) await new Promise((r) => setTimeout(r, 250 * attempt));
    }

    if (uploadError) {
      return NextResponse.json({ ok: false, error: uploadError.message }, { status: 502 });
    }

    const { data: urlData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(objectPath);
    const url = urlData.publicUrl;

    const { data: image, error: insertErr } = await supabaseAdmin
      .from("testimonial_images")
      .insert({
        testimonial_id: id,
        url,
        alt: "Review photo",
        sort_order: existing,
      })
      .select("id,testimonial_id,url,alt,sort_order,created_at")
      .single();

    if (insertErr) {
      // Don't leave an orphaned object behind.
      await supabaseAdmin.storage.from(BUCKET).remove([objectPath]);
      return NextResponse.json({ ok: false, error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, image });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Upload failed" },
      { status: 500 }
    );
  }
}
