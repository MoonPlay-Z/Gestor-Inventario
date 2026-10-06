# Security Review

**Date:** 2026-10-06  
**Scope:** Static review of invoice and payment flows, including the recently added payment-currency handling.  
**Testing:** No credentials were used, no remote services were contacted, and no database records were modified. This report documents a code-review finding, not a live exploit.

## Findings

| # | Severity | File | Lines | Vulnerability | Confidence |
|---|----------|------|-------|---------------|------------|
| 1 | 🟡 MEDIUM | `backend/src/routes/pagos.js` | 102-147 | Concurrent payment requests can read the same invoice balance, both pass validation, and both persist payments, potentially overpaying the invoice. | 9/10 |

### 1. Concurrent payment requests can overpay an invoice

The payment handler calculates the existing paid amount, pending balance, and resulting invoice state before opening the database transaction. The transaction then creates the payment and updates the invoice state without re-reading or locking the invoice or rechecking the balance. Two overlapping requests can therefore validate against the same balance and both be committed.

**Preconditions:** The invoice has a remaining balance, and two valid payment requests for that invoice overlap in time. The currency-aware path also requires the `monedaPago` database migration to have been applied.

**Impact:** Payment records can exceed the invoice total, while the invoice is marked paid. This is a tenant-scoped integrity issue; this finding does not indicate a tenant-isolation bypass.

**Recommended remediation:** Serialize balance validation and payment insertion per invoice within the transaction (for example, by locking the invoice row where supported), recalculate the balance inside that transaction, and reject any payment that would exceed it. Consider an idempotency key to prevent duplicate submissions.
