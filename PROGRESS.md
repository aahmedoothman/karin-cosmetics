# Karin development status

- Development branch: `development/karin-commerce`, based on `handoff/karin-current` (`1c82406`).
- Verified milestones: explicit WhatsApp choice in guest checkout (`b44197f`), sales and collections reports (`1dcce35`), and the current commit, `Match order list and CSV date filters`.
- Production baseline: Sites version 11 (`11b7940`). The development branch is not deployed. No production schema or data changes.

## Working baseline

The handoff includes the Arabic and English storefront, 17 authentic shade images, responsive campaign and usage guide, cart, three-step COD checkout, secret receipts, core order and product administration, approved catalog content, media uploads and a draft/publish store editor. The source includes existing Bosta safeguards and backup/restore tooling.

Guest checkout now requires explicit Yes/No for WhatsApp on the client and server. Overview and Reports now read actual orders for a selected Cairo calendar period, separately report recorded product value, confirmed payable, recorded collections and outstanding balances, and offer aggregate CSV download. The reports include status counts, recent order references, top shades by units and daily trends. Reports have a local Arabic/English control; the rest of the admin shell still needs localization.

The Orders list and its detailed CSV export share one server-side selection function for reference/search, status and optional Cairo date bounds. The list keeps pagination, and the export includes the full matched set.

## Verification for the checkout milestone

| Command | Result |
| --- | --- |
| `node node_modules/typescript/bin/tsc --noEmit --incremental false` | Passed |
| `node tests/redesign.regression.cjs` | 31 assertions passed, including required explicit Yes/No and idempotent recovery |
| `node tests/repairs.regression.cjs` | 13 assertions passed |
| `node tests/builder.unit.cjs` | 12 assertions passed |
| `node tests/shipping.mock.cjs` | 28 assertions passed, mocked carrier |
| `node scripts/run-framework.mjs build` | Passed |
| `node tests/reporting.unit.cjs` | 13 assertions passed on SQLite, including Cairo DST, cutoff dates and excluded returns/cancellations |
| `TEST_BASE_URL=http://127.0.0.1:5195 node tests/commerce.integration.cjs` | 50 assertions passed against the isolated Worker and local D1, including list/export filter parity and invalid date rejection |
| Report HTTP smoke check | 6 assertions passed, including anonymous rejection, authenticated CSV and invalid date rejection |
| Browser checks | 96 combinations of homepage, shop, product and guide at 320/375/390/768/1024/1440 px, Arabic/English, light/dark, with no document-level horizontal overflow. Also verified required WhatsApp selection at 375 px and admin report date filtering/CSV link. |

No production customer records or real shipments were used. The checked-in migrations `0000`–`0002` are the existing schema. No new migrations in this milestone.

## Remaining and external dependencies

- Partially implemented: customer records derived from orders, visual editor, media organization, bilingual admin, advanced analytics and shipping operations.
- Remaining: coupons with transactional limits, staff permissions, broader catalog/SEO controls, and advanced editor/media workflows.
- External setup: Bosta credentials and pickup address; verified business contact details and approved policies/specifications; optional analytics and notification accounts.
- QA limits: physical iPhone/Safari and a controlled production shipping test have not been performed. No live staging site is configured.
- Next implementation step: implement a coupon vertical slice, starting with isolated schema and server tests for transaction-safe usage limits, then carry the discount snapshot through checkout, confirmation, receipt, shipping and reports.

## Recovery and catalog import milestone — 2026-11-09

Recovery confirmed a clean development checkout at bc96785af5ab2b1d3eae5ac034aa5f17c60ce048; GitHub had the identical SHA. No interrupted uncommitted changes were present.

Implemented safe catalog CSV preview using one tested parser/validator wired into the existing administration screen. Malformed quoting, unknown headers, invalid availability, non-decimal/over-precision prices, overlong names/descriptions, duplicate IDs and missing collections are rejected before save. Existing galleries, omitted fields and revision tokens are preserved. Import submission has a synchronous duplicate-click guard; partial failures report the original source line. Existing server authorization, per-row concurrency and audit behavior are reused. Imports are sequential and can partially complete; they are not atomic bulk transactions.

Executed in this milestone: TypeScript --noEmit --incremental false passed; production build passed; product-csv.unit 30 assertions; builder.unit 12; redesign.regression 31; repairs.regression 13; reporting.unit 13. All passed. Browser and live HTTP integration suites were not rerun in this milestone. No real orders or shipments were created.

