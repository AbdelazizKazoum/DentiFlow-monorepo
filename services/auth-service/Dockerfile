# ── Build stage ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Copy workspace manifests for dependency install
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.base.json ./

# Copy shared lib (no package.json — source only)
COPY services/lib/ ./services/lib/

# Copy auth-service source
COPY services/auth-service/ ./services/auth-service/

# Install all deps (includes devDependencies for TypeScript compilation)
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Compile TypeScript (rootDir: ".." in tsconfig covers ../lib too)
RUN cd services/auth-service && npx tsc -p tsconfig.json

# ── Production stage ─────────────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/services/auth-service/dist/ ./dist/
COPY --from=builder /app/services/auth-service/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./

# Install production dependencies only
RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile

USER appuser

EXPOSE 3002
CMD ["node", "dist/auth-service/src/main.js"]
