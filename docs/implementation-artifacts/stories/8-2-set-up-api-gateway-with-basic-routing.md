# Story 8.2: Set Up API Gateway with Basic Routing

Status: done

## Story

As the system,
I want an API Gateway NestJS application with JWT verification and basic routing infrastructure,
so that all downstream services are protected behind a single authenticated ingress point and SSE push capability is prepared for queue updates.

## Acceptance Criteria

1. **Given** `services/api-gateway/` does not yet exist, **When** the NestJS app is bootstrapped, **Then** `GET /health` returns `HTTP 200` with `{ "status": "ok" }` and the app boots without errors.

2. **Given** a request with a valid `Authorization: Bearer <token>` header (signed with `JWT_SECRET`, payload `{ user_id, clinic_id, role }`), **When** the request hits any protected route, **Then** the JWT guard verifies the signature and injects the decoded payload into the request; `401 Unauthorized` is returned for missing/invalid/expired tokens.

3. **Given** the gateway is running and a valid JWT is provided, **When** a frontend client sends `GET /events/queue?clinicId=<id>`, **Then** the server responds with `Content-Type: text/event-stream` and keeps the connection open (SSE endpoint is wired and functional; NATS subscription is a stub returning `EMPTY` observable until Story 8.5).

4. **Given** the app starts without `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD`, or `DB_NAME` environment variables, **When** the gateway bootstraps, **Then** it boots successfully (gateway has its own env validation that does NOT require DB vars); missing `JWT_SECRET` still causes a fail-fast error.

5. **Given** `services/api-gateway/Dockerfile` exists, **When** `docker build` is run from the monorepo root with the correct build context (includes `services/lib/`), **Then** the image builds successfully and `node dist/main.js` starts the HTTP server.

6. **Given** the gateway is running, **When** a request is made to any future proxied route (e.g., `GET /api/v1/auth/me`), **Then** the gateway returns `{ "message": "auth-service proxy placeholder" }` (HTTP 200) rather than 404 — placeholder routes are set up; actual gRPC wiring is done in Story 8.5.

## Tasks / Subtasks

- [x] Task 1: Bootstrap `services/api-gateway/` NestJS application (AC: 1, 4)
  - [x] Create `services/api-gateway/package.json` with required dependencies
  - [x] Create `services/api-gateway/tsconfig.json` extending `../../tsconfig.base.json` with `rootDir: ".."` and `include: ["src/**/*.ts", "../lib/**/*.ts"]`
  - [x] Create `services/api-gateway/jest.config.ts` with `ts-jest`, `moduleNameMapper` for `@lib`, and `setupFiles` importing `reflect-metadata`
  - [x] Create `services/api-gateway/jest.setup.ts` with `import 'reflect-metadata'`
  - [x] Create `services/api-gateway/src/main.ts` — bootstrap with `bufferLogs: true`, attach `AppLogger` + `CorrelationInterceptor`, set global prefix `api/v1` (excluding `/health` and `/events/queue`), read `PORT` from `ConfigService`
  - [x] Create `services/api-gateway/src/app.module.ts` — import `NestConfigModule.forRoot` (gateway-specific `validate`), `LoggerModule`, `PassportModule`, `JwtModule.registerAsync`, `HttpModule`, `HealthModule`, `SseModule`, `ProxyModule`; provide `JwtStrategy`

- [x] Task 2: Gateway-specific environment validation (AC: 4)
  - [x] Create `services/api-gateway/src/shared/env.validation.ts` — `GatewayEnvironmentVariables` class with `JWT_SECRET` (required), `PORT` (optional, default 3000), `NODE_ENV`, `LOG_LEVEL`, `AUTH_SERVICE_URL` (optional placeholder), `CLINIC_SERVICE_URL` (optional placeholder); `validateGatewayEnv()` function
  - [x] Create `services/api-gateway/src/shared/env.validation.spec.ts` — unit tests: missing `JWT_SECRET` throws; valid config resolves with defaults; DB vars NOT required

