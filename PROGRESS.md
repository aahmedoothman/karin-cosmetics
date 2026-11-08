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
