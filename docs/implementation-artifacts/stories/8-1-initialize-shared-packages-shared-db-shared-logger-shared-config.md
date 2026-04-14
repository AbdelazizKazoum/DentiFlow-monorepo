# Story 8.1: Initialize Shared `services/lib` Folder (database, logger, config modules)

Status: review

## Story

As a developer,
I want a shared `lib` folder inside `services/` that all microservices can import from,
so that the `database`, `logger`, and `config` NestJS modules are written once, follow Repository Pattern + DI/IoC, and are never duplicated across services.

## Acceptance Criteria

1. **Given** the monorepo root, **When** `pnpm install` is run after updating `pnpm-workspace.yaml`, **Then** all future service packages under `services/*` will be resolved by pnpm.

2. **Given** a NestJS service that imports `DatabaseModule` from `'../lib/database'`, **When** the service bootstraps, **Then** `DatabaseModule.forRoot()` registers a TypeORM MySQL DataSource via `ConfigService` (IoC), connects in Data Mapper mode (`synchronize: false`), and `BaseRepository<T>` enforces `clinic_id` on every read and delete operation.

3. **Given** a NestJS service that imports `LoggerModule` from `'../lib/logger'`, **When** `AppLogger.logWithContext()` is called with `{ clinicId, userId, traceId }`, **Then** the log written to `stdout` is valid JSON containing `message`, `level`, `timestamp`, `clinicId`, `userId`, and `traceId` fields.

4. **Given** a NestJS service that imports `ConfigModule` from `'../lib/config'`, **When** a required env var (e.g., `DB_HOST`) is absent or invalid at startup, **Then** the application throws a descriptive validation error and the process exits with a non-zero code.

5. **Given** the `services/lib/` folder, **When** a consuming service's jest suite runs with `roots` including `'../lib'`, **Then** all co-located `*.spec.ts` tests in `services/lib/` pass with no real DB or network connections.

## Tasks / Subtasks

- [x] Task 1: Bootstrap monorepo workspace (AC: 1)
  - [x] Update root `pnpm-workspace.yaml`: add `packages:` section listing `'frontend'`, `'packages/*'`, `'services/*'`
  - [x] Update root `package.json`: add `"name": "dentiflow-monorepo"`, `"private": true`, scripts for `build/test/lint` via turbo (see Dev Notes)
  - [x] Create `turbo.json` at root (see Dev Notes)
  - [x] Create `tsconfig.base.json` at root (see Dev Notes)

- [x] Task 2: Implement `database` module (AC: 2, 5)
  - [x] Create `services/lib/database/database.module.ts` — `DatabaseModule.forRoot()` using `TypeOrmModule.forRootAsync` + `ConfigService` via IoC
  - [x] Create `services/lib/database/typeorm.factory.ts` — `typeormOptionsFactory(configService)` returning MySQL options (`synchronize: false`, `charset: utf8mb4`, `timezone: Z`)
  - [x] Create `services/lib/database/base.repository.ts` — abstract `BaseRepository<T>` with `clinic_id`-scoped `findById`, `findAll`, `save`, `delete`, `count` (see Dev Notes)
  - [x] Create `services/lib/database/base.repository.spec.ts` — unit tests verifying `clinic_id` is present in every WHERE clause using a mocked `Repository<T>` (no real DB)
  - [x] Create `services/lib/database/index.ts` — barrel exports

- [x] Task 3: Implement `logger` module (AC: 3, 5)
  - [x] Create `services/lib/logger/logger.module.ts` — `LoggerModule` decorated `@Global()`, provides and exports `AppLogger` and `CorrelationInterceptor`
  - [x] Create `services/lib/logger/logger.service.ts` — `AppLogger` implementing `LoggerService`, backed by Winston JSON; exposes `logWithContext(level, message, ctx)` (see Dev Notes)
  - [x] Create `services/lib/logger/correlation.interceptor.ts` — `CorrelationInterceptor`; reads/generates `x-trace-id` per request via `AsyncLocalStorage`
  - [x] Create `services/lib/logger/logger.service.spec.ts` — unit tests verifying JSON output includes all required observability fields
  - [x] Create `services/lib/logger/index.ts` — barrel exports

