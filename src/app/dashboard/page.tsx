'use client';

import React from 'react';

export default function DashboardPage() {
  return (
    <main className="max-w-7xl mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Eigenaar & Directie Dashboard</h1>
          <p className="text-sm text-slate-400">Totaaloverzicht vloot, kosten, besparingen en ROI</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400">Actieve Ritten</span>
          <p className="text-2xl font-black text-white mt-1">12 Vrachtwagens</p>
        </div>
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400">Brandstof Besparing (Maand)</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">€ 4.850,-</p>
        </div>
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400">Compliance & CO2 Score</span>
          <p className="text-2xl font-black text-blue-400 mt-1">98.4%</p>
        </div>
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400">Totaal Gereden KM</span>
          <p className="text-2xl font-black text-purple-400 mt-1">42.300 km</p>
        </div>
      </div>
    </main>
  );
}