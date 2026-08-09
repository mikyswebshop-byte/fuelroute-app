'use client';

import { useEffect, useMemo, useState } from 'react';
import { ActionButton } from '@/components/ActionBar';
import { DocumentUploadPanel } from '@/components/DocumentUploadPanel';
import { useLanguage } from '@/components/LanguageProvider';
import { useGloveboxUploads, type DocType } from '@/lib/glovebox-uploads';
import type { MessageKey } from '@/lib/i18n';
import { fleetTrucks } from '@/lib/mock-data';

type GloveDoc = {
  id: string;
  icon: string;
  titleKey?: MessageKey;
  title?: string;
  detail: string;
  keywords: string;
  primaryAction?: 'schade';
  uploaded?: boolean;
};

const DOCUMENTS: GloveDoc[] = [
  {
    id: 'euro',
    icon: '📜',
    titleKey: 'doc_niwo',
    detail: 'Status: Geldig t/m 2028 · Licentienr: EU-991823',
    keywords: 'eurovergunning niwo licentie eu',
  },
  {
    id: 'kenteken',
    icon: '🚗',
    titleKey: 'doc_registration',
    detail: 'Melding: Gecontroleerd door RDW',
    keywords: 'kentekenbewijs rdw deel registratie',
  },
  {
    id: 'verzekering',
    icon: '🛡️',
    titleKey: 'doc_insurance',
    detail: 'Polisnr: VP-883920-X · Dekking: Internationaal',
    keywords: 'verzekering groene kaart polis internationaal',
  },
  {
    id: 'schade',
    icon: '📝',
    titleKey: 'doc_damage_form',
    detail: 'Open of vul digitaal schadeformulier in bij incident',
    keywords: 'europees schadeformulier schade ongeval',
    primaryAction: 'schade',
  },
  {
    id: 'apk',
    icon: '🔍',
    titleKey: 'doc_apk',
    detail: 'APK Vervaldatum: 15-11-2026',
    keywords: 'apk technische keuring keuring',
  },
  {
    id: 'adr',
    icon: '⚠️',
    titleKey: 'doc_adr',
    detail: 'Instructies bij pech, ongeval of ladingcontrole',
    keywords: 'veiligheid adr pech ongeval ladingcontrole protocol',
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
      fleetTrucks.map((t) => ({
        id: t.truckId,
        label: `${t.licensePlate} · ${t.model.replace(/\s+\d+$/, '').trim() || t.model}`,
        plate: t.licensePlate,
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

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700/80 bg-slate-900/80 shadow-2xl backdrop-blur-xl p-5 sm:p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="glovebox-title"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="glovebox-title" className="text-base sm:text-lg font-bold text-slate-50">
              {t('glovebox_title')}
            </h2>
            <p className="text-[11px] text-slate-400 mt-1">
              {t('glovebox_subtitle')}
              {uploadedDocs.length > 0
                ? ` · ${uploadedDocs.length} · ${selected?.plate}`
                : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-slate-600 bg-slate-950/60 px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800"
          >
            {t('btn_close')}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">{t('glovebox_vehicle')}</label>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-600 rounded-xl px-3 py-2.5 text-sm text-slate-100"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">{t('glovebox_search')}</label>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`${t('glovebox_search')}…`}
              className="w-full bg-slate-950/70 border border-slate-600 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500"
            />
          </div>
        </div>

        {toast && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 px-3 py-2 text-xs font-semibold text-emerald-300">
            {toast}
          </div>
        )}

        <DocumentUploadPanel
          id="glovebox-inline-upload"
          embedded
          defaultPlate={selected?.plate}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              className={`rounded-xl border p-4 space-y-3 ${
                doc.uploaded
                  ? 'border-emerald-500/35 bg-emerald-950/20'
                  : 'border-slate-700/80 bg-slate-950/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl" aria-hidden>
                  {doc.icon}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-100">
                    {doc.title}
                    {doc.uploaded && (
                      <span className="ml-2 text-[10px] font-semibold text-emerald-300">
                        OCR
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{doc.detail}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
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
                <ActionButton
                  variant="utility"
                  onClick={() => {
                    const shareText = `${doc.title} — ${selected?.label ?? ''}\n${doc.detail}`;
                    if (navigator.share) {
                      void navigator
                        .share({ title: doc.title, text: shareText })
                        .catch(() => flash(t('btn_share')));
                    } else if (navigator.clipboard?.writeText) {
                      void navigator.clipboard.writeText(shareText);
                      flash(t('btn_share'));
                    } else {
                      flash(t('btn_share'));
                    }
                  }}
                >
                  {t('btn_share')}
                </ActionButton>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-6">
            Geen documenten gevonden voor “{query}”.
          </p>
        )}
      </div>
    </div>
  );
}
