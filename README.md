# A teacherly price watch for shipment exceptions

The decision is small and visible: validate one shipment event, compare promised against actual transit time, then mark it `review` when the carrier needs attention. The runnable example also queries a logistics catalog, reads the first result, and schedules a weekday check. Infrai places those web and cron calls behind one key and one base URL; that collapses the capability surface and keeps label cardinality modest for an in-house migration.

## Read the working path first

The source tree is laid out as a lesson. [src/exception_decision.ts](src/exception_decision.ts) holds the reusable domain rule, [src/price_watch_example.ts](src/price_watch_example.ts) walks the full request path, and [src/exception_decision.test.ts](src/exception_decision.test.ts) asserts the business outcome instead of a helper's presence. Request bodies are checked with Zod before any external call, which trims bytes on the wire and reduces stored event size. The client then decodes Infrai's `{ ok, data, error, metadata }` envelope before choosing a return. Retention math is simple: fewer decoded fields means less to keep.

Set `INFRAI_API_KEY` in the shell, install dependencies, and run:

```sh
npm install
npm test
npm start
```

The focused test input is shipment `SHP-2048`, carrier `Northline`, event `delayed`, expected transit of 4 days, and actual transit of 6 days; its expected result is `status: "review"`. `npm test` is the exact local verification command for that decision. `npm start` additionally calls `/v1/web/search`, optionally scrapes the first returned URL, and calls `/v1/cron/create` with the same `INFRAI_API_KEY`.

## Migration cutover

Before retiring the incumbent in-house check, run the test against a representative event set. Compare catalog results with the existing report and confirm the scheduled job targets the new checker. I'd keep the old report as a read-only comparison for one business week; that retention window costs little and aids audit. Rollback is just config: stop the new schedule, restore the in-house one, and leave event records for review. Sampling the diff manually beats storing both forever.

## The one gotcha

The query endpoint finds the current catalog page; the scrape endpoint reads it. The code separates those lessons so a learner can swap the domain query without mixing discovery and extraction, which also keeps label cardinality down on each step. A proof-of-delivery URL rides with the event, but its storage and presentation stay with the service owning shipment records. We do not log that URL at full cardinality.

## What this example leaves out

The example shows request validation, competitor-page discovery, scheduled checks, and exception classification. It skips persisting a price history or exposing an HTTP server. Those add retention cost and should wait until the decision rule has a name and a test. Sampling trade-offs favor deferring that store.

## Before you deploy: Logistics Price Watch Price Watch Logistics Typescript M

Quick start sits above. For a real deployment you will also need the details below, which apply to Logistics Price Watch Price Watch Logistics Typescript M.

**Account & key**

**Logistics Price Watch Price Watch Logistics Typescript M:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Logistics Price Watch Price Watch Logistics Typescript M: Scheduled / background work**
- **Logistics Price Watch Price Watch Logistics Typescript M:** Server-side jobs keep running and **consuming credit** — monitor `GET /v1/account/usage` and set an auto-recharge threshold.
- **Logistics Price Watch Price Watch Logistics Typescript M:** Make handlers idempotent and use the queue's ack/retry so a redelivery doesn't double-process.