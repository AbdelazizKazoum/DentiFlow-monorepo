---
generatedBy: "bmad-generate-project-context"
inputDocuments:
  - docs/planning-artifacts/architecture.md
  - docs/planning-artifacts/product-brief-dentilflow-frontend.md
  - docs/planning-artifacts/ux-design-specification.md
  - docs/planning-artifacts/prd.md
  - docs/planning-artifacts/epics-and-stories.md
workflowType: "project-context"
status: "generated"
generatedAt: "2026-04-09"
project_name: "dentiflow-menorepo"
user_name: "Abdelaziz"
date: "2026-04-09"
---

# Project Context Document

_This document distills the finalized architecture into implementation-ready context for the development team. It provides the essential technical foundation, patterns, and constraints needed to begin coding._

## Executive Summary

DentilFlow is a comprehensive SaaS platform for dental clinic operations, built as a monorepo with Next.js frontend and NestJS microservices backend. The system supports real-time queue management, multi-role user experiences, and strict compliance requirements across Arabic/French/English locales.

**Key Architectural Decisions:**

- **Frontend:** Next.js 14+ with App Router, Clean Architecture, Zustand state management, Axios for API calls
- **Backend:** NestJS microservices with Clean Architecture, gRPC internal communication, NATS for events
- **Database:** MySQL 8.4 LTS with per-service schemas and clinic_id isolation
- **Real-time:** SSE + REST with NATS pub/sub backbone
- **DevOps:** Docker Compose for local dev/prod, isolated service containers

## Technology Stack

### Frontend Stack

- **Framework:** Next.js 14+ with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS + MUI components
- **State Management:** Zustand stores (authStore, clinicStore, queueStore)
- **API Client:** Axios with interceptors and base configuration
- **Architecture:** Clean Architecture (domain/application/infrastructure/presentation layers)
- **Internationalization:** Built-in Next.js i18n with Arabic RTL support

### Backend Stack

- **Framework:** NestJS with Clean Architecture
- **Language:** TypeScript
- **Database:** MySQL 8.4 LTS with TypeORM
- **Communication:** gRPC (sync) + NATS (async events)
- **Validation:** class-validator + class-transformer
- **Authentication:** JWT with Passport.js strategies

### Infrastructure Stack

- **Containerization:** Docker + Docker Compose
- **Message Broker:** NATS for event-driven architecture
- **Database:** MySQL with per-service schemas
- **Development:** Hot-reload with volume mounts
- **CI/CD:** Scripts in `scripts/ci-cd/` (post-MVP)

## Project Structure Overview

```
dentiflow/
├── frontend/           # Next.js application
├── services/           # NestJS microservices
│   ├── shared/         # Common utilities
│   ├── api-gateway/    # API ingress point
│   ├── auth-service/   # Authentication & authorization
│   ├── clinic-service/ # Clinic management
│   ├── appointment-service/ # Appointment booking
│   ├── queue-service/  # Real-time queue management
│   ├── treatment-service/ # Treatment workflows
│   ├── checkout-service/ # Payment & billing
│   ├── patient-service/ # Patient records
│   ├── notification-service/ # Communications
│   └── audit-service/  # Compliance logging
├── packages/           # Shared packages
│   ├── shared-db/      # Database utilities
│   ├── shared-logger/  # Logging configuration
│   ├── shared-config/  # Configuration management
│   ├── shared-events/  # Event definitions
│   └── proto/          # gRPC contracts
└── docs/               # Documentation
```

## Core Architectural Patterns

### Clean Architecture Implementation

**Frontend Layers (Feature-Based):**

