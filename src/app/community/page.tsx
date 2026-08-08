'use client';

import { useState } from 'react';

export default function CommunityPage() {
  const [feedback] = useState([
    { location: 'autohof hamminkeln', rating: 5, note: 'douches zeer schoon, ruime plekken' },
    { location: 'a3 parkeerplaats oberhausen', rating: 2, note: 'weinig ruimte, douches defect' },
  ]);

  return (
    <main className="p-8 max-w-6xl mx-auto space-y-6 text-slate-200">
      <h1 className="text-3xl font-extrabold text-white">community feed</h1>
      <p className="text-slate-400">real-time updates van collega chauffeurs op de weg.</p>

      <div className="space-y-4">
        {feedback.map((item, index) => (
          <div key={index} className="bg-slate-800 p-5 rounded-2xl border border-slate-700">
            <div className="flex justify-between">
              <h3 className="font-bold text-blue-400">{item.location}</h3>
              <span className="text-amber-400 text-sm">{'★'.repeat(item.rating)}</span>
            </div>
            <p className="text-sm mt-2 text-slate-300">"{item.note}"</p>
          </div>
        ))}
      </div>

      <button className="w-full py-4 border-2 border-dashed border-slate-700 rounded-2xl text-slate-400 hover:text-white hover:border-blue-500 transition">
        + voeg feedback toe voor deze locatie
      </button>
    </main>
  );
}