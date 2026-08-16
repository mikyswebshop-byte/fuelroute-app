'use client';

/** Semi-circular glowing speed gauge — design kit §19 */
export function SpeedGauge({
  speedKmh,
  max = 140,
  label = 'km/h',
}: {
  speedKmh: number;
  max?: number;
  label?: string;
}) {
  const clamped = Math.max(0, Math.min(max, speedKmh));
  const r = 70;
  const c = Math.PI * r; // semicircle length
  const progress = clamped / max;
  const dash = c * progress;
  const needleAngle = -90 + progress * 180;

  return (
    <div className="relative w-full max-w-[200px] aspect-square mx-auto select-none">
      <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="speedArc" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#007aff" />
            <stop offset="100%" stopColor="#00a3ff" />
          </linearGradient>
          <filter id="speedGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Track */}
        <path
          d="M 30 140 A 70 70 0 0 1 170 140"
          fill="none"
          stroke="#1e2a3a"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Glow arc */}
        <path
          d="M 30 140 A 70 70 0 0 1 170 140"
          fill="none"
          stroke="url(#speedArc)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          filter="url(#speedGlow)"
          style={{ transition: 'stroke-dasharray 0.2s linear' }}
        />
        {/* Ticks */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const a = ((-180 + t * 180) * Math.PI) / 180;
          const x1 = 100 + Math.cos(a) * 78;
          const y1 = 140 + Math.sin(a) * 78;
          const x2 = 100 + Math.cos(a) * 88;
          const y2 = 140 + Math.sin(a) * 88;
          return (
            <line
              key={t}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#2a3a50"
              strokeWidth="2"
            />
          );
        })}
        <g
          style={{
            transform: `rotate(${needleAngle}deg)`,
            transformOrigin: '100px 140px',
            transition: 'transform 0.15s linear',
          }}
        >
          <line
            x1="100"
            y1="140"
            x2="100"
            y2="78"
            stroke="#00a3ff"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 0 6px rgba(0,163,255,0.8))' }}
          />
        </g>
        <circle cx="100" cy="140" r="6" fill="#00a3ff" />
        <circle cx="100" cy="140" r="3" fill="#f2f6fb" />
      </svg>
      <div className="absolute inset-x-0 bottom-6 flex flex-col items-center pointer-events-none">
        <span className="fr-display text-3xl tabular-nums tracking-tight leading-none">
          {Math.round(clamped)}
        </span>
        <span className="fr-label mt-1">{label}</span>
      </div>
    </div>
  );
}
