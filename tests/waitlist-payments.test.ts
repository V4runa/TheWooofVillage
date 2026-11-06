import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPaymentOptions } from "../lib/payments.ts";

const configured = {
  cashapp_url: "$shop",
  venmo_url: "@shop",
  paypal_url: "shop",
  zelle_recipient: "5550001111",
};

describe("waitlist payment options", () => {
  it("uses the server snapshot amount in the same app links as a puppy page", () => {
    const options = buildPaymentOptions(configured, {
      amountCents: 50000,
      note: "Wooof Village waitlist deposit",
    });

    assert.deepEqual(
      options.map((option) => option.id),
      ["cashapp", "venmo", "paypal", "zelle"]
    );
    assert.equal(options[0]?.href, "https://cash.app/$shop/500.00");
    assert.match(options[1]?.href ?? "", /amount=500\.00/);
    assert.match(options[1]?.href ?? "", /note=Wooof\+Village\+waitlist\+deposit/);
    assert.equal(options[2]?.href, "https://paypal.me/shop/500.00");
    assert.equal(options[3]?.href, null);
    assert.equal(options[3]?.manual, true);
    assert.equal(options[1]?.prefillsAmount, false);
    assert.equal(options[0]?.prefillsAmount, true);
  });

  it("does not invent payment apps when none are configured", () => {
    assert.deepEqual(buildPaymentOptions(null, { amountCents: 50000 }), []);
    assert.deepEqual(buildPaymentOptions({}, { amountCents: 50000 }), []);
    assert.deepEqual(
      buildPaymentOptions(
        { cashapp_url: null, venmo_url: "", paypal_url: null, zelle_recipient: "  " },
        { amountCents: 50000 }
      ).map((option) => option.id),
      []
    );
  });

  it("keeps a stale client amount out of the links", () => {
    const saved = buildPaymentOptions(configured, { amountCents: 50000 });
    const tampered = buildPaymentOptions(configured, { amountCents: 100 });
    assert.equal(saved[0]?.href, "https://cash.app/$shop/500.00");
    assert.equal(tampered[0]?.href, "https://cash.app/$shop/1.00");
    assert.notEqual(saved[0]?.href, tampered[0]?.href);
  });
});
