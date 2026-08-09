'use client';

import { useState } from 'react';
import { ActionButton } from '@/components/ActionBar';

export type VehicleOutline = 'truck' | 'trailer' | 'van';

export type DamageZone = {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

const ZONES: Record<VehicleOutline, DamageZone[]> = {
  truck: [
    { id: 'fr-bumper', label: 'Voorbumper rechts', x: 210, y: 40, w: 70, h: 36 },
    { id: 'fl-bumper', label: 'Voorbumper links', x: 80, y: 40, w: 70, h: 36 },
    { id: 'cab-right', label: 'Cabine rechts', x: 220, y: 90, w: 60, h: 70 },
    { id: 'cab-left', label: 'Cabine links', x: 80, y: 90, w: 60, h: 70 },
    { id: 'hood', label: 'Motorkap', x: 140, y: 55, w: 80, h: 40 },
    { id: 'door-r', label: 'Portier rechts', x: 230, y: 165, w: 50, h: 55 },
    { id: 'door-l', label: 'Portier links', x: 80, y: 165, w: 50, h: 55 },
    { id: 'rear-cab', label: 'Achterkant cabine', x: 140, y: 230, w: 80, h: 40 },
  ],
  trailer: [
    { id: 'tl-front', label: 'Oplegger voorwand', x: 130, y: 30, w: 100, h: 40 },
    { id: 'tl-left', label: 'Oplegger linkerzijde', x: 60, y: 80, w: 55, h: 160 },
    { id: 'tl-right', label: 'Oplegger rechterzijde', x: 245, y: 80, w: 55, h: 160 },
    { id: 'tl-roof', label: 'Oplegger dak', x: 120, y: 100, w: 120, h: 50 },
    { id: 'tl-rear', label: 'Oplegger achterdeuren', x: 120, y: 250, w: 120, h: 45 },
    { id: 'tl-skirt-l', label: 'Zijskirt links', x: 70, y: 250, w: 45, h: 35 },
    { id: 'tl-skirt-r', label: 'Zijskirt rechts', x: 245, y: 250, w: 45, h: 35 },
  ],
  van: [
    { id: 'v-front', label: 'Voorzijde bestelwagen', x: 120, y: 35, w: 120, h: 45 },
    { id: 'v-left', label: 'Linkerzijpaneel', x: 70, y: 90, w: 50, h: 140 },
    { id: 'v-right', label: 'Rechterzijpaneel', x: 240, y: 90, w: 50, h: 140 },
    { id: 'v-side-door', label: 'Schuifdeur', x: 200, y: 120, w: 35, h: 80 },
    { id: 'v-rear', label: 'Achterdeuren', x: 120, y: 250, w: 120, h: 45 },
  ],
};

export function VehicleDamagePicker({
  onConfirm,
  onClose,
}: {
  onConfirm: (zone: DamageZone, outline: VehicleOutline) => void;
  onClose: () => void;
}) {
  const [outline, setOutline] = useState<VehicleOutline>('truck');
  const [selected, setSelected] = useState<DamageZone | null>(null);

  const zones = ZONES[outline];

  return (
    <div className="fixed inset-0 z-[70] bg-black/75 flex items-end md:items-center justify-center p-3">
      <div className="w-full max-w-lg bg-[#1e293b] border border-slate-600 rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-4 py-3 border-b border-slate-700 flex justify-between items-start gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Schade Locatie Kiezen</h3>
            <p className="text-[11px] text-slate-400">
              Tik op een zone op het voertuigsilhouette, daarna foto maken
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 text-xs">
            Sluiten
          </button>
        </div>

        <div className="px-4 pt-3 flex flex-wrap gap-2">
          {(
            [
              ['truck', 'Trekker'],
              ['trailer', 'Oplegger'],
              ['van', 'Bestelwagen'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setOutline(id);
                setSelected(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border ${
                outline === id
                  ? 'bg-indigo-950/40 text-indigo-300 border-indigo-500/30'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700/60'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="p-4">
          <svg
            viewBox="0 0 360 320"
            className="w-full h-auto rounded-xl border border-slate-700/60 bg-slate-950"
          >
            {/* simple vehicle hull */}
            {outline === 'truck' && (
              <g fill="none" stroke="#475569" strokeWidth="2">
                <rect x="95" y="50" width="170" height="210" rx="18" />
                <rect x="115" y="70" width="130" height="55" rx="8" />
                <circle cx="125" cy="250" r="16" />
                <circle cx="235" cy="250" r="16" />
              </g>
            )}
            {outline === 'trailer' && (
              <g fill="none" stroke="#475569" strokeWidth="2">
                <rect x="85" y="45" width="190" height="230" rx="10" />
                <line x1="85" y1="90" x2="275" y2="90" />
                <circle cx="120" cy="260" r="14" />
                <circle cx="180" cy="260" r="14" />
                <circle cx="240" cy="260" r="14" />
              </g>
            )}
            {outline === 'van' && (
              <g fill="none" stroke="#475569" strokeWidth="2">
                <path d="M90 80 L120 45 H240 L270 80 V260 H90 Z" />
                <rect x="200" y="110" width="40" height="90" rx="4" />
                <circle cx="130" cy="255" r="14" />
                <circle cx="230" cy="255" r="14" />
              </g>
            )}

            {zones.map((z) => {
              const on = selected?.id === z.id;
              return (
                <g key={z.id} className="cursor-pointer" onClick={() => setSelected(z)}>
                  <rect
                    x={z.x}
                    y={z.y}
                    width={z.w}
                    height={z.h}
                    rx={6}
                    fill={on ? 'rgba(52,211,153,0.25)' : 'rgba(148,163,184,0.08)'}
                    stroke={on ? '#34d399' : '#64748b'}
                    strokeWidth={on ? 2 : 1}
                    strokeDasharray={on ? undefined : '4 3'}
                  />
                </g>
              );
            })}
          </svg>

          <p className="mt-3 text-xs text-slate-300">
            Geselecteerd:{' '}
            <span className="font-semibold text-emerald-300">
              {selected?.label ?? 'geen zone'}
            </span>
          </p>
        </div>

        <div className="p-4 pt-0 flex flex-wrap gap-2">
          <ActionButton variant="slate" onClick={onClose}>
            Annuleren
          </ActionButton>
          <ActionButton
            variant="primary"
            disabled={!selected}
            onClick={() => selected && onConfirm(selected, outline)}
          >
            📷 Foto maken voor zone
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
