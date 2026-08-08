'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Station {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  clearance_height_m: number;
  has_high_flow_pump: boolean;
  has_adblue: boolean;
  accepted_cards: string[];
  diesel_price_eur: number;
  is_operational: boolean;
}

interface Parking {
  id: string;
  name: string;
  total_spots: number;
  occupied_spots: number;
  esporg_security_level: string;
  has_showers: boolean;
  has_restaurant: boolean;
}

export default function StationsPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cardFilter, setCardFilter] = useState<string>('ALL');
  const [minSecurity, setMinSecurity] = useState<string>('ALL');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data: stationData } = await supabase.from('stations').select('*');
      const { data: parkingData } = await supabase.from('parkings').select('*');

      if (stationData && stationData.length > 0) {
        setStations(stationData);
      } else {
        // Fallback mockdata als de tabel nog leeg is
        setStations([
          {
            id: '1',
            name: 'Shell Autohof Bad Bentheim (A30)',
            latitude: 52.301,
            longitude: 7.158,
            clearance_height_m: 4.5,
            has_high_flow_pump: true,
            has_adblue: true,
            accepted_cards: ['DKV', 'UTA', 'Shell'],
            diesel_price_eur: 1.629,
            is_operational: true,
          },
          {
            id: '2',
            name: 'TotalEnergies Rasthof Würzburg Nord (A3)',
            latitude: 49.792,
            longitude: 9.953,
            clearance_height_m: 4.2,
            has_high_flow_pump: true,
            has_adblue: true,
            accepted_cards: ['DKV', 'UTA'],
            diesel_price_eur: 1.659,
            is_operational: true,
          },
          {
            id: '3',
            name: 'ARAL Truckstop Venlo (A67)',
            latitude: 51.37,
            longitude: 6.17,
            clearance_height_m: 4.0,
            has_high_flow_pump: true,
            has_adblue: true,
            accepted_cards: ['DKV', 'UTA', 'BP'],
            diesel_price_eur: 1.599,
            is_operational: true,
          },
        ]);
      }

      if (parkingData && parkingData.length > 0) {
        setParkings(parkingData);
      } else {
        setParkings([
          {
            id: '1',
            name: 'Parkplatz Bad Bentheim Nord',
            total_spots: 80,
            occupied_spots: 68,
            esporg_security_level: 'Gold',
            has_showers: true,
            has_restaurant: true,
          },
          {
            id: '2',
            name: 'Truck Parking Würzburg A3',
            total_spots: 120,
            occupied_spots: 112,
            esporg_security_level: 'Silver',
            has_showers: true,
            has_restaurant: true,
          },
        ]);
      }
      setLoading(false);
    }

    fetchData();
  }, []);

  const filteredStations = stations.filter((s) => {
    if (cardFilter !== 'ALL' && !s.accepted_cards?.includes(cardFilter)) return false;
    return true;
  });

  return (
    <main className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-400">Tankstations & Parkeerbeheer</h1>
            <p className="text-slate-400 text-sm mt-1">
              Realtime status van high-flow pompen, doorrijhoogtes, ESPORG beveiliging en faciliteiten.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Filter Tankkaart</label>
            <select
              value={cardFilter}
              onChange={(e) => setCardFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white font-medium"
            >
              <option value="ALL">Alle Tankkaarten</option>
              <option value="DKV">DKV Card</option>
              <option value="UTA">UTA Card</option>
              <option value="Shell">Shell Card</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">ESPORG Beveiliging</label>
            <select
              value={minSecurity}
              onChange={(e) => setMinSecurity(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white font-medium"
            >
              <option value="ALL">Alle Niveaus</option>
              <option value="Gold">Gold (Hekwerk & Cameratoezicht)</option>
              <option value="Silver">Silver (Bewaakt)</option>
              <option value="Bronze">Bronze (Basis)</option>
            </select>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <p className="text-slate-400">Locatiegegevens en live bezetting laden...</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Tankstations Lijst */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                ⛽ Geschikte Vrachtwagen Tankstations ({filteredStations.length})
              </h2>

              {filteredStations.map((station) => (
                <div key={station.id} className="p-5 bg-slate-800 rounded-xl border border-slate-700 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-white">{station.name}</h3>
                      <p className="text-xs text-slate-400">
                        Doorrijhoogte: <span className="text-blue-400 font-bold">{station.clearance_height_m}m</span>
                      </p>
                    </div>
                    <span className="text-lg font-black text-emerald-400">
                      € {station.diesel_price_eur.toFixed(3)} <span className="text-[10px] text-slate-400 font-normal">/ L</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-700/60">
                    {station.has_high_flow_pump && (
                      <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs rounded-md font-semibold">
                        ⚡ High-Flow Sneltankpomp
                      </span>
                    )}
                    {station.has_adblue && (
                      <span className="px-2.5 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs rounded-md font-semibold">
                        💧 AdBlue aan Pomp
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 pt-2">
                    <span className="text-xs text-slate-500 font-medium">Geaccepteerd:</span>
                    {station.accepted_cards?.map((card, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-900 text-slate-300 font-mono text-[11px] rounded border border-slate-700">
                        {card}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Parkeerterreinen & Bezettingsgraad */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                🅿️ Parkeerterreinen & Realtime Bezettingsgraad
              </h2>

              {parkings.map((parking) => {
                const occupancyPct = Math.round((parking.occupied_spots / parking.total_spots) * 100);
                const isFull = occupancyPct >= 90;

                return (
                  <div key={parking.id} className="p-5 bg-slate-800 rounded-xl border border-slate-700 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-white">{parking.name}</h3>
                        <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-xs font-semibold rounded mt-1 inline-block">
                          ESPORG {parking.esporg_security_level} Beveiliging
                        </span>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-bold ${isFull ? 'text-red-400' : 'text-emerald-400'}`}>
                          {parking.occupied_spots} / {parking.total_spots} bezet
                        </span>
                        <span className="block text-[11px] text-slate-400">{occupancyPct}% vulgraad</span>
                      </div>
                    </div>

                    {/* Bezettingsbalk */}
                    <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${isFull ? 'bg-red-500' : occupancyPct > 75 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${occupancyPct}%` }}
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-2 text-xs text-slate-300">
                      {parking.has_showers && <span>🚿 Warm Douches</span>}
                      {parking.has_restaurant && <span>🍽️ Restaurant & Warm Eten</span>}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

      </div>
    </main>
  );
}