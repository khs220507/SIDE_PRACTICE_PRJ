import { describe, expect, it } from 'vitest';
import { TelemetrySimulator } from './telemetrySimulator';

describe('TelemetrySimulator', () => {
  it('returns advancing telemetry snapshots', () => {
    const simulator = new TelemetrySimulator({
      baseTime: new Date('2026-05-09T12:00:00.000Z'),
      maxTelemetryPoints: 20
    });

    const first = simulator.snapshot();
    const second = simulator.snapshot();

    expect(first.telemetry.length).toBeGreaterThan(0);
    expect(second.telemetry.length).toBeGreaterThan(first.telemetry.length);
    expect(new Date(second.telemetry.at(-1)!.recordedAt).getTime()).toBeGreaterThan(
      new Date(first.telemetry.at(-1)!.recordedAt).getTime()
    );
    expect(second.devices.find((device) => device.id === 'stm32-demo-001')?.lastSeenAt).not.toEqual(
      first.devices.find((device) => device.id === 'stm32-demo-001')?.lastSeenAt
    );
  });
});

