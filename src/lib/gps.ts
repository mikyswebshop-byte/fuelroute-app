/** Demo fallback — Kassel Hub corridor (used when GPS denied / unavailable). */
export const DEMO_GPS = {
  lat: 51.312,
  lng: 9.479,
  label: 'Demo · Kassel Hub',
} as const;

export type GpsPermission = 'prompt' | 'granted' | 'denied' | 'unsupported';
export type GpsSource = 'live' | 'demo' | 'idle';

export type GpsFix = {
  lat: number;
  lng: number;
  speedKmh: number;
  accuracyM: number | null;
  source: GpsSource;
  updatedAt: number | null;
};

export function msToKmh(speedMs: number | null | undefined): number {
  if (speedMs == null || !Number.isFinite(speedMs) || speedMs < 0) return 0;
  return speedMs * 3.6;
}

export function isInsecureRemoteOrigin(): boolean {
  if (typeof window === 'undefined') return false;
  const { protocol, hostname } = window.location;
  if (protocol === 'https:') return false;
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]') {
    return false;
  }
  return protocol === 'http:';
}

/** ETA clock label from minutes-from-now. */
export function formatEtaClock(minutesFromNow: number, locale = 'nl-NL'): string {
  const ms = Date.now() + Math.max(0, minutesFromNow) * 60_000;
  return new Date(ms).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
}

/**
 * Recalculate travel minutes from remaining distance and live speed.
 * Applies a traffic delay floor when crawling (< 15 km/h).
 */
export function liveEtaMinutes(distanceKm: number, speedKmh: number, trafficJam: boolean): number {
  const floor = trafficJam ? 8 : 12;
  const speed = Math.max(speedKmh > 0 ? speedKmh : floor, floor);
  return (distanceKm / speed) * 60;
}

export function trafficDelayMinutes(
  distanceKm: number,
  speedKmh: number,
  cruiseKmh = 80
): number {
  const baseline = (distanceKm / cruiseKmh) * 60;
  const live = liveEtaMinutes(distanceKm, speedKmh, speedKmh < 15);
  return Math.max(0, Math.round(live - baseline));
}
