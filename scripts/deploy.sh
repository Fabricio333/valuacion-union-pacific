#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PUBLIC_ROOT="/var/www/valuacion-union-pacific"
CADDYFILE="/etc/caddy/Caddyfile"
DOMAIN="https://valuacion.fabriok.ar/"

cd "$APP_ROOT"

echo "[deploy] Building app..."
npm run build

if [[ ! -d "$PUBLIC_ROOT" ]]; then
  echo "[deploy] Public root does not exist: $PUBLIC_ROOT" >&2
  exit 1
fi

if [[ ! -f dist/index.html ]]; then
  echo "[deploy] Build output missing: dist/index.html" >&2
  exit 1
fi

echo "[deploy] Publishing dist/ to $PUBLIC_ROOT..."
cp -a dist/. "$PUBLIC_ROOT/"

echo "[deploy] Reloading Caddy..."
caddy reload --config "$CADDYFILE"

echo "[deploy] Verifying $DOMAIN..."
curl -fsS "$DOMAIN" >/dev/null

echo "[deploy] Done: $DOMAIN"
