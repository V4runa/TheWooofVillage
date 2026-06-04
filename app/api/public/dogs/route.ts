import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { DogRow, DogImage } from "@/types/dogs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public, read-only dog data.
 *
 * Public pages used to read Supabase directly from the browser with the
 * NEXT_PUBLIC anon key. That breaks the moment those public env vars aren't
 * present in the deployment. Reading through this server route uses the same
 * server credentials the admin already relies on, so the public site works
 * wherever the admin does.
 *
 * Usage:
 *   GET /api/public/dogs?statuses=available            -> { ok, dogs }
 *   GET /api/public/dogs?includeAll=true               -> { ok, dogs }
 *   GET /api/public/dogs?slug=bella                     -> { ok, dog }
 *   GET /api/public/dogs?id=<uuid>                      -> { ok, dog }
 */
const DOG_COLUMNS = [
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
].join(",");

const NO_STORE = { "Cache-Control": "no-store" } as const;

async function attachImages(dogs: DogRow[]) {
  const ids = dogs.map((d) => d.id);
  const byDog: Record<string, DogImage[]> = {};

  if (ids.length > 0) {
    const { data: imgs, error } = await supabaseAdmin
      .from("dog_images")
      .select("id,dog_id,url,alt,sort_order,created_at")
      .in("dog_id", ids)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true })
      .returns<DogImage[]>();

    if (!error) {
      for (const img of imgs ?? []) {
        (byDog[img.dog_id] ??= []).push(img);
      }
    }
  }

  return dogs.map((d) => ({ ...d, images: byDog[d.id] ?? [] }));
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const id = searchParams.get("id");

    // Single dog (detail page) by slug or id.
    if (slug || id) {
      const column = slug ? "slug" : "id";
      const value = (slug ?? id) as string;

      const { data, error } = await supabaseAdmin
        .from("dogs")
        .select(DOG_COLUMNS)
        .eq(column, value)
        .maybeSingle()
        .returns<DogRow>();

      if (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      }
      if (!data) {
        return NextResponse.json({ ok: true, dog: null }, { headers: NO_STORE });
      }

      const [dog] = await attachImages([data]);
      return NextResponse.json({ ok: true, dog }, { headers: NO_STORE });
    }

    // List.
    const includeAll = searchParams.get("includeAll") === "true";
    const statusesParam = searchParams.get("statuses");
    const statuses = statusesParam
      ? statusesParam.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    let q = supabaseAdmin
      .from("dogs")
      .select(DOG_COLUMNS)
      .order("sort_order", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (!includeAll && statuses.length > 0) {
      q = q.in("status", statuses);
    }

    const { data, error } = await q.returns<DogRow[]>();
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    const dogs = await attachImages(data ?? []);
    return NextResponse.json({ ok: true, dogs }, { headers: NO_STORE });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to load dogs" },
      { status: 500 }
    );
  }
}
