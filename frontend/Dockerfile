FROM node:20-alpine AS builder

WORKDIR /app

ARG PNPM_FLAGS="--frozen-lockfile"
ARG NEXT_PUBLIC_API_URL="http://localhost:3001"
ARG NEXT_PUBLIC_DEFAULT_CLINIC_ID="00000000-0000-4000-8000-000000000001"

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_DEFAULT_CLINIC_ID=$NEXT_PUBLIC_DEFAULT_CLINIC_ID

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY frontend/package.json ./frontend/package.json

RUN npm install -g pnpm && pnpm install --filter frontend... $PNPM_FLAGS

COPY frontend/ ./frontend/

RUN pnpm -C ./frontend build

FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY frontend/package.json ./frontend/package.json

ARG PROD_PNPM_FLAGS="--frozen-lockfile"
RUN npm install -g pnpm && pnpm install --prod --filter frontend... $PROD_PNPM_FLAGS

COPY --from=builder --chown=appuser:appgroup /app/frontend/.next ./frontend/.next
COPY --from=builder --chown=appuser:appgroup /app/frontend/public ./frontend/public
COPY --from=builder --chown=appuser:appgroup /app/frontend/next.config.ts ./frontend/next.config.ts

USER appuser

WORKDIR /app/frontend

EXPOSE 3000
CMD ["pnpm", "start"]