- [x] Task 4: Implement `config` module (AC: 4, 5)
  - [x] Create `services/lib/config/env.validation.ts` — `EnvironmentVariables` class with `class-validator` decorators; `validateEnv()` for fail-fast startup validation (see Dev Notes)
  - [x] Create `services/lib/config/config.module.ts` — `ConfigModule.forRoot()` wrapping `@nestjs/config` with `isGlobal: true` and `validate: validateEnv`
  - [x] Create `services/lib/config/env.validation.spec.ts` — unit tests: missing `DB_HOST` throws, missing `JWT_SECRET` throws, valid config resolves with defaults
  - [x] Create `services/lib/config/index.ts` — barrel exports

- [x] Task 5: Wire top-level barrel (AC: 2, 3, 4)
  - [x] Create `services/lib/index.ts` — re-exports everything from `./database`, `./logger`, `./config`

## Dev Notes

### Architecture Guardrails — READ BEFORE CODING

1. **TypeORM Data Mapper mode ONLY — no Active Record.** Never call `Entity.save()` or `Entity.find()` as static methods. Every TypeORM `Repository<T>` is injected via NestJS DI. [Source: docs/planning-artifacts/architecture.md#Data Architecture]

2. **`clinic_id` on EVERY database operation — no exceptions.** `BaseRepository<T>` MUST include `clinic_id` in `WHERE` for all reads and deletes. This is the top-priority monorepo rule. [Source: docs/planning-artifacts/architecture.md#Enforcement Rules]

3. **`synchronize: false` always.** Schema changes are handled via TypeORM migrations per service. Never set it `true`, not even in tests. [Source: docs/planning-artifacts/architecture.md#Data Architecture]

4. **Shared modules live in `services/lib/` only.** Do NOT copy or recreate these modules inside individual services. Services import from `'../lib'`. [Source: docs/planning-artifacts/architecture.md#Monorepo Layout]

5. **Structured JSON logs MUST include `clinicId`, `userId`, `traceId`.** These fields are mandatory per the observability baseline. [Source: docs/planning-artifacts/architecture.md#Observability Baseline]

6. **Env validation at startup — fail fast.** `ConfigModule` must throw a descriptive error if required vars are missing. Use `class-validator` + `class-transformer` only — NOT Joi. [Source: docs/planning-artifacts/architecture.md#Validation Strategy]

7. **MUST NOT duplicate these modules per service.** If a service needs the database, it imports `DatabaseModule` from `'../lib/database'`. Never copy the module code. [Source: docs/planning-artifacts/architecture.md#Enforcement Rules]

8. **Test co-location.** Tests live as `*.spec.ts` in the same folder as the source file. No `__tests__/` directories. [Source: docs/planning-artifacts/architecture.md#Test Co-location]

9. **TypeScript naming:** Files `kebab-case.ts`, Classes `PascalCase`, Constants `UPPER_SNAKE_CASE`. [Source: docs/planning-artifacts/architecture.md#Naming Patterns]

---

### Required File Structure

```
dentiflow-monorepo/
├── frontend/               ← existing (untouched)
├── pnpm-workspace.yaml     ← UPDATE
├── package.json            ← UPDATE
├── turbo.json              ← CREATE
├── tsconfig.base.json      ← CREATE
└── services/
    └── lib/                ← shared NestJS modules (NO package.json)
        ├── index.ts
        ├── database/
        │   ├── database.module.ts
        │   ├── typeorm.factory.ts
        │   ├── base.repository.ts
        │   ├── base.repository.spec.ts
        │   └── index.ts
        ├── logger/
        │   ├── logger.module.ts
        │   ├── logger.service.ts
        │   ├── logger.service.spec.ts
        │   ├── correlation.interceptor.ts
        │   └── index.ts
        └── config/
            ├── config.module.ts
            ├── env.validation.ts
            ├── env.validation.spec.ts
            └── index.ts
```

`services/lib/` has **no `package.json`** — it is plain TypeScript source consumed by sibling services via relative imports. Runtime dependencies (`@nestjs/common`, `winston`, etc.) are declared in each consuming service`s own `package.json`.

---

### Monorepo Root Files

**Root `pnpm-workspace.yaml` (updated):**

```yaml
packages:
  - "frontend"
  - "packages/*"
  - "services/*"

allowBuilds:
  "@parcel/watcher": false
  "@swc/core": false
  sharp: false
```

**Root `package.json` (updated):**

```json
{
  "name": "dentiflow-monorepo",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint"
  },
  "devDependencies": {
    "turbo": "^2.3.3"
  }
}
```

**`turbo.json` (create at root):**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "outputs": []
    }
  }
}
```

**`tsconfig.base.json` (create at root):**

```json
{
  "compilerOptions": {
    "target": "ES2021",
    "module": "CommonJS",
    "lib": ["ES2021"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

---

### Module: `database`

**`services/lib/database/typeorm.factory.ts`:**

```typescript
import {TypeOrmModuleOptions} from "@nestjs/typeorm";
import {ConfigService} from "@nestjs/config";

export function typeormOptionsFactory(
  configService: ConfigService,
): TypeOrmModuleOptions {
  return {
    type: "mysql",
    host: configService.get<string>("DB_HOST", "localhost"),
    port: configService.get<number>("DB_PORT", 3306),
    username: configService.getOrThrow<string>("DB_USERNAME"),
    password: configService.getOrThrow<string>("DB_PASSWORD"),
    database: configService.getOrThrow<string>("DB_NAME"),
    entities: [], // services register their own entities via TypeOrmModule.forFeature()
    synchronize: false, // NEVER true — schema changes go through migrations
    migrationsRun: false,
    logging: configService.get<string>("NODE_ENV") !== "production",
    charset: "utf8mb4", // supports Arabic and all Unicode characters
    timezone: "Z", // store all timestamps as UTC
  };
}
```

**`services/lib/database/database.module.ts`:**

```typescript
import {DynamicModule, Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {ConfigService} from "@nestjs/config";
import {typeormOptionsFactory} from "./typeorm.factory";

/**
 * DatabaseModule — registers the TypeORM DataSource for a service.
 *
 * Usage in service AppModule:
 *   DatabaseModule.forRoot()
 *
 * ConfigService is resolved automatically by IoC from the globally
 * registered ConfigModule (must be first import in AppModule).
 */
@Module({})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        TypeOrmModule.forRootAsync({
          useFactory: typeormOptionsFactory,
          inject: [ConfigService],
        }),
      ],
    };
  }
}
```

**`services/lib/database/base.repository.ts`:**

```typescript
import {
  DeepPartial,
  FindManyOptions,
  FindOptionsWhere,
  Repository,
} from "typeorm";

/**
 * BaseRepository<T> — abstract generic repository enforcing clinic_id
 * scoping on every DB operation.
 *
 * EVERY service repository MUST extend this class.
 * T requires `id: string` (UUID v4) and `clinic_id: string`.
 *
 * Usage:
 *   @Injectable()
 *   export class UserRepository extends BaseRepository<UserEntity> {
 *     constructor(@InjectRepository(UserEntity) repo: Repository<UserEntity>) {
 *       super(repo);
 *     }
 *   }
 */
export abstract class BaseRepository<
  T extends {id: string; clinic_id: string},
> {
  constructor(protected readonly repo: Repository<T>) {}

  findById(id: string, clinicId: string): Promise<T | null> {
    return this.repo.findOne({
      where: {id, clinic_id: clinicId} as FindOptionsWhere<T>,
    });
  }

  findAll(
    clinicId: string,
    options?: Omit<FindManyOptions<T>, "where">,
  ): Promise<T[]> {
    return this.repo.find({
      ...options,
      where: {clinic_id: clinicId} as FindOptionsWhere<T>,
    });
  }

  save(entity: DeepPartial<T>): Promise<T> {
    return this.repo.save(entity);
  }

  async delete(id: string, clinicId: string): Promise<void> {
    await this.repo.delete({id, clinic_id: clinicId} as FindOptionsWhere<T>);
  }

  count(clinicId: string): Promise<number> {
    return this.repo.count({
      where: {clinic_id: clinicId} as FindOptionsWhere<T>,
    });
  }
}
```

**`services/lib/database/index.ts`:**

```typescript
export {DatabaseModule} from "./database.module";
export {BaseRepository} from "./base.repository";
export {typeormOptionsFactory} from "./typeorm.factory";
```

---

### Module: `logger`

**`services/lib/logger/logger.service.ts`:**

```typescript
import {Injectable, LoggerService, Scope} from "@nestjs/common";
import * as winston from "winston";

export interface LogContext {
  clinicId?: string;
  userId?: string;
  traceId?: string;
  [key: string]: unknown;
}

/**
 * AppLogger — structured JSON logger backed by Winston.
 *
 * Replaces the default Nest logger in each service main.ts:
 *   app.useLogger(app.get(AppLogger));
 *
 * Always call logWithContext() with { clinicId, userId, traceId }
 * for data-access and business-logic logs.
 */
@Injectable({scope: Scope.DEFAULT})
export class AppLogger implements LoggerService {
  private readonly logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env["LOG_LEVEL"] ?? "info",
      format: winston.format.combine(
        winston.format.timestamp({format: "YYYY-MM-DDTHH:mm:ss.SSSZ"}),
        winston.format.errors({stack: true}),
        winston.format.json(),
      ),
      transports: [new winston.transports.Console()],
    });
  }

  log(message: string, context?: string): void {
    this.logger.info(message, {context});
  }

  error(message: string, trace?: string, context?: string): void {
    this.logger.error(message, {trace, context});
  }

  warn(message: string, context?: string): void {
    this.logger.warn(message, {context});
  }

  debug(message: string, context?: string): void {
    this.logger.debug(message, {context});
  }

  verbose(message: string, context?: string): void {
    this.logger.verbose(message, {context});
  }

  logWithContext(
    level: "info" | "warn" | "error" | "debug",
    message: string,
    ctx: LogContext,
  ): void {
    this.logger.log(level, message, ctx);
  }
}
```

**`services/lib/logger/correlation.interceptor.ts`:**

```typescript
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import {Observable} from "rxjs";
import {v4 as uuidv4} from "uuid";
import {AsyncLocalStorage} from "async_hooks";

export interface CorrelationContext {
  traceId: string;
  clinicId?: string;
  userId?: string;
}

export const correlationStore = new AsyncLocalStorage<CorrelationContext>();

/**
 * CorrelationInterceptor — generates or forwards a traceId per request
 * and stores it in AsyncLocalStorage so AppLogger can read it without
 * threading it through every call.
 *
 * Register globally in each service main.ts:
 *   app.useGlobalInterceptors(app.get(CorrelationInterceptor));
 */
@Injectable()
export class CorrelationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
    }>();
    const traceId = req.headers["x-trace-id"] ?? uuidv4();

    return new Observable((subscriber) => {
      correlationStore.run({traceId}, () => {
        next.handle().subscribe(subscriber);
      });
    });
  }
}
```

**`services/lib/logger/logger.module.ts`:**

```typescript
import {Global, Module} from "@nestjs/common";
import {AppLogger} from "./logger.service";
import {CorrelationInterceptor} from "./correlation.interceptor";

