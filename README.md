# Takhayir — Multi-Vendor Marketplace

A multi-vendor e-commerce platform: categories & subcategories, independent vendor stores with
their own product catalogs, a customer storefront, an admin panel, and a vendor panel — built to
be a general-purpose base for many kinds of businesses, not one specific niche.

**Stack:** Node.js (Express + TypeScript) · MySQL (Sequelize) · React (Vite + TypeScript) · Swagger

## Apps in this repo

| App | Folder | Domain | Purpose |
|---|---|---|---|
| Storefront | `storefront/` | `www.takhayir.com` | Public shopping site |
| Backend API | `backend/` | `back.takhayir.com` | REST API, Swagger docs at `/swagger` |
| Admin panel | `admin-panel/` | `admin.takhayir.com` | Platform admin: approve vendors/products, categories, orders, coupons |
| Vendor panel | `vendor-panel/` | `vendor.takhayir.com` | Vendor store management: products, orders, store settings |

## Architecture at a glance

- **Auth:** JWT (access + refresh), single `users` table with a `role` (`admin` / `vendor` / `customer`).
- **Vendors:** a `vendors` row per seller (1:1 with a `vendor`-role user), with `status`
  (pending/approved/suspended/rejected) and a per-vendor `commission_rate`.
- **Categories:** self-referencing table, unlimited depth (used as 2 levels: category → subcategory).
- **Products:** owned by a vendor, moderated by admin (pending → active/rejected), with images and
  optional variants (size/color/etc via a JSON attributes column).
- **Orders:** a single customer order is split into one `order_vendor_group` per vendor whose
  products were in the cart, each with its own status, commission, and payout tracking — so each
  vendor only ever sees and manages their own sub-order.
- **Payments:** pluggable adapters (`backend/src/services/payments/`) — Tap Payments as the direct
  gateway (cards/Mada/Apple Pay) and Deema BNPL, plus Taly BNPL, plus cash-on-delivery. **Not
  activated yet** — see `docs/PAYMENTS.md` for the exact steps to go live with real credentials.

## Local development

### 1. Database

```bash
docker compose up -d mysql
```

(or point `backend/.env` at any MySQL 8 instance you already have)

### 2. Backend

```bash
cd backend
cp .env.example .env      # edit DB credentials, JWT secrets
npm install
npm run migrate           # creates all tables
npm run seed               # creates admin@takhayir.com (password: ChangeMe123!) + sample categories
npm run dev                # http://localhost:4000, Swagger at http://localhost:4000/swagger
```

**Change the seeded admin password immediately after first login.**

### 3. Frontends

Each app runs on its own port during local dev:

```bash
cd storefront && cp .env.example .env && npm install && npm run dev   # http://localhost:5173
cd admin-panel && cp .env.example .env && npm install && npm run dev  # http://localhost:5174
cd vendor-panel && cp .env.example .env && npm install && npm run dev # http://localhost:5175
```

Set `VITE_API_URL=http://localhost:4000/api` in each `.env` for local dev.

## Production deployment

Each app is a separate deployable unit — deploy however suits your infrastructure (VPS + PM2,
Docker, a PaaS, etc). The suggested subdomain layout:

- `www.takhayir.com` → static build output of `storefront/` (`npm run build` → `dist/`)
- `back.takhayir.com` → `backend/` running as a Node process (see `backend/Dockerfile`), reverse-proxied
- `admin.takhayir.com` → static build output of `admin-panel/`
- `vendor.takhayir.com` → static build output of `vendor-panel/`

Each frontend's `VITE_API_URL` should point to `https://back.takhayir.com/api` in production
(set in `.env` before running `npm run build`).

### Example nginx reverse proxy for the API

```nginx
server {
    listen 443 ssl;
    server_name back.takhayir.com;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

The other three subdomains just serve static files from each app's `dist/` folder after
`npm run build`.

### Swagger

Once deployed, API documentation is live at **https://back.takhayir.com/swagger** — it's generated
from JSDoc comments on every route file in `backend/src/routes/`, so it always matches the code.

## Branding

The Takhayir logo you shared wasn't saved as a file in this session — the apps currently render a
placeholder gradient "T" mark (`components/Logo.tsx` in each frontend) using the brand colors from
the logo (orange → magenta → purple gradient, dark navy wordmark). Drop your actual logo files into
each app's `src/assets/` folder and swap the `<Logo />` component's SVG for an `<img>` tag once you
have the source files handy.

Every storefront/admin/vendor footer includes **"Powered by Teknulugy"**, linking to
[teknulugy.com](https://teknulugy.com), as requested.

## What's deliberately left for a follow-up pass

- **Payment gateway activation** — see `docs/PAYMENTS.md`. The platform works end-to-end today
  (checkout creates real orders); only the actual money movement needs live API keys.
- **Shipping & tax calculation** — currently `0` in `backend/src/services/orderService.ts`;
  needs real shipping zones/rates and VAT rules per your target market.
- **Transactional email/SMS** (order confirmations, vendor approval notices) — the `notifications`
  table exists but isn't yet wired to an email/SMS provider.
- **Refresh-token rotation endpoint** — access + refresh tokens are issued at login/register;
  add a `/api/auth/refresh` route when you're ready to shorten access-token lifetimes.

## Repository

Pushed to: https://github.com/Eslamatef1992/takhayir
