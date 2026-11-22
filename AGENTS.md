# ShopLedger Agent Guide

## Stack
- Node.js CommonJS application using Express 4 and body-parser.
- Browser UI is plain HTML, CSS, and JavaScript under `public/`.
- Persistence is synchronous JSON file storage in `data/db.json`.

## Module map
- `routes/products.js` — product catalog and active coupon endpoints.
- `routes/orders.js` — order listing, creation, lookup, and cancellation endpoints.
- `routes/customers.js` — customer listing and Khata settlement endpoints.
- `routes/reports.js` — dashboard, GST reconciliation, pricing preview, and export endpoints.
- `lib/coupons.js` — coupon normalization, validation, discount calculation, and listing.
- `lib/dates.js` — current dates, date normalization, and fiscal-year calculation.
- `lib/inventory.js` — product lookup, sellable stock, stock checks, deductions, releases, and summaries.
- `lib/invoice.js` — printable invoice figures and HTML rendering.
- `lib/ledger.js` — customer balances, Khata charges, reversals, and settlements.
- `lib/orders.js` — order creation, lookup, cancellation, and filtered listing.
- `lib/pricing.js` — subtotal, coupon discount, line tax, and order-total calculation.
- `lib/reports.js` — dashboard summaries and invoice/ledger GST reconciliation.
- `lib/store.js` — reads, writes, structure initialization, and audit-log updates.
- `lib/tax.js` — GST-rate lookup, slab percentages, rounding, and CGST/SGST splitting.

## Commands
- Start the app: `npm start`
- Run tests: `node --test` (no test files are currently present).

## Rules
1. Write characterization tests before changing behaviour.
2. Change only the module(s) the ticket is about.
3. Tests never read or write `data/db.json`; use in-memory data.
4. Add no dependencies.
5. Make the smallest fix that works.

## Current ticket
Invoice total and GST breakdown do not match what the customer was billed.

Allowed files: `lib/invoice.js` (`lib/tax.js` only if truly needed).
