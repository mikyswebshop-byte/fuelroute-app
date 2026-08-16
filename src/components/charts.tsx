'use client';

type BarPoint = { month: string; savings: number };
type LinePoint = { label: string; fuelroute: number; highway: number };

export function SavingsBarChart({ data }: { data: BarPoint[] }) {
  const max = Math.max(...data.map((d) => d.savings), 1);
  const width = 560;
  const height = 220;
  const padX = 40;
  const padY = 28;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;
  const barW = chartW / data.length - 16;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56" role="img" aria-label="Brandstofbesparing per maand">
      {[0.25, 0.5, 0.75, 1].map((t) => {
        const y = padY + chartH - chartH * t;
        return (
          <g key={t}>
            <line x1={padX} y1={y} x2={width - padX} y2={y} stroke="#334155" strokeWidth="1" />
            <text x={padX - 8} y={y + 4} textAnchor="end" fill="#94a3b8" fontSize="10">
              €{Math.round(max * t)}
            </text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const h = (d.savings / max) * chartH;
        const x = padX + i * (chartW / data.length) + 8;
        const y = padY + chartH - h;
        return (
          <g key={d.month}>
            <rect x={x} y={y} width={barW} height={h} rx="6" fill="#38bdf8" opacity={0.9} />
            <text x={x + barW / 2} y={height - 8} textAnchor="middle" fill="#cbd5e1" fontSize="11">
              {d.month}
            </text>
            <text x={x + barW / 2} y={y - 6} textAnchor="middle" fill="#f8fafc" fontSize="10" fontWeight="700">
              {d.savings}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function PriceLineChart({ data }: { data: LinePoint[] }) {
  const width = 560;
  const height = 220;
  const padX = 44;
  const padY = 28;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;
  const values = data.flatMap((d) => [d.fuelroute, d.highway]);
  const min = Math.min(...values) - 0.03;
  const max = Math.max(...values) + 0.03;

  const toX = (i: number) => padX + (i / (data.length - 1)) * chartW;
  const toY = (v: number) => padY + chartH - ((v - min) / (max - min)) * chartH;

  const fuelPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(d.fuelroute)}`).join(' ');
  const hwyPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(d.highway)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56" role="img" aria-label="Literprijs vergelijking">
      {[0, 0.5, 1].map((t) => {
        const y = padY + chartH * (1 - t);
        const val = min + (max - min) * t;
        return (
          <g key={t}>
            <line x1={padX} y1={y} x2={width - padX} y2={y} stroke="#334155" strokeWidth="1" />
            <text x={padX - 8} y={y + 4} textAnchor="end" fill="#94a3b8" fontSize="10">
              €{val.toFixed(2)}
            </text>
          </g>
        );
      })}
      <path d={hwyPath} fill="none" stroke="#f87171" strokeWidth="2.5" />
      <path d={fuelPath} fill="none" stroke="#10b981" strokeWidth="2.5" />
      {data.map((d, i) => (
        <g key={d.label}>
          <circle cx={toX(i)} cy={toY(d.fuelroute)} r="4" fill="#10b981" />
          <circle cx={toX(i)} cy={toY(d.highway)} r="4" fill="#f87171" />
          <text x={toX(i)} y={height - 8} textAnchor="middle" fill="#cbd5e1" fontSize="11">
            {d.label}
          </text>
        </g>
      ))}
      <g>
        <rect x={padX} y={8} width="10" height="10" rx="2" fill="#10b981" />
        <text x={padX + 16} y={17} fill="#cbd5e1" fontSize="11">
          FuelRoute-netto €1,58
        </text>
        <rect x={padX + 150} y={8} width="10" height="10" rx="2" fill="#f87171" />
        <text x={padX + 166} y={17} fill="#cbd5e1" fontSize="11">
          Snelweggemiddelde €1,75
        </text>
      </g>
    </svg>
  );
}

export function FuelGauge({ level }: { level: number }) {
  const clamped = Math.max(0, Math.min(100, level));
  const r = 64;
  const c = Math.PI * r;
  const progress = clamped / 100;
  const dash = c * progress;
  const color = clamped < 20 ? '#ff3b30' : clamped < 40 ? '#ff9500' : '#28a745';
  const needleAngle = -90 + progress * 180;

  return (
    <div className="relative w-44 h-40 mx-auto select-none">
      <svg viewBox="0 0 180 150" className="w-full h-full overflow-visible">
        <defs>
          <filter id="fuelGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M 26 120 A 64 64 0 0 1 154 120"
          fill="none"
          stroke="#1e2a3a"
          strokeWidth="11"
          strokeLinecap="round"
        />
        {/* Low-fuel zone track hint */}
        <path
          d="M 26 120 A 64 64 0 0 1 58 72"
          fill="none"
          stroke="#ff9500"
          strokeWidth="11"
          strokeLinecap="round"
          opacity="0.35"
        />
        <path
          d="M 26 120 A 64 64 0 0 1 154 120"
          fill="none"
          stroke={color}
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          filter="url(#fuelGlow)"
          style={{ transition: 'stroke-dasharray 0.5s ease-out, stroke 0.4s ease' }}
        />
        <text x="28" y="138" fill="#6b7a90" fontSize="11" fontWeight="700">
          E
        </text>
        <text x="148" y="138" fill="#6b7a90" fontSize="11" fontWeight="700">
          F
        </text>
        <g
          style={{
            transform: `rotate(${needleAngle}deg)`,
            transformOrigin: '90px 120px',
            transition: 'transform 0.45s ease-out',
          }}
        >
          <line
            x1="90"
            y1="120"
            x2="90"
            y2="62"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        </g>
        <circle cx="90" cy="120" r="5" fill={color} />
      </svg>
      <div className="absolute inset-x-0 top-[42%] flex flex-col items-center pointer-events-none">
        <span className="fr-display text-2xl tabular-nums leading-none">
          {clamped.toFixed(0)}%
        </span>
        <span className="fr-label mt-1">Brandstof</span>
      </div>
    </div>
  );
}
