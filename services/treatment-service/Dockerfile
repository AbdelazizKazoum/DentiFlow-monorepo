# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
ARG PNPM_FLAGS="--frozen-lockfile"

COPY tsconfig.base.json ./
COPY services/package.json services/pnpm-lock.yaml services/nest-cli.json services/tsconfig.json ./services/
COPY services/lib/ ./services/lib/
COPY services/treatment-service/ ./services/treatment-service/

RUN npm install -g pnpm && pnpm install -C ./services $PNPM_FLAGS
RUN pnpm -C ./services build:treatment-service

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/services/treatment-service/dist/ ./dist/
COPY --from=builder /app/services/package.json ./
COPY --from=builder /app/services/pnpm-lock.yaml ./

ARG PROD_PNPM_FLAGS="--frozen-lockfile"
RUN npm install -g pnpm && pnpm install --prod $PROD_PNPM_FLAGS

USER appuser

EXPOSE 3006
CMD ["node", "dist/treatment-service/src/main.js"]
