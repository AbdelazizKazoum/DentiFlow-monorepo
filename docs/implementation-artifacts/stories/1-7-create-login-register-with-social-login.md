# Story 1.7: Wire Real Admin Authentication via gRPC (Users Table)

Status: ready-for-dev

> **Scope note:** This story focuses exclusively on **admin authentication** against the real `users` table via gRPC. Patient auth (social login, patient register page) is out of scope and will be handled in a separate story.

## Story

As an admin user,
I want to log in with my email and password stored in the real `users` table,
so that the authentication is backed by a real database (not mock data) and issues both access and refresh tokens stored securely as HTTP-only cookies.

## Acceptance Criteria

1. **Given** I log in at `/{locale}/admin/login` with a valid email/password stored in the `users` table **When** I submit **Then** authentication succeeds, a NextAuth session is created with the real `user_id`, `role`, and `clinic_id` from the database, and I am redirected to the admin dashboard.
2. **Given** I log in with an email that does not exist in the `users` table **When** I submit **Then** authentication fails and the existing "Invalid credentials" error banner is shown — no user enumeration leak.
3. **Given** I log in with a correct email but wrong password **When** I submit **Then** authentication fails and the same error banner is shown (constant-time response, same as unknown email).
4. **Given** auth-service is unavailable **When** I try to log in **Then** a generic "Service unavailable. Try again later." error is shown — no internal error details leak to the client.
5. **Given** the existing admin mock credentials (`admin@dentiflow.com` / `admin123`) **When** I submit **Then** login fails (mock data is removed — only DB users succeed).
6. **Given** any admin page already live (login UI, middleware, dashboard shell) **When** this story is deployed **Then** they are unchanged — only `AdminAuthRepositoryImpl` and the new backend plumbing are touched.

## Tasks / Subtasks

### BACKEND — Shared Proto (services/lib)

