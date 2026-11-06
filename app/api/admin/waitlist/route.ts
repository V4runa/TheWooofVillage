import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { listWaitlistEntries } from "@/lib/waitlist/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const q = new URL(req.url).searchParams.get("q") ?? "";
  const result = await listWaitlistEntries(q);
  if (!("ok" in result)) {
    return NextResponse.json(
      {
        ok: false,
        schemaMissing: result.schemaMissing,
        error: result.schemaMissing
          ? "Waitlist schema is not applied yet. Run supabase/migrations/20261106_waitlist.sql."
          : result.error,
      },
      { status: result.schemaMissing ? 503 : 500 }
    );
  }
  return NextResponse.json({ ok: true, entries: result.entries });
}
