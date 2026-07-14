#!/usr/bin/env bash
#
# Takhayir — one-shot production setup for a fresh Ubuntu 24.04 VPS.
# Installs Node 20, MySQL, nginx, PM2, certbot; clones the repo; builds all
# four apps; configures nginx for the four subdomains; issues Let's Encrypt
# certificates; and starts the backend under PM2.
#
# Run as root (or with sudo) on the VPS itself:
#   sudo bash deploy-vps.sh
#
# Before running, make sure DNS A records for all four hostnames already
# point at this server's IP (see README.md "DNS" section) — certbot needs
# that to succeed.

set -euo pipefail

# ---------------------------------------------------------------------------
# Config — edit these if anything differs from the defaults
# ---------------------------------------------------------------------------
GITHUB_REPO="https://github.com/Eslamatef1992/takhayir.git"
APP_DIR="/var/www/takhayir"
DOMAIN_ROOT="takhayir.com"
STOREFRONT_DOMAINS=("www.takhayir.com" "takhayir.com")
BACKEND_DOMAIN="back.takhayir.com"
ADMIN_DOMAIN="admin.takhayir.com"
VENDOR_DOMAIN="vendor.takhayir.com"
LETSENCRYPT_EMAIL="eslam@teknulugy.com"   # change if you want cert renewal notices elsewhere
DB_NAME="takhayir"
DB_USER="takhayir_app"

# ---------------------------------------------------------------------------
if [[ $EUID -ne 0 ]]; then
  echo "Please run this script as root (sudo bash deploy-vps.sh)"; exit 1
fi

echo "==> Updating system packages"
apt update && apt upgrade -y

echo "==> Installing base tools"
apt install -y curl git build-essential ufw

echo "==> Installing Node.js 20"
if ! command -v node >/dev/null || [[ "$(node -v)" != v20* ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt install -y nodejs
fi
node -v
npm -v

echo "==> Installing PM2"
npm install -g pm2

echo "==> Installing MySQL server"
apt install -y mysql-server
systemctl enable --now mysql

echo "==> Installing nginx"
apt install -y nginx
systemctl enable --now nginx

echo "==> Installing certbot"
apt install -y certbot python3-certbot-nginx

echo "==> Configuring firewall"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# ---------------------------------------------------------------------------
echo "==> Generating secrets"
DB_PASSWORD="$(openssl rand -hex 16)"
JWT_SECRET="$(openssl rand -hex 32)"
JWT_REFRESH_SECRET="$(openssl rand -hex 32)"

echo "==> Creating database and app user"
mysql -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';"
mysql -e "GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"

# ---------------------------------------------------------------------------
echo "==> Fetching source code"
mkdir -p "$APP_DIR"
if [[ -d "$APP_DIR/.git" ]]; then
  git -C "$APP_DIR" pull origin main
else
  git clone "$GITHUB_REPO" "$APP_DIR"
fi

# ---------------------------------------------------------------------------
echo "==> Configuring backend"
cd "$APP_DIR/backend"

cat > .env <<EOF
NODE_ENV=production
PORT=4000
API_URL=https://${BACKEND_DOMAIN}
CLIENT_STOREFRONT_URL=https://www.${DOMAIN_ROOT}
CLIENT_ADMIN_URL=https://${ADMIN_DOMAIN}
CLIENT_VENDOR_URL=https://${VENDOR_DOMAIN}

DB_HOST=localhost
DB_PORT=3306
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_DIALECT=mysql

JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
JWT_REFRESH_EXPIRES_IN=30d

UPLOAD_DIR=uploads
MAX_UPLOAD_SIZE_MB=5

# Payment gateways — fill these in later, see docs/PAYMENTS.md
TAP_API_BASE_URL=https://api.tap.company/v2
TAP_SECRET_KEY=
TAP_PUBLIC_KEY=
TAP_WEBHOOK_SECRET=
TALY_API_BASE_URL=https://api.taly.io
TALY_MERCHANT_USERNAME=
TALY_MERCHANT_PASSWORD=
TALY_WEBHOOK_SECRET=
EOF

npm install
npm run build
npm run migrate
npm run seed || echo "(seed already applied — skipping)"

echo "==> Starting backend with PM2"
pm2 delete takhayir-backend >/dev/null 2>&1 || true
pm2 start dist/server.js --name takhayir-backend
pm2 save
env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root >/tmp/pm2-startup.log 2>&1 || true
bash /tmp/pm2-startup.log >/dev/null 2>&1 || true

# ---------------------------------------------------------------------------
build_frontend () {
  local dir="$1"
  echo "==> Building $dir"
  cd "$APP_DIR/$dir"
  echo "VITE_API_URL=https://${BACKEND_DOMAIN}/api" > .env
  npm install
  npm run build
}

build_frontend storefront
build_frontend admin-panel
build_frontend vendor-panel

# ---------------------------------------------------------------------------
echo "==> Writing nginx config"
cat > /etc/nginx/sites-available/takhayir <<EOF
server {
    listen 80;
    server_name ${BACKEND_DOMAIN};
    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}

server {
    listen 80;
    server_name ${STOREFRONT_DOMAINS[0]} ${STOREFRONT_DOMAINS[1]};
    root ${APP_DIR}/storefront/dist;
    index index.html;
    location / { try_files \$uri \$uri/ /index.html; }
}

server {
    listen 80;
    server_name ${ADMIN_DOMAIN};
    root ${APP_DIR}/admin-panel/dist;
    index index.html;
    location / { try_files \$uri \$uri/ /index.html; }
}

server {
    listen 80;
    server_name ${VENDOR_DOMAIN};
    root ${APP_DIR}/vendor-panel/dist;
    index index.html;
    location / { try_files \$uri \$uri/ /index.html; }
}
EOF

rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/takhayir /etc/nginx/sites-enabled/takhayir
nginx -t
systemctl reload nginx

# ---------------------------------------------------------------------------
echo "==> Requesting SSL certificates (requires DNS already pointing here)"
certbot --nginx \
  -d "${BACKEND_DOMAIN}" \
  -d "${STOREFRONT_DOMAINS[0]}" -d "${STOREFRONT_DOMAINS[1]}" \
  -d "${ADMIN_DOMAIN}" \
  -d "${VENDOR_DOMAIN}" \
  --non-interactive --agree-tos -m "${LETSENCRYPT_EMAIL}" --redirect || \
  echo "!! certbot failed — check that all DNS A records resolve to this server's IP, then re-run: certbot --nginx"

# ---------------------------------------------------------------------------
echo ""
echo "================================================================"
echo " Takhayir deployment complete"
echo "================================================================"
echo " Storefront:    https://www.${DOMAIN_ROOT}"
echo " Admin panel:   https://${ADMIN_DOMAIN}"
echo " Vendor panel:  https://${VENDOR_DOMAIN}"
echo " API:           https://${BACKEND_DOMAIN}"
echo " Swagger docs:  https://${BACKEND_DOMAIN}/swagger"
echo ""
echo " Admin login:   admin@takhayir.com / ChangeMe123!  <-- change this now"
echo ""
echo " Database:      ${DB_NAME}"
echo " DB user:       ${DB_USER}"
echo " DB password:   ${DB_PASSWORD}"
echo " (also saved in ${APP_DIR}/backend/.env)"
echo ""
echo " Backend process manager: pm2 status / pm2 logs takhayir-backend"
echo " Payment gateways are NOT yet configured — see docs/PAYMENTS.md"
echo "================================================================"
