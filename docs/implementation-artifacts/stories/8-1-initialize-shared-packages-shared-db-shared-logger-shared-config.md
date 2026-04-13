# Story 8.1: Initialize Shared Packages (shared-db, shared-logger, shared-config)

Status: ready-for-dev

## Story

As a developer,
I want shared packages for database utilities, logging, and configuration,
so that all microservices have consistent, reusable foundations that enforce architectural standards and cannot diverge.

## Acceptance Criteria

1. **Given** the monorepo root, **When** `pnpm install` is run, **Then** the `packages/*` glob is recognized as a pnpm workspace and all three shared packages (`@dentiflow/shared-db`, `@dentiflow/shared-logger`, `@dentiflow/shared-config`) appear in `pnpm list -r`.

2. **Given** `packages/shared-db` is imported by a NestJS service, **When** the service bootstraps, **Then** `DatabaseModule.forRoot()` registers a TypeORM MySQL DataSource using values from `ConfigService`, connects in Data Mapper mode (`synchronize: false`), and `BaseRepository<T>` enforces `clinic_id` on every `findOne`, `findAll`, and `delete` call.

3. **Given** `packages/shared-logger`, **When** `AppLogger.logWithContext()` is called with `{ clinicId, userId, traceId }`, **Then** the log entry written to `stdout` is valid JSON containing `message`, `level`, `timestamp`, `context`, `clinicId`, `userId`, and `traceId` fields.

4. **Given** `packages/shared-config`, **When** `AppConfigModule.forRoot()` is used and a required env var (e.g., `DB_HOST`) is absent or invalid, **Then** the NestJS application throws a descriptive validation error at startup and the process exits with a non-zero code.

5. **Given** each shared package, **When** `pnpm --filter @dentiflow/<package> test` is run, **Then** all unit tests pass.

6. **Given** a downstream NestJS service that adds `@dentiflow/shared-db: "workspace:*"` to its `package.json`, **When** TypeScript compiles the service, **Then** it resolves types from `packages/shared-db/dist/index.d.ts` without errors.

## Tasks / Subtasks

- [ ] Task 1: Bootstrap monorepo workspace for packages (AC: 1, 6)
  - [ ] Update root `pnpm-workspace.yaml`: add `packages:` section with entries `'frontend'`, `'packages/*'`, `'services/*'`
  - [ ] Update root `package.json`: add `"name": "dentiflow-monorepo"`, `"private": true`, and `"scripts": { "build": "turbo run build", "test": "turbo run test", "lint": "turbo run lint" }`
  - [ ] Create `turbo.json` at root with pipeline for `build`, `test`, `lint` (see Dev Notes for exact content)
  - [ ] Create `tsconfig.base.json` at root with shared TypeScript compiler options (strict, ES2021 target, etc.)

- [ ] Task 2: Create `packages/shared-db` package (AC: 2, 5, 6)
  - [ ] Create `packages/shared-db/package.json` with `name: "@dentiflow/shared-db"` (see Dev Notes for full content)
  - [ ] Create `packages/shared-db/tsconfig.json` extending `../../tsconfig.base.json`
  - [ ] Create `packages/shared-db/jest.config.ts` using `ts-jest` preset
  - [ ] Create `packages/shared-db/src/database.module.ts` — `DatabaseModule` with static `forRoot()` using `TypeOrmModule.forRootAsync`
  - [ ] Create `packages/shared-db/src/typeorm.factory.ts` — `typeormOptionsFactory(configService)` building MySQL DataSource options
  - [ ] Create `packages/shared-db/src/base-repository.ts` — abstract `BaseRepository<T>` with `clinic_id`-scoped CRUD methods (see Dev Notes for required method signatures)
  - [ ] Create `packages/shared-db/src/index.ts` — barrel exports of `DatabaseModule`, `BaseRepository`, `typeormOptionsFactory`
  - [ ] Create `packages/shared-db/src/base-repository.spec.ts` — unit tests covering all methods, verifying `clinic_id` is always sent in WHERE clause
  - [ ] Create `packages/shared-db/src/database.module.spec.ts` — unit tests verifying module setup and factory output