- [x] Task 3: JWT domain entity and guard (AC: 2)
  - [x] Create `services/api-gateway/src/domain/auth/entities/jwt-payload.entity.ts` — `JwtPayload` interface `{ user_id: string; clinic_id: string; role: string; iat: number; exp: number }`
  - [x] Create `services/api-gateway/src/shared/strategies/jwt.strategy.ts` — extends `PassportStrategy(Strategy)` from `passport-jwt`; uses `ExtractJwt.fromAuthHeaderAsBearerToken()`, `ignoreExpiration: false`, `secretOrKey` from `ConfigService.getOrThrow('JWT_SECRET')`; `validate()` returns `JwtPayload`
  - [x] Create `services/api-gateway/src/shared/strategies/jwt.strategy.spec.ts` — unit tests: `validate()` returns payload; strategy is instantiated with correct options
  - [x] Create `services/api-gateway/src/shared/guards/jwt-auth.guard.ts` — `JwtAuthGuard` extends `AuthGuard('jwt')`; override `handleRequest` to rethrow `UnauthorizedException` with a clean message (no stack leakage)
  - [x] Create `services/api-gateway/src/shared/guards/jwt-auth.guard.spec.ts` — unit tests: calls `super.handleRequest`; returns user on success; throws `UnauthorizedException` on null user
  - [x] Create `services/api-gateway/src/shared/decorators/current-user.decorator.ts` — `@CurrentUser()` parameter decorator using `createParamDecorator` that extracts `request.user` (the validated `JwtPayload`)

- [x] Task 4: Health check module (AC: 1)
  - [x] Create `services/api-gateway/src/presentation/health/health.controller.ts` — `GET /health` (no auth guard) returns `{ status: 'ok', timestamp: new Date().toISOString() }`
  - [x] Create `services/api-gateway/src/presentation/health/health.controller.spec.ts` — test `GET /health` returns 200 with `status: 'ok'`
  - [x] Create `services/api-gateway/src/presentation/health/health.module.ts`

- [x] Task 5: SSE endpoint module (AC: 3)
  - [x] Create `services/api-gateway/src/presentation/sse/sse.controller.ts` — `@Sse('/events/queue')` protected by `@UseGuards(JwtAuthGuard)`; accepts `@Query('clinicId')` and `@CurrentUser()` validated parameter; validates `clinicId` matches `user.clinic_id` (anti-leak guard); returns `EMPTY` observable as stub (NATS wired in 8.5)
  - [x] Create `services/api-gateway/src/presentation/sse/sse.controller.spec.ts` — test SSE route is guarded; test clinicId mismatch returns 403
  - [x] Create `services/api-gateway/src/presentation/sse/sse.module.ts`

- [x] Task 6: Proxy placeholder module (AC: 6)
  - [x] Create `services/api-gateway/src/presentation/proxy/proxy.controller.ts` — placeholder routes `GET /api/v1/auth/me`, `GET /api/v1/clinics` etc. returning `{ message: '<service>-service proxy placeholder' }` HTTP 200 (gRPC wired in 8.5); all routes protected by `@UseGuards(JwtAuthGuard)`
  - [x] Create `services/api-gateway/src/presentation/proxy/proxy.module.ts`

- [x] Task 7: Docker setup (AC: 5)
  - [x] Create `services/api-gateway/Dockerfile` — multi-stage: `builder` stage compiles TypeScript (copies `tsconfig.base.json`, `services/lib/`, `services/api-gateway/`); `production` stage runs `dist/main.js` on `node:20-alpine` as non-root user
  - [x] Create `services/api-gateway/.env.example` — document all env vars with example values

### Review Findings

- [x] [Review][Patch] Dockerfile production stage: `pnpm-lock.yaml` never copied into production stage — `pnpm install --prod --frozen-lockfile` always fails [Dockerfile, production stage RUN line]
- [x] [Review][Patch] `CMD`/`start` script path is `dist/src/main.js` but `rootDir: ".."` compiles `src/main.ts` to `dist/api-gateway/src/main.js` — container crashes immediately with module-not-found [Dockerfile:38, package.json `start`]
- [x] [Review][Patch] SSE `undefined`-`undefined` bypass: `JwtStrategy.validate()` returns payload with no field-presence check; a JWT missing `clinic_id` + a request missing `?clinicId` makes `undefined !== undefined` evaluate to `false`, silently bypassing the clinic-scope anti-leak guard [src/shared/strategies/jwt.strategy.ts, src/presentation/sse/sse.controller.ts]
- [x] [Review][Patch] SSE spec test: `"throws ForbiddenException with descriptive message"` uses bare try/catch with no `expect.assertions(1)` — test passes silently if the exception is never thrown [src/presentation/sse/sse.controller.spec.ts]
- [x] [Review][Patch] `@CurrentUser()` returns `request.user` without null-guard — any unguarded route yields `undefined` typed as `JwtPayload`, causing a 500 with stack trace instead of a controlled 401 [src/shared/decorators/current-user.decorator.ts]
- [x] [Review][Patch] `JWT_EXPIRES_IN` has no `@Min(1)` validator — a zero or negative value makes all issued tokens immediately expired at startup with no fail-fast error [src/shared/env.validation.ts]
- [x] [Review][Patch] `bootstrap()` called without `.catch()` — startup failures after `NestFactory.create` bypass `AppLogger` and emit an unhandled rejection instead of a structured error log [src/main.ts, last line]
- [x] [Review][Defer] `JWT_SECRET` no minimum length constraint (e.g., `@MinLength(32)`) — deferred, beyond story spec scope
- [x] [Review][Defer] No CORS policy configured — `app.enableCors()` absent — deferred, not in story scope
- [x] [Review][Defer] `JwtModule` configured with `signOptions` but gateway only verifies JWTs, never signs — deferred, architectural clarity concern for Story 8.5
- [x] [Review][Defer] `canActivate` override in `JwtAuthGuard` is pure delegation with no added logic — deferred, pre-existing
- [x] [Review][Defer] SSE `EMPTY` stream completes immediately, causing fast client reconnect loops — deferred, spec-approved stub behavior until Story 8.5
- [x] [Review][Defer] No graceful shutdown hooks (`app.enableShutdownHooks()`) — deferred, infrastructure concern beyond story scope

