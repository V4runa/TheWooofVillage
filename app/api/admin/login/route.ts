// app/api/admin/login/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import { createAdminSessionToken, setAdminCookie } from "@/lib/admin/session";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Constant-time string comparison. We SHA-256 both inputs first so the buffers
 * are always equal length (timingSafeEqual throws otherwise) and the duration
 * never leaks the passcode length.
 */
function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export async function POST(req: NextRequest) {
  try {
    // Brute-force protection: cap login attempts per IP. With a single shared
    // passcode this is the main defense, so it must run before any comparison.
    const rl = rateLimit(`admin-login:${getClientIp(req)}`, 8, 10 * 60_000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too many attempts. Please wait a few minutes and try again." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const passcode = String(body?.passcode || "").trim();

    const expected = process.env.ADMIN_PASSCODE || "";
    if (!expected) {
      return NextResponse.json(
        { error: "Server missing ADMIN_PASSCODE" },
        { status: 500 }
      );
    }

    if (!passcode || !safeEqual(passcode, expected)) {
      return NextResponse.json({ error: "Invalid passcode" }, { status: 401 });
    }

    const token = await createAdminSessionToken();
    if (!token) {
      return NextResponse.json(
        { error: "Could not create session" },
        { status: 500 }
      );
    }

    const res = NextResponse.json({ ok: true });
    setAdminCookie(res, token);
    return res;
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Login failed" },
      { status: 500 }
    );
  }
}
