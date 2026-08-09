'use client';

import { useMemo, useState } from 'react';
import { ActionBar, ActionButton } from '@/components/ActionBar';
import { useLanguage } from '@/components/LanguageProvider';
import { RoleGate } from '@/components/RoleGate';
import { scrollToId } from '@/lib/access';
import { fleetTrucks, maintenanceSchedule } from '@/lib/mock-data';

type WorkOrderStatus = 'Open' | 'In Uitvoering' | 'Ingepland';
type MaintenanceType = 'Grote Beurt' | 'APK' | 'Bandenwissel' | 'Reparatie';

type WorkOrder = {
  id: string;
  truck: string;
  title: string;
  type: MaintenanceType;
  status: WorkOrderStatus;
  damage: string;
  notes: string;
};

const INITIAL_ORDERS: WorkOrder[] = [
  {
    id: 'WO-4412',
    truck: '45-BJK-8',
    title: 'Grote Beurt',
    type: 'Grote Beurt',
    status: 'Open',
    damage: 'Voorbumper rechts (licht)',
    notes: 'Remmen inspectie meenemen',
  },
  {
    id: 'WO-4418',
    truck: '12-34-AB',
    title: 'Bandenwissel',
    type: 'Bandenwissel',
    status: 'In Uitvoering',
    damage: '—',
    notes: 'Winterbanden montage',
  },
  {
    id: 'WO-4421',
    truck: '99-XYZ-1',
    title: 'APK',
    type: 'APK',
    status: 'Ingepland',
    damage: 'Zijpaneel oplegger',
    notes: 'APK voorbereiding',
  },
];

const PLATES = fleetTrucks.map((t) => t.licensePlate);

