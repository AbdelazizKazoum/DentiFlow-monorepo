---
story_id: 8-3-initialize-auth-service-with-basic-endpoints
epic: Epic 8 - Backend Services Initialization
title: Initialize Auth Service with Basic Endpoints
status: ready-for-dev
assignee: TBD
estimate: 5 pts
priority: High
---

## Story Overview

As the system,
I want an auth service for user registration and login,
So that authentication is available.

## Acceptance Criteria

**Given** services/auth-service/
**When** NestJS service is set up
**Then** /register and /login endpoints work
**And** JWT issuance and role claims implemented
**And** connects to shared-db

## Technical Requirements

- NestJS service setup
- User registration endpoint
- Login endpoint with JWT
- Role-based claims
- Database connection via shared-db

## Implementation Notes

- Create `services/auth-service/`
- Implement auth module
- Add user entity and repository
- JWT strategy implementation
- Basic validation

## Clean Architecture Alignment

- **Presentation Layer:** Controllers, auth DTOs
- **Application Layer:** Auth use cases (register, login)
- **Infrastructure Layer:** TypeORM repositories, JWT adapters
- **Domain Layer:** User entities, auth business rules

## Dependencies

- Depends on shared-db, shared-config

## Testing

- Endpoint functionality
- JWT generation
- Database operations

## Dev Notes

### Architecture Alignment

**Clean Architecture Implementation:**

- **Domain Layer**: User entity, auth business rules, JWT domain service
- **Application Layer**: RegisterUserUseCase, LoginUserUseCase with validation
- **Infrastructure Layer**: TypeORM user repository, JWT adapters, bcrypt password hashing
- **Presentation Layer**: Auth controller, DTOs for register/login requests/responses

### Technical Context

**Epic 8 Story Dependencies:**

- **Story 8.1** (shared packages) must be completed first - auth service depends on shared-db and shared-config
- **Story 8.2** (API Gateway) can run in parallel - auth service exposes endpoints that gateway will route to

**Shared Package Integration:**

- Import `@shared/db` for TypeORM connection and base repository patterns
- Import `@shared/config` for JWT secrets, database URLs, service port configuration
- Import `@shared/logger` for consistent Winston logging across auth operations

### Implementation Strategy

**NestJS Service Structure:**

```
services/auth-service/
├── src/
│   ├── domain/
│   │   ├── entities/user.entity.ts
│   │   └── services/jwt.domain-service.ts
│   ├── application/
│   │   ├── use-cases/register-user.use-case.ts
│   │   └── use-cases/login-user.use-case.ts
│   ├── infrastructure/
│   │   ├── repositories/user.repository.ts
│   │   └── adapters/jwt.adapter.ts
│   ├── presentation/
│   │   ├── controllers/auth.controller.ts
│   │   └── dto/
│   └── main.ts
├── package.json
└── Dockerfile
```

**Database Integration:**

- Use shared-db TypeORM configuration
- Create User entity with `clinic_id`, `role`, `email`, `password_hash`
- Implement clinic-scoped queries (all users belong to a clinic)

**JWT Implementation:**

- Include `user_id`, `clinic_id`, `role` in JWT payload
- Use RS256 algorithm with shared-config JWT secrets
- Set 15-minute access token expiry (refresh token in future epic)

### Service Dependencies

**Required Services Running:**

- MySQL database (from docker-compose)
- shared-db package available for import
- shared-config package with JWT_SECRET environment variable

**API Contract:**

- `POST /register`: Accept email, password, full_name, role, clinic_id
- `POST /login`: Accept email, password → return JWT + user profile
- Both endpoints return consistent JSON structure with proper error handling

### Testing Strategy

**Unit Tests:**

- Use cases with mocked repositories
- JWT service domain logic
- Password hashing verification

**Integration Tests:**

- Full endpoint flows with test database
- JWT token validation
- Database connectivity and entity persistence

### Expected Development Time

**Estimated: 5 story points (4-6 hours)**

- Setup NestJS service: 1 hour
- Implement domain + application layers: 1.5 hours
- Infrastructure layer (DB + JWT): 1.5 hours
- Controller + DTOs: 1 hour
- Testing + validation: 1 hour

## Tasks/Subtasks

### Task 1: Initialize NestJS Auth Service

