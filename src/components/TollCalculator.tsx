'use client';

import { useMemo, useState } from 'react';

type EuroClass = 'Euro 6' | 'Euro 5' | 'Euro 4';
type CountryId = 'DE' | 'FR' | 'IT' | 'AT';

const COUNTRIES: {
  id: CountryId;
  label: string;
  baseRate: number;
}[] = [
  { id: 'DE', label: 'Duitsland Lkw-Maut', baseRate: 0.19 },
  { id: 'FR', label: 'Frankrijk péage / EETS', baseRate: 0.22 },
  { id: 'IT', label: 'Italië Autostrade', baseRate: 0.2 },
  { id: 'AT', label: 'Oostenrijk GO-Maut', baseRate: 0.24 },
];

function axleFactor(axles: number) {
  if (axles <= 2) return 0.85;
  if (axles === 3) return 1;
  if (axles === 4) return 1.12;
  return 1.25;
}

function euroFactor(euro: EuroClass) {
  if (euro === 'Euro 6') return 1;
  if (euro === 'Euro 5') return 1.18;
  return 1.35;
}

export function TollCalculator({
  defaultDistanceKm = 520,
  id = 'toll-calculator',
}: {
  defaultDistanceKm?: number;
  id?: string;
}) {
  const [distanceKm, setDistanceKm] = useState(defaultDistanceKm);
  const [axles, setAxles] = useState(5);
  const [euroClass, setEuroClass] = useState<EuroClass>('Euro 6');
  const [active, setActive] = useState<Record<CountryId, boolean>>({
    DE: true,
    FR: true,
    IT: false,
    AT: false,
  });

  const result = useMemo(() => {
    const factor = axleFactor(axles) * euroFactor(euroClass);
    const shares: Record<CountryId, number> = {
      DE: 0.45,
      FR: 0.25,
      IT: 0.18,
      AT: 0.12,
    };
    const enabled = COUNTRIES.filter((c) => active[c.id]);
    const shareSum = enabled.reduce((s, c) => s + shares[c.id], 0) || 1;

    const lines = enabled.map((c) => {
      const km = distanceKm * (shares[c.id] / shareSum);
      const cost = Math.round(km * c.baseRate * factor * 100) / 100;
      return { ...c, km: Math.round(km), cost };
    });
    const total = Math.round(lines.reduce((s, l) => s + l.cost, 0) * 100) / 100;
    return { lines, total, factor };
  }, [distanceKm, axles, euroClass, active]);

  return (
    <div
      id={id}
      className="bg-[#1e293b] rounded-2xl border border-amber-500/30 p-5 space-y-4"
    >
      <div>
        <h2 className="text-lg font-bold text-[#f8fafc]">🛣 Dynamische Maut / Toll Calculator</h2>
        <p className="text-xs text-[#cbd5e1] mt-1">
          Schatting LKW-Maut & tol (DE/FR/IT/AT) op basis van assen, Euroklasse en afstand
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="block text-slate-400 mb-1">Afstand (km)</label>
          <input
            type="number"
            min={10}
            max={3000}
            value={distanceKm}
            onChange={(e) => setDistanceKm(Number(e.target.value) || 0)}
            className="w-full bg-slate-950 border border-slate-600 rounded-lg p-2.5 text-slate-100"
          />
        </div>
        <div>
          <label className="block text-slate-400 mb-1">Assen</label>
          <select
            value={axles}
            onChange={(e) => setAxles(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-600 rounded-lg p-2.5 text-slate-100"
          >
            {[2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} assen
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-slate-400 mb-1">Euroklasse</label>
          <select
            value={euroClass}
            onChange={(e) => setEuroClass(e.target.value as EuroClass)}
            className="w-full bg-slate-950 border border-slate-600 rounded-lg p-2.5 text-slate-100"
          >
            <option value="Euro 6">Euro 6</option>
            <option value="Euro 5">Euro 5</option>
            <option value="Euro 4">Euro 4</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {COUNTRIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActive((prev) => ({ ...prev, [c.id]: !prev[c.id] }))}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition ${
              active[c.id]
                ? 'bg-amber-500/15 text-amber-200 border-amber-500/40'
                : 'bg-slate-900 text-slate-500 border-slate-700'
            }`}
          >
            {c.id} · {c.label.split(' ')[0]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {result.lines.map((line) => (
          <div
            key={line.id}
            className="rounded-xl border border-slate-700 bg-slate-950/50 px-3 py-2.5 flex justify-between gap-2 text-xs"
          >
            <div>
              <p className="font-semibold text-slate-100">{line.label}</p>
              <p className="text-slate-500 mt-0.5">
                ~{line.km} km · €{line.baseRate.toFixed(2)}/km × {result.factor.toFixed(2)}
              </p>
            </div>
            <p className="font-bold text-amber-300 shrink-0">€ {line.cost.toFixed(2)}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-4 py-3 flex justify-between items-center">
        <span className="text-xs text-slate-300">Geschatte totale tol / maut</span>
        <span className="text-xl font-black text-emerald-300">€ {result.total.toFixed(2)}</span>
      </div>
    </div>
  );
}
