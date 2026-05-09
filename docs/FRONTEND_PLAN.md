# Frontend Plan

## 1. Stack Decision

Use the following stack for the first frontend implementation:

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Zod
- MSW
- Vitest
- React Testing Library
- Playwright
- Recharts
- Tailwind CSS

This stack is intentionally mainstream for hiring while still fitting an embedded and IoT product. React, TypeScript, Vite, routing, data fetching, testing, and charting are common in commercial frontend roles. MSW and Playwright support the harness-first workflow by allowing the UI to be verified against simulated backend and device data before real STM32 hardware exists.

## 2. Embedded and IoT Fit

The frontend should treat STM32 devices as remote data producers, not as browser-coupled hardware.

Initial integration path:

```txt
Mock API / MSW fixtures
  -> Frontend queries
  -> Dashboard, device list, device detail, events
```

Later integration path:

```txt
STM32 or gateway
  -> HTTP or MQTT ingest
  -> Backend API
  -> Server-Sent Events or WebSocket
  -> Frontend realtime telemetry
```

The frontend should consume stable API contracts and remain independent from the final hardware transport.

## 3. Initial Frontend Contract

### Screens

- `/login`
- `/dashboard`
- `/devices`
- `/devices/:id`
- `/events`
- `/rules`
- `/settings`

### Required UI States

Each data-driven screen should define:

- Loading state
- Empty state
- Error state
- Success state

### Initial Data Contracts

The first web app should validate API-like data with shared frontend schemas:

- `Device`
- `TelemetryReading`
- `DeviceTelemetryPoint`
- `Event`
- `Rule`

These schemas can later move into `packages/shared` when the backend is introduced.

## 4. Harness-First Plan

Before adding production backend integration, the frontend should use:

- Fixture data for devices, telemetry, events, and rules
- MSW request handlers that return success, empty, and error responses
- Component tests for stateful UI
- Playwright tests for core navigation and dashboard workflows

Initial verification commands:

```txt
npm run typecheck -w apps/web
npm run test -w apps/web
npm run e2e -w apps/web
```

Until dependencies are installed, repository-level structural verification can check that the required app, fixture, and test files exist.

## 5. MVP Frontend Milestones

### Milestone 1: Mocked Operational Shell

- Add app shell and navigation
- Add routes for MVP screens
- Add fixture-backed API client
- Add fake STM32 telemetry simulator for dynamic local data
- Add dashboard cards and telemetry chart
- Verify navigation with Playwright

### Milestone 2: Device Workflows

- Add device list
- Add device detail page
- Add telemetry history section
- Add loading, empty, error, and success states
- Verify with MSW and component tests

### Milestone 3: Events and Rules

- Add event log
- Add basic alert rule list
- Add empty and error states
- Verify with component tests

### Milestone 4: Backend Swap

- Replace fixture API implementation with HTTP client
- Keep MSW as the contract harness
- Add request/response validation through Zod
