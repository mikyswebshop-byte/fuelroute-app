'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Truck {
  id: string;
  license_plate: string;
  name?: string;
  model?: string;
  tank_capacity?: number;
  avg_consumption?: number;
}

interface Station {
  id: string;
  name: string;
  brand: string;
  address: string;
  price_diesel: number;
}

export default function PlannerPage() {
  const [origin, setOrigin] = useState('Veendam');
  const [destination, setDestination] = useState('Praag');
  const [distanceKm, setDistanceKm] = useState<number>(780);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [selectedTruckId, setSelectedTruckId] = useState<string>('');
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      const { data: tData } = await supabase.from('trucks').select('*');
      const { data: sData } = await supabase.from('fuel_stations').select('*');
      
      if (tData && tData.length > 0) {
        setTrucks(tData);
        setSelectedTruckId(tData[0].id);
      }
      if (sData) {
        setStations(sData);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedTruck = trucks.find((t) => t.id === selectedTruckId) || {
      name: 'DAF XF 480',
      license_plate: '45-BJK-8',
      avg_consumption: 28.5,
      tank_capacity: 600,
    };

    const consumptionRate = selectedTruck.avg_consumption || 28.5;
    const totalLitersNeeded = (distanceKm * consumptionRate) / 100;

    // Zoek het goedkoopste diesel tankstation uit de database
    const cheapestStation = stations.length > 0
      ? stations.reduce((min, s) => (s.price_diesel < min.price_diesel ? s : min), stations[0])
      : { name: 'Tango Tankstation', price_diesel: 1.619, brand: 'Tango' };

    const totalCost = totalLitersNeeded * (cheapestStation.price_diesel || 1.619);

    setResult({
      truck: selectedTruck,
      distanceKm,
      totalLitersNeeded: totalLitersNeeded.toFixed(1),
      cheapestStation,
      totalCost: totalCost.toFixed(2),
    });
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-blue-400">Route & Tankplanner</h1>
          <p className="text-slate-400 text-sm mt-1">Bereken de benodigde brandstof en goedkoopste tankstops op jouw route.</p>
        </div>

        <form onSubmit={handleCalculate} className="p-6 bg-slate-800 rounded-xl border border-slate-700 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Vertrekpunt</label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Bestemming</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Geschatte Afstand (km)</label>
              <input
                type="number"
                value={distanceKm}
                onChange={(e) => setDistanceKm(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Selecteer Voertuig</label>
              <select
                value={selectedTruckId}
                onChange={(e) => setSelectedTruckId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
              >
                {loading ? (
                  <option>Laden...</option>
                ) : trucks.length === 0 ? (
                  <option value="">Geen vrachtwagen beschikbaar</option>
                ) : (
                  trucks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name || t.model || 'Vrachtwagen'} ({t.license_plate})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition"
          >
            Bereken Route & Brandstofkosten
          </button>
        </form>

        {result && (
          <div className="p-6 bg-slate-800 rounded-xl border border-blue-500/30 space-y-4">
            <h2 className="text-xl font-bold text-green-400">Berekening Voltooid</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm border-t border-slate-700 pt-4">
              <div>
                <span className="block text-slate-500 text-xs">Voertuig</span>
                <span className="font-semibold text-white">{result.truck.name || result.truck.model || 'DAF XF'}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-xs">Afstand</span>
                <span className="font-semibold text-white">{result.distanceKm} km</span>
              </div>
              <div>
                <span className="block text-slate-500 text-xs">Nodig Diesel</span>
                <span className="font-semibold text-blue-400">{result.totalLitersNeeded} Liter</span>
              </div>
              <div>
                <span className="block text-slate-500 text-xs">Est. Kosten</span>
                <span className="font-semibold text-green-400">€ {result.totalCost}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-900 rounded-lg border border-slate-700 mt-4">
              <span className="text-xs text-slate-400 block mb-1">Aanbevolen Goedkoopste Tankstop:</span>
              <div className="flex justify-between items-center">
                <span className="font-bold text-white">{result.cheapestStation.name} ({result.cheapestStation.brand})</span>
                <span className="text-green-400 font-mono text-sm">€ {result.cheapestStation.price_diesel} / L</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}