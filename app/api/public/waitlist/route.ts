import { NextResponse } from "next/server";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { createWaitlistEntry, loadWaitlistSettings } from "@/lib/waitlist/db";
import { WAITLIST_TERMS_TEXT, WAITLIST_TERMS_VERSION } from "@/lib/waitlist/rules";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await loadWaitlistSettings();
    if (!("ok" in settings)) {
      if (settings.schemaMissing) {
        return NextResponse.json({ ok: true, ready: false, enabled: false });
      }
      return NextResponse.json({ ok: true, ready: false, enabled: false });
    }

    return NextResponse.json({
      ok: true,
      ready: true,
      enabled: settings.settings.enabled,
      amount_cents: settings.settings.amount_cents,
      currency: settings.settings.currency,
      terms_version: WAITLIST_TERMS_VERSION,
      terms_text: WAITLIST_TERMS_TEXT,
    });
  } catch {
    return NextResponse.json({ ok: true, ready: false, enabled: false });
  }
}

export async function POST(req: Request) {
  try {
    const limit = rateLimit(`waitlist:${getClientIp(req)}`, 5, 60_000);
    if (!limit.ok) {
      return NextResponse.json(
        { ok: false, error: "Too many requests. Please wait a moment and try again." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
      );
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const result = await createWaitlistEntry(body);
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: result.status }
      );
    }
    return NextResponse.json(result.payload, { status: result.status });
  } catch {
    return NextResponse.json(
      { ok: false, error: "The waitlist is not available yet." },
      { status: 500 }
    );
  }
}
