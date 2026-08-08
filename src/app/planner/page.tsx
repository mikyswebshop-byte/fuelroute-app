'use client';

import { useState } from 'react';

export default function PlannerPage() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [maxDetour, setMaxDetour] = useState(5);
  const [fuelType, setFuelType] = useState('diesel');
  const [calculated, setCalculated] = useState(false);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (origin && destination) {
      setCalculated(true);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-400">Route & Tankplanner</h1>
          <p className="text-slate-400 mt-1">
            Bereken de meest voordelige brandstofstops langs jouw route.
          </p>
        </div>

        {/* Invoerformulier */}
        <form onSubmit={handleCalculate} className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Vertrekpunt</label>
              <input
                type="text"
                placeholder="Bijv. Rotterdam Port"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Bestemming</label>
              <input
                type="text"
                placeholder="Bijv. München"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Max. Omrijden (km)</label>
              <input
                type="number"
                value={maxDetour}
                onChange={(e) => setMaxDetour(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                min="1"
                max="50"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Brandstof</label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="diesel">Diesel</option>
                <option value="euro95">Euro 95</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 font-semibold rounded-lg transition"
          >
            Route & Tankstops Berekenen
          </button>
        </form>

        {/* Resultaat weergave */}
        {calculated && (
          <div className="bg-slate-800 p-6 rounded-xl border border-blue-500/30 space-y-4">
            <h2 className="text-xl font-bold text-green-400">Route Berekend</h2>
            <div className="text-sm text-slate-300 space-y-1">
              <p><strong>Van:</strong> {origin}</p>
              <p><strong>Naar:</strong> {destination}</p>
              <p><strong>Maximale omrij-afstand:</strong> {maxDetour} km</p>
            </div>
            <div className="p-4 bg-slate-900 rounded-lg border border-slate-700 text-xs text-slate-400">
              Geselecteerde goedkoopste stop: <strong>Tango Tankstation</strong> (€1.619/L)
            </div>
          </div>
        )}
      </div>
    </main>
  );
}