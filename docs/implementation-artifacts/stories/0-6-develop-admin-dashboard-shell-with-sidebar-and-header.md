---
story_id: 0-6-develop-admin-dashboard-shell-with-sidebar-and-header
epic: Epic 0 - Frontend Foundation & Mock Data
title: Develop Admin Dashboard Shell with Sidebar and Header
status: ready-for-dev
assignee: TBD
estimate: 5 pts
priority: High
---

## Story Overview

As an admin/staff,
I want a premium collapsible sidebar dashboard with metrics cards, modern navigation, and dark/light mode,
So that I can access operational views with a pro-platform aesthetic.

## Acceptance Criteria

**Given** responsive dashboard layout
**When** I access admin area
**Then** sidebar shows icons + labels with smooth collapse animation and active state highlights
**And** top navbar has search with autocomplete, notifications bell with badge, user dropdown with avatar
**And** main area shows modern metrics cards with subtle shadows, hover effects, and data visualizations
**And** dark/light mode toggle in navbar switches theme instantly with smooth transitions

## Technical Requirements

- Collapsible sidebar navigation
- Top navbar with search and notifications
- Dark/light mode toggle
- Metrics cards with data visualization
- Responsive layout
- Smooth animations

## Implementation Notes

- Create `frontend/components/shell/AdminShell.tsx`
- Implement sidebar with collapse functionality
- Add navbar with search, notifications, user menu
- Create metrics card components
- Integrate theme switching

## Clean Architecture Alignment

- **Presentation Layer:** Shell layout, sidebar, navbar, metrics cards
- **Infrastructure Layer:** Theme adapters, notification integrations
- **Application Layer:** Dashboard data loading use cases
- **Domain Layer:** Dashboard entities (metrics, notifications)

## Dependencies

- Inherits from Story 0-1
- Additional: recharts for data visualization

## Testing

- Sidebar collapse/expand
- Theme switching
- Responsive behavior
- Animation smoothness

## Definition of Done

- [ ] Admin shell layout
- [ ] Collapsible sidebar
- [ ] Top navbar components
- [ ] Metrics cards
- [ ] Dark/light mode toggle
