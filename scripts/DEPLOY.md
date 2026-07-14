# Deploying to the VPS (72.62.154.75, Ubuntu 24.04)

## 0. Before you run anything

Point all four DNS `A` records at `72.62.154.75` (see the "DNS" section in the root `README.md`)
and give them a few minutes to propagate — `certbot` will fail if they don't resolve yet. You can
check with:

```bash
dig +short www.takhayir.com
dig +short back.takhayir.com
dig +short admin.takhayir.com
dig +short vendor.takhayir.com
```

All four should print `72.62.154.75`.

## 1. SSH into the VPS

```bash
ssh root@72.62.154.75
```

## 2. Get the script onto the server

Either clone the repo first and run the script from inside it:

```bash
git clone https://github.com/Eslamatef1992/takhayir.git /var/www/takhayir
bash /var/www/takhayir/scripts/deploy-vps.sh
```

...or copy-paste the contents of `scripts/deploy-vps.sh` into a file on the server (e.g. via
`nano deploy-vps.sh`) and run `bash deploy-vps.sh` — it clones the repo itself if it's not
already at `/var/www/takhayir`.

## 3. What the script does

1. Installs Node 20, MySQL, nginx, PM2, certbot, ufw.
2. Creates the `takhayir` database and an app-specific DB user with a random password.
3. Clones/pulls the repo into `/var/www/takhayir`.
4. Writes `backend/.env` with generated JWT secrets + DB credentials, builds the backend,
   runs migrations, seeds the admin account and starter categories, and starts it under PM2.
5. Builds all three frontends (`storefront`, `admin-panel`, `vendor-panel`) pointed at
   `https://back.takhayir.com/api`.
6. Writes nginx server blocks for all four subdomains and reloads nginx.
7. Requests Let's Encrypt certificates for all four domains via `certbot --nginx` (auto-redirects
   HTTP → HTTPS).
8. Prints a summary with the generated DB password, the seeded admin login, and next steps.

**Change the seeded admin password (`admin@takhayir.com` / `ChangeMe123!`) immediately after
your first login to `https://admin.takhayir.com`.**

## 4. Redeploying after code changes

```bash
cd /var/www/takhayir
git pull origin main

cd backend && npm install && npm run build && npm run migrate && pm2 restart takhayir-backend

cd ../storefront && npm install && npm run build
cd ../admin-panel && npm install && npm run build
cd ../vendor-panel && npm install && npm run build
```

nginx serves the frontends straight from each app's `dist/` folder, so no reload is needed after
a frontend rebuild — just refresh the browser (hard refresh if cached).

## 5. If certbot fails

Usually means DNS hadn't propagated yet. Once `dig` shows the right IP for all four hostnames,
re-run just the certificate step:

```bash
certbot --nginx -d back.takhayir.com -d www.takhayir.com -d takhayir.com -d admin.takhayir.com -d vendor.takhayir.com --redirect
```

## 6. Activating payments

The platform runs fully without them (cash on delivery works out of the box). When you're ready
to accept cards/Mada/Apple Pay/Deema/Taly, follow `docs/PAYMENTS.md` and add the real API keys to
`/var/www/takhayir/backend/.env`, then `pm2 restart takhayir-backend`.
