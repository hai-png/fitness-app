# ─────────────────────────────────────────────────────────────────────────────
# D-03: Multi-stage Dockerfile for FitLife Hub.
# Builds the production bundle in a full Node image, then copies only the
# dist/ output into a slim runtime image. Final image is ~120 MB.
# ─────────────────────────────────────────────────────────────────────────────

# Stage 1: Build
FROM node:20-slim AS builder

WORKDIR /app

# Copy package manifests first to leverage Docker layer caching.
COPY package.json package-lock.json* ./

# Install ALL dependencies (including devDeps) — we need them to build.
# --legacy-peer-deps is required because @google/genai has a peer dep that
# conflicts with React 19.
RUN npm install --legacy-peer-deps

# Copy the rest of the source and build.
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:20-slim AS runtime

WORKDIR /app

# Install only production dependencies in the runtime image.
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps --omit=dev

# Copy the built artifacts from the builder stage.
COPY --from=builder /app/dist ./dist

# Don't run as root.
RUN useradd --create-home --uid 1001 appuser && chown -R appuser:appuser /app
USER appuser

ENV NODE_ENV=production
ENV PORT=3000

# Healthcheck hits the /health endpoint (S-13).
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||3000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

EXPOSE 3000

CMD ["node", "dist/server.cjs"]
