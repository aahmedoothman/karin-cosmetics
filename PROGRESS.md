# Karin development status

- Development branch: `development/karin-commerce`, based on `handoff/karin-current` (`1c82406`).
- Last verified milestone: explicit WhatsApp choice in guest checkout, with shared server validation and no change to the legacy customer record format. The milestone commit is the checkout commit on this branch.
- Production baseline: Sites version 11 (`11b7940`). The development branch is not deployed. No production schema or data changes.

## Working baseline

The handoff includes the Arabic and English storefront, 17 authentic shade images, responsive campaign and usage guide, cart, three-step COD checkout, secret receipts, core order and product administration, approved catalog content, media uploads and a draft/publish store editor. The source includes existing Bosta safeguards and backup/restore tooling.

## Verification for the checkout milestone

| Command | Result |
| --- | --- |
| `node node_modules/typescript/bin/tsc --noEmit --incremental false` | Passed |
| `node tests/redesign.regression.cjs` | 31 assertions passed, including required explicit Yes/No and idempotent recovery |
| `node tests/repairs.regression.cjs` | 13 assertions passed |
| `node tests/builder.unit.cjs` | 12 assertions passed |
| `node tests/shipping.mock.cjs` | 28 assertions passed, mocked carrier |
| `node scripts/run-framework.mjs build` | Passed |

No production customer records or real shipments were used. The checked-in migrations `0000`–`0002` are the existing schema. No new migrations in this milestone.

## Remaining and external dependencies

- Partially implemented: overview and analytics, customer records derived from orders, visual editor, media organization, bilingual admin and shipping operations.
- Remaining: business reporting with date filters and meaningful payment totals, coupons with transactional limits, staff permissions, broader catalog/SEO controls, and advanced editor/media workflows.
- External setup: Bosta credentials and pickup address; verified business contact details and approved policies/specifications; optional analytics and notification accounts.
- QA limits: physical iPhone/Safari and a controlled production shipping test have not been performed. No live staging site is configured.
- Next implementation step: complete date-filtered business reporting based on stored order totals and payment records, with authorized CSV export.
