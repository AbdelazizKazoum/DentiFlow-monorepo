---
story_id: 0-7-populate-dashboard-with-mock-operational-data
epic: Epic 0 - Frontend Foundation & Mock Data
title: Populate Dashboard with Mock Operational Data
status: done
assignee: TBD
estimate: 3 pts
priority: Low
---

## Story Overview

As a secretary,
I want to see realistic mock data in the dashboard components with modern interactions,
So that I can validate the UI/UX for daily operations with premium feel.

## Acceptance Criteria

**Given** dashboard shell with dark/light mode
**When** I view the dashboard
**Then** queue widget shows mock patients with animated status chips and smooth transitions
**And** appointment list/table shows mock entries with sorting/filtering and row hover animations
**And** all data is static mock data for UI validation
**And** interactions (status changes) update with animated feedback and maintain theme consistency

## Technical Requirements

- Mock data for queue and appointments
- Animated status chips
- Sortable/filterable table
- Hover effects and transitions
- Theme consistency

## Implementation Notes

- Create mock data files
- Populate dashboard components with mock data
- Add interaction handlers for status changes
- Ensure animations work in both themes

## Clean Architecture Alignment

- **Presentation Layer:** Dashboard widgets, data tables
- **Infrastructure Layer:** Mock data adapters
- **Application Layer:** Data fetching use cases (mock)
- **Domain Layer:** Operational entities (queue, appointments)

## Dependencies

- Depends on Story 0-6

## Testing

- Data display
- Interaction animations
- Theme consistency

## Definition of Done

- [x] Mock data integrated
- [x] Queue widget populated
- [x] Appointment table with interactions
- [x] Animations working
- [x] Theme consistency