- `domain/{feature}/entities/`: Pure TypeScript business models (`Date`, enums, camelCase). Zero framework dependencies. No global `entities/` folder.
- `domain/{feature}/repositories/`: Repository interfaces declared here, never in infrastructure.
- `application/{feature}/useCases/`: Classes with `execute()`. Depends only on domain interfaces. No API calls.
- `infrastructure/api/`: Axios HTTP calls only. `types.ts` holds DTO shapes (NOT domain entities).
- `infrastructure/mappers/`: DTO → Domain Entity conversion (snake_case → camelCase, string → Date).
- `infrastructure/repositories/`: Implement domain interfaces using API + mappers. Return only domain entities.
- `infrastructure/container/index.ts`: DI wiring — instantiates repositories and use cases.
- `presentation/store/`: Zustand stores per feature. Call use cases via container. Never call API directly.
- `presentation/components/`: React components. Never call API directly.
- `presentation/app/`: Next.js App Router adapter only (layouts, pages, route handlers). SSR pages call use cases from container.
- `shared/`: Cross-cutting utilities and types that are NOT domain entities.

**Backend Layers:**

- `domain/`: Business entities, rules, interfaces
- `application/`: Use cases, commands, queries
- `infrastructure/`: Repositories, external services, frameworks
- `presentation/`: Controllers, DTOs, API endpoints

### Data Patterns

- **Repository Pattern:** Abstract data access with TypeORM implementations
- **Mapper Pattern:** Translation between domain entities and DB entities
- **Outbox Pattern:** Reliable event publishing per service
- **Clinic Isolation:** `clinic_id` in all tables for multi-tenant readiness

### Communication Patterns

- **API Gateway:** Single entry point with JWT verification and SSE fanout
- **gRPC:** Internal service-to-service communication
- **NATS Events:** Async event-driven workflows
- **SSE:** Real-time updates to frontend clients

## Service Boundaries & Responsibilities

| Service              | Responsibility                                     | Key Entities            |
| -------------------- | -------------------------------------------------- | ----------------------- |
| api-gateway          | Request routing, auth verification, SSE fanout     | N/A                     |
| auth-service         | User authentication, role management, JWT issuance | User, Role, Permission  |
| clinic-service       | Clinic configuration, staff management             | Clinic, Staff, Settings |
| appointment-service  | Appointment scheduling and management              | Appointment, TimeSlot   |
| queue-service        | Real-time queue state and transitions              | QueueEntry, Status      |
| treatment-service    | Treatment workflows and confirmations              | Treatment, Visit        |
| checkout-service     | Payments, billing, balance management              | Payment, Invoice        |
| patient-service      | Patient records and longitudinal data              | Patient, MedicalRecord  |
| notification-service | WhatsApp/email communications                      | Notification, Template  |
| audit-service        | Compliance logging and audit trails                | AuditLog, Event         |

## Implementation Priorities

### Phase 1: Foundation (Weeks 1-2)

1. **Shared Packages:** Build `shared-db`, `shared-logger`, `shared-config`
2. **API Gateway:** Basic routing and JWT verification
3. **Auth Service:** User registration, login, JWT issuance
4. **Database Setup:** MySQL containers, initial migrations
5. **Frontend Foundation:** Next.js setup with Clean Architecture skeleton

### Phase 2: Core Services (Weeks 3-6)

1. **Clinic Service:** Clinic management and staff
2. **Patient Service:** Patient registration and basic records
3. **Appointment Service:** Booking and scheduling
4. **Queue Service:** Real-time queue with SSE
5. **Frontend Integration:** Role-based UI shells

### Phase 3: Advanced Features (Weeks 7-10)

1. **Treatment Service:** Clinical workflows
2. **Checkout Service:** Payment processing
3. **Notification Service:** Communication channels
4. **Audit Service:** Compliance logging
5. **Testing & Optimization:** E2E tests, performance tuning

## Development Guidelines

### Code Quality Standards

- **TypeScript:** Strict mode enabled, no `any` types
- **SOLID Principles:** Single responsibility, dependency inversion, etc.
- **Clean Architecture:** Strict layer separation, dependency direction
- **Testing:** Unit tests for business logic, integration tests for services
- **Documentation:** JSDoc for public APIs, READMEs for services

### Database Guidelines

- **Naming:** snake_case for DB columns, camelCase for TypeScript
- **Constraints:** Database-level validation as safety net
- **Migrations:** Per-service, version-controlled, rollback-safe
- **Indexing:** Performance-critical queries indexed
- **Clinic Isolation:** All queries filtered by `clinic_id`

### Frontend Clean Architecture Guidelines