No schema changes or migrations, no production access or deployment. Source and test files only; generated builds, local databases and credentials remain ignored.

Module review: product CRUD, family editing, archive/restore and CSV transfer exist; catalog management is not yet a complete platform module. Customers are currently a read-only order-derived summary. Orders have existing edit/workflow/shipping safeguards. Reports are real period-filtered aggregates. Coupons and staff RBAC are absent. Builder supports documents, previews, drafts/publishing/history but needs broader workflow QA. Integrations still require real credentials and verification; no new connection was configured.

Next priority: finish catalog/collection integrity (reject removal of collections referenced by products, including archived products; concurrency tests), improve dedicated collection management and catalog search. Then complete customer operations, coupon transactions and staff permissions in separate verified milestones. Preserve order price snapshots and existing IDs. Bosta credentials and pickup address, analytics/notification provider setup and approved business content remain external inputs.

## Collection integrity milestone — saved at user stop request, 2026-11-09

Previous pushed milestone: f82bdefd5988097a8e466dd12b248f6e784bd304 (catalog CSV). Completed collection integrity: product writes verify collection membership atomically; settings writes cannot remove a collection referenced by active or archived products. Both race orderings are guarded in SQL. Audit snapshots are written only after successful writes in the same transaction, preventing false revision history on conflicts. Admin now explains when a collection remains in use. Existing schemas, product IDs, order records and historical prices were preserved.

Executed verification: catalog-write.unit.cjs 20 assertions passed; catalog-api.integration.cjs 12 assertions passed against an in-memory database using real API handlers, including authorization, origin checks, archival, collection removal, concurrent revisions and audit history. TypeScript passed. After final API/UI changes, redesign.regression.cjs 31 assertions and repairs.regression.cjs 13 assertions passed; production build passed. Browser and network HTTP tests were not rerun. Tests used synthetic fixtures only, no real shipments.

No migration or production deployment performed. Development stopped at explicit user request. Remaining: dedicated collection management UX and search, complete customer operations, coupons, staff roles, remaining builder and integrations work described above. Next session must first verify branch/status and this commit, then resume only when authorized. Do not treat partial admin modules as complete. No credentials, customer exports or database backups are included in this milestone.

## Animated product cards — 2026-11-09

The home collection, shop grid and related shades now share the blush-pink Crazy Colors card. Each uses the original bottle source and its existing responsive WebP variants, with no changes to artwork. Product IDs, links, localized names, prices and availability come from the existing catalog. The fuchsia button uses the existing cart flow and respects paused ordering.

The decorative SVG strands take their colour from each shade. On desktop, two layers move in opposite directions as the bottle lifts and the background light brightens. The transitions reverse on pointer exit. Touch layouts and reduced-motion settings keep the artwork still.

Verification: TypeScript and the production build passed. The local Chrome run passed 32 checks covering all 17 catalog entries, hover interpolation and exit, reduced motion, Arabic RTL and English LTR at 320, 375 and 390 px, cart adds and product navigation. The redesign regression suite passed 31 assertions and the repairs regression suite passed 13. The mobile checks used Chrome device emulation.

Checkout, authentication and schemas were outside this change. No production resources were accessed or deployed. Existing administration work remains documented above.

## Cinematic storefront, stage 1

Built the editorial homepage with original campaign imagery and catalog packaging, all-shade discovery, a featured product preview, guide and brand teasers, a shared palette and a reduced-motion-aware reveal system. Product cards now animate shade-tinted photographic texture independently of the bottle. Stage 1 passed TypeScript, the production build, 31 redesign assertions and 32 Chrome checks for catalog mapping, card animation, reduced motion, mobile layouts, cart and links. Development branch only.

## Cinematic storefront, stage 2

The shop has a responsive catalog banner and desktop filter rail. Product detail, cart, checkout and receipt now share the editorial palette and commerce surfaces. The cart keeps its mobile dialog and gains a desktop order-summary column. Shade and checkout transitions respect reduced motion. Catalog, quantity, delivery, cash on delivery, checkout, order, receipt and privacy logic were preserved.

Stage 2 passed TypeScript, the production build, 32 Chrome checks, 44 regression assertions and 50 local Worker commerce assertions using synthetic data. No production access or deployment.
