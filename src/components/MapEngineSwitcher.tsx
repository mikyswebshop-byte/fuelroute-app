'use client';

export type MapEngineId =
  | 'here'
  | 'ptv'
  | 'tomtom'
  | 'trimble'
  | 'mapbox';

export const MAP_ENGINES: {
  id: MapEngineId;
  label: string;
  short: string;
  note: string;
}[] = [
  {
    id: 'here',
    label: 'HERE Truck Maps API',
    short: 'HERE Truck',
    note: 'Brughoogtes, aslasten, ADR/hazmat-tunnels',
  },
  {
    id: 'ptv',
    label: 'PTV Logistics / xServer',
    short: 'PTV xServer',
    note: 'Europese Maut & EETS-tolmatrix',
  },
  {
    id: 'tomtom',
    label: 'TomTom Orbis / Truck API',
    short: 'TomTom Orbis',
    note: 'Live vrachtverkeer & grensvertragingen',
  },
  {
    id: 'trimble',
    label: 'Trimble / ALK CoPilot Transport',
    short: 'Trimble CoPilot',
    note: 'Turn-by-turn trucknavigatie',
  },
  {
    id: 'mapbox',
    label: 'Mapbox / OpenStreetMap (Truck Layers)',
    short: 'Mapbox / OSM',
    note: 'Standaard vectorlaag (backup)',
  },
];

export function MapEngineSwitcher({
  value,
  onChange,
  className = '',
}: {
  value: MapEngineId;
  onChange: (id: MapEngineId) => void;
  className?: string;
}) {
  const active = MAP_ENGINES.find((e) => e.id === value) ?? MAP_ENGINES[0];

  return (
    <div
      className={`rounded-xl border border-slate-700/60 bg-slate-900/60 p-3 space-y-2 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Kaartmotor
          </p>
          <p className="text-xs text-slate-400 mt-0.5">{active.note}</p>
        </div>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as MapEngineId)}
          className="bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-2 text-xs font-medium text-slate-200 min-w-[220px]"
        >
          {MAP_ENGINES.map((engine) => (
            <option key={engine.id} value={engine.id}>
              {engine.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {MAP_ENGINES.map((engine) => {
          const on = engine.id === value;
          return (
            <button
              key={engine.id}
              type="button"
              onClick={() => onChange(engine.id)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-medium border transition ${
                on
                  ? 'bg-indigo-950/40 text-indigo-300 border-indigo-500/30'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700/50 hover:bg-slate-700/60'
              }`}
            >
              {engine.short}
            </button>
          );
        })}
      </div>
    </div>
  );
}
