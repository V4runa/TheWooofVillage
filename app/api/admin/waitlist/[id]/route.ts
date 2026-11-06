import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { actOnWaitlistEntry, deleteWaitlistEntry, getWaitlistDetail } from "@/lib/waitlist/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SCHEMA_ERROR =
  "Waitlist schema is not applied yet. Run supabase/migrations/20261106_waitlist.sql.";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const { id } = await ctx.params;
  const result = await getWaitlistDetail(id);
  if (!("ok" in result)) {
    return NextResponse.json(
      { error: result.schemaMissing ? SCHEMA_ERROR : result.error },
      { status: result.schemaMissing ? 503 : result.error === "Entry not found." ? 404 : 500 }
    );
  }
  return NextResponse.json(result);
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const { id } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const result = await actOnWaitlistEntry(id, body);
  if (!("ok" in result)) {
    const status = result.schemaMissing ? 503 : 400;
    return NextResponse.json(
      { error: result.schemaMissing ? SCHEMA_ERROR : result.error },
      { status }
    );
  }
  const detail = await getWaitlistDetail(id);
  if (!("ok" in detail)) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json(detail);
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const { id } = await ctx.params;
  const result = await deleteWaitlistEntry(id);
  if ("ok" in result) return NextResponse.json({ ok: true, deleted: true });
  if ("notFound" in result) {
    return NextResponse.json({ error: "That request is already gone." }, { status: 404 });
  }
  if ("blocked" in result) {
    return NextResponse.json({ error: result.blocked }, { status: 409 });
  }
  return NextResponse.json(
    { error: result.schemaMissing ? SCHEMA_ERROR : result.error },
    { status: result.schemaMissing ? 503 : 400 }
  );
}
