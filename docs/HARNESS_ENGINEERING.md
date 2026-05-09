# Harness-First Engineering Guide

## 1. Purpose

This project uses a harness-first engineering workflow.

Codex and human contributors should avoid implementing features directly from vague requirements. Every meaningful feature should first define how it will be verified, then build or extend the required harness, and only then implement the production code.

The goal is to make frontend, backend, simulator, and future STM32 integration work predictable, testable, and replaceable.

## 2. Core Rule

Do not treat a feature as complete until there is a repeatable way to verify it.

The expected workflow is:

```txt
Requirement
  -> Contract
  -> Harness
  -> Failing verification
  -> Implementation
  -> Passing verification
  -> Small cleanup
```

## 3. What Counts as a Harness

A harness is any controlled environment, fixture, simulator, test, or script that proves a behavior works without relying on manual inspection alone.

Examples:

- Unit test
- Integration test
- API contract test
- Component test
- Playwright end-to-end test
- Mock API server
- Fixture data
- Seed data
- Fake STM32 telemetry client
- Telemetry simulator
- Storybook story
- CLI verification script
- Database test fixture

## 4. Required Planning Before Implementation

Before implementing a non-trivial feature, define:

- Change target
- Input contract
- Output contract
- Normal cases
- Failure cases
- Required mock, fixture, simulator, or test data
- Verification command
- Completion criteria

For small changes, this can be a short note in the implementation summary. For larger changes, update a project document or add a focused test plan.

## 5. Frontend Harness Rules

Frontend work should be backed by at least one of the following when practical:

- Component test for stateful UI behavior
- Playwright test for user workflows
- Mock API responses for loading, empty, success, and error states
- Fixture data for charts, tables, dashboards, and detail pages
- Visual/manual verification only when automated testing is not yet available

Frontend screens should account for:

- Loading state
- Empty state
- Error state
- Success state
- Slow or missing backend response
- Mobile and desktop layout constraints when relevant

## 6. Backend Harness Rules

Backend work should be backed by repeatable tests or scripts that verify:

- Request validation
- Authentication and authorization behavior when relevant
- Successful response shape
- Failure response shape
- Database writes or reads
- Idempotency or duplicate handling when relevant
- Error handling for malformed device input

For API features, prefer contract-like tests around request and response behavior.

## 7. STM32 and Device Integration Harness Rules

Real STM32 hardware should not be required for ordinary backend or frontend development.

Before real hardware integration, provide a fake device path:

```txt
Fake STM32 client
  -> Telemetry ingest endpoint
  -> Backend validation
  -> Database storage
  -> Dashboard update
```

The fake client should use the same public contract expected from the real STM32 device or gateway.

For device telemetry work, verify at least:

- Valid telemetry payload is accepted
- Invalid telemetry payload is rejected
- Unknown device behavior is defined
- Device `lastSeenAt` is updated when appropriate
- Telemetry is stored with both recorded and received timestamps

## 8. AI Feature Harness Rules

AI features must not be merged as untestable black boxes.

Before implementing AI behavior, define:

- Input dataset or fixture
- Expected output shape
- Acceptable uncertainty
- Failure mode
- Fallback behavior
- Human-readable explanation or trace when appropriate

For AI summaries, reports, or recommendations, keep deterministic fixtures and assert the structure even when exact wording is not fixed.

## 9. Docker and Environment Harness Rules

When Docker is introduced, the harness should include:

- Local startup command
- Health check path
- Database migration command
- Seed command when needed
- Verification command that proves the stack is usable

The project should avoid hidden manual setup steps.

## 10. Codex Working Rules

When Codex works in this repository, it should:

- Read the relevant code and documents first
- Define the harness before implementation for non-trivial changes
- Prefer extending existing tests over inventing unrelated checks
- Add fixtures, simulators, or scripts when tests need controlled input
- Run the relevant verification command before finishing
- Report any verification that could not be run
- Avoid unrelated refactors

## 11. Standard Prompt for Future Work

Use this prompt when asking Codex to implement a feature:

```txt
이 작업은 harness-first 방식으로 진행해줘.

구현 전에 먼저 다음을 정리해:
- 변경 대상
- 입력/출력 계약
- 검증할 정상 케이스
- 검증할 실패 케이스
- 필요한 mock/fixture/simulator
- 어떤 테스트로 완료를 판단할지

그다음 테스트 하네스를 먼저 만들고,
실패를 확인한 뒤 구현해서 통과시켜줘.
불필요한 리팩터링은 하지 말고, 기존 코드 스타일을 따라가.
```

Short version:

```txt
바로 구현하지 말고 테스트 하네스 먼저 만들고, 그 하네스를 통과하게 구현해줘.
```

## 12. Definition of Done

A task is done when:

- The intended behavior is implemented
- The harness verifies the behavior
- Relevant normal and failure cases are covered
- Verification commands were run successfully, or blockers are clearly documented
- The change stays within the requested scope

If a harness cannot be created yet, the final answer must explain why and describe the temporary manual verification path.
