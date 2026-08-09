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
  const radius = 70;
  const stroke = 12;
  const c = 2 * Math.PI * radius;
  const offset = c - (clamped / 100) * c;
  const color = clamped < 25 ? '#f59e0b' : clamped < 40 ? '#fbbf24' : '#10b981';
  // Needle on semicircle: 0% = -90deg (left), 100% = 90deg (right) in unrotated view
  const needleAngle = -90 + (clamped / 100) * 180;

  return (
    <div className="relative w-44 h-44 mx-auto">
      <svg viewBox="0 0 180 180" className="w-full h-full">
        <g transform="rotate(-90 90 90)">
          <circle cx="90" cy="90" r={radius} fill="none" stroke="#1e293b" strokeWidth={stroke} />
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s ease-out, stroke 0.4s ease' }}
          />
        </g>
        <g
          style={{
            transform: `rotate(${needleAngle}deg)`,
            transformOrigin: '90px 90px',
            transition: 'transform 0.45s ease-out',
          }}
        >
          <line
            x1="90"
            y1="90"
            x2="90"
            y2="28"
            stroke="#f8fafc"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>
        <circle cx="90" cy="90" r="6" fill="#38bdf8" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-3xl font-black text-[#f8fafc] tabular-nums transition-all duration-500">
          {clamped.toFixed(1)}%
        </span>
        <span className="text-xs text-[#cbd5e1]">Brandstofniveau</span>
      </div>
    </div>
  );
}
