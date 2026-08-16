'use client';

import { useLanguage } from '@/components/LanguageProvider';
import { useTelemetry } from '@/components/TelemetryProvider';

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
      bar: fuelPct,
    },
    {
      label: t('telem_adblue'),
      value: `${adBluePct.toFixed(0)}%`,
      warn: adBluePct < 15,
      bar: adBluePct,
    },
    {
      label: t('telem_battery'),
      value: `${batteryV.toFixed(1)} V`,
      warn: batteryV < 23.5,
      bar: Math.min(100, ((batteryV - 22) / 3) * 100),
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
    <div className="fr-panel px-3 py-3">
      <div className="flex items-center justify-between mb-3">
        <p className="fr-label">{t('telem_live')}</p>
        {tel.animating && (
          <span className="fr-chip text-[#7dd3fc] border-[#00a3ff]/40 bg-[#00a3ff]/10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#28a745] animate-pulse" />
            {Math.round(tel.displaySpeedKmh)} km/h · {tel.engineRpm} rpm
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {items.map((item) => (
          <div
            key={item.label}
            className={`rounded-[10px] border px-2.5 py-2.5 transition-colors duration-500 ${
              item.warn
                ? 'bg-[#ff3b30]/10 border-[#ff3b30]/35'
                : 'bg-[#050a0f] border-[#1e2a3a]'
            }`}
          >
            <p className="fr-label">{item.label}</p>
            <p
              className={`text-sm font-bold mt-0.5 tabular-nums tracking-tight ${
                item.warn ? 'text-[#ff8a82]' : 'text-[#f2f6fb]'
              }`}
            >
              {item.value}
            </p>
            {'bar' in item && item.bar != null && (
              <div className="mt-2 h-1 rounded-full bg-[#1e2a3a] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    item.warn ? 'bg-[#ff3b30]' : 'bg-[#00a3ff]'
                  }`}
                  style={{ width: `${Math.max(0, Math.min(100, item.bar))}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
