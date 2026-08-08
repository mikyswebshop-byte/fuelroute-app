'use client';

import { useState } from 'react';

export default function AccountingPage() {
  // Voorbeeld data van gescande documenten
  const [documents] = useState([
    { id: 'cmr-001', type: 'vrachtbrief', date: '2026-08-08', truck: '45-bjk-8', status: 'verwerkt' },
    { id: 'bon-102', type: 'tankbon', date: '2026-08-07', truck: '45-bjk-8', status: 'pendent' },
  ]);

  return (
    <main className="p-8 max-w-6xl mx-auto space-y-6 text-slate-200">
      <div>
        <h1 className="text-3xl font-extrabold text-white">boekhouding</h1>
        <p className="text-slate-400 mt-1">beheer hier alle gescande vrachtbrieven en tankbonnen.</p>
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900/50 text-slate-400">
            <tr>
              <th className="p-4">id</th>
              <th className="p-4">type</th>
              <th className="p-4">datum</th>
              <th className="p-4">voertuig</th>
              <th className="p-4">status</th>
              <th className="p-4">actie</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {documents.map((doc) => (
              <tr key={doc.id}>
                <td className="p-4 font-mono">{doc.id}</td>
                <td className="p-4 capitalize">{doc.type}</td>
                <td className="p-4">{doc.date}</td>
                <td className="p-4 uppercase">{doc.truck}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                    doc.status === 'verwerkt' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {doc.status}
                  </span>
                </td>
                <td className="p-4">
                  <button className="text-blue-400 hover:text-blue-300 underline text-xs">bekijken</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex gap-4">
        <button className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition text-sm">
          exporteer naar pdf
        </button>
      </div>
    </main>
  );
}