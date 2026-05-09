# FastAPI Backend Contract

## Change Target

Add the first backend slice for the IoT dashboard using FastAPI. FastAPI is the required backend framework for this project.

## Input Contract

### Device Telemetry Ingest

```http
POST /ingest/telemetry
Authorization: Device <deviceApiKey>
Content-Type: application/json
```

```json
{
  "deviceId": "stm32-demo-001",
  "firmwareVersion": "0.1.0",
  "timestamp": "2026-05-09T12:00:00+09:00",
  "readings": [
    {
      "metric": "temperature",
      "value": 24.7,
      "unit": "celsius"
    }
  ]
}
```

## Output Contract

- `GET /health` returns `{ "status": "ok" }`.
- `GET /api/devices` returns dashboard-safe devices without API keys.
- `POST /api/devices` creates a device and returns the generated device API key once.
- `POST /ingest/telemetry` returns `202` with accepted reading count and `receivedAt`.
- `GET /api/devices/{deviceId}/telemetry` returns stored points with `recordedAt` and `receivedAt`.
- `GET /api/events` and `GET /api/rules` return MVP fixture-backed records.

## Normal Cases

- Known device with matching `Authorization: Device ...` key can ingest telemetry.
- Device `lastSeenAt`, `status`, and `firmwareVersion` update after telemetry ingest.
- Each reading is stored as an individual telemetry point.

## Failure Cases

- Missing or invalid device authorization returns `401`.
- Valid key used for another device returns `403`.
- Unknown device lookup returns `404`.
- Malformed telemetry payload returns `422`.
- Duplicate device creation returns `409`.

## Harness

The backend harness is `apps/api/tests/test_api_contract.py`.

It verifies request validation, response shapes, telemetry storage behavior, authentication failure behavior, and device state updates without requiring real STM32 hardware.

## Verification Command

```txt
python -m pytest apps/api
```

The local machine must have Python 3.11+ and the dependencies from `apps/api/pyproject.toml` installed.
