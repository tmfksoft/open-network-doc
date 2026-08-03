import type { DeviceService } from '../fileformat/types'

/** Single port when the end is unset or matches the start, else the full range. */
export function formatServicePortRange(service: Pick<DeviceService, 'portStart' | 'portEnd'>): string {
  if (service.portEnd == null || service.portEnd === service.portStart) return String(service.portStart)
  return `${service.portStart}-${service.portEnd}`
}
