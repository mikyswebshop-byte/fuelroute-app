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
import { useAppMode } from '@/components/AppModeProvider';
import { formatEtaClock, liveEtaMinutes } from '@/lib/gps';

type TelemetryContextValue = {
  fuelPct: number;
  adBluePct: number;
  batteryV: number;
  tireWarn: boolean;
  rangeKm: number;
  engineRpm: number;
  nextStopKm: number;
  etaMinutes: number;
  etaClock: string;
  displaySpeedKmh: number;
  animating: boolean;
  setFuelPct: (n: number) => void;
  setAdBluePct: (n: number) => void;
  setNextStopKm: (n: number) => void;
  setBaseEtaMinutes: (n: number) => void;
};

const TelemetryContext = createContext<TelemetryContextValue | null>(null);

export function TelemetryProvider({ children }: { children: ReactNode }) {
  const { effectiveSpeedKmh, trafficJam, routeActive, isStandstill } = useAppMode();
  const [fuelPct, setFuelPctState] = useState(18.4);
  const [adBluePct, setAdBluePctState] = useState(62);
  const [batteryV, setBatteryV] = useState(24.1);
  const [tireWarn] = useState(false);
  const [engineRpm, setEngineRpm] = useState(780);
  const [nextStopKm, setNextStopKm] = useState(18);
  const [baseEtaMinutes, setBaseEtaMinutes] = useState(84);
  const [displaySpeedKmh, setDisplaySpeedKmh] = useState(0);
  const targetSpeedRef = useRef(0);

  const setFuelPct = useCallback((n: number) => {
    setFuelPctState(Math.max(0, Math.min(100, n)));
  }, []);
  const setAdBluePct = useCallback((n: number) => {
    setAdBluePctState(Math.max(0, Math.min(100, n)));
  }, []);

  const animating = !isStandstill && effectiveSpeedKmh > 10;

  // Smooth speed needle toward target
  useEffect(() => {
    targetSpeedRef.current = isStandstill ? 0 : effectiveSpeedKmh;
  }, [effectiveSpeedKmh, isStandstill]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      setDisplaySpeedKmh((prev) => {
        const target = targetSpeedRef.current;
        const next = prev + (target - prev) * Math.min(1, dt * 3.2);
        // Add subtle road noise while simulating
        const noise =
          target > 10 ? Math.sin(now / 180) * 1.2 + Math.sin(now / 90) * 0.6 : 0;
        const value = Math.max(0, next + noise);
        return Math.abs(value - prev) < 0.05 && target <= 10 ? target : value;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Live telemetry drain / oscillation while driving
  useEffect(() => {
    if (!animating) {
      setEngineRpm(780);
      setBatteryV(24.1);
      return;
    }
    const id = window.setInterval(() => {
      const speed = targetSpeedRef.current;
      setFuelPctState((f) => Math.max(5, f - speed * 0.00035));
      setAdBluePctState((a) => Math.max(8, a - speed * 0.00008));
      setEngineRpm(1050 + Math.round(speed * 12 + Math.random() * 180));
      setBatteryV(23.6 + Math.random() * 0.7);
      setNextStopKm((km) => Math.max(1, km - speed / 3600));
    }, 1000);
    return () => window.clearInterval(id);
  }, [animating]);

  const rangeKm = Math.round(fuelPct * 22);

  const etaMinutes = useMemo(() => {
    if (routeActive || animating) {
      return liveEtaMinutes(nextStopKm, Math.max(displaySpeedKmh, 8), trafficJam);
    }
    return baseEtaMinutes;
  }, [routeActive, animating, nextStopKm, displaySpeedKmh, trafficJam, baseEtaMinutes]);

  const etaClock = formatEtaClock(etaMinutes);

  const value = useMemo(
    () => ({
      fuelPct,
      adBluePct,
      batteryV,
      tireWarn,
      rangeKm,
      engineRpm,
      nextStopKm,
      etaMinutes,
      etaClock,
      displaySpeedKmh,
      animating,
      setFuelPct,
      setAdBluePct,
      setNextStopKm,
      setBaseEtaMinutes,
    }),
    [
      fuelPct,
      adBluePct,
      batteryV,
      tireWarn,
      rangeKm,
      engineRpm,
      nextStopKm,
      etaMinutes,
      etaClock,
      displaySpeedKmh,
      animating,
      setFuelPct,
      setAdBluePct,
    ]
  );

  return <TelemetryContext.Provider value={value}>{children}</TelemetryContext.Provider>;
}

export function useTelemetry() {
  const ctx = useContext(TelemetryContext);
  if (!ctx) throw new Error('useTelemetry must be used within TelemetryProvider');
  return ctx;
}
