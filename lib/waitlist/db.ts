import { supabaseAdmin } from "@/lib/supabase/server";
import { buildPaymentOptions, type PaymentOption } from "@/lib/payments";
import type { WaitlistEntry, WaitlistEvent, WaitlistSettings } from "@/types/waitlist";
import {
  assignmentDecision,
  businessRefundRecord,
  buyerCancelAllowed,
  paymentConfirmation,
  snapshotAmount,
  validateWaitlistSubmission,
  WAITLIST_TERMS_VERSION,
} from "./rules";
import { isMissingWaitlistSchema } from "./schemaError";

const ENTRY_COLUMNS = [
  "id",
  "created_at",
  "updated_at",
  "buyer_name",
  "buyer_phone",
  "buyer_phone_digits",
  "buyer_email",
  "breed_preference",
  "sex_preference",
  "note",
  "amount_cents",
  "currency",
  "terms_version",
  "terms_accepted_at",
  "payment_status",
  "confirmed_amount_cents",
  "payment_confirmed_at",
  "payment_mismatch",
  "mismatch_resolved_at",
  "mismatch_resolution_note",
  "handling_status",
  "close_reason",
  "closed_at",
  "sort_position",
  "admin_note",
  "pass_count",
  "credit_status",
  "assigned_dog_id",
  "credit_applied_cents",
  "credit_applied_at",
  "excess_resolution_note",
  "refund_status",
  "refund_amount_cents",
  "refund_reason",
  "refund_reference",
  "refund_approved_at",
  "refund_returned_at",
].join(",");

export type SchemaGap = { schemaMissing: true };
export type DbFail = { schemaMissing: false; error: string };

function gapOrFail(error: { code?: string; message?: string } | null): SchemaGap | DbFail {
  if (error && isMissingWaitlistSchema(error)) return { schemaMissing: true };
  return { schemaMissing: false, error: error?.message || "Waitlist request failed." };
}

export async function loadWaitlistSettings(): Promise<
  { ok: true; settings: WaitlistSettings } | SchemaGap | DbFail
> {
  const { data, error } = await supabaseAdmin
    .from("merchant_profile")
    .select("waitlist_enabled, waitlist_deposit_amount_cents, waitlist_deposit_currency")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return gapOrFail(error);
  if (!data) return { schemaMissing: false, error: "Merchant profile is missing." };

  const amount = Number(data.waitlist_deposit_amount_cents);
  if (!Number.isInteger(amount) || amount <= 0) {
    return { schemaMissing: false, error: "Waitlist deposit amount is not set." };
  }

  return {
    ok: true,
    settings: {
      enabled: Boolean(data.waitlist_enabled),
      amount_cents: amount,
      currency: "USD",
    },
  };
}

async function paymentOptions(cents: number): Promise<PaymentOption[]> {
  const { data } = await supabaseAdmin
    .from("merchant_profile")
    .select("cashapp_url, venmo_url, paypal_url, zelle_recipient")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return buildPaymentOptions(data, {
    amountCents: cents,
    note: "Wooof Village waitlist deposit",
  });
}

function publicPayload(
  entry: Pick<WaitlistEntry, "amount_cents" | "currency">,
  options: PaymentOption[],
  reused: "request" | "phone" | null
) {
  return {
    ok: true as const,
    reused,
    amount_cents: entry.amount_cents,
    currency: entry.currency,
    payment_options: options,
    terms_version: WAITLIST_TERMS_VERSION,
  };
}

async function findByRequestId(id: string) {
  return supabaseAdmin
    .from("waitlist_entries")
    .select(ENTRY_COLUMNS)
    .eq("client_request_id", id)
    .maybeSingle();
}

async function findOpenByPhone(digits: string) {
  return supabaseAdmin
    .from("waitlist_entries")
    .select(ENTRY_COLUMNS)
    .eq("buyer_phone_digits", digits)
    .eq("handling_status", "open")
    .maybeSingle();
}

