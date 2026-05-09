from datetime import datetime, timezone

from app.simulator import SimulatorConfig, build_payload, run_simulator


def fixed_clock() -> datetime:
    return datetime(2026, 5, 9, 13, 30, 0, tzinfo=timezone.utc)


def test_build_payload_uses_ingest_contract_shape() -> None:
    config = SimulatorConfig(
        base_url="http://127.0.0.1:8000",
        device_id="stm32-demo-001",
        api_key="dev-demo-key-001",
        firmware_version="0.1.2",
        interval_seconds=1.0,
        count=1,
    )

    payload = build_payload(config, sequence=3, clock=fixed_clock)

    assert payload["deviceId"] == "stm32-demo-001"
    assert payload["firmwareVersion"] == "0.1.2"
    assert payload["timestamp"] == "2026-05-09T13:30:00+00:00"
    assert payload["readings"] == [
        {"metric": "temperature", "value": 25.7, "unit": "celsius"},
        {"metric": "humidity", "value": 53.5, "unit": "percent"},
    ]


def test_run_simulator_sends_payloads_periodically_with_device_auth() -> None:
    config = SimulatorConfig(
        base_url="http://api.test/",
        device_id="stm32-demo-001",
        api_key="dev-demo-key-001",
        firmware_version="0.1.2",
        interval_seconds=2.5,
        count=2,
    )
    sent: list[tuple[str, str, dict[str, object]]] = []
    sleeps: list[float] = []

    def fake_sender(url: str, api_key: str, payload: dict[str, object]) -> None:
        sent.append((url, api_key, payload))

    run_simulator(config, sender=fake_sender, sleeper=sleeps.append, clock=fixed_clock)

    assert len(sent) == 2
    assert sent[0][0] == "http://api.test/ingest/telemetry"
    assert sent[0][1] == "dev-demo-key-001"
    assert sent[0][2]["readings"] != sent[1][2]["readings"]
    assert sleeps == [2.5]
