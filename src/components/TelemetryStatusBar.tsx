'use client';

import { useTelemetry } from '@/components/TelemetryProvider';
import { useLanguage } from '@/components/LanguageProvider';

export function TelemetryStatusBar({
  fuelPct: fuelOverride,
  adBluePct: adBlueOverride,
  batteryV: batteryOverride,
  tireWarn: tireOverride,
  rangeKm: rangeOverride,
}: {
  fuelPct?: number;
  adBluePct?: number;
  batteryV?: number;
  tireWarn?: boolean;
  rangeKm?: number;
} = {}) {
  const tel = useTelemetry();
  const { t } = useLanguage();

  const fuelPct = fuelOverride ?? tel.fuelPct;
  const adBluePct = adBlueOverride ?? tel.adBluePct;
  const batteryV = batteryOverride ?? tel.batteryV;
  const tireWarn = tireOverride ?? tel.tireWarn;
  const rangeKm = rangeOverride ?? tel.rangeKm;

  const items = [
    {
      label: t('telem_fuel'),
      value: `${fuelPct.toFixed(0)}%`,
      warn: fuelPct < 20,
    },
    {
      label: t('telem_adblue'),
      value: `${adBluePct.toFixed(0)}%`,
      warn: adBluePct < 15,
    },
    {
      label: t('telem_battery'),
      value: `${batteryV.toFixed(1)} V`,
      warn: batteryV < 23.5,
    },
    {
      label: t('telem_tires'),
      value: tireWarn ? t('telem_warn') : t('telem_ok'),
      warn: tireWarn,
    },
    {
      label: t('telem_range'),
      value: `${rangeKm} km`,
      warn: rangeKm < 80,
    },
  ];

  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-900/70 px-3 py-2.5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          {t('telem_live')}
        </p>
        {tel.animating && (
          <span className="text-[10px] font-bold text-amber-300 animate-pulse">
            {Math.round(tel.displaySpeedKmh)} km/h · {tel.engineRpm} rpm
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {items.map((item) => (
          <div
            key={item.label}
            className={`rounded-lg border px-2.5 py-2 transition-colors duration-500 ${
              item.warn
                ? 'bg-amber-950/30 border-amber-500/30'
                : 'bg-slate-800/50 border-slate-700/50'
            }`}
          >
            <p className="text-[10px] text-slate-400">{item.label}</p>
            <p
              className={`text-xs font-semibold mt-0.5 tabular-nums transition-all duration-500 ${
                item.warn ? 'text-amber-200' : 'text-slate-100'
              }`}
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
