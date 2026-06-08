"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { softShell, btn, inputClass, alertErrorClass } from "@/components/admin/AdminUi";

/**
 * Only allow same-origin, path-only redirects to avoid open-redirect issues
 * (the `next` param is user-controllable via the URL).
 */
function safeNextPath(next: string | null): string {
  if (!next) return "/admin";
  if (!next.startsWith("/") || next.startsWith("//")) return "/admin";
  return next;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || `Request failed (${res.status})`);
  return json as T;
}

function AdminLoginForm() {
  const searchParams = useSearchParams();

  const next = safeNextPath(searchParams.get("next"));

  const [passcode, setPasscode] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const v = passcode.trim();
    if (!v) {
      setError("Please enter the admin passcode.");
      return;
    }

    setLoading(true);
    try {
      await postJson<{ ok: true }>("/api/admin/login", { passcode: v });

      // Hard navigation (not the client router) so the request carries the
      // freshly-set session cookie and bypasses Next.js's stale client-side
      // router cache, which otherwise still holds the middleware's
      // "redirect to /admin/login" response from the initial visit. Using the
      // client router here caused the first login attempt to bounce back to the
      // login page / hang until a manual refresh cleared the cache.
      window.location.replace(next);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md">
      <div className={softShell("p-6 sm:p-8")}>
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="admin-passcode"
              className="block text-sm font-semibold text-gray-900 mb-2"
            >
              Admin passcode
            </label>
            <input
              id="admin-passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Enter passcode"
              className={inputClass}
              type="password"
              autoComplete="current-password"
            />
          </div>

          {error ? <div className={alertErrorClass}>{error}</div> : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button className={btn("primary")} disabled={loading} type="submit">
              {loading ? "Signing in…" : "Sign in"}
            </button>
            <button
              className={btn("muted")}
              type="button"
              onClick={() => {
                window.location.href = "/";
              }}
              disabled={loading}
            >
              Cancel
            </button>
          </div>

          <p className="text-sm text-gray-600">
            If you’re seeing this unexpectedly, you may have been logged out after inactivity.
          </p>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="max-w-md"><div className={softShell("p-6 sm:p-8")}>Loading…</div></div>}>
      <AdminLoginForm />
    </Suspense>
  );
}
