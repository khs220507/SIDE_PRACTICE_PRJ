from __future__ import annotations

import argparse
import json
import math
import time
from collections.abc import Callable
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any
from urllib import error, request


Clock = Callable[[], datetime]
Payload = dict[str, Any]
Sender = Callable[[str, str, Payload], None]
Sleeper = Callable[[float], None]


@dataclass(frozen=True)
class SimulatorConfig:
    base_url: str
    device_id: str
    api_key: str
    firmware_version: str
    interval_seconds: float
    count: int | None


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def build_payload(config: SimulatorConfig, sequence: int, clock: Clock = utc_now) -> Payload:
    timestamp = clock()
    phase = sequence / 3
    temperature = round(24.5 + math.sin(phase) * 1.4, 1)
    humidity = round(52.0 + math.cos(phase) * 2.7, 1)
    return {
        "deviceId": config.device_id,
        "firmwareVersion": config.firmware_version,
        "timestamp": timestamp.isoformat(),
        "readings": [
            {"metric": "temperature", "value": temperature, "unit": "celsius"},
            {"metric": "humidity", "value": humidity, "unit": "percent"},
        ],
    }


def post_telemetry(url: str, api_key: str, payload: Payload) -> None:
    body = json.dumps(payload).encode("utf-8")
    ingest_request = request.Request(
        url,
        data=body,
        headers={
            "Authorization": f"Device {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with request.urlopen(ingest_request, timeout=5) as response:
            if response.status != 202:
                raise RuntimeError(f"unexpected ingest status {response.status}")
    except error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"ingest failed with HTTP {exc.code}: {detail}") from exc
    except error.URLError as exc:
        raise RuntimeError(f"ingest request failed: {exc.reason}") from exc


def run_simulator(
    config: SimulatorConfig,
    sender: Sender = post_telemetry,
    sleeper: Sleeper = time.sleep,
    clock: Clock = utc_now,
) -> None:
    ingest_url = f"{config.base_url.rstrip('/')}/ingest/telemetry"
    sequence = 0
    while config.count is None or sequence < config.count:
        payload = build_payload(config, sequence, clock)
        sender(ingest_url, config.api_key, payload)
        sequence += 1
        if config.count is None or sequence < config.count:
            sleeper(config.interval_seconds)


def parse_args() -> SimulatorConfig:
    parser = argparse.ArgumentParser(description="Send fake STM32 telemetry to the SIDE IoT API.")
    parser.add_argument("--base-url", default="http://127.0.0.1:8000")
    parser.add_argument("--device-id", default="stm32-demo-001")
    parser.add_argument("--api-key", default="dev-demo-key-001")
    parser.add_argument("--firmware-version", default="0.1.2")
    parser.add_argument("--interval", type=float, default=2.0, dest="interval_seconds")
    parser.add_argument("--count", type=int, default=None)
    args = parser.parse_args()
    if args.interval_seconds <= 0:
        parser.error("--interval must be greater than 0")
    if args.count is not None and args.count <= 0:
        parser.error("--count must be greater than 0")
    return SimulatorConfig(
        base_url=args.base_url,
        device_id=args.device_id,
        api_key=args.api_key,
        firmware_version=args.firmware_version,
        interval_seconds=args.interval_seconds,
        count=args.count,
    )


def main() -> None:
    run_simulator(parse_args())


if __name__ == "__main__":
    main()