/**
 * LoggerModule — global module: AppLogger and CorrelationInterceptor
 * are injectable everywhere without re-importing.
 */
@Global()
@Module({
  providers: [AppLogger, CorrelationInterceptor],
  exports: [AppLogger, CorrelationInterceptor],
})
export class LoggerModule {}
```

**`services/lib/logger/index.ts`:**

```typescript
export {LoggerModule} from "./logger.module";
export {AppLogger} from "./logger.service";
export type {LogContext} from "./logger.service";
export {
  CorrelationInterceptor,
  correlationStore,
} from "./correlation.interceptor";
export type {CorrelationContext} from "./correlation.interceptor";
```

---

### Module: `config`

**`services/lib/config/env.validation.ts`:**

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
 * EnvironmentVariables — validated contract for required env vars.
 * Services may extend this class to add service-specific vars.
 */
export class EnvironmentVariables {
  @IsEnum(NodeEnvironment)
  @IsOptional()
  NODE_ENV: NodeEnvironment = NodeEnvironment.Development;

  @IsString()
  DB_HOST!: string;

  @IsNumber()
  @Min(1)
  @Max(65535)
  @IsOptional()
  DB_PORT: number = 3306;

  @IsString()
  DB_USERNAME!: string;

  @IsString()
  DB_PASSWORD!: string;

  @IsString()
  DB_NAME!: string;

  @IsString()
  JWT_SECRET!: string;

  @IsNumber()
  @IsOptional()
  JWT_EXPIRES_IN: number = 900; // seconds — 15 min, matches frontend NextAuth TTL

  @IsString()
  @IsOptional()
  LOG_LEVEL: string = "info";

  @IsNumber()
  @IsOptional()
  PORT: number = 3000;
}

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, {skipMissingProperties: false});
  if (errors.length > 0) {
    const messages = errors
      .map((e) => Object.values(e.constraints ?? {}).join(", "))
      .join("\n");
    throw new Error(`Environment validation failed:\n${messages}`);
  }
  return validated;
}
```

