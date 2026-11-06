/**
 * Waitlist decisions that must not depend on the database.
 * API routes and tests both use these so a browser cannot set the amount,
 * a reference code, or a second credit.
 */

export const WAITLIST_TERMS_VERSION = "2026-11-06";

export const WAITLIST_TERMS_TEXT =
  "The deposit is for a future puppy, not one of today's listings. If you cancel, the deposit is not refunded. If you pass on a batch, the deposit stays active so you can choose from a later batch. We choose the order in which buyers pick, and we confirm the money ourselves before contacting you. The confirmed amount is credited once toward the puppy you choose. If we cannot fulfill a request, we decide any refund case by case. You do not get a reference number.";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type WaitlistSubmission = {
  buyerName: string;
  buyerPhone: string;
  buyerPhoneDigits: string;
  buyerEmail: string;
  breedPreference: string | null;
  sexPreference: "Female" | "Male" | null;
  colorPreference: string | null;
  note: string | null;
  clientRequestId: string;
  termsVersion: string;
};

export function formatUsd(cents: number): string {
  const negative = cents < 0;
  const abs = Math.abs(Math.trunc(cents));
  const dollars = Math.floor(abs / 100);
  const remainder = String(abs % 100).padStart(2, "0");
  return `${negative ? "-" : ""}$${dollars}.${remainder}`;
}

