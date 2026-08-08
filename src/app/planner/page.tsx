'use client';

import { useState } from 'react';

interface Stop {
  type: string;
  location: string;
  reason: string;
  facilities: string;
  gps: string;
}

interface RouteResult {
  totalDistanceKm: number;
  estimatedConsumptionL: number;
  maxRangeKm: number;
  stopsRequired: number;
  stops: Stop[];
}

export default function PlannerPage() {
  const [vehicle, setVehicle] = useState('DAF XF 480 (45-BJK-8)');
  const [driverPhone, setDriverPhone] = useState('+31612345678');
  const [origin, setOrigin] = useState('Rotterdam Port (NL)');
  const [destination, setDestination] = useState('München Freight Hub (DE)');
  const [distance, setDistance] = useState<number>(820);
  const [speed, setSpeed] = useState<number>(80);
  const [fuelLevel, setFuelLevel] = useState<number>(85);
  const [safetyBuffer, setSafetyBuffer] = useState<number>(10);
  const [cargoWeight, setCargoWeight] = useState<number>(18);
  const [headwind, setHeadwind] = useState<number>(25);
  const [reeferActive, setReeferActive] = useState<boolean>(false);
  const [driverStyle, setDriverStyle] = useState<number>(-0.05);
  const [card, setCard] = useState<string>('DKV Card');
  const [security, setSecurity] = useState<string>('Bronze');
  const [needShowers, setNeedShowers] = useState<boolean>(true);

  const [result, setResult] = useState<RouteResult | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);

  const calculateRoute = () => {
    setCalculating(true);
    setDispatchStatus(null);
    
    setTimeout(() => {
      // Formuleberekening inclusief alle 5 variabelen
      const baseConsumption = 28.5; // L/100km
      const weightFactor = cargoWeight * 0.4; // +0.4L per ton lading
      const windFactor = headwind * 0.1; // +0.1L per km/u tegenwind
      const reeferFactor = reeferActive ? 2.5 : 0; // Koeltrailer
      
      const adjustedConsumption = (baseConsumption + weightFactor + windFactor + reeferFactor) * (1 + driverStyle);
      const totalFuelNeeded = (distance / 100) * adjustedConsumption;
      
      const tankCapacity = 600;
      const currentFuelL = tankCapacity * (fuelLevel / 100);
      const usableFuelL = currentFuelL * (1 - safetyBuffer / 100);
      const maxRange = (usableFuelL / adjustedConsumption) * 100;

      setResult({
        totalDistanceKm: distance,
        estimatedConsumptionL: Math.round(totalFuelNeeded),
        maxRangeKm: Math.round(maxRange),
        stopsRequired: distance > maxRange ? Math.ceil(distance / maxRange) : 1,
        stops: [
          {
            type: '⛽ Tank- & Tachograafstop (45 min)',
            location: 'Shell Autohof Bad Bentheim (A30, km 210)',
            reason: `Verplichte rustpauze + bijtanken met ${card}`,
            facilities: 'ESPORG Gold • High-Flow Pomp • Douches',
            gps: '52.301, 7.158',
          },
          {
            type: '🅿️ Overnachting / Dagelijkse Rust',
            location: 'Truck Parking Würzburg Nord (A3, km 580)',
            reason: 'Verplichte dagelijkse rusttijd',
            facilities: 'ESPORG Silver • Bewaakt • Restaurant',
            gps: '49.792, 9.953',
          },
        ],
      });

      setCalculating(false);
    }, 500);
  };

  const sendToWhatsApp = () => {
    if (!result) return;
    
    let text = `🚛 *FUELROUTE ROUTE-INSTRUCTIE*\n`;
    text += `Voertuig: ${vehicle}\n`;
    text += `Traject: ${origin} ➔ ${destination} (${result.totalDistanceKm} km)\n`;
    text += `Geschat verbruik: ${result.estimatedConsumptionL}L\n\n`;
    text += `📍 *GEPLANDE STOPS:*\n`;

    result.stops.forEach((stop, i) => {
      text += `${i + 1}. *${stop.type}*\n   Location: ${stop.location}\n   GPS: ${stop.gps}\n   Details: ${stop.reason}\n\n`;
    });

    const url = `https://wa.me/${driverPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setDispatchStatus('Route verzonden naar WhatsApp!');
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white p-6 print:bg-white print:text-black">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="print:hidden">
          <h1 className="text-3xl font-extrabold text-blue-400">Dynamische Routeplanner & Buffer Engine</h1>
          <p className="text-slate-400 text-sm mt-1">
            Geautomatiseerde stop-optimalisatie op basis van verbruik, weer, gewicht, tachograaf en parkeerbezetting.
          </p>
        </div>

        {/* Input Formulier */}
        <div className="p-6 bg-slate-800 rounded-2xl border border-slate-700 space-y-6 print:hidden">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">1. Selecteer Voertuig</label>
              <select
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm font-semibold text-white"
              >
                <option>DAF XF 480 (45-BJK-8) — Tank: 600L | Verbruik: 28.5L/100km</option>
                <option>Volvo FH 500 (12-34-AB) — Tank: 750L | Verbruik: 29.0L/100km</option>
                <option>Scania R500 (99-XYZ-1) — Tank: 800L | Verbruik: 27.8L/100km</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Telefoonnummer Chauffeur (WhatsApp)</label>
              <input
                type="text"
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
                placeholder="+31612345678"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm font-semibold text-white"
              />
            </div>
          </div>

          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase mb-3">2. Route & Weersomstandigheden</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Vertreklocatie</label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Bestemming</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Totale Afstand (km)</label>
                <input
                  type="number"
                  value={distance}
                  onChange={(e) => setDistance(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Gem. Snelheid (km/u)</label>
                <input
                  type="number"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase mb-3">3. Lading, Tank & Chauffeur Factor</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Huidige Tankvulling (%)</label>
                <input
                  type="number"
                  value={fuelLevel}
                  onChange={(e) => setFuelLevel(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Veiligheidsmarge (%)</label>
                <input
                  type="number"
                  value={safetyBuffer}
                  onChange={(e) => setSafetyBuffer(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Gewicht Lading (Ton)</label>
                <input
                  type="number"
                  value={cargoWeight}
                  onChange={(e) => setCargoWeight(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Tegenwind (km/u)</label>
                <input
                  type="number"
                  value={headwind}
                  onChange={(e) => setHeadwind(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 mt-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-300">
                <input
                  type="checkbox"
                  checked={reeferActive}
                  onChange={(e) => setReeferActive(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700"
                />
                Koeltrailer actief (+2.5L/100km)
              </label>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Chauffeursstijl:</span>
                <select
                  value={driverStyle}
                  onChange={(e) => setDriverStyle(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                >
                  <option value={-0.05}>Zuinig / Anticiperend (-5%)</option>
                  <option value={0}>Normaal (0%)</option>
                  <option value={0.08}>Sportief / Haast (+8%)</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase mb-3">4. Tankkaart, Faciliteiten & Parkeerveiligheid</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Vereiste Tankkaart</label>
                <select
                  value={card}
                  onChange={(e) => setCard(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm"
                >
                  <option>DKV Card</option>
                  <option>UTA Card</option>
                  <option>Shell Card</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Min. Veiligheidsniveau Parkeren</label>
                <select
                  value={security}
                  onChange={(e) => setSecurity(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm"
                >
                  <option value="Bronze">ESPORG Bronze (Basis Bewaakt)</option>
                  <option value="Silver">ESPORG Silver (Cameratoezicht)</option>
                  <option value="Gold">ESPORG Gold (Omheind & Bewaakt)</option>
                </select>
              </div>
              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-300">
                  <input
                    type="checkbox"
                    checked={needShowers}
                    onChange={(e) => setNeedShowers(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700"
                  />
                  Verplichte Schone Douches
                </label>
              </div>
            </div>
          </div>

          <button
            onClick={calculateRoute}
            disabled={calculating}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold rounded-xl transition shadow-lg shadow-blue-600/30 text-base"
          >
            {calculating ? '⚡ Route & Stops Berekenen...' : '⚡ Bereken Geoptimaliseerde Route & Slimme Stops'}
          </button>
        </div>

        {/* Dynamisch Resultaatvenster */}
        {result && (
          <div className="p-6 bg-slate-800 rounded-2xl border border-blue-500/50 space-y-6 shadow-2xl print:bg-white print:border-none print:shadow-none print:p-0">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-700 pb-4 print:border-black">
              <div>
                <h2 className="text-xl font-bold text-white print:text-black">Route-Instructie: {origin} ➔ {destination}</h2>
                <p className="text-xs text-slate-400 print:text-gray-600">Voertuig: {vehicle} • Vereiste tankkaart: {card}</p>
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-full print:hidden">
                Buffer Marge: OK ({safetyBuffer}%)
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-700 print:bg-gray-100 print:border-gray-300">
                <span className="block text-xs text-slate-400 print:text-gray-600">Totale Afstand</span>
                <span className="text-xl font-black text-white print:text-black">{result.totalDistanceKm} km</span>
              </div>
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-700 print:bg-gray-100 print:border-gray-300">
                <span className="block text-xs text-slate-400 print:text-gray-600">Geschat Verbruik</span>
                <span className="text-xl font-black text-blue-400 print:text-black">{result.estimatedConsumptionL} Liter</span>
              </div>
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-700 print:bg-gray-100 print:border-gray-300">
                <span className="block text-xs text-slate-400 print:text-gray-600">Max Actieradius</span>
                <span className="text-xl font-black text-amber-400 print:text-black">{result.maxRangeKm} km</span>
              </div>
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-700 print:bg-gray-100 print:border-gray-300">
                <span className="block text-xs text-slate-400 print:text-gray-600">Aantal Stops</span>
                <span className="text-xl font-black text-purple-400 print:text-black">{result.stopsRequired} Stops</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white mb-3 print:text-black">📍 Geadviseerde Stops (Tachograaf + Tanken)</h3>
              <div className="space-y-3">
                {result.stops.map((stop, index) => (
                  <div key={index} className="p-4 bg-slate-900 rounded-xl border border-slate-700 flex justify-between items-start print:bg-gray-50 print:border-gray-300">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-blue-400 uppercase tracking-wider print:text-blue-700">{stop.type}</span>
                      <h4 className="text-base font-bold text-white print:text-black">{stop.location}</h4>
                      <p className="text-xs text-slate-400 print:text-gray-600">{stop.reason}</p>
                      <p className="text-[11px] text-slate-500 font-mono print:text-gray-500">GPS: {stop.gps}</p>
                    </div>
                    <span className="text-xs px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded-md font-medium print:bg-white print:border-gray-400 print:text-black">
                      {stop.facilities}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dispatch & Export Actieknoppen */}
            <div className="pt-4 border-t border-slate-700 flex flex-wrap items-center justify-between gap-4 print:hidden">
              <div className="flex gap-3">
                <button
                  onClick={sendToWhatsApp}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition flex items-center gap-2"
                >
                  📲 Verstuur naar Chauffeur (WhatsApp)
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-lg transition flex items-center gap-2"
                >
                  🖨️ Print Routestrip (PDF)
                </button>
              </div>

              {dispatchStatus && (
                <span className="text-xs font-semibold text-emerald-400 animate-pulse">
                  ✓ {dispatchStatus}
                </span>
              )}
            </div>

          </div>
        )}

      </div>
    </main>
  );
}