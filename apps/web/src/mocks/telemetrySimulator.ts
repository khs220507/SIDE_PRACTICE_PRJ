import type { Device, DeviceEvent, Rule, TelemetryPoint } from '../api/schemas';
import { devices as fixtureDevices, events as fixtureEvents, rules as fixtureRules } from '../fixtures/iotFixtures';

type SimulatorSnapshot = {
  devices: Device[];
  telemetry: TelemetryPoint[];
  events: DeviceEvent[];
  rules: Rule[];
};

type SimulatorOptions = {
  baseTime?: Date;
  maxTelemetryPoints?: number;
};

const metricsByDevice = [
  { deviceId: 'stm32-demo-001', temperatureBase: 24.8, humidityBase: 53.5 },
  { deviceId: 'stm32-demo-002', temperatureBase: 28.2, humidityBase: 66.2 },
  { deviceId: 'stm32-demo-003', temperatureBase: 19.4, humidityBase: 61.8 }
];

export class TelemetrySimulator {
  private tick = 0;
  private currentTime: Date;
  private readonly maxTelemetryPoints: number;
  private readonly telemetry: TelemetryPoint[] = [];
  private readonly events: DeviceEvent[] = [...fixtureEvents];

  constructor(options: SimulatorOptions = {}) {
    this.currentTime = options.baseTime ?? new Date();
    this.maxTelemetryPoints = options.maxTelemetryPoints ?? 48;
  }

  snapshot(): SimulatorSnapshot {
    this.advance();

    return {
      devices: this.devices(),
      telemetry: [...this.telemetry],
      events: [...this.events].slice(-12).reverse(),
      rules: [...fixtureRules]
    };
  }

  private advance() {
    this.tick += 1;
    this.currentTime = new Date(this.currentTime.getTime() + 5_000);

    for (const profile of metricsByDevice) {
      const phase = this.tick / 3;
      const temperature = round(profile.temperatureBase + Math.sin(phase) * 1.8 + this.tick * 0.03);
      const humidity = round(profile.humidityBase + Math.cos(phase) * 2.4);

      this.telemetry.push(
        this.point(profile.deviceId, 'temperature', temperature, 'celsius'),
        this.point(profile.deviceId, 'humidity', humidity, 'percent')
      );

      if (profile.deviceId === 'stm32-demo-002' && humidity >= 67.5 && this.tick % 3 === 0) {
        this.events.push({
          id: `evt-sim-${this.tick}`,
          deviceId: profile.deviceId,
          type: 'threshold',
          message: `Humidity reached ${humidity}%`,
          severity: 'warning',
          createdAt: this.currentTime.toISOString()
        });
      }
    }

    while (this.telemetry.length > this.maxTelemetryPoints) {
      this.telemetry.shift();
    }
  }

  private point(deviceId: string, metric: string, value: number, unit: string): TelemetryPoint {
    return {
      deviceId,
      metric,
      value,
      unit,
      recordedAt: this.currentTime.toISOString()
    };
  }

  private devices(): Device[] {
    return fixtureDevices.map((device) => {
      if (device.id === 'stm32-demo-003') {
        return {
          ...device,
          status: this.tick % 6 === 0 ? 'online' : 'offline',
          lastSeenAt: this.tick % 6 === 0 ? this.currentTime.toISOString() : device.lastSeenAt
        };
      }

      if (device.id === 'stm32-demo-002') {
        return {
          ...device,
          status: this.tick % 4 === 0 ? 'warning' : 'online',
          lastSeenAt: this.currentTime.toISOString()
        };
      }

      return {
        ...device,
        status: 'online',
        lastSeenAt: this.currentTime.toISOString()
      };
    });
  }
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

