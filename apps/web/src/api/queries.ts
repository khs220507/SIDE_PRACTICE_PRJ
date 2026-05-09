import { useQuery } from '@tanstack/react-query';
import { getDevice, getDevices, getEvents, getRules, getTelemetry } from './client';

const liveQueryOptions = {
  refetchInterval: 2_000,
  refetchIntervalInBackground: true
};

export function useDevices() {
  return useQuery({ queryKey: ['devices'], queryFn: getDevices, ...liveQueryOptions });
}

export function useDevice(deviceId: string) {
  return useQuery({ queryKey: ['devices', deviceId], queryFn: () => getDevice(deviceId), ...liveQueryOptions });
}

export function useTelemetry(deviceId?: string) {
  return useQuery({ queryKey: ['telemetry', deviceId ?? 'all'], queryFn: () => getTelemetry(deviceId), ...liveQueryOptions });
}

export function useEvents() {
  return useQuery({ queryKey: ['events'], queryFn: getEvents, ...liveQueryOptions });
}

export function useRules() {
  return useQuery({ queryKey: ['rules'], queryFn: getRules });
}
