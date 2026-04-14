## Deferred from: code review of 8-2-set-up-api-gateway-with-basic-routing (2026-04-14)

- `JWT_SECRET` has no minimum-length constraint — `@IsString() @IsNotEmpty()` passes a 1-character secret; `@MinLength(32)` should be added to enforce HS256 minimum key strength — deferred, beyond story spec scope
- No CORS policy configured — `app.enableCors()` absent from `main.ts`; all cross-origin browser requests are uncontrolled — deferred, not in story scope
- `JwtModule` registered with `signOptions.expiresIn` but the gateway never signs JWTs — misleading and could encourage accidental misuse; remove `signOptions` or add a comment clarifying verify-only role — deferred, architectural clarity for Story 8.5
- `JwtAuthGuard.canActivate()` override is pure delegation (no added logic) — dead code, likely a future hook; remove or document intent — deferred, pre-existing
- SSE `EMPTY` stream completes immediately on connection, causing conformant SSE clients to enter fast reconnect loops (~20 ms cycle) until NATS is wired — deferred, spec-approved stub until Story 8.5
- No graceful shutdown hooks — `app.enableShutdownHooks()` not called; SIGTERM from container orchestrator kills in-flight requests with no drain — deferred, infrastructure concern beyond story scope

## Deferred from: code review of 8-1-initialize-shared-packages-shared-db-shared-logger-shared-config (2026-04-14)

- `AppLogger` reads `LOG_LEVEL` from raw `process.env` instead of validated `ConfigService`; injecting ConfigService risks circular dependency (LoggerModule → ConfigModule) — deferred, pre-existing
- `CorrelationContext.clinicId` and `userId` fields in `correlationStore` are never populated by the interceptor; reserved for future auth-guard enrichment — deferred, pre-existing
- `logger.service.spec.ts` validates Winston's internal method calls but does not capture and assert the actual stdout JSON structure as stated in AC3 — deferred, pre-existing

## Deferred from: code review of 0-1-initialize-next-js-frontend-with-design-system (2026-04-10)

- Limited RTL testing - deferred, pre-existing
- Basic theme tokens - deferred, pre-existing
