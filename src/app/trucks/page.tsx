'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Truck {
  id: string;
  license_plate: string;
  name?: string;
  model?: string;
  tank_capacity?: number;
  tank_capacity_liters?: number;
  avg_consumption?: number;
}

export default function TrucksPage() {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrucks() {
      const { data, error } = await supabase.from('trucks').select('*');
      if (!error && data) {
        setTrucks(data);
      }
      setLoading(false);
    }
    fetchTrucks();
  }, []);

  return (
    <main className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-blue-400">Vlootbeheer - Voertuigen</h1>
          <p className="text-slate-400 text-sm mt-1">Overzicht van alle vrachtwagens in het systeem</p>
        </div>

        {loading ? (
          <p className="text-slate-400">Voertuigen laden uit Supabase...</p>
        ) : trucks.length === 0 ? (
          <div className="p-6 bg-slate-800 rounded-xl border border-slate-700 text-center">
            <p className="text-slate-300">Geen voertuigen gevonden in de database.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {trucks.map((truck) => (
              <div key={truck.id} className="p-5 bg-slate-800 rounded-xl border border-slate-700 space-y-3">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-bold text-white">{truck.name || truck.model || 'Vrachtwagen'}</h2>
                  <span className="px-2.5 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 rounded font-mono text-xs font-semibold">
                    {truck.license_plate}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 border-t border-slate-700 pt-3">
                  <div>
                    <span className="block text-slate-500">Tankinhoud</span>
                    <span className="font-semibold">{truck.tank_capacity || truck.tank_capacity_liters || 600} Liter</span>
                  </div>
                  <div>
                    <span className="block text-slate-500">Gem. Verbruik</span>
                    <span className="font-semibold">{truck.avg_consumption || 28.5} L / 100km</span>
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