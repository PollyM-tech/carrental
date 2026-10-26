# Personal-data operations

Client decision, October 26, 2026: retain ID/licence documents for **one week** after the rental ends. The migration sets `retention_days=7`; it does not approve or invent a privacy notice. Document upload/submission stay blocked until an owner supplies the approved notice text and version.

## Customer requests

Under `/account`, customers can download an authenticated JSON export, view their uploaded document photos, edit their profile and submit access, correction or deletion requests. The export excludes passwords, authenticator secrets, OTP hashes and internal security checks. Requests for additional records/copies are reviewed by the owner. Data exports and document responses prohibit caching.

Correction requests identify the fields needing correction without duplicating identity numbers or images. The customer edits their profile using the existing validated form. If KYC is in progress, the reviewer requests correction and the customer resubmits, preserving the previous audited decision. The owner completes the request only after checking the correction. Changes do not rewrite immutable receipts or prior audit evidence.

Deletion requests require the current password. The owner reviews them at `/dashboard/data-requests`. Completing deletion removes document files, clears profile/KYC snapshots, redacts mutable booking contacts/free text, clears challenges/notifications/request details, anonymises login contacts and disables the account/password. Existing tokens cannot authenticate an inactive account. The action is audited. The result is explicitly `completed_with_retention`, not a claim that every record was erased.

Financial payment email snapshots and receipts, immutable review/audit/history records and minimal document metadata remain for separate retention review. They must not be silently edited through the erasure operation. Owner resolution text must explain declined requests and any retained data. Do not put identity numbers or document photos into findings or audit notes. Define a separate approved retention process for these retained records before representing full-lifecycle compliance.

## Scheduled cleanup

`process_workflow` invokes retention cleanup on its existing minute schedule. Operators can also run:

```bash
python manage.py process_retention --dry-run
python manage.py process_retention
```

The preview reports eligible/held customer counts without changing records or files. Cleanup stays disabled if the approved notice or retention period is absent. It runs only for non-staff customers with no open rental/booking, unresolved payment, pending privacy request or documented hold. All of a customer's bookings must be terminal (or abandoned drafts); profile edits, new documents and booking updates restart the inactivity period. As a conservative safeguard, shared/reused document files are erased together only when all the customer's bookings are eligible. Therefore a newer/open booking can extend retention; the owner must review these holds and avoid unnecessary extensions.

After the approved period since the latest relevant activity, cleanup cancels abandoned drafts, deletes encrypted document files, adds erasure tombstones, clears associated KYC/profile snapshots and OTP challenges. Account contacts, booking contacts and financial/audit evidence are retained. New rentals require fresh profile/documents and phone verification. Minimal append-only document metadata remains, while queries exclude erased files. Previously issued signed links cease to serve them. File errors fail cleanup and must be investigated/retried; files are never marked erased before unlink succeeds. File deletion cannot be transactionally rolled back with the database, so a failed database operation may leave a file unavailable until the next successful cleanup.

Owners place or release customer-level retention holds from the data-request page, with an encrypted reason and audited action. No automatic deletion overrides a hold. Open rentals and unresolved payment reconciliation also block a requested account deletion. An operator must explicitly resolve those obligations first.

## Deployment requirements

Apply migrations before enabling the new screens and keep the workflow job running. Private storage must support deletion and remain outside public media. Backups have a separate expiry schedule: deletion from live storage does not erase old backups. On restore, reapply erasure records and holds before serving documents, rerun cleanup and verify old links cannot serve restored files. Keep a protected erasure journal outside the database backup being restored, or use an equivalent operator procedure. Establish and test that backup expiry/restore procedure before collecting real identity documents.

The implementation is an operational privacy workflow, not a substitute for an approved notice or a final financial/audit retention policy.
