import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

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
