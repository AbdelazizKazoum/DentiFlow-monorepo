---
story_id: 8-2-set-up-api-gateway-with-basic-routing
epic: Epic 8 - Backend Services Initialization
title: Set Up API Gateway with Basic Routing
status: ready-for-dev
assignee: TBD
estimate: 5 pts
priority: High
---

## Story Overview

As the system,
I want an API Gateway for request ingress and JWT verification,
So that all services are protected and routed correctly.

## Acceptance Criteria

**Given** services/api-gateway/
**When** NestJS gateway is initialized
**Then** routes to auth-service, clinic-service, etc.
**And** JWT verification middleware is applied
**And** SSE fanout is prepared

## Technical Requirements

- NestJS application setup
- Basic routing to services
- JWT verification middleware
- SSE endpoint preparation
- Docker containerization

## Implementation Notes

- Create `services/api-gateway/`
- Set up NestJS with basic modules
- Implement JWT guard
- Add route proxies to services
- Prepare SSE infrastructure

## Clean Architecture Alignment

- **Presentation Layer:** Controllers, DTOs
- **Application Layer:** Routing use cases, auth guards
- **Infrastructure Layer:** Service proxies, SSE adapters
- **Domain Layer:** Auth entities, routing rules

## Dependencies

- @nestjs/core, @nestjs/jwt, etc.

## Testing

- Routing functionality
- JWT verification
- Basic health checks

## Definition of Done

- [ ] API Gateway NestJS app
- [ ] Basic routing implemented
- [ ] JWT middleware
- [ ] SSE preparation
- [ ] Docker setup