## Dev Notes

### Architecture Guardrails — READ BEFORE CODING

1. **API Gateway has NO database.** Do NOT import `DatabaseModule` from `../lib`. The gateway's `env.validation.ts` must NOT require `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD`, or `DB_NAME`. Use `GatewayEnvironmentVariables` (not `EnvironmentVariables` from `../lib/config`). [Source: docs/planning-artifacts/architecture.md#Microservice Boundaries]

2. **Use `@nestjs/config` directly for the gateway AppModule, NOT `ConfigModule` from `../lib/config`.** The lib `ConfigModule` wraps `@nestjs/config` with `validateEnv` that requires DB vars. Instead, call `NestConfigModule.forRoot({ isGlobal: true, validate: validateGatewayEnv, ... })` directly. [Source: Story 8.1 Dev Notes — lib ConfigModule uses shared validateEnv]

3. **Import shared lib via relative path `../../lib` (NOT `@nestjs/config`'s own module).** `services/lib` has no `package.json`. Import as: `import { LoggerModule, AppLogger, CorrelationInterceptor } from '../../lib'`. Add `@lib` path alias in tsconfig for convenience but verify alias resolves correctly in both build and test. [Source: docs/implementation-artifacts/stories/8-1-initialize-shared-packages-shared-db-shared-logger-shared-config.md#How Services Consume services/lib]

4. **JWT payload shape is fixed.** Token claims MUST be `{ user_id: string, clinic_id: string, role: string, iat: number, exp: number }`. This is the agreed-upon gateway contract. Never use `sub` — use `user_id`. [Source: docs/planning-artifacts/architecture.md#Authentication & Security]

5. **`clinic_id` anti-leak on SSE.** The `clinicId` query param MUST match `user.clinic_id` from the JWT. Mismatch → 403 Forbidden. This is a hard security requirement: cross-clinic SSE subscription is architecturally impossible. [Source: docs/planning-artifacts/architecture.md#clinic_id Scoping Strategy]

6. **SSE endpoint path is exactly `/events/queue`.** This path is what the frontend `EventSource` subscribes to. It is NOT under the `/api/v1/` prefix. Exclude it from `app.setGlobalPrefix('api/v1', { exclude: [...] })`. [Source: docs/planning-artifacts/architecture.md#SSE Real-Time Push]

7. **`/health` is also excluded from the `api/v1` prefix.** Docker health checks and load balancers call `/health` directly. [Source: docs/planning-artifacts/architecture.md#Infrastructure]

8. **JWT signature verification only — no DB call.** The gateway verifies the JWT signature locally using `JWT_SECRET`. It does NOT call `auth-service` for every request. Downstream services do their own role-based authorization from propagated identity metadata. [Source: docs/planning-artifacts/architecture.md#Gateway Auth Enforcement]

9. **No stack traces in error responses.** Override `handleRequest` in `JwtAuthGuard` to catch errors and re-throw a clean `UnauthorizedException`. Never leak internal error details to HTTP clients. [Source: OWASP A05:2021 — Security Misconfiguration]

10. **`tsconfig.json` for `api-gateway` must set `rootDir: ".."` and include `../lib/**/\*.ts`.** This compiles lib source directly into the gateway bundle (since lib has no own build step/package.json). Without `rootDir: ".."`, TypeScript will reject imports outside the `src/` folder. [Source: Story 8.1 Dev Notes — lib has no package.json]

11. **Each service has its own `package.json` as a pnpm workspace member.** `pnpm-workspace.yaml` has `services/*` which makes api-gateway a separate workspace package. It must have its own `package.json` with `"name": "dentiflow-api-gateway"`. [Source: docs/implementation-artifacts/stories/8-1-initialize-shared-packages-shared-db-shared-logger-shared-config.md#Project Structure Notes]

12. **NestJS naming conventions:** Files `kebab-case.ts`, Classes `PascalCase`, Constants `UPPER_SNAKE_CASE`, functions/variables `camelCase`. Test files co-located as `*.spec.ts`. [Source: docs/planning-artifacts/architecture.md#Naming Patterns]

---

### Previous Story Intelligence (Story 8.1)

- **`services/lib/` is deployed and tested.** 30 tests pass. Files: `database/`, `logger/`, `config/`, `index.ts`. Do NOT re-implement or copy any of these.
- **`services/lib/` has NO `package.json`.** Import by relative path from gateway `src/`: `../../lib` = `services/lib/`.
- **`reflect-metadata` must be the FIRST import** in `main.ts` AND in `jest.setup.ts` (critical for NestJS decorators and class-transformer to work). Missing it causes silent test failures.
- **`services/` root has its own `package.json`, `tsconfig.json`, `jest.config.ts`, `jest.setup.ts`**. The services-root jest config has `roots: ["<rootDir>/lib"]`. The `api-gateway` jest config should have `roots: ["<rootDir>/src", "<rootDir>/../lib"]` so lib tests are also discovered when running from within the service.
- **`EnvironmentVariables` in lib requires `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`** — all marked `@IsString()` without `@IsOptional()`. Do NOT use the lib's `validateEnv` in the gateway.
- **`AppLogger` pattern in `main.ts`:** `app.useLogger(app.get(AppLogger))` + `app.useGlobalInterceptors(app.get(CorrelationInterceptor))`.
- **`LoggerModule` is `@Global()`** — once imported in `AppModule`, `AppLogger` is injectable everywhere without re-importing.
- **tsconfig `rootDir` trick:** Story 8.1 established that `services/tsconfig.json` uses `"rootDir": "."` (services/ dir). The api-gateway tsconfig must use `"rootDir": ".."` (one level up, i.e., services/) so `../lib` imports stay inside rootDir during compilation.

---

### Required File Structure

```
services/
├── lib/                         ← existing from Story 8.1 (DO NOT MODIFY)
│   ├── index.ts
│   ├── database/
│   ├── logger/
│   └── config/
└── api-gateway/                 ← CREATE THIS ENTIRE FOLDER
    ├── src/
    │   ├── domain/
    │   │   └── auth/
    │   │       └── entities/
    │   │           └── jwt-payload.entity.ts
    │   ├── application/         ← empty at this story (routing use cases in 8.5+)
    │   ├── infrastructure/      ← empty at this story (HTTP/gRPC clients in 8.5+)
    │   ├── presentation/
    │   │   ├── health/
    │   │   │   ├── health.controller.ts
    │   │   │   ├── health.controller.spec.ts
    │   │   │   └── health.module.ts
    │   │   ├── sse/
    │   │   │   ├── sse.controller.ts
    │   │   │   ├── sse.controller.spec.ts
    │   │   │   └── sse.module.ts
    │   │   └── proxy/
    │   │       ├── proxy.controller.ts
    │   │       └── proxy.module.ts
    │   ├── shared/
    │   │   ├── decorators/
    │   │   │   └── current-user.decorator.ts
    │   │   ├── env.validation.ts
    │   │   ├── env.validation.spec.ts
    │   │   ├── guards/
    │   │   │   ├── jwt-auth.guard.ts
    │   │   │   └── jwt-auth.guard.spec.ts
    │   │   └── strategies/
    │   │       ├── jwt.strategy.ts
    │   │       └── jwt.strategy.spec.ts
    │   ├── app.module.ts
    │   └── main.ts
    ├── .env.example
    ├── Dockerfile
    ├── jest.config.ts
    ├── jest.setup.ts
    ├── package.json
    └── tsconfig.json
```

---

### Key Code Patterns

**`services/api-gateway/package.json`:**

```json
{
  "name": "dentiflow-api-gateway",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "start": "node dist/src/main.js",
    "start:dev": "ts-node -r tsconfig-paths/register src/main.ts",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage"
  },
  "dependencies": {
    "@nestjs/common": "^10.4.15",
    "@nestjs/core": "^10.4.15",
    "@nestjs/config": "^3.3.0",
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/passport": "^10.0.3",
    "@nestjs/platform-express": "^10.4.15",
    "@nestjs/axios": "^3.1.3",
    "axios": "^1.8.4",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.1",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1",
    "uuid": "^11.0.5",
    "winston": "^3.17.0"
  },
  "devDependencies": {
    "@nestjs/testing": "^10.4.15",
    "@types/jest": "^29.5.14",
    "@types/node": "^22.14.1",
    "@types/passport-jwt": "^4.0.1",
    "@types/uuid": "^10.0.0",
    "jest": "^29.7.0",
    "supertest": "^7.1.0",
    "@types/supertest": "^6.0.3",
    "ts-jest": "^29.3.2",
    "ts-node": "^10.9.2",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.8.3"
  }
}
```

**`services/api-gateway/tsconfig.json`:**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "..",
    "baseUrl": ".",
    "paths": {
      "@lib": ["../lib/index"],
      "@lib/*": ["../lib/*"]
    }
  },
  "include": ["src/**/*.ts", "../lib/**/*.ts"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts"]
}
```

**`services/api-gateway/jest.config.ts`:**

```typescript
import type {Config} from "jest";

const config: Config = {
  moduleFileExtensions: ["js", "json", "ts"],
  roots: ["<rootDir>/src"],
  testRegex: ".*\\.spec\\.ts$",
  setupFiles: ["<rootDir>/jest.setup.ts"],
  transform: {
    "^.+\\.(t|j)s$": ["ts-jest", {tsconfig: "<rootDir>/tsconfig.json"}],
  },
  moduleNameMapper: {
    "^@lib$": "<rootDir>/../lib/index",
    "^@lib/(.*)$": "<rootDir>/../lib/$1",
  },
  collectCoverageFrom: ["src/**/*.(t|j)s"],
  coverageDirectory: "./coverage",
  testEnvironment: "node",
};

export default config;
```

**`services/api-gateway/jest.setup.ts`:**

```typescript
import "reflect-metadata";
```

**`services/api-gateway/src/main.ts`:**

```typescript
import "reflect-metadata";
import {NestFactory} from "@nestjs/core";
import {AppModule} from "./app.module";
import {AppLogger, CorrelationInterceptor} from "../../lib";
import {ConfigService} from "@nestjs/config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {bufferLogs: true});

  app.useLogger(app.get(AppLogger));
  app.useGlobalInterceptors(app.get(CorrelationInterceptor));

  // /health and /events/queue are outside the versioned API prefix
  app.setGlobalPrefix("api/v1", {
    exclude: ["/health", "/events/queue"],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>("PORT", 3000);

  await app.listen(port);
  app.get(AppLogger).log(`API Gateway running on port ${port}`, "Bootstrap");
}

bootstrap();
```

**`services/api-gateway/src/app.module.ts`:**

```typescript
import {Module} from "@nestjs/common";
import {ConfigModule as NestConfigModule, ConfigService} from "@nestjs/config";
import {JwtModule} from "@nestjs/jwt";
import {PassportModule} from "@nestjs/passport";
import {HttpModule} from "@nestjs/axios";
import {LoggerModule} from "../../lib/logger";
import {validateGatewayEnv} from "./shared/env.validation";
import {JwtStrategy} from "./shared/strategies/jwt.strategy";
import {HealthModule} from "./presentation/health/health.module";
import {SseModule} from "./presentation/sse/sse.module";
import {ProxyModule} from "./presentation/proxy/proxy.module";

@Module({
  imports: [
    // MUST be first — provides ConfigService globally
    // NOTE: Use NestConfigModule directly (NOT lib ConfigModule) — gateway has no DB
    NestConfigModule.forRoot({
      isGlobal: true,
      validate: validateGatewayEnv,
      envFilePath: [".env.local", ".env"],
    }),

    // Global structured JSON logger + correlation interceptor
    LoggerModule,

    // Passport with JWT as default strategy
    PassportModule.register({defaultStrategy: "jwt"}),

    // JwtModule — used by JwtStrategy for signature verification
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>("JWT_SECRET"),
        signOptions: {
          expiresIn: configService.get<number>("JWT_EXPIRES_IN", 900),
        },
      }),
    }),

    // HTTP client for future proxy calls (gRPC wired in Story 8.5)
    HttpModule,

    // Feature modules
    HealthModule,
    SseModule,
    ProxyModule,
  ],
  providers: [JwtStrategy],
})
export class AppModule {}
```

**`services/api-gateway/src/shared/env.validation.ts`:**

```typescript
import {plainToInstance} from "class-transformer";
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  validateSync,
} from "class-validator";

export enum NodeEnvironment {
  Development = "development",
  Production = "production",
  Test = "test",
}

/**
 * GatewayEnvironmentVariables — validated env contract for api-gateway.
 * IMPORTANT: NO DB vars — the gateway has no database.
 */
export class GatewayEnvironmentVariables {
  @IsEnum(NodeEnvironment)
  @IsOptional()
  NODE_ENV: NodeEnvironment = NodeEnvironment.Development;

  @IsString()
  JWT_SECRET!: string;

  @IsNumber()
  @IsOptional()
  JWT_EXPIRES_IN: number = 900;

  @IsString()
  @IsOptional()
  LOG_LEVEL: string = "info";

  @IsNumber()
  @Min(1)
  @Max(65535)
  @IsOptional()
  PORT: number = 3000;

  // Downstream service URLs — placeholder until gRPC in Story 8.5
  @IsString()
  @IsOptional()
  AUTH_SERVICE_URL: string = "http://auth-service:3001";

  @IsString()
  @IsOptional()
  CLINIC_SERVICE_URL: string = "http://clinic-service:3002";
}

export function validateGatewayEnv(
  config: Record<string, unknown>,
): GatewayEnvironmentVariables {
  const validated = plainToInstance(GatewayEnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, {skipMissingProperties: false});
  if (errors.length > 0) {
    const messages = errors
      .map((e) => Object.values(e.constraints ?? {}).join(", "))
      .join("\n");
    throw new Error(`Gateway environment validation failed:\n${messages}`);
  }
  return validated;
}
```

**`services/api-gateway/src/domain/auth/entities/jwt-payload.entity.ts`:**

```typescript
/**
 * JwtPayload — the verified claims extracted from a DentilFlow JWT.
 * Shape is fixed by the auth-service issuer contract.
 * Do NOT rename fields — they match the token payload as-issued.
 */
export interface JwtPayload {
  user_id: string;
  clinic_id: string;
  role: string;
  iat: number;
  exp: number;
}
```

**`services/api-gateway/src/shared/strategies/jwt.strategy.ts`:**

```typescript
import {Injectable} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {ExtractJwt, Strategy} from "passport-jwt";
import {ConfigService} from "@nestjs/config";
import {JwtPayload} from "../../domain/auth/entities/jwt-payload.entity";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>("JWT_SECRET"),
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    // passport-jwt has already verified the signature and expiry.
    // Return the payload as-is — it becomes request.user downstream.
    return payload;
  }
}
```

**`services/api-gateway/src/shared/guards/jwt-auth.guard.ts`:**

```typescript
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import {AuthGuard} from "@nestjs/passport";
import {JwtPayload} from "../../domain/auth/entities/jwt-payload.entity";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest<T = JwtPayload>(err: Error | null, user: T | false): T {
    // Never leak internal error details to HTTP response
    if (err || !user) {
      throw new UnauthorizedException(
        "Invalid or missing authentication token",
      );
    }
    return user;
  }
}
```

**`services/api-gateway/src/shared/decorators/current-user.decorator.ts`:**

```typescript
import {createParamDecorator, ExecutionContext} from "@nestjs/common";
import {JwtPayload} from "../../domain/auth/entities/jwt-payload.entity";

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest<{user: JwtPayload}>();
    return request.user;
  },
);
```

**`services/api-gateway/src/presentation/health/health.controller.ts`:**

```typescript
import {Controller, Get} from "@nestjs/common";

@Controller()
export class HealthController {
  @Get("/health")
  check(): {status: string; timestamp: string} {
    return {status: "ok", timestamp: new Date().toISOString()};
  }
}
```

**`services/api-gateway/src/presentation/sse/sse.controller.ts`:**

```typescript
import {
  Controller,
  ForbiddenException,
  Query,
  Sse,
  UseGuards,
} from "@nestjs/common";
import {Observable, EMPTY} from "rxjs";
import {MessageEvent} from "@nestjs/common";
import {JwtAuthGuard} from "../../shared/guards/jwt-auth.guard";
import {CurrentUser} from "../../shared/decorators/current-user.decorator";
import {JwtPayload} from "../../domain/auth/entities/jwt-payload.entity";

@Controller()
export class SseController {
  /**
   * SSE queue event stream.
   * clinicId query param MUST match the JWT clinic_id claim.
   * NATS subscription is wired in Story 8.5; returns EMPTY for now.
   */
  @UseGuards(JwtAuthGuard)
  @Sse("/events/queue")
  queueEvents(
    @Query("clinicId") clinicId: string,
    @CurrentUser() user: JwtPayload,
  ): Observable<MessageEvent> {
    // clinic_id anti-leak: query param must match token claim
    if (clinicId !== user.clinic_id) {
      throw new ForbiddenException(
        "clinicId does not match authenticated clinic scope",
      );
    }
    // Stub: NATS subscription to queue.status.updated added in Story 8.5
    return EMPTY;
  }
}
```

**`services/api-gateway/src/presentation/proxy/proxy.controller.ts`:**

```typescript
import {Controller, Get, UseGuards} from "@nestjs/common";
import {JwtAuthGuard} from "../../shared/guards/jwt-auth.guard";

