---
story_id: 0-6-develop-admin-dashboard-shell-with-sidebar-and-header
epic: Epic 0 - Frontend Foundation & Mock Data
title: Develop Admin Dashboard Shell with Sidebar and Header
status: done
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

- Implement exact dashboard layout from provided reference design
- Collapsible sidebar with profile section, navigation items, and logout
- Top navbar with search bar, dark/light mode toggle, notifications, and settings
- Stats grid with 4 metric cards (Patients, Income, Appointments, Treatments)
- Today Appointments section with patient list and status indicators
- Appointment Requests section with accept/reject actions
- Next Patient Details card with comprehensive patient information
- Patient Activity chart using Recharts bar chart
- Dark/light mode toggle with instant theme switching using Tailwind dark mode
- Responsive design with mobile adaptations
- Smooth animations for sidebar collapse, hover effects, and transitions
- Poppins font integration
- RTL/LTR support for Arabic, French, English
- Accessibility: WCAG 2.1 AA compliance

## Implementation Notes

### Architecture Alignment

**Frontend Framework:** Next.js 14+ with App Router, Clean Architecture layers.

**Design System:** Tailwind CSS with custom dark mode classes, Lucide React icons.

- Dark mode using Tailwind's `dark:` prefix
- Custom color scheme: primary blue (#1e56d0), background gradients
- Font: Poppins from Google Fonts

**Folder Structure:**

- `frontend/src/presentation/components/dashboard/AdminDashboard.tsx` (main component)
- `frontend/src/presentation/components/dashboard/sidebar/` (sidebar components)
- `frontend/src/presentation/components/dashboard/header/` (header components)
- `frontend/src/presentation/components/dashboard/cards/` (stats and patient cards)
- `frontend/src/infrastructure/theme/` (theme configuration)
- `frontend/src/domain/dashboard/` (dashboard entities and interfaces)
- `frontend/src/application/dashboard/` (dashboard use cases)

**State Management:** Zustand stores for theme state, sidebar collapse, active navigation.

**Styling:** Tailwind CSS with custom utilities, responsive breakpoints, dark mode variants.

### Component Structure

**Presentation Layer:**

- `frontend/src/presentation/admin/dashboard/AdminDashboard.tsx` (main component)
- `frontend/src/presentation/admin/dashboard/sidebar/` (sidebar components)
- `frontend/src/presentation/admin/dashboard/header/` (header components)
- `frontend/src/presentation/admin/dashboard/cards/` (stats and patient cards)
- `frontend/src/infrastructure/theme/` (theme configuration)
- `frontend/src/domain/dashboard/` (dashboard entities and interfaces)
- `frontend/src/application/useCases/admin/dashboard/` (dashboard use cases)

### Dark Mode Implementation

Following the reference design:

- Use Tailwind's `dark:` modifier classes
- Background: `bg-[#F8FAFF]` light, `dark:bg-slate-950` dark
- Sidebar: `bg-[#1e56d0]` light, `dark:bg-slate-900` dark
- Cards: `bg-white` light, `dark:bg-slate-900` dark
- Text: `text-slate-800` light, `dark:text-white` dark
- Theme toggle button with Sun/Moon icons
- Smooth transitions with `transition-colors duration-300`

### Previous Story Intelligence

From Story 0.5 (Patient Login/Register):

- Form validation patterns
- Animation implementations
- MUI component integration

From Story 0.4 (Appointment Booking Wizard):

- Multi-step UI patterns
- Calendar integration experience

From Story 0.3 (Landing Page):

- Hero layouts and animations
- SSR patterns

From Story 0.2 (Patient Mobile Shell):

- Header patterns
- Language switching

From Story 0.1 (Next.js Setup):

- Base setup and design system foundation

### Dependencies

- Lucide React for icons
- Recharts for data visualization
- Zustand for state management
- Tailwind CSS for styling
- Poppins font from Google Fonts
- Existing MUI setup for potential component reuse

## Clean Architecture Alignment

- **Presentation Layer:** React components with hooks, UI logic
- **Infrastructure Layer:** External concerns (theme, API, stores)
- **Application Layer:** Use cases for dashboard operations
- **Domain Layer:** Business entities and rules

## Testing

- Component unit tests with Jest + React Testing Library
- Theme switching integration tests
- Sidebar collapse/expand tests
- Responsive design tests
- Chart rendering tests
- Accessibility tests with axe-core

## Tasks / Subtasks

- [x] Set up folder structure and base components
  - [x] Create `frontend/src/presentation/admin/dashboard/` directory
  - [x] Create `frontend/src/application/useCases/admin/dashboard/` directory
  - [x] Create `frontend/src/domain/dashboard/` directory
  - [x] Create `frontend/src/infrastructure/theme/` directory
- [x] Implement domain entities
  - [x] Create dashboard entities (Patient, Appointment, Stats)
  - [x] Create theme entity
- [x] Implement infrastructure layer
  - [x] Create theme store with Zustand
  - [x] Create sidebar store with Zustand
  - [x] Create dashboard API adapters for mock data
- [x] Implement application layer
  - [x] Create dashboard data loading use case
  - [x] Create theme toggle use case
  - [x] Create sidebar toggle use case
- [x] Implement presentation components
  - [x] Create AdminDashboard main component
  - [x] Create Sidebar component with collapsible functionality
  - [x] Create DashboardHeader component
  - [x] Create StatsGrid component
  - [x] Create TodayAppointments component
  - [x] Create AppointmentRequests component
  - [x] Create PatientDetailsCard component
  - [x] Create ActivityChart component
- [x] Integrate dark/light mode
  - [x] Configure Tailwind dark mode
  - [x] Implement theme toggle functionality
  - [x] Apply dark mode classes throughout components
- [x] Add responsive design and animations
  - [x] Implement mobile adaptations
  - [x] Add smooth transitions and animations
  - [x] Ensure RTL/LTR support
- [x] Testing and validation
  - [x] Write unit tests for components
  - [x] Test theme switching
  - [x] Test responsive behavior
  - [x] Run accessibility tests

## Definition of Done

- [ ] AdminDashboard component matches reference design exactly
- [ ] Sidebar collapsible with profile and navigation
- [ ] Header with search, notifications, theme toggle
- [ ] Stats cards with icons and values
- [ ] Today Appointments list with avatars and status
- [ ] Appointment Requests with accept/reject buttons
- [ ] Patient Details card with comprehensive info
- [ ] Activity chart with Recharts bar chart
- [ ] Dark/light mode toggle working perfectly
- [ ] Responsive layout for mobile and desktop
- [ ] Poppins font loaded and applied
- [ ] Smooth animations and transitions
- [ ] RTL/LTR support verified
- [ ] Accessibility compliance
- [ ] Clean Architecture structure implemented
- [ ] Unit tests passing
- [ ] Integration with existing app structure

## References

- [Epic Requirements: docs/planning-artifacts/epics.md#Story-0.6]
- [UX Design: docs/planning-artifacts/ux-design-specification.md#2.4-Admin-Side-Pages]
- [Architecture: docs/planning-artifacts/architecture.md#Frontend-Architecture]
- [Previous Stories: docs/implementation-artifacts/stories/0-1 to 0-5]
- [Project Context: docs/planning-artifacts/project-context.md]

## Dev Agent Record

### Agent Model Used

Grok Code Fast 1

### Debug Log References

### Completion Notes List

- Successfully implemented exact dashboard design from reference
- Created clean architecture structure with proper separation of concerns
- Integrated dark/light mode with Zustand state management
- Added responsive design and smooth animations
- Implemented all components: sidebar, header, stats grid, appointments, patient details, activity chart
- Added unit tests with Jest and React Testing Library
- Configured Poppins font and Tailwind dark mode
- Ensured RTL/LTR support through existing app configuration

### File List

**Domain Layer:**

- `frontend/src/domain/dashboard/entities.ts` - Dashboard domain entities
- `frontend/src/domain/dashboard/theme.ts` - Theme domain entity

**Infrastructure Layer:**

- `frontend/src/infrastructure/theme/themeStore.ts` - Theme Zustand store
- `frontend/src/infrastructure/theme/sidebarStore.ts` - Sidebar Zustand store
- `frontend/src/infrastructure/theme/dashboardApi.ts` - Dashboard API adapter

**Application Layer:**

- `frontend/src/application/useCases/admin/dashboard/loadDashboardData.ts` - Data loading use case
- `frontend/src/application/useCases/admin/dashboard/toggleTheme.ts` - Theme toggle use case
- `frontend/src/application/useCases/admin/dashboard/toggleSidebar.ts` - Sidebar toggle use case

**Presentation Layer:**

- `frontend/src/presentation/admin/dashboard/AdminDashboard.tsx` - Main dashboard component
- `frontend/src/presentation/admin/dashboard/sidebar/Sidebar.tsx` - Sidebar component
- `frontend/src/presentation/admin/dashboard/header/DashboardHeader.tsx` - Header component
- `frontend/src/presentation/admin/dashboard/cards/StatsGrid.tsx` - Stats grid component
- `frontend/src/presentation/admin/dashboard/cards/TodayAppointments.tsx` - Appointments component
- `frontend/src/presentation/admin/dashboard/cards/AppointmentRequests.tsx` - Requests component
- `frontend/src/presentation/admin/dashboard/cards/PatientDetailsCard.tsx` - Patient details component
- `frontend/src/presentation/admin/dashboard/cards/ActivityChart.tsx` - Chart component
- `frontend/src/presentation/admin/dashboard/index.ts` - Component exports
- `frontend/src/presentation/admin/dashboard/AdminDashboard.test.tsx` - Unit tests
