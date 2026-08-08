export const dynamic = 'force-dynamic';

import { supabase } from '@/lib/supabase';

interface Station {
  id: string;
  name: string;
  brand: string;
  address: string;
  price_euro95: number;
  price_diesel: number;
}

export default async function Home() {
  const { data: stations, error } = await supabase.from('fuel_stations').select('*');

  return (
    <main className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-blue-400">FuelRoute Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Actueel overzicht van aangesloten tankstations en prijzen</p>
        </div>

        {error ? (
          <div className="p-4 bg-red-900/50 border border-red-700 text-red-200 rounded-lg">
            Fout bij het ophalen van gegevens: {error.message}
          </div>
        ) : !stations || stations.length === 0 ? (
          <div className="p-6 bg-slate-800 rounded-xl border border-slate-700 text-center">
            <p className="text-slate-300">Nog geen tankstations gevonden.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {stations.map((station: Station) => (
              <div key={station.id} className="p-5 bg-slate-800 rounded-xl border border-slate-700 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-white">{station.name}</h2>
                    <p className="text-xs text-slate-400">{station.address}</p>
                  </div>
                  <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs font-mono">
                    {station.brand}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-700 pt-3">
                  <div>
                    <span className="block text-slate-500">Euro 95</span>
                    <span className="text-green-400 font-bold text-sm">€ {station.price_euro95}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500">Diesel</span>
                    <span className="text-blue-400 font-bold text-sm">€ {station.price_diesel}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}