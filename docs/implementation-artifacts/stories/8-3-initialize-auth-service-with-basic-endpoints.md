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

## Definition of Done

- [ ] Auth service NestJS app
- [ ] /register endpoint
- [ ] /login endpoint
- [ ] JWT issuance
- [ ] Database integration
