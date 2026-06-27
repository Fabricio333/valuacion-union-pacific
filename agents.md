# Agent Instructions

- For each slide, use the same background color as the wagon for that slide.
- Keep wagon colors and slide background colors in sync when adding, reordering, or editing slides.

## Deploy

Use one command from the repo root to publish the current build to `https://valuacion.fabriok.ar/`:

```bash
npm run deploy
```

The command runs `scripts/deploy.sh`, which:

- runs `npm run build`
- copies `dist/` into `/var/www/valuacion-union-pacific`
- reloads Caddy with `/etc/caddy/Caddyfile`
- verifies that `https://valuacion.fabriok.ar/` responds successfully

The public site is served by Caddy on `:8094`, and Cloudflared routes `valuacion.fabriok.ar` to `http://localhost:8094`.
