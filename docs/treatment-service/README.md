# Treatment Service Docs

This folder contains the backend implementation guide for the `treatment-service` microservice.

Use these files when creating the service under:

```text
services/treatment-service
```

## Documents

- [backend-clean-architecture-guide.md](./backend-clean-architecture-guide.md)
  - Main implementation guide aligned with the existing NestJS service architecture.
- [api-contracts.md](./api-contracts.md)
  - gRPC and gateway-facing API contracts.
- [database-and-events.md](./database-and-events.md)
  - TypeORM entities, migrations, outbox events, and transaction rules.

## Existing Related References

- [Frontend treatment domain guide](../implementation-artifacts/treatment-service-gaid.md)
- [Queue + treatment workflow API plan](../implementation-artifacts/treatment-queue-workflow-api-plan.md)
- [Database schema](../implementation-artifacts/database-schema.sql)

## Architecture Target

The service must follow the same backend structure used by existing services:

```text
services/treatment-service/
├── src/
│   ├── application/
│   │   ├── ports/
│   │   └── use-cases/
│   ├── domain/
│   │   ├── entities/
│   │   ├── enums/
│   │   └── repositories/
│   ├── infrastructure/
│   │   ├── grpc/
│   │   ├── nats/
│   │   └── persistence/
│   │       ├── entities/
│   │       ├── mappers/
│   │       ├── migrations/
│   │       └── repositories/
│   ├── presentation/
│   │   ├── grpc/
│   │   └── health/
│   ├── shared/
│   │   └── constants/
│   ├── treatment/
│   │   └── treatment.module.ts
│   ├── app.module.ts
│   └── main.ts
├── Dockerfile
├── jest.config.ts
├── jest.setup.ts
├── tsconfig.json
└── tsconfig.test.json
```

This mirrors:

```text
services/appointment-service
services/patient-service
```
