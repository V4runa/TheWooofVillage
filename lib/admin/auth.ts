import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "../../lib/admin/session";

/**
 * Centralized admin authentication.
 * Auth is performed exclusively via the HttpOnly signed session cookie set at
 * login. (The legacy `x-admin-passcode` header bypass has been removed so the
 * passcode is never transmitted on every request.)
 */
export async function isAdminRequest(req: Request | NextRequest): Promise<boolean> {
  const cookieToken =
    "cookies" in req
      ? (req as NextRequest).cookies.get(ADMIN_COOKIE_NAME)?.value ?? null
      : null;

  if (!cookieToken) return false;
  return verifyAdminSessionToken(cookieToken);
}

/**
 * Use this at the top of any admin route handler.
 * Returns a NextResponse if unauthorized, otherwise returns null.
 */
export async function requireAdmin(
  req: Request | NextRequest
): Promise<NextResponse | null> {
  const ok = await isAdminRequest(req);
  if (ok) return null;
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
