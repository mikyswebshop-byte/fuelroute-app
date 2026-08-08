'use client';

import React, { useState } from 'react';

interface RouteTemplate {
  truck: string;
  trailer: string;
  cargo: string;
  weight: string;
  origin: string;
  destination: string;
}

export default function DriverPage() {
  const [activeTemplate, setActiveTemplate] = useState<RouteTemplate | null>(null);

  const startCmrTemplate = () => {
    // Genereert automatisch een compleet sjabloon
    setActiveTemplate({
      truck: 'DAF XF 480 (45-BJK-8)',
      trailer: 'Kogel Schmitz Cool (TR-88-ZZ)',
      cargo: 'Gekoelde Levensmiddelen',
      weight: '22 Ton',
      origin: 'Rotterdam Port (NL)',
      destination: 'München Distribution Hub (DE)'
    });
  };

  return (
    <main className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Chauffeurs Portaal</h1>
          <p className="text-sm text-slate-400">Snelstart voor ritten, CMR-scans en voertuigkoppeling</p>
        </div>
        <button
          onClick={startCmrTemplate}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-lg shadow-lg shadow-emerald-900/40 transition flex items-center gap-2"
        >
          <span>📷</span> Start Route met CMR / Scan
        </button>
      </div>

      {/* Automatisch Gegenereerd Sjabloon */}
      {activeTemplate ? (
        <div className="bg-slate-900 border border-emerald-500/40 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-lg font-semibold text-emerald-400">✓ Actief CMR Sjabloon Gegenereerd</h2>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30">
              Gekoppeld & Berekening Gestart
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Vrachtwagen & Trailer</span>
              <p className="font-bold text-white">{activeTemplate.truck}</p>
              <p className="text-xs text-slate-300">{activeTemplate.trailer}</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Lading & Gewicht</span>
              <p className="font-bold text-white">{activeTemplate.cargo}</p>
              <p className="text-xs text-slate-300">{activeTemplate.weight}</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Traject</span>
              <p className="font-bold text-white">{activeTemplate.origin}</p>
              <p className="text-xs text-slate-300">➔ {activeTemplate.destination}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2">
            <button className="py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg border border-slate-700">
              📷 Foto Dashboard / Tacho
            </button>
            <button className="py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg border border-slate-700">
              ⚡ Bluetooth Telematica Sync
            </button>
            <button className="py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg border border-slate-700">
              ⛽ Grenstank Stop Advies
            </button>
            <button className="py-2.5 bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white rounded-lg">
              🗺️ Navigatie Openen
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-3">
          <p className="text-slate-400 text-sm">
            Nog geen actieve rit. Klik op **"Start Route met CMR"** om direct een sjabloon voor vrachtwagen, trailer en lading te genereren.
          </p>
        </div>
      )}
    </main>
  );
}