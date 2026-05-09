import { TelemetrySimulator } from './telemetrySimulator';

const simulator = new TelemetrySimulator();
let cachedSnapshot: ReturnType<TelemetrySimulator['snapshot']> | undefined;
let cacheExpiresAt = 0;

function currentSnapshot() {
  if (!cachedSnapshot || Date.now() > cacheExpiresAt) {
    cachedSnapshot = simulator.snapshot();
    cacheExpiresAt = Date.now() + 750;
  }

  return cachedSnapshot;
}

const routes: Record<string, () => unknown> = {
  '/api/devices': () => currentSnapshot().devices,
  '/api/telemetry': () => currentSnapshot().telemetry,
  '/api/events': () => currentSnapshot().events,
  '/api/rules': () => currentSnapshot().rules
};

export const worker = {
  async start() {
    const originalFetch = window.fetch.bind(window);

    window.fetch = async (input, init) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.pathname : input.url;
      const path = new URL(url, window.location.origin).pathname;

      if (init?.method && init.method !== 'GET') {
        return originalFetch(input, init);
      }

      if (path in routes) {
        return Response.json(routes[path]());
      }

      return originalFetch(input, init);
    };
  }
};
