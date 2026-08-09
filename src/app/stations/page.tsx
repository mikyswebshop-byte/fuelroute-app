'use client';

import { useMemo, useRef, useState } from 'react';
import { ActionBar, ActionButton } from '@/components/ActionBar';
import {
  netPriceMatrix,
  parkingSecurity,
  stationComparisons,
  type FuelCardProvider,
} from '@/lib/mock-data';

const ALL_CARDS: FuelCardProvider[] = ['DKV', 'UTA', 'Shell', 'BP', 'AS24', 'EDC'];

function esporgBadge(level: string) {
  if (level === 'Platinum') return 'bg-violet-950/40 text-violet-200 border-violet-500/35';
  if (level === 'Gold') return 'bg-amber-950/30 text-amber-200 border-amber-500/30';
  if (level === 'Silver') return 'bg-slate-800/80 text-slate-200 border-slate-500/40';
  return 'bg-orange-950/25 text-orange-200/90 border-orange-500/25';
}

function esporgLabelNl(level: string) {
  if (level === 'Platinum') return 'Platinum';
  if (level === 'Gold') return 'Goud';
  if (level === 'Silver') return 'Zilver';
  return 'Brons';
}

export default function StationsPage() {
  const [cardFilter, setCardFilter] = useState<FuelCardProvider | 'ALL'>('ALL');
  const [esporgFilter, setEsporgFilter] = useState<
    'ALL' | 'Gold' | 'Silver' | 'Bronze' | 'Platinum'
  >('ALL');
  const [onlyCombined, setOnlyCombined] = useState(false);
  const [requireShowers, setRequireShowers] = useState(false);
  const [requireAdBlue, setRequireAdBlue] = useState(false);
  const [requireRestaurant, setRequireRestaurant] = useState(false);
  const [requireBosch, setRequireBosch] = useState(false);
  const matrixRef = useRef<HTMLDivElement>(null);

  const priceRows = useMemo(
    () =>
      stationComparisons.filter(
        (s) => cardFilter === 'ALL' || s.cards.includes(cardFilter)
      ),
    [cardFilter]
  );

  const parkingRows = useMemo(
    () =>
      parkingSecurity.filter((p) => {
        if (esporgFilter !== 'ALL' && p.esporgLevel !== esporgFilter) return false;
        if (onlyCombined && !p.combinedRestStop) return false;
        if (requireShowers && !p.hasShowers) return false;
        if (requireAdBlue && !p.hasAdBluePump) return false;
        if (requireRestaurant && !p.hasRestaurant) return false;
        if (requireBosch && !(p.boschCertified || p.truckParkingEurope)) return false;
        return true;
      }),
    [
      esporgFilter,
      onlyCombined,
      requireShowers,
      requireAdBlue,
      requireRestaurant,
      requireBosch,
    ]
  );

  const avgDelta =
    priceRows.reduce((sum, r) => sum + r.deltaPerL, 0) / Math.max(priceRows.length, 1);
  const bestPrice =
    priceRows.length > 0 ? Math.min(...priceRows.map((r) => r.autohofPrice)) : 0;

  const matrixCards = cardFilter === 'ALL' ? ALL_CARDS : [cardFilter];

  return (
    <main className="min-h-screen p-6" style={{ background: '#0b0f19' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#38bdf8]">Tankstations & ESPORG</h1>
            <p className="text-[#cbd5e1] text-sm mt-1">
              Corridorprijzen + ESPORG-beveiligde parkeerbezetting
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={cardFilter}
              onChange={(e) => setCardFilter(e.target.value as FuelCardProvider | 'ALL')}
              className="bg-[#1e293b] border border-slate-600 rounded-lg p-2.5 text-sm text-[#f8fafc] font-medium"
            >
              <option value="ALL">Alle tankkaarten</option>
              <option value="DKV">DKV-kaart</option>
              <option value="UTA">UTA-kaart</option>
              <option value="Shell">Shell-kaart</option>
              <option value="BP">BP-kaart</option>
              <option value="AS24">AS24-kaart</option>
              <option value="EDC">EDC-kaart</option>
            </select>
            <select
              value={esporgFilter}
              onChange={(e) => setEsporgFilter(e.target.value as typeof esporgFilter)}
              className="bg-[#1e293b] border border-slate-600 rounded-lg p-2.5 text-sm text-[#f8fafc] font-medium"
            >
              <option value="ALL">Alle ESPORG-niveaus</option>
              <option value="Platinum">ESPORG Platinum</option>
              <option value="Gold">ESPORG Goud</option>
              <option value="Silver">ESPORG Zilver</option>
              <option value="Bronze">ESPORG Brons</option>
            </select>
          </div>
        </div>

        <ActionBar title="Netto-prijs & voorzieningen">
          <ActionButton
            variant="primary"
            className="w-full py-3"
            onClick={() => matrixRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          >
            💶 Contract Nettoprijs Matrix
          </ActionButton>
          <ActionButton
            variant="secondary"
            className="w-full"
            onClick={() => setRequireShowers((v) => !v)}
          >
            Douches {requireShowers ? '(aan)' : '(uit)'}
          </ActionButton>
          <ActionButton
            variant="utility"
            className="w-full"
            onClick={() => setRequireAdBlue((v) => !v)}
          >
            AdBlue aan pomp {requireAdBlue ? '(aan)' : '(uit)'}
          </ActionButton>
          <ActionButton
            variant="slate"
            className="w-full"
            onClick={() => setRequireBosch((v) => !v)}
          >
            Bosch / TPE Security {requireBosch ? '(aan)' : '(uit)'}
          </ActionButton>
        </ActionBar>

        <ActionBar title="Stations-acties">
          <ActionButton variant="primary" onClick={() => setEsporgFilter('Platinum')}>
            ♛ Alleen ESPORG Platinum
          </ActionButton>
          <ActionButton variant="secondary" onClick={() => setEsporgFilter('Gold')}>
            🥇 Alleen ESPORG Goud
          </ActionButton>
          <ActionButton
            variant="secondary"
            className="w-full"
            onClick={() => setOnlyCombined((v) => !v)}
          >
            ⏱ Gecombineerde Ruststops {onlyCombined ? '(aan)' : '(uit)'}
          </ActionButton>
          <ActionButton
            variant="utility"
            className="w-full"
            onClick={() => setRequireRestaurant((v) => !v)}
          >
            🍽 Restaurant {requireRestaurant ? '(aan)' : '(uit)'}
          </ActionButton>
          <ActionButton
            variant="slate"
            className="w-full"
            onClick={() => {
              setCardFilter('ALL');
              setEsporgFilter('ALL');
              setOnlyCombined(false);
              setRequireShowers(false);
              setRequireAdBlue(false);
              setRequireRestaurant(false);
              setRequireBosch(false);
            }}
          >
            ↺ Filters Wissen
          </ActionButton>
        </ActionBar>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-700">
            <span className="text-xs text-[#cbd5e1]">Bewaakte corridors</span>
            <p className="text-2xl font-black text-[#f8fafc] mt-1">{priceRows.length}</p>
          </div>
          <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-700">
            <span className="text-xs text-[#cbd5e1]">Gem. Autohof-voordeel</span>
            <p className="text-2xl font-black text-[#10b981] mt-1">
              € {avgDelta.toFixed(3)} / L
            </p>
          </div>
          <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-700">
            <span className="text-xs text-[#cbd5e1]">Beste aanbieding nu</span>
            <p className="text-2xl font-black text-[#38bdf8] mt-1">
              € {bestPrice.toFixed(3)}
            </p>
          </div>
        </div>

        <div
          ref={matrixRef}
          className="bg-[#1e293b] rounded-2xl border border-slate-700 overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-700">
            <h2 className="text-lg font-bold text-[#f8fafc]">Contracted Net-Pricing Matrix</h2>
            <p className="text-xs text-[#cbd5e1]">
              Pompprijs vs. contractnettoprijs
              {cardFilter === 'ALL' ? ' voor alle tankkaarten' : ` voor ${cardFilter}`}
              {' '}— groen = besparing t.o.v. pomp
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-900/60 text-[#cbd5e1] text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3">Station</th>
                  <th className="px-4 py-3">Corridor</th>
                  <th className="px-4 py-3">Pomp €/L</th>
                  {matrixCards.map((card) => (
                    <th key={card} className="px-4 py-3">
                      {card} netto
                    </th>
                  ))}
                  {cardFilter !== 'ALL' && (
                    <th className="px-4 py-3">Besparing / L</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {netPriceMatrix.map((row) => (
                  <tr key={row.station} className="hover:bg-slate-900/40">
                    <td className="px-4 py-3 font-semibold text-[#f8fafc]">{row.station}</td>
                    <td className="px-4 py-3 text-[#cbd5e1]">{row.corridor}</td>
                    <td className="px-4 py-3 font-mono text-red-300">
                      € {row.pumpPrice.toFixed(3)}
                    </td>
                    {matrixCards.map((card) => {
                      const net = row.nets[card];
                      const saving = row.pumpPrice - net;
                      return (
                        <td key={card} className="px-4 py-3 font-mono">
                          <span className="text-[#10b981] font-bold">€ {net.toFixed(3)}</span>
                          {cardFilter === 'ALL' && (
                            <span className="ml-2 text-[11px] font-semibold text-[#38bdf8]">
                              −€ {saving.toFixed(3)}
                            </span>
                          )}
                        </td>
                      );
                    })}
                    {cardFilter !== 'ALL' && (
                      <td className="px-4 py-3 font-bold text-[#38bdf8]">
                        −€ {(row.pumpPrice - row.nets[cardFilter]).toFixed(3)}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-[#1e293b] rounded-2xl border border-slate-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700">
            <h2 className="text-lg font-bold text-[#f8fafc]">Actuele Prijsvergelijking</h2>
            <p className="text-xs text-[#cbd5e1]">
              Snelweg Raststätte vs. nabijgelegen Autohof op vrachtcorridors
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-900/60 text-[#cbd5e1] text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3">Corridor</th>
                  <th className="px-4 py-3">Snelweg Raststätte</th>
                  <th className="px-4 py-3">Snelweg €/L</th>
                  <th className="px-4 py-3">Nabijgelegen Autohof</th>
                  <th className="px-4 py-3">Autohof €/L</th>
                  <th className="px-4 py-3">Verschil / L</th>
                  <th className="px-4 py-3">Kaarten</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {priceRows.map((row) => (
                  <tr key={row.corridor} className="hover:bg-slate-900/40">
                    <td className="px-4 py-3 font-semibold text-[#f8fafc]">{row.corridor}</td>
                    <td className="px-4 py-3 text-[#cbd5e1]">{row.highwayStation}</td>
                    <td className="px-4 py-3 font-mono text-red-300">
                      € {row.highwayPrice.toFixed(3)}
                    </td>
                    <td className="px-4 py-3 text-[#f8fafc]">{row.autohofStation}</td>
                    <td className="px-4 py-3 font-mono text-[#10b981] font-bold">
                      € {row.autohofPrice.toFixed(3)}
                    </td>
                    <td className="px-4 py-3 font-bold text-[#38bdf8]">
                      −€ {row.deltaPerL.toFixed(3)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {row.cards.map((card) => (
                          <span
                            key={card}
                            className="px-2 py-0.5 bg-slate-900 text-[#cbd5e1] font-mono text-[11px] rounded border border-slate-700"
                          >
                            {card}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-[#1e293b] rounded-2xl border border-slate-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700">
            <h2 className="text-lg font-bold text-[#f8fafc]">ESPORG Parkeren & Beveiliging</h2>
            <p className="text-xs text-[#cbd5e1]">
              Brons / Zilver / Goud / Platinum met realtime bezettingspercentages
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
            {parkingRows.map((parking) => {
              const occupancyPct = Math.round(
                (parking.occupiedSpots / parking.totalSpots) * 100
              );
              const isTight = occupancyPct >= 90;
              const levelNl = esporgLabelNl(parking.esporgLevel);
              return (
                <div
                  key={parking.id}
                  className="p-4 bg-slate-900 rounded-xl border border-slate-700 space-y-3"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-[#f8fafc]">{parking.name}</h3>
                      <p className="text-[11px] text-[#cbd5e1]">Corridor {parking.corridor}</p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${esporgBadge(parking.esporgLevel)}`}
                    >
                      ESPORG {levelNl}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-[#cbd5e1]">
                      {parking.occupiedSpots}/{parking.totalSpots} bezet
                    </span>
                    <span className={isTight ? 'text-red-400 font-bold' : 'text-[#10b981] font-bold'}>
                      {occupancyPct}% bezetting
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#0b0f19] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${isTight ? 'bg-red-500' : occupancyPct > 75 ? 'bg-amber-400' : 'bg-[#10b981]'}`}
                      style={{ width: `${occupancyPct}%` }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    {parking.hasCamera && (
                      <span className="px-2 py-1 rounded border border-sky-500/30 text-[#38bdf8]">Camera</span>
                    )}
                    {parking.hasFence && (
                      <span className="px-2 py-1 rounded border border-emerald-500/30 text-emerald-300">Omheining</span>
                    )}
                    {parking.hasShowers && (
                      <span className="px-2 py-1 rounded border border-slate-600 text-[#cbd5e1]">Douches</span>
                    )}
                    {parking.hasAdBluePump && (
                      <span className="px-2 py-1 rounded border border-amber-500/30 text-amber-300">AdBlue</span>
                    )}
                    {parking.hasRestaurant && (
                      <span className="px-2 py-1 rounded border border-slate-600 text-[#cbd5e1]">Restaurant</span>
                    )}
                    {(parking.boschCertified || parking.truckParkingEurope) && (
                      <span className="px-2 py-1 rounded border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-semibold">
                        {parking.boschCertified ? 'Bosch' : 'TPE'} Security
                      </span>
                    )}
                    {parking.combinedRestStop && (
                      <span className="px-2 py-1 rounded border border-amber-500/40 bg-amber-500/10 text-amber-300 font-semibold">
                        Tanken + 45 min rust + dineren
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {parkingRows.length === 0 && (
            <p className="px-5 pb-5 text-sm text-[#cbd5e1]">
              Geen parkeerplaatsen voor dit filter.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
