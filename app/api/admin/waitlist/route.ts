import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { countOpenWaitlistEntries, listWaitlistEntries } from "@/lib/waitlist/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const url = new URL(req.url);
  if (url.searchParams.get("count") === "open") {
    const counted = await countOpenWaitlistEntries();
    if (!("ok" in counted)) {
      return NextResponse.json(
        {
          ok: false,
          error: counted.schemaMissing
            ? "Waitlist schema is not applied yet. Run supabase/migrations/20261106_waitlist.sql."
            : counted.error,
        },
        { status: counted.schemaMissing ? 503 : 500 }
      );
    }
    return NextResponse.json({ ok: true, count: counted.count });
  }

  const q = url.searchParams.get("q") ?? "";
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
