# SIDE IoT Project Plan

## 1. Project Direction

This project starts as a frontend/backend-first IoT platform.

The STM32 hardware integration is part of the long-term product direction, but the first development phase should not depend on physical sensors being ready. The backend will define stable device and telemetry contracts first, while the frontend uses mock or simulated data.

The main goal is to build an IoT device management and telemetry dashboard that can later connect to STM32 devices through HTTP, MQTT, or a gateway.

## 2. Initial Product Scope

### MVP Goal

Build a working web platform where users can register devices, view telemetry data, inspect device status, and manage basic alert/event information.

The MVP should work without real STM32 hardware by using simulator-generated telemetry.

### Core MVP Features

- User login
- Device registration
- STM32-oriented device profile management
- Telemetry ingest API
- Sample telemetry generator
- Dashboard with recent sensor values and charts
- Device detail page
- Event and alert log
- Basic settings page

### Deferred Features

- Real STM32 firmware integration
- MQTT broker integration
- Remote command execution
- Dockerized deployment
- AI-based anomaly detection
- AI-generated operational reports
- Predictive maintenance features

## 3. Expected User Screens

- `/login`
- `/dashboard`
- `/devices`
- `/devices/:id`
- `/events`
- `/rules`
- `/settings`
- `/3d`

The first screen after login should be the operational dashboard, not a landing page.

The 3D screen should be used for device, harness, inspection rig, or sensor-layout visualization when the project needs spatial context.

## 4. High-Level Architecture

```txt
Frontend Web App
  -> Backend API
  -> PostgreSQL

Simulator
  -> HTTP Telemetry Ingest API
  -> Backend API
  -> PostgreSQL
  -> Realtime Updates
  -> Frontend Dashboard

Future STM32 Device or Gateway
  -> HTTP or MQTT
  -> Telemetry Ingest Layer
  -> Backend API
```

The ingest layer should be separated from the core telemetry service so future protocols can be added without rewriting the main application.

```txt
HTTP Ingest
MQTT Ingest
Simulator Ingest
        |
        v
Telemetry Service
        |
        v
Database
        |
        v
Dashboard / Alert / AI
```

## 5. STM32 Integration Direction

STM32 may connect to the platform through one of the following patterns:

- STM32 with Wi-Fi module
- STM32 with Ethernet module
- STM32 connected to a gateway through UART, RS485, CAN, or similar protocol

For the backend, these options should share the same telemetry contract whenever possible.

The first protocol target should be HTTP JSON because it is easier to test, simulate, and debug. MQTT can be added later as another ingest adapter.

## 6. Initial Telemetry Contract

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
    },
    {
      "metric": "humidity",
      "value": 53.2,
      "unit": "percent"
    }
  ]
}
```

## 7. Initial Backend APIs

```txt
POST /auth/login

GET /devices
POST /devices
GET /devices/:id
PATCH /devices/:id

POST /ingest/telemetry
GET /devices/:id/telemetry

GET /events
GET /rules
POST /rules
PATCH /rules/:id
```

Remote command APIs can be added after the telemetry and dashboard flow is stable.

## 8. Initial Data Model

### User

- `id`
- `email`
- `passwordHash`
- `role`
- `createdAt`
- `updatedAt`

### Device

- `id`
- `name`
- `serialNumber`
- `apiKeyHash`
- `firmwareVersion`
- `hardwareType`
- `connectionType`
- `status`
- `location`
- `lastSeenAt`
- `createdAt`
- `updatedAt`

### Telemetry

- `id`
- `deviceId`
- `metric`
- `value`
- `unit`
- `recordedAt`
- `receivedAt`

### Rule

- `id`
- `deviceId`
- `metric`
- `operator`
- `threshold`
- `enabled`
- `createdAt`
- `updatedAt`

### Event

- `id`
- `deviceId`
- `type`
- `message`
- `severity`
- `createdAt`

### Future DeviceCommand

- `id`
- `deviceId`
- `command`
- `payload`
- `status`
- `requestedAt`
- `acknowledgedAt`

## 9. Recommended Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Realtime updates through WebSocket or Server-Sent Events

### 3D Rendering

- Three.js as the core 3D rendering engine
- React Three Fiber for React integration
- Drei for common Three.js helpers, cameras, controls, and loaders
- GLTF/GLB as the preferred 3D model format
- Blender for creating or editing 3D assets
- Playwright screenshot checks for verifying that 3D scenes render correctly

3D rendering should be used for practical engineering views, not decorative hero sections. Initial targets include:

- Device placement visualization
- STM32 inspection rig visualization
- Harness or connector layout preview
- Sensor position view
- Realtime status overlay on 3D equipment models

### Backend

- Python
- FastAPI
- Pydantic request and response validation
- JWT authentication for users
- Device API-key authentication for STM32/gateway ingest
- PostgreSQL

### Later Additions

- Docker and Docker Compose
- MQTT broker
- Redis
- AI analysis service
- STM32 firmware and gateway integration

## 10. Suggested Repository Structure

```txt
apps/
  web/
  api/
packages/
  shared/
docs/
  PROJECT_PLAN.md
docker/
```

The shared package can contain common API types, telemetry DTOs, constants, and validation schemas.

## 11. Development Roadmap

### Phase 1: Frontend/FastAPI Backend MVP

- Create project structure
- Build authentication skeleton
- Build device CRUD
- Build telemetry ingest API
- Build dashboard with mock data
- Build device detail page

### Phase 2: Simulator and Realtime Dashboard

- Add sample telemetry generator
- Store telemetry in PostgreSQL
- Add realtime updates
- Add recent history charts
- Add event log generation
- Add an initial 3D device or rig visualization screen using mock data

### Phase 3: Docker Development Environment

- Add Docker Compose
- Containerize frontend, backend, and PostgreSQL
- Add environment variable documentation

### Phase 4: STM32 Integration

- Decide final device communication path
- Implement HTTP telemetry sender or gateway bridge
- Add device authentication
- Add firmware version tracking
- Add device heartbeat handling

### Phase 5: AI Features

- Add anomaly detection
- Add sensor trend summaries
- Add report generation
- Add alert rule recommendation

## 12. Current Decision

The first implementation should focus on the web platform and FastAPI backend contracts.

Hardware-specific details should be isolated behind ingest adapters so the frontend and core backend can progress before the STM32 side is finalized.