/** Accepts "500", "500.00", or "$500.00". Rejects extra precision and non-positive amounts. */
export function dollarsToCents(input: string): number | null {
  const cleaned = input.trim().replace(/[$,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const [whole, fraction = ""] = cleaned.split(".");
  const cents = Number(whole) * 100 + Number((fraction + "00").slice(0, 2));
  if (!Number.isInteger(cents) || cents <= 0 || cents > 10_000_000) return null;
  return cents;
}

export function phoneDigits(input: string): string | null {
  let digits = input.trim().replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  if (digits.length < 10 || digits.length > 15) return null;
  return digits;
}

export function normalizeEmail(input: string): string | null {
  const email = input.trim().toLowerCase();
  if (!email || email.length > 120 || !EMAIL_RE.test(email)) return null;
  return email;
}

function cleanOptional(input: unknown, max: number): string | null {
  const value = String(input ?? "").trim();
  if (!value) return null;
  return value.slice(0, max);
}

export function validateWaitlistSubmission(body: Record<string, unknown>):
  | { ok: true; value: WaitlistSubmission }
  | { ok: false; error: string } {
  const buyerName = String(body.buyer_name ?? "").trim();
  if (buyerName.length < 1 || buyerName.length > 80) {
    return { ok: false, error: "Please enter your name." };
  }

  const buyerPhoneDigits = phoneDigits(String(body.buyer_phone ?? ""));
  if (!buyerPhoneDigits) {
    return { ok: false, error: "Please enter a phone number." };
  }

  const buyerEmail = normalizeEmail(String(body.buyer_email ?? ""));
  if (!buyerEmail) {
    return { ok: false, error: "Please enter an email address." };
  }

  if (body.terms_accepted !== true) {
    return { ok: false, error: "Please accept the deposit terms." };
  }
  if (body.terms_version !== WAITLIST_TERMS_VERSION) {
    return { ok: false, error: "Please refresh the page and accept the current terms." };
  }

  const clientRequestId = String(body.client_request_id ?? "").trim();
  if (!UUID_RE.test(clientRequestId)) {
    return { ok: false, error: "Please try submitting again." };
  }

  const sexRaw = String(body.sex_preference ?? "").trim().toLowerCase();
  let sexPreference: "Female" | "Male" | null = null;
  if (sexRaw === "female") sexPreference = "Female";
  else if (sexRaw === "male") sexPreference = "Male";
  else if (sexRaw && sexRaw !== "no preference") {
    return { ok: false, error: "Choose female, male, or leave sex blank." };
  }

  const colorRaw = String(body.color_preference ?? "").trim();
  if (colorRaw.length > 40) {
    return { ok: false, error: "Color preference must be 40 characters or fewer." };
  }

  return {
    ok: true,
    value: {
      buyerName,
      buyerPhone: String(body.buyer_phone ?? "").trim().slice(0, 32),
      buyerPhoneDigits,
      buyerEmail,
      breedPreference: cleanOptional(body.breed_preference, 80),
      sexPreference,
      colorPreference: colorRaw || null,
      note: cleanOptional(body.note, 500),
      clientRequestId,
      termsVersion: WAITLIST_TERMS_VERSION,
    },
  };
}

/** The browser never chooses the charged amount. */
export function snapshotAmount(settingsCents: number): number {
  return settingsCents;
}

export function paymentConfirmation(input: {
  snapshotCents: number;
  receivedCents: number;
  resolutionNote: string | null;
}):
  | { ok: true; confirmedCents: number; mismatch: boolean }
  | { ok: false; error: string } {
  if (!Number.isInteger(input.receivedCents) || input.receivedCents <= 0) {
    return { ok: false, error: "Enter the amount you actually received." };
  }
  if (input.receivedCents > 10_000_000) {
    return { ok: false, error: "That amount is too large." };
  }
  const mismatch = input.receivedCents !== input.snapshotCents;
  const note = input.resolutionNote?.trim() ?? "";
  if (mismatch && note.length < 3) {
    return {
      ok: false,
      error: "The amount differs from the saved deposit. Write how you resolved it before confirming.",
    };
  }
  return { ok: true, confirmedCents: input.receivedCents, mismatch };
}

export function assignmentDecision(input: {
  paymentStatus: string;
  confirmedCents: number | null;
  creditStatus: string;
  handlingStatus: string;
  mismatch: boolean;
  mismatchResolved: boolean;
  puppyStatus: string | null;
  puppyPriceCents: number | null;
  excessNote: string | null;
}):
  | { ok: true; creditCents: number; nextDogStatus: "reserved" }
  | { ok: false; error: string } {
  if (input.handlingStatus !== "open") {
    return { ok: false, error: "This entry is closed." };
  }
  if (input.paymentStatus !== "confirmed" || input.confirmedCents == null) {
    return { ok: false, error: "Confirm the payment before assigning a puppy." };
  }
  if (input.creditStatus !== "unused") {
    return { ok: false, error: "This deposit was already credited." };
  }
  if (input.mismatch && !input.mismatchResolved) {
    return { ok: false, error: "Resolve the payment mismatch before assigning." };
  }
  if (input.puppyStatus !== "available") {
    return { ok: false, error: "Choose a puppy that is still available." };
  }
  const excess =
    input.puppyPriceCents != null && input.confirmedCents > input.puppyPriceCents;
  if (excess && (input.excessNote?.trim().length ?? 0) < 3) {
    return {
      ok: false,
      error:
        "The confirmed deposit is higher than this puppy's price. Record how you are handling the difference before assigning.",
    };
  }
  return { ok: true, creditCents: input.confirmedCents, nextDogStatus: "reserved" };
}

export function buyerCancelAllowed(input: {
  handlingStatus: string;
  creditStatus: string;
}): { ok: true } | { ok: false; error: string } {
  if (input.creditStatus === "applied") {
    return {
      ok: false,
      error: "This deposit was already applied. A buyer cancellation cannot undo that.",
    };
  }
  if (input.handlingStatus !== "open") {
    return { ok: false, error: "This entry is already closed." };
  }
  return { ok: true };
}

export function businessRefundRecord(input: {
  refundStatus: string;
  amountCents: number | null;
  reason: string | null;
  reference: string | null;
}):
  | {
      ok: true;
      refundStatus: "none" | "approved" | "returned";
      amountCents: number | null;
      reason: string | null;
      reference: string | null;
    }
  | { ok: false; error: string } {
  if (input.refundStatus === "none") {
    return {
      ok: true,
      refundStatus: "none",
      amountCents: null,
      reason: input.reason?.trim() || null,
      reference: null,
    };
  }
  if (input.refundStatus !== "approved" && input.refundStatus !== "returned") {
    return { ok: false, error: "Choose a refund status." };
  }
  const reason = input.reason?.trim() ?? "";
  if (reason.length < 3) {
    return { ok: false, error: "Write why this business refund was decided." };
  }
  if (input.amountCents == null || !Number.isInteger(input.amountCents) || input.amountCents <= 0) {
    return { ok: false, error: "Enter the refund amount. Closing the entry does not record a refund." };
  }
  const reference = input.reference?.trim() ?? "";
  if (input.refundStatus === "returned" && reference.length < 2) {
    return {
      ok: false,
      error: "Record the manual refund reference. The app does not send the money.",
    };
  }
  return {
    ok: true,
    refundStatus: input.refundStatus,
    amountCents: input.amountCents,
    reason,
    reference: reference || null,
  };
}

/** Changing today's default must not rewrite a saved deposit. */
export function preservedSnapshot(entryCents: number, nextDefaultCents: number): number {
  void nextDefaultCents;
  return entryCents;
}

export function isWaitlistId(value: string): boolean {
  return UUID_RE.test(value);
}

/**
 * Hard-delete is only for a request with no confirmed money, credit, or refund.
 * Those records stay so the history is not erased and no puppy is changed.
 */
export function canDeleteWaitlistEntry(entry: {
  paymentStatus: string;
  confirmedCents: number | null;
  creditStatus: string;
  assignedDogId: string | null;
  refundStatus: string;
  creditAppliedCents: number | null;
}): { ok: true } | { ok: false; error: string } {
  const hasMoney =
    entry.paymentStatus === "confirmed" ||
    entry.confirmedCents != null ||
    entry.creditStatus === "applied" ||
    entry.assignedDogId != null ||
    entry.creditAppliedCents != null ||
    entry.refundStatus !== "none";
  if (hasMoney) {
    return {
      ok: false,
      error:
        "This request has a confirmed payment, a credit, or a refund record, so it stays. Deleting it would erase that history and would not change the puppy.",
    };
  }
  return { ok: true };
}

export type QueueScan = {
  payment: string;
  next: string;
};

/** Plain labels for the admin queue. Does not change any saved status. */
export function buyerQueueLabel(entry: {
  paymentStatus: string;
  confirmedCents: number | null;
  savedCents: number;
  creditStatus: string;
  handlingStatus: string;
  closeReason: string | null;
  refundStatus: string;
}): QueueScan {
  if (entry.creditStatus === "applied") {
    return { payment: "Credited", next: "Assigned" };
  }
  if (entry.closeReason === "buyer_cancel") {
    return {
      payment: entry.paymentStatus === "confirmed" ? "Confirmed, not refunded" : "Not confirmed",
      next: "Buyer cancelled",
    };
  }
  if (entry.handlingStatus === "closed" && entry.closeReason === "business") {
    const payment =
      entry.refundStatus === "returned"
        ? "Refund recorded"
        : entry.refundStatus === "approved"
          ? "Refund approved, not returned"
          : "No refund recorded";
    return { payment, next: "Closed by the shop" };
  }
  if (entry.paymentStatus !== "confirmed") {
    return { payment: `Saved ${formatUsd(entry.savedCents)}`, next: "Confirm receipt" };
  }
  return {
    payment: `Confirmed ${formatUsd(entry.confirmedCents ?? entry.savedCents)}`,
    next: "Assign a puppy",
  };
}