- [ ] Create `services/auth-service/` directory structure
- [ ] Initialize NestJS app with `@nestjs/cli`
- [ ] Configure `package.json` with dependencies: @nestjs/core, @nestjs/jwt, bcryptjs, class-validator
- [ ] Add shared package imports: @shared/db, @shared/config, @shared/logger
- [ ] Create basic `main.ts` with service bootstrap on port 3002
- [ ] Add Dockerfile for containerization

### Task 2: Implement Domain Layer

- [ ] Create `src/domain/entities/user.entity.ts` with TypeORM decorators
- [ ] Define User properties: id, email, password_hash, full_name, role, clinic_id, created_at
- [ ] Create `src/domain/services/jwt.domain-service.ts` interface
- [ ] Add role enum: PATIENT, SECRETARY, DOCTOR, ADMIN

### Task 3: Build Application Use Cases

- [ ] Create `src/application/use-cases/register-user.use-case.ts`
- [ ] Implement email uniqueness validation within clinic scope
- [ ] Add password hashing with bcrypt (salt rounds: 12)
- [ ] Create `src/application/use-cases/login-user.use-case.ts`
- [ ] Implement password verification and JWT generation
- [ ] Add proper error handling for invalid credentials

### Task 4: Infrastructure Implementation

- [ ] Create `src/infrastructure/repositories/user.repository.ts`
- [ ] Extend TypeORM Repository with custom methods: findByEmailAndClinic
- [ ] Create `src/infrastructure/adapters/jwt.adapter.ts`
- [ ] Implement JWT signing with RS256 and clinic_id + role claims
- [ ] Configure TypeORM connection using shared-db patterns

### Task 5: Presentation Layer

- [ ] Create `src/presentation/controllers/auth.controller.ts`
- [ ] Implement `POST /register` endpoint with validation decorators
- [ ] Create `src/presentation/dto/register-user.dto.ts` with class-validator
- [ ] Implement `POST /login` endpoint with credential validation
- [ ] Create `src/presentation/dto/login-user.dto.ts`
- [ ] Add consistent error response formatting
- [ ] Configure Swagger/OpenAPI documentation

### Task 6: Integration & Testing

- [ ] Create unit tests for use cases with mocked dependencies
- [ ] Add integration tests for endpoints with test database
- [ ] Test JWT token generation and validation flows
- [ ] Verify clinic_id scoping in database queries
- [ ] Test error scenarios: duplicate email, invalid credentials
- [ ] Validate password hashing security

### Task 7: Service Validation

- [ ] Start auth service and verify port 3002 accessibility
- [ ] Test /register endpoint with Postman/curl
- [ ] Test /login endpoint with valid credentials
- [ ] Verify JWT payload contains correct user_id, clinic_id, role
- [ ] Confirm database integration and user persistence
- [ ] Run all tests and ensure 100% pass rate

## File List

**Files to Create:**

```
services/auth-service/
├── package.json                                    # NestJS dependencies + shared packages
├── tsconfig.json                                   # TypeScript configuration
├── nest-cli.json                                   # NestJS CLI configuration
├── Dockerfile                                      # Container configuration
├── src/
│   ├── main.ts                                     # Service bootstrap
│   ├── app.module.ts                               # Root NestJS module
│   ├── domain/
│   │   ├── entities/
│   │   │   └── user.entity.ts                      # User domain entity
│   │   ├── enums/
│   │   │   └── user-role.enum.ts                   # Role definitions
│   │   └── services/
│   │       └── jwt.domain-service.interface.ts     # JWT domain contract
│   ├── application/
│   │   ├── use-cases/
│   │   │   ├── register-user.use-case.ts           # Registration business logic
│   │   │   └── login-user.use-case.ts              # Login business logic
│   │   └── ports/
│   │       └── user.repository.interface.ts        # Repository contract
│   ├── infrastructure/
│   │   ├── repositories/
│   │   │   └── user.repository.ts                   # TypeORM implementation
│   │   ├── adapters/
│   │   │   └── jwt.adapter.ts                       # JWT service implementation
│   │   └── config/
│   │       └── database.config.ts                  # DB configuration
│   └── presentation/
│       ├── controllers/
│       │   └── auth.controller.ts                   # REST endpoints
│       ├── dto/
│       │   ├── register-user.dto.ts                 # Registration request DTO
│       │   ├── login-user.dto.ts                    # Login request DTO
│       │   └── auth-response.dto.ts                 # JWT response DTO
│       └── guards/
│           └── jwt-auth.guard.ts                    # JWT validation guard
└── test/
    ├── unit/
    │   ├── use-cases/
    │   │   ├── register-user.use-case.spec.ts
    │   │   └── login-user.use-case.spec.ts
    │   └── services/
    │       └── jwt.service.spec.ts
    └── integration/
        └── auth.controller.spec.ts                  # E2E endpoint tests
```

