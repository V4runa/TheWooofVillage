import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

function cleanText(v: unknown, maxLen: number) {
  const s = String(v ?? "").trim();
  return s.length > maxLen ? s.slice(0, maxLen) : s;
}

function cleanOptionalText(v: unknown, maxLen: number) {
  const s = String(v ?? "").trim();
  if (!s) return null;
  return s.length > maxLen ? s.slice(0, maxLen) : s;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const dog_id = cleanText(body.dog_id, 64);
    const buyer_name = cleanText(body.buyer_name, 80);
    const buyer_phone = cleanText(body.buyer_phone, 32);
    const payment_method = cleanText(body.payment_method, 40);
    const transaction_id = cleanOptionalText(body.transaction_id, 120);
    const note = cleanOptionalText(body.note, 1200);

    if (!dog_id) {
      return NextResponse.json({ ok: false, error: "Missing dog id." }, { status: 400 });
    }
    if (!buyer_name || !buyer_phone || !payment_method) {
      return NextResponse.json(
        { ok: false, error: "Please add name, phone, and payment method." },
        { status: 400 }
      );
    }

    // Confirm dog exists (prevents garbage ids)
    const { data: dog, error: dogErr } = await supabaseAdmin
      .from("dogs")
      .select("id")
      .eq("id", dog_id)
      .maybeSingle();

    if (dogErr) {
      return NextResponse.json({ ok: false, error: dogErr.message }, { status: 500 });
    }
    if (!dog) {
      return NextResponse.json({ ok: false, error: "Dog not found." }, { status: 404 });
    }

    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from("reservation_requests")
      .insert({
        dog_id,
        buyer_name,
        buyer_phone,
        buyer_email: null, // current UI does not collect it
        payment_method,
        transaction_id,
        note,
      })
      .select("id")
      .single();

    if (insertErr) {
      return NextResponse.json({ ok: false, error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, reservation_request_id: inserted.id });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Submit reservation failed" },
      { status: 500 }
    );
  }
}
