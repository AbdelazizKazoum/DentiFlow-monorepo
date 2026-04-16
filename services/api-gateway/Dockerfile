# ── Build stage ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Copy root tsconfig
COPY tsconfig.base.json ./

# Copy services package manifests for dependency install
COPY services/package.json services/pnpm-lock.yaml ./services/

# Copy shared lib (no package.json — source only)
COPY services/lib/ ./services/lib/

# Copy api-gateway source
COPY services/api-gateway/ ./services/api-gateway/

# Install all deps (includes devDependencies for TypeScript compilation)
RUN npm install -g pnpm && pnpm install -C ./services --frozen-lockfile

# Compile TypeScript (rootDir: ".." in tsconfig covers ../lib too)
RUN pnpm -C ./services build:api-gateway

# ── Production stage ─────────────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/services/api-gateway/dist/ ./dist/
COPY --from=builder /app/services/package.json ./
COPY --from=builder /app/services/pnpm-lock.yaml ./

# Install production dependencies only
RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile

USER appuser

EXPOSE 3000
CMD ["node", "dist/api-gateway/src/main.js"]