**Configuration Files:**

- `package.json`: Add NestJS, JWT, bcrypt, TypeORM, class-validator dependencies
- `tsconfig.json`: TypeScript strict mode, path mapping for clean imports
- `nest-cli.json`: Source root and compiler options

## Developer Context

### Previous Story Intelligence

**Story 8.1 - Shared Packages:**

- Creates foundation packages that this story depends on
- Establishes TypeORM patterns, Winston logging, YAML config loading
- Provides `@shared/db`, `@shared/config`, `@shared/logger` imports

**Story 8.2 - API Gateway:**

- Runs in parallel with this story
- Will route external requests to auth service endpoints
- Auth service exposes internal endpoints that gateway proxies

### Implementation Patterns

**Clean Architecture Enforcement:**

- Domain entities are pure TypeScript classes with business rules
- Use cases contain application logic, no external dependencies
- Infrastructure adapters implement domain interfaces
- Controllers handle HTTP concerns only, delegate to use cases

**Error Handling Strategy:**

- Domain: Throw business logic errors (InvalidCredentials, DuplicateUser)
- Application: Catch domain errors, transform to use case results
- Presentation: Map use case results to HTTP status codes
- Use NestJS exception filters for consistent error formatting

**Security Considerations:**

- Hash passwords with bcrypt, minimum 12 salt rounds
- JWT tokens expire in 15 minutes (short-lived)
- Include clinic_id in JWT to scope all subsequent operations
- Validate email format and password strength in DTOs

### Testing Approach

**Unit Tests (Jest):**

- Mock all external dependencies (repository, JWT service)
- Focus on business logic in use cases
- Test edge cases: empty inputs, malformed data

**Integration Tests:**

- Use test database with Docker testcontainers
- Test full request/response cycles
- Verify JWT payload structure and claims

### Future Epic Considerations

**Refresh Token Implementation (Future Epic):**

- Current implementation uses only access tokens
- Future epic will add refresh token rotation
- JWT adapter interface supports this future extension

**Password Reset Flow (Future Epic):**

- User entity ready for password reset tokens
- Email service integration will be added later
- Domain supports multiple authentication methods

## Latest Tech Information

- **NestJS 10.x**: Current stable, use latest CLI
- **TypeORM 0.3.x**: Latest version with improved decorators
- **@nestjs/jwt 10.x**: Built-in JWT support for NestJS
- **bcryptjs**: Widely supported password hashing library
- **class-validator**: Standard validation for NestJS DTOs
- **Jest**: Default testing framework for NestJS projects

## References

- **PRD**: [docs/planning-artifacts/prd.md](docs/planning-artifacts/prd.md)
- **Architecture**: [docs/planning-artifacts/architecture.md](docs/planning-artifacts/architecture.md)
- **Epics**: [docs/planning-artifacts/epics.md](docs/planning-artifacts/epics.md)
- **Project Context**: [docs/planning-artifacts/project-context.md](docs/planning-artifacts/project-context.md)

## Definition of Done

- [ ] Auth service NestJS app running on port 3002
- [ ] POST /register endpoint with validation
- [ ] POST /login endpoint with JWT response
- [ ] JWT tokens include user_id, clinic_id, role claims
- [ ] Database integration with User entity persistence
- [ ] Unit tests for all use cases (90%+ coverage)
- [ ] Integration tests for auth endpoints
- [ ] Password hashing with bcrypt implemented
- [ ] Error handling with consistent response format
- [ ] Swagger documentation for API endpoints
- [ ] Service containerized with Dockerfile
- [ ] Clean Architecture layers properly separated
