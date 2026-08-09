'use client';

import { useMemo, useRef, useState } from 'react';
import { ActionButton } from '@/components/ActionBar';
import { GloveboxModal } from '@/components/GloveboxModal';
import { useLanguage } from '@/components/LanguageProvider';
import {
  addGloveboxUpload,
  simulateOcr,
  useGloveboxUploads,
  type DocType,
} from '@/lib/glovebox-uploads';
import { fleetTrucks } from '@/lib/mock-data';

const DOC_TYPES: DocType[] = [
  'Kentekenbewijs',
  'Verzekering',
  'APK',
  'NIWO',
  'ADR',
  'Overig',
];

export function DocumentUploadPanel({
  id = 'voertuigdocumenten-upload',
  embedded = false,
  defaultPlate,
}: {
  id?: string;
  /** Compact mode inside GloveboxModal (no nested glovebox opener). */
  embedded?: boolean;
  defaultPlate?: string;
}) {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const uploads = useGloveboxUploads();
  const plates = useMemo(() => fleetTrucks.map((t) => t.licensePlate), []);

  const [dragging, setDragging] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [docType, setDocType] = useState<DocType>('Kentekenbewijs');
  const [plate, setPlate] = useState(defaultPlate && plates.includes(defaultPlate) ? defaultPlate : plates[0] ?? '');
  const [expires, setExpires] = useState('');
  const [notes, setNotes] = useState('');
  const [formReady, setFormReady] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [showGlovebox, setShowGlovebox] = useState(false);

  const runScan = (file: File) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    const okType =
      allowed.includes(file.type) ||
      /\.(pdf|jpe?g|png)$/i.test(file.name);
    if (!okType) {
      setFlash('Alleen PDF, JPG of PNG worden ondersteund');
      return;
    }

    setScanning(true);
    setFormReady(false);
    setFileName(file.name);
    setFlash(null);

    window.setTimeout(() => {
      const ocr = simulateOcr(file);
      setDocType(ocr.docType);
      setExpires(ocr.expires);
      setNotes(ocr.notes);
      if (ocr.plateHint && plates.includes(ocr.plateHint)) {
        setPlate(ocr.plateHint);
      }
      setScanning(false);
      setFormReady(true);
    }, 1100);
  };

  const onFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) runScan(file);
  };

  const save = () => {
    if (!fileName || !expires) {
      setFlash('Scan eerst een document en controleer de velden');
      return;
    }
    const saved = addGloveboxUpload({
      plate,
      docType,
      expires,
      notes: notes.trim() || '—',
      fileName,
    });
    setFlash(
      `Opgeslagen in Digitale Handschoenvak · ${saved.docType} · ${saved.plate}`
    );
    setFormReady(false);
    setFileName(null);
    setNotes('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const recentForPlate = uploads.filter((u) => u.plate === plate).slice(0, 4);

  return (
    <>
      <div
        id={id}
        className="bg-[#1e293b] rounded-2xl border border-slate-700 p-5 space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h2 className={`${embedded ? 'text-sm' : 'text-lg'} font-bold text-[#f8fafc]`}>
              {t('upload_title')}
            </h2>
            <p className="text-xs text-[#cbd5e1] mt-1">{t('upload_hint')}</p>
          </div>
          {!embedded && (
            <ActionButton variant="secondary" onClick={() => setShowGlovebox(true)}>
              {t('upload_open_glovebox')}
            </ActionButton>
          )}
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            onFiles(e.dataTransfer.files);
          }}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer bg-slate-900/50 transition ${
            dragging
              ? 'border-emerald-500 bg-emerald-950/20'
              : 'border-slate-700 hover:border-emerald-500'
          }`}
        >
          <p className="text-sm text-slate-200 font-semibold max-w-xl mx-auto leading-relaxed">
            {t('upload_drop')}
          </p>
          {fileName && (
            <p className="text-[11px] text-emerald-300 mt-3 font-mono">{fileName}</p>
          )}
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            className="hidden"
            onChange={(e) => onFiles(e.target.files)}
          />
        </div>

        {scanning && (
          <div className="rounded-xl border border-sky-500/40 bg-sky-500/10 px-4 py-3 text-sm font-semibold text-sky-300 animate-pulse">
            {t('upload_ai_scanning')}
          </div>
        )}

        {flash && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-300">
            {flash}
          </div>
        )}

        {formReady && !scanning && (
          <div className="rounded-xl border border-slate-600 bg-slate-950/40 p-4 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[#38bdf8]">
              OCR-resultaat — controleer & bevestig
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Documenttype</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as DocType)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-slate-100"
                >
                  {DOC_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Gekoppeld Kenteken</label>
                <select
                  value={plate}
                  onChange={(e) => setPlate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-slate-100 font-mono"
                >
                  {plates.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Vervaldatum</label>
                <input
                  type="date"
                  value={expires}
                  onChange={(e) => setExpires(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Notities / Polisnummer</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-slate-100"
                  placeholder="Polisnr of OCR-notitie"
                />
              </div>
            </div>
            <ActionButton variant="primary" onClick={save}>
              {t('upload_save')}
            </ActionButton>
          </div>
        )}

        {recentForPlate.length > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Recent opgeslagen · {plate}
            </p>
            <ul className="space-y-1.5">
              {recentForPlate.map((u) => (
                <li
                  key={u.id}
                  className="flex justify-between gap-2 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs"
                >
                  <span className="text-slate-100 font-semibold">
                    {u.docType} · <span className="font-mono text-slate-400">{u.fileName}</span>
                  </span>
                  <span className="text-slate-400 shrink-0">
                    t/m {new Date(u.expires).toLocaleDateString('nl-NL')}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {showGlovebox && (
        <GloveboxModal
          onClose={() => setShowGlovebox(false)}
          initialPlate={plate}
          onOpenDamageReport={() => {
            window.location.href = '/driver?action=schade';
          }}
        />
      )}
    </>
  );
}