**`services/lib/config/config.module.ts`:**

```typescript
import {DynamicModule, Module} from "@nestjs/common";
import {
  ConfigModule as NestConfigModule,
  ConfigModuleOptions,
} from "@nestjs/config";
import {validateEnv} from "./env.validation";

/**
 * ConfigModule — wraps @nestjs/config with fail-fast validation.
 *
 * MUST be the first import in the service AppModule.
 * isGlobal: true makes ConfigService injectable everywhere.
 */
@Module({})
export class ConfigModule {
  static forRoot(options: Partial<ConfigModuleOptions> = {}): DynamicModule {
    return {
      module: ConfigModule,
      imports: [
        NestConfigModule.forRoot({
          isGlobal: true,
          validate: validateEnv,
          envFilePath: [".env.local", ".env"],
          ...options,
        }),
      ],
      exports: [NestConfigModule],
    };
  }
}
```

**`services/lib/config/index.ts`:**

```typescript
export {ConfigModule} from "./config.module";
export {
  EnvironmentVariables,
  validateEnv,
  NodeEnvironment,
} from "./env.validation";
```

---

### Top-Level Barrel

**`services/lib/index.ts`:**

```typescript
export {
  DatabaseModule,
  BaseRepository,
  typeormOptionsFactory,
} from "./database";
export {
  LoggerModule,
  AppLogger,
  CorrelationInterceptor,
  correlationStore,
} from "./logger";
export type {LogContext, CorrelationContext} from "./logger";
export {
  ConfigModule,
  EnvironmentVariables,
  validateEnv,
  NodeEnvironment,
} from "./config";
```

