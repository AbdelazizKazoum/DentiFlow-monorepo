---
title: Sprint 1 Plan — Epic 0 (Frontend Foundation) & Epic 8 (Backend Init)
start_date: 2026-04-10
end_date: 2026-04-24
duration_days: 14
owner: Scrum Master (Bob)
---

Sprint Goal

- Deliver complete foundation for frontend UI and backend services so devs can begin feature work across all Epic 0 and Epic 8 stories.

Scope (Committed)

- Epic 0: Frontend Foundation (All Stories)
  - 0-1 Initialize Next.js frontend with design system — 8 pts
  - 0-2 Create Patient Mobile Shell layout — 5 pts
  - 0-3 Build Landing Page with Hero and Sections — 8 pts
  - 0-4 Implement Appointment Booking Wizard — 8 pts
  - 0-5 Create Patient Login/Register Pages — 5 pts
  - 0-6 Develop Admin Dashboard Shell with Sidebar and Header — 5 pts
  - 0-7 Populate Dashboard with Mock Operational Data — 3 pts

- Epic 8: Backend Services Initialization (All Stories)
  - 8-1 Initialize Shared Packages (shared-db, shared-logger, shared-config) — 8 pts
  - 8-2 Set Up API Gateway with Basic Routing — 5 pts
  - 8-3 Initialize Auth Service with Basic Endpoints — 5 pts
  - 8-4 Configure Docker Compose for Local Development — 5 pts
  - 8-5 Validate Service Communication (gRPC + NATS) — 3 pts

Total points: 58 pts

Prioritization & Rationale

- Start with platform foundations that unblock parallel work: shared packages and Docker compose allow services and frontend to run locally. Frontend design system + shells provide scaffolding for UI teams and early UX validation.

Definition of Done (Sprint)

- Repositories / packages initialized with README, basic build/test scripts
- `docker-compose.yml` starts required local infra (MySQL, NATS, minimal services) and documented run steps
- Next.js app scaffolded with TypeScript, MUI + Tailwind integration, shared tokens placeholder
- Patient mobile shell and Admin shell routes/components exist with responsive layout and language switch hook (mock data)
- All committed stories have acceptance criteria linked in story descriptions and PR templates created
- Clean Architecture layers established: domain, application, infrastructure, presentation for frontend and backend

Tasks (high level)

- 0-1: scaffold Next.js app; add Tailwind, MUI, Framer Motion; add direction handling and Emotion caches
- 0-2: implement shell layout, header with language switch (mock content), responsive breakpoints
- 0-6: implement dashboard shell with collapsible sidebar and top navbar skeleton
- 8-1: create `packages/shared-config`, `packages/shared-logger`, `packages/shared-db` with initial exports and tests
- 8-4: author `docker-compose.yml`, environment sample files, and local run guide in `README.md`

Team Cadence

- Daily standup (15m)
- Blocker triage as needed
- Mid-sprint check-in (day 7)
- Sprint demo & retrospective on last day

Risks & Mitigations

- Risk: Over-ambitious scope for 2 weeks — Mitigation: focus on minimal viable scaffolding and mock data; postpone polish
- Risk: Environment flakiness — Mitigation: document env variables and provide a reproducible `docker-compose up` script

Next Steps (immediate)

1. Assign owners and finalize estimates with devs
2. Kick off daily standup tomorrow
3. Story implementation placeholders created under `docs/implementation-artifacts/stories/`
