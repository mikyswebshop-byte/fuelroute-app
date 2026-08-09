'use client';

import { useState } from 'react';

export default function CommunityPage() {
  const [feedback] = useState([
    { location: 'Autohof Hamminkeln', rating: 5, note: 'Douches zeer schoon, ruime plekken' },
    { location: 'A3 Parkeerplaats Oberhausen', rating: 2, note: 'Weinig ruimte, douches defect' },
  ]);

  return (
    <main className="p-8 max-w-6xl mx-auto space-y-6 text-slate-200" style={{ background: '#0b0f19' }}>
      <h1 className="text-3xl font-extrabold text-[#f8fafc]">Communityberichten</h1>
      <p className="text-[#cbd5e1]">Realtime updates van collega-chauffeurs op de weg.</p>

      <div className="space-y-4">
        {feedback.map((item, index) => (
          <div key={index} className="bg-[#1e293b] p-5 rounded-2xl border border-slate-700">
            <div className="flex justify-between">
              <h3 className="font-bold text-[#38bdf8]">{item.location}</h3>
              <span className="text-amber-400 text-sm">{'★'.repeat(item.rating)}</span>
            </div>
            <p className="text-sm mt-2 text-[#cbd5e1]">&ldquo;{item.note}&rdquo;</p>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="w-full py-4 border-2 border-dashed border-slate-700 rounded-2xl text-[#cbd5e1] hover:text-white hover:border-[#38bdf8] transition"
      >
        + Voeg feedback toe voor deze locatie
      </button>
    </main>
  );
}
