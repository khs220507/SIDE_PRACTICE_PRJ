from collections.abc import Callable
from datetime import datetime

from fastapi import Depends, FastAPI, Header, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware

from .repository import Clock, InMemoryRepository, utc_now
from .schemas import (
    Device,
    DeviceCreate,
    DeviceCreateResponse,
    DeviceEvent,
    Rule,
    TelemetryIngestRequest,
    TelemetryIngestResponse,
    TelemetryPoint,
)


def create_app(repository: InMemoryRepository | None = None, clock: Clock = utc_now) -> FastAPI:
    repo = repository or InMemoryRepository(clock=clock)
    if repository is None:
        repo.seed_demo_data()

    app = FastAPI(title="SIDE IoT API", version="0.1.0")
    app.state.repository = repo
    app.state.clock = clock

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    def get_repository() -> InMemoryRepository:
        return app.state.repository

    def get_clock() -> Callable[[], datetime]:
        return app.state.clock

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.get("/devices", response_model=list[Device], include_in_schema=False)
    @app.get("/api/devices", response_model=list[Device])
    def list_devices(repo: InMemoryRepository = Depends(get_repository)) -> list[Device]:
        return repo.list_devices()

    @app.post("/devices", response_model=DeviceCreateResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
    @app.post("/api/devices", response_model=DeviceCreateResponse, status_code=status.HTTP_201_CREATED)
    def create_device(request: DeviceCreate, repo: InMemoryRepository = Depends(get_repository)) -> DeviceCreateResponse:
        try:
            return repo.create_device(request)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc

    @app.get("/devices/{device_id}", response_model=Device, include_in_schema=False)
    @app.get("/api/devices/{device_id}", response_model=Device)
    def get_device(device_id: str, repo: InMemoryRepository = Depends(get_repository)) -> Device:
        device = repo.get_device(device_id)
        if device is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="device not found")
        return device

    @app.post("/ingest/telemetry", response_model=TelemetryIngestResponse, status_code=status.HTTP_202_ACCEPTED)
    def ingest_telemetry(
        request: TelemetryIngestRequest,
        response: Response,
        authorization: str | None = Header(default=None),
        repo: InMemoryRepository = Depends(get_repository),
        clock: Callable[[], datetime] = Depends(get_clock),
    ) -> TelemetryIngestResponse:
        authenticated_device_id = repo.authenticate_device_key(authorization)
        if authenticated_device_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid device credentials")
        if authenticated_device_id != request.deviceId:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="device credentials do not match payload")
        if repo.get_device(request.deviceId) is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="device not found")

        received_at = clock()
        points = repo.ingest_telemetry(request, received_at)
        response.headers["Location"] = f"/api/devices/{request.deviceId}/telemetry"
        return TelemetryIngestResponse(deviceId=request.deviceId, accepted=len(points), receivedAt=received_at)

    @app.get("/telemetry", response_model=list[TelemetryPoint], include_in_schema=False)
    @app.get("/api/telemetry", response_model=list[TelemetryPoint])
    def list_telemetry(repo: InMemoryRepository = Depends(get_repository)) -> list[TelemetryPoint]:
        return repo.list_telemetry()

    @app.get("/devices/{device_id}/telemetry", response_model=list[TelemetryPoint], include_in_schema=False)
    @app.get("/api/devices/{device_id}/telemetry", response_model=list[TelemetryPoint])
    def list_device_telemetry(device_id: str, repo: InMemoryRepository = Depends(get_repository)) -> list[TelemetryPoint]:
        if repo.get_device(device_id) is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="device not found")
        return repo.list_telemetry(device_id)

    @app.get("/events", response_model=list[DeviceEvent], include_in_schema=False)
    @app.get("/api/events", response_model=list[DeviceEvent])
    def list_events(repo: InMemoryRepository = Depends(get_repository)) -> list[DeviceEvent]:
        return repo.events

    @app.get("/rules", response_model=list[Rule], include_in_schema=False)
    @app.get("/api/rules", response_model=list[Rule])
    def list_rules(repo: InMemoryRepository = Depends(get_repository)) -> list[Rule]:
        return repo.rules

    return app


app = create_app()
