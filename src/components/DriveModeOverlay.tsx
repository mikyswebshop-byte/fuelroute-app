'use client';

import { useAppMode } from '@/components/AppModeProvider';

export function DriveModeOverlay({
  guidance = 'Volgende instructie: blijf op A7 richting München. Tankstop over 42 km.',
}: {
  guidance?: string;
}) {
  const {
    driveModeActive,
    effectiveSpeedKmh,
    trafficJam,
    unlockDriveMode,
    setStandstill,
  } = useAppMode();

  if (!driveModeActive) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-[#0b0f19]/95 flex items-center justify-center p-4">
      <div className="w-full max-w-xl space-y-5 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-300">
          {trafficJam ? 'File / Vertraging' : 'Drive Mode Actief'}
        </p>
        <p className="text-5xl md:text-6xl font-black text-[#f8fafc] leading-tight">
          {Math.round(effectiveSpeedKmh)} km/h
        </p>
        <div className="rounded-3xl border-2 border-sky-500/40 bg-[#1e293b] p-8 shadow-2xl">
          <p className="text-xs font-bold uppercase tracking-wider text-[#38bdf8] mb-3">
            Spraakgestuurde navigatie
          </p>
          <p className="text-2xl md:text-3xl font-black text-[#f8fafc] leading-snug">
            {guidance}
          </p>
        </div>
        <p className="text-sm text-[#cbd5e1]">
          Touch-invoer vergrendeld boven 10 km/h · gebruik spraak of stop veilig om te ontgrendelen
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => setStandstill(true)}
            className="h-14 px-6 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white border-2 border-emerald-400/30"
          >
            🛑 Voertuig Gestopt — Ontgrendelen
          </button>
          <button
            type="button"
            onClick={unlockDriveMode}
            className="h-14 px-6 rounded-xl text-sm font-bold bg-slate-700 hover:bg-slate-600 text-white border-2 border-slate-500/40"
          >
            Nood-ontgrendeling (alleen stilstand)
          </button>
        </div>
      </div>
    </div>
  );
}
