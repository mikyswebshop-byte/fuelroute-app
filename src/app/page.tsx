'use client';

import React, { useState } from 'react';

type Step = 'cmr' | 'vehicle' | 'tacho' | 'bluetooth' | 'ready';

export default function DriverOnboarding() {
  const [currentStep, setCurrentStep] = useState<Step>('cmr');
  const [cmrScanned, setCmrScanned] = useState(false);
  const [truckPlate, setTruckPlate] = useState('');
  const [trailerPlate, setTrailerPlate] = useState('');
  const [btConnected, setBtConnected] = useState(false);

  return (
    <main className="max-w-xl mx-auto p-4 space-y-6">
      {/* Header Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold text-white">FuelRoute Chauffeur</h1>
          <p className="text-xs text-slate-400">Ritinvoer & Voertuig-check-in</p>
        </div>
        <span className="text-xs font-mono bg-blue-500/20 text-blue-400 px-2.5 py-1 rounded-full border border-blue-500/30">
          Stap: {currentStep.toUpperCase()}
        </span>
      </div>

      {/* STAP 1: VRACHTBRIEF SCAN */}
      {currentStep === 'cmr' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-blue-400">1. Vrachtbrief (CMR) Fotograferen</h2>
          <p className="text-sm text-slate-300">
            Maak een duidelijke foto van de vrachtbrief om de routeberekening en de gewichtsklasse automatisch te starten.
          </p>
          <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center flex flex-col items-center justify-center bg-slate-950">
            <button
              onClick={() => setCmrScanned(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition"
            >
              {cmrScanned ? '✓ Vrachtbrief Gescand' : '📷 Foto van Vrachtbrief maken'}
            </button>
            {cmrScanned && (
              <p className="text-xs text-emerald-400 mt-2">
                CMR verwerkt: Rotterdam → München (24 ton)
              </p>
            )}
          </div>
          <button
            disabled={!cmrScanned}
            onClick={() => setCurrentStep('vehicle')}
            className="w-full py-3 bg-emerald-600 disabled:opacity-50 hover:bg-emerald-500 text-white font-bold rounded-lg transition"
          >
            Volgende: Voertuig & Trailer →
          </button>
        </div>
      )}

      {/* STAP 2: VOERTUIG & TRAILER */}
      {currentStep === 'vehicle' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-blue-400">2. Voertuig & Trailer Registratie</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Vrachtwagen Kenteken / ID</label>
              <input
                type="text"
                placeholder="bv. 45-BJK-8"
                value={truckPlate}
                onChange={(e) => setTruckPlate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Trailer Kenteken / Nummer</label>
              <input
                type="text"
                placeholder="bv. TR-88-ZZ"
                value={trailerPlate}
                onChange={(e) => setTrailerPlate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700">
                📷 Foto Vrachtwagen
              </button>
              <button className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700">
                📷 Foto Trailer Kenteken
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentStep('cmr')}
              className="w-1/3 py-3 bg-slate-800 text-slate-300 font-semibold rounded-lg"
            >
              ← Terug
            </button>
            <button
              disabled={!truckPlate || !trailerPlate}
              onClick={() => setCurrentStep('tacho')}
              className="w-2/3 py-3 bg-emerald-600 disabled:opacity-50 hover:bg-emerald-500 text-white font-bold rounded-lg transition"
            >
              Volgende: Tachometer →
            </button>
          </div>
        </div>
      )}

      {/* STAP 3: DASHBOARD TACHOMETER */}
      {currentStep === 'tacho' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-blue-400">3. Dashboard Tachometer Foto</h2>
          <p className="text-sm text-slate-300">
            Leg de huidige kilometerstand en tachograafstatus vast op foto.
          </p>
          <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center bg-slate-950">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold">
              📷 Foto Dashboard / Kilometerstand
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentStep('vehicle')}
              className="w-1/3 py-3 bg-slate-800 text-slate-300 font-semibold rounded-lg"
            >
              ← Terug
            </button>
            <button
              onClick={() => setCurrentStep('bluetooth')}
              className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition"
            >
              Volgende: Hardware Koppelen →
            </button>
          </div>
        </div>
      )}

      {/* STAP 4: BLUETOOTH & RITTENKASTJE */}
      {currentStep === 'bluetooth' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-blue-400">4. Bluetooth & Boordcomputer Connectie</h2>
          <p className="text-sm text-slate-300">
            Maak verbinding met het rittenkastje en de telematica van de vrachtauto.
          </p>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Rittenkastje (Telematics OBD):</span>
              <span className={btConnected ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                {btConnected ? 'Verbonden' : 'Zoeken...'}
              </span>
            </div>
            <button
              onClick={() => setBtConnected(true)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg border border-slate-700"
            >
              {btConnected ? '✓ Bluetooth Actief' : '⚡ Verbind via Bluetooth'}
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentStep('tacho')}
              className="w-1/3 py-3 bg-slate-800 text-slate-300 font-semibold rounded-lg"
            >
              ← Terug
            </button>
            <button
              disabled={!btConnected}
              onClick={() => setCurrentStep('ready')}
              className="w-2/3 py-3 bg-blue-600 disabled:opacity-50 hover:bg-blue-500 text-white font-bold rounded-lg transition"
            >
              Start Berekening & Route →
            </button>
          </div>
        </div>
      )}

      {/* STAP 5: ROUTE OVERZICHT & TANKADVIES */}
      {currentStep === 'ready' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-center">
            <h2 className="text-xl font-black text-emerald-400">Rit Gevalideerd & Berekend!</h2>
            <p className="text-xs text-slate-300 mt-1">
              Gegevens gesynchroniseerd met planner en tank-module.
            </p>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl text-xs space-y-2 border border-slate-800">
            <div className="flex justify-between text-slate-400">
              <span>Voertuig Combinatie:</span>
              <span className="text-white font-mono">{truckPlate} / {trailerPlate}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Aanbevolen Tankstop:</span>
              <span className="text-blue-400 font-bold">A3 Shell Oberhausen (Grenstank)</span>
            </div>
          </div>
          <button
            onClick={() => setCurrentStep('cmr')}
            className="w-full py-3 bg-slate-800 text-slate-300 font-semibold rounded-lg hover:bg-slate-700"
          >
            Nieuwe Rit Invoeren
          </button>
        </div>
      )}
    </main>
  );
}