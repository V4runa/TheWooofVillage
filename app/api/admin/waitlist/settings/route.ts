import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { loadWaitlistSettings, saveWaitlistSettings } from "@/lib/waitlist/db";
import { dollarsToCents } from "@/lib/waitlist/rules";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SCHEMA_ERROR =
  "Waitlist schema is not applied yet. Run supabase/migrations/20261106_waitlist.sql.";

export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const result = await loadWaitlistSettings();
  if (!("ok" in result)) {
    return NextResponse.json(
      {
        ok: false,
        schemaMissing: result.schemaMissing,
        error: result.schemaMissing ? SCHEMA_ERROR : result.error,
      },
      { status: result.schemaMissing ? 503 : 500 }
    );
  }
  return NextResponse.json({ ok: true, settings: result.settings });
}

export async function PATCH(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const amount = dollarsToCents(String(body.amount_dollars ?? ""));
  if (amount == null) {
    return NextResponse.json({ error: "Enter a deposit amount in dollars." }, { status: 400 });
  }

  const saved = await saveWaitlistSettings({
    enabled: body.enabled !== false,
    amountCents: amount,
  });
  if (!("ok" in saved)) {
    return NextResponse.json(
      { error: saved.schemaMissing ? SCHEMA_ERROR : saved.error },
      { status: saved.schemaMissing ? 503 : 500 }
    );
  }
  return NextResponse.json({ ok: true, settings: saved.settings });
}