- [ ] **Task 1: Install gRPC packages in services/** (AC: 1)
  - [ ] In `services/`, run: `pnpm add @nestjs/microservices @grpc/grpc-js @grpc/proto-loader`
  - [ ] This installs packages for both `auth-service` and `api-gateway` (monorepo shared node_modules)

- [ ] **Task 2: Create shared proto file and TS path helper in services/lib/proto/** (AC: 1)
  - [ ] Create `services/lib/proto/auth.proto`:

    ```proto
    syntax = "proto3";
    package auth;

    service AuthService {
      rpc Login (LoginRequest) returns (AuthReply);
      rpc Register (RegisterRequest) returns (AuthReply);
      rpc RefreshToken (RefreshTokenRequest) returns (RefreshTokenReply);
    }

    message LoginRequest {
      string email = 1;
      string password = 2;
      string clinic_id = 3;
    }

    message RegisterRequest {
      string email = 1;
      string password = 2;
      string full_name = 3;
      string role = 4;
      string clinic_id = 5;
    }

    message UserProfile {
      string id = 1;
      string email = 2;
      string full_name = 3;
      string role = 4;
      string clinic_id = 5;
    }

    message AuthReply {
      string access_token = 1;
      string refresh_token = 2;
      UserProfile user = 3;
    }

    message RefreshTokenRequest {
      string refresh_token = 1;
    }

    message RefreshTokenReply {
      string access_token = 1;
      string refresh_token = 2;
    }
    ```

  - [ ] Create `services/lib/proto/index.ts` — exports the runtime path constant:
    ```ts
    import {join} from "path";
    // __dirname at runtime = <service>/dist/lib/proto/ (since rootDir: ".." in both service tsconfigs)
    export const AUTH_PROTO_PATH = join(__dirname, "auth.proto");
    ```
    Both services import via the `@lib/*` path alias: `import { AUTH_PROTO_PATH } from '@lib/proto'`
  - [ ] Add proto asset copy to `services/nest-cli.json` for both projects so `auth.proto` is present in `dist/`:
    ```json
    "api-gateway":  { ..., "assets": [{ "include": "../lib/proto/*.proto", "outDir": "./dist/lib/proto", "watchAssets": true }] },
    "auth-service": { ..., "assets": [{ "include": "../lib/proto/*.proto", "outDir": "./dist/lib/proto", "watchAssets": true }] }
    ```
  - [ ] `services/lib/index.ts` is NOT modified (proto helper is imported via `@lib/proto` directly)

### BACKEND — auth-service gRPC Layer

- [ ] **Task 3: Make `clinicId` optional in auth-service DTOs** (AC: 1)
  - [ ] Update `services/auth-service/src/presentation/dto/login-user.dto.ts`:
    - Change `@IsUUID()` on `clinicId` → `@IsOptional() @IsString()` with `@Transform(() => "")` default
  - [ ] Update `services/auth-service/src/presentation/dto/register-user.dto.ts`:
    - Same change — `@IsOptional() @IsString()` for `clinicId`

- [ ] **Task 4: Add `findByEmail` to user repository** (AC: 1, 2, 3)
  - [ ] Add `findByEmail(email: string): Promise<User | null>` to `services/auth-service/src/domain/repositories/user-repository.interface.ts`
  - [ ] Implement in `services/auth-service/src/infrastructure/persistence/repositories/user.repository.ts`:
    - Query `WHERE email = :email` (no clinic scope — used when `clinicId` is empty)

- [ ] **Task 5: Update login/register use cases to handle empty clinicId** (AC: 1, 2, 3)
  - [ ] In `services/auth-service/src/application/use-cases/login-user.use-case.ts`:
    - If `clinicId` is empty string, call `userRepository.findByEmail(email)` instead of `findByEmailAndClinic`
    - Existing constant-time dummy bcrypt compare for unknown email stays unchanged
  - [ ] In `services/auth-service/src/application/use-cases/register-user.use-case.ts`:
    - Allow `clinicId: ""` — no change needed to conflict check (email + clinic_id uniqueness still holds)
  - [ ] `AuthResponse` interface: add `refreshToken: string` alongside existing `accessToken`

- [ ] **Task 6: Extend `IJwtService` with refresh token support** (AC: 1)
  - [ ] Update `services/auth-service/src/application/ports/jwt-service.interface.ts`:
    ```ts
    export interface IJwtService {
      sign(payload: {
        user_id: string;
        clinic_id: string;
        role: string;
      }): Promise<string>;
      signRefresh(payload: {user_id: string}): Promise<string>;
      verifyRefresh(token: string): Promise<{user_id: string}>;
    }
    ```
  - [ ] Update `services/auth-service/src/infrastructure/adapters/jwt.adapter.ts` to implement `signRefresh` and `verifyRefresh` using a separate `JwtService` instance configured with `REFRESH_TOKEN_SECRET` and `REFRESH_TOKEN_EXPIRES_IN`
  - [ ] Add to `services/auth-service/.env`:
    ```
    GRPC_PORT=5001
    REFRESH_TOKEN_SECRET=change-me-refresh-secret
    REFRESH_TOKEN_EXPIRES_IN=604800
    ```
  - [ ] Update `services/auth-service/src/auth/auth.module.ts` to register a second `JwtModule` (or pass options) for the refresh JWT; inject it separately in `JwtAdapter`

- [ ] **Task 7a: Add `RefreshTokenUseCase` to auth-service** (AC: 1)
  - [ ] Create `services/auth-service/src/application/use-cases/refresh-token.use-case.ts`:
    - `execute(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }>`
    - Verify `refreshToken` via `jwtService.verifyRefresh()` → throws `RpcException(UNAUTHENTICATED)` if invalid/expired
    - Look up user by `user_id` from verified payload (use `userRepository.findById()`)
    - Issue new `accessToken` via `jwtService.sign()` and new `refreshToken` via `jwtService.signRefresh()` (token rotation)
  - [ ] Register `RefreshTokenUseCase` in `auth.module.ts` providers

- [ ] **Task 7b: Add gRPC transport to auth-service** (AC: 1)
  - [ ] Update `services/auth-service/src/main.ts`:
    - Keep existing HTTP app (`NestFactory.create(AppModule)`)
    - Add:
      ```ts
      import {AUTH_PROTO_PATH} from "@lib/proto";
      // ...
      app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.GRPC,
        options: {
          package: "auth",
          protoPath: AUTH_PROTO_PATH,
          url: `0.0.0.0:${configService.get("GRPC_PORT", 5001)}`,
        },
      });
      await app.startAllMicroservices();
      await app.listen(configService.get("PORT", 3002));
      ```
    - Import: `Transport`, `MicroserviceOptions` from `@nestjs/microservices`

- [ ] **Task 7c: Create gRPC controller in auth-service** (AC: 1, 2, 3, 4)
  - [ ] Create `services/auth-service/src/presentation/grpc/auth.grpc-controller.ts`:

    ```ts
    @Controller()
    export class AuthGrpcController {
      constructor(
        @Inject(LOGIN_USER_USE_CASE) private loginUseCase: LoginUserUseCase,
        @Inject(REGISTER_USER_USE_CASE) private registerUseCase: RegisterUserUseCase,
        @Inject(REFRESH_TOKEN_USE_CASE) private refreshUseCase: RefreshTokenUseCase,
      ) {}

      @GrpcMethod('AuthService', 'Login')
      async login(data: LoginRequest): Promise<AuthReply> { ... }
      // Map: access_token, refresh_token, user (snake_case)

      @GrpcMethod('AuthService', 'Register')
      async register(data: RegisterRequest): Promise<AuthReply> { ... }

      @GrpcMethod('AuthService', 'RefreshToken')
      async refreshToken(data: { refresh_token: string }): Promise<RefreshTokenReply> {
        return this.refreshUseCase.execute(data.refresh_token);
        // Returns { access_token, refresh_token } (snake_case)
      }
    }
    ```

    - Propagate exceptions as `RpcException` (invalid/expired refresh token → `status.UNAUTHENTICATED`)

  - [ ] Register `AuthGrpcController` in `services/auth-service/src/auth/auth.module.ts` controllers array
  - [ ] Add `REFRESH_TOKEN_USE_CASE = 'REFRESH_TOKEN_USE_CASE'` to `services/auth-service/src/shared/constants/injection-tokens.ts`

### BACKEND — api-gateway Auth Proxy

- [ ] **Task 8: Create gRPC client module in api-gateway** (AC: 1)
  - [ ] Create `services/api-gateway/src/infrastructure/grpc/auth-grpc-client.module.ts`:
    ```ts
    import {AUTH_PROTO_PATH} from "@lib/proto";
    // ...
    ClientsModule.registerAsync([
      {
        name: "AUTH_GRPC_CLIENT",
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: "auth",
            protoPath: AUTH_PROTO_PATH,
            url: config.get("AUTH_SERVICE_GRPC_URL", "localhost:5001"),
          },
        }),
      },
    ]);
    ```
  - [ ] Add `AUTH_SERVICE_GRPC_URL=localhost:5001` to `services/api-gateway/.env`
  - [ ] Update `services/api-gateway/src/shared/env.validation.ts`: add `AUTH_SERVICE_GRPC_URL: Joi.string().default('auth-service:5001')`

- [ ] **Task 9: Create public auth endpoints in api-gateway** (AC: 1, 2, 3, 4)
  - [ ] Install `cookie-parser`: `pnpm add cookie-parser @types/cookie-parser` in `services/`
  - [ ] Create `services/api-gateway/src/presentation/auth/admin-auth.controller.ts`:
    - `@Controller('auth')` — NO `@UseGuards(JwtAuthGuard)` on this controller
    - `@Post('login')`: receives `{ email, password }` → calls gRPC `login({ email, password, clinic_id: "" })` → **sets two HTTP-only cookies** and returns body:
      ```ts
      @Post('login')
      async login(
        @Body() dto: AdminLoginDto,
        @Res({ passthrough: true }) res: Response,
      ) {
        const reply = await lastValueFrom(this.authClient.login({ ...dto, clinic_id: '' }));
        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('access_token', reply.access_token, {
          httpOnly: true, secure: isProd, sameSite: 'strict',
          path: '/', maxAge: 15 * 60 * 1000, // 15 min
        });
        res.cookie('refresh_token', reply.refresh_token, {
          httpOnly: true, secure: isProd, sameSite: 'strict',
          path: '/api/v1/auth/refresh', maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        return {
          accessToken: reply.access_token,
          refreshToken: reply.refresh_token,
          user: reply.user,
        };
      }
      ```
    - `@Post('refresh')`: reads refresh token from `refresh_token` cookie (browser flow) OR `Authorization: Bearer <token>` header (NextAuth server-side flow); calls gRPC `RefreshToken`; sets new `access_token` cookie (and rotated `refresh_token` cookie):
      ```ts
      @Post('refresh')
      async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const refreshToken =
          req.cookies?.refresh_token ??
          req.headers.authorization?.replace('Bearer ', '');
        if (!refreshToken) throw new UnauthorizedException();
        const reply = await lastValueFrom(this.authClient.refreshToken({ refresh_token: refreshToken }));
        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('access_token', reply.access_token, {
          httpOnly: true, secure: isProd, sameSite: 'strict',
          path: '/', maxAge: 15 * 60 * 1000,
        });
        res.cookie('refresh_token', reply.refresh_token, {
          httpOnly: true, secure: isProd, sameSite: 'strict',
          path: '/api/v1/auth/refresh', maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return { accessToken: reply.access_token };
      }
      ```
    - `@Post('logout')`: clears both cookies:
      ```ts
      @Post('logout')
      logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie('access_token', { httpOnly: true, path: '/' });
        res.clearCookie('refresh_token', { httpOnly: true, path: '/api/v1/auth/refresh' });
        return { message: 'Logged out' };
      }
      ```
    - Error mapping: `status.UNAUTHENTICATED` → `UnauthorizedException`; `status.NOT_FOUND` → `UnauthorizedException`; 5xx → `InternalServerErrorException('Auth service unavailable')`
  - [ ] Create `services/api-gateway/src/presentation/auth/dto/admin-login.dto.ts`: `{ email: string; password: string }` with `@IsEmail()`, `@IsString() @IsNotEmpty()`
  - [ ] Create `services/api-gateway/src/presentation/auth/auth.module.ts` — declares `AdminAuthController`, imports `AuthGrpcClientModule`
  - [ ] Register `AuthModule` in `services/api-gateway/src/app.module.ts`

- [ ] **Task 10: Enable cookie-parser and ValidationPipe in api-gateway** (defensive)
  - [ ] Update `services/api-gateway/src/main.ts`:
    ```ts
    import * as cookieParser from "cookie-parser";
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({whitelist: true, transform: true}));
    ```

### FRONTEND — Replace Mock with Real Repository

- [ ] **Task 11: Replace `AdminAuthRepositoryImpl` with real HTTP implementation** (AC: 1, 2, 3, 4, 5)
  - [ ] Overwrite `frontend/src/infrastructure/repositories/AdminAuthRepositoryImpl.ts`:
    - Remove all mock data constants (`MOCK_ADMIN_PASSWORD`, `MOCK_ADMIN_USERS`)
    - `login(credentials)`: call `POST ${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login` with `{ email, password }` via server-side `fetch`
    - On `200`: map response to `AdminUser` domain entity AND attach extra properties for the jwt callback:
      - `id: body.user.id`
      - Split `body.user.full_name` on first space → `firstName`, `lastName`
      - `email: body.user.email`
      - `role: body.user.role` (cast to `UserRole`)
      - `(extra) clinic_id: body.user.clinic_id` (real value from auth-service)
      - `(extra) backendAccessToken: body.accessToken`
      - `(extra) backendRefreshToken: body.refreshToken`
    - On `401` / `403`: return `null`
    - On network error or 5xx: throw `new Error('AUTH_SERVICE_UNAVAILABLE')` (caught in `authorize()`)
  - [ ] **`AdminLogin` use case and `AdminAuthRepository` interface are NOT changed**

- [ ] **Task 12: Update `nextauth.config.ts` — real tokens + automatic refresh** (AC: 1, 4)
  - [ ] In the existing `CredentialsProvider` `authorize()`:
    - Wrap in try/catch; catch `AUTH_SERVICE_UNAVAILABLE` → return `null`
    - Return real values including both tokens:
      ```ts
      return {
        id: user.id,
        email: user.email ?? null,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
        clinic_id: (user as any).clinic_id ?? "",
        user_id: user.id,
        backendAccessToken: (user as any).backendAccessToken ?? "",
        backendRefreshToken: (user as any).backendRefreshToken ?? "",
      };
      ```
  - [ ] Replace the `jwt` callback with refresh-aware version:
    ```ts
    async jwt({ token, user }) {
      if (user) {
        // Initial sign-in: embed all claims
        token.role = (user as any).role;
        token.clinic_id = (user as any).clinic_id;
        token.user_id = (user as any).user_id;
        token.backendAccessToken = (user as any).backendAccessToken ?? '';
        token.backendRefreshToken = (user as any).backendRefreshToken ?? '';
        token.backendTokenExpiry = Date.now() + 14 * 60 * 1000; // 14 min (1 min before expiry)
        return token;
      }
      // Subsequent requests: return token if access token is still valid
      if (Date.now() < (token.backendTokenExpiry as number)) return token;
      // Access token expired — use refresh token to get new one
      return refreshBackendToken(token);
    }
    ```
  - [ ] Add `refreshBackendToken` helper (above `authOptions`, module scope):
    ```ts
    async function refreshBackendToken(token: any) {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh`,
          {
            method: "POST",
            headers: {Authorization: `Bearer ${token.backendRefreshToken}`},
          },
        );
        if (!res.ok) throw new Error("RefreshFailed");
        const data = await res.json();
        return {
          ...token,
          backendAccessToken: data.accessToken,
          backendRefreshToken: data.refreshToken ?? token.backendRefreshToken,
          backendTokenExpiry: Date.now() + 14 * 60 * 1000,
          error: undefined,
        };
      } catch {
        return {...token, error: "RefreshAccessTokenError" as const};
      }
    }
    ```
  - [ ] Update `frontend/src/infrastructure/auth/next-auth.d.ts` — add new fields to `JWT` only (NOT to `Session`):
    ```ts
    declare module "next-auth/jwt" {
      interface JWT {
        // existing: role, clinic_id, user_id
        backendAccessToken: string;
        backendRefreshToken: string;
        backendTokenExpiry: number;
        error?: "RefreshAccessTokenError";
      }
    }
    ```
  - [ ] Add `NEXT_PUBLIC_API_URL=http://localhost:3001` to `frontend/.env.local`

- [ ] **Task 13: Write unit tests** (AC: 1, 2, 3, 4)
  - [ ] Create `services/auth-service/src/presentation/grpc/__tests__/auth.grpc-controller.spec.ts`:
    - `Login` with valid credentials → returns `AuthReply` with `access_token`, `refresh_token`, and `user`
    - `Login` with wrong password → throws `RpcException` with `UNAUTHENTICATED` code
    - `RefreshToken` with valid refresh token → returns `RefreshTokenReply` with new `access_token` and rotated `refresh_token`
    - `RefreshToken` with expired/invalid token → throws `RpcException` with `UNAUTHENTICATED` code
  - [ ] Update `frontend/src/application/auth/useCases/__tests__/AdminLogin.test.ts` (if exists) to pass mock repo returning a real `AdminUser` shape (no mock password constants)

---

## Dev Notes

### Critical Architecture Constraints (DO NOT VIOLATE)

1. **Admin login UI is NOT changed.** `AdminLoginPage.tsx`, `AdminLoginForm.tsx`, `AdminLoginStore`, `nextauth.config.ts` `providers` array shape — all unchanged. Only `AdminAuthRepositoryImpl` changes (infrastructure layer only).

2. **Do NOT touch the `AdminLogin` use case or `AdminAuthRepository` interface.** The clean architecture boundary must be respected — only the infrastructure implementation is swapped.

3. **gRPC flow:**

   ```
   Browser → POST /api/v1/auth/login → api-gateway (public, no guard)
           → gRPC Login(LoginRequest) → auth-service:5001
           ← AuthReply { access_token, refresh_token, user { id, email, full_name, role, clinic_id } }
           ← JSON { accessToken, refreshToken, user } → NextAuth authorize() → JWT session
   ```

4. **Proto file and `@lib` path alias:**
   - Proto lives at `services/lib/proto/auth.proto`
   - A companion TypeScript file `services/lib/proto/index.ts` exports `AUTH_PROTO_PATH = join(__dirname, 'auth.proto')` — this uses Node's `__dirname` which at runtime (after NestJS compile) resolves to the correct `dist/lib/proto/` directory inside each service's build output
   - Both service tsconfigs have `"@lib/*": ["../lib/*"]` — so both import via: `import { AUTH_PROTO_PATH } from '@lib/proto'`
   - The `.proto` file itself is NOT TypeScript; it is copied to `dist/` via the `assets` entry in `nest-cli.json` for each project
   - `services/lib/index.ts` is **NOT** modified (proto helper is a direct `@lib/proto` import, not part of the main barrel export)

5. **HTTP-only cookies — what this means in practice:**
   - The api-gateway sets `access_token` and `refresh_token` as **HttpOnly** cookies in its login/refresh responses. These cookies are never readable by JavaScript (`document.cookie` cannot access them).
   - For **browser-direct API calls** (future patient flow, mobile): the browser automatically includes these cookies on every request to the gateway — no JavaScript token management needed
   - For **NextAuth admin login**: `authorize()` runs **server-side** inside Next.js. The gateway response cookies are NOT forwarded to the browser (server-to-server call). Instead, both tokens are embedded inside NextAuth's own `next-auth.session-token` cookie, which is **also HttpOnly and Secure by default**. This is the correct approach — backend tokens are never exposed to client-side JavaScript.
   - The `next-auth.session-token` cookie is the HTTP-only storage mechanism for the admin flow. No separate `access_token` cookie appears in the admin browser.

6. **Refresh token flow in NextAuth JWT callback:**
   - On initial sign-in: `backendAccessToken`, `backendRefreshToken`, and `backendTokenExpiry` (14 min from now) are stored in the NextAuth JWT
   - On every subsequent session access (page load / `getServerSideProps` / middleware): NextAuth calls the `jwt` callback. If `Date.now() < backendTokenExpiry`, the cached token is returned immediately
   - If the access token has expired: `refreshBackendToken()` is called server-side — it calls `POST /api/v1/auth/refresh` with `Authorization: Bearer <backendRefreshToken>`. The gateway reads the refresh token from the `Authorization` header (server-to-server flow, no cookie needed here) and calls gRPC `RefreshToken` on auth-service
   - **Token rotation**: auth-service issues a brand-new refresh token on every refresh call. The old refresh token is invalidated. Both new tokens are stored back into the NextAuth JWT.
   - If refresh fails (expired or revoked refresh token): `token.error = 'RefreshAccessTokenError'` is set. The frontend should detect this in `useSession()` and redirect to login. Check: `if (session?.error === 'RefreshAccessTokenError') signOut()`
   - Refresh token lifetime: 7 days (`REFRESH_TOKEN_EXPIRES_IN=604800` in auth-service)

7. **`backendAccessToken` and `backendRefreshToken` are in NextAuth JWT only — NOT in `Session`.** Client components never see them. Server-side code uses `getToken()` from `next-auth/jwt` to extract them.

8. **auth-service runs both HTTP (port 3002) and gRPC (port 5001) in the same NestJS process:**
   - `app.connectMicroservice()` must be called BEFORE `app.listen()`
   - `await app.startAllMicroservices()` then `await app.listen(PORT)`
   - The existing `AuthController` (HTTP) and new `AuthGrpcController` (gRPC) call the **same use cases** — no logic duplication

9. **`clinic_id: ""` is passed from api-gateway to auth-service.** The frontend admin login form has no clinic ID field. Auth-service uses `findByEmail()` when `clinicId` is empty. The real `clinic_id` comes back in `AuthReply.user.clinic_id` and is stored in the NextAuth JWT.

10. **Error response — no user enumeration.** Both "unknown email" and "wrong password" return the same `UnauthorizedException` from the gateway. Auth-service already does constant-time bcrypt compare for unknown emails.

11. **`AdminAuthRepositoryImpl` uses the global `fetch` (Node 18+).** NextAuth `authorize()` is server-side. No Axios needed — use the built-in `fetch`.

### Project Structure Notes

**Files to create (new):**

```
services/lib/proto/auth.proto
services/lib/proto/index.ts                                                 ← exports AUTH_PROTO_PATH
services/auth-service/src/application/use-cases/refresh-token.use-case.ts
services/auth-service/src/presentation/grpc/auth.grpc-controller.ts
services/auth-service/src/presentation/grpc/__tests__/auth.grpc-controller.spec.ts
services/api-gateway/src/infrastructure/grpc/auth-grpc-client.module.ts
services/api-gateway/src/presentation/auth/admin-auth.controller.ts
services/api-gateway/src/presentation/auth/dto/admin-login.dto.ts
services/api-gateway/src/presentation/auth/auth.module.ts
```

**Files to modify (existing):**

```
services/nest-cli.json                                                      ← add assets for proto copy
services/package.json                                                       ← add gRPC packages + cookie-parser
services/auth-service/src/application/ports/jwt-service.interface.ts       ← add signRefresh + verifyRefresh
services/auth-service/src/infrastructure/adapters/jwt.adapter.ts            ← implement signRefresh + verifyRefresh
services/auth-service/src/auth/auth.module.ts                               ← register AuthGrpcController + refresh use case
services/auth-service/src/shared/constants/injection-tokens.ts              ← add REFRESH_TOKEN_USE_CASE
services/auth-service/src/domain/repositories/user-repository.interface.ts  ← add findByEmail()
services/auth-service/src/infrastructure/persistence/repositories/user.repository.ts  ← implement findByEmail()
services/auth-service/src/application/use-cases/login-user.use-case.ts     ← handle clinicId = ""
services/auth-service/src/application/use-cases/register-user.use-case.ts  ← allow clinicId = ""
services/auth-service/src/presentation/dto/login-user.dto.ts               ← clinicId optional
services/auth-service/src/presentation/dto/register-user.dto.ts            ← clinicId optional
services/auth-service/src/main.ts                                           ← connectMicroservice gRPC
services/auth-service/.env                                                  ← add GRPC_PORT + REFRESH_TOKEN_SECRET + REFRESH_TOKEN_EXPIRES_IN
services/api-gateway/src/app.module.ts                                      ← import AuthModule
services/api-gateway/src/shared/env.validation.ts                           ← add AUTH_SERVICE_GRPC_URL
services/api-gateway/src/main.ts                                            ← add cookieParser + ValidationPipe
services/api-gateway/.env                                                   ← add AUTH_SERVICE_GRPC_URL=localhost:5001
frontend/src/infrastructure/repositories/AdminAuthRepositoryImpl.ts         ← replace mock with real fetch (+ refresh token)
frontend/src/infrastructure/auth/nextauth.config.ts                         ← update authorize() + jwt callback with refresh logic
frontend/src/infrastructure/auth/next-auth.d.ts                             ← add backendAccessToken + backendRefreshToken + backendTokenExpiry + error
frontend/.env.local                                                          ← add NEXT_PUBLIC_API_URL
```

**Files NOT to touch:**

```
frontend/src/domain/auth/entities/AdminUser.ts             — NO CHANGE
frontend/src/domain/auth/repositories/AdminAuthRepository.ts — NO CHANGE (interface stays the same)
frontend/src/application/auth/useCases/AdminLogin.ts        — NO CHANGE
frontend/src/infrastructure/container/index.ts              — NO CHANGE (adminLoginUseCase already wired)
frontend/src/presentation/admin/auth/                       — NO CHANGE (admin login UI already done)
frontend/src/middleware.ts                                  — NO CHANGE
services/auth-service/src/presentation/controllers/auth.controller.ts — NO CHANGE (HTTP endpoint kept for dev/Swagger)
```

### Previous Story Intelligence

**From Story 1.1 (JWT Auth — `done`):**

- `nextauth.config.ts` exists with `CredentialsProvider` (id: `"credentials"`) calling `adminLoginUseCase` — only the use case's repository impl is being swapped
- `next-auth.d.ts` augments `JWT` and `Session.user` with `user_id`, `role`, `clinic_id` — add `backendAccessToken` to `JWT` only

**From Story 0.5 (Admin Login UI — `review`):**

- All admin login page components are done; no UI changes in this story

**From Story 8.3 (Auth Service — `done`):**

- auth-service has real TypeORM + MySQL + bcrypt login; `users` table migration ran; `LoginUserUseCase` and `RegisterUserUseCase` are production-ready

### References

- NestJS gRPC microservices: https://docs.nestjs.com/microservices/grpc
- `@GrpcMethod` decorator: https://docs.nestjs.com/microservices/grpc#client
- `status` codes from `@grpc/grpc-js`: used for error mapping in gateway
- Clean Architecture frontend: [Source: docs/planning-artifacts/architecture.md#Frontend Clean Architecture]
- Auth model (JWT claims + Passport): [Source: docs/planning-artifacts/architecture.md#Authentication--Security]
- gRPC internal communication: [Source: docs/planning-artifacts/architecture.md#API & Communication Patterns]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

### Completion Notes List

### File List
