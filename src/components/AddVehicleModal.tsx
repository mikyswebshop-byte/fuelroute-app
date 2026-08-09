'use client';

import { useRef, useState, type ReactNode } from 'react';
import { ActionButton } from '@/components/ActionBar';
import type { FleetTruckRow } from '@/lib/mock-data';

export type VehicleDraft = {
  licensePlate: string;
  model: string;
  vin: string;
  yearBuilt: string;
  admissionDate: string;
  gvwKg: number;
  fuelType: string;
  euroNorm: 'Euro 6' | 'Euro 5';
  apkExpiry: string;
  driver: string;
};

type Step = 'scan' | 'form' | 'confirm';

const inputClass =
  'w-full bg-slate-950 border border-slate-600 rounded-lg p-2.5 text-slate-100 text-xs';

function simulateRegistrationOcr(file: File): VehicleDraft {
  const name = file.name.toLowerCase();
  const plateMatch = file.name.match(
    /(\d{1,2}-[A-Z]{2,3}-\d{1,2}|[A-Z0-9]{1,2}-\d{2,3}-[A-Z]{1,3})/i
  );
  const plate = plateMatch?.[1]?.toUpperCase() ?? '45-BJK-8';

  let model = 'DAF XF 480';
  if (/volvo|fh/.test(name)) model = 'Volvo FH 500';
  else if (/scania|r500/.test(name)) model = 'Scania R500';
  else if (/man|tgx/.test(name)) model = 'MAN TGX 18.510';
  else if (/mercedes|actros/.test(name)) model = 'Mercedes-Benz Actros 1845';

  const seed = Array.from(file.name).reduce((a, c) => a + c.charCodeAt(0), 0);
  const vin = (`XLRTE47MS0E${String(100000 + (seed % 899999))}`).slice(0, 17);
  const year = 2019 + (seed % 6);
  const admission = `${year}-${String(3 + (seed % 9)).padStart(2, '0')}-${String(5 + (seed % 20)).padStart(2, '0')}`;
  const apk = new Date();
  apk.setMonth(apk.getMonth() + 8 + (seed % 6));

  return {
    licensePlate: plate,
    model,
    vin,
    yearBuilt: String(year),
    admissionDate: admission,
    gvwKg: seed % 2 === 0 ? 19000 : 40000,
    fuelType: 'Diesel',
    euroNorm: 'Euro 6',
    apkExpiry: apk.toISOString().slice(0, 10),
    driver: 'Nog toe te wijzen',
  };
}

function draftToFleetRow(draft: VehicleDraft, index: number): FleetTruckRow {
  return {
    truckId: `SCAN-${String(index).padStart(3, '0')}`,
    licensePlate: draft.licensePlate,
    model: draft.model,
    driver: draft.driver,
    location: 'Nieuw — registratie via AI-scan',
    fuelLevel: 72,
    activeSavings: 0,
    compliance: 'Compliant',
    euroNorm: draft.euroNorm,
    telematics: 'Offline',
    tankCapacity: draft.gvwKg >= 30000 ? 900 : 600,
    avgConsumption: 28.5,
  };
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-slate-400 mb-1">{label}</label>
      {children}
    </div>
  );
}

