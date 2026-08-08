'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Truck } from '@/types/fuelroute';

export default function TrucksPage() {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Uitgebreide formuliervelden
  const [model, setModel] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [tankCapacity, setTankCapacity] = useState('800');
  const [secondaryTank, setSecondaryTank] = useState('0');
  const [avgConsumption, setAvgConsumption] = useState('28.5');
  const [fuelType, setFuelType] = useState<'Diesel' | 'HVO100' | 'LNG'>('Diesel');
  const [euroNorm, setEuroNorm] = useState<'Euro 5' | 'Euro 6' | 'Zero Emission'>('Euro 6');
  const [cargoWeight, setCargoWeight] = useState('0');
  const [hasCooling, setHasCooling] = useState(false);

  const fetchTrucks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('trucks')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTrucks(data as Truck[]);
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

    const newTruck = {
      license_plate: licensePlate.toUpperCase().trim(),
      model: vehicleName,
      tank_capacity_liters: capacity,
      secondary_tank_liters: Number(secondaryTank) || 0,
      avg_consumption: consumption,
      fuel_type: fuelType,
      euro_norm: euroNorm,
      cargo_weight_ton: Number(cargoWeight) || 0,
      has_cooling: hasCooling,
      current_fuel_pct: 100,
      min_reserve_pct: 10,
    };

    const { error } = await supabase.from('trucks').upsert([newTruck], { onConflict: 'license_plate' });

    if (error) {
      alert('Fout bij opslaan: ' + error.message);
    } else {
      setModel('');
      setLicensePlate('');
      setShowForm(false);
      await fetchTrucks();
    }
    setSubmitting(false);
  };

  const handleDeleteTruck = async (id: string, licensePlate: string) => {
    if (!window.confirm(`Voertuig ${licensePlate} verwijderen?`)) return;
    setDeletingId(id);
    await supabase.from('trucks').delete().eq('id', id);
    await fetchTrucks();
    setDeletingId(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = (evt.target?.result as string || '').replace(/^\uFEFF/, '');
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length < 2) return;

        const delimiter = lines[0].includes(';') ? ';' : ',';
        const parseLine = (line: string) => line.split(delimiter).map(v => v.trim().replace(/^["']|["']$/g, ''));
        const headers = parseLine(lines[0]).map(h => h.toLowerCase());

        const rowsMap = new Map();

        for (let i = 1; i < lines.length; i++) {
          const values = parseLine(lines[i]);
          if (!values[0]) continue;

          const rowData: Record<string, string> = {};
          headers.forEach((h, idx) => { rowData[h] = values[idx] || ''; });

          const plate = rowData['license_plate'] || rowData['kenteken'] || values[0];
          if (plate && plate.length >= 4) {
            const formattedPlate = plate.toUpperCase().trim();
            const cap = Number((rowData['tank_capacity_liters'] || rowData['tankinhoud'] || '600').replace(',', '.'));
            const cons = Number((rowData['avg_consumption'] || rowData['verbruik'] || '28.5').replace(',', '.'));

            rowsMap.set(formattedPlate, {
              license_plate: formattedPlate,
              model: rowData['model'] || rowData['merk'] || 'Vrachtwagen',
              tank_capacity_liters: isNaN(cap) ? 600 : cap,
              avg_consumption: isNaN(cons) ? 28.5 : cons,
              fuel_type: rowData['fuel_type'] || 'Diesel',
              euro_norm: rowData['euro_norm'] || 'Euro 6',
              current_fuel_pct: 100,
              min_reserve_pct: 10,
            });
          }
        }

        const rows = Array.from(rowsMap.values());
        if (rows.length > 0) {
          setSubmitting(true);
          await supabase.from('trucks').upsert(rows, { onConflict: 'license_plate' });
          await fetchTrucks();
          alert(`Gelukt! ${rows.length} voertuigen succesvol verwerkt met alle variabelen!`);
        }
      } catch (err: any) {
        alert('Fout bij importeren: ' + err.message);
      } finally {
        setSubmitting(false);
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-400">Vlootbeheer - Voertuigen</h1>
            <p className="text-slate-400 text-sm mt-1">Gecentraliseerd beheer inclusief verbruik, gewicht en tankmarges</p>
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

        {/* Handmatig Toevoegen Formulier met Alle Variabelen */}
        {showForm && (
          <form onSubmit={handleAddTruck} className="p-6 bg-slate-800 rounded-xl border border-blue-500/40 space-y-4">
            <h2 className="text-lg font-bold text-blue-400">Nieuwe Truck & Variabelen Opslaan</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Merk / Model</label>
                <input type="text" value={model} onChange={(e) => setModel(e.target.value)} placeholder="DAF XF 480" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Kenteken</label>
                <input type="text" value={licensePlate} onChange={(e) => setLicensePlate(e.target.value)} placeholder="45-BJK-8" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm font-mono" required />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Brandstoftype</label>
                <select value={fuelType} onChange={(e: any) => setFuelType(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm">
                  <option value="Diesel">Diesel</option>
                  <option value="HVO100">HVO100</option>
                  <option value="LNG">LNG</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Hoofdtank (Liters)</label>
                <input type="number" value={tankCapacity} onChange={(e) => setTankCapacity(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm" required />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Secundaire Tank (Liters)</label>
                <input type="number" value={secondaryTank} onChange={(e) => setSecondaryTank(e.target.value)} placeholder="0" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Gem. Verbruik (L/100km)</label>
                <input type="number" step="0.1" value={avgConsumption} onChange={(e) => setAvgConsumption(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm" required />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Lading Gewicht (Ton)</label>
                <input type="number" value={cargoWeight} onChange={(e) => setCargoWeight(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">EmissieKlasse</label>
                <select value={euroNorm} onChange={(e: any) => setEuroNorm(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm">
                  <option value="Euro 6">Euro 6</option>
                  <option value="Euro 5">Euro 5</option>
                  <option value="Zero Emission">Zero Emission</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input type="checkbox" id="cooling" checked={hasCooling} onChange={(e) => setHasCooling(e.target.checked)} className="w-4 h-4 rounded bg-slate-900 border-slate-700" />
                <label htmlFor="cooling" className="text-sm text-slate-300">Koeltrailer aanwezig</label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="submit" disabled={submitting} className="px-5 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition text-sm">
                {submitting ? 'Opslaan...' : 'Opslaan in Database'}
              </button>
            </div>
          </form>
        )}

        {/* Voertuigen Grid met uitgebreide specificaties */}
        {loading ? (
          <p className="text-slate-400">Voertuigen & variabelen laden uit database...</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {trucks.map((truck) => {
              const capacity = (truck.tank_capacity_liters || 600) + (truck.secondary_tank_liters || 0);

              return (
                <div key={truck.id} className="p-5 bg-slate-800 rounded-xl border border-slate-700 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold text-white">{truck.model || 'Vrachtwagen'}</h2>
                      <span className="text-xs text-blue-400 font-semibold">{truck.fuel_type || 'Diesel'} • {truck.euro_norm || 'Euro 6'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 rounded font-mono text-xs font-semibold">
                        {truck.license_plate}
                      </span>
                      <button onClick={() => handleDeleteTruck(truck.id, truck.license_plate)} disabled={deletingId === truck.id} className="p-1.5 text-slate-400 hover:text-red-400">🗑️</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs text-slate-300 border-t border-slate-700 pt-3">
                    <div>
                      <span className="block text-slate-500">Capaciteit</span>
                      <span className="font-semibold">{capacity} Liter</span>
                    </div>
                    <div>
                      <span className="block text-slate-500">Basisverbruik</span>
                      <span className="font-semibold">{truck.avg_consumption || 28.5} L/100km</span>
                    </div>
                    <div>
                      <span className="block text-slate-500">Veiligheidsreserve</span>
                      <span className="font-semibold">{truck.min_reserve_pct || 10}%</span>
                    </div>
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