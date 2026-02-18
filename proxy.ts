// proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/admin/session";

const ADMIN_LOGIN_PATH = "/admin/login";

function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function isAdminApi(pathname: string) {
  return pathname.startsWith("/api/admin/");
}

function isPublicAdminRoute(pathname: string) {
  // allow login endpoint + login page
  if (pathname === ADMIN_LOGIN_PATH) return true;
  if (pathname === "/api/admin/login") return true;
  return false;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only gate admin UI + admin api
  if (!isAdminPath(pathname) && !isAdminApi(pathname)) {
    return NextResponse.next();
  }

  // Allow access to login
  if (isPublicAdminRoute(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value ?? null;
  const ok = await verifyAdminSessionToken(token);

  if (ok) return NextResponse.next();

  // If API: return 401 JSON
  if (isAdminApi(pathname)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // If page: redirect to /admin/login
  const url = req.nextUrl.clone();
  url.pathname = ADMIN_LOGIN_PATH;
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

// Apply proxy to everything except static assets
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
