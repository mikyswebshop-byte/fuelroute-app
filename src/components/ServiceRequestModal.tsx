'use client';

import { useState } from 'react';
import { ActionButton } from '@/components/ActionBar';
import { servicePartners, type MaintenanceItem } from '@/lib/mock-data';

export function ServiceRequestModal({
  trucks,
  onClose,
  onSubmit,
}: {
  trucks: { truckId: string; plate: string }[];
  onClose: () => void;
  onSubmit: (req: {
    truckId: string;
    partner: string;
    note: string;
    type: MaintenanceItem['type'];
  }) => void;
}) {
  const [truckId, setTruckId] = useState(trucks[0]?.truckId ?? '');
  const [partner, setPartner] = useState(servicePartners[0]);
  const [type, setType] = useState<MaintenanceItem['type']>('grote_beurt');
  const [note, setNote] = useState('');

  return (
    <div className="fixed inset-0 z-[70] bg-black/70 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1e293b] border border-slate-600 rounded-2xl p-5 space-y-4 shadow-2xl">
        <div className="flex justify-between items-start gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-100">🔧 Onderhoud Inplannen</h3>
            <p className="text-[11px] text-slate-400">
              Serviceverzoek naar partnerwerkplaats
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 text-xs">
            Sluiten
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Voertuig</label>
            <select
              value={truckId}
              onChange={(e) => setTruckId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-slate-100"
            >
              {trucks.map((t) => (
                <option key={t.truckId} value={t.truckId}>
                  {t.truckId} · {t.plate}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Type onderhoud</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as MaintenanceItem['type'])}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-slate-100"
            >
              <option value="grote_beurt">Grote beurt</option>
              <option value="banden">Bandenwissel</option>
              <option value="olie">Olieverversing</option>
              <option value="apk">APK / keuring</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Partnerwerkplaats</label>
            <select
              value={partner}
              onChange={(e) => setPartner(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-slate-100"
            >
              {servicePartners.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Opmerking</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="bijv. trillingen bij 80 km/h"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-slate-100"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <ActionButton variant="slate" onClick={onClose}>
            Annuleren
          </ActionButton>
          <ActionButton
            variant="primary"
            onClick={() => {
              onSubmit({ truckId, partner, note, type });
              onClose();
            }}
          >
            Verzoek indienen
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
