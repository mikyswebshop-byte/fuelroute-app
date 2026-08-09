'use client';

import type { CSSProperties } from 'react';

type RangeSliderProps = {
  id?: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  accent?: string;
  formatValue?: (value: number) => string;
  onChange: (value: number) => void;
  className?: string;
};

export function RangeSlider({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  accent = '#38bdf8',
  formatValue,
  onChange,
  className = '',
}: RangeSliderProps) {
  const clamped = Math.min(max, Math.max(min, value));
  const pct = max === min ? 0 : ((clamped - min) / (max - min)) * 100;
  const display = formatValue ? formatValue(clamped) : `${clamped}${unit ? ` ${unit}` : ''}`;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-xs text-[#cbd5e1]">
          {label}
        </label>
        <span
          className="inline-flex items-center rounded-lg border border-slate-600/80 bg-slate-950/80 px-2.5 py-1 text-xs font-bold tabular-nums text-[#f8fafc]"
          style={{ boxShadow: `inset 0 0 0 1px ${accent}33` }}
        >
          {display}
        </span>
      </div>

      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={clamped}
        onChange={(e) => onChange(Number(e.target.value))}
        className="fr-range w-full"
        style={
          {
            '--fr-pct': `${pct}%`,
            '--fr-accent': accent,
          } as CSSProperties
        }
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={clamped}
        aria-label={label}
      />

      <div className="flex justify-between text-[10px] text-slate-500 tabular-nums">
        <span>
          {min}
          {unit ? ` ${unit}` : ''}
        </span>
        <span>
          {max}
          {unit ? ` ${unit}` : ''}
        </span>
      </div>
    </div>
  );
}
