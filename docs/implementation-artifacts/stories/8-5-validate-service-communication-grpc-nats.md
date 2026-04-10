---
story_id: 8-5-validate-service-communication-grpc-nats
epic: Epic 8 - Backend Services Initialization
title: Validate Service Communication (gRPC + NATS)
status: ready-for-dev
assignee: TBD
estimate: 3 pts
priority: Medium
---

## Story Overview

As the system,
I want services to communicate via gRPC and NATS,
So that the architecture is solid.

## Acceptance Criteria

**Given** running services
**When** auth service calls clinic service via gRPC
**Then** communication succeeds
**And** NATS events are published and consumed
**And** no connection errors

## Technical Requirements

- gRPC client/server setup
- NATS publisher/subscriber
- Inter-service communication validation
- Error handling for connections

## Implementation Notes

- Set up gRPC protobuf definitions
- Implement NATS event publishing
- Add communication tests between services
- Validate in docker-compose environment

## Clean Architecture Alignment

- **Infrastructure Layer:** gRPC clients, NATS publishers
- **Application Layer:** Communication use cases
- **Domain Layer:** Event/message entities
- **Presentation Layer:** N/A

## Dependencies

- Depends on previous Epic 8 stories

## Testing

- gRPC calls succeed
- NATS events flow
- Error scenarios handled

## Definition of Done

- [ ] gRPC communication working
- [ ] NATS events published/consumed
- [ ] Inter-service calls validated
- [ ] Error handling implemented
