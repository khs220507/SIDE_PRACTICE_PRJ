import { describe, expect, it } from 'vitest';
import { devicesSchema, telemetrySchema } from './schemas';
import { devices, telemetry } from '../fixtures/iotFixtures';

describe('IoT API schemas', () => {
  it('accepts the device fixture contract', () => {
    expect(devicesSchema.parse(devices)).toHaveLength(3);
  });

  it('accepts the telemetry fixture contract', () => {
    expect(telemetrySchema.parse(telemetry)[0]).toMatchObject({
      deviceId: 'stm32-demo-001',
      metric: 'temperature',
      unit: 'celsius'
    });
  });

  it('rejects malformed device status values', () => {
    expect(() =>
      devicesSchema.parse([
        {
          ...devices[0],
          status: 'booting'
        }
      ])
    ).toThrow();
  });
});

