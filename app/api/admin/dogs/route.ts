import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";
import { extFromType, slugify, parseIntOrNull, parseDateOrNull } from "@/lib/admin/utils";
import type { DogRow, DogImage } from "@/types/dogs";

/* ============================================================
   GET → Admin list dogs (all statuses) + images
   ============================================================ */
export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // optional single filter
    const limit = parseIntOrNull(searchParams.get("limit")) ?? 200;

    let q = supabaseAdmin
      .from("dogs")
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
      .order("sort_order", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(Math.min(Math.max(limit, 1), 500));

    if (status) {
      q = q.eq("status", status);
    }

    const { data: dogs, error } = await q.returns<DogRow[]>();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const baseDogs = dogs ?? [];
    const dogIds = baseDogs.map((d) => d.id);

    const imagesByDogId: Record<string, DogImage[]> = {};
    if (dogIds.length > 0) {
      const { data: imgs, error: imgErr } = await supabaseAdmin
        .from("dog_images")
        .select("id,dog_id,url,alt,sort_order,created_at")
        .in("dog_id", dogIds)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true })
        .returns<DogImage[]>();

      if (imgErr) return NextResponse.json({ error: imgErr.message }, { status: 500 });

      for (const img of imgs ?? []) {
        if (!imagesByDogId[img.dog_id]) imagesByDogId[img.dog_id] = [];
        imagesByDogId[img.dog_id].push(img);
      }
    }

    const merged = baseDogs.map((d) => ({
      ...d,
      images: imagesByDogId[d.id] ?? [],
    }));

    return NextResponse.json({ ok: true, dogs: merged });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Admin list dogs failed" },
      { status: 500 }
    );
  }
}

/* ============================================================
   POST → Create dog + (optional) upload images in one action
   FormData fields:
     - name (required)
     - slug (optional; auto from name)
     - description (optional)
     - status (optional: available|reserved|sold)
     - deposit_amount_cents (optional)
     - price_amount_cents (optional)
     - breed (optional)
     - sex (optional)
     - age_weeks (optional)
     - color (optional)
     - ready_date (optional: YYYY-MM-DD)
     - sort_order (optional)
     - files (0..n) OR file (single)
     - alt (optional single alt for all) OR alts[] (optional per file)
   ============================================================ */
export async function POST(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  let createdDogId: string | null = null;
  const uploadedObjectPaths: string[] = [];

  try {
    const form = await req.formData();

    const name = String(form.get("name") || "").trim();
    if (!name) {
      return NextResponse.json({ error: "Missing name" }, { status: 400 });
    }

    const slugInput = String(form.get("slug") || "").trim();
    const slug = slugInput ? slugify(slugInput) : slugify(name);
    if (!slug) {
      return NextResponse.json({ error: "Missing/invalid slug" }, { status: 400 });
    }

    const status = String(form.get("status") || "available").trim() || "available";
    const description = String(form.get("description") || "").trim() || null;

    const deposit_amount_cents = parseIntOrNull(form.get("deposit_amount_cents"));
    const price_amount_cents = parseIntOrNull(form.get("price_amount_cents"));

    const breed = String(form.get("breed") || "").trim() || null;
    const sex = String(form.get("sex") || "").trim() || null;
    const age_weeks = parseIntOrNull(form.get("age_weeks"));
    const color = String(form.get("color") || "").trim() || null;
    const ready_date = parseDateOrNull(form.get("ready_date"));

    const sort_order = (() => {
      const n = parseIntOrNull(form.get("sort_order"));
      return n == null ? 0 : n;
    })();

    // 1) Create dog row first (need dogId for storage path)
    const { data: dog, error: dogErr } = await supabaseAdmin
      .from("dogs")
      .insert({
        name,
        slug,
        status,
        description,
        deposit_amount_cents,
        price_amount_cents,
        cover_image_url: null,
        breed,
        sex,
        age_weeks,
        color,
        ready_date,
        sort_order,
      })
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
      .single()
      .returns<DogRow>();

    if (dogErr || !dog) {
      return NextResponse.json({ error: dogErr?.message || "Create failed" }, { status: 500 });
    }

    createdDogId = dog.id;

    // 2) Collect files (support "files" multi OR "file" single)
    const filesMulti = form.getAll("files").filter(Boolean);
    const filesSingle = form.get("file");
    const files: Blob[] = [];

    for (const f of filesMulti) {
      if (f instanceof Blob) files.push(f);
    }
    if (files.length === 0 && filesSingle instanceof Blob) {
      files.push(filesSingle);
    }

    // Alt logic
    const globalAlt = String(form.get("alt") || "").trim() || null;
    const perFileAlts = form.getAll("alts").map((a) => String(a || "").trim());

    // 3) Upload files + insert dog_images
    const insertedImages: DogImage[] = [];
    let coverUrl: string | null = null;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      const contentType = (file as any)?.type || "application/octet-stream";
      const ext = extFromType(contentType);
      const uuid = crypto.randomUUID();

      // bucket: dogs
      // object: <dogId>/<uuid>.<ext>
      const objectPath = `${createdDogId}/${uuid}.${ext}`;
      const storage_path = `dogs/${objectPath}`;

      const buffer = await file.arrayBuffer();

      const upload = await supabaseAdmin.storage.from("dogs").upload(objectPath, buffer, {
        contentType,
        upsert: false,
      });

      if (upload.error) {
        throw new Error(upload.error.message);
      }

      uploadedObjectPaths.push(objectPath);

      const { data: urlData } = supabaseAdmin.storage.from("dogs").getPublicUrl(objectPath);
      const url = urlData.publicUrl;

      if (!coverUrl) coverUrl = url;

      const alt =
        (perFileAlts[i] && perFileAlts[i].length > 0 ? perFileAlts[i] : globalAlt) || null;

      const { data: imageRow, error: imgErr } = await supabaseAdmin
        .from("dog_images")
        .insert({
          dog_id: createdDogId,
          url,
          alt,
          sort_order: i,
          storage_path,
        })
        .select("id,dog_id,url,alt,sort_order,created_at")
        .single()
        .returns<DogImage>();

      if (imgErr || !imageRow) {
        throw new Error(imgErr?.message || "Failed to insert dog_images row");
      }

      insertedImages.push(imageRow);
    }

    // 4) Set cover_image_url if we uploaded at least one image
    if (coverUrl) {
      const { error: coverErr } = await supabaseAdmin
        .from("dogs")
        .update({ cover_image_url: coverUrl, updated_at: new Date().toISOString() })
        .eq("id", createdDogId);

      if (coverErr) {
        throw new Error(coverErr.message);
      }

      (dog as any).cover_image_url = coverUrl;
    }

    return NextResponse.json({ ok: true, dog, images: insertedImages });
  } catch (e: any) {
    // Cleanup if partially succeeded
    try {
      if (uploadedObjectPaths.length > 0) {
        await supabaseAdmin.storage.from("dogs").remove(uploadedObjectPaths);
      }
      if (createdDogId) {
        await supabaseAdmin.from("dog_images").delete().eq("dog_id", createdDogId);
        await supabaseAdmin.from("dogs").delete().eq("id", createdDogId);
      }
    } catch {
      // ignore cleanup errors
    }

    return NextResponse.json(
      { error: e?.message || "Create dog failed" },
      { status: 500 }
    );
  }
}
