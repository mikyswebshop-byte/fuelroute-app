'use client';

import { useId, useRef, useState, type ChangeEvent } from 'react';
import { ActionButton } from '@/components/ActionBar';
import {
  parseCmrFromFile,
  setActiveCmr,
  useActiveCmr,
  useCmrHistory,
  type CmrShipment,
} from '@/lib/cmr-store';

export function CmrImportPanel({
  onApplied,
  compact = false,
}: {
  /** Called after CMR is saved as active (planner can fill form fields). */
  onApplied?: (cmr: CmrShipment) => void;
  compact?: boolean;
}) {
  const uid = useId();
  const fileInputId = `${uid}-file`;
  const photoInputId = `${uid}-photo`;
  const fileRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  const active = useActiveCmr();
  const history = useCmrHistory();
  const [dragging, setDragging] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [draft, setDraft] = useState<CmrShipment | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [pickerError, setPickerError] = useState<string | null>(null);

  const apply = (cmr: CmrShipment, fromOcr = false) => {
    setActiveCmr(cmr);
    setDraft(cmr);
    setFlash(
      fromOcr
        ? `Toegepast op rit · ${cmr.cmrNumber} · ${cmr.origin} → ${cmr.destination}`
        : `Actieve CMR · ${cmr.cmrNumber} · route & gewichten geladen`
    );
    onApplied?.(cmr);
  };

  const runFile = (file: File | undefined | null) => {
    if (!file) {
      setPickerError('Geen bestand ontvangen. Probeer opnieuw of een ander formaat (JPG/PNG/PDF).');
      return;
    }
    const ok =
      ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', ''].includes(file.type) ||
      /\.(pdf|jpe?g|png)$/i.test(file.name);
    // iOS sometimes sends empty MIME — still allow by extension / any image*
    const okMime =
      ok ||
      file.type.startsWith('image/') ||
      file.type === 'application/pdf';
    if (!okMime && file.size === 0) {
      setPickerError('Bestand is leeg of niet leesbaar.');
      return;
    }
    if (!okMime && !/\./.test(file.name)) {
      // iOS camera files sometimes lack extension — still accept images
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        setPickerError('Alleen PDF, JPG of PNG.');
        return;
      }
    }

    setPickerError(null);
    setScanning(true);
    setFlash(null);
    setDraft(null);

    window.setTimeout(() => {
      try {
        const parsed = parseCmrFromFile(file);
        setScanning(false);
        apply(parsed, true);
      } catch {
        setScanning(false);
        setPickerError('Kon dit bestand niet verwerken. Probeer JPG of PDF.');
      }
    }, 700);
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    runFile(f);
    // reset so same file can be re-selected
    e.target.value = '';
  };

  const shown = draft ?? active;
  const isApplied = !!shown && active?.id === shown.id;

  return (
    <div className={`space-y-3 ${compact ? '' : 'fr-glass p-4 sm:p-5'}`}>
      <div>
        <p className="fr-label">CMR / e-CMR import</p>
        <h3 className="fr-display text-base sm:text-lg mt-0.5">Vrachtbrief uit bestand</h3>
        <p className="text-xs text-[var(--fr-text-muted)] mt-1 leading-relaxed">
          Kies een bestand of foto. Na OCR wordt de CMR <span className="text-[#e8eef7] font-semibold">direct
          toegepast</span> op de rit.
        </p>
      </div>

      {/* Twee aparte inputs: iOS Safari faalt vaak als capture op dezelfde input zit als “bestand” */}
      <input
        id={fileInputId}
        ref={fileRef}
        type="file"
        accept="image/*,.pdf,application/pdf,.jpg,.jpeg,.png"
        className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0 opacity-0"
        style={{ clip: 'rect(0, 0, 0, 0)' }}
        onChange={onInputChange}
      />
      <input
        id={photoInputId}
        ref={photoRef}
        type="file"
        accept="image/*"
        className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0 opacity-0"
        style={{ clip: 'rect(0, 0, 0, 0)' }}
        onChange={onInputChange}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          runFile(e.dataTransfer.files?.[0]);
        }}
        className={`rounded-[14px] border-2 border-dashed p-5 text-center transition ${
          dragging
            ? 'border-[#00a3ff] bg-[#00a3ff]/10'
            : 'border-[#1e2a3a] bg-[#050a0f]/60'
        }`}
      >
        <p className="text-sm font-semibold text-[#e8eef7]">
          {scanning ? 'OCR bezig… wordt meteen toegepast' : 'Sleep CMR hierheen of kies hieronder'}
        </p>
        <p className="text-[11px] text-[#6b7a90] mt-1">PDF · JPG · PNG · werkt op telefoon & PC</p>

        <div className="mt-4 flex flex-col sm:flex-row flex-wrap justify-center gap-2">
          {/* label htmlFor = betrouwbaarder dan input.click() op iOS */}
          <label
            htmlFor={fileInputId}
            className="inline-flex items-center justify-center gap-1.5 rounded-[10px] px-4 py-3 text-xs font-semibold cursor-pointer bg-[#00a3ff] text-white shadow-[0_0_20px_rgba(0,163,255,0.35)] hover:bg-[#007aff] touch-manipulation"
          >
            📄 Bestand kiezen
          </label>
          <label
            htmlFor={photoInputId}
            className="inline-flex items-center justify-center gap-1.5 rounded-[10px] px-4 py-3 text-xs font-semibold cursor-pointer bg-transparent text-[#e8eef7] border border-[#00a3ff]/50 hover:bg-[#00a3ff]/10 touch-manipulation"
          >
            📷 Foto / galerij
          </label>
        </div>

        {/* Zichtbare native picker — altijd als fallback (iOS/Android/PC) */}
        <div className="mt-4 text-left space-y-1.5">
          <p className="fr-label text-center sm:text-left">Werkt de knop niet? Gebruik deze kiezer:</p>
          <input
            type="file"
            accept="image/*,.pdf,application/pdf,.jpg,.jpeg,.png"
            onChange={onInputChange}
            className="block w-full text-xs text-[#c5d0e0] file:mr-3 file:rounded-[8px] file:border-0 file:bg-[#00a3ff] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white"
          />
        </div>
      </div>

      {pickerError && (
        <div className="rounded-[10px] border border-[#ff3b30]/40 bg-[#ff3b30]/10 px-3 py-2 text-xs font-semibold text-[#ff8a82]">
          {pickerError}
        </div>
      )}

      {flash && (
        <div
          className={`rounded-[10px] border px-3 py-2 text-xs font-semibold ${
            isApplied
              ? 'border-[#28a745]/40 bg-[#28a745]/10 text-[#86efac]'
              : 'border-[#00a3ff]/35 bg-[#00a3ff]/10 text-[#7dd3fc]'
          }`}
        >
          {flash}
        </div>
      )}

      {shown && (
        <CmrDetails
          cmr={shown}
          isApplied={isApplied}
          onApply={() => apply(shown)}
          onClear={() => {
            setDraft(null);
            setActiveCmr(null);
            setFlash('Actieve CMR gewist');
          }}
        />
      )}

      {history.length > 0 && (
        <div className="space-y-2">
          <p className="fr-label">Recente CMR’s</p>
          <ul className="space-y-1.5">
            {history.slice(0, 5).map((h) => (
              <li key={h.id}>
                <button
                  type="button"
                  onClick={() => apply(h)}
                  className="w-full text-left rounded-[10px] border border-[#1e2a3a] bg-[#0b0e11] px-3 py-2 hover:border-[#00a3ff]/40"
                >
                  <span className="fr-mono text-xs text-[#00a3ff]">{h.cmrNumber}</span>
                  <span className="text-xs text-[#9aa8bc] ml-2">
                    {h.origin} → {h.destination}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function CmrDetails({
  cmr,
  isApplied,
  onApply,
  onClear,
}: {
  cmr: CmrShipment;
  isApplied: boolean;
  onApply: () => void;
  onClear: () => void;
}) {
  return (
    <div
      className={`rounded-[12px] border p-3.5 space-y-3 ${
        isApplied ? 'border-[#28a745]/40 bg-[#28a745]/05' : 'border-[#1e2a3a] bg-[#0b0e11]'
      }`}
    >
      <div className="flex flex-wrap gap-2">
        {isApplied ? (
          <span className="inline-flex items-center rounded-[10px] bg-[#28a745]/20 border border-[#28a745]/40 px-3 py-2 text-xs font-bold text-[#86efac]">
            ✓ Toegepast op rit
          </span>
        ) : (
          <ActionButton variant="primary" className="flex-1 min-w-[160px]" onClick={onApply}>
            ✓ Nu toepassen op rit
          </ActionButton>
        )}
        <ActionButton variant="slate" onClick={onClear}>
          Wissen
        </ActionButton>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="fr-mono text-sm font-bold text-[#00a3ff]">{cmr.cmrNumber}</span>
        <span className="fr-chip text-[10px] uppercase">{cmr.sourceExt}</span>
        {cmr.adr && (
          <span className="fr-chip border-[#ff3b30]/40 bg-[#ff3b30]/10 text-[#ff8a82] text-[10px]">
            ADR {cmr.adrClass || '•'}
          </span>
        )}
      </div>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
        <Field label="Afzender" value={cmr.shipper} />
        <Field label="Ontvanger" value={cmr.consignee} />
        <Field label="Van" value={cmr.origin} />
        <Field label="Naar" value={cmr.destination} />
        <Field label="Goederen" value={cmr.goodsDescription} />
        <Field label="Colli" value={String(cmr.packages)} />
        <Field
          label="Brutogewicht"
          value={`${cmr.grossWeightKg.toLocaleString('nl-NL')} kg`}
          mono
        />
        <Field label="Beladen" value={`${cmr.loadedWeightT} t`} mono />
        <Field label="Trekker" value={cmr.truckPlate} mono />
        <Field label="Oplegger" value={cmr.trailerPlate} mono />
      </dl>
      <p className="text-[11px] text-[#6b7a90]">
        {cmr.notes} · {cmr.fileName}
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="fr-label">{label}</dt>
      <dd className={`text-[#e8eef7] mt-0.5 ${mono ? 'fr-mono' : 'font-semibold'}`}>{value}</dd>
    </div>
  );
}

/** Compact banner when a CMR is active (cockpit / planner). */
export function ActiveCmrBanner({ onOpen }: { onOpen?: () => void }) {
  const cmr = useActiveCmr();
  if (!cmr) return null;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full text-left fr-glass px-3 py-2.5 flex items-center justify-between gap-2 hover:border-[#00a3ff]/40"
    >
      <div className="min-w-0">
        <p className="fr-label">Actieve CMR · toegepast</p>
        <p className="text-sm font-bold text-[#f2f6fb] truncate">
          <span className="fr-mono text-[#00a3ff]">{cmr.cmrNumber}</span>
          {' · '}
          {cmr.origin} → {cmr.destination}
        </p>
        <p className="text-[11px] text-[#9aa8bc] fr-mono mt-0.5">
          {cmr.loadedWeightT} t · {cmr.grossWeightKg.toLocaleString('nl-NL')} kg
          {cmr.adr ? ` · ADR ${cmr.adrClass}` : ''}
        </p>
      </div>
      <span className="text-[#00a3ff] text-xs font-bold shrink-0">Open</span>
    </button>
  );
}
