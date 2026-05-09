from datetime import datetime
from enum import StrEnum
from typing import Annotated

from pydantic import BaseModel, Field, field_validator


NonEmptyString = Annotated[str, Field(min_length=1)]


class ConnectionType(StrEnum):
    HTTP = "http"
    MQTT = "mqtt"
    GATEWAY = "gateway"


class DeviceStatus(StrEnum):
    ONLINE = "online"
    OFFLINE = "offline"
    WARNING = "warning"


class EventSeverity(StrEnum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


class RuleOperator(StrEnum):
    GT = ">"
    GTE = ">="
    LT = "<"
    LTE = "<="
    EQ = "="


class DeviceCreate(BaseModel):
    name: NonEmptyString
    serialNumber: NonEmptyString
    firmwareVersion: NonEmptyString = "0.1.0"
    hardwareType: NonEmptyString
    connectionType: ConnectionType = ConnectionType.HTTP
    location: NonEmptyString


class Device(DeviceCreate):
    id: NonEmptyString
    status: DeviceStatus
    lastSeenAt: datetime | None = None
    createdAt: datetime
    updatedAt: datetime


class DeviceCreateResponse(Device):
    apiKey: NonEmptyString


class TelemetryReadingIn(BaseModel):
    metric: NonEmptyString
    value: float
    unit: NonEmptyString

    @field_validator("metric")
    @classmethod
    def metric_must_be_machine_safe(cls, value: str) -> str:
        if not value.replace("_", "").replace("-", "").isalnum():
            raise ValueError("metric must use letters, numbers, dash, or underscore")
        return value


class TelemetryIngestRequest(BaseModel):
    deviceId: NonEmptyString
    firmwareVersion: NonEmptyString
    timestamp: datetime
    readings: list[TelemetryReadingIn] = Field(min_length=1, max_length=64)


class TelemetryPoint(BaseModel):
    id: NonEmptyString
    deviceId: NonEmptyString
    metric: NonEmptyString
    value: float
    unit: NonEmptyString
    recordedAt: datetime
    receivedAt: datetime


class TelemetryIngestResponse(BaseModel):
    deviceId: NonEmptyString
    accepted: int
    receivedAt: datetime


class DeviceEvent(BaseModel):
    id: NonEmptyString
    deviceId: NonEmptyString
    type: NonEmptyString
    message: NonEmptyString
    severity: EventSeverity
    createdAt: datetime


class Rule(BaseModel):
    id: NonEmptyString
    deviceId: NonEmptyString
    metric: NonEmptyString
    operator: RuleOperator
    threshold: float
    enabled: bool
