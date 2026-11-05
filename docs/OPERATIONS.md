# Karin operations and repair release — 2026-11-05

## Activation inputs still required
- Approved bilingual product specifications, instructions, cancellation/returns policy and detailed packaging photographs. Enter in Admin → Settings / product families, then approve. Draft descriptions stay private.
- Bosta business API key, configured pickup address and webhook secret. BOSTA_ENABLED must remain unset until a controlled account test passes. Existing orders continue to be accepted for phone confirmation with shipping unset.
- External order notifications require a separately approved sending service. The current outbox records new-order events; no email, SMS or WhatsApp is sent. Admin polling works only while the panel is open.
- Scheduled off-site backups have not been configured. Full manual archives are available to the administrator.

## Order workflow
COD; shipping is never included in the bottle price. Confirm the saved contact/address, products, delivery fee and final total by phone. Save confirmation before dispatch. Loading Bosta cities/districts validates coverage. Save edits and review the exact shipment before creating it. Shipment COD and physical fields are locked after dispatch; recording collection does not amend the carrier COD. A shipping timeout is an UNKNOWN result, not permission to create another shipment. Review Bosta and reconcile the existing tracking number. Do not bypass an unknown reservation.

## Customer support
A secret receipt reveals no customer contact/address. If lost, verify the customer through the recorded contact details before using Admin → Reissue receipt link. The previous secret is invalidated. Permanent contact-data erasure is allowed only for terminal orders and removes private order history; an actor-only audit entry remains. Do not publish backups.

## Backup and restore
GET /api/admin/backup is an authenticated database JSON snapshot. GET /api/admin/backup?format=archive additionally streams all uploaded R2 media, with a SHA-256 manifest. The archive is complete only if the download succeeds AND restore verification passes. Static repository assets are versioned in Git. There is no automatic scheduling in this release.

Restore only into a NEW isolated destination:

    node scripts/restore-archive.mjs BACKUP.tar NEW-isolated-directory

The command validates paths, checksums and media entries, restores database.json into a new SQLite database, verifies row counts and runs integrity_check. It never overwrites a production database. Test recovery before choosing a production cut-over.

## Additive migration and compatibility
0002 adds aggregate metrics, a notification outbox, and order/limit indexes. No table or historical order is reset. Product and shade IDs, receipt paths and historical prices are retained. A bounded 200-row legacy search index backfill runs during authenticated initialization; IDs are also searched directly and export uses the same filters. Very large datasets still require a separate FTS/keyset scaling project.

## Validation
111 assertions: commerce 44, pagination/export 3 (1,005 orders), Bosta mock 28, concurrency/storage regression 13, repair integration 23. These run against local disposable data only; there are no real shipments. TypeScript and production build are release gates. Bosta address/state mappings were checked against official docs:
- https://docs.bosta.co/docs/how-to/format-bosta-address/
- https://docs.bosta.co/docs/how-to/get-delivery-status-via-webhook/

Responsive inspection covers 320–1440 CSS pixels in Arabic and English. No physical Safari/iPhone device was available. Browser throttling/Lighthouse and a formal accessibility conformance audit have not been performed.

## Rollback
Previous public version: 8, source 9fcd04f97067a1c932fc8aa5e45549676cfdb826, saved ID appgprj_6ae9ee79bbd881919bfb117b0a732e46~appgver_acfb120c9f8081919fcd4377cc276444. Redeploy that saved version if runtime verification fails. Keep the additive tables; rolling back code must not remove order data or migration history. Confirm the rollback deployment result before further publication.
