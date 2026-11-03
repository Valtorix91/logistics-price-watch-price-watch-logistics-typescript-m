import test from "node:test";
import assert from "node:assert/strict";
import { decideException, shipmentEventSchema } from "./exception_decision.ts";

test("a delayed shipment becomes a review exception", () => {
  const event = shipmentEventSchema.parse({
    shipmentId: "SHP-2048",
    carrier: "Northline",
    event: "delayed",
    expectedDays: 4,
    actualDays: 6
  });
  assert.deepEqual(decideException(event), {
    status: "review",
    reason: "delivery exceeded the expected transit time"
  });
});
