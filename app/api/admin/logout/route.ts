// app/api/admin/logout/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { clearAdminCookie } from "@/lib/admin/session";

export async function POST(_req: NextRequest) {
  const res = NextResponse.json({ ok: true });
  clearAdminCookie(res);
  return res;
}