- [ ] Task 3: Create `packages/shared-logger` package (AC: 3, 5, 6)
  - [ ] Create `packages/shared-logger/package.json` with `name: "@dentiflow/shared-logger"`
  - [ ] Create `packages/shared-logger/tsconfig.json` extending `../../tsconfig.base.json`
  - [ ] Create `packages/shared-logger/jest.config.ts` using `ts-jest` preset
  - [ ] Create `packages/shared-logger/src/logger.module.ts` — `LoggerModule` (global, provides `AppLogger`)
  - [ ] Create `packages/shared-logger/src/logger.service.ts` — `AppLogger` implementing NestJS `LoggerService`, backed by Winston with JSON formatter (see Dev Notes)
  - [ ] Create `packages/shared-logger/src/correlation-id.interceptor.ts` — NestJS `NestInterceptor` that generates `traceId` (UUID v4) per request using `AsyncLocalStorage` and exposes it to `AppLogger`
  - [ ] Create `packages/shared-logger/src/index.ts` — barrel exports of `LoggerModule`, `AppLogger`, `CorrelationIdInterceptor`
  - [ ] Create `packages/shared-logger/src/logger.service.spec.ts` — unit tests verifying JSON output shape and required fields

- [ ] Task 4: Create `packages/shared-config` package (AC: 4, 5, 6)
  - [ ] Create `packages/shared-config/package.json` with `name: "@dentiflow/shared-config"`
  - [ ] Create `packages/shared-config/tsconfig.json` extending `../../tsconfig.base.json`
  - [ ] Create `packages/shared-config/jest.config.ts` using `ts-jest` preset
  - [ ] Create `packages/shared-config/src/env.validation.ts` — `EnvironmentVariables` class with `class-validator` decorators covering all required service env vars (see Dev Notes)
  - [ ] Create `packages/shared-config/src/config.module.ts` — `AppConfigModule` wrapping `@nestjs/config`'s `ConfigModule.forRoot()` with `isGlobal: true` and `validate: validateEnv`
  - [ ] Create `packages/shared-config/src/index.ts` — barrel exports of `AppConfigModule`, `EnvironmentVariables`, `validateEnv`
  - [ ] Create `packages/shared-config/src/env.validation.spec.ts` — unit tests verifying validation errors for missing required vars and defaults for optional vars

- [ ] Task 5: Build and verify all packages (AC: 5, 6)
  - [ ] Run `pnpm --filter @dentiflow/shared-db build` — verify `dist/index.js` and `dist/index.d.ts` are generated
  - [ ] Run `pnpm --filter @dentiflow/shared-logger build` — same check
  - [ ] Run `pnpm --filter @dentiflow/shared-config build` — same check
  - [ ] Run `pnpm --filter "@dentiflow/*" test` — all tests pass

## Dev Notes

### Architecture Guardrails — READ BEFORE CODING

