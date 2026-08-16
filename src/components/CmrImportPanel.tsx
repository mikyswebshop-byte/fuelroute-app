'use client';

import { useId, useRef, useState, type ChangeEvent } from 'react';
import { ActionButton } from '@/components/ActionBar';
import { useUi } from '@/components/useUi';
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
  onApplied?: (cmr: CmrShipment) => void;
  compact?: boolean;
}) {
  const ui = useUi();
  const uid = useId();
  const fileInputId = `${uid}-file`;
  const photoInputId = `${uid}-photo`;
  const fallbackInputId = `${uid}-fallback`;
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
        ? `${ui('cmr_applied_trip')} · ${cmr.cmrNumber} · ${cmr.origin} → ${cmr.destination}`
        : `${ui('cmr_active_applied')} · ${cmr.cmrNumber}`
    );
    onApplied?.(cmr);
  };

  const runFile = (file: File | undefined | null) => {
    if (!file) {
      setPickerError('—');
      return;
    }
    const ok =
      ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', ''].includes(file.type) ||
      /\.(pdf|jpe?g|png)$/i.test(file.name);
    const okMime =
      ok || file.type.startsWith('image/') || file.type === 'application/pdf';
    if (!okMime && file.size === 0) {
      setPickerError('—');
      return;
    }
    if (!okMime && !/\./.test(file.name)) {
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        setPickerError('PDF / JPG / PNG');
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
        setPickerError('PDF / JPG');
      }
    }, 700);
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    runFile(e.target.files?.[0]);
    e.target.value = '';
  };

  const shown = draft ?? active;
  const isApplied = !!shown && active?.id === shown.id;

  return (
    <div className={`space-y-3 ${compact ? '' : 'fr-glass p-4 sm:p-5'}`}>
      <div>
        <p className="fr-label">{ui('cmr_import_title')}</p>
        <h3 className="fr-display text-base sm:text-lg mt-0.5">{ui('cmr_from_file')}</h3>
        <p className="text-xs text-[var(--fr-text-muted)] mt-1 leading-relaxed">
          {ui('cmr_ocr_hint')}
        </p>
      </div>

      <input
        id={fileInputId}
        ref={fileRef}
        type="file"
        accept="image/*,.pdf,application/pdf,.jpg,.jpeg,.png"
        className="sr-only"
        onChange={onInputChange}
      />
      <input
        id={photoInputId}
        ref={photoRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={onInputChange}
      />
      <input
        id={fallbackInputId}
        type="file"
        accept="image/*,.pdf,application/pdf,.jpg,.jpeg,.png"
        className="sr-only"
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
          {scanning ? 'OCR…' : ui('cmr_drag')}
        </p>
        <p className="text-[11px] text-[#6b7a90] mt-1">{ui('cmr_formats')}</p>

        <div className="mt-4 flex flex-col sm:flex-row flex-wrap justify-center gap-2">
          <label
            htmlFor={fileInputId}
            className="inline-flex items-center justify-center gap-1.5 rounded-[10px] px-4 py-3 text-xs font-semibold cursor-pointer bg-[#00a3ff] text-white shadow-[0_0_20px_rgba(0,163,255,0.35)] hover:bg-[#007aff] touch-manipulation"
          >
            📄 {ui('cmr_choose_file')}
          </label>
          <label
            htmlFor={photoInputId}
            className="inline-flex items-center justify-center gap-1.5 rounded-[10px] px-4 py-3 text-xs font-semibold cursor-pointer bg-transparent text-[#e8eef7] border border-[#00a3ff]/50 hover:bg-[#00a3ff]/10 touch-manipulation"
          >
            📷 {ui('cmr_photo_gallery')}
          </label>
        </div>

        <div className="mt-4 text-left space-y-1.5">
          <p className="fr-label text-center sm:text-left">{ui('cmr_fallback')}</p>
          <label
            htmlFor={fallbackInputId}
            className="inline-flex w-full sm:w-auto items-center justify-center rounded-[8px] bg-[#00a3ff] px-3 py-2 text-xs font-semibold text-white cursor-pointer touch-manipulation"
          >
            {ui('choose_file_native')}
          </label>
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
            setFlash(ui('cmr_clear'));
          }}
        />
      )}

      {history.length > 0 && (
        <div className="space-y-2">
          <p className="fr-label">{ui('cmr_history')}</p>
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
  const ui = useUi();
  return (
    <div
      className={`rounded-[12px] border p-3.5 space-y-3 ${
        isApplied ? 'border-[#28a745]/40 bg-[#28a745]/05' : 'border-[#1e2a3a] bg-[#0b0e11]'
      }`}
    >
      <div className="flex flex-wrap gap-2">
        {isApplied ? (
          <span className="inline-flex items-center rounded-[10px] bg-[#28a745]/20 border border-[#28a745]/40 px-3 py-2 text-xs font-bold text-[#86efac]">
            ✓ {ui('cmr_applied_trip')}
          </span>
        ) : (
          <ActionButton variant="primary" className="flex-1 min-w-[160px]" onClick={onApply}>
            ✓ {ui('cmr_applied_trip')}
          </ActionButton>
        )}
        <ActionButton variant="slate" onClick={onClear}>
          {ui('cmr_clear')}
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
        <Field label={ui('cmr_shipper')} value={cmr.shipper} />
        <Field label={ui('cmr_consignee')} value={cmr.consignee} />
        <Field label={ui('origin')} value={cmr.origin} />
        <Field label={ui('destination')} value={cmr.destination} />
        <Field label={ui('cmr_goods')} value={cmr.goodsDescription} />
        <Field label={ui('cmr_packages')} value={String(cmr.packages)} />
        <Field label={ui('cmr_weight_kg')} value={`${cmr.grossWeightKg.toLocaleString()} kg`} mono />
        <Field label={ui('cmr_weight_t')} value={`${cmr.loadedWeightT} t`} mono />
        <Field label={ui('cmr_truck')} value={cmr.truckPlate} mono />
        <Field label={ui('cmr_trailer')} value={cmr.trailerPlate} mono />
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

export function ActiveCmrBanner({ onOpen }: { onOpen?: () => void }) {
  const cmr = useActiveCmr();
  const ui = useUi();
  if (!cmr) return null;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full text-left fr-glass px-3 py-2.5 flex items-center justify-between gap-2 hover:border-[#00a3ff]/40"
    >
      <div className="min-w-0">
        <p className="fr-label">{ui('cmr_active_applied')}</p>
        <p className="text-sm font-bold text-[#f2f6fb] truncate">
          <span className="fr-mono text-[#00a3ff]">{cmr.cmrNumber}</span>
          {' · '}
          {cmr.origin} → {cmr.destination}
        </p>
        <p className="text-[11px] text-[#9aa8bc] fr-mono mt-0.5">
          {cmr.loadedWeightT} t · {cmr.grossWeightKg.toLocaleString()} kg
          {cmr.adr ? ` · ADR ${cmr.adrClass}` : ''}
        </p>
      </div>
      <span className="text-[#00a3ff] text-xs font-bold shrink-0">{ui('cmr_open')}</span>
    </button>
  );
}
