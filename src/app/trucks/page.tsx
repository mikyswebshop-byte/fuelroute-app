'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Truck {
  id: string;
  license_plate: string;
  model?: string;
  name?: string;
  tank_capacity?: number;
  tank_capacity_liters?: number;
  avg_consumption?: number;
  mileage?: number;
  year?: number;
}

export default function TrucksPage() {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Formulier velden
  const [model, setModel] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [tankCapacity, setTankCapacity] = useState('600');
  const [avgConsumption, setAvgConsumption] = useState('28.5');
  const [mileage, setMileage] = useState('');
  const [year, setYear] = useState('');

  const fetchTrucks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('trucks')
      .select('*')
      .order('created_at', { ascending: false });

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

    const vehicleName = model || 'Vrachtwagen';
    const capacity = Number(tankCapacity) || 600;
    const consumption = Number(avgConsumption) || 28.5;

    const newTruck: any = {
      license_plate: licensePlate.toUpperCase().trim(),
      model: vehicleName,
      tank_capacity: capacity,
      tank_capacity_liters: capacity,
      avg_consumption: consumption,
    };

    if (mileage) newTruck.mileage = Number(mileage);
    if (year) newTruck.year = Number(year);

    const { error } = await supabase.from('trucks').insert([newTruck]);

    if (error) {
      alert('Fout bij toevoegen: ' + error.message);
    } else {
      setModel('');
      setLicensePlate('');
      setMileage('');
      setYear('');
      setShowForm(false);
      await fetchTrucks();
    }
    setSubmitting(false);
  };

  const handleDeleteTruck = async (id: string, licensePlate: string) => {
    const confirmDelete = window.confirm(`Weet je zeker dat je voertuig ${licensePlate} wilt verwijderen?`);
    if (!confirmDelete) return;

    setDeletingId(id);
    const { error } = await supabase.from('trucks').delete().eq('id', id);

    if (error) {
      alert('Fout bij verwijderen: ' + error.message);
    } else {
      await fetchTrucks();
    }
    setDeletingId(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        if (!text) return;

        const cleanedText = text.replace(/^\uFEFF/, '');
        const lines = cleanedText
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter((line) => line.length > 0);

        if (lines.length < 2) {
          alert('Het CSV-bestand is leeg of bevat geen gegevens.');
          return;
        }

        const firstLine = lines[0];
        let delimiter = ',';
        if (firstLine.includes(';')) delimiter = ';';
        else if (firstLine.includes('\t')) delimiter = '\t';

        const parseLine = (line: string) =>
          line.split(delimiter).map((v) => v.trim().replace(/^["']|["']$/g, ''));

        const rawHeaders = parseLine(lines[0]).map((h) => h.toLowerCase());
        const rowsToInsert: any[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = parseLine(lines[i]);
          if (values.length === 0 || (values.length === 1 && !values[0])) continue;

          const rowData: Record<string, string> = {};
          rawHeaders.forEach((header, idx) => {
            rowData[header] = values[idx] || '';
          });

          const licensePlateVal =
            rowData['license_plate'] ||
            rowData['kenteken'] ||
            rowData['license'] ||
            rowData['plate'] ||
            values[0];

          if (licensePlateVal && licensePlateVal.length >= 4) {
            const vehicleName =
              rowData['model'] ||
              rowData['merk'] ||
              rowData['name'] ||
              rowData['naam'] ||
              'Vrachtwagen';

            const rawCap =
              rowData['tank_capacity_liters'] ||
              rowData['tank_capacity'] ||
              rowData['tankinhoud'] ||
              rowData['tank'];
            const capacity = rawCap && !isNaN(Number(rawCap.replace(',', '.')))
              ? Number(rawCap.replace(',', '.'))
              : 600;

            const rawCons =
              rowData['avg_consumption'] ||
              rowData['avg_consumption_l_100km'] ||
              rowData['verbruik'];
            const consumption = rawCons && !isNaN(Number(rawCons.replace(',', '.')))
              ? Number(rawCons.replace(',', '.'))
              : 28.5;

            const rawKm = rowData['mileage'] || rowData['km'] || rowData['kilometerstand'];
            const mileageVal = rawKm && !isNaN(Number(rawKm.replace(',', '.')))
              ? Number(rawKm.replace(',', '.'))
              : undefined;

            const rawYear = rowData['year'] || rowData['bouwjaar'];
            const yearVal = rawYear && !isNaN(Number(rawYear)) ? Number(rawYear) : undefined;

            const item: any = {
              license_plate: licensePlateVal.toUpperCase().trim(),
              model: vehicleName,
              tank_capacity: capacity,
              tank_capacity_liters: capacity,
              avg_consumption: consumption,
            };

            if (mileageVal !== undefined) item.mileage = mileageVal;
            if (yearVal !== undefined) item.year = yearVal;

            rowsToInsert.push(item);
          }
        }

        if (rowsToInsert.length === 0) {
          alert('Geen geldige kentekens gevonden in het CSV-bestand.');
          return;
        }

        setSubmitting(true);
        const { error } = await supabase.from('trucks').insert(rowsToInsert);

        if (error) {
          alert('Fout bij opslaan in database: ' + error.message);
        } else {
          alert(`Gelukt! ${rowsToInsert.length} voertuig(en) succesvol geïmporteerd!`);
          await fetchTrucks();
        }
      } catch (err: any) {
        alert('Fout bij verwerken bestand: ' + (err?.message || 'Onbekende fout'));
      } finally {
        setSubmitting(false);
        e.target.value = '';
      }
    };

    reader.readAsText(file);
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-400">Vlootbeheer - Voertuigen</h1>
            <p className="text-slate-400 text-sm mt-1">Overzicht, bulkbeheer en bewerken van vrachtwagens</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-lg transition text-sm flex items-center gap-2">
              📁 Importeer CSV
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition text-sm"
            >
              {showForm ? '✖ Annuleren' : '+ Voertuig'}
            </button>
          </div>
        </div>

        {/* Handmatig Toevoegen Formulier */}
        {showForm && (
          <form onSubmit={handleAddTruck} className="p-6 bg-slate-800 rounded-xl border border-blue-500/40 space-y-4">
            <h2 className="text-lg font-bold text-blue-400">Nieuw Voertuig Toevoegen</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Merk / Model</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="bijv. DAF XF 480"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Kenteken</label>
                <input
                  type="text"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                  placeholder="bijv. 45-BJK-8"
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
                  placeholder="bijv. 342000"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Bouwjaar</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="bijv. 2020"
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
                {submitting ? 'Opslaan...' : 'Opslaan in Database'}
              </button>
            </div>
          </form>
        )}

        {/* Voertuigen Lijst */}
        {loading ? (
          <p className="text-slate-400">Voertuigen laden uit database...</p>
        ) : trucks.length === 0 ? (
          <div className="p-6 bg-slate-800 rounded-xl border border-slate-700 text-center">
            <p className="text-slate-300">Geen voertuigen gevonden in de database.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {trucks.map((truck) => {
              const capacity = truck.tank_capacity_liters || truck.tank_capacity || 600;
              const consumption = truck.avg_consumption || 28.5;
              const vehicleName = truck.model || truck.name || 'Vrachtwagen';

              return (
                <div key={truck.id} className="p-5 bg-slate-800 rounded-xl border border-slate-700 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold text-white">{vehicleName}</h2>
                      {truck.year && <span className="text-xs text-slate-400">Bouwjaar: {truck.year}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 rounded font-mono text-xs font-semibold">
                        {truck.license_plate}
                      </span>
                      <button
                        onClick={() => handleDeleteTruck(truck.id, truck.license_plate)}
                        disabled={deletingId === truck.id}
                        title="Voertuig verwijderen"
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition disabled:opacity-50"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 border-t border-slate-700 pt-3">
                    <div>
                      <span className="block text-slate-500">Tankinhoud</span>
                      <span className="font-semibold">{capacity} Liter</span>
                    </div>
                    <div>
                      <span className="block text-slate-500">Gem. Verbruik</span>
                      <span className="font-semibold">{consumption} L / 100km</span>
                    </div>
                    {truck.mileage && (
                      <div>
                        <span className="block text-slate-500">KM-Stand</span>
                        <span className="font-semibold">{Number(truck.mileage).toLocaleString('nl-NL')} km</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}