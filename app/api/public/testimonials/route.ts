import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TestimonialImageRow = {
  id: string;
  testimonial_id: string;
  url: string;
  alt: string | null;
  sort_order: number | null;
  created_at: string;
};

/**
 * Public, read-only list of APPROVED testimonials (+ images).
 * Served from the server so the public site never depends on browser-side
 * Supabase env vars.
 */
export async function GET() {
  try {
    const { data: base, error } = await supabaseAdmin
      .from("testimonials")
      .select(
        "id,created_at,updated_at,status,author_name,author_location,rating,message,dog_id"
      )
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    const rows = base ?? [];
    const ids = rows.map((t: any) => t.id);
    const byTestimonial: Record<string, TestimonialImageRow[]> = {};

    if (ids.length > 0) {
      const { data: imgs } = await supabaseAdmin
        .from("testimonial_images")
        .select("id,testimonial_id,url,alt,sort_order,created_at")
        .in("testimonial_id", ids)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true })
        .returns<TestimonialImageRow[]>();

      for (const img of imgs ?? []) {
        (byTestimonial[img.testimonial_id] ??= []).push(img);
      }
    }

    const testimonials = rows.map((t: any) => ({
      ...t,
      images: byTestimonial[t.id] ?? [],
    }));

    return NextResponse.json(
      { ok: true, testimonials },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to load testimonials" },
      { status: 500 }
    );
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function cleanText(v: unknown, maxLen: number) {
  const s = String(v ?? "").trim();
  return s.length > maxLen ? s.slice(0, maxLen) : s;
}

function cleanOptionalText(v: unknown, maxLen: number) {
  const s = String(v ?? "").trim();
  if (!s) return null;
  return s.length > maxLen ? s.slice(0, maxLen) : s;
}

function isLikelyUrl(v: string) {
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    // Best-effort spam throttle: 5 review submissions per IP per minute.
    const limit = rateLimit(`testimonials:${getClientIp(req)}`, 5, 60_000);
    if (!limit.ok) {
      return NextResponse.json(
        { ok: false, error: "Too many requests. Please wait a moment and try again." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
      );
    }

    const body = await req.json().catch(() => ({}));

    const author_name = cleanText(body.author_name, 80);
    const author_location = cleanOptionalText(body.author_location, 120);
    const message = cleanText(body.message, 2000);

    const ratingRaw = Number(body.rating);
    const rating =
      Number.isFinite(ratingRaw) ? clamp(Math.round(ratingRaw), 1, 5) : null;

    const photo_url_raw = cleanOptionalText(body.photo_url, 600);
    const photo_url =
      photo_url_raw && isLikelyUrl(photo_url_raw) ? photo_url_raw : null;

    if (!author_name) {
      return NextResponse.json(
        { ok: false, error: "Please enter your name." },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        { ok: false, error: "Please write a short message." },
        { status: 400 }
      );
    }

    // Force pending
    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from("testimonials")
      .insert({
        status: "pending",
        author_name,
        author_location,
        rating,
        message,
        dog_id: null,
      })
      .select("id")
      .single();

    if (insertErr) {
      return NextResponse.json(
        { ok: false, error: insertErr.message },
        { status: 500 }
      );
    }

    if (photo_url) {
      const { error: imgErr } = await supabaseAdmin
        .from("testimonial_images")
        .insert({
          testimonial_id: inserted.id,
          url: photo_url,
          alt: `${author_name}'s photo`,
          sort_order: 0,
        });

      if (imgErr) {
        return NextResponse.json({
          ok: true,
          testimonial_id: inserted.id,
          warning: "Review submitted, but photo could not be saved.",
        });
      }
    }

    return NextResponse.json({ ok: true, testimonial_id: inserted.id });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Submit testimonial failed" },
      { status: 500 }
    );
  }
}
