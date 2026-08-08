'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface FuelStation {
  id: string;
  name: string;
  brand: string;
  address: string;
  price_diesel: number;
  price_euro95: number;
}

export default function Home() {
  const [stations, setStations] = useState<FuelStation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStations() {
      const { data, error } = await supabase.from('fuel_stations').select('*');
      if (!error && data) {
        setStations(data);
      }
      setLoading(false);
    }
    fetchStations();
  }, []);

  return (
    <main className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-blue-400">FuelRoute - Tankstations</h1>
        
        {loading ? (
          <p className="text-slate-400">Gegevens laden uit Supabase...</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {stations.map((station) => (
              <div key={station.id} className="p-5 bg-slate-800 rounded-xl border border-slate-700">
                <h2 className="text-xl font-bold text-white">{station.name}</h2>
                <p className="text-slate-400 text-sm">{station.address}</p>
                <div className="mt-4 flex justify-between border-t border-slate-700 pt-3">
                  <div>
                    <span className="block text-xs text-slate-400">Diesel</span>
                    <span className="font-semibold text-green-400">€{station.price_diesel}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400">Euro 95</span>
                    <span className="font-semibold text-blue-400">€{station.price_euro95}</span>
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