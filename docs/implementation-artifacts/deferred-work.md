## Deferred from: code review of 8-1-initialize-shared-packages-shared-db-shared-logger-shared-config (2026-04-14)

- `AppLogger` reads `LOG_LEVEL` from raw `process.env` instead of validated `ConfigService`; injecting ConfigService risks circular dependency (LoggerModule → ConfigModule) — deferred, pre-existing
- `CorrelationContext.clinicId` and `userId` fields in `correlationStore` are never populated by the interceptor; reserved for future auth-guard enrichment — deferred, pre-existing
- `logger.service.spec.ts` validates Winston's internal method calls but does not capture and assert the actual stdout JSON structure as stated in AC3 — deferred, pre-existing

## Deferred from: code review of 0-1-initialize-next-js-frontend-with-design-system (2026-04-10)

- Limited RTL testing - deferred, pre-existing
- Basic theme tokens - deferred, pre-existing