export default function GaragePage() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<WorkOrder[]>(INITIAL_ORDERS);
  const [selected, setSelected] = useState(INITIAL_ORDERS[0]?.id ?? '');
  const [flash, setFlash] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [plate, setPlate] = useState(PLATES[0] ?? '');
  const [type, setType] = useState<MaintenanceType>('Grote Beurt');
  const [status, setStatus] = useState<WorkOrderStatus>('Open');
  const [notes, setNotes] = useState('');

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selected) ?? orders[0],
    [orders, selected]
  );

  const saveWorkOrder = () => {
    const id = `WO-${4400 + orders.length + 1}`;
    const next: WorkOrder = {
      id,
      truck: plate,
      title: type,
      type,
      status,
      damage: '—',
      notes: notes.trim() || 'Geen notities',
    };
    setOrders((prev) => [next, ...prev]);
    setSelected(id);
    setFlash(`Werkorder ${id} toegevoegd · ${plate} · ${type}`);
    setShowModal(false);
    setNotes('');
    setStatus('Open');
    setType('Grote Beurt');
    window.setTimeout(() => scrollToId('open-werkorders'), 80);
  };

  return (
    <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-6" style={{ background: '#0b0f19' }}>
      <div>
        <h1 className="text-2xl font-extrabold text-[#f8fafc]">{t('garage_title')}</h1>
        <p className="text-sm text-[#cbd5e1]">{t('garage_subtitle')}</p>
      </div>

      <ActionBar title={t('garage_actions')}>
        <RoleGate componentId="werkorders">
          <ActionButton variant="primary" onClick={() => setShowModal(true)}>
            {t('garage_new_wo')}
          </ActionButton>
        </RoleGate>
        <RoleGate componentId="schaderapporten">
          <ActionButton
            variant="secondary"
            onClick={() => {
              setFlash(t('garage_damage'));
              scrollToId('schade-sectie');
            }}
          >
            {t('garage_damage')}
          </ActionButton>
        </RoleGate>
        <RoleGate componentId="apk_banden">
          <ActionButton
            variant="utility"
            onClick={() => {
              setFlash(t('garage_apk'));
              scrollToId('apk-banden-sectie');
            }}
          >
            {t('garage_apk')}
          </ActionButton>
        </RoleGate>
      </ActionBar>

      {flash && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-300">
          {flash}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RoleGate componentId="werkorders">
          <div
            id="open-werkorders"
            className="bg-[#1e293b] rounded-2xl border border-slate-700 overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-slate-700">
              <h2 className="text-lg font-bold text-[#f8fafc]">{t('open_workorders')}</h2>
              <p className="text-xs text-[#cbd5e1] mt-0.5">{orders.length} actieve orders</p>
            </div>
            <div className="divide-y divide-slate-700/60 max-h-[28rem] overflow-y-auto">
              {orders.map((wo) => (
                <button
                  key={wo.id}
                  type="button"
                  onClick={() => setSelected(wo.id)}
                  className={`w-full text-left px-5 py-4 transition ${
                    selected === wo.id ? 'bg-sky-500/10' : 'hover:bg-slate-900/50'
                  }`}
                >
                  <p className="text-sm font-bold text-[#f8fafc]">
                    {wo.id} · {wo.truck}
                  </p>
                  <p className="text-xs text-[#cbd5e1] mt-1">
                    {wo.title}
                    {wo.notes ? ` — ${wo.notes}` : ''}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Status: {wo.status} · Schade: {wo.damage}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </RoleGate>

        <RoleGate componentId="apk_banden">
          <div
            id="apk-banden-sectie"
            className="bg-[#1e293b] rounded-2xl border border-slate-700 p-5 space-y-3"
          >
            <h2 className="text-lg font-bold text-[#f8fafc]">APK & Bandenplanner</h2>
            <p className="text-xs text-[#cbd5e1]">
              Intervalles gekoppeld aan vlootonderhoud (km-stand)
            </p>
            <ul className="space-y-2">
              {maintenanceSchedule.map((m) => (
                <li
                  key={m.truckId}
                  className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-3"
                >
                  <p className="text-sm font-semibold text-[#f8fafc]">
                    {m.plate} · {m.message}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Partner: {m.partner ?? '—'} · rest{' '}
                    {(m.nextServiceKm - m.odometerKm).toLocaleString('nl-NL')} km
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </RoleGate>
      </div>

      <RoleGate componentId="schaderapporten">
        <div
          id="schade-sectie"
          className="bg-[#1e293b] rounded-2xl border border-slate-700 p-5 space-y-3"
        >
          <h2 className="text-lg font-bold text-[#f8fafc]">Schaderapporten</h2>
          <p className="text-xs text-[#cbd5e1]">
            Gekoppeld aan geselecteerde werkorder {selectedOrder?.id ?? '—'}
          </p>
          <div className="rounded-xl border border-rose-500/25 bg-rose-950/20 px-4 py-3">
            <p className="text-sm font-semibold text-[#f8fafc]">
              {selectedOrder?.truck} · {selectedOrder?.title}
            </p>
            <p className="text-xs text-[#cbd5e1] mt-1">
              Schadezone: {selectedOrder?.damage || '—'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Notities: {selectedOrder?.notes}</p>
          </div>
        </div>
      </RoleGate>

      {showModal && (
        <div className="fixed inset-0 z-[70] bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#1e293b] border border-slate-600 rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-start gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100">🔧 Nieuwe Werkorder</h3>
                <p className="text-[11px] text-slate-400">Voeg toe aan Open Werkorders</p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 text-xs"
              >
                Sluiten
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Voertuig / Kenteken</label>
                <select
                  value={plate}
                  onChange={(e) => setPlate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-slate-100"
                >
                  {PLATES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Type Onderhoud</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as MaintenanceType)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-slate-100"
                >
                  <option value="Grote Beurt">Grote Beurt</option>
                  <option value="APK">APK</option>
                  <option value="Bandenwissel">Bandenwissel</option>
                  <option value="Reparatie">Reparatie</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as WorkOrderStatus)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-slate-100"
                >
                  <option value="Open">Open</option>
                  <option value="In Uitvoering">In Uitvoering</option>
                  <option value="Ingepland">Ingepland</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Omschrijving / Notities</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Bijv. remmen controleren, bandenmaat…"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-slate-100 resize-none"
                />
              </div>
            </div>

            <ActionButton variant="primary" className="w-full" onClick={saveWorkOrder}>
              Opslaan & Toevoegen
            </ActionButton>
          </div>
        </div>
      )}
    </main>
  );
}
