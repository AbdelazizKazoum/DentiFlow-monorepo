# Story 1.6: Add RTL/LTR Visual Regression Testing

## Epic
Epic 1: Platform Foundation

## User Story
As a developer,
I want automated tests for direction-specific layouts,
So that RTL/LTR changes don't break visual consistency.

## Acceptance Criteria
- **Given** CI pipeline
- **When** PR submitted
- **Then** visual regression tests run for Arabic RTL and French/English LTR
- **And** pixel-perfect comparisons flag any regressions
- **And** tests cover critical journeys

## Notes
- Integrate with CI/CD pipeline for automated visual testing.
- Use tools like Percy, Chromatic, or Playwright for visual diffs.
