# Repository Instructions

This repository follows the harness-first engineering workflow described in [docs/HARNESS_ENGINEERING.md](docs/HARNESS_ENGINEERING.md).

When working in this repository:

- Define the behavior contract before implementing non-trivial features.
- Build or extend a test harness, simulator, fixture, mock, or verification script before production implementation when practical.
- For frontend work, cover loading, empty, error, and success states when relevant.
- For backend work, verify request validation, response shape, and database behavior when relevant.
- For STM32 or device work, use a fake device or telemetry simulator before requiring real hardware.
- Run the relevant verification command before finishing and report anything that could not be verified.
- Keep changes scoped and avoid unrelated refactors.