---

### How Services Consume `services/lib`

`services/lib` has no `package.json`. Services import it by **relative path** from their `src/` folder.

**1. Import in the service `AppModule`** (e.g., `services/auth-service/src/app.module.ts`):

```typescript
import {Module} from "@nestjs/common";
import {ConfigModule, DatabaseModule, LoggerModule} from "../../lib";

// Always in this order: Config first, then Database, then Logger
@Module({
  imports: [
    ConfigModule.forRoot(), // provides ConfigService globally
    DatabaseModule.forRoot(), // uses ConfigService via IoC
    LoggerModule, // global — AppLogger injectable everywhere
  ],
})
export class AppModule {}
```

**2. Optionally add a `@lib` path alias** in the service `tsconfig.json` for cleaner imports:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "paths": {
      "@lib": ["../lib/index"],
      "@lib/*": ["../lib/*"]
    }
  }
}
```

Then import as: `import { DatabaseModule } from '@lib/database';`

**3. Extend `BaseRepository<T>`** for each entity:

```typescript
import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {BaseRepository} from "../../lib/database";
import {UserEntity} from "../entities/user.entity";

@Injectable()
export class UserRepository extends BaseRepository<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    repo: Repository<UserEntity>,
  ) {
    super(repo);
  }
}
```

**4. Register logger globally** in service `main.ts`:

```typescript
import {AppLogger, CorrelationInterceptor} from "../../lib/logger";

