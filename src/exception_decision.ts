import { z } from "zod";

export const shipmentEventSchema = z.object({
  shipmentId: z.string().min(1),
  carrier: z.string().min(1),
  event: z.enum(["delivered", "delayed", "damaged"]),
  expectedDays: z.number().int().positive(),
  actualDays: z.number().int().nonnegative(),
  proofOfDeliveryUrl: z.string().url().optional()
});

export type ShipmentEvent = z.infer<typeof shipmentEventSchema>;

export type ExceptionDecision = {
  status: "clear" | "review";
  reason: string;
};

export function decideException(event: ShipmentEvent): ExceptionDecision {
  if (event.event === "damaged") {
    return { status: "review", reason: "damage needs proof-of-delivery review" };
  }
  if (event.event === "delayed" && event.actualDays > event.expectedDays) {
    return { status: "review", reason: "delivery exceeded the expected transit time" };
  }
  return { status: "clear", reason: "shipment is within the expected service promise" };
}
