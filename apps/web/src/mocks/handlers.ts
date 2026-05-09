import { http, HttpResponse } from 'msw';
import { devices, events, rules, telemetry } from '../fixtures/iotFixtures';

export const handlers = [
  http.get('/api/devices', () => HttpResponse.json(devices)),
  http.get('/api/telemetry', () => HttpResponse.json(telemetry)),
  http.get('/api/events', () => HttpResponse.json(events)),
  http.get('/api/rules', () => HttpResponse.json(rules))
];