/**
 * ProxyController — placeholder routes for downstream services.
 * All routes are JWT-guarded. Actual gRPC proxying is wired in Story 8.5.
 */
@Controller()
@UseGuards(JwtAuthGuard)
export class ProxyController {
  @Get("auth/me")
  authMe(): {message: string} {
    return {message: "auth-service proxy placeholder"};
  }

  @Get("clinics")
  clinics(): {message: string} {
    return {message: "clinic-service proxy placeholder"};
  }
}
```

**`services/api-gateway/Dockerfile`:**

```dockerfile
# ── Build stage ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Copy workspace manifests for dependency install
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.base.json ./

# Copy shared lib (no package.json — source only)
COPY services/lib/ ./services/lib/

# Copy api-gateway source
COPY services/api-gateway/ ./services/api-gateway/

# Install all deps (includes devDependencies for TypeScript compilation)
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Compile TypeScript (rootDir: ".." in tsconfig covers ../lib too)
RUN cd services/api-gateway && npx tsc -p tsconfig.json

# ── Production stage ─────────────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/services/api-gateway/dist/ ./dist/
COPY --from=builder /app/services/api-gateway/package.json ./

# Install production dependencies only
RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile

USER appuser

EXPOSE 3000
CMD ["node", "dist/src/main.js"]
```

**`services/api-gateway/.env.example`:**

```dotenv
# Gateway port (default: 3000)
PORT=3000

