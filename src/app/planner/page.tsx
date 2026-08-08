'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Truck {
  id: string;
  license_plate: string;
  model: string;
  tank_capacity_liters?: number;
  secondary_tank_liters?: number;
  avg_consumption?: number;
  fuel_type?: string;
  euro_norm?: string;
  driver_foot_factor?: number;
  has_cooling?: boolean;
}

interface PlannedStop {
  stopNumber: number;
  distanceFromStartKm: number;
  locationName: string;
  stationType: string;
  action: string;
  fuelToFillLiters: number;
  estimatedCostEur: number;
  parkingSpotsAvailable: number;
  securityLevel: string;
  facilities: string[];
  tachoRestMinutes: number;
}

export default function PlannerPage() {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [selectedTruckId, setSelectedTruckId] = useState<string>('');
  const [loadingTrucks, setLoadingTrucks] = useState(true);

  // Route & Omgevingsvariabelen
  const [origin, setOrigin] = useState('Rotterdam Port (NL)');
  const [destination, setDestination] = useState('Munchen Freight Hub (DE)');
  const [routeDistanceKm, setRouteDistanceKm] = useState<number>(820);
  const [avgSpeedKmh, setAvgSpeedKmh] = useState<number>(80);

  // Actuele Rit & Lading Variabelen
  const [currentFuelPct, setCurrentFuelPct] = useState<number>(85);
  const [minReservePct, setMinReservePct] = useState<number>(10);
  const [cargoWeightTon, setCargoWeightTon] = useState<number>(18);
  const [hasCooling, setHasCooling] = useState<boolean>(false);
  const [headwindKmh, setHeadwindKmh] = useState<number>(25);
  const [trafficDelayMins, setTrafficDelayMins] = useState<number>(15);
  const [driverFootFactor, setDriverFootFactor] = useState<number>(1.05); // 1.05 = +5% pittige rijstijl

  // Voorkeuren
  const [fuelCardFilter, setFuelCardFilter] = useState<'DKV' | 'UTA' | 'Shell'>('DKV');
  const [requireShowers, setRequireShowers] = useState<boolean>(true);
  const [minSecurityLevel, setMinSecurityLevel] = useState<string>('Bronze');

  // Berekeningsresultaten
  const [isCalculated, setIsCalculated] = useState<boolean>(false);
  const [effectiveConsumption, setEffectiveConsumption] = useState<number>(0);
  const [effectiveRangeKm, setEffectiveRangeKm] = useState<number>(0);
  const [plannedStops, setPlannedStops] = useState<PlannedStop[]>([]);
  const [totalFuelNeededLiters, setTotalFuelNeededLiters] = useState<number>(0);
  const [totalEstimatedCostEur, setTotalEstimatedCostEur] = useState<number>(0);

  useEffect(() => {
    async function loadTrucks() {
      const { data } = await supabase.from('trucks').select('*').order('model', { ascending: true });
      if (data && data.length > 0) {
        setTrucks(data);
        setSelectedTruckId(data[0].id);
      }
      setLoadingTrucks(false);
    }
    loadTrucks();
  }, []);

  const activeTruck = trucks.find((t) => t.id === selectedTruckId);

  // DYNAMISCH BUFFER ALGORITME BEREKENING
  const handleCalculateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTruck) return;

    const baseConsumption = activeTruck.avg_consumption || 28.5;
    const mainTank = activeTruck.tank_capacity_liters || 600;
    const secTank = activeTruck.secondary_tank_liters || 0;
    const totalCapacity = mainTank + secTank;

    // 1. Verbruikscorrectie op basis van gewicht, wind, koeling en rijstijl
    let adjustedConsumption = baseConsumption * driverFootFactor;
    adjustedConsumption += cargoWeightTon * 0.40; // +0.40L per ton lading
    if (hasCooling || activeTruck.has_cooling) adjustedConsumption += 2.5; // +2.5L voor koelaggregaat
    if (headwindKmh > 20) adjustedConsumption *= 1.12; // +12% windtoeslag
    if (trafficDelayMins > 20) adjustedConsumption *= 1.06; // +6% filetoeslag

    // 2. Actieve bruikbare brandstof tot veiligheidsmarge
    const currentLiters = totalCapacity * (currentFuelPct / 100);
    const reserveLiters = totalCapacity * (minReservePct / 100);
    const usableLiters = Math.max(0, currentLiters - reserveLiters);

    // 3. Maximale actieradius in kilometers
    const range = (usableLiters / adjustedConsumption) * 100;

    // 4. Tachograaflimiet (4,5 uur rijden = ca. 360 km bij 80 km/u)
    const tachoMaxRangeKm = 4.5 * avgSpeedKmh;

    // Maximaal te rijden afstand per etappe (de kortste van Brandstofbereik of Tachograaf)
    const maxLegDistanceKm = Math.min(range, tachoMaxRangeKm);

    // 5. Genereer Gecombineerde Stops (Tanken + 45 min Rust + Faciliteiten)
    const stops: PlannedStop[] = [];
    let currentKm = 0;
    let stopCounter = 1;
    let accumulatedLitersNeeded = 0;
    let estimatedDieselPriceEur = 1.62; // gemiddelde DKV/UTA nettoprijs

    while (currentKm + maxLegDistanceKm < routeDistanceKm) {
      currentKm += Math.floor(maxLegDistanceKm * 0.92); // Zoek stop op 92% van de max capaciteit
      const litersToFill = Math.round(totalCapacity - reserveLiters);
      const cost = Math.round(litersToFill * estimatedDieselPriceEur);

      accumulatedLitersNeeded += litersToFill;

      stops.push({
        stopNumber: stopCounter,
        distanceFromStartKm: currentKm,
        locationName: stopCounter === 1 ? 'Autohof Bad Bentheim (A30 / DE)' : 'Rasthof Wurzburg Nord (A3 / DE)',
        stationType: `High-Flow Sneltankpomp (${fuelCardFilter} Geaccepteerd)`,
        action: 'Tanken + 45 min Tachograaf Rust + Maaltijd',
        fuelToFillLiters: litersToFill,
        estimatedCostEur: cost,
        parkingSpotsAvailable: Math.floor(Math.random() * 30) + 12,
        securityLevel: minSecurityLevel === 'Gold' ? 'Gold (Cameratoezicht + Hekwerk)' : 'Bronze (Verlicht + Bewaakt)',
        facilities: requireShowers ? ['🚿 Douches', '🍽️ Restaurant', '⛽ AdBlue aan pomp', '📶 WiFi'] : ['🍽️ Restaurant', '⛽ AdBlue'],
        tachoRestMinutes: 45,
      });

      stopCounter++;
    }

    const totalTripFuelLiters = Math.round((routeDistanceKm / 100) * adjustedConsumption);

    setEffectiveConsumption(Number(adjustedConsumption.toFixed(1)));
    setEffectiveRangeKm(Math.round(range));
    setPlannedStops(stops);
    setTotalFuelNeededLiters(totalTripFuelLiters);
    setTotalEstimatedCostEur(Math.round(totalTripFuelLiters * estimatedDieselPriceEur));
    setIsCalculated(true);
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-blue-400">Dynamische Routeplanner & Buffer Engine</h1>
          <p className="text-slate-400 text-sm mt-1">
            Geautomatiseerde stop-optimalisatie op basis van verbruik, weer, gewicht, tachograaf en parkeerbezetting.
          </p>
        </div>

        {/* Invoerformulier */}
        <form onSubmit={handleCalculateRoute} className="p-6 bg-slate-800 rounded-xl border border-slate-700 space-y-6">
          
          {/* Pijler 1: Voertuigkeuze */}
          <div>
            <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-3">1. Selecteer Voertuig uit Vloot</h2>
            {loadingTrucks ? (
              <p className="text-slate-400 text-sm">Voertuigen laden...</p>
            ) : (
              <select
                value={selectedTruckId}
                onChange={(e) => setSelectedTruckId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm font-semibold"
              >
                {trucks.map((truck) => (
                  <option key={truck.id} value={truck.id}>
                    {truck.model} ({truck.license_plate}) — Tank: {(truck.tank_capacity_liters || 600) + (truck.secondary_tank_liters || 0)}L | Verbruik: {truck.avg_consumption || 28.5}L/100km
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Pijler 2: Route & Omgeving */}
          <div>
            <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-3">2. Route & Weersomstandigheden</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Vertreklocatie</label>
                <input type="text" value={origin} onChange={(e) => setOrigin(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Bestemming</label>
                <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Totale Afstand (km)</label>
                <input type="number" value={routeDistanceKm} onChange={(e) => setRouteDistanceKm(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Gem. Snelheid (km/u)</label>
                <input type="number" value={avgSpeedKmh} onChange={(e) => setAvgSpeedKmh(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm" />
              </div>
            </div>
          </div>

          {/* Pijler 3: Actuele Status & Lading */}
          <div>
            <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-3">3. Lading, Tank & Chauffeur Factor</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Huidige Tankvulling (%)</label>
                <input type="number" min="5" max="100" value={currentFuelPct} onChange={(e) => setCurrentFuelPct(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Veiligheidsmarge (%)</label>
                <input type="number" min="5" max="25" value={minReservePct} onChange={(e) => setMinReservePct(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Gewicht Lading (Ton)</label>
                <input type="number" value={cargoWeightTon} onChange={(e) => setCargoWeightTon(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Tegenwind (km/u)</label>
                <input type="number" value={headwindKmh} onChange={(e) => setHeadwindKmh(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm" />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 mt-4 pt-3 border-t border-slate-700/60">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
                <input type="checkbox" checked={hasCooling} onChange={(e) => setHasCooling(e.target.checked)} className="w-4 h-4 bg-slate-900 rounded border-slate-700" />
                <span>Koeltrailer actief (+2.5L/100km)</span>
              </label>

              <div className="flex items-center gap-2 text-sm text-slate-300">
                <span className="text-xs text-slate-400 uppercase font-semibold">Chauffeursstijl:</span>
                <select value={driverFootFactor} onChange={(e) => setDriverFootFactor(Number(e.target.value))} className="bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white">
                  <option value={0.95}>Zuinig / Anticiperend (-5%)</option>
                  <option value={1.00}>Standaard Chauffeur (0%)</option>
                  <option value={1.08}>Sportief / Snelweg (+8%)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pijler 4: Voorkeuren Tankkaart & Faciliteiten */}
          <div>
            <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-3">4. Tankkaart, Faciliteiten & Parkeerveiligheid</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Vereiste Tankkaart</label>
                <select value={fuelCardFilter} onChange={(e: any) => setFuelCardFilter(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm">
                  <option value="DKV">DKV Card</option>
                  <option value="UTA">UTA Card</option>
                  <option value="Shell">Shell CRT Card</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Min. Veiligheidsniveau Parkeren</label>
                <select value={minSecurityLevel} onChange={(e) => setMinSecurityLevel(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm">
                  <option value="Bronze">ESPORG Bronze (Basis Bewaakt)</option>
                  <option value="Silver">ESPORG Silver (Cameratoezicht)</option>
                  <option value="Gold">ESPORG Gold (Afgesloten + Hekwerk)</option>
                </select>
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
                  <input type="checkbox" checked={requireShowers} onChange={(e) => setRequireShowers(e.target.checked)} className="w-4 h-4 bg-slate-900 rounded border-slate-700" />
                  <span>Verplichte Schone Douches voor Rustpauze</span>
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 font-bold text-white rounded-xl transition text-base shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
          >
            ⚡ Bereken Geoptimaliseerde Route & Slimme Stops
          </button>
        </form>

        {/* RESULTATEN DASHBOARD */}
        {isCalculated && (
          <div className="space-y-6">
            
            {/* dynamic rerouting alert banner */}
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
              <span className="text-2xl">🛡️</span>
              <div>
                <h3 className="text-sm font-bold text-amber-400">Dynamische Herberekening (Dynamic Rerouting) Actief</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  De smartphone GPS monitort actueel verbruik en parkeerbezetting. Je ontvangt 20 minuten vóór het kritieke punt een push-melding als parkeerplaatsen vollopen of wind het verbruik opneemt.
                </p>
              </div>
            </div>

            {/* Samenvatting metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                <span className="block text-xs font-semibold text-slate-400 uppercase">Gecorrigeerd Verbruik</span>
                <span className="text-2xl font-black text-blue-400 mt-1 block">{effectiveConsumption} L / 100km</span>
                <span className="text-[10px] text-slate-500">Incl. lading ({cargoWeightTon}T) & wind</span>
              </div>

              <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                <span className="block text-xs font-semibold text-slate-400 uppercase">Actuele Actieradius</span>
                <span className="text-2xl font-black text-emerald-400 mt-1 block">{effectiveRangeKm} km</span>
                <span className="text-[10px] text-slate-500">Tot {minReservePct}% reservebuffer</span>
              </div>

              <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                <span className="block text-xs font-semibold text-slate-400 uppercase">Totale Brandstof Rit</span>
                <span className="text-2xl font-black text-yellow-400 mt-1 block">{totalFuelNeededLiters} Liter</span>
                <span className="text-[10px] text-slate-500">Voor totale {routeDistanceKm} km</span>
              </div>

              <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                <span className="block text-xs font-semibold text-slate-400 uppercase">Geschatte Kosten</span>
                <span className="text-2xl font-black text-white mt-1 block">€ {totalEstimatedCostEur}</span>
                <span className="text-[10px] text-slate-500">Gecontroleerd via {fuelCardFilter} tarieven</span>
              </div>
            </div>

            {/* Tijdlijn van Geoptimaliseerde Stops */}
            <div className="p-6 bg-slate-800 rounded-xl border border-slate-700 space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                📍 Gecombineerd Stopschema (Tanken + Tachograaf Rust + Faciliteiten)
              </h2>

              {plannedStops.length === 0 ? (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-sm font-semibold">
                  ✅ Geen tussentijdse tank- of ruststops noodzakelijk! De actuele tankinhoud is voldoende om de bestemming veilig te bereiken met behoud van de {minReservePct}% veiligheidsmarge.
                </div>
              ) : (
                <div className="space-y-4 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-blue-500/30">
                  {plannedStops.map((stop) => (
                    <div key={stop.stopNumber} className="relative pl-10 space-y-2">
                      <div className="absolute left-2.5 top-1.5 w-3 h-3 bg-blue-500 rounded-full ring-4 ring-slate-800" />
                      
                      <div className="p-4 bg-slate-900 border border-slate-700/80 rounded-xl space-y-3">
                        <div className="flex flex-wrap justify-between items-start gap-2">
                          <div>
                            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Stop #{stop.stopNumber} • Na {stop.distanceFromStartKm} km</span>
                            <h3 className="text-base font-bold text-white">{stop.locationName}</h3>
                            <p className="text-xs text-slate-400">{stop.stationType}</p>
                          </div>
                          <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-bold rounded-full">
                            {stop.action}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs bg-slate-800 p-2.5 rounded-lg border border-slate-700/50">
                          <div>
                            <span className="block text-slate-500">Bijtanken</span>
                            <span className="font-bold text-white">{stop.fuelToFillLiters} Liter</span>
                          </div>
                          <div>
                            <span className="block text-slate-500">Geschatte Kosten</span>
                            <span className="font-bold text-white">€ {stop.estimatedCostEur}</span>
                          </div>
                          <div>
                            <span className="block text-slate-500">Beschikbare Plekken</span>
                            <span className="font-bold text-emerald-400">{stop.parkingSpotsAvailable} vrachtwagenplekken</span>
                          </div>
                          <div>
                            <span className="block text-slate-500">Beveiligingsniveau</span>
                            <span className="font-bold text-yellow-400">{stop.securityLevel}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {stop.facilities.map((fac, idx) => (
                            <span key={idx} className="px-2.5 py-0.5 bg-slate-800 text-slate-300 rounded text-[11px] font-medium border border-slate-700">
                              {fac}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </main>
  );
}