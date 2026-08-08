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
  mileage?: number;
  year?: number;
  fuel_type?: string;
  status?: string;
}

export default function TrucksPage() {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Enkelvoudig formulier velden
  const [name, setName] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [tankCapacity, setTankCapacity] = useState('600');
  const [avgConsumption, setAvgConsumption] = useState('28.5');
  const [mileage, setMileage] = useState('');
  const [year, setYear] = useState('');

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

  // Enkel voertuig toevoegen (past zich aan op jouw Supabase kolommen)
  const handleAddTruck = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const vehicleName = name || 'Vrachtwagen';
    const newTruck: any = {
      license_plate: licensePlate.toUpperCase(),
      tank_capacity: Number(tankCapacity) || 600,
      avg_consumption: Number(avgConsumption) || 28.5,
      model: vehicleName,
    };

    if (mileage) newTruck.mileage = Number(mileage);
    if (year) newTruck.year = Number(year);

    const { error } = await supabase.from('trucks').insert([newTruck]);

    if (error) {
      alert('Fout bij toevoegen: ' + error.message);
    } else {
      setName('');
      setLicensePlate('');
      setMileage('');
      setYear('');
      setShowForm(false);
      await fetchTrucks();
    }
    setSubmitting(false);
  };

  // Bulk CSV Upload afhandeling
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;

      const lines = text.split('\n').map((line) => line.trim()).filter((line) => line.length > 0);
      if (lines.length < 2) {
        alert('CSV-bestand is leeg of bevat geen data-rijen.');
        return;
      }

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const newTrucks: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim());
        if (values.length < headers.length) continue;

        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });

        if (row.license_plate) {
          const vehicleName = row.name || row.model || 'Vrachtwagen';
          
          // Bouw het object veilig op met gegarandeerde Supabase velden
          const truckObj: any = {
            license_plate: row.license_plate.toUpperCase(),
            model: vehicleName,
            tank_capacity: Number(row.tank_capacity) || 600,
            avg_consumption: Number(row.avg_consumption) || 28.5,
          };

          if (row.mileage && !isNaN(Number(row.mileage))) truckObj.mileage = Number(row.mileage);
          if (row.year && !isNaN(Number(row.year))) truckObj.year = Number(row.year);

          newTrucks.push(truckObj);
        }
      }

      if (newTrucks.length > 0) {
        setSubmitting(true);
        const { error } = await supabase.from('trucks').insert(newTrucks);
        if (error) {
          alert('Fout bij importeren CSV: ' + error.message);
        } else {
          alert(`${newTrucks.length} voertuigen succesvol geïmporteerd!`);
          await fetchTrucks();
        }
        setSubmitting(false);
      } else {
        alert('Geen geldige voertuigen gevonden in het CSV-bestand.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header met Actieknoppen */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-400">Vlootbeheer - Voertuigen</h1>
            <p className="text-slate-400 text-sm mt-1">Overzicht en bulkbeheer van vrachtwagens</p>
          </div>
          <div className="flex items-center gap-3">
            {/* CSV Import Button */}
            <label className="cursor-pointer px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-lg transition text-sm flex items-center gap-2">
              📁 Importeer CSV
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>

            {/* Handmatig Toevoegen Knop */}
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition text-sm"
            >
              {showForm ? '✖ Annuleren' : '+ Voertuig'}
            </button>
          </div>
        </div>

        {/* Formulier */}
        {showForm && (
          <form onSubmit={handleAddTruck} className="p-6 bg-slate-800 rounded-xl border border-blue-500/40 space-y-4">
            <h2 className="text-lg font-bold text-blue-400">Nieuw Voertuig Handmatig Toevoegen</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Merk / Model</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="bijv. Volvo FH 500"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Kenteken</label>
                <input
                  type="text"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                  placeholder="bijv. 12-34-AB"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm uppercase font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Tankinhoud (Liters)</label>
                <input
                  type="number"
                  value={tankCapacity}
                  onChange={(e) => setTankCapacity(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Gem. Verbruik (L / 100km)</label>
                <input
                  type="number"
                  step="0.1"
                  value={avgConsumption}
                  onChange={(e) => setAvgConsumption(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Kilometerstand (km)</label>
                <input
                  type="number"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  placeholder="bijv. 250000"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Bouwjaar</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="bijv. 2021"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm"
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

        {/* Voertuigen Lijst */}
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
                  <div>
                    <h2 className="text-xl font-bold text-white">{truck.model || truck.name || 'Vrachtwagen'}</h2>
                    {truck.year && <span className="text-xs text-slate-400">Bouwjaar: {truck.year}</span>}
                  </div>
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
                  {truck.mileage && (
                    <div>
                      <span className="block text-slate-500">KM-Stand</span>
                      <span className="font-semibold">{truck.mileage.toLocaleString('nl-NL')} km</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}