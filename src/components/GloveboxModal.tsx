'use client';

import { useEffect, useMemo, useState } from 'react';
import { ActionButton } from '@/components/ActionBar';
import { DocumentUploadPanel } from '@/components/DocumentUploadPanel';
import { useLanguage } from '@/components/LanguageProvider';
import { useGloveboxUploads, type DocType } from '@/lib/glovebox-uploads';
import type { MessageKey } from '@/lib/i18n';
import { fleetTrucks } from '@/lib/mock-data';

type DocTag = 'CMR' | 'Tankbon' | 'Factuur' | 'APK' | 'ADR' | 'Licentie' | 'Overig';

type GloveDoc = {
  id: string;
  icon: string;
  titleKey?: MessageKey;
  title?: string;
  detail: string;
  keywords: string;
  primaryAction?: 'schade';
  uploaded?: boolean;
  tag: DocTag;
  sizeLabel: string;
  dateLabel: string;
};

const TAG_CLASS: Record<DocTag, string> = {
  CMR: 'bg-[#00a3ff]/15 text-[#7dd3fc] border-[#00a3ff]/35',
  Tankbon: 'bg-[#ff9500]/15 text-[#ffb84d] border-[#ff9500]/35',
  Factuur: 'bg-[#a78bfa]/15 text-[#c4b5fd] border-[#a78bfa]/35',
  APK: 'bg-[#28a745]/15 text-[#86efac] border-[#28a745]/35',
  ADR: 'bg-[#ff3b30]/15 text-[#ff8a82] border-[#ff3b30]/35',
  Licentie: 'bg-[#38bdf8]/15 text-[#7dd3fc] border-[#38bdf8]/35',
  Overig: 'bg-[#151d2a] text-[#9aa8bc] border-[#1e2a3a]',
};

const DOCUMENTS: GloveDoc[] = [
  {
    id: 'euro',
    icon: '📜',
    titleKey: 'doc_niwo',
    detail: 'Status: Geldig t/m 2028 · Licentienr: EU-991823',
    keywords: 'eurovergunning niwo licentie eu',
    tag: 'Licentie',
    sizeLabel: '1,2 MB',
    dateLabel: '12-03-2025',
  },
  {
    id: 'kenteken',
    icon: '🚗',
    titleKey: 'doc_registration',
    detail: 'Melding: Gecontroleerd door RDW',
    keywords: 'kentekenbewijs rdw deel registratie',
    tag: 'Overig',
    sizeLabel: '840 KB',
    dateLabel: '04-01-2026',
  },
  {
    id: 'verzekering',
    icon: '🛡️',
    titleKey: 'doc_insurance',
    detail: 'Polisnr: VP-883920-X · Dekking: Internationaal',
    keywords: 'verzekering groene kaart polis internationaal',
    tag: 'Factuur',
    sizeLabel: '2,1 MB',
    dateLabel: '18-11-2025',
  },
  {
    id: 'schade',
    icon: '📝',
    titleKey: 'doc_damage_form',
    detail: 'Open of vul digitaal schadeformulier in bij incident',
    keywords: 'europees schadeformulier schade ongeval',
    primaryAction: 'schade',
    tag: 'CMR',
    sizeLabel: '320 KB',
    dateLabel: '01-08-2026',
  },
  {
    id: 'apk',
    icon: '🔍',
    titleKey: 'doc_apk',
    detail: 'APK Vervaldatum: 15-11-2026',
    keywords: 'apk technische keuring keuring',
    tag: 'APK',
    sizeLabel: '1,0 MB',
    dateLabel: '15-11-2025',
  },
  {
    id: 'adr',
    icon: '⚠️',
    titleKey: 'doc_adr',
    detail: 'Instructies bij pech, ongeval of ladingcontrole',
    keywords: 'veiligheid adr pech ongeval ladingcontrole protocol',
    tag: 'ADR',
    sizeLabel: '640 KB',
    dateLabel: '22-06-2026',
  },
];

const TYPE_ICON: Record<DocType, string> = {
  Kentekenbewijs: '🚗',
  Verzekering: '🛡️',
  APK: '🔍',
  NIWO: '📜',
  ADR: '⚠️',
  Overig: '📄',
};

