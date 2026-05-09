from collections.abc import Callable
from datetime import datetime, timezone
from uuid import uuid4

from .schemas import (
    ConnectionType,
    Device,
    DeviceCreate,
    DeviceCreateResponse,
    DeviceEvent,
    DeviceStatus,
    EventSeverity,
    Rule,
    RuleOperator,
    TelemetryIngestRequest,
    TelemetryPoint,
)


Clock = Callable[[], datetime]


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class InMemoryRepository:
    def __init__(self, clock: Clock = utc_now) -> None:
        self._clock = clock
        self.devices: dict[str, Device] = {}
        self.api_keys: dict[str, str] = {}
        self.telemetry: list[TelemetryPoint] = []
        self.events: list[DeviceEvent] = []
        self.rules: list[Rule] = []

    def seed_demo_data(self) -> None:
        now = self._clock()
        self._add_seed_device(
            Device(
                id="stm32-demo-001",
                name="Boiler Room Sensor",
                serialNumber="STM32F407-0001",
                firmwareVersion="0.1.0",
                hardwareType="STM32F407",
                connectionType=ConnectionType.HTTP,
                status=DeviceStatus.ONLINE,
                location="Factory A / B1",
                lastSeenAt=datetime.fromisoformat("2026-05-09T21:58:00+09:00"),
                createdAt=now,
                updatedAt=now,
            ),
            "dev-demo-key-001",
        )
        self._add_seed_device(
            Device(
                id="stm32-demo-002",
                name="Line 2 Humidity Node",
                serialNumber="STM32L476-0002",
                firmwareVersion="0.1.1",
                hardwareType="STM32L476",
                connectionType=ConnectionType.GATEWAY,
                status=DeviceStatus.WARNING,
                location="Factory A / Line 2",
                lastSeenAt=datetime.fromisoformat("2026-05-09T21:55:00+09:00"),
                createdAt=now,
                updatedAt=now,
            ),
            "dev-demo-key-002",
        )
        self.telemetry.extend(
            [
                self._telemetry_point("stm32-demo-001", "temperature", 24.7, "celsius", "2026-05-09T21:50:00+09:00", now),
                self._telemetry_point("stm32-demo-001", "humidity", 53.2, "percent", "2026-05-09T21:54:00+09:00", now),
                self._telemetry_point("stm32-demo-002", "humidity", 69.5, "percent", "2026-05-09T21:55:00+09:00", now),
            ]
        )
        self.events.append(
            DeviceEvent(
                id="evt-001",
                deviceId="stm32-demo-002",
                type="threshold",
                message="Humidity exceeded rule threshold",
                severity=EventSeverity.WARNING,
                createdAt=datetime.fromisoformat("2026-05-09T21:56:00+09:00"),
            )
        )
        self.rules.append(
            Rule(
                id="rule-001",
                deviceId="stm32-demo-001",
                metric="temperature",
                operator=RuleOperator.GTE,
                threshold=30,
                enabled=True,
            )
        )

    def list_devices(self) -> list[Device]:
        return list(self.devices.values())

    def get_device(self, device_id: str) -> Device | None:
        return self.devices.get(device_id)

    def create_device(self, request: DeviceCreate) -> DeviceCreateResponse:
        now = self._clock()
        device_id = self._make_device_id(request.serialNumber)
        if device_id in self.devices:
            raise ValueError("device already exists")

        device = Device(
            id=device_id,
            status=DeviceStatus.OFFLINE,
            lastSeenAt=None,
            createdAt=now,
            updatedAt=now,
            **request.model_dump(),
        )
        api_key = f"dev-{uuid4().hex}"
        self.devices[device.id] = device
        self.api_keys[api_key] = device.id
        return DeviceCreateResponse(**device.model_dump(), apiKey=api_key)

    def authenticate_device_key(self, authorization: str | None) -> str | None:
        if not authorization or not authorization.startswith("Device "):
            return None
        api_key = authorization.removeprefix("Device ").strip()
        return self.api_keys.get(api_key)

    def ingest_telemetry(self, request: TelemetryIngestRequest, received_at: datetime) -> list[TelemetryPoint]:
        device = self.devices[request.deviceId]
        points = [
            TelemetryPoint(
                id=f"tel-{uuid4().hex}",
                deviceId=request.deviceId,
                metric=reading.metric,
                value=reading.value,
                unit=reading.unit,
                recordedAt=request.timestamp,
                receivedAt=received_at,
            )
            for reading in request.readings
        ]
        self.telemetry.extend(points)
        self.devices[request.deviceId] = device.model_copy(
            update={
                "status": DeviceStatus.ONLINE,
                "firmwareVersion": request.firmwareVersion,
                "lastSeenAt": received_at,
                "updatedAt": received_at,
            }
        )
        return points

    def list_telemetry(self, device_id: str | None = None) -> list[TelemetryPoint]:
        if device_id is None:
            return self.telemetry
        return [point for point in self.telemetry if point.deviceId == device_id]

    def _add_seed_device(self, device: Device, api_key: str) -> None:
        self.devices[device.id] = device
        self.api_keys[api_key] = device.id

    def _telemetry_point(
        self,
        device_id: str,
        metric: str,
        value: float,
        unit: str,
        recorded_at: str,
        received_at: datetime,
    ) -> TelemetryPoint:
        return TelemetryPoint(
            id=f"tel-{uuid4().hex}",
            deviceId=device_id,
            metric=metric,
            value=value,
            unit=unit,
            recordedAt=datetime.fromisoformat(recorded_at),
            receivedAt=received_at,
        )

    def _make_device_id(self, serial_number: str) -> str:
        return serial_number.lower().replace("_", "-")
