---
story_id: 0-2-create-patient-mobile-shell-layout
epic: Epic 0 - Frontend Foundation & Mock Data
title: Create Patient Mobile Shell Layout
status: review
assignee: TBD
estimate: 5 pts
priority: High
---

# Story 0.2: Create Patient Mobile Shell Layout

Status: review

## Story

As a patient,
I want a responsive mobile-first layout with persistent header, language switching, and subtle animations,
so that I can seamlessly navigate the patient-facing pages in Arabic, French, or English with a modern feel.

## Acceptance Criteria

1. **Header Behavior:**
   - **Given** the patient accesses pages on mobile or desktop,
   - **When** the persistent header renders,
   - **Then** it must show the DentilFlow logo (left), a navigation menu, an instant language dropdown (with flags/icons), and a Theme Toggle (light/dark mode).
2. **Responsive Adaptation:**
   - **Given** the patient is using a mobile device,
   - **When** viewing the header,
   - **Then** the navigation must collapse into a touch-friendly Hamburger menu.
3. **RTL/LTR & Localization:**
   - **Given** the Next.js locale routing configuration,
   - **When** the language is changed between Arabic (RTL) and French/English (LTR),
   - **Then** the <html> dir attribute must update, conditional Emotion caches must swap, and Tailwind layout utilities (ms/me/ps/pe) must automatically mirror without layout breaks or regressions.
4. **Fluid Transitions:**
   - **Given** page navigation flows,
   - **When** transitions occur between routes,
   - **Then** Framer Motion must apply a subtle fade/slide animation conveying a smooth, pro-app experience.

## Tasks / Subtasks

- [x] Task 1: Initialize Shell and Navigation UI (AC: 1, 2)
  - [x] Scaffold frontend/src/presentation/components/shell/Header.tsx and PatientShell.tsx.
  - [x] Implement desktop navigation links and mobile hamburger overlay using MUI or Headless UI component primitives styling with Tailwind.
  - [x] Implement the Theme Toggle interaction button for local preference (Light/Dark).
- [x] Task 2: Configure Multilingual Routing & RTL Support (AC: 3)
  - [x] Ensure Next.js App Router sets 
ext-intl (or similar) [locale] segments properly onto html lang and dir.
  - [x] Build the conditional MUI Emotion cache provider (frontend/src/infrastructure/ui/EmotionCacheProvider.tsx) supporting stylis-plugin-rtl for Arabic.
  - [x] Ensure all horizontal spacing in the Patient Shell uses Tailwind logical utilities (ps, pe, ms, me, gap) rather than specific ml/pl physical paddings.
- [x] Task 3: Motion & Polishing (AC: 4)
  - [x] Integrate Framer Motion variants into the PatientShell layout adapter.
  - [x] Verify accessibility requirements: minimum touch target sizes (min-h-11, min-w-[44px]), ARIA labels on all hamburger/dropdown toggles, and minimum WCAG 2.1 AA contrast.

## Dev Notes

- **Relevant architecture patterns and constraints:**
  - Hybrid design system approach: MUI for the complex interactive elements like the Dropdowns/Menus, Tailwind CSS for structure and gaps.
  - Clean Architecture constraint: Keep route fetching abstractions in application layer or infrastructure adapters, not tangled deeply in presentation logic.
- **Source tree components to touch:**
  - rontend/src/app/[locale]/(patient)/layout.tsx
  - rontend/src/presentation/components/shell/Header.tsx
  - rontend/src/infrastructure/ui/ (for Theme/Emotion providers)
- **Testing standards summary:**
  - Required RTL/LTR visual regression checking explicitly on this layout.
  - Ensure the header persists properly and isn't z-index conflicted by underlying pages.

### Project Structure Notes

- Alignment with unified project structure:
  - Adhering to the architecture guideline placing rendering concerns strictly in src/presentation and adapters within src/infrastructure.
  - Do not place domain logic or direct external fetch chains in the presentation layer.

### References

- [Source: docs/planning-artifacts/architecture.md#1-rtl-ltr-strategy-next-js--tailwind--mui]
- [Source: docs/planning-artifacts/ux-design-specification.md#2-3-client-side-pages-patient-experience]
- [Source: docs/planning-artifacts/architecture.md#frontend-architecture]

## Dev Agent Record

### Agent Model Used

Gemini 3.1 Pro (Preview)

### Debug Log References

N/A

### Completion Notes List

- Specified exact Tailwind logical utilities (ms/me/ps/pe/gap).
- Included full criteria for hybrid MUI/Tailwind UI.
- Provided clear file mapping linking to Clean Architecture structure.

### File List

- frontend/src/presentation/components/shell/Header.tsx
- frontend/src/presentation/components/shell/PatientShell.tsx
- frontend/src/presentation/components/shell/__tests__/Header.test.tsx
- frontend/src/presentation/components/shell/__tests__/PatientShell.test.tsx
- frontend/src/infrastructure/ui/EmotionCacheProvider.tsx
- frontend/src/infrastructure/ui/__tests__/EmotionCacheProvider.test.tsx
- frontend/src/app/[locale]/(patient)/layout.tsx
- frontend/next.config.ts
- frontend/src/i18n.ts
- frontend/src/middleware.ts
- frontend/messages/en.json
- frontend/messages/fr.json
- frontend/messages/ar.json

- docs/implementation-artifacts/stories/0-2-create-patient-mobile-shell-layout.md

