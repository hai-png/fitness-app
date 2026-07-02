# Deployment Guide

This document covers deploying FitLife Hub to the most common platforms.
For local development, see the [main README](./README.md).

## Prerequisites

- Node.js 20+ (see `.nvmrc`)
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
- The production build: `npm run build` produces `dist/` (client bundle + `server.cjs`)

## Environment Variables

| Variable | Required | Default | Notes |
|---|---|---|---|
| `GEMINI_API_KEY` | **Yes** | — | Empty string = "not configured" (server returns a helpful 400). |
| `PORT` | No | `3000` | Injected automatically by most platforms. |
| `NODE_ENV` | No | `development` | Set to `production` for the optimised build. |
| `CORS_ALLOWED_ORIGINS` | No | localhost dev origins | Comma-separated allowlist. **Set this in production.** |
| `LOG_LEVEL` | No | `info` | One of `trace`, `debug`, `info`, `warn`, `error`. |
| `SENTRY_DSN` | No | — | Server-side Sentry integration. Empty = disabled. |
| `GEMINI_TIMEOUT_MS` | No | `30000` | Per-request timeout for Gemini SDK calls. |
| `GEMINI_MAX_RETRIES` | No | `1` | Retries for transient Gemini failures. |

---

## Docker (recommended for self-hosting)

The repo includes a multi-stage `Dockerfile`:

```bash
docker build -t fitlife-hub .
docker run -p 3000:3000 \
  -e GEMINI_API_KEY="your-key" \
  -e NODE_ENV=production \
  -e CORS_ALLOWED_ORIGINS="https://your-domain.com" \
  fitlife-hub
```

The image is ~120 MB and runs as a non-root user. A `HEALTHCHECK` pings
`/health` every 30s.

---

## Render

1. **New → Web Service → Connect a repository**
2. **Build Command**: `npm install --legacy-peer-deps && npm run build`
3. **Start Command**: `npm start`
4. **Environment**:
   - `GEMINI_API_KEY` = your key (secret)
   - `NODE_ENV` = `production`
   - `CORS_ALLOWED_ORIGINS` = `https://your-app.onrender.com`
5. **Health Check Path**: `/health` (Render will probe this)

---

## Railway

1. **New Project → Deploy from GitHub repo**
2. Railway auto-detects Node.js. Override if needed:
   - **Build Command**: `npm install --legacy-peer-deps && npm run build`
   - **Start Command**: `npm start`
3. **Variables** tab: add the env vars from the table above.
4. Railway auto-assigns `PORT` and `RAILWAY_PUBLIC_DOMAIN`.

---

## Fly.io

```bash
# One-time setup
fly launch --no-deploy

# Set secrets
fly secrets set GEMINI_API_KEY="your-key"
fly secrets set NODE_ENV=production
fly secrets set CORS_ALLOWED_ORIGINS="https://your-app.fly.dev"

# Deploy
fly deploy
```

The included `Dockerfile` is auto-detected by Fly. The default `fly.toml`
will use it. The internal port is 3000 — Fly's proxy handles TLS termination.

---

## Google Cloud Run

```bash
# Build and push to Artifact Registry
gcloud builds submit --tag gcr.io/PROJECT-ID/fitlife-hub

# Deploy
gcloud run deploy fitlife-hub \
  --image gcr.io/PROJECT-ID/fitlife-hub \
  --region us-central1 \
  --set-env-vars="NODE_ENV=production,CORS_ALLOWED_ORIGINS=https://your-domain.run.app" \
  --set-secrets="GEMINI_API_KEY=gemini-api-key:latest" \
  --allow-unauthenticated
```

Cloud Run injects `PORT` automatically (the container must listen on it).
Secrets require the Secret Manager API and a service account with
`roles/secretmanager.secretAccessor`.

---

## CI/CD

The included GitHub Actions workflow (`.github/workflows/ci.yml`) runs on
every push and PR:

1. **Quality job**: `lint:strict` + `typecheck` + `test:ci` + `build`
2. **Security job**: `npm audit` + dependency review on PRs
3. **E2E job**: Playwright smoke tests against the production bundle

To auto-deploy on merge to `main`, add a deploy job that runs after the
quality job passes. Platform-specific examples:

<details>
<summary>Render auto-deploy</summary>

Render can auto-deploy from GitHub on every push to `main`. Connect the
repo in the Render dashboard and enable "Auto-Deploy".
</details>

<details>
<summary>Fly.io auto-deploy via GitHub Actions</summary>

```yaml
  deploy-fly:
    needs: [quality, e2e]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```
</details>

---

## Verifying the Deployment

After deploy, verify:

```bash
# Health check (S-13)
curl https://your-app.example.com/health
# → {"ok":true,"status":"alive","ts":"..."}

# Readiness check (Gemini configured?)
curl https://your-app.example.com/ready
# → {"ok":true,"gemini":"configured","circuitOpen":false}

# API 404 returns JSON, not HTML (S-07)
curl -i https://your-app.example.com/api/nonexistent
# → HTTP/1.1 404
# → {"error":"Not found","path":"/api/nonexistent"}
```

If the health check fails, check the logs for `server_started` or
`server_start_failed` pino log lines.
