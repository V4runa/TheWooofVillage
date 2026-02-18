import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";
import type { Testimonial, TestimonialImage } from "@/types/testimonials";

type TestimonialRow = Omit<Testimonial, "images">;

export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // optional filter
    const limit = Number(searchParams.get("limit") || "200");

    let q = supabaseAdmin
      .from("testimonials")
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
      .order("created_at", { ascending: false })
      .limit(Math.min(Math.max(limit, 1), 500));

    if (status) q = q.eq("status", status);

    const { data: base, error } = await q.returns<TestimonialRow[]>();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const ids = (base ?? []).map((t) => t.id);
    const imagesById: Record<string, TestimonialImage[]> = {};

    if (ids.length > 0) {
      const { data: imgs, error: imgErr } = await supabaseAdmin
        .from("testimonial_images")
        .select("id,testimonial_id,url,alt,sort_order,created_at")
        .in("testimonial_id", ids)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true })
        .returns<TestimonialImage[]>();

      if (imgErr) return NextResponse.json({ error: imgErr.message }, { status: 500 });

      for (const img of imgs ?? []) {
        if (!imagesById[img.testimonial_id]) imagesById[img.testimonial_id] = [];
        imagesById[img.testimonial_id].push(img);
      }
    }

    const merged = (base ?? []).map((t) => ({
      ...t,
      images: imagesById[t.id] ?? [],
    }));

    return NextResponse.json({ ok: true, testimonials: merged });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Admin list testimonials failed" },
      { status: 500 }
    );
  }
}