- **Feature-based organization:** Every domain feature (appointment, auth, patient, treatment) is a vertical slice across all layers.
- **Correct data flow:** `Zustand store` → `UseCase.execute()` → `RepositoryImpl` → `API` → `Mapper` → Domain Entity.
- **DTO ≠ Entity:** `infrastructure/api/types.ts` DTOs use raw API shapes. Domain entities use clean TS types. Conversion happens exclusively in `mappers/`.
- **Dependency direction:** `presentation` → `application` → `domain`; `infrastructure` implements `domain` interfaces.
- **Forbidden patterns:**
  - ❌ No global `entities/` folder
  - ❌ No API calls in Zustand stores or React components
  - ❌ No DTO types used outside `infrastructure/`
  - ❌ No business logic in Zustand stores
  - ❌ No repository interfaces declared inside `infrastructure/`

### API Guidelines

- **REST:** Resource-based endpoints with standard HTTP methods
- **gRPC:** Internal service communication with protobuf contracts
- **Validation:** Request/response DTOs with class-validator
- **Error Handling:** Consistent error responses with proper HTTP status codes
- **Versioning:** API versioning for backward compatibility

### Security Guidelines

- **Authentication:** JWT verification at gateway level
- **Authorization:** Role-based access control per endpoint
- **Data Protection:** AES-256 encryption for sensitive data
- **Audit Logging:** All data changes logged with user context
- **Input Validation:** Multiple layers (API, domain, database)

## Environment Setup

### Local Development

```bash
# Clone repository
git clone <repo-url>
cd dentiflow

# Install dependencies
pnpm install

# Start development environment
docker-compose -f docker-compose.yml up -d

# Start frontend
cd frontend && pnpm dev

# Start services (in separate terminals)
cd services/auth-service && pnpm start:dev
# ... other services
```

### Key Environment Variables

- `DATABASE_URL`: MySQL connection string
- `JWT_SECRET`: JWT signing key
- `NATS_URL`: NATS broker URL
- `CLINIC_ID`: Default clinic identifier
- `NEXTAUTH_SECRET`: NextAuth session secret

## Quality Assurance

### Testing Strategy

- **Unit Tests:** Business logic, utilities, isolated components
- **Integration Tests:** Service interactions, database operations
- **E2E Tests:** Critical user journeys, API contracts
- **Performance Tests:** Load testing for queue operations
- **Security Tests:** Penetration testing, dependency scanning

### Code Review Checklist

- [ ] Clean Architecture layers respected
- [ ] SOLID principles applied
- [ ] TypeScript strict compliance
- [ ] Database queries include clinic_id filter
- [ ] Error handling implemented
- [ ] Tests written and passing
- [ ] Documentation updated

## Risk Mitigation

### Technical Risks

- **Real-time Complexity:** SSE + NATS architecture validated in architecture
- **Multi-tenant Scaling:** clinic_id design enables future partitioning
- **Internationalization:** Next.js i18n with RTL support tested
- **Compliance:** Audit logging and encryption implemented from day one

### Operational Risks

- **Service Dependencies:** Docker Compose ensures consistent environments
- **Database Performance:** Indexing strategy and query optimization planned
- **Monitoring:** Basic logging and error tracking in shared packages
- **Deployment:** Docker-based deployment simplifies staging/production

## Success Metrics

### Development Metrics

- **Code Coverage:** >80% unit test coverage
- **Build Time:** <5 minutes for full CI pipeline
- **Test Execution:** <10 minutes for full test suite
- **Deployment Frequency:** Daily deployments to staging

### Product Metrics

- **Performance:** Queue updates within 3 seconds
- **Reliability:** 99.9% uptime, <10 second reconnect time
- **Security:** Zero data breaches, compliant audit trails
- **User Experience:** Instant language switching, pixel-perfect RTL

## Next Steps

1. **Review this document** with the development team
2. **Set up development environment** following the guidelines above
3. **Begin Phase 1 implementation** with shared packages
4. **Establish daily standups** and sprint planning
5. **Monitor progress** against the implementation priorities

This project context provides the foundation for successful implementation. All team members should familiarize themselves with these guidelines before beginning development work.