1. **TypeORM Data Mapper mode ONLY — no Active Record.** Do NOT use `Entity.save()` or `Entity.find()` as static methods. TypeORM repositories are always injected, never used as active-record singletons. [Source: docs/planning-artifacts/architecture.md#Data Architecture]

2. **`clinic_id` on EVERY database operation — no exceptions.** `BaseRepository<T>` MUST include `clinic_id` in `WHERE` clauses for all reads and deletes. This is a hard monorepo rule. [Source: docs/planning-artifacts/architecture.md#Enforcement Rules]

3. **`synchronize: false` always.** Schema changes are handled by TypeORM migrations per service. Never use `synchronize: true`, even for tests against in-memory DBs. [Source: docs/planning-artifacts/architecture.md#Data Architecture]

4. **Shared packages are `packages/` — not `services/shared/`.** The architecture explicitly calls out `packages/shared-db`, `packages/shared-logger`, `packages/shared-config`. Do NOT place these under `services/shared/`. [Source: docs/planning-artifacts/architecture.md#Monorepo Layout]

5. **Structured JSON logs MUST include `clinic_id`, `user_id`, `trace_id`.** Every log entry produced by `AppLogger` must support these fields. The observability baseline requires them on every entry. [Source: docs/planning-artifacts/architecture.md#Observability Baseline]

6. **Env validation on startup — fail fast.** The `AppConfigModule` must throw at startup if required env vars are missing or invalid. Silent undefined configs are forbidden. Use `class-validator` + `class-transformer`, NOT Joi. [Source: docs/planning-artifacts/architecture.md#Validation Strategy]

7. **`MUST NOT` duplicate DB/logger/config inside each service.** Services will import `@dentiflow/shared-db` etc. as workspace deps. Never recreate these modules per-service. [Source: docs/planning-artifacts/architecture.md#Enforcement Rules]

8. **Test co-location rule.** All unit tests live as `*.spec.ts` co-located with the source file they test (same directory). No `__tests__/` folders. [Source: docs/planning-artifacts/architecture.md#Test Co-location]

9. **TypeScript naming conventions:**
   - Files: `kebab-case.ts` (e.g., `base-repository.ts`, `logger.service.ts`)
   - Classes: `PascalCase` (e.g., `BaseRepository`, `AppLogger`, `AppConfigModule`)
   - Constants: `UPPER_SNAKE_CASE`
   [Source: docs/planning-artifacts/architecture.md#Naming Patterns]

---

### Required File Structure

```
dentiflow-monorepo/        ← root (modify existing files)
├── pnpm-workspace.yaml    ← UPDATE: add packages: section
├── package.json           ← UPDATE: add name, private, scripts
├── turbo.json             ← CREATE
├── tsconfig.base.json     ← CREATE
└── packages/
    ├── shared-db/
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── jest.config.ts
    │   └── src/
    │       ├── index.ts
    │       ├── database.module.ts
    │       ├── database.module.spec.ts
    │       ├── typeorm.factory.ts
    │       ├── base-repository.ts
    │       └── base-repository.spec.ts
    ├── shared-logger/
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── jest.config.ts
    │   └── src/
    │       ├── index.ts
    │       ├── logger.module.ts
    │       ├── logger.service.ts
    │       ├── logger.service.spec.ts
    │       └── correlation-id.interceptor.ts
    └── shared-config/
        ├── package.json
        ├── tsconfig.json
        ├── jest.config.ts
        └── src/
            ├── index.ts
            ├── config.module.ts
            ├── env.validation.ts
            └── env.validation.spec.ts
```

---

### Monorepo Root Files

**Root `pnpm-workspace.yaml` (updated):**

```yaml
packages:
  - 'frontend'
  - 'packages/*'
  - 'services/*'

allowBuilds:
  '@parcel/watcher': false
  '@swc/core': false
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
    "turbo": "^2.x"
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

### Package: `@dentiflow/shared-db`

**`packages/shared-db/package.json`:**

```json
{
  "name": "@dentiflow/shared-db",
  "version": "1.0.0",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "lint": "eslint src --ext .ts"
  },
  "dependencies": {
    "@nestjs/common": "^10.4.15",
    "@nestjs/typeorm": "^10.0.2",
    "@nestjs/config": "^3.3.0",
    "typeorm": "^0.3.20",
    "mysql2": "^3.20.0"
  },
  "devDependencies": {
    "@types/jest": "^30.0.0",
    "jest": "^30.0.0",
    "ts-jest": "^29.4.0",
    "typescript": "^5.8.0"
  }
}
```

**`packages/shared-db/tsconfig.json`:**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["dist", "node_modules", "**/*.spec.ts"]
}
```

**`packages/shared-db/jest.config.ts`:**

```typescript
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  collectCoverageFrom: ['**/*.ts', '!**/index.ts'],
};

export default config;
```

**`packages/shared-db/src/typeorm.factory.ts`:**

```typescript
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export function typeormOptionsFactory(
  configService: ConfigService,
): TypeOrmModuleOptions {
  return {
    type: 'mysql',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 3306),
    username: configService.getOrThrow<string>('DB_USERNAME'),
    password: configService.getOrThrow<string>('DB_PASSWORD'),
    database: configService.getOrThrow<string>('DB_NAME'),
    entities: [],          // Services register their own entities via TypeOrmModule.forFeature()
    synchronize: false,    // NEVER true — use migrations
    migrationsRun: false,  // Migrations run explicitly via scripts/db/migrate-all.sh
    logging: configService.get<string>('NODE_ENV') !== 'production',
    charset: 'utf8mb4',    // Required for multilingual content (Arabic)
    timezone: 'Z',         // Store all timestamps as UTC
  };
}
```

**`packages/shared-db/src/database.module.ts`:**

```typescript
import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { typeormOptionsFactory } from './typeorm.factory';

@Module({})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        TypeOrmModule.forRootAsync({
          useFactory: (configService: ConfigService) =>
            typeormOptionsFactory(configService),
          inject: [ConfigService],
        }),
      ],
    };
  }
}
```

**`packages/shared-db/src/base-repository.ts`:**

```typescript
import {
  DeepPartial,
  FindManyOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';

/**
 * Abstract base repository that enforces clinic_id scoping on all operations.
 * ALL microservices MUST extend this for their TypeORM repositories.
 *
 * T must have `id: string` (UUID v4) and `clinic_id: string`.
 */
export abstract class BaseRepository<
  T extends { id: string; clinic_id: string },
> {
  constructor(protected readonly repo: Repository<T>) {}

  async findById(id: string, clinicId: string): Promise<T | null> {
    return this.repo.findOne({
      where: { id, clinic_id: clinicId } as FindOptionsWhere<T>,
    });
  }

  async findAll(
    clinicId: string,
    options?: Omit<FindManyOptions<T>, 'where'>,
  ): Promise<T[]> {
    return this.repo.find({
      ...options,
      where: { clinic_id: clinicId } as FindOptionsWhere<T>,
    });
  }

  async save(entity: DeepPartial<T>): Promise<T> {
    return this.repo.save(entity);
  }

  async delete(id: string, clinicId: string): Promise<void> {
    await this.repo.delete({ id, clinic_id: clinicId } as FindOptionsWhere<T>);
  }

  async count(clinicId: string): Promise<number> {
    return this.repo.count({
      where: { clinic_id: clinicId } as FindOptionsWhere<T>,
    });
  }
}
```

**`packages/shared-db/src/index.ts`:**

```typescript
export { DatabaseModule } from './database.module';
export { BaseRepository } from './base-repository';
export { typeormOptionsFactory } from './typeorm.factory';
```

---

### Package: `@dentiflow/shared-logger`

**`packages/shared-logger/package.json`:**

```json
{
  "name": "@dentiflow/shared-logger",
  "version": "1.0.0",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "lint": "eslint src --ext .ts"
  },
  "dependencies": {
    "@nestjs/common": "^10.4.15",
    "winston": "^3.17.0",
    "uuid": "^11.0.5"
  },
  "devDependencies": {
    "@types/jest": "^30.0.0",
    "@types/uuid": "^10.0.0",
    "jest": "^30.0.0",
    "ts-jest": "^29.4.0",
    "typescript": "^5.8.0"
  }
}
```

**`packages/shared-logger/src/logger.service.ts`:**

```typescript
import { Injectable, LoggerService, Scope } from '@nestjs/common';
import * as winston from 'winston';

export interface LogContext {
  clinicId?: string;
  userId?: string;
  traceId?: string;
  [key: string]: unknown;
}

/**
 * AppLogger — structured JSON logger backed by Winston.
 *
 * All log entries targeting production observability MUST call logWithContext()
 * with { clinicId, userId, traceId } per the architecture observability baseline.
 *
 * Implements NestJS LoggerService so it can replace the default Nest logger:
 *   app.useLogger(app.get(AppLogger));
 */
@Injectable({ scope: Scope.DEFAULT })
export class AppLogger implements LoggerService {
  private readonly logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env['LOG_LEVEL'] ?? 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      transports: [new winston.transports.Console()],
    });
  }

  log(message: string, context?: string): void {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string): void {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string): void {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string): void {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string): void {
    this.logger.verbose(message, { context });
  }

  /**
   * Enriched log with all required observability fields.
   * Use this for all business-logic and data-access log calls.
   */
  logWithContext(
    level: 'info' | 'warn' | 'error' | 'debug',
    message: string,
    ctx: LogContext,
  ): void {
    this.logger.log(level, message, ctx);
  }
}
```

**`packages/shared-logger/src/correlation-id.interceptor.ts`:**

```typescript
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { AsyncLocalStorage } from 'async_hooks';

export const correlationStore = new AsyncLocalStorage<{
  traceId: string;
  clinicId?: string;
  userId?: string;
}>();

@Injectable()
export class CorrelationIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string>;
    }>();
    const traceId =
      request.headers['x-trace-id'] ?? uuidv4();

    return new Observable((subscriber) => {
      correlationStore.run({ traceId }, () => {
        next.handle().subscribe(subscriber);
      });
    });
  }
}
```

**`packages/shared-logger/src/logger.module.ts`:**

```typescript
import { Global, Module } from '@nestjs/common';
import { AppLogger } from './logger.service';

@Global()
@Module({
  providers: [AppLogger],
  exports: [AppLogger],
})
export class LoggerModule {}
```

**`packages/shared-logger/src/index.ts`:**

```typescript
export { LoggerModule } from './logger.module';
export { AppLogger } from './logger.service';
export type { LogContext } from './logger.service';
export {
  CorrelationIdInterceptor,
  correlationStore,
} from './correlation-id.interceptor';
```

---

### Package: `@dentiflow/shared-config`

**`packages/shared-config/package.json`:**

```json
{
  "name": "@dentiflow/shared-config",
  "version": "1.0.0",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "lint": "eslint src --ext .ts"
  },
  "dependencies": {
    "@nestjs/common": "^10.4.15",
    "@nestjs/config": "^3.3.0",
    "class-validator": "^0.14.1",
    "class-transformer": "^0.5.1"
  },
  "devDependencies": {
    "@types/jest": "^30.0.0",
    "jest": "^30.0.0",
    "ts-jest": "^29.4.0",
    "typescript": "^5.8.0"
  }
}
```

**`packages/shared-config/src/env.validation.ts`:**

```typescript
import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

enum NodeEnvironment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

/**
 * Contract for all required environment variables across backend services.
 * Services may extend this class to add service-specific vars.
 *
 * Usage: pass `validate: validateEnv` to ConfigModule.forRoot().
 */
export class EnvironmentVariables {
  @IsEnum(NodeEnvironment)
  @IsOptional()
  NODE_ENV: NodeEnvironment = NodeEnvironment.Development;

  // --- Database ---
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

  // --- Auth ---
  @IsString()
  JWT_SECRET!: string;

  @IsNumber()
  @IsOptional()
  JWT_EXPIRES_IN: number = 900; // seconds (15 minutes — matches frontend TTL)

  // --- Observability ---
  @IsString()
  @IsOptional()
  LOG_LEVEL: string = 'info';

  // --- Service ports (optional — services override individually) ---
  @IsNumber()
  @IsOptional()
  PORT: number = 3000;
}

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });
  if (errors.length > 0) {
    throw new Error(
      `Environment validation failed:\n${errors
        .map((e) => Object.values(e.constraints ?? {}).join(', '))
        .join('\n')}`,
    );
  }
  return validatedConfig;
}
```

**`packages/shared-config/src/config.module.ts`:**

```typescript
import { DynamicModule, Module } from '@nestjs/common';
import {
  ConfigModule as NestConfigModule,
  ConfigModuleOptions,
} from '@nestjs/config';
import { validateEnv } from './env.validation';

@Module({})
export class AppConfigModule {
  /**
   * Call this once in the root AppModule of each service.
   * isGlobal: true means ConfigService is available everywhere without re-importing.
   */
  static forRoot(options: Partial<ConfigModuleOptions> = {}): DynamicModule {
    return {
      module: AppConfigModule,
      imports: [
        NestConfigModule.forRoot({
          isGlobal: true,
          validate: validateEnv,
          envFilePath: ['.env.local', '.env'],
          ...options,
        }),
      ],
      exports: [NestConfigModule],
    };
  }
}
```

**`packages/shared-config/src/index.ts`:**

```typescript
export { AppConfigModule } from './config.module';
export { EnvironmentVariables, validateEnv } from './env.validation';
```

---

### How Downstream Services Consume These Packages

Each service (e.g., `services/auth-service/`) will:

1. Add to its `package.json`:
   ```json
   "dependencies": {
     "@dentiflow/shared-db": "workspace:*",
     "@dentiflow/shared-logger": "workspace:*",
     "@dentiflow/shared-config": "workspace:*"
   }
   ```

2. In its root `AppModule`:
   ```typescript
   @Module({
     imports: [
       AppConfigModule.forRoot(),   // from @dentiflow/shared-config
       DatabaseModule.forRoot(),    // from @dentiflow/shared-db
       LoggerModule,                // from @dentiflow/shared-logger
     ],
   })
   export class AppModule {}
   ```

3. Extend `BaseRepository<T>` for each domain entity, injecting the TypeORM `Repository<TEntity>`:
   ```typescript
   @Injectable()
   export class UserRepository extends BaseRepository<UserEntity> {
     constructor(
       @InjectRepository(UserEntity)
       private readonly userRepo: Repository<UserEntity>,
     ) {
       super(userRepo);
     }
   }
   ```

**This story does NOT create the services themselves** — that is scope for Stories 8.2 and 8.3.

---

### Testing Requirements

- Co-locate all unit tests as `*.spec.ts` in the same directory as source files
- Use `ts-jest` preset; no Babel transform
- Mock TypeORM `Repository` in `base-repository.spec.ts` using `jest.fn()` (no real DB connection)
- Mock Winston transports in `logger.service.spec.ts` by replacing `transports` array with a mock transport
- Test `validateEnv()` by calling it directly with partial env objects — do NOT mock the function

**Key test cases to cover:**

- `base-repository.spec.ts`: `findById` always sends `clinic_id` in WHERE; `findAll` always sends `clinic_id`; `delete` always sends `clinic_id`
- `logger.service.spec.ts`: `logWithContext()` output includes `clinicId`, `userId`, `traceId`; JSON format is valid
- `env.validation.spec.ts`: missing `DB_HOST` throws error with message; missing `JWT_SECRET` throws error; valid config with defaults resolves correctly

---

### Project Structure Notes

- **This story initializes the `packages/` workspace** — `services/` is NOT created here (Epic 8 Stories 8.2–8.5 create individual services)
- `frontend/` already exists and is unaffected by this story
- The root `pnpm-workspace.yaml` must declare all workspace roots before running `pnpm install`
- Run `pnpm install` at the monorepo root after updating `pnpm-workspace.yaml` to link the new packages

### References

- [Source: docs/planning-artifacts/architecture.md#Monorepo Layout] — `packages/` structure
- [Source: docs/planning-artifacts/architecture.md#Data Architecture] — TypeORM Data Mapper mode, mysql2 v3.20.0
- [Source: docs/planning-artifacts/architecture.md#Observability Baseline] — `clinic_id`, `user_id`, `trace_id` on every log
- [Source: docs/planning-artifacts/architecture.md#Validation Strategy] — class-validator at NestJS ingress
- [Source: docs/planning-artifacts/architecture.md#Enforcement Rules] — MUST reuse shared packages; MUST NOT duplicate
- [Source: docs/planning-artifacts/architecture.md#Naming Patterns] — file naming and class naming conventions
- [Source: docs/planning-artifacts/architecture.md#Test Co-location] — `*.spec.ts` co-located with source
- [Source: docs/planning-artifacts/epics.md#Story 8.1] — acceptance criteria source

## Dev Agent Record

### Agent Model Used

_to be filled by dev agent_

### Debug Log References

### Completion Notes List

### File List