export function AddVehicleModal({
  onClose,
  onAdd,
  nextIndex = 1,
}: {
  onClose: () => void;
  onAdd: (truck: FleetTruckRow, draft: VehicleDraft) => void;
  nextIndex?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>('scan');
  const [scanning, setScanning] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [draft, setDraft] = useState<VehicleDraft | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runScan = (file: File) => {
    const ok =
      ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'].includes(file.type) ||
      /\.(pdf|jpe?g|png)$/i.test(file.name);
    if (!ok) {
      setError('Alleen JPG, PNG of PDF worden ondersteund');
      return;
    }
    setError(null);
    setScanning(true);
    setFileName(file.name);
    if (file.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }

    window.setTimeout(() => {
      setDraft(simulateRegistrationOcr(file));
      setScanning(false);
      setStep('form');
    }, 1400);
  };

  const update = <K extends keyof VehicleDraft>(key: K, value: VehicleDraft[K]) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900/90 shadow-2xl p-5 sm:p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-vehicle-title"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="add-vehicle-title" className="text-lg font-bold text-slate-50">
              Nieuw Voertuig Toevoegen
            </h2>
            <p className="text-[11px] text-slate-400 mt-1">
              AI-scan van kentekenbewijs / voertuigpapieren · controleer vóór opslaan
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-300 border border-slate-600 rounded-lg px-2.5 py-1.5 hover:bg-slate-800"
          >
            ✕ Sluiten
          </button>
        </div>

        {step === 'scan' && !scanning && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="w-full border-2 border-dashed border-slate-600 hover:border-emerald-500 rounded-xl p-8 text-center bg-slate-950/50 transition cursor-pointer"
            >
              <p className="text-3xl mb-2" aria-hidden>
                📷
              </p>
              <p className="text-sm font-bold text-slate-100">
                Foto maken van Kentekenbewijs / Voertuigpapieren
              </p>
              <p className="text-xs text-slate-400 mt-2">
                JPG, PNG of PDF · sleep of klik om te uploaden / te scannen
              </p>
              {fileName && (
                <p className="text-[11px] font-mono text-emerald-300 mt-3">{fileName}</p>
              )}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*,.pdf,application/pdf"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) runScan(f);
              }}
            />
            <ActionButton
              variant="slate"
              className="w-full"
              onClick={() => {
                setDraft({
                  licensePlate: '',
                  model: '',
                  vin: '',
                  yearBuilt: '',
                  admissionDate: '',
                  gvwKg: 19000,
                  fuelType: 'Diesel',
                  euroNorm: 'Euro 6',
                  apkExpiry: '',
                  driver: 'Nog toe te wijzen',
                });
                setStep('form');
              }}
            >
              Handmatig invullen zonder scan
            </ActionButton>
          </div>
        )}

        {scanning && (
          <div className="rounded-xl border border-sky-500/40 bg-sky-500/10 px-4 py-6 text-center space-y-2">
            <p className="text-sm font-bold text-sky-300 animate-pulse">
              🤖 AI leest voertuiggegevens uit...
            </p>
            <p className="text-[11px] text-slate-400">
              Kenteken · VIN · GVW · Euroklasse · APK worden herkend
            </p>
            {preview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="Scan preview"
                className="mx-auto mt-3 h-28 object-cover rounded-lg border border-slate-600 opacity-80"
              />
            )}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 px-3 py-2 text-xs text-rose-300">
            {error}
          </div>
        )}

        {draft && step === 'form' && !scanning && (
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[#38bdf8]">
              OCR-resultaat — corrigeer indien nodig
            </p>
            {preview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="Gescand document"
                className="w-full h-32 object-cover rounded-xl border border-slate-600"
              />
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <Field label="Kenteken">
                <input
                  value={draft.licensePlate}
                  onChange={(e) => update('licensePlate', e.target.value.toUpperCase())}
                  className={`${inputClass} font-mono`}
                />
              </Field>
              <Field label="Merk & Model">
                <input
                  value={draft.model}
                  onChange={(e) => update('model', e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Chassisnummer / VIN">
                <input
                  value={draft.vin}
                  onChange={(e) => update('vin', e.target.value.toUpperCase())}
                  maxLength={17}
                  className={`${inputClass} font-mono`}
                />
              </Field>
              <Field label="Bouwjaar">
                <input
                  value={draft.yearBuilt}
                  onChange={(e) => update('yearBuilt', e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Toelatingsdatum">
                <input
                  type="date"
                  value={draft.admissionDate}
                  onChange={(e) => update('admissionDate', e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Tolerantie / Max. Gewicht (GVW)">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={draft.gvwKg}
                    onChange={(e) => update('gvwKg', Number(e.target.value) || 0)}
                    className={inputClass}
                  />
                  <span className="text-slate-500 shrink-0">kg</span>
                </div>
              </Field>
              <Field label="Brandstoftype & Euroklasse">
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={draft.fuelType}
                    onChange={(e) => update('fuelType', e.target.value)}
                    className={inputClass}
                  >
                    <option value="Diesel">Diesel</option>
                    <option value="HVO100">HVO100</option>
                    <option value="LNG">LNG</option>
                    <option value="Elektrisch">Elektrisch</option>
                  </select>
                  <select
                    value={draft.euroNorm}
                    onChange={(e) => update('euroNorm', e.target.value as 'Euro 6' | 'Euro 5')}
                    className={inputClass}
                  >
                    <option value="Euro 6">Euro 6</option>
                    <option value="Euro 5">Euro 5</option>
                  </select>
                </div>
              </Field>
              <Field label="APK Vervaldatum">
                <input
                  type="date"
                  value={draft.apkExpiry}
                  onChange={(e) => update('apkExpiry', e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
            <div className="flex flex-wrap gap-2">
              <ActionButton variant="slate" onClick={() => setStep('scan')}>
                Opnieuw scannen
              </ActionButton>
              <ActionButton
                variant="primary"
                onClick={() => {
                  if (!draft.licensePlate || !draft.model) {
                    setError('Kenteken en merk/model zijn verplicht');
                    return;
                  }
                  setError(null);
                  setStep('confirm');
                }}
              >
                Controleren & bevestigen
              </ActionButton>
            </div>
          </div>
        )}

        {draft && step === 'confirm' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-emerald-500/35 bg-emerald-950/25 p-4 space-y-2">
              <p className="text-sm font-bold text-emerald-300">Controleer gescande gegevens</p>
              <ul className="text-xs text-slate-200 space-y-1.5">
                <li>
                  <span className="text-slate-500">Kenteken · </span>
                  <span className="font-mono font-bold">{draft.licensePlate}</span>
                </li>
                <li>
                  <span className="text-slate-500">Merk & Model · </span>
                  {draft.model}
                </li>
                <li>
                  <span className="text-slate-500">VIN · </span>
                  <span className="font-mono">{draft.vin}</span>
                </li>
                <li>
                  <span className="text-slate-500">Bouwjaar / Toelating · </span>
                  {draft.yearBuilt} / {draft.admissionDate}
                </li>
                <li>
                  <span className="text-slate-500">GVW · </span>
                  {draft.gvwKg.toLocaleString('nl-NL')} kg
                </li>
                <li>
                  <span className="text-slate-500">Brandstof & Euro · </span>
                  {draft.fuelType} - {draft.euroNorm}
                </li>
                <li>
                  <span className="text-slate-500">APK · </span>
                  {draft.apkExpiry
                    ? new Date(draft.apkExpiry).toLocaleDateString('nl-NL')
                    : '—'}
                </li>
              </ul>
            </div>
            <div className="flex flex-wrap gap-2">
              <ActionButton variant="slate" onClick={() => setStep('form')}>
                Terug naar formulier
              </ActionButton>
              <ActionButton
                variant="primary"
                onClick={() => {
                  onAdd(draftToFleetRow(draft, nextIndex), draft);
                  onClose();
                }}
              >
                ✅ Voertuig Definitief Toevoegen
              </ActionButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
