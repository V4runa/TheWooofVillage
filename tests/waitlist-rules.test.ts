import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assignmentDecision,
  businessRefundRecord,
  buyerCancelAllowed,
  dollarsToCents,
  paymentConfirmation,
  phoneDigits,
  preservedSnapshot,
  snapshotAmount,
  validateWaitlistSubmission,
  WAITLIST_TERMS_VERSION,
} from "../lib/waitlist/rules.ts";

const validBody = {
  buyer_name: "Ada Lovelace",
  buyer_phone: "(407) 555-0100",
  buyer_email: "Ada@Example.com",
  terms_accepted: true,
  terms_version: WAITLIST_TERMS_VERSION,
  client_request_id: "11111111-1111-4111-8111-111111111111",
  breed_preference: "Cavapoo",
  sex_preference: "female",
  note: "A calm puppy",
  amount_cents: 1,
};

describe("waitlist submission", () => {
  it("requires name, phone, and email and ignores a client amount", () => {
    const result = validateWaitlistSubmission(validBody);
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.value.buyerEmail, "ada@example.com");
    assert.equal(result.value.buyerPhoneDigits, "4075550100");
    assert.equal(result.value.sexPreference, "Female");
    assert.equal(snapshotAmount(50000), 50000);
    assert.equal("amount_cents" in result.value, false);
  });

  it("rejects a missing email and a skipped acknowledgment", () => {
    const noEmail = validateWaitlistSubmission({ ...validBody, buyer_email: "" });
    assert.equal(noEmail.ok, false);
    const noTerms = validateWaitlistSubmission({ ...validBody, terms_accepted: false });
    assert.equal(noTerms.ok, false);
  });

  it("keeps breed, sex, and note optional", () => {
    const result = validateWaitlistSubmission({
      ...validBody,
      breed_preference: "",
      sex_preference: "",
      note: "",
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.value.breedPreference, null);
    assert.equal(result.value.sexPreference, null);
    assert.equal(result.value.note, null);
  });
});

describe("payment and credit", () => {
  it("confirms an exact amount without a buyer reference", () => {
    const result = paymentConfirmation({
      snapshotCents: 50000,
      receivedCents: 50000,
      resolutionNote: null,
    });
    assert.deepEqual(result, { ok: true, confirmedCents: 50000, mismatch: false });
  });

  it("requires an explicit note when the received amount differs", () => {
    const blocked = paymentConfirmation({
      snapshotCents: 50000,
      receivedCents: 40000,
      resolutionNote: "",
    });
    assert.equal(blocked.ok, false);
    const allowed = paymentConfirmation({
      snapshotCents: 50000,
      receivedCents: 40000,
      resolutionNote: "Received 400 and will credit 400.",
    });
    assert.equal(allowed.ok, true);
    if (!allowed.ok) return;
    assert.equal(allowed.confirmedCents, 40000);
  });

  it("does not rewrite a saved snapshot when the default changes", () => {
    assert.equal(preservedSnapshot(50000, 70000), 50000);
  });

  it("credits the confirmed amount once and blocks a second use", () => {
    const first = assignmentDecision({
      paymentStatus: "confirmed",
      confirmedCents: 50000,
      creditStatus: "unused",
      handlingStatus: "open",
      mismatch: false,
      mismatchResolved: false,
      puppyStatus: "available",
      puppyPriceCents: 160000,
      excessNote: null,
    });
    assert.equal(first.ok, true);
    if (!first.ok) return;
    assert.equal(first.creditCents, 50000);
    assert.equal(first.nextDogStatus, "reserved");

    const second = assignmentDecision({
      paymentStatus: "confirmed",
      confirmedCents: 50000,
      creditStatus: "applied",
      handlingStatus: "open",
      mismatch: false,
      mismatchResolved: false,
      puppyStatus: "available",
      puppyPriceCents: 160000,
      excessNote: null,
    });
    assert.equal(second.ok, false);
  });

  it("does not assign an unavailable puppy or drop excess credit", () => {
    const sold = assignmentDecision({
      paymentStatus: "confirmed",
      confirmedCents: 50000,
      creditStatus: "unused",
      handlingStatus: "open",
      mismatch: false,
      mismatchResolved: false,
      puppyStatus: "sold",
      puppyPriceCents: 10000,
      excessNote: null,
    });
    assert.equal(sold.ok, false);

    const excess = assignmentDecision({
      paymentStatus: "confirmed",
      confirmedCents: 50000,
      creditStatus: "unused",
      handlingStatus: "open",
      mismatch: false,
      mismatchResolved: false,
      puppyStatus: "available",
      puppyPriceCents: 20000,
      excessNote: "",
    });
    assert.equal(excess.ok, false);

    const resolved = assignmentDecision({
      paymentStatus: "confirmed",
      confirmedCents: 50000,
      creditStatus: "unused",
      handlingStatus: "open",
      mismatch: false,
      mismatchResolved: false,
      puppyStatus: "available",
      puppyPriceCents: 20000,
      excessNote: "Buyer accepts the extra as a credit note, not a silent write-off.",
    });
    assert.equal(resolved.ok, true);
    if (!resolved.ok) return;
    assert.equal(resolved.creditCents, 50000);
  });
});

describe("cancellations", () => {
  it("lets a buyer cancel only while the deposit is unused", () => {
    assert.equal(buyerCancelAllowed({ handlingStatus: "open", creditStatus: "unused" }).ok, true);
    assert.equal(buyerCancelAllowed({ handlingStatus: "open", creditStatus: "applied" }).ok, false);
  });

  it("separates a recorded manual refund from closing an entry", () => {
    const missing = businessRefundRecord({
      refundStatus: "returned",
      amountCents: null,
      reason: "Could not place a puppy",
      reference: "zelle 9",
    });
    assert.equal(missing.ok, false);

    const recorded = businessRefundRecord({
      refundStatus: "returned",
      amountCents: 50000,
      reason: "Could not place a puppy",
      reference: "zelle 9",
    });
    assert.equal(recorded.ok, true);
    if (!recorded.ok) return;
    assert.equal(recorded.amountCents, 50000);
    assert.equal(recorded.refundStatus, "returned");
  });
});

describe("helpers", () => {
  it("parses dollars and phone numbers", () => {
    assert.equal(dollarsToCents("$500.00"), 50000);
    assert.equal(dollarsToCents("500.001"), null);
    assert.equal(phoneDigits("1 (407) 555-0100"), "4075550100");
  });
});
