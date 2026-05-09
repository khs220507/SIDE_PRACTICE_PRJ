# Frontend Harness

## Behavior Contract

The initial frontend must:

- Render `/dashboard` without a real backend.
- Load devices, telemetry, events, and rules from contract-compatible mock handlers.
- Return dynamic browser mock data from a fake STM32 telemetry simulator during local development.
- Validate fixture shapes with Zod schemas.
- Show loading, empty, error, and success states in data-driven pages.
- Let an operator navigate from dashboard to device list and then to a device detail page.

## Harness Assets

- `apps/web/src/fixtures/iotFixtures.ts`
- `apps/web/src/mocks/handlers.ts`
- `apps/web/src/mocks/browser.ts`
- `apps/web/src/mocks/telemetrySimulator.ts`
- `apps/web/src/mocks/telemetrySimulator.test.ts`
- `apps/web/src/api/schemas.test.ts`
- `apps/web/src/pages/DashboardPage.test.tsx`
- `apps/web/src/pages/DevicesPage.test.tsx`
- `apps/web/tests/e2e/navigation.spec.ts`

## Verification Commands

After installing dependencies:

```txt
npm run typecheck -w apps/web
npm run test -w apps/web
npm run e2e -w apps/web
```

The first implementation also includes a structural check from the repository root:

```txt
Test-Path apps/web/src/mocks/handlers.ts
Test-Path apps/web/src/fixtures/iotFixtures.ts
Test-Path apps/web/tests/e2e/navigation.spec.ts
```
