import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { canDeleteWaitlistEntry, isWaitlistId } from "../lib/waitlist/rules.ts";

describe("delete waitlist request guards", () => {
  it("requires an admin check before the delete runs", () => {
    const source = readFileSync(
      new URL("../app/api/admin/waitlist/[id]/route.ts", import.meta.url),
      "utf8"
    );
    const handler = source.slice(source.indexOf("export async function DELETE"));
    assert.match(handler, /requireAdmin\(req\)/);
    assert.ok(handler.indexOf("requireAdmin") < handler.indexOf("deleteWaitlistEntry"));
    assert.match(handler, /status: 404/);
    assert.match(handler, /status: 409/);
  });

  it("rejects a malformed id and a second delete of a financial record", () => {
    assert.equal(isWaitlistId("not-an-id"), false);
    assert.equal(isWaitlistId("11111111-1111-4111-8111-111111111111"), true);
    const blocked = canDeleteWaitlistEntry({
      paymentStatus: "confirmed",
      confirmedCents: 50000,
      creditStatus: "unused",
      assignedDogId: null,
      refundStatus: "none",
      creditAppliedCents: null,
    });
    assert.equal(blocked.ok, false);
  });
});