function tagForType(docType: DocType): DocTag {
  if (docType === 'APK') return 'APK';
  if (docType === 'ADR') return 'ADR';
  if (docType === 'NIWO') return 'Licentie';
  if (docType === 'Verzekering') return 'Factuur';
  return 'Overig';
}

function downloadDemoPdf(title: string, plate: string) {
  const body = `FuelRoute — Digitale Handschoenvak\nVoertuig: ${plate}\nDocument: ${title}\nGegenereerd: ${new Date().toLocaleString('nl-NL')}\n`;
  const blob = new Blob([body], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/gi, '-')}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

export function GloveboxModal({
  onClose,
  onOpenDamageReport,
  initialPlate,
}: {
  onClose: () => void;
  onOpenDamageReport?: () => void;
  initialPlate?: string;
}) {
  const { t } = useLanguage();
  const uploads = useGloveboxUploads();
  const vehicles = useMemo(
    () =>
      fleetTrucks.map((truck) => ({
        id: truck.truckId,
        label: `${truck.licensePlate} · ${truck.model.replace(/\s+\d+$/, '').trim() || truck.model}`,
        plate: truck.licensePlate,
      })),
    []
  );
  const [vehicleId, setVehicleId] = useState(() => {
    if (initialPlate) {
      return vehicles.find((v) => v.plate === initialPlate)?.id ?? vehicles[0]?.id ?? '';
    }
    return vehicles[0]?.id ?? '';
  });
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!initialPlate) return;
    const match = vehicles.find((v) => v.plate === initialPlate);
    if (match) setVehicleId(match.id);
  }, [initialPlate, vehicles]);

  const selected = vehicles.find((v) => v.id === vehicleId) ?? vehicles[0];

  const uploadedDocs: GloveDoc[] = useMemo(() => {
    const plate = selected?.plate;
    if (!plate) return [];
    return uploads
      .filter((u) => u.plate === plate)
      .map((u) => ({
        id: u.id,
        icon: TYPE_ICON[u.docType],
        title: `${u.docType} (upload)`,
        detail: `Bestand: ${u.fileName} · Vervaldatum: ${new Date(u.expires).toLocaleDateString('nl-NL')} · ${u.notes}`,
        keywords: `${u.docType} ${u.fileName} ${u.notes} upload ocr`.toLowerCase(),
        uploaded: true,
        tag: tagForType(u.docType),
        sizeLabel: 'Upload',
        dateLabel: new Date(u.expires).toLocaleDateString('nl-NL'),
      }));
  }, [uploads, selected?.plate]);

  const allDocs = useMemo(() => {
    const staticDocs = DOCUMENTS.map((d) => ({
      ...d,
      title: d.titleKey ? t(d.titleKey) : d.title ?? d.id,
    }));
    return [...uploadedDocs, ...staticDocs];
  }, [uploadedDocs, t]);

  const filtered = allDocs.filter((doc) => {
    const q = query.trim().toLowerCase();
    const title = doc.title ?? '';
    if (!q) return true;
    return (
      title.toLowerCase().includes(q) ||
      doc.detail.toLowerCase().includes(q) ||
      doc.keywords.includes(q)
    );
  });

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const usedGb = 2.7 + uploadedDocs.length * 0.15;
  const maxGb = 10;
  const usedPct = Math.min(100, (usedGb / maxGb) * 100);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 backdrop-blur-md p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto fr-glass p-5 sm:p-6 space-y-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="glovebox-title"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="glovebox-title" className="fr-display text-lg sm:text-xl">
              {t('glovebox_title')}
            </h2>
            <p className="text-[11px] text-[var(--fr-text-muted)] mt-1">
              {t('glovebox_subtitle')}
              {selected?.plate ? (
                <>
                  {' · '}
                  <span className="fr-mono text-[#00a3ff]">{selected.plate}</span>
                </>
              ) : null}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 inline-flex items-center gap-1 rounded-[10px] border border-[#1e2a3a] bg-[#0b0e11] px-2.5 py-1.5 text-xs font-semibold text-[#c5d0e0] hover:border-[#00a3ff]/40"
          >
            {t('btn_close')}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="fr-label mb-1 block">{t('glovebox_vehicle')}</label>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="w-full bg-[#050a0f] border border-[#1e2a3a] rounded-[10px] px-3 py-2.5 text-sm text-[#f2f6fb] fr-mono"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="fr-label mb-1 block">{t('glovebox_search')}</label>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`${t('glovebox_search')}…`}
              className="w-full bg-[#050a0f] border border-[#1e2a3a] rounded-[10px] px-3 py-2.5 text-sm text-[#f2f6fb] placeholder:text-[#6b7a90]"
            />
          </div>
        </div>

        {toast && (
          <div className="rounded-[12px] border border-[#28a745]/35 bg-[#28a745]/10 px-3 py-2 text-xs font-semibold text-[#86efac]">
            {toast}
          </div>
        )}

        <DocumentUploadPanel
          id="glovebox-inline-upload"
          embedded
          defaultPlate={selected?.plate}
        />

        {filtered.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <p className="text-3xl" aria-hidden>
              📂
            </p>
            <p className="fr-display text-base">EMPTY GLOVEBOX</p>
            <p className="text-sm text-[var(--fr-text-muted)]">
              {query ? `Geen documenten voor “${query}”.` : 'Nog geen bestanden in dit handschoenvak.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[#1e2a3a] rounded-[12px] border border-[#1e2a3a] overflow-hidden bg-[#0b0e11]/60">
            {filtered.map((doc) => (
              <li key={doc.id} className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#151d2a] border border-[#1e2a3a] text-lg"
                    aria-hidden
                  >
                    {doc.icon}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-[#f2f6fb] truncate">{doc.title}</p>
                      <span
                        className={`inline-flex rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${TAG_CLASS[doc.tag]}`}
                      >
                        {doc.tag}
                      </span>
                      {doc.uploaded && (
                        <span className="text-[10px] font-semibold text-[#86efac]">OCR</span>
                      )}
                    </div>
                    <p className="text-[11px] text-[var(--fr-text-muted)] mt-1 leading-relaxed">
                      {doc.detail}
                    </p>
                    <p className="fr-mono text-[10px] text-[#6b7a90] mt-1">
                      {doc.dateLabel} · {doc.sizeLabel}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end shrink-0">
                  {doc.primaryAction === 'schade' ? (
                    <ActionButton
                      variant="primary"
                      onClick={() => {
                        flash(t('doc_damage_form'));
                        if (onOpenDamageReport) {
                          onOpenDamageReport();
                          onClose();
                        }
                      }}
                    >
                      {t('doc_damage_form')}
                    </ActionButton>
                  ) : (
                    <ActionButton
                      variant="secondary"
                      onClick={() =>
                        flash(`${t('btn_view')}: ${doc.title} · ${selected?.plate ?? ''}`)
                      }
                    >
                      {t('btn_view')}
                    </ActionButton>
                  )}
                  <ActionButton
                    variant="slate"
                    onClick={() => {
                      downloadDemoPdf(doc.title ?? 'document', selected?.plate ?? 'voertuig');
                      flash(`${t('btn_download_pdf')}: ${doc.title}`);
                    }}
                  >
                    {t('btn_download_pdf')}
                  </ActionButton>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Storage bar — kit §06 */}
        <div className="pt-1 space-y-2">
          <div className="flex justify-between text-[11px] text-[var(--fr-text-muted)]">
            <span>Opslag</span>
            <span className="fr-mono">
              {usedGb.toFixed(1).replace('.', ',')} GB / {maxGb} GB
            </span>
          </div>
          <div className="h-2 rounded-full bg-[#050a0f] border border-[#1e2a3a] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#00a3ff] shadow-[0_0_12px_rgba(0,163,255,0.45)]"
              style={{ width: `${usedPct}%` }}
            />
          </div>
          <p className="text-center text-[10px] text-[#6b7a90]">Upload bestand via panel hierboven</p>
        </div>
      </div>
    </div>
  );
}
