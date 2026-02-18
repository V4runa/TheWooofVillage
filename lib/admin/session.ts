// lib/admin/session.ts
import { NextResponse } from "next/server";

export const ADMIN_COOKIE_NAME = "woof_admin_session";

// 7 days
export const ADMIN_SESSION_SECONDS = 60 * 60 * 24 * 7;

type Payload = {
  iat: number; // issued at (unix seconds)
  exp: number; // expires at (unix seconds)
};

// Prefer a dedicated secret if you add one later.
// For now, single-admin: ADMIN_PASSCODE is the secret (simple + effective for this project).
function getSecret(): string {
  const secret = process.env.ADMIN_PASSCODE || "";
  if (!secret) return "";
  return secret;
}

function nowSeconds() {
  return Math.floor(Date.now() / 1000);
}

function base64urlEncode(bytes: Uint8Array) {
  // Browser/Edge safe
  let str = "";
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  const b64 = btoa(str);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64urlDecodeToBytes(s: string) {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  const raw = atob(b64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

async function hmacSha256(secret: string, msg: string): Promise<Uint8Array> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(msg));
  return new Uint8Array(sig);
}

export async function createAdminSessionToken(): Promise<string | null> {
  const secret = getSecret();
  if (!secret) return null;

  const iat = nowSeconds();
  const exp = iat + ADMIN_SESSION_SECONDS;

  const payload: Payload = { iat, exp };
  const payloadJson = JSON.stringify(payload);
  const payloadBytes = new TextEncoder().encode(payloadJson);
  const payloadB64 = base64urlEncode(payloadBytes);

  const sig = await hmacSha256(secret, payloadB64);
  const sigB64 = base64urlEncode(sig);

  return `${payloadB64}.${sigB64}`;
}

export async function verifyAdminSessionToken(token: string | null): Promise<boolean> {
  const secret = getSecret();
  if (!secret) return false;
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payloadB64, sigB64] = parts;

  // Verify signature
  const expectedSig = await hmacSha256(secret, payloadB64);
  const expectedSigB64 = base64urlEncode(expectedSig);
  if (expectedSigB64 !== sigB64) return false;

  // Verify expiration
  try {
    const payloadBytes = base64urlDecodeToBytes(payloadB64);
    const payloadJson = new TextDecoder().decode(payloadBytes);
    const payload = JSON.parse(payloadJson) as Payload;

    if (!payload?.exp || typeof payload.exp !== "number") return false;
    return payload.exp > nowSeconds();
  } catch {
    return false;
  }
}

export function setAdminCookie(res: NextResponse, token: string) {
  const isProd = process.env.NODE_ENV === "production";

  res.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_SECONDS,
  });
}

export function clearAdminCookie(res: NextResponse) {
  res.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
