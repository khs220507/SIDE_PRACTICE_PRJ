import type { Device, DeviceEvent, Rule, TelemetryPoint } from '../api/schemas';

export const devices: Device[] = [
  {
    id: 'stm32-demo-001',
    name: 'Boiler Room Sensor',
    serialNumber: 'STM32F407-0001',
    firmwareVersion: '0.1.0',
    hardwareType: 'STM32F407',
    connectionType: 'http',
    status: 'online',
    location: 'Factory A / B1',
    lastSeenAt: '2026-05-09T21:58:00+09:00'
  },
  {
    id: 'stm32-demo-002',
    name: 'Line 2 Humidity Node',
    serialNumber: 'STM32L476-0002',
    firmwareVersion: '0.1.1',
    hardwareType: 'STM32L476',
    connectionType: 'gateway',
    status: 'warning',
    location: 'Factory A / Line 2',
    lastSeenAt: '2026-05-09T21:55:00+09:00'
  },
  {
    id: 'stm32-demo-003',
    name: 'Outdoor Gateway',
    serialNumber: 'STM32H743-0003',
    firmwareVersion: '0.0.9',
    hardwareType: 'STM32H743',
    connectionType: 'mqtt',
    status: 'offline',
    location: 'Yard / Gate',
    lastSeenAt: '2026-05-09T19:41:00+09:00'
  }
];

export const telemetry: TelemetryPoint[] = [
  { deviceId: 'stm32-demo-001', metric: 'temperature', value: 24.7, unit: 'celsius', recordedAt: '2026-05-09T21:50:00+09:00' },
  { deviceId: 'stm32-demo-001', metric: 'temperature', value: 25.1, unit: 'celsius', recordedAt: '2026-05-09T21:52:00+09:00' },
  { deviceId: 'stm32-demo-001', metric: 'temperature', value: 25.8, unit: 'celsius', recordedAt: '2026-05-09T21:54:00+09:00' },
  { deviceId: 'stm32-demo-001', metric: 'humidity', value: 53.2, unit: 'percent', recordedAt: '2026-05-09T21:54:00+09:00' },
  { deviceId: 'stm32-demo-002', metric: 'humidity', value: 69.5, unit: 'percent', recordedAt: '2026-05-09T21:55:00+09:00' },
  { deviceId: 'stm32-demo-002', metric: 'temperature', value: 28.2, unit: 'celsius', recordedAt: '2026-05-09T21:55:00+09:00' }
];

export const events: DeviceEvent[] = [
  {
    id: 'evt-001',
    deviceId: 'stm32-demo-002',
    type: 'threshold',
    message: 'Humidity exceeded rule threshold',
    severity: 'warning',
    createdAt: '2026-05-09T21:56:00+09:00'
  },
  {
    id: 'evt-002',
    deviceId: 'stm32-demo-003',
    type: 'heartbeat',
    message: 'Device missed heartbeat window',
    severity: 'critical',
    createdAt: '2026-05-09T20:05:00+09:00'
  }
];

export const rules: Rule[] = [
  { id: 'rule-001', deviceId: 'stm32-demo-001', metric: 'temperature', operator: '>=', threshold: 30, enabled: true },
  { id: 'rule-002', deviceId: 'stm32-demo-002', metric: 'humidity', operator: '>=', threshold: 65, enabled: true }
];

