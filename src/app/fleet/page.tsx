'use client';

import { useEffect, useMemo, useState } from 'react';
import { ActionBar, ActionButton } from '@/components/ActionBar';
import { AddVehicleModal } from '@/components/AddVehicleModal';
import { DocumentUploadPanel } from '@/components/DocumentUploadPanel';
import { useLanguage } from '@/components/LanguageProvider';
import { RoleGate } from '@/components/RoleGate';
import { ServiceRequestModal } from '@/components/ServiceRequestModal';
import { scrollToId } from '@/lib/access';
import {
  communityParkingEvents,
  fleetAlerts,
  fleetTrucks,
  geofenceDestinations,
  maintenanceSchedule,
  trailerTracking,
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

function telematicsBadge(status: string) {
  return status === 'Online'
    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    : 'bg-slate-700/50 text-slate-300 border-slate-600';
}

function GeofenceRadiusRing({
  distanceKm,
  radiusKm,
  inside,
}: {
  distanceKm: number;
  radiusKm: number;
  inside: boolean;
}) {
  const size = 72;
  const stroke = 7;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const proximity = Math.max(0, Math.min(1, 1 - distanceKm / (radiusKm * 2)));
  const offset = c * (1 - proximity);
  const color = inside ? '#10b981' : '#38bdf8';

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#0f172a"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[11px] font-black text-[#f8fafc]">{radiusKm} km</span>
        <span className="text-[9px] text-[#cbd5e1]">radius</span>
      </div>
    </div>
  );
}

function TrailerMiniMap({ lat, lng }: { lat: number; lng: number }) {
  const cols = 8;
  const rows = 5;
  const cellLat = Math.min(rows - 1, Math.max(0, Math.round(((lat - 51.0) / 0.5) * (rows - 1))));
  const cellLng = Math.min(cols - 1, Math.max(0, Math.round(((lng - 4.0) / 6) * (cols - 1))));

  return (
    <div className="rounded-lg border border-slate-600 bg-slate-900/80 p-2">
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: rows * cols }, (_, i) => {
          const row = Math.floor(i / cols);
          const col = i % cols;
          const active = row === cellLat && col === cellLng;
          return (
            <span
              key={i}
              className={`aspect-square rounded-full ${
                active ? 'bg-emerald-400 shadow shadow-emerald-500/50' : 'bg-slate-700'
              }`}
            />
          );
        })}
      </div>
      <p className="mt-1.5 text-[10px] font-mono text-[#cbd5e1] text-center">
        {lat.toFixed(3)}, {lng.toFixed(3)}
      </p>
      <p className="mt-1 text-[10px] text-slate-400 text-center leading-snug">
        Pallet-Grid laadruimte (33/34 posities) • Groen = IoT GPS / Lading Sensor Active
      </p>
    </div>
  );
}

function parseCsv(text: string): Partial<FleetTruckRow>[] {
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].split(/[;,]/).map((h) => h.trim().toLowerCase());
  const idx = (names: string[]) => headers.findIndex((h) => names.includes(h));

  const iId = idx(['truckid', 'truck_id', 'id']);
  const iPlate = idx(['kenteken', 'licenseplate', 'license_plate', 'plaat']);
  const iModel = idx(['model', 'type']);
  const iDriver = idx(['chauffeur', 'driver']);
  const iCard = idx(['tankkaart', 'fuelcard', 'card']);

  return lines.slice(1).map((line, n) => {
    const cols = line.split(/[;,]/).map((c) => c.trim());
    return {
      truckId: cols[iId] || `IMPORT-${String(n + 1).padStart(3, '0')}`,
      licensePlate: cols[iPlate] || `XX-${n + 1}`,
      model: cols[iModel] || 'Onbekend model',
      driver: cols[iDriver] || 'Onbekend',
      location: cols[iCard] ? `Kaart ${cols[iCard]}` : 'Import — nog niet toegewezen',
      fuelLevel: 65,
      activeSavings: 0,
      compliance: 'Compliant' as const,
      euroNorm: 'Euro 6' as const,
      telematics: 'Offline' as const,
      tankCapacity: 900,
      avgConsumption: 28,
    };
  });
}

