import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "../../lib/admin/session";

/**
 * Centralized admin authentication utilities.
 * - Primary: HttpOnly cookie session (professional)  
 * - Fallback (temporary): header passcode (legacy)
 */

function headerPasscodeMatches(req: Request | NextRequest): boolean {
  const pass = process.env.ADMIN_PASSCODE || "";
  if (!pass) return false;

  const header =
    req.headers.get("x-admin-passcode") ||
    req.headers.get("x-admin-pass") ||
    "";

  return header === pass;
}

export async function isAdminRequest(req: Request | NextRequest): Promise<boolean> {
  // 1) Cookie session (preferred)
  const cookieToken =
    "cookies" in req
      ? (req as NextRequest).cookies.get(ADMIN_COOKIE_NAME)?.value ?? null
      : null;

  if (cookieToken) {
    const ok = await verifyAdminSessionToken(cookieToken);
    if (ok) return true;
  }

  // 2) Legacy header passcode (temporary support)
  return headerPasscodeMatches(req);
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
