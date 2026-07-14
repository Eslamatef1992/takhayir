# Payment integration checklist

The platform ships with three payment adapters, all built to the correct request/response
shape for each provider, but **not activated** — as requested, the build was kept focused on
the platform itself, with integrations left as a clearly defined follow-up.

Adapter code lives in `backend/src/services/payments/`:

- `tapGateway.ts` — direct gateway (cards, Mada, Apple Pay) **and** Deema BNPL, both through
  Tap Payments' Charges API. Deema is just a special `source.id: "src_deema"` on the same API.
- `talyGateway.ts` — Taly BNPL (Kuwait), using their merchant-login → create-order → redirect flow.
- `codGateway.ts` — cash on delivery, no external provider needed, active out of the box.

Until credentials are set, `tap` and `deema` and `taly` checkouts return `status: "not_configured"`
and the order is still created (so the storefront flow doesn't break) — the checkout API responds
with the payload that *would* have been sent, which is useful for testing the wiring before you
have live keys.

## To activate Tap Payments (direct gateway + Deema)

1. Create a Tap Payments merchant account: https://tap.company
2. From the Tap dashboard, grab your **secret key** and **public key**.
3. Set in `backend/.env`:
   ```
   TAP_SECRET_KEY=sk_live_...
   TAP_PUBLIC_KEY=pk_live_...
   ```
4. Ask Tap support to enable Deema on your account (Deema requires KWD currency and a Kuwait
   merchant setup — see https://developers.tap.company/docs/deema).
5. Webhooks are already wired to `POST /api/payments/tap/webhook` — register that URL
   (`https://back.takhayir.com/api/payments/tap/webhook`) in the Tap dashboard.
6. Redirect URL is already wired to `GET /api/payments/tap/redirect`.

## To activate Taly

1. Apply for a Taly merchant account: https://taly.io/merchant/
2. From the Taly Partners Portal, go to Settings → Keys to get your merchant username/password.
3. Set in `backend/.env`:
   ```
   TALY_MERCHANT_USERNAME=...
   TALY_MERCHANT_PASSWORD=...
   ```
4. Webhook: register `https://back.takhayir.com/api/payments/taly/webhook` in the Taly portal.
5. Full API reference: https://docs.taly.io/docs/direct-integration

## Notes

- Both BNPL providers are Kuwait-focused (Deema requires KWD, Taly is KD-licensed). If Takhayir
  will also sell in Saudi Arabia or elsewhere, you may want to add Tamara (also supported by Tap
  under `source.id: "src_tamara"`) as a Gulf-wide alternative — the same `tapGateway.ts` adapter
  pattern can be reused for that with minimal changes.
- Shipping cost and tax calculation are currently hard-coded to 0 in
  `backend/src/services/orderService.ts` — wire up real shipping zones/rates and VAT calculation
  before going live.
- All payment attempts are recorded in the `payments` table regardless of gateway, so reconciliation
  works the same way across providers.
