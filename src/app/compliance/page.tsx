'use client';

import { useState } from 'react';

export default function CompliancePage() {
  const [fleet] = useState([
    { driver: 'jan de vries', truck: '45-bjk-8', compliance: 95, status: 'ok' },
    { driver: 'pieter smit', truck: '12-34-ab', compliance: 62, status: 'waarschuwing' },
  ]);

  return (
    <main className="p-8 max-w-6xl mx-auto space-y-6 text-slate-200">
      <h1 className="text-3xl font-extrabold text-white">compliance dashboard</h1>
      <p className="text-slate-400">monitor tankgedrag en efficiëntie per chauffeur.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fleet.map((entry) => (
          <div key={entry.truck} className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">{entry.driver}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                entry.status === 'ok' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
              }`}>{entry.compliance}% score</span>
            </div>
            <p className="text-sm text-slate-400">voertuig: {entry.truck}</p>
            <div className="mt-4 w-full bg-slate-900 h-2 rounded-full overflow-hidden">
              <div style={{ width: `${entry.compliance}%` }} className={`h-full ${entry.compliance > 80 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}