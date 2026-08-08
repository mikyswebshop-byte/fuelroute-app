'use client';

import React from 'react';

export default function SettingsPage() {
  return (
    <main className="max-w-5xl mx-auto p-4 space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-white">Systeem Instellingen</h1>
        <p className="text-sm text-slate-400 mt-1">
          Beheer integraties, API-koppelingen, gebruikersrollen en bedrijfsparameters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Integraties */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-lg font-semibold text-blue-400">⚡ API & Telematica Koppelingen</h2>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span>Boordcomputer / OBD API</span>
              <span className="text-emerald-400 font-bold">Actief</span>
            </div>
            <div className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span>Brandstofkaart Provider (DKV/UTA)</span>
              <span className="text-emerald-400 font-bold">Gekoppeld</span>
            </div>
            <div className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span>OCR CMR-Scanner Engine</span>
              <span className="text-emerald-400 font-bold">Gereed</span>
            </div>
          </div>
        </div>

        {/* Algemene Parameters */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-lg font-semibold text-blue-400">⚙️ Bedrijfsparameters</h2>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Standaard Maut/Tol Berekening</label>
              <input
                type="text"
                disabled
                value="Euro 6 / 40 Ton Klasse (DE/NL/BE)"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Standaard Brandstof Marge Drempel</label>
              <input
                type="text"
                disabled
                value="€ 0,12 / liter besparingsnorm"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}