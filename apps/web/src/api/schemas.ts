import { z } from 'zod';

export const deviceSchema = z.object({
  id: z.string(),
  name: z.string(),
  serialNumber: z.string(),
  firmwareVersion: z.string(),
  hardwareType: z.string(),
  connectionType: z.enum(['http', 'mqtt', 'gateway']),
  status: z.enum(['online', 'offline', 'warning']),
  location: z.string(),
  lastSeenAt: z.string()
});

export const telemetryPointSchema = z.object({
  deviceId: z.string(),
  metric: z.string(),
  value: z.number(),
  unit: z.string(),
  recordedAt: z.string()
});

export const eventSchema = z.object({
  id: z.string(),
  deviceId: z.string(),
  type: z.string(),
  message: z.string(),
  severity: z.enum(['info', 'warning', 'critical']),
  createdAt: z.string()
});

export const ruleSchema = z.object({
  id: z.string(),
  deviceId: z.string(),
  metric: z.string(),
  operator: z.enum(['>', '>=', '<', '<=', '=']),
  threshold: z.number(),
  enabled: z.boolean()
});

export const devicesSchema = z.array(deviceSchema);
export const telemetrySchema = z.array(telemetryPointSchema);
export const eventsSchema = z.array(eventSchema);
export const rulesSchema = z.array(ruleSchema);

export type Device = z.infer<typeof deviceSchema>;
export type TelemetryPoint = z.infer<typeof telemetryPointSchema>;
export type DeviceEvent = z.infer<typeof eventSchema>;
export type Rule = z.infer<typeof ruleSchema>;

