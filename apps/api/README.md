# SIDE IoT API

FastAPI backend for the STM32-oriented IoT dashboard.

## Contract

The initial backend contract is documented in `../../docs/backend/FASTAPI_CONTRACT.md`.

## Setup

```txt
cd apps/api
python -m venv .venv
.venv\Scripts\activate
python -m pip install -e ".[test]"
```

## Run

```txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Verify

```txt
.venv\Scripts\python.exe -m pytest
```

## Simulate telemetry

Start the API first, then run the fake STM32 sender:

```txt
python -m app.simulator --interval 2
```

Send a finite burst for verification:

```txt
python -m app.simulator --count 3 --interval 1
```

Demo device ingest key:

```txt
Authorization: Device dev-demo-key-001
```
