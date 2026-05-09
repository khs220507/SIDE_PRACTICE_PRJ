from datetime import datetime, timezone

from fastapi.testclient import TestClient

from app.main import create_app
from app.repository import InMemoryRepository


FIXED_NOW = datetime(2026, 5, 9, 13, 5, 0, tzinfo=timezone.utc)


def fixed_clock() -> datetime:
    return FIXED_NOW


def make_client() -> TestClient:
    repository = InMemoryRepository(clock=fixed_clock)
    repository.seed_demo_data()
    return TestClient(create_app(repository=repository, clock=fixed_clock))


def test_health_check_returns_ok() -> None:
    client = make_client()

    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_list_devices_returns_frontend_compatible_shape_without_api_keys() -> None:
    client = make_client()

    response = client.get("/api/devices")
    plan_alias_response = client.get("/devices")

    assert response.status_code == 200
    assert plan_alias_response.status_code == 200
    devices = response.json()
    assert plan_alias_response.json()[0]["id"] == "stm32-demo-001"
    assert devices[0]["id"] == "stm32-demo-001"
    assert devices[0]["connectionType"] == "http"
    assert devices[0]["status"] == "online"
    assert "apiKey" not in devices[0]


def test_create_device_returns_device_and_one_time_api_key() -> None:
    client = make_client()

    response = client.post(
        "/api/devices",
        json={
            "name": "Pump Controller",
            "serialNumber": "STM32G431-0042",
            "firmwareVersion": "0.1.0",
            "hardwareType": "STM32G431",
            "connectionType": "http",
            "location": "Factory B / Pump Room",
        },
    )

    assert response.status_code == 201
    body = response.json()
    assert body["id"] == "stm32g431-0042"
    assert body["status"] == "offline"
    assert body["apiKey"].startswith("dev-")


def test_ingest_telemetry_accepts_valid_device_payload_and_updates_device_state() -> None:
    client = make_client()

    response = client.post(
        "/ingest/telemetry",
        headers={"Authorization": "Device dev-demo-key-001"},
        json={
            "deviceId": "stm32-demo-001",
            "firmwareVersion": "0.1.2",
            "timestamp": "2026-05-09T22:04:30+09:00",
            "readings": [
                {"metric": "temperature", "value": 26.4, "unit": "celsius"},
                {"metric": "humidity", "value": 51.0, "unit": "percent"},
            ],
        },
    )

    assert response.status_code == 202
    assert response.headers["location"] == "/api/devices/stm32-demo-001/telemetry"
    assert response.json() == {
        "deviceId": "stm32-demo-001",
        "accepted": 2,
        "receivedAt": "2026-05-09T13:05:00Z",
    }

    telemetry = client.get("/api/devices/stm32-demo-001/telemetry").json()
    assert telemetry[-1]["metric"] == "humidity"
    assert telemetry[-1]["recordedAt"] == "2026-05-09T22:04:30+09:00"
    assert telemetry[-1]["receivedAt"] == "2026-05-09T13:05:00Z"

    device = client.get("/api/devices/stm32-demo-001").json()
    assert device["firmwareVersion"] == "0.1.2"
    assert device["lastSeenAt"] == "2026-05-09T13:05:00Z"
    assert device["status"] == "online"


def test_ingest_telemetry_rejects_missing_or_bad_device_auth() -> None:
    client = make_client()

    missing_auth = client.post(
        "/ingest/telemetry",
        json={
            "deviceId": "stm32-demo-001",
            "firmwareVersion": "0.1.2",
            "timestamp": "2026-05-09T22:04:30+09:00",
            "readings": [{"metric": "temperature", "value": 26.4, "unit": "celsius"}],
        },
    )
    assert missing_auth.status_code == 401

    mismatched_device = client.post(
        "/ingest/telemetry",
        headers={"Authorization": "Device dev-demo-key-001"},
        json={
            "deviceId": "stm32-demo-002",
            "firmwareVersion": "0.1.2",
            "timestamp": "2026-05-09T22:04:30+09:00",
            "readings": [{"metric": "humidity", "value": 51.0, "unit": "percent"}],
        },
    )
    assert mismatched_device.status_code == 403


def test_ingest_telemetry_rejects_malformed_device_payload() -> None:
    client = make_client()

    response = client.post(
        "/ingest/telemetry",
        headers={"Authorization": "Device dev-demo-key-001"},
        json={
            "deviceId": "stm32-demo-001",
            "firmwareVersion": "0.1.2",
            "timestamp": "not-a-date",
            "readings": [{"metric": "bad metric name", "value": "hot", "unit": ""}],
        },
    )

    assert response.status_code == 422
