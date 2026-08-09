'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { HttpsGpsToast } from '@/components/HttpsGpsToast';
import {
  DEMO_GPS,
  msToKmh,
  type GpsFix,
  type GpsPermission,
} from '@/lib/gps';

export type DutyMode = 'dienst' | 'prive';

type AppModeContextValue = {
  dutyMode: DutyMode;
  setDutyMode: (mode: DutyMode) => void;
  gpsTrackingEnabled: boolean;
  offlineMode: boolean;
  setOfflineMode: (value: boolean) => void;
  /** Demo / manual simulation speed (Simuleer Rijden). */
  simulatedSpeedKmh: number;
  setSimulatedSpeedKmh: (speed: number) => void;
  /** Live GPS or simulation — use this for UI speed. */
  effectiveSpeedKmh: number;
  driveModeActive: boolean;
  unlockDriveMode: () => void;
  isStandstill: boolean;
  setStandstill: (value: boolean) => void;
  routeActive: boolean;
  setRouteActive: (value: boolean) => void;
  trafficJam: boolean;
  gps: GpsFix;
  gpsPermission: GpsPermission;
  gpsWatching: boolean;
  requestGpsPermission: () => void;
  stopGpsWatch: () => void;
};

const AppModeContext = createContext<AppModeContextValue | null>(null);

const STORAGE_KEY = 'fuelroute-duty-mode';
const JAM_SPEED_KMH = 15;

const IDLE_GPS: GpsFix = {
  lat: DEMO_GPS.lat,
  lng: DEMO_GPS.lng,
  speedKmh: 0,
  accuracyM: null,
  source: 'idle',
  updatedAt: null,
};

export function AppModeProvider({ children }: { children: ReactNode }) {
  const [dutyMode, setDutyModeState] = useState<DutyMode>('dienst');
  const [offlineMode, setOfflineMode] = useState(false);
  const [simulatedSpeedKmh, setSimulatedSpeedKmhState] = useState(0);
  const [manualDriveUnlock, setManualDriveUnlock] = useState(false);
  const [isStandstill, setStandstillState] = useState(true);
  const [routeActive, setRouteActiveState] = useState(false);
  const [gps, setGps] = useState<GpsFix>(IDLE_GPS);
  const [gpsPermission, setGpsPermission] = useState<GpsPermission>('prompt');
  const [gpsWatching, setGpsWatching] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  const setSimulatedSpeedKmh = useCallback((speed: number) => {
    const next = Number.isFinite(speed) ? Math.max(0, speed) : 0;
    setSimulatedSpeedKmhState((prev) => (prev === next ? prev : next));
  }, []);

  const stopGpsWatch = useCallback(() => {
    if (typeof navigator !== 'undefined' && watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setGpsWatching(false);
  }, []);

  const applyDemoFallback = useCallback((reason: GpsPermission) => {
    setGpsPermission(reason);
    setGps({
      lat: DEMO_GPS.lat,
      lng: DEMO_GPS.lng,
      speedKmh: 0,
      accuracyM: null,
      source: 'demo',
      updatedAt: Date.now(),
    });
    setGpsWatching(false);
  }, []);

  const requestGpsPermission = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      applyDemoFallback('unsupported');
      return;
    }

    stopGpsWatch();
    setGpsPermission('prompt');
    setGpsWatching(true);

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const speedKmh = msToKmh(pos.coords.speed);
        setGpsPermission('granted');
        setGps({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          speedKmh,
          accuracyM: pos.coords.accuracy ?? null,
          source: 'live',
          updatedAt: Date.now(),
        });
        // Moving GPS fix → leave standstill and mark route active
        if (speedKmh >= 3) {
          setStandstillState(false);
          setRouteActiveState(true);
        }
      },
      (err) => {
        // PERMISSION_DENIED = 1
        if (err.code === 1) {
          applyDemoFallback('denied');
        } else if (err.code === 2 || err.code === 3) {
          // Position unavailable / timeout — keep trying briefly, then demo
          applyDemoFallback('denied');
        } else {
          applyDemoFallback('denied');
        }
        stopGpsWatch();
      },
      {
        enableHighAccuracy: true,
        maximumAge: 2_000,
        timeout: 15_000,
      }
    );

    watchIdRef.current = id;
  }, [applyDemoFallback, stopGpsWatch]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'prive' || saved === 'dienst') setDutyModeState(saved);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => () => stopGpsWatch(), [stopGpsWatch]);

  const setDutyMode = useCallback((mode: DutyMode) => {
    setDutyModeState(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
    if (mode === 'prive') {
      setOfflineMode(true);
      stopGpsWatch();
    }
  }, [stopGpsWatch]);

  const setStandstill = useCallback(
    (value: boolean) => {
      setStandstillState(value);
      if (value) {
        setSimulatedSpeedKmh(0);
        setRouteActiveState(false);
      } else {
        setRouteActiveState(true);
      }
    },
    [setSimulatedSpeedKmh]
  );

  const setRouteActive = useCallback((value: boolean) => {
    setRouteActiveState(value);
    if (value) setStandstillState(false);
  }, []);

  // Demo simulation (>10) wins over a stationary live GPS fix so "Simuleer Rijden" still works on a desk.
  const effectiveSpeedKmh = isStandstill
    ? 0
    : simulatedSpeedKmh > 10
      ? simulatedSpeedKmh
      : gps.source === 'live'
        ? gps.speedKmh
        : simulatedSpeedKmh;

  const trafficJam =
    routeActive &&
    !isStandstill &&
    simulatedSpeedKmh <= 10 &&
    gps.source === 'live' &&
    effectiveSpeedKmh < JAM_SPEED_KMH;

  const driveModeActive =
    !isStandstill && effectiveSpeedKmh > 10 && !manualDriveUnlock;

  useEffect(() => {
    if (effectiveSpeedKmh > 10) return;
    setManualDriveUnlock((prev) => (prev ? false : prev));
  }, [effectiveSpeedKmh]);

  const unlockDriveMode = useCallback(() => {
    setManualDriveUnlock(true);
    setStandstill(true);
  }, [setStandstill]);

  const value = useMemo(
    () => ({
      dutyMode,
      setDutyMode,
      gpsTrackingEnabled: dutyMode === 'dienst' && !offlineMode,
      offlineMode: offlineMode || dutyMode === 'prive',
      setOfflineMode,
      simulatedSpeedKmh,
      setSimulatedSpeedKmh,
      effectiveSpeedKmh,
      driveModeActive,
      unlockDriveMode,
      isStandstill,
      setStandstill,
      routeActive,
      setRouteActive,
      trafficJam,
      gps,
      gpsPermission,
      gpsWatching,
      requestGpsPermission,
      stopGpsWatch,
    }),
    [
      dutyMode,
      setDutyMode,
      offlineMode,
      simulatedSpeedKmh,
      setSimulatedSpeedKmh,
      effectiveSpeedKmh,
      driveModeActive,
      unlockDriveMode,
      isStandstill,
      setStandstill,
      routeActive,
      setRouteActive,
      trafficJam,
      gps,
      gpsPermission,
      gpsWatching,
      requestGpsPermission,
      stopGpsWatch,
    ]
  );

  return (
    <AppModeContext.Provider value={value}>
      {children}
      <HttpsGpsToast />
    </AppModeContext.Provider>
  );
}

export function useAppMode() {
  const ctx = useContext(AppModeContext);
  if (!ctx) {
    throw new Error('useAppMode must be used within AppModeProvider');
  }
  return ctx;
}
