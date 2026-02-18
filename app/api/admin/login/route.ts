// app/api/admin/login/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createAdminSessionToken, setAdminCookie } from "@/lib/admin/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const passcode = String(body?.passcode || "").trim();

    const expected = process.env.ADMIN_PASSCODE || "";
    if (!expected) {
      return NextResponse.json(
        { error: "Server missing ADMIN_PASSCODE" },
        { status: 500 }
      );
    }

    if (!passcode || passcode !== expected) {
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