function duplicateKind(error: { code?: string; message?: string; details?: string } | null) {
  if (error?.code !== "23505") return null;
  const blob = `${error.message ?? ""} ${error.details ?? ""}`;
  if (blob.includes("client_request_id")) return "request" as const;
  if (blob.includes("phone")) return "phone" as const;
  return null;
}

export async function createWaitlistEntry(body: Record<string, unknown>): Promise<
  | { ok: true; status: number; payload: ReturnType<typeof publicPayload> }
  | { ok: false; status: number; error: string; schemaMissing?: boolean }
> {
  const parsed = validateWaitlistSubmission(body);
  if (!parsed.ok) return { ok: false, status: 400, error: parsed.error };

  const settings = await loadWaitlistSettings();
  if (!("ok" in settings)) {
    if (settings.schemaMissing) {
      return {
        ok: false,
        status: 503,
        schemaMissing: true,
        error: "The waitlist is not available yet.",
      };
    }
    return { ok: false, status: 500, error: "The waitlist is not available yet." };
  }
  if (!settings.settings.enabled) {
    return { ok: false, status: 403, error: "The waitlist is not open right now." };
  }

  const existingRequest = await findByRequestId(parsed.value.clientRequestId);
  if (existingRequest.error) {
    const problem = gapOrFail(existingRequest.error);
    return {
      ok: false,
      status: problem.schemaMissing ? 503 : 500,
      schemaMissing: problem.schemaMissing,
      error: "The waitlist is not available yet.",
    };
  }
  if (existingRequest.data) {
    const entry = existingRequest.data as unknown as WaitlistEntry;
    return {
      ok: true,
      status: 200,
      payload: publicPayload(entry, await paymentOptions(entry.amount_cents), "request"),
    };
  }

  const existingPhone = await findOpenByPhone(parsed.value.buyerPhoneDigits);
  if (existingPhone.error) {
    return { ok: false, status: 500, error: "The waitlist is not available yet." };
  }
  if (existingPhone.data) {
    const entry = existingPhone.data as unknown as WaitlistEntry;
    return {
      ok: true,
      status: 200,
      payload: publicPayload(entry, await paymentOptions(entry.amount_cents), "phone"),
    };
  }

  const amount = snapshotAmount(settings.settings.amount_cents);
  const now = new Date().toISOString();
  const highest = await supabaseAdmin
    .from("waitlist_entries")
    .select("sort_position")
    .order("sort_position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sortPosition = (Number(highest.data?.sort_position) || 0) + 10;
  const { data: inserted, error } = await supabaseAdmin
    .from("waitlist_entries")
    .insert({
      buyer_name: parsed.value.buyerName,
      buyer_phone: parsed.value.buyerPhone,
      buyer_phone_digits: parsed.value.buyerPhoneDigits,
      buyer_email: parsed.value.buyerEmail,
      breed_preference: parsed.value.breedPreference,
      sex_preference: parsed.value.sexPreference,
      note: parsed.value.note,
      amount_cents: amount,
      currency: "USD",
      terms_version: parsed.value.termsVersion,
      terms_accepted_at: now,
      client_request_id: parsed.value.clientRequestId,
      sort_position: sortPosition,
    })
    .select(ENTRY_COLUMNS)
    .single();

  if (error) {
    const kind = duplicateKind(error);
    if (kind === "request") {
      const again = await findByRequestId(parsed.value.clientRequestId);
      if (again.data) {
        const entry = again.data as unknown as WaitlistEntry;
        return {
          ok: true,
          status: 200,
          payload: publicPayload(entry, await paymentOptions(entry.amount_cents), "request"),
        };
      }
    }
    if (kind === "phone") {
      const again = await findOpenByPhone(parsed.value.buyerPhoneDigits);
      if (again.data) {
        const entry = again.data as unknown as WaitlistEntry;
        return {
          ok: true,
          status: 200,
          payload: publicPayload(entry, await paymentOptions(entry.amount_cents), "phone"),
        };
      }
    }
    const problem = gapOrFail(error);
    return {
      ok: false,
      status: problem.schemaMissing ? 503 : 500,
      schemaMissing: problem.schemaMissing,
      error: "The waitlist is not available yet.",
    };
  }

  const entry = inserted as unknown as WaitlistEntry;

  await supabaseAdmin.from("waitlist_events").insert({
    entry_id: entry.id,
    kind: "submitted",
    note: "Request saved. Payment is not confirmed.",
    amount_cents: amount,
  });

  return {
    ok: true,
    status: 201,
    payload: publicPayload(
      { ...entry, amount_cents: amount },
      await paymentOptions(amount),
      null
    ),
  };
}

export async function saveWaitlistSettings(input: {
  enabled: boolean;
  amountCents: number;
}): Promise<{ ok: true; settings: WaitlistSettings } | SchemaGap | DbFail> {
  const current = await supabaseAdmin
    .from("merchant_profile")
    .select("id")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (current.error) return gapOrFail(current.error);
  if (!current.data?.id) return { schemaMissing: false, error: "Merchant profile is missing." };

  const { error } = await supabaseAdmin
    .from("merchant_profile")
    .update({
      waitlist_enabled: input.enabled,
      waitlist_deposit_amount_cents: input.amountCents,
      waitlist_deposit_currency: "USD",
      updated_at: new Date().toISOString(),
    })
    .eq("id", current.data.id);

  if (error) return gapOrFail(error);
  return {
    ok: true,
    settings: { enabled: input.enabled, amount_cents: input.amountCents, currency: "USD" },
  };
}

function searchToken(raw: string) {
  return raw.replace(/[%_,()*]/g, "").trim().slice(0, 80);
}

export async function listWaitlistEntries(rawQuery: string): Promise<
  { ok: true; entries: WaitlistEntry[] } | SchemaGap | DbFail
> {
  const token = searchToken(rawQuery);
  let query = supabaseAdmin.from("waitlist_entries").select(ENTRY_COLUMNS).limit(200);

  if (token) {
    const digits = token.replace(/\D/g, "");
    const clauses = [
      `buyer_name.ilike.%${token}%`,
      `buyer_email.ilike.%${token}%`,
      `buyer_phone.ilike.%${token}%`,
    ];
    if (digits.length >= 3) clauses.push(`buyer_phone_digits.ilike.%${digits}%`);
    query = query.or(clauses.join(",")).order("created_at", { ascending: false });
  } else {
    query = query
      .eq("handling_status", "open")
      .order("sort_position", { ascending: true })
      .order("created_at", { ascending: true });
  }

  const { data, error } = await query;
  if (error) return gapOrFail(error);
  return { ok: true, entries: (data ?? []) as unknown as WaitlistEntry[] };
}

export async function getWaitlistDetail(id: string): Promise<
  | {
      ok: true;
      entry: WaitlistEntry;
      events: WaitlistEvent[];
      dogs: { id: string; name: string; status: string; price_amount_cents: number | null }[];
      assigned_dog: { id: string; name: string; status: string; price_amount_cents: number | null } | null;
    }
  | SchemaGap
  | DbFail
> {
  const entryResult = await supabaseAdmin
    .from("waitlist_entries")
    .select(ENTRY_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (entryResult.error) return gapOrFail(entryResult.error);
  if (!entryResult.data) return { schemaMissing: false, error: "Entry not found." };

  const eventsResult = await supabaseAdmin
    .from("waitlist_events")
    .select("id, entry_id, created_at, kind, note, amount_cents")
    .eq("entry_id", id)
    .order("created_at", { ascending: true });
  if (eventsResult.error) return gapOrFail(eventsResult.error);

  const dogsResult = await supabaseAdmin
    .from("dogs")
    .select("id, name, status, price_amount_cents")
    .eq("status", "available")
    .order("sort_order", { ascending: true })
    .limit(100);
  if (dogsResult.error) return { schemaMissing: false, error: dogsResult.error.message };

  const entry = entryResult.data as unknown as WaitlistEntry;
  let assigned_dog = null;
  if (entry.assigned_dog_id) {
    const assigned = await supabaseAdmin
      .from("dogs")
      .select("id, name, status, price_amount_cents")
      .eq("id", entry.assigned_dog_id)
      .maybeSingle();
    assigned_dog = assigned.data;
  }

  return {
    ok: true,
    entry,
    events: (eventsResult.data ?? []) as WaitlistEvent[],
    dogs: dogsResult.data ?? [],
    assigned_dog,
  };
}

async function addEvent(entryId: string, kind: string, note: string, amount: number | null) {
  await supabaseAdmin.from("waitlist_events").insert({
    entry_id: entryId,
    kind,
    note,
    amount_cents: amount,
  });
}

async function loadEntry(id: string) {
  return supabaseAdmin.from("waitlist_entries").select(ENTRY_COLUMNS).eq("id", id).maybeSingle();
}

export async function actOnWaitlistEntry(
  id: string,
  body: Record<string, unknown>
): Promise<{ ok: true } | SchemaGap | DbFail> {
  const action = String(body.action ?? "");
  const current = await loadEntry(id);
  if (current.error) return gapOrFail(current.error);
  if (!current.data) return { schemaMissing: false, error: "Entry not found." };
  const entry = current.data as unknown as WaitlistEntry;
  const now = new Date().toISOString();

  if (action === "confirm_payment") {
    const received =
      body.received_amount_cents == null
        ? entry.amount_cents
        : Number(body.received_amount_cents);
    const decision = paymentConfirmation({
      snapshotCents: entry.amount_cents,
      receivedCents: received,
      resolutionNote: body.resolution_note == null ? null : String(body.resolution_note),
    });
    if (!decision.ok) return { schemaMissing: false, error: decision.error };

    const { error } = await supabaseAdmin
      .from("waitlist_entries")
      .update({
        payment_status: "confirmed",
        confirmed_amount_cents: decision.confirmedCents,
        payment_confirmed_at: now,
        payment_mismatch: decision.mismatch,
        mismatch_resolved_at: decision.mismatch ? now : null,
        mismatch_resolution_note: decision.mismatch ? String(body.resolution_note).trim() : null,
        updated_at: now,
      })
      .eq("id", id);
    if (error) return gapOrFail(error);
    await addEvent(
      id,
      "payment_confirmed",
      decision.mismatch
        ? `Confirmed ${decision.confirmedCents} cents. Saved deposit was ${entry.amount_cents} cents. ${String(body.resolution_note).trim()}`
        : `Confirmed ${decision.confirmedCents} cents, matching the saved deposit.`,
      decision.confirmedCents
    );
    return { ok: true };
  }

  if (action === "pass") {
    if (entry.handling_status !== "open") {
      return { schemaMissing: false, error: "This entry is closed." };
    }
    const { error } = await supabaseAdmin
      .from("waitlist_entries")
      .update({ pass_count: entry.pass_count + 1, updated_at: now })
      .eq("id", id);
    if (error) return gapOrFail(error);
    await addEvent(id, "passed", "Buyer passed on this batch. Deposit stays active.", null);
    return { ok: true };
  }

  if (action === "buyer_cancel") {
    const allowed = buyerCancelAllowed({
      handlingStatus: entry.handling_status,
      creditStatus: entry.credit_status,
    });
    if (!allowed.ok) return { schemaMissing: false, error: allowed.error };
    const { error } = await supabaseAdmin
      .from("waitlist_entries")
      .update({
        handling_status: "closed",
        close_reason: "buyer_cancel",
        closed_at: now,
        updated_at: now,
      })
      .eq("id", id);
    if (error) return gapOrFail(error);
    await addEvent(id, "buyer_cancelled", "Buyer cancelled. Deposit is not refunded.", null);
    return { ok: true };
  }

  if (action === "business") {
    const record = businessRefundRecord({
      refundStatus: String(body.refund_status ?? "none"),
      amountCents: body.refund_amount_cents == null ? null : Number(body.refund_amount_cents),
      reason: body.refund_reason == null ? null : String(body.refund_reason),
      reference: body.refund_reference == null ? null : String(body.refund_reference),
    });
    if (!record.ok) return { schemaMissing: false, error: record.error };

    const close = body.close === true;
    const { error } = await supabaseAdmin
      .from("waitlist_entries")
      .update({
        refund_status: record.refundStatus,
        refund_amount_cents: record.amountCents,
        refund_reason: record.reason,
        refund_reference: record.reference,
        refund_approved_at: record.refundStatus === "none" ? null : entry.refund_approved_at ?? now,
        refund_returned_at: record.refundStatus === "returned" ? now : null,
        handling_status: close ? "closed" : entry.handling_status,
        close_reason: close ? "business" : entry.close_reason,
        closed_at: close ? now : entry.closed_at,
        updated_at: now,
      })
      .eq("id", id);
    if (error) return gapOrFail(error);
    await addEvent(
      id,
      "business_case",
      `Business case. Refund status: ${record.refundStatus}.${close ? " Entry closed." : ""} ${record.reason ?? ""}`.trim(),
      record.amountCents
    );
    return { ok: true };
  }

  if (action === "note") {
    const note = String(body.admin_note ?? "").trim().slice(0, 2000);
    const { error } = await supabaseAdmin
      .from("waitlist_entries")
      .update({ admin_note: note || null, updated_at: now })
      .eq("id", id);
    if (error) return gapOrFail(error);
    if (note) await addEvent(id, "note", note, null);
    return { ok: true };
  }

  if (action === "reorder") {
    const direction = body.direction === "later" ? "later" : "earlier";
    const open = await supabaseAdmin
      .from("waitlist_entries")
      .select("id")
      .eq("handling_status", "open")
      .order("sort_position", { ascending: true })
      .order("created_at", { ascending: true });
    if (open.error) return gapOrFail(open.error);
    const ids = (open.data ?? []).map((row) => row.id as string);
    const index = ids.indexOf(id);
    const swapWith = direction === "earlier" ? index - 1 : index + 1;
    if (index < 0 || swapWith < 0 || swapWith >= ids.length) return { ok: true };
    const next = [...ids];
    const [moved] = next.splice(index, 1);
    next.splice(swapWith, 0, moved);
    for (let i = 0; i < next.length; i += 1) {
      const { error } = await supabaseAdmin
        .from("waitlist_entries")
        .update({ sort_position: (i + 1) * 10, updated_at: now })
        .eq("id", next[i]);
      if (error) return gapOrFail(error);
    }
    await addEvent(id, "reordered", `Moved ${direction} in the choosing order.`, null);
    return { ok: true };
  }

  if (action === "assign") {
    const dogId = String(body.dog_id ?? "");
    if (!/^[0-9a-f-]{36}$/i.test(dogId)) {
      return { schemaMissing: false, error: "Choose a puppy." };
    }
    const dog = await supabaseAdmin
      .from("dogs")
      .select("id, status, price_amount_cents")
      .eq("id", dogId)
      .maybeSingle();
    if (dog.error) return { schemaMissing: false, error: dog.error.message };
    const decision = assignmentDecision({
      paymentStatus: entry.payment_status,
      confirmedCents: entry.confirmed_amount_cents,
      creditStatus: entry.credit_status,
      handlingStatus: entry.handling_status,
      mismatch: entry.payment_mismatch,
      mismatchResolved: Boolean(entry.mismatch_resolved_at),
      puppyStatus: dog.data?.status ?? null,
      puppyPriceCents: dog.data?.price_amount_cents ?? null,
      excessNote: body.excess_note == null ? null : String(body.excess_note),
    });
    if (!decision.ok) return { schemaMissing: false, error: decision.error };

    const rpc = await supabaseAdmin.rpc("waitlist_assign_puppy", {
      p_entry_id: id,
      p_dog_id: dogId,
      p_excess_note: body.excess_note == null ? null : String(body.excess_note),
    });
    if (rpc.error) return gapOrFail(rpc.error);
    const payload = rpc.data as { ok?: boolean; error?: string } | null;
    if (!payload?.ok) {
      return { schemaMissing: false, error: payload?.error || "Could not assign that puppy." };
    }
    return { ok: true };
  }

  return { schemaMissing: false, error: "Unknown action." };
}
