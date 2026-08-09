'use client';

import { useMemo, useState } from 'react';
import { ActionBar, ActionButton } from '@/components/ActionBar';
import { AddVehicleModal } from '@/components/AddVehicleModal';
import { DocumentUploadPanel } from '@/components/DocumentUploadPanel';
import { useLanguage } from '@/components/LanguageProvider';
import { RoleGate } from '@/components/RoleGate';
import { ServiceRequestModal } from '@/components/ServiceRequestModal';
import { scrollToId } from '@/lib/access';
import {
  fleetTrucks,
  maintenanceSchedule,
  type FleetTruckRow,
  type MaintenanceItem,
} from '@/lib/mock-data';
import { telematicaLabel } from '@/lib/ui-labels';

const MAINTENANCE_TYPE_LABEL: Record<MaintenanceItem['type'], string> = {
  grote_beurt: 'Grote beurt',
  banden: 'Bandenwissel',
  olie: 'Olieverversing',
  apk: 'APK / keuring',
};

function formatKm(n: number) {
  return Math.max(0, n).toLocaleString('nl-NL');
}

export default function TrucksPage() {
  const { t } = useLanguage();
  const [trucks, setTrucks] = useState<FleetTruckRow[]>(fleetTrucks);
  const [filter, setFilter] = useState<'all' | 'online' | 'lowfuel'>('all');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [serviceFlash, setServiceFlash] = useState<string | null>(null);
  const [maintenanceList, setMaintenanceList] = useState<MaintenanceItem[]>(maintenanceSchedule);

  const rows = useMemo(() => {
    if (filter === 'online') return trucks.filter((t) => t.telematics === 'Online');
    if (filter === 'lowfuel') return trucks.filter((t) => t.fuelLevel < 25);
    return trucks;
  }, [filter, trucks]);

  const serviceTrucks = useMemo(
    () => trucks.map((t) => ({ truckId: t.truckId, plate: t.licensePlate })),
    [trucks]
  );

  return (
    <main className="min-h-screen p-6" style={{ background: '#0b0f19' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#38bdf8]">{t('trucks_title')}</h1>
            <p className="text-[#cbd5e1] text-sm mt-1">{t('trucks_subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            {(
              [
                ['all', 'Alle'],
                ['online', 'Verbonden'],
                ['lowfuel', 'Lage tank'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`px-3 py-2 rounded-lg text-xs font-bold border transition ${
                  filter === key
                    ? 'bg-sky-500/20 text-[#38bdf8] border-sky-500/40'
                    : 'bg-[#1e293b] text-[#cbd5e1] border-slate-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <ActionBar title="Voertuigen & onderhoud">
          <ActionButton variant="primary" onClick={() => setShowAddVehicle(true)}>
            📷 Nieuw Voertuig
          </ActionButton>
          <ActionButton
            variant="secondary"
            onClick={() => {
              setShowServiceModal(true);
              scrollToId('trucks-onderhoud-sectie');
            }}
          >
            🔧 Onderhoud Inplannen
          </ActionButton>
          <ActionButton
            variant="utility"
            onClick={() => scrollToId('voertuigdocumenten-upload')}
          >
            📄 Documenten Upload
          </ActionButton>
        </ActionBar>

        <DocumentUploadPanel />

        {serviceFlash && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300">
            {serviceFlash}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-[#1e293b] border border-slate-700 rounded-xl p-4">
            <span className="text-xs text-[#cbd5e1]">Actieve voertuigen</span>
            <p className="text-xl font-black text-[#f8fafc] mt-1">{trucks.length}</p>
          </div>
          <div className="bg-[#1e293b] border border-slate-700 rounded-xl p-4">
            <span className="text-xs text-[#cbd5e1]">EURO 6</span>
            <p className="text-xl font-black text-[#38bdf8] mt-1">
              {Math.round(
                (trucks.filter((t) => t.euroNorm === 'Euro 6').length / Math.max(trucks.length, 1)) *
                  100
              )}
              %
            </p>
          </div>
          <div className="bg-[#1e293b] border border-slate-700 rounded-xl p-4">
            <span className="text-xs text-[#cbd5e1]">Telematica Verbonden</span>
            <p className="text-xl font-black text-[#10b981] mt-1">
              {trucks.filter((t) => t.telematics === 'Online').length}
            </p>
          </div>
          <div className="bg-[#1e293b] border border-slate-700 rounded-xl p-4">
            <span className="text-xs text-[#cbd5e1]">Lage tank (&lt;25%)</span>
            <p className="text-xl font-black text-amber-400 mt-1">
              {trucks.filter((t) => t.fuelLevel < 25).length}
            </p>
          </div>
        </div>

        <div
          id="trucks-onderhoud-sectie"
          className="bg-[#1e293b] rounded-2xl border border-amber-500/30 p-5 space-y-4"
        >
          <div>
            <h2 className="text-lg font-bold text-[#f8fafc]">🔧 Onderhoud & Bandenwissel Tracker</h2>
            <p className="text-xs text-[#cbd5e1] mt-1">
              Kilometerstand · volgende service · partnerwerkplaats
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {maintenanceList.map((item, idx) => {
              const remaining = item.nextServiceKm - item.odometerKm;
              return (
                <div
                  key={`${item.truckId}-${item.type}-${idx}`}
                  className="rounded-xl border border-slate-600 bg-slate-900/50 px-4 py-3 space-y-1.5"
                >
                  <div className="flex justify-between gap-2 items-start">
                    <div>
                      <p className="text-sm font-bold font-mono text-[#38bdf8]">{item.truckId}</p>
                      <p className="text-[11px] text-[#cbd5e1] font-mono">{item.plate}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-500/40 bg-amber-500/15 text-amber-200 shrink-0">
                      {MAINTENANCE_TYPE_LABEL[item.type]}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-[#f8fafc]">{item.message}</p>
                  <p className="text-xs text-[#cbd5e1]">
                    Nog {formatKm(remaining)} km · teller {formatKm(item.odometerKm)} km
                  </p>
                  {item.partner && (
                    <p className="text-[11px] text-slate-400">Partner · {item.partner}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div
          id="voertuig-tabel"
          className="bg-[#1e293b] rounded-2xl border border-slate-700 overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-700 flex justify-between items-center">
            <h2 className="text-lg font-bold text-[#f8fafc]">Voertuigbeheer Tabel</h2>
            <span className="text-xs text-[#cbd5e1]">{rows.length} regels</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-900/60 text-[#cbd5e1] text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3">Truck-ID</th>
                  <th className="px-4 py-3">Kenteken</th>
                  <th className="px-4 py-3">Model</th>
                  <th className="px-4 py-3">EURO-Status</th>
                  <th className="px-4 py-3">Telematica</th>
                  <th className="px-4 py-3">Brandstofniveau (%)</th>
                  <RoleGate componentId="vehicle_costs">
                    <th className="px-4 py-3">Tankinhoud</th>
                    <th className="px-4 py-3">Verbruik</th>
                  </RoleGate>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {rows.map((truck) => (
                  <tr key={truck.truckId} className="hover:bg-slate-900/40">
                    <td className="px-4 py-3 font-mono text-[#38bdf8]">{truck.truckId}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded border border-amber-500/30 bg-amber-500/10 text-amber-300 font-mono text-xs font-bold">
                        {truck.licensePlate}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#f8fafc]">{truck.model}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-md text-[11px] font-bold bg-emerald-500/15 text-[#10b981] border border-emerald-500/30">
                        {truck.euroNorm}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                          truck.telematics === 'Online'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-700/50 text-slate-300 border-slate-600'
                        }`}
                      >
                        {telematicaLabel(truck.telematics)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={truck.fuelLevel < 20 ? 'text-amber-400 font-bold' : 'text-[#f8fafc]'}>
                        {truck.fuelLevel.toFixed(1)}%
                      </span>
                    </td>
                    <RoleGate componentId="vehicle_costs">
                      <td className="px-4 py-3 text-[#cbd5e1]">{truck.tankCapacity} L</td>
                      <td className="px-4 py-3 text-[#cbd5e1]">{truck.avgConsumption} L/100km</td>
                    </RoleGate>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showServiceModal && (
        <ServiceRequestModal
          trucks={serviceTrucks}
          onClose={() => setShowServiceModal(false)}
          onSubmit={(req) => {
            const truck = trucks.find((t) => t.truckId === req.truckId);
            const plate = truck?.licensePlate ?? req.truckId;
            const label = MAINTENANCE_TYPE_LABEL[req.type];
            setServiceFlash(
              `Serviceverzoek ingediend: ${label} voor ${req.truckId} bij ${req.partner}`
            );
            setMaintenanceList((prev) => [
              {
                truckId: req.truckId,
                plate,
                odometerKm: 0,
                nextServiceKm: 0,
                message: `${label} aangevraagd${req.note ? ` — ${req.note}` : ''}`,
                type: req.type,
                partner: req.partner,
              },
              ...prev,
            ]);
          }}
        />
      )}

      {showAddVehicle && (
        <AddVehicleModal
          nextIndex={trucks.length + 1}
          onClose={() => setShowAddVehicle(false)}
          onAdd={(truck, draft) => {
            setTrucks((prev) => [truck, ...prev]);
            setServiceFlash(
              `Voertuig toegevoegd via AI-scan: ${draft.licensePlate} · ${draft.model} · VIN ${draft.vin.slice(0, 8)}…`
            );
            scrollToId('voertuig-tabel');
          }}
        />
      )}
    </main>
  );
}
