'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Truck {
  id: string;
  license_plate: string;
  name?: string;
  model?: string;
  tank_capacity?: number;
  avg_consumption?: number;
}

export default function TrucksPage() {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Formulier velden
  const [name, setName] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [tankCapacity, setTankCapacity] = useState('600');
  const [avgConsumption, setAvgConsumption] = useState('28.5');

  const fetchTrucks = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('trucks').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setTrucks(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTrucks();
  }, []);

  const handleAddTruck = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const newTruck = {
      name: name || 'Vrachtwagen',
      license_plate: licensePlate.toUpperCase(),
      tank_capacity: Number(tankCapacity) || 600,
      avg_consumption: Number(avgConsumption) || 28.5,
    };

    const { error } = await supabase.from('trucks').insert([newTruck]);

    if (error) {
      alert('Fout bij toevoegen: ' + error.message);
    } else {
      // Formulier resetten en herladen
      setName('');
      setLicensePlate('');
      setTankCapacity('600');
      setAvgConsumption('28.5');
      setShowForm(false);
      await fetchTrucks();
    }
    setSubmitting(false);
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header met Actieknop */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-400">Vlootbeheer - Voertuigen</h1>
            <p className="text-slate-400 text-sm mt-1">Overzicht van alle vrachtwagens in het systeem</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition text-sm flex items-center gap-2"
          >
            {showForm ? '✖ Annuleren' : '+ Voertuig Toevoegen'}
          </button>
        </div>

        {/* Uitklapbaar Formulier */}
        {showForm && (
          <form onSubmit={handleAddTruck} className="p-6 bg-slate-800 rounded-xl border border-blue-500/40 space-y-4 animate-fade-in">
            <h2 className="text-lg font-bold text-blue-400">Nieuw Voertuig Toevoegen</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Merk / Model (bijv. Scania R500)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="bijv. Volvo FH 500"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Kenteken
                </label>
                <input
                  type="text"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                  placeholder="bijv. 12-34-AB"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 text-sm uppercase font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Tankinhoud (Liters)
                </label>
                <input
                  type="number"
                  value={tankCapacity}
                  onChange={(e) => setTankCapacity(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Gemiddeld Verbruik (L / 100km)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={avgConsumption}
                  onChange={(e) => setAvgConsumption(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 text-sm"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition text-sm disabled:opacity-50"
              >
                {submitting ? 'Opslaan...' : 'Opslaan in Supabase'}
              </button>
            </div>
          </form>
        )}

        {/* Voertuigen Lijs */}
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
                    <span className="font-semibold">{truck.tank_capacity || 600} Liter</span>
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