'use client';

/** Analog-style speed needle for drive simulation. */
export function SpeedGauge({
  speedKmh,
  max = 120,
  label = 'km/h',
}: {
  speedKmh: number;
  max?: number;
  label?: string;
}) {
  const clamped = Math.max(0, Math.min(max, speedKmh));
  // Needle sweep from -120deg to +120deg
  const angle = -120 + (clamped / max) * 240;

  return (
    <div className="relative w-40 h-40 mx-auto select-none">
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <circle cx="100" cy="100" r="88" fill="#0f172a" stroke="#334155" strokeWidth="4" />
        {Array.from({ length: 13 }, (_, i) => {
          const a = ((-120 + i * 20) * Math.PI) / 180;
          const x1 = 100 + Math.cos(a) * 70;
          const y1 = 100 + Math.sin(a) * 70;
          const x2 = 100 + Math.cos(a) * 82;
          const y2 = 100 + Math.sin(a) * 82;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={i > 9 ? '#f87171' : '#64748b'}
              strokeWidth={i % 2 === 0 ? 3 : 1.5}
            />
          );
        })}
        <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: '100px 100px' }}>
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="28"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeLinecap="round"
            style={{ transition: 'transform 0.12s linear' }}
          />
        </g>
        <circle cx="100" cy="100" r="8" fill="#f8fafc" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 pointer-events-none">
        <span className="text-2xl font-black tabular-nums text-[#f8fafc]">
          {Math.round(clamped)}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-slate-400">{label}</span>
      </div>
    </div>
  );
}
