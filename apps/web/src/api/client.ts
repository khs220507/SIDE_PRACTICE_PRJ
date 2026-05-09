import { devicesSchema, eventsSchema, rulesSchema, telemetrySchema } from './schemas';

async function getJson(path: string) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

export async function getDevices() {
  return devicesSchema.parse(await getJson('/api/devices'));
}

export async function getDevice(deviceId: string) {
  const devices = await getDevices();
  const device = devices.find((item) => item.id === deviceId);

  if (!device) {
    throw new Error('Device not found');
  }

  return device;
}

export async function getTelemetry(deviceId?: string) {
  const telemetry = telemetrySchema.parse(await getJson('/api/telemetry'));
  return deviceId ? telemetry.filter((point) => point.deviceId === deviceId) : telemetry;
}

export async function getEvents() {
  return eventsSchema.parse(await getJson('/api/events'));
}

export async function getRules() {
  return rulesSchema.parse(await getJson('/api/rules'));
}

