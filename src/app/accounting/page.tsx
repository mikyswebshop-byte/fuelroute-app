'use client';

import { useMemo, useState } from 'react';
import { ActionBar, ActionButton } from '@/components/ActionBar';
import { CameraCaptureModal } from '@/components/CameraCaptureModal';
import { RoleGate } from '@/components/RoleGate';
import { SignatureModal } from '@/components/SignatureModal';
import { VehicleDamagePicker } from '@/components/VehicleDamagePicker';
import { scrollToId } from '@/lib/access';
import {
  fuelInvoices,
  invoiceMatchRows,
  receiptDocuments,
  vatRefundByCountry,
} from '@/lib/mock-data';
import type { CaptureGuide } from '@/lib/photo-quality';
import { factuurStatusLabel } from '@/lib/ui-labels';

function statusBadge(status: string) {
  if (status === 'Betaald' || status === 'Match')
    return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  if (status === 'Open' || status === 'Controle')
    return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  if (status === 'Afwijking') return 'bg-red-500/20 text-red-400 border-red-500/30';
  return 'bg-sky-500/20 text-[#38bdf8] border-sky-500/30';
}

type ExportFormat = 'Exact Online' | 'DATEV' | 'CSV' | 'PDF';

function downloadBlob(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AccountingPage() {
  const [selectedId, setSelectedId] = useState(receiptDocuments[0]?.id ?? '');
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [lastExport, setLastExport] = useState<ExportFormat | null>(null);
  const [truckCount, setTruckCount] = useState(12);
  const [pricePerTruck, setPricePerTruck] = useState(12);
  const [showSignature, setShowSignature] = useState(false);
  const [ecmrSigner, setEcmrSigner] = useState<{ name: string; at: string } | null>(null);
  const [damageLinks, setDamageLinks] = useState<
    { fileName: string; preview: string; linkedDoc: string; at: string; ocr?: number }[]
  >([]);
  const [cameraGuide, setCameraGuide] = useState<CaptureGuide | null>(null);
  const [showDamagePicker, setShowDamagePicker] = useState(false);
  const [selectedDamageZone, setSelectedDamageZone] = useState<string | null>(null);
  const [qualityToast, setQualityToast] = useState<string | null>(null);
  const [showMatchesOnly, setShowMatchesOnly] = useState(false);
  const [matchFilter, setMatchFilter] = useState<'all' | 'Afwijking' | 'Match'>('all');

  const selected = useMemo(
    () => receiptDocuments.find((d) => d.id === selectedId) ?? receiptDocuments[0],
    [selectedId]
  );

  const filteredMatchRows = useMemo(() => {
    if (matchFilter === 'all') {
      return showMatchesOnly
        ? invoiceMatchRows.filter((r) => r.status === 'Match')
        : invoiceMatchRows;
    }
    return invoiceMatchRows.filter((r) => r.status === matchFilter);
  }, [matchFilter, showMatchesOnly]);

  const totalNet = fuelInvoices.reduce((s, i) => s + i.netEur, 0);
  const totalSavings = fuelInvoices.reduce((s, i) => s + i.savingsEur, 0);
  const totalLiters = fuelInvoices.reduce((s, i) => s + i.liters, 0);
  const totalVatEligible = vatRefundByCountry.reduce((s, r) => s + r.eligibleVatEur, 0);
  const savingsPerTruck = 500;
  const monthlyPlatformCost = truckCount * pricePerTruck;
  const monthlyNetRoi = truckCount * savingsPerTruck - monthlyPlatformCost;

  const exportEuVatReport = () => {
    const header = 'country,countryName,eligibleVatEur,exciseEur,receipts,status\n';
    const rows = vatRefundByCountry
      .map(
        (r) =>
          `${r.country},${r.countryName},${r.eligibleVatEur},${r.exciseEur},${r.receipts},${r.status}`
      )
      .join('\n');
    downloadBlob('fuelroute-eu-btw-2008-9.csv', header + rows, 'text/csv;charset=utf-8');
    setExportStatus(
      'EU BTW-teruggave rapport gedownload · Richtlijn 2008/9/EG (Directive 2008/9/EC)'
    );
  };

  const runExport = (format: ExportFormat) => {
    setLastExport(format);
    setExportStatus(`Bezig met export naar ${format}…`);

    window.setTimeout(() => {
      if (format === 'CSV') {
        const header = 'id,aanbieder,periode,liters,nettoEur,besparingEur,status\n';
        const rows = fuelInvoices
          .map(
            (i) =>
              `${i.id},${i.provider},${i.period},${i.liters},${i.netEur},${i.savingsEur},${i.status}`
          )
          .join('\n');
        downloadBlob('fuelroute-facturen.csv', header + rows, 'text/csv;charset=utf-8');
      } else if (format === 'PDF') {
        downloadBlob(
          'fuelroute-batch-export.txt',
          `FuelRoute PDF-batch-export\nGegenereerd: ${new Date().toISOString()}\nFacturen: ${fuelInvoices.length}\nNettototaal: €${totalNet.toFixed(2)}\n`,
          'text/plain;charset=utf-8'
        );
      } else if (format === 'Exact Online') {
        downloadBlob(
          'fuelroute-exact-online.xml',
          `<?xml version="1.0"?><ExactOnlineExport invoices="${fuelInvoices.length}" net="${totalNet.toFixed(2)}" />`,
          'application/xml'
        );
      } else {
        downloadBlob(
          'fuelroute-datev.csv',
          `DATEV;FuelRoute;${fuelInvoices.length};${totalNet.toFixed(2)}\n`,
          'text/csv;charset=utf-8'
        );
      }
      setExportStatus(`Export naar ${format} voltooid · download gestart`);
    }, 450);
  };

  return (
    <main className="p-6 md:p-8 max-w-7xl mx-auto space-y-6" style={{ background: '#0b0f19' }}>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-[#f8fafc]">Boekhouding {'&'} OCR</h1>
          <p className="text-[#cbd5e1] mt-1">
            Btw/accijns-teruggave · ROI · DATEV / Exact Online / PDF
          </p>
        </div>
        {exportStatus && (
          <span className="text-xs font-semibold text-[#10b981] bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-full">
            {exportStatus}
          </span>
        )}
      </div>

      <RoleGate componentId="invoice_matching">
        <ActionBar title="Boekhouding & matching">
          <ActionButton
            variant="primary"
            className="w-full py-3"
            onClick={() => {
              setMatchFilter('all');
              setShowMatchesOnly(false);
              setExportStatus('Verzamel-factuur matching geladen');
              scrollToId('invoice-matching-sectie');
            }}
          >
            🔍 Verzamel-Factuur Matching
          </ActionButton>
          <ActionButton
            variant="utility"
            className="w-full py-3"
            onClick={() => {
              setMatchFilter('Afwijking');
              setShowMatchesOnly(false);
              scrollToId('invoice-matching-sectie');
            }}
          >
            ⚠ Alleen Afwijkingen
          </ActionButton>
          <RoleGate componentId="vat_reports">
            <ActionButton
              variant="secondary"
              className="w-full py-3"
              onClick={() => {
                exportEuVatReport();
                scrollToId('vat-sectie');
              }}
            >
              🇪🇺 EU BTW-Teruggave Rapport (2008/9/EG)
            </ActionButton>
          </RoleGate>
          <ActionButton
            variant="slate"
            className="w-full py-3"
            onClick={() => {
              setMatchFilter('Match');
              setShowMatchesOnly(true);
              scrollToId('invoice-matching-sectie');
            }}
          >
            ✓ Alleen Matches
          </ActionButton>
        </ActionBar>
      </RoleGate>

      <ActionBar title="Camera & AI-documentvalidatie">
        <ActionButton
          variant="primary"
          className="w-full py-3"
          onClick={() => setCameraGuide('cmr')}
        >
          📷 CMR Vrachtbrief Scannen
        </ActionButton>
        <ActionButton
          variant="secondary"
          className="w-full py-3"
          onClick={() => setCameraGuide('tankbon')}
        >
          📷 Tankbon / Bon Scannen
        </ActionButton>
        <RoleGate componentId="walkaround_forms">
          <ActionButton
            variant="primary"
            className="w-full py-3"
            onClick={() => setShowDamagePicker(true)}
          >
            📷 Incident / Schadefoto
          </ActionButton>
          <ActionButton
            variant="secondary"
            className="w-full py-3"
            onClick={() => setCameraGuide('focus')}
          >
            📷 Slot / Zegel Focus
          </ActionButton>
        </RoleGate>
      </ActionBar>

      {qualityToast && (
        <div className="rounded-xl border-2 border-emerald-500/50 bg-emerald-500/15 px-4 py-3 text-sm font-bold text-emerald-300">
          ✓ AKKOORD — {qualityToast}
        </div>
      )}

      <RoleGate componentId="accounting_exports">
        <ActionBar title="Export & documentacties">
          <ActionButton
            variant="primary"
            className="w-full"
            onClick={() => {
              runExport('PDF');
              scrollToId('export-sectie');
            }}
          >
            📄 Exporteer naar PDF
          </ActionButton>
          <ActionButton
            variant="secondary"
            className="w-full"
            onClick={() => {
              runExport('Exact Online');
              scrollToId('export-sectie');
            }}
          >
            📊 Exporteer naar Exact Online
          </ActionButton>
          <ActionButton variant="utility" className="w-full" onClick={() => setShowSignature(true)}>
            ✍️ e-CMR Digitale Handtekening
          </ActionButton>
          <ActionButton
            variant="slate"
            className="w-full"
            onClick={() => {
              runExport('DATEV');
              scrollToId('export-sectie');
            }}
          >
            📁 Exporteer naar DATEV
          </ActionButton>
        </ActionBar>
      </RoleGate>

      <RoleGate componentId="csv_exports">
        <ActionBar title="Secundaire exports">
          <ActionButton
            variant="slate"
            className="w-full"
            onClick={() => {
              runExport('CSV');
              scrollToId('export-sectie');
            }}
          >
            📑 Exporteer naar CSV
          </ActionButton>
        </ActionBar>
      </RoleGate>

      <div id="export-sectie" className="sr-only" aria-hidden />

      {showDamagePicker && (
        <VehicleDamagePicker
          onClose={() => setShowDamagePicker(false)}
          onConfirm={(zone) => {
            setSelectedDamageZone(zone.label);
            setShowDamagePicker(false);
            setCameraGuide('schade');
          }}
        />
      )}

      {cameraGuide && (
        <CameraCaptureModal
          guide={cameraGuide}
          subtitle={
            cameraGuide === 'schade' && selectedDamageZone
              ? `Zone: ${selectedDamageZone} · gekoppeld aan ${selected?.id ?? 'document'} · e-CMR · boekhouding`
              : `Gekoppeld aan ${selected?.id ?? 'document'} · e-CMR · boekhouding`
          }
          onClose={() => setCameraGuide(null)}
          onAccepted={(dataUrl, quality) => {
            const zoneSuffix = selectedDamageZone
              ? `-${selectedDamageZone.toLowerCase().replace(/\s+/g, '-')}`
              : '';
            const zoneDoc =
              cameraGuide === 'schade' && selectedDamageZone
                ? `${selected?.id ?? 'DOC-ACTIEF'} · zone ${selectedDamageZone}`
                : (selected?.id ?? 'DOC-ACTIEF');
            setDamageLinks((prev) => [
              {
                fileName:
                  cameraGuide === 'cmr'
                    ? 'cmr-scan.jpg'
                    : cameraGuide === 'tankbon'
                      ? 'tankbon-scan.jpg'
                      : `schade${zoneSuffix}-scan.jpg`,
                preview: dataUrl,
                linkedDoc: zoneDoc,
                at: new Date().toLocaleString('nl-NL'),
                ocr: quality.ocrConfidence,
              },
              ...prev,
            ]);
            setQualityToast(quality.passMessage);
            setExportStatus(
              cameraGuide === 'schade' && selectedDamageZone
                ? `Schadefoto goedgekeurd (${selectedDamageZone}, OCR ${quality.ocrConfidence}%) · gekoppeld aan ${selected?.id ?? 'document'}`
                : `Foto goedgekeurd (OCR ${quality.ocrConfidence}%) · gekoppeld aan ${selected?.id ?? 'document'}`
            );
            setCameraGuide(null);
            window.setTimeout(() => setQualityToast(null), 3200);
          }}
        />
      )}

      <RoleGate componentId="invoice_matching">
      <div
        id="invoice-matching-sectie"
        className="bg-[#1e293b] rounded-2xl border border-slate-700 overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-slate-700 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-[#f8fafc]">Verzamel-Factuur Matching</h2>
            <p className="text-xs text-[#cbd5e1]">
              Bon ↔ factuur ↔ GPS · filter:{' '}
              {matchFilter === 'all'
                ? showMatchesOnly
                  ? 'Alleen Matches'
                  : 'Alles'
                : matchFilter}
            </p>
          </div>
          <span className="text-xs font-semibold text-[#38bdf8]">
            {filteredMatchRows.length} / {invoiceMatchRows.length} rijen
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-900/60 text-[#cbd5e1] text-xs uppercase">
              <tr>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Bon-ID</th>
                <th className="px-4 py-3">Truck</th>
                <th className="px-4 py-3">Liters factuur</th>
                <th className="px-4 py-3">Liters bon</th>
                <th className="px-4 py-3">GPS</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Melding</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {filteredMatchRows.map((row) => {
                const litersDiff = Math.abs(row.litersInvoice - row.litersReceipt);
                const isAfwijking = row.status === 'Afwijking';
                const isControle = row.status === 'Controle';
                return (
                  <tr
                    key={row.id}
                    className={
                      isAfwijking
                        ? 'bg-red-500/10 hover:bg-red-500/15'
                        : isControle
                          ? 'bg-amber-500/10 hover:bg-amber-500/15'
                          : 'hover:bg-slate-900/40'
                    }
                  >
                    <td className="px-4 py-3 font-semibold text-[#f8fafc]">{row.provider}</td>
                    <td className="px-4 py-3 font-mono text-[#38bdf8]">{row.receiptId}</td>
                    <td className="px-4 py-3 text-[#f8fafc]">{row.truck}</td>
                    <td
                      className={`px-4 py-3 font-semibold ${
                        litersDiff > 0 && row.status !== 'Match'
                          ? 'text-amber-300'
                          : 'text-[#f8fafc]'
                      }`}
                    >
                      {row.litersInvoice.toLocaleString('nl-NL', { minimumFractionDigits: 1 })}
                    </td>
                    <td
                      className={`px-4 py-3 font-semibold ${
                        litersDiff > 0 && row.status !== 'Match'
                          ? isAfwijking
                            ? 'text-red-400'
                            : 'text-amber-300'
                          : 'text-[#f8fafc]'
                      }`}
                    >
                      {row.litersReceipt.toLocaleString('nl-NL', { minimumFractionDigits: 1 })}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          row.gpsMoving
                            ? 'text-[#10b981] font-semibold'
                            : 'text-red-400 font-semibold'
                        }
                      >
                        {row.gpsMoving ? 'Rijdend' : 'Stilstand'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusBadge(row.status)}`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-3 text-xs ${
                        isAfwijking
                          ? 'text-red-300 font-semibold'
                          : isControle
                            ? 'text-amber-200'
                            : 'text-[#cbd5e1]'
                      }`}
                    >
                      {row.flag}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      </RoleGate>

      <RoleGate componentId="vat_reports">
      <div
        id="vat-sectie"
        className="bg-[#1e293b] rounded-2xl border border-amber-500/30 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-lg font-bold text-[#f8fafc]">
            EU BTW-Teruggave (Richtlijn 2008/9/EG)
          </h2>
          <p className="text-xs text-[#cbd5e1] mt-1">
            Directive 2008/9/EC · totaal teruggavegerechtigd:{' '}
            <span className="text-amber-300 font-bold">
              € {totalVatEligible.toLocaleString('nl-NL', { maximumFractionDigits: 0 })}
            </span>
          </p>
        </div>
        <ActionButton variant="secondary" className="py-3" onClick={exportEuVatReport}>
          🇪🇺 Exporteer EU BTW-rapport
        </ActionButton>
      </div>
      </RoleGate>

      {(ecmrSigner || damageLinks.length > 0) && (
        <div className="bg-[#1e293b] border border-emerald-500/30 rounded-2xl p-4 space-y-3">
          <h2 className="text-sm font-bold text-[#f8fafc]">e-CMR {'&'} Incidentkoppeling</h2>
          {ecmrSigner && (
            <p className="text-sm text-[#10b981] font-semibold">
              ✓ e-CMR ondertekend door {ecmrSigner.name} · {ecmrSigner.at} · gekoppeld aan{' '}
              {selected?.id ?? 'document'}
            </p>
          )}
          {damageLinks.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {damageLinks.map((d) => (
                <div
                  key={`${d.fileName}-${d.at}`}
                  className="rounded-xl border border-amber-500/30 bg-slate-900 p-3 flex gap-3"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={d.preview}
                    alt="Schadefoto"
                    className="w-16 h-16 object-cover rounded-lg border border-slate-600"
                  />
                  <div className="text-xs">
                    <p className="font-bold text-amber-300">{d.fileName}</p>
                    <p className="text-[#cbd5e1]">
                      → {d.linkedDoc} · e-CMR · boekhoudrecord
                      {d.ocr != null ? ` · OCR ${d.ocr}%` : ''}
                    </p>
                    <p className="text-[#cbd5e1] mt-1">{d.at}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showSignature && (
        <SignatureModal
          title="e-CMR & Klant Digitale Handtekening"
          subtitle={`Ontvanger tekent levering · document ${selected?.id ?? ''}`}
          onClose={() => setShowSignature(false)}
          onSave={(_dataUrl, signerName) => {
            setEcmrSigner({ name: signerName, at: new Date().toLocaleString('nl-NL') });
            setExportStatus(`e-CMR handtekening opgeslagen · ${signerName}`);
            setShowSignature(false);
          }}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-700">
          <span className="text-xs text-[#cbd5e1]">Totaal Netto Facturen</span>
          <p className="text-2xl font-black text-[#f8fafc] mt-1">
            € {totalNet.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-700">
          <span className="text-xs text-[#cbd5e1]">Gerealiseerde Besparing</span>
          <p className="text-2xl font-black text-[#10b981] mt-1">
            € {totalSavings.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-700">
          <span className="text-xs text-[#cbd5e1]">Getankte Liters</span>
          <p className="text-2xl font-black text-[#38bdf8] mt-1">
            {totalLiters.toLocaleString('nl-NL')} L
          </p>
        </div>
        <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-700">
          <span className="text-xs text-[#cbd5e1]">Btw-teruggave gereed</span>
          <p className="text-2xl font-black text-amber-300 mt-1">
            € {totalVatEligible.toLocaleString('nl-NL', { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RoleGate componentId="vat_reports">
        <div className="bg-[#1e293b] rounded-2xl border border-slate-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700">
            <h2 className="text-lg font-bold text-[#f8fafc]">Buitenlandse Btw- {'&'} Accijnsteruggave</h2>
            <p className="text-xs text-[#cbd5e1]">
              Teruggavegerechtigheid per land · automatische bonclustering · Richtlijn 2008/9/EG
              (Directive 2008/9/EC)
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-900/60 text-[#cbd5e1] text-xs uppercase">
                <tr>
                  <th className="px-4 py-3">Land</th>
                  <th className="px-4 py-3">Btw (€)</th>
                  <th className="px-4 py-3">Accijns (€)</th>
                  <th className="px-4 py-3">Bonnen</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {vatRefundByCountry.map((row) => (
                  <tr key={row.country} className="hover:bg-slate-900/40">
                    <td className="px-4 py-3 font-semibold text-[#f8fafc]">
                      {row.countryName} ({row.country})
                    </td>
                    <td className="px-4 py-3 text-[#10b981] font-bold">
                      € {row.eligibleVatEur.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-[#cbd5e1]">
                      € {row.exciseEur.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-[#38bdf8] font-semibold">{row.receipts}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-[11px] font-bold border border-sky-500/30 bg-sky-500/10 text-[#38bdf8]">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </RoleGate>

        <div className="bg-[#1e293b] rounded-2xl border border-emerald-500/30 p-5 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-[#f8fafc]">ROI {'&'} Besparingscalculator</h2>
            <p className="text-xs text-[#cbd5e1]">CFO-metrics · €500/maand per truck · staffelprijzen</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#cbd5e1] mb-1">Aantal trucks</label>
              <input
                type="number"
                min={1}
                max={200}
                value={truckCount}
                onChange={(e) => setTruckCount(Number(e.target.value) || 1)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-[#f8fafc]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#cbd5e1] mb-1">Staffelprijs (€/truck/maand)</label>
              <select
                value={pricePerTruck}
                onChange={(e) => setPricePerTruck(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-[#f8fafc]"
              >
                <option value={8}>€ 8 (volume)</option>
                <option value={10}>€ 10</option>
                <option value={12}>€ 12 (standaard)</option>
                <option value={15}>€ 15 (premium)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between bg-slate-900 rounded-lg border border-slate-700 px-3 py-2">
              <span className="text-[#cbd5e1]">Besparing per truck / maand</span>
              <span className="font-bold text-[#10b981]">€ {savingsPerTruck}</span>
            </div>
            <div className="flex justify-between bg-slate-900 rounded-lg border border-slate-700 px-3 py-2">
              <span className="text-[#cbd5e1]">Bruto vlootbesparing</span>
              <span className="font-bold text-[#f8fafc]">
                € {(truckCount * savingsPerTruck).toLocaleString('nl-NL')}
              </span>
            </div>
            <div className="flex justify-between bg-slate-900 rounded-lg border border-slate-700 px-3 py-2">
              <span className="text-[#cbd5e1]">Platformkosten</span>
              <span className="font-bold text-amber-300">
                € {monthlyPlatformCost.toLocaleString('nl-NL')}
              </span>
            </div>
            <div className="flex justify-between bg-emerald-500/10 rounded-lg border border-emerald-500/30 px-3 py-3">
              <span className="text-[#cbd5e1] font-semibold">Netto ROI / maand</span>
              <span className="font-black text-[#10b981] text-lg">
                € {monthlyNetRoi.toLocaleString('nl-NL')}
              </span>
            </div>
          </div>
          {lastExport && (
            <p className="text-[11px] text-[#cbd5e1]">Laatste export: {lastExport}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#1e293b] rounded-2xl border border-slate-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700">
            <h2 className="text-lg font-bold text-[#f8fafc]">Tankbonnen {'&'} Documentbeheer</h2>
          </div>
          <div className="divide-y divide-slate-700/60">
            {receiptDocuments.map((doc) => {
              const active = doc.id === selected?.id;
              return (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => setSelectedId(doc.id)}
                  className={`w-full text-left px-5 py-4 transition ${
                    active ? 'bg-sky-500/10' : 'hover:bg-slate-900/50'
                  }`}
                >
                  <p className="text-sm font-bold text-[#f8fafc]">{doc.previewLabel}</p>
                  <p className="text-[11px] text-[#cbd5e1]">
                    {doc.id} · {doc.truck} · {doc.date}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-[#1e293b] rounded-2xl border border-slate-700 p-5 space-y-4">
          <h2 className="text-lg font-bold text-[#f8fafc]">OCR-Inspectie</h2>
          {selected && (
            <>
              <div className="rounded-xl border border-dashed border-slate-600 bg-slate-900 p-5 text-center">
                <p className="text-sm font-bold text-[#38bdf8]">{selected.fileName}</p>
                <p className="text-xs text-[#cbd5e1] mt-1">{selected.stationName}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-900 rounded-lg border border-slate-700 p-3">
                  <span className="text-[11px] text-[#cbd5e1] block">Gedetecteerde Liters</span>
                  <span className="font-bold text-[#f8fafc]">{selected.liters || '—'} L</span>
                </div>
                <div className="bg-slate-900 rounded-lg border border-slate-700 p-3">
                  <span className="text-[11px] text-[#cbd5e1] block">Btw-Splitsing (DE/NL)</span>
                  <span className="font-bold text-[#10b981]">
                    €{selected.vatDeEur.toFixed(2)} / €{selected.vatNlEur.toFixed(2)}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="bg-[#1e293b] rounded-2xl border border-slate-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-[#f8fafc]">Brandstoffactuur Overzicht</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-900/60 text-[#cbd5e1] text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3">Factuur-ID</th>
                <th className="px-4 py-3">Aanbieder</th>
                <th className="px-4 py-3">Periode</th>
                <th className="px-4 py-3">Liters</th>
                <th className="px-4 py-3">Netto €</th>
                <th className="px-4 py-3">Besparing €</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {fuelInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-900/40">
                  <td className="px-4 py-3 font-mono text-[#38bdf8]">{inv.id}</td>
                  <td className="px-4 py-3 font-semibold text-[#f8fafc]">{inv.provider}</td>
                  <td className="px-4 py-3 text-[#cbd5e1]">{inv.period}</td>
                  <td className="px-4 py-3 text-[#f8fafc]">
                    {inv.liters.toLocaleString('nl-NL')}
                  </td>
                  <td className="px-4 py-3 text-[#f8fafc] font-semibold">
                    € {inv.netEur.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 font-bold text-[#10b981]">
                    € {inv.savingsEur.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusBadge(inv.status)}`}
                    >
                      {factuurStatusLabel(inv.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