export default function FleetPage() {
  const { t } = useLanguage();
  const [trucks, setTrucks] = useState<FleetTruckRow[]>(fleetTrucks);
  const [showImport, setShowImport] = useState(false);
  const [importPreview, setImportPreview] = useState<Partial<FleetTruckRow>[]>([]);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [parkingFeed, setParkingFeed] = useState(communityParkingEvents);
  const [alertFilter, setAlertFilter] = useState<'all' | 'diefstal' | 'schade'>('all');
  const [geofenceNotify, setGeofenceNotify] = useState<string | null>(null);
  const [showTrailers, setShowTrailers] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [serviceFlash, setServiceFlash] = useState<string | null>(null);
  const [maintenanceList, setMaintenanceList] = useState<MaintenanceItem[]>(maintenanceSchedule);

  useEffect(() => {
    const action = new URLSearchParams(window.location.search).get('action');
    if (action === 'service') {
      setShowServiceModal(true);
    }
  }, []);

  const online = trucks.filter((t) => t.telematics === 'Online').length;
  const serviceTrucks = useMemo(
    () => trucks.map((t) => ({ truckId: t.truckId, plate: t.licensePlate })),
    [trucks]
  );
  const alertsByTruck = useMemo(() => {
    const map = new Map<string, typeof fleetAlerts>();
    for (const a of fleetAlerts) {
      const list = map.get(a.truckId) ?? [];
      list.push(a);
      map.set(a.truckId, list);
    }
    return map;
  }, []);

  const visibleAlerts = fleetAlerts.filter(
    (a) => alertFilter === 'all' || a.type === alertFilter
  );

  const handleFile = async (file: File) => {
    const name = file.name.toLowerCase();
    if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
      // Demo: xlsx zonder zware parser — genereer voorbeeldrijen
      const demo = Array.from({ length: 52 }, (_, n) => ({
        truckId: `BULK-${String(n + 1).padStart(3, '0')}`,
        licensePlate: `${10 + (n % 90)}-IMP-${String(n + 1).padStart(2, '0')}`,
        model: n % 2 === 0 ? 'DAF XF 480' : 'Volvo FH 500',
        driver: `Chauffeur Import ${n + 1}`,
        location: `Kaart ${n % 3 === 0 ? 'DKV' : n % 3 === 1 ? 'UTA' : 'Shell'}`,
        fuelLevel: 50 + (n % 40),
        activeSavings: 0,
        compliance: 'Compliant' as const,
        euroNorm: 'Euro 6' as const,
        telematics: 'Offline' as const,
        tankCapacity: 900,
        avgConsumption: 28,
      }));
      setImportPreview(demo);
      setImportStatus(`${file.name}: ${demo.length} rijen voorbereid (Excel-demo-import)`);
      return;
    }

    const text = await file.text();
    const rows = parseCsv(text);
    setImportPreview(rows);
    setImportStatus(`${file.name}: ${rows.length} rijen voorbereid`);
  };

  const commitImport = () => {
    const next: FleetTruckRow[] = importPreview.map((r, i) => ({
      truckId: r.truckId ?? `IMP-${i}`,
      licensePlate: r.licensePlate ?? `XX-${i}`,
      model: r.model ?? 'Import',
      driver: r.driver ?? 'Onbekend',
      location: r.location ?? 'Import',
      fuelLevel: r.fuelLevel ?? 60,
      activeSavings: r.activeSavings ?? 0,
      compliance: r.compliance ?? 'Compliant',
      euroNorm: r.euroNorm ?? 'Euro 6',
      telematics: r.telematics ?? 'Offline',
      tankCapacity: r.tankCapacity ?? 900,
      avgConsumption: r.avgConsumption ?? 28,
    }));
    setTrucks((prev) => [...next, ...prev]);
    setImportStatus(`${next.length} trucks/chauffeurs/kaarten toegevoegd aan de vloot`);
    setShowImport(false);
    setImportPreview([]);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6" style={{ background: '#0b0f19' }}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#f8fafc]">{t('fleet_title')}</h1>
          <p className="text-[#cbd5e1] mt-1">{t('fleet_subtitle')}</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-[#10b981]">
          {online}/{trucks.length} Verbonden
        </span>
      </div>

      <ActionBar title="Onderhoud">
        <ActionButton variant="primary" onClick={() => setShowAddVehicle(true)}>
          📷 Nieuw Voertuig
        </ActionButton>
        <ActionButton
          variant="secondary"
          onClick={() => {
            setShowServiceModal(true);
            scrollToId('onderhoud-sectie');
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

      <ActionBar title="Enterprise vlootmodules">
        <RoleGate componentId="geofence_sms">
          <ActionButton
            variant="primary"
            onClick={() => {
              setShowTrailers(false);
              scrollToId('geofencing-sectie');
            }}
          >
            📍 Geofencing & Klantnotificaties
          </ActionButton>
        </RoleGate>
        <ActionButton
          variant="secondary"
          onClick={() => {
            setShowTrailers(true);
            scrollToId('trailer-sectie');
          }}
        >
          🚛 Trailer-Tracking
        </ActionButton>
        <RoleGate componentId="geofence_sms">
          <ActionButton
            variant="utility"
            onClick={() => {
              setGeofenceNotify('SMS/e-mail verzonden: aankomst binnen 5 km');
              scrollToId('geofencing-sectie');
            }}
          >
            📡 Simuleer Geofence-Aankomst
          </ActionButton>
        </RoleGate>
      </ActionBar>

      <ActionBar title="Vloot actiebalk">
        <RoleGate componentId="fleet_management_settings">
          <ActionButton variant="primary" className="w-full" onClick={() => setShowImport(true)}>
            📥 Excel / CSV Bulk Import
          </ActionButton>
        </RoleGate>
        <RoleGate componentId="fuel_theft_alerts">
          <ActionButton
            variant="danger"
            className="w-full"
            onClick={() => {
              setAlertFilter('diefstal');
              scrollToId('alerts-sectie');
            }}
          >
            ⛽ Dieseldiefstal Alerts
          </ActionButton>
        </RoleGate>
        <RoleGate componentId="schaderapporten">
          <ActionButton
            variant="utility"
            className="w-full"
            onClick={() => {
              setAlertFilter('schade');
              scrollToId('alerts-sectie');
            }}
          >
            🛠️ AI Schade-Alerts
          </ActionButton>
        </RoleGate>
        <ActionButton
          variant="secondary"
          className="w-full"
          onClick={() => {
            setParkingFeed((prev) => [
              {
                id: `cp-${Date.now()}`,
                message: '1 Vrachtwagenplek zojuist vrijgekomen bij vertrek',
                location: 'Partner Yard Kassel',
                minutesAgo: 0,
              },
              ...prev,
            ]);
            scrollToId('parking-sectie');
          }}
        >
          🅿️ Simuleer Vrije Parkeerplek
        </ActionButton>
      </ActionBar>

      {geofenceNotify && (
        <div className="rounded-xl border border-sky-500/40 bg-sky-500/10 px-4 py-3 text-sm font-semibold text-sky-300">
          {geofenceNotify}
        </div>
      )}

      {serviceFlash && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300">
          {serviceFlash}
        </div>
      )}

      {importStatus && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300">
          {importStatus}
        </div>
      )}

      <div
        id="onderhoud-sectie"
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-700">
          <span className="text-xs text-[#cbd5e1]">Totale Vloot</span>
          <p className="text-2xl font-black text-[#f8fafc] mt-1">{trucks.length}</p>
        </div>
        <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-700">
          <span className="text-xs text-[#cbd5e1]">EURO 6 Conform</span>
          <p className="text-2xl font-black text-[#38bdf8] mt-1">
            {trucks.filter((t) => t.euroNorm === 'Euro 6').length}
          </p>
        </div>
        <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-700">
          <span className="text-xs text-[#cbd5e1]">Actieve Alerts</span>
          <p className="text-2xl font-black text-amber-400 mt-1">{fleetAlerts.length}</p>
        </div>
        <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-700">
          <span className="text-xs text-[#cbd5e1]">Community Parkeer-events</span>
          <p className="text-2xl font-black text-[#10b981] mt-1">{parkingFeed.length}</p>
        </div>
      </div>

      <RoleGate componentId="geofence_sms">
        <div
          id="geofencing-sectie"
          className={`bg-[#1e293b] rounded-2xl border p-5 space-y-4 ${
            !showTrailers ? 'border-emerald-500/40 ring-1 ring-emerald-500/20' : 'border-slate-700'
          }`}
        >
          <div>
            <h2 className="text-lg font-bold text-[#f8fafc]">📍 Geofencing & Klantnotificaties</h2>
            <p className="text-xs text-[#cbd5e1] mt-1">
              5 km radius · SMS/e-mail bij aankomst binnen geofence
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {geofenceDestinations.map((gf) => (
              <div
                key={gf.id}
                className="rounded-xl border border-slate-600 bg-slate-900/50 p-4 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <GeofenceRadiusRing
                    distanceKm={gf.distanceKm}
                    radiusKm={gf.radiusKm}
                    inside={gf.inside}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[#f8fafc] truncate">{gf.client}</p>
                    <p className="text-xs text-[#cbd5e1] mt-0.5">
                      Afstand: {gf.distanceKm.toFixed(1)} km
                    </p>
                    <span
                      className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        gf.inside
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-700/50 text-slate-300 border-slate-600'
                      }`}
                    >
                      {gf.inside ? 'Binnen radius' : 'Buiten radius'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${
                      gf.notifySms
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                        : 'bg-slate-800 text-slate-500 border-slate-700'
                    }`}
                  >
                    SMS {gf.notifySms ? 'aan' : 'uit'}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${
                      gf.notifyEmail
                        ? 'bg-violet-500/20 text-violet-300 border-violet-500/40'
                        : 'bg-slate-800 text-slate-500 border-slate-700'
                    }`}
                  >
                    E-mail {gf.notifyEmail ? 'aan' : 'uit'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Laatste melding: {gf.lastNotify}</p>
              </div>
            ))}
          </div>
        </div>
      </RoleGate>

      <div
        id="trailer-sectie"
        className={`bg-[#1e293b] rounded-2xl border p-5 space-y-4 ${
          showTrailers ? 'border-blue-500/40 ring-1 ring-blue-500/20' : 'border-slate-700'
        }`}
      >
        <div>
          <h2 className="text-lg font-bold text-[#f8fafc]">🚛 Trailer- & Lading-Tracking</h2>
          <p className="text-xs text-[#cbd5e1] mt-1">
            Opleggers en wissellaadbakken · live status en lading
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {trailerTracking.map((tr) => (
            <div
              key={tr.id}
              className="rounded-xl border border-slate-600 bg-slate-900/50 p-4 space-y-3"
            >
              <div className="flex justify-between gap-2 items-start">
                <div>
                  <p className="text-sm font-bold font-mono text-[#38bdf8]">{tr.id}</p>
                  <p className="text-xs text-[#f8fafc] mt-0.5">{tr.type}</p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                    tr.status === 'Gekoppeld'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}
                >
                  {tr.status}
                </span>
              </div>
              <TrailerMiniMap lat={tr.lat} lng={tr.lng} />
              <div className="space-y-1 text-xs text-[#cbd5e1]">
                <p>
                  <span className="text-slate-500">Kenteken · </span>
                  <span className="font-mono text-[#f8fafc]">{tr.plate}</span>
                </p>
                <p>
                  <span className="text-slate-500">Locatie · </span>
                  {tr.location}
                </p>
                <p>
                  <span className="text-slate-500">Lading · </span>
                  {tr.cargo}
                </p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 border-t border-slate-700/80 pt-3">
          Pallet-Grid laadruimte (33/34 posities) • Groen = IoT GPS / Lading Sensor Active
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div
          id="alerts-sectie"
          className="bg-[#1e293b] rounded-2xl border border-slate-700 p-5 space-y-3"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-[#f8fafc]">
              <RoleGate componentId="fuel_theft_alerts" fallback="Schade-Alerts">
                Dieseldiefstal & Schade-Alerts
              </RoleGate>
            </h2>
            <button
              type="button"
              onClick={() => setAlertFilter('all')}
              className="text-[11px] font-bold text-[#38bdf8]"
            >
              Alles
            </button>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {visibleAlerts.map((a) => (
              <RoleGate
                key={a.id}
                componentId={a.type === 'diefstal' ? 'fuel_theft_alerts' : 'schaderapporten'}
              >
                <div
                  className={`rounded-xl border px-3 py-3 ${
                    a.severity === 'hoog'
                      ? 'border-red-500/40 bg-red-500/10'
                      : a.severity === 'middel'
                        ? 'border-amber-500/40 bg-amber-500/10'
                        : 'border-sky-500/30 bg-sky-500/10'
                  }`}
                >
                  <div className="flex justify-between gap-2">
                    <p className="text-sm font-bold text-[#f8fafc]">{a.title}</p>
                    <span className="text-[10px] font-mono text-[#cbd5e1] shrink-0">{a.truckId}</span>
                  </div>
                  <p className="text-xs text-[#cbd5e1] mt-1">{a.detail}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{a.at}</p>
                </div>
              </RoleGate>
            ))}
          </div>
        </div>

        <div
          id="parking-sectie"
          className="bg-[#1e293b] rounded-2xl border border-emerald-500/30 p-5 space-y-3"
        >
          <h2 className="text-lg font-bold text-[#f8fafc]">Community Parkeerplek-Vrij</h2>
          <p className="text-xs text-[#cbd5e1]">
            Automatische meldingen bij vertrek van een truckspot
          </p>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {parkingFeed.map((e) => (
              <div
                key={e.id}
                className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-3"
              >
                <p className="text-sm font-bold text-emerald-300">{e.message}</p>
                <p className="text-xs text-[#cbd5e1] mt-1">
                  {e.location} · {e.minutesAgo === 0 ? 'zojuist' : `${e.minutesAgo} min geleden`}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#1e293b] rounded-2xl border border-slate-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-[#f8fafc]">Voertuigbeheer Tabel</h2>
          <p className="text-xs text-[#cbd5e1]">Kenteken, alerts, telematica en brandstofniveau</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-900/60 text-[#cbd5e1] text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3">Truck-ID</th>
                <th className="px-4 py-3">Kenteken</th>
                <th className="px-4 py-3">Model</th>
                <th className="px-4 py-3">Alerts</th>
                <th className="px-4 py-3">Telematica</th>
                <th className="px-4 py-3">Brandstofniveau</th>
                <th className="px-4 py-3">Chauffeur</th>
                <th className="px-4 py-3">Locatie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {trucks.map((truck) => {
                const alerts = alertsByTruck.get(truck.truckId) ?? [];
                return (
                  <tr key={truck.truckId} className="hover:bg-slate-900/40">
                    <td className="px-4 py-3 font-mono text-[#38bdf8]">{truck.truckId}</td>
                    <td className="px-4 py-3 font-mono text-[#f8fafc]">{truck.licensePlate}</td>
                    <td className="px-4 py-3 text-[#cbd5e1]">{truck.model}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {alerts.length === 0 && (
                          <span className="text-[11px] text-slate-500">—</span>
                        )}
                        {alerts.map((a) => (
                          <span
                            key={a.id}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              a.type === 'diefstal'
                                ? 'bg-red-500/20 text-red-300 border-red-500/40'
                                : a.type === 'schade'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            }`}
                          >
                            {a.type === 'diefstal'
                              ? 'Diefstal'
                              : a.type === 'schade'
                                ? 'Schade'
                                : 'Parkeer'}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${telematicsBadge(truck.telematics)}`}
                      >
                        {telematicaLabel(truck.telematics)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 min-w-[110px]">
                        <div className="w-16 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${truck.fuelLevel < 20 ? 'bg-amber-400' : 'bg-[#10b981]'}`}
                            style={{ width: `${truck.fuelLevel}%` }}
                          />
                        </div>
                        <span className="text-[#f8fafc] font-semibold">
                          {truck.fuelLevel.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#f8fafc]">{truck.driver}</td>
                    <td className="px-4 py-3 text-[#cbd5e1]">{truck.location}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showImport && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#1e293b] border-2 border-slate-600 rounded-2xl p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start gap-3">
              <div>
                <h3 className="text-lg font-bold text-[#f8fafc]">Excel / CSV Bulk Vloot Onboarding</h3>
                <p className="text-xs text-[#cbd5e1]">
                  Upload .csv of .xlsx · 50+ trucks, chauffeurs en tankkaarten
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowImport(false)}
                className="text-[#cbd5e1] hover:text-white text-sm"
              >
                Sluiten
              </button>
            </div>

            <label className="block border-2 border-dashed border-emerald-500/40 rounded-xl p-6 text-center cursor-pointer hover:border-emerald-400 bg-slate-900/50">
              <input
                type="file"
                accept=".csv,.xlsx,.xls,text/csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleFile(f);
                }}
              />
              <span className="text-sm font-bold text-emerald-400">Kies CSV of Excel-bestand</span>
              <p className="text-[11px] text-[#cbd5e1] mt-1">
                Kolommen: truckId;kenteken;model;chauffeur;tankkaart
              </p>
            </label>

            {importPreview.length > 0 && (
              <div className="rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs text-[#cbd5e1] space-y-1 max-h-40 overflow-y-auto">
                <p className="font-bold text-[#f8fafc]">
                  Voorbeeld · {importPreview.length} rijen
                </p>
                {importPreview.slice(0, 5).map((r) => (
                  <p key={r.truckId}>
                    {r.truckId} · {r.licensePlate} · {r.driver} · {r.location}
                  </p>
                ))}
                {importPreview.length > 5 && (
                  <p>… en {importPreview.length - 5} meer</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <ActionButton variant="slate" className="w-full" onClick={() => setShowImport(false)}>
                Annuleren
              </ActionButton>
              <ActionButton
                variant="primary"
                className="w-full"
                disabled={importPreview.length === 0}
                onClick={commitImport}
              >
                Importeer {importPreview.length || ''} Eenheden
              </ActionButton>
            </div>
          </div>
        </div>
      )}

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
              `Voertuig toegevoegd via AI-scan: ${draft.licensePlate} · ${draft.model}`
            );
          }}
        />
      )}
    </div>
  );
}
