---
story_id: 0-2-create-patient-mobile-shell-layout
epic: Epic 0 - Frontend Foundation & Mock Data
title: Create Patient Mobile Shell Layout
status: ready-for-dev
assignee: TBD
estimate: 5 pts
priority: High
---

## Story Overview

As a patient,
I want a responsive mobile-first layout with persistent header, language switching, and subtle animations,
So that I can navigate the patient-facing pages seamlessly in Arabic, French, or English with modern feel.

## Acceptance Criteria

**Given** the Next.js app with design system
**When** I access patient pages on mobile/desktop
**Then** the header shows logo, navigation, and instant language dropdown with smooth transitions
**And** page transitions have subtle fade/slide animations
**And** layout adapts responsively with proper direction switching and animation fluidity

## Technical Requirements

- Mobile-first responsive design
- Persistent header component with logo and navigation
- Language switcher dropdown (Arabic, French, English)
- Smooth page transitions using Framer Motion
- RTL/LTR layout adaptation
- Touch-friendly interactions

## Implementation Notes

- Create `frontend/components/shell/PatientShell.tsx`
- Implement header with logo, nav menu, language selector
- Use Next.js App Router for page structure
- Add animation variants for page transitions
- Ensure responsive breakpoints (mobile, tablet, desktop)
- Mock navigation items for now

## Clean Architecture Alignment

- **Presentation Layer:** Shell component, header, navigation UI
- **Infrastructure Layer:** Animation utilities, responsive adapters
- **Application Layer:** Navigation use cases (route changes)
- **Domain Layer:** Navigation entities (menu items, routes)

## Dependencies

- Inherits from Story 0-1 dependencies
- Additional: react-icons for navigation icons

## Testing

- Responsive layout tests across devices
- Language switching functionality
- Animation performance checks

## Definition of Done

- [ ] Patient shell layout implemented
- [ ] Header with logo and navigation
- [ ] Language switcher working
- [ ] Responsive design verified
- [ ] Page transitions animated
- [ ] RTL/LTR direction support
