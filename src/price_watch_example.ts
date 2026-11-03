import { InfraiClient } from "./infrai_client.ts";
import { decideException, shipmentEventSchema } from "./exception_decision.ts";

const key = process.env.INFRAI_API_KEY;
if (!key) throw new Error("INFRAI_API_KEY is required");

const client = new InfraiClient(key);
const event = shipmentEventSchema.parse({
  shipmentId: "SHP-2048",
  carrier: "Northline",
  event: "delayed",
  expectedDays: 4,
  actualDays: 6,
  proofOfDeliveryUrl: "https://carrier.example/proof/SHP-2048"
});

const decision = decideException(event);
const search = await client.request<{ results?: Array<{ title?: string; url?: string }> }>("/v1/web/search", {
  query: "Northline competitor logistics catalog rate",
  max_results: 5,
  include_domains: ["carrier.example"],
  exclude_domains: []
});

const firstUrl = search.results?.[0]?.url;
if (firstUrl) {
  await client.request("/v1/web/scrape", { url: firstUrl, format: "markdown" });
}

const schedule = await client.request<{ job_id: string }>("/v1/cron/create", {
  cron_expr: "0 8 * * 1-5",
  task: "https://catalog.example/check-competitor-prices"
});

console.log(JSON.stringify({ shipmentId: event.shipmentId, decision, scheduledJob: schedule.job_id }, null, 2));