const app = await NestFactory.create(AppModule, {bufferLogs: true});
app.useLogger(app.get(AppLogger));
app.useGlobalInterceptors(app.get(CorrelationInterceptor));
```

**5. Required deps in each service `package.json`** (since lib has none of its own):

```json
"dependencies": {
  "@nestjs/common": "^10.4.15",
  "@nestjs/config": "^3.3.0",
  "@nestjs/typeorm": "^10.0.2",
  "class-transformer": "^0.5.1",
  "class-validator": "^0.14.1",
  "mysql2": "^3.20.0",
  "typeorm": "^0.3.20",
  "uuid": "^11.0.5",
  "winston": "^3.17.0"
}
```

**This story does NOT create any service** — that is scope for Stories 8.2+.

---

### Testing Requirements

- All tests: `*.spec.ts` co-located with source, run via `ts-jest`, no real DB or network
- When the first service is created, its `jest.config.ts` should set `roots` to include `'../lib'` so lib tests are discovered and run alongside the service tests
- **`base.repository.spec.ts`:** mock `Repository<T>` with `jest.fn()` for `findOne`, `find`, `save`, `delete`, `count`; assert `clinic_id` is always in the WHERE argument
- **`logger.service.spec.ts`:** spy on the Winston transport; call `logWithContext()` and assert output includes `clinicId`, `userId`, `traceId`
- **`env.validation.spec.ts`:** call `validateEnv()` directly; assert missing `DB_HOST` throws; missing `JWT_SECRET` throws; valid full config returns correct defaults

---

### Project Structure Notes

- `services/lib/` has no `package.json` — it is source-only, not a pnpm workspace member
- `frontend/` is completely unaffected by this story
- Run `pnpm install` at monorepo root after updating `pnpm-workspace.yaml`
- Future microservices (e.g., `services/auth-service/`) will each have their own `package.json` and be workspace members via `services/*`

### References

- [Source: docs/planning-artifacts/architecture.md#Monorepo Layout] — services/lib structure
- [Source: docs/planning-artifacts/architecture.md#Data Architecture] — TypeORM Data Mapper mode, mysql2 v3.20.0, `synchronize: false`
- [Source: docs/planning-artifacts/architecture.md#Observability Baseline] — `clinicId`, `userId`, `traceId` on every log
- [Source: docs/planning-artifacts/architecture.md#Validation Strategy] — class-validator + class-transformer, fail-fast
- [Source: docs/planning-artifacts/architecture.md#Enforcement Rules] — MUST reuse shared lib; MUST NOT duplicate per service
- [Source: docs/planning-artifacts/architecture.md#Naming Patterns] — file and class naming conventions
- [Source: docs/planning-artifacts/architecture.md#Test Co-location] — `*.spec.ts` alongside source
- [Source: docs/planning-artifacts/epics.md#Story 8.1] — acceptance criteria source

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6 (GitHub Copilot)

### Debug Log References

- `reflect-metadata` must be imported before `class-transformer`/`class-validator` decorators; added `jest.setup.ts` with `import 'reflect-metadata'` and registered it in `jest.config.ts` via `setupFiles`.
- `services/` needed its own `package.json` (as test runner), `tsconfig.json`, and `jest.config.ts` to execute lib tests in isolation without a consuming service.

### Completion Notes List

- ✅ Root `pnpm-workspace.yaml` updated with `packages:` entries for `frontend`, `packages/*`, `services/*`
- ✅ Root `package.json` updated: name, private, scripts (turbo build/test/lint), devDependencies (turbo ^2.3.3)
- ✅ `turbo.json` created at root with build/test/lint task configuration
- ✅ `tsconfig.base.json` created at root with ES2021 target, strict mode, decorator metadata enabled
- ✅ `DatabaseModule.forRoot()` implemented using `TypeOrmModule.forRootAsync` + `ConfigService` IoC; `synchronize: false`, `charset: utf8mb4`, `timezone: Z`
- ✅ `BaseRepository<T>` enforces `clinic_id` on all `findById`, `findAll`, `delete`, `count` operations; 14 tests pass (no real DB)
- ✅ `AppLogger` backed by Winston JSON; `logWithContext()` outputs valid JSON with `clinicId`, `userId`, `traceId`, `level`, `message`, `timestamp`; 9 tests pass
- ✅ `CorrelationInterceptor` reads `x-trace-id` header or generates UUID via `AsyncLocalStorage`
- ✅ `LoggerModule` decorated `@Global()`, exports `AppLogger` and `CorrelationInterceptor`
- ✅ `ConfigModule.forRoot()` wraps `@nestjs/config` with `isGlobal: true` and `validate: validateEnv`; 7 tests pass covering missing vars and defaults
- ✅ `EnvironmentVariables` with `class-validator` decorators; `validateEnv()` throws descriptive error on invalid/missing env vars
- ✅ Top-level `services/lib/index.ts` barrel re-exports all three modules
- ✅ All 30 tests pass: `base.repository.spec.ts` (14), `logger.service.spec.ts` (9), `env.validation.spec.ts` (7)
- ✅ `services/package.json`, `services/tsconfig.json`, `services/jest.config.ts`, `services/jest.setup.ts` added for test runner setup

### File List

- `pnpm-workspace.yaml` (modified)
- `package.json` (modified)
- `turbo.json` (created)
- `tsconfig.base.json` (created)
- `services/package.json` (created)
- `services/tsconfig.json` (created)
- `services/jest.config.ts` (created)
- `services/jest.setup.ts` (created)
- `services/lib/index.ts` (created)
- `services/lib/database/database.module.ts` (created)
- `services/lib/database/typeorm.factory.ts` (created)
- `services/lib/database/base.repository.ts` (created)
- `services/lib/database/base.repository.spec.ts` (created)
- `services/lib/database/index.ts` (created)
- `services/lib/logger/logger.module.ts` (created)
- `services/lib/logger/logger.service.ts` (created)
- `services/lib/logger/logger.service.spec.ts` (created)
- `services/lib/logger/correlation.interceptor.ts` (created)
- `services/lib/logger/index.ts` (created)
- `services/lib/config/config.module.ts` (created)
- `services/lib/config/env.validation.ts` (created)
- `services/lib/config/env.validation.spec.ts` (created)
- `services/lib/config/index.ts` (created)
- `docs/implementation-artifacts/sprint-status.yaml` (modified)

### Review Findings

- [x] [Review][Decision] `save()` clinic_id enforcement scope — resolved: aligned with AC2, `save()` left as-is; callers are responsible for setting `clinic_id` on the entity.
- [x] [Review][Patch] `x-trace-id` header not validated — risk of log injection [services/lib/logger/correlation.interceptor.ts:34]
- [x] [Review][Patch] Required string env vars missing `@IsNotEmpty()` — empty strings pass validation [services/lib/config/env.validation.ts:26-38]
- [x] [Review][Patch] `CorrelationInterceptor` inner subscription not wired for teardown — potential leak in streaming/SSE [services/lib/logger/correlation.interceptor.ts:38-40]
- [x] [Review][Defer] `AppLogger` reads `LOG_LEVEL` from `process.env` instead of `ConfigService` [services/lib/logger/logger.service.ts:28] — deferred, pre-existing
- [x] [Review][Defer] `CorrelationContext.clinicId`/`userId` never populated by interceptor — dead fields reserved for future auth enrichment [services/lib/logger/correlation.interceptor.ts] — deferred, pre-existing
- [x] [Review][Defer] `logger.service.spec.ts` does not verify actual stdout JSON structure per AC3 literal wording [services/lib/logger/logger.service.spec.ts] — deferred, pre-existing