# JWT signing secret — MUST match auth-service JWT_SECRET
JWT_SECRET=change-me-in-production

# JWT access token TTL in seconds (default: 900 = 15 min)
JWT_EXPIRES_IN=900

# Logging level: debug | info | warn | error
LOG_LEVEL=info

# Environment: development | production | test
NODE_ENV=development

# Downstream service base URLs (used in Story 8.5 gRPC wiring)
AUTH_SERVICE_URL=http://auth-service:3001
CLINIC_SERVICE_URL=http://clinic-service:3002
```

---

### Testing Requirements

- All tests: `*.spec.ts` co-located in same folder as source file. No `__tests__/` directories.
- `jest.setup.ts` MUST import `reflect-metadata` as first line (NestJS decorator requirement).
- Use `@nestjs/testing` `Test.createTestingModule()` for unit tests requiring DI.
- **`env.validation.spec.ts`:** Call `validateGatewayEnv()` directly. Assert: missing `JWT_SECRET` throws; `DB_HOST` being absent does NOT throw; valid minimal config (only `JWT_SECRET`) resolves with correct defaults for `PORT`, `NODE_ENV`, `LOG_LEVEL`.
- **`jwt.strategy.spec.ts`:** Create `JwtStrategy` with a mocked `ConfigService.getOrThrow` returning `'test-secret'`. Call `validate(payload)` and assert it returns the payload unchanged. Do NOT test passport internals (trust the library).
- **`jwt-auth.guard.spec.ts`:** Instantiate `JwtAuthGuard`. Test `handleRequest(null, payload)` returns `payload`. Test `handleRequest(null, false)` throws `UnauthorizedException`. Test `handleRequest(new Error('x'), null)` throws `UnauthorizedException`.
- **`health.controller.spec.ts`:** Bootstrap `Test.createTestingModule({ controllers: [HealthController] })`. Call `check()` and assert `{ status: 'ok' }` is returned and `timestamp` is an ISO string.
- **`sse.controller.spec.ts`:** Test `queueEvents()` throws `ForbiddenException` when `clinicId !== user.clinic_id`. Test it returns an `Observable` when `clinicId === user.clinic_id`.

---

### Project Structure Notes

- `services/api-gateway/` is a new pnpm workspace member via `services/*` in `pnpm-workspace.yaml` (already configured in Story 8.1).
- Run `pnpm install` from monorepo root after creating `services/api-gateway/package.json`.
- The services-root `jest.config.ts` has `roots: ["<rootDir>/lib"]` — it will NOT pick up api-gateway tests. Run api-gateway tests from within `services/api-gateway/` or via turbo.
- `application/` and `infrastructure/` folders are intentionally empty at this story — proxying use cases and gRPC/HTTP clients are wired in Story 8.5.
- Frontend is completely unaffected by this story.

### References

- [Source: docs/planning-artifacts/architecture.md#API & Communication Patterns] — SSE path `/events/queue`, gRPC internal, `/api/v1/` prefix
- [Source: docs/planning-artifacts/architecture.md#Gateway Auth Enforcement] — JWT-only verification, `effectiveClinicId` from token not URL
- [Source: docs/planning-artifacts/architecture.md#clinic_id Scoping Strategy] — SSE clinicId anti-leak rule
- [Source: docs/planning-artifacts/architecture.md#Authentication & Security] — JWT payload `{ user_id, clinic_id, role, iat, exp }`, 15-min TTL
- [Source: docs/planning-artifacts/architecture.md#Naming Patterns] — kebab-case files, PascalCase classes
- [Source: docs/planning-artifacts/architecture.md#Structure Patterns] — NestJS service internal Clean Architecture layout
- [Source: docs/planning-artifacts/architecture.md#REST API Endpoints] — `/api/v1/` prefix, plural kebab-case resources
- [Source: docs/planning-artifacts/architecture.md#Microservice Boundaries] — api-gateway inbound REST, outbound gRPC + NATS
- [Source: docs/implementation-artifacts/stories/8-1-initialize-shared-packages-shared-db-shared-logger-shared-config.md#Dev Notes] — lib relative imports, `reflect-metadata` first, tsconfig rootDir
- [Source: docs/planning-artifacts/epics.md#Story 8.2] — acceptance criteria source

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

- Env validation: `@IsString()` alone does NOT reject empty strings — added `@IsNotEmpty()` to `JWT_SECRET` to prevent blank secret (security hardening, OWASP A07:2021 — Identification and Authentication Failures).
- `pnpm install` from monorepo root failed due to Next.js dev server locking frontend files; resolved with `pnpm install --filter=dentiflow-api-gateway`.

### Completion Notes List

- ✅ Task 1: Bootstrapped `services/api-gateway/` NestJS application with `package.json`, `tsconfig.json` (rootDir: ".."), `jest.config.ts`, `jest.setup.ts`, `src/main.ts`, `src/app.module.ts`.
- ✅ Task 2: Created `GatewayEnvironmentVariables` with `JWT_SECRET` (required + non-empty), `PORT` default 3000, no DB vars. `validateGatewayEnv()` uses `plainToInstance` + `validateSync`. 5 unit tests covering missing/empty JWT_SECRET, DB vars not required, full config parsing.
- ✅ Task 3: Created `JwtPayload` interface, `JwtStrategy` (passport-jwt), `JwtAuthGuard` (clean UnauthorizedException, no stack leakage), `@CurrentUser()` decorator. 3+5 unit tests.
- ✅ Task 4: `HealthController` at `GET /health` (no auth) returns `{ status: 'ok', timestamp: ISO }`. 4 unit tests.
- ✅ Task 5: `SseController` at `GET /events/queue` guarded by `JwtAuthGuard`, enforces `clinicId === user.clinic_id` (anti-leak 403). Returns `EMPTY` observable stub. 5 unit tests.
- ✅ Task 6: `ProxyController` with `GET auth/me` and `GET clinics` placeholder routes, all guarded by `JwtAuthGuard`. Module wired.
- ✅ Task 7: Multi-stage Dockerfile (builder + production), non-root user `appuser`, `.env.example` documenting all env vars.
- ✅ All 22 api-gateway tests pass; 30 lib tests still pass (no regressions).

### File List

- `services/api-gateway/package.json` (created)
- `services/api-gateway/tsconfig.json` (created)
- `services/api-gateway/jest.config.ts` (created)
- `services/api-gateway/jest.setup.ts` (created)
- `services/api-gateway/Dockerfile` (created)
- `services/api-gateway/.env.example` (created)
- `services/api-gateway/src/main.ts` (created)
- `services/api-gateway/src/app.module.ts` (created)
- `services/api-gateway/src/domain/auth/entities/jwt-payload.entity.ts` (created)
- `services/api-gateway/src/shared/env.validation.ts` (created)
- `services/api-gateway/src/shared/env.validation.spec.ts` (created)
- `services/api-gateway/src/shared/decorators/current-user.decorator.ts` (created)
- `services/api-gateway/src/shared/guards/jwt-auth.guard.ts` (created)
- `services/api-gateway/src/shared/guards/jwt-auth.guard.spec.ts` (created)
- `services/api-gateway/src/shared/strategies/jwt.strategy.ts` (created)
- `services/api-gateway/src/shared/strategies/jwt.strategy.spec.ts` (created)
- `services/api-gateway/src/presentation/health/health.controller.ts` (created)
- `services/api-gateway/src/presentation/health/health.controller.spec.ts` (created)
- `services/api-gateway/src/presentation/health/health.module.ts` (created)
- `services/api-gateway/src/presentation/sse/sse.controller.ts` (created)
- `services/api-gateway/src/presentation/sse/sse.controller.spec.ts` (created)
- `services/api-gateway/src/presentation/sse/sse.module.ts` (created)
- `services/api-gateway/src/presentation/proxy/proxy.controller.ts` (created)
- `services/api-gateway/src/presentation/proxy/proxy.module.ts` (created)
- `docs/implementation-artifacts/sprint-status.yaml` (modified)
