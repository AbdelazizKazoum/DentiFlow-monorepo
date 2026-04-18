# Story 1.2: Add Middleware Guards for Admin Dashboard

## Epic
Epic 1: Platform Foundation

## User Story
As an admin,
I want role-based route protection and session management,
So that only authorized staff access admin features.

## Acceptance Criteria
- **Given** admin routes
- **When** non-admin attempts access
- **Then** redirected to login or 403 error
- **And** session timeout handled gracefully
- **And** logout clears tokens and redirects

## Notes
- Integrate with JWT authentication and role claims.
- Ensure session expiration and token invalidation are handled securely.
- UX: Provide clear feedback for unauthorized access.
