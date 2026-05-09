# Run Commands

This project has three runnable pieces:

- API backend: FastAPI server on port `8000`
- Device simulator: fake STM32 telemetry sender that posts to the API
- Web frontend: Vite dev server on port `5173`

Run commands from the repository root: `C:\workspace\SIDE_IOT_PROJECT`.

## Prerequisites

Install dependencies once if the local environments do not exist yet:

```powershell
npm install
cd apps/api
python -m venv .venv
.venv\Scripts\python.exe -m pip install -e ".[test]"
cd ..\..
```

## Verify Before Running

```powershell
npm run api:test
npm run typecheck
npm run test
```

## Run Backend

Start the FastAPI backend:

```powershell
npm run api:dev
```

Backend URLs:

- Health: `http://127.0.0.1:8000/health`
- API docs: `http://127.0.0.1:8000/docs`
- Devices: `http://127.0.0.1:8000/api/devices`

## Run Device Simulator

Start the API first, then send fake STM32 telemetry:

```powershell
npm run api:simulate -- --interval 2
```

Send a finite verification burst:

```powershell
npm run api:simulate -- --count 3 --interval 1
```

The default simulator uses:

- Device ID: `stm32-demo-001`
- Device key: `dev-demo-key-001`
- API base URL: `http://127.0.0.1:8000`

## Run Frontend

Start the Vite frontend:

```powershell
npm run dev -w apps/web
```

Frontend URL:

- `http://127.0.0.1:5173`

In development mode, the frontend currently serves its own browser-side mock IoT data for `GET /api/*` requests. The backend and device simulator still run independently for API and ingest verification.

## Run Everything In Separate Terminals

Terminal 1:

```powershell
npm run api:dev
```

Terminal 2:

```powershell
npm run api:simulate -- --interval 2
```

Terminal 3:

```powershell
npm run dev -w apps/web
```

## Run Everything In The Background

Use this from the repository root when you want all three processes started by PowerShell:

```powershell
Start-Process powershell -WindowStyle Hidden -ArgumentList '-NoExit','-Command','cd C:\workspace\SIDE_IOT_PROJECT; npm run api:dev'
Start-Process powershell -WindowStyle Hidden -ArgumentList '-NoExit','-Command','cd C:\workspace\SIDE_IOT_PROJECT; npm run api:simulate -- --interval 2'
Start-Process powershell -WindowStyle Hidden -ArgumentList '-NoExit','-Command','cd C:\workspace\SIDE_IOT_PROJECT; npm run dev -w apps/web'
```

## Stop Background Processes

Find Node and Python processes related to the project:

```powershell
Get-CimInstance Win32_Process |
  Where-Object { $_.CommandLine -match 'SIDE_IOT_PROJECT|uvicorn|vite|app.simulator' } |
  Select-Object ProcessId, Name, CommandLine
```

Stop only the project processes you intend to stop:

```powershell
Stop-Process -Id <PROCESS_ID>
```

If Windows blocks `Get-CimInstance`, use the less detailed process list:

```powershell
Get-Process node,python,powershell -ErrorAction SilentlyContinue |
  Select-Object Id, ProcessName, StartTime
```
