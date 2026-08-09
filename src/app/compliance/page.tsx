'use client';

import { useMemo, useState } from 'react';
import { ActionBar, ActionButton } from '@/components/ActionBar';
import { DriveModeOverlay } from '@/components/DriveModeOverlay';
import { useAppMode } from '@/components/AppModeProvider';
import { RoleGate } from '@/components/RoleGate';
import { scrollToId } from '@/lib/access';
import { driverStopAdherence, ecoScoreLeaderboard, parkingSecurity } from '@/lib/mock-data';

type SortKey = 'score' | 'approved' | 'highway' | 'driver';

function downloadBlob(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function CompliancePage() {
  const {
    dutyMode,
    setDutyMode,
    gpsTrackingEnabled,
    offlineMode,
    setOfflineMode,
    setSimulatedSpeedKmh,
    simulatedSpeedKmh,
  } = useAppMode();
  const [sortKey, setSortKey] = useState<SortKey>('score');
  const [minScore, setMinScore] = useState(90);
  const [showHighwayOnly, setShowHighwayOnly] = useState(false);
  const [activeDisclaimer, setActiveDisclaimer] = useState<string | null>('driver');
  const [showTheftPolicy, setShowTheftPolicy] = useState(false);
  const [certStatus, setCertStatus] = useState<string | null>(null);
  const [showHandover, setShowHandover] = useState(false);
  const [cabinClean, setCabinClean] = useState(false);
  const [odometerKm, setOdometerKm] = useState('');
  const [fuelLevelPct, setFuelLevelPct] = useState('');
  const [outgoingDriver, setOutgoingDriver] = useState('');
  const [incomingDriver, setIncomingDriver] = useState('');
  const [handoverSummary, setHandoverSummary] = useState<{
    status: string;
    cabinClean: boolean;
    odometerKm: number;
    fuelLevelPct: number;
    outgoingDriver: string;
    incomingDriver: string;
    at: string;
  } | null>(null);

  const rows = useMemo(() => {
    let list = [...driverStopAdherence];
    if (showHighwayOnly) list = list.filter((d) => d.unapprovedHighwayStops > 0);
    list = list.filter((d) => d.score >= minScore || showHighwayOnly);

    list.sort((a, b) => {
      if (sortKey === 'driver') return a.driver.localeCompare(b.driver);
      if (sortKey === 'approved') return b.approvedAutohofStops - a.approvedAutohofStops;
      if (sortKey === 'highway') return b.unapprovedHighwayStops - a.unapprovedHighwayStops;
      return b.score - a.score;
    });
    return list;
  }, [sortKey, minScore, showHighwayOnly]);

  const totalCo2 = driverStopAdherence.reduce((s, d) => s + d.co2SavedKg, 0);
  const policyHits = driverStopAdherence.reduce((s, d) => s + d.policyHits, 0);
  const fleetScore =
    Math.round(
      (driverStopAdherence.reduce((s, d) => s + d.score, 0) / driverStopAdherence.length) * 10
    ) / 10;
  const approvedTotal = driverStopAdherence.reduce((s, d) => s + d.approvedAutohofStops, 0);
  const highwayTotal = driverStopAdherence.reduce((s, d) => s + d.unapprovedHighwayStops, 0);
  const adherencePct = Math.round((approvedTotal / (approvedTotal + highwayTotal)) * 1000) / 10;

  const disclaimers = [
    {
      id: 'maut',
      title: 'Juridische Voorwaarden & Maut-Disclaimer',
      body: 'Indicaties voor Duitse Lkw-Maut en overige tol zijn gebaseerd op publieke tariefklassen (emissie, gewicht, assen). Definitieve heffing wordt bepaald door de officiële tolheffer.',
    },
    {
      id: 'rest',
      title: 'EU Verordening 561/2006',
      body: 'Rij- en rusttijdadviezen ondersteunen naleving van Verordening (EG) nr. 561/2006. De vervoerder en chauffeur blijven verantwoordelijk voor tachograafregistratie en wettelijke limieten.',
    },
    {
      id: 'price',
      title: 'Nauwkeurigheid brandstofprijsarbitrage',
      body: 'Besparings- en nettoprijsberekeningen zijn schattingen. Actuele pomp- of tankkaartprijzen kunnen afwijken door lokale toeslagen, acties of vertraging in prijsfeeds.',
    },
    {
      id: 'driver',
      title: 'Juridische Aansprakelijkheid Chauffeur',
      body: 'De chauffeur blijft eindverantwoordelijk voor voertuigdoorrijhoogte, naleving van verkeersborden, aslast/gewichslimieten en tachograaflimieten. Navigatie- en tankadviezen ontslaan de chauffeur niet van deze wettelijke plichten.',
    },
    {
      id: 'privacy',
      title: 'Privacy & AVG/GDPR Dienstmodus',
      body: 'In Privémodus / Offline wordt real-time GPS-tracking uitgeschakeld. Routes en adviezen blijven lokaal beschikbaar. Dienstmodus hervat telematica alleen met expliciete schakeling.',
    },
  ];

  const downloadCo2Cert = () => {
    setCertStatus('CO₂-certificaat wordt gegenereerd…');
    window.setTimeout(() => {
      downloadBlob(
        'fuelroute-co2-certificaat.txt',
        `FuelRoute ESG / CO₂-reductiecertificaat\n` +
          `Datum: ${new Date().toLocaleDateString('nl-NL')}\n` +
          `Vlootnalevingsscore: ${fleetScore}%\n` +
          `CO₂ vermeden (YTD): ${(totalCo2 / 1000).toFixed(2)} ton\n` +
          `Goedgekeurde Autohof-stops: ${approvedTotal}\n` +
          `Dit document is een beslisondersteunende ESG-export.\n`,
        'text/plain;charset=utf-8'
      );
      setCertStatus('CO₂-reductiecertificaat gedownload');
    }, 400);
  };

  const downloadCsrdExport = () => {
    const totalCo2Ton = totalCo2 / 1000;
    // Geschatte tonkm uit Autohof-/snelwegstops (demo-indicator voor CSRD / Prestatieladder)
    const estimatedTonKm = (approvedTotal + highwayTotal) * 1850;
    const intensityGPerTonKm =
      estimatedTonKm > 0 ? (totalCo2 * 1000) / estimatedTonKm : 0;
    const co2PerStopKg =
      approvedTotal > 0 ? Math.round((totalCo2 / approvedTotal) * 10) / 10 : 0;

    setCertStatus('CSRD / ESG CO₂-Prestatieladder export wordt gegenereerd…');
    window.setTimeout(() => {
      downloadBlob(
        'fuelroute-csrd-esg-prestatieladder.txt',
        `FuelRoute CSRD / ESG — CO₂-Prestatieladder Export\n` +
          `================================================\n` +
          `Datum: ${new Date().toLocaleDateString('nl-NL')}\n` +
          `Kader: CSRD (Corporate Sustainability Reporting Directive) · CO₂-Prestatieladder\n` +
          `\n` +
          `— Vlootindicatoren (driverStopAdherence totalen) —\n` +
          `Vlootnalevingsscore: ${fleetScore}%\n` +
          `Stopnaleving: ${adherencePct}%\n` +
          `Goedgekeurde Autohof-stops: ${approvedTotal}\n` +
          `Niet-goedgekeurde snelwegstops: ${highwayTotal}\n` +
          `Beleidsovertredingen (30d): ${policyHits}\n` +
          `\n` +
          `— CO₂ & ton/km-metrieken —\n` +
          `CO₂ vermeden (YTD): ${totalCo2Ton.toFixed(2)} ton (${totalCo2.toLocaleString('nl-NL')} kg)\n` +
          `Geschatte tonkm (vloot): ${estimatedTonKm.toLocaleString('nl-NL')} tonkm\n` +
          `Intensiteit: ${intensityGPerTonKm.toFixed(2)} g CO₂ / tonkm\n` +
          `CO₂ per goedgekeurde Autohof-stop: ${co2PerStopKg.toLocaleString('nl-NL')} kg\n` +
          `\n` +
          `— Prestatieladder-samenvatting —\n` +
          `Dit document ondersteunt ESG-/CSRD-rapportage en CO₂-Prestatieladder-bewijsvoering.\n` +
          `Cijfers zijn beslisondersteunend op basis van FuelRoute-nalevingsdata.\n`,
        'text/plain;charset=utf-8'
      );
      setCertStatus('CSRD / ESG CO₂-Prestatieladder export gedownload');
    }, 400);
  };

  return (
    <main className="p-6 md:p-8 max-w-7xl mx-auto space-y-6" style={{ background: '#0b0f19' }}>
      <DriveModeOverlay guidance="Compliance-demo: touch vergrendeld · grote spraakkaarten actief boven 10 km/h." />

      <div>
        <h1 className="text-3xl font-extrabold text-[#f8fafc]">Compliance {'&'} Audit</h1>
        <p className="text-[#cbd5e1]">
          Privacy · Drive Mode · Chauffeurs-Scoring · CO₂-Rapportage
        </p>
      </div>

      <ActionBar title="Compliance-acties">
        <ActionButton
          variant={dutyMode === 'prive' ? 'utility' : 'primary'}
          className="w-full"
          onClick={() => setDutyMode(dutyMode === 'dienst' ? 'prive' : 'dienst')}
        >
          {dutyMode === 'prive' ? '🔒 Privémodus / Offline' : '📡 Dienstmodus Actief'}
        </ActionButton>
        <ActionButton
          variant="secondary"
          className="w-full"
          onClick={() => setSimulatedSpeedKmh(simulatedSpeedKmh > 10 ? 0 : 72)}
        >
          🚗 Drive Mode {simulatedSpeedKmh > 10 ? 'Uitschakelen' : 'Simuleren (>10 km/h)'}
        </ActionButton>
        <RoleGate componentId="csrd_co2">
          <ActionButton
            variant="primary"
            className="w-full"
            onClick={() => {
              downloadCsrdExport();
              scrollToId('csrd-sectie');
            }}
          >
            📥 CSRD / ESG CO₂-Prestatieladder Export
          </ActionButton>
          <ActionButton
            variant="utility"
            className="w-full"
            onClick={() => {
              downloadCo2Cert();
              scrollToId('csrd-sectie');
            }}
          >
            Download CO₂-reductiecertificaat
          </ActionButton>
        </RoleGate>
        <RoleGate componentId="legal_disclaimers">
          <ActionButton
            variant="slate"
            className="w-full"
            onClick={() => setActiveDisclaimer('driver')}
          >
            Juridische Aansprakelijkheid
          </ActionButton>
        </RoleGate>
        <RoleGate componentId="fuel_theft_alerts">
          <ActionButton
            variant="danger"
            className="w-full"
            onClick={() => {
              setShowTheftPolicy(true);
              setActiveDisclaimer('privacy');
              setCertStatus(
                'Dieseldiefstal- & tankdopbeleid actief — sensoralarmen bij brandstofdaling tijdens stilstand/rust'
              );
              scrollToId('theft-sectie');
            }}
          >
            ⛽ Dieseldiefstal {'&'} Tankdop Alarmen
          </ActionButton>
        </RoleGate>
        <ActionButton
          variant="secondary"
          className="w-full"
          onClick={() => setShowHandover(true)}
        >
          🔄 Overdrachtsprotocol (WisselChauffeur)
        </ActionButton>
      </ActionBar>

      <div className="bg-[#1e293b] rounded-2xl border border-slate-700 p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#f8fafc]">Privacy {'&'} Dienstmodus</h2>
            <p className="text-xs text-[#cbd5e1]">
              AVG/GDPR · real-time GPS alleen in dienstmodus
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold border ${
                gpsTrackingEnabled
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/40'
              }`}
            >
              GPS {gpsTrackingEnabled ? 'Tracking Aan' : 'Uitgeschakeld (AVG)'}
            </span>
            {offlineMode && (
              <span className="px-3 py-1.5 rounded-full text-[11px] font-bold border bg-amber-500/15 text-amber-300 border-amber-500/40">
                Offline Modus Actief — Routes {'&'} Adviezen Lokaal Opgeslagen
              </span>
            )}
          </div>
        </div>
        <label className="flex items-center gap-3 cursor-pointer text-sm text-[#cbd5e1] bg-slate-900 border border-slate-700 rounded-xl px-4 py-3">
          <input
            type="checkbox"
            checked={offlineMode}
            onChange={(e) => setOfflineMode(e.target.checked)}
            className="w-4 h-4 accent-amber-500"
          />
          Forceer offline netwerkcache (routes lokaal bewaard)
        </label>
        <p className="text-xs text-[#cbd5e1]">
          Drive Mode-locking activeert automatisch boven 10 km/h: touch vergrendeld, grote
          spraakgestuurde kaarten. Huidige simulatiesnelheid: {Math.round(simulatedSpeedKmh)} km/h.
        </p>
      </div>

      <RoleGate componentId="fuel_theft_alerts">
      <div
        id="theft-sectie"
        className={`bg-[#1e293b] rounded-2xl border p-5 space-y-3 ${
          showTheftPolicy ? 'border-red-500/50 ring-1 ring-red-500/30' : 'border-slate-700'
        }`}
      >
        <div>
          <h2 className="text-lg font-bold text-[#f8fafc]">Anti-Theft {'&'} Driver Welfare</h2>
          <p className="text-xs text-[#cbd5e1]">
            Dieseldiefstal · tankdop · welzijn tijdens rust
          </p>
        </div>
        <p className="text-sm text-[#cbd5e1] leading-relaxed">
          Bij een onverwachte brandstofdaling tijdens stilstand of verplichte tachograafrust
          sturen tanksensoren en tankdopdetectie direct een alarm naar vloot en chauffeur. Dit
          beschermt lading en welzijn: de chauffeur wordt gewaarschuwd zonder de rustperiode te
          hoeven onderbreken voor handmatige controle.
        </p>
        <p className="text-sm text-[#cbd5e1] leading-relaxed">
          Taalondersteuning met spraakbegeleiding: PL, RO, BG, UKR, LT, DE, EN, NL — alarmen en
          instructies worden in de geselecteerde cockpitttaal voorgelezen.
        </p>
        <p className="text-sm">
          <a
            href="/driver"
            className="text-[#38bdf8] underline underline-offset-2 hover:text-sky-300 font-semibold"
          >
            Chauffeur-cockpit toont live tachograafstatus en het diefstal-/tankdop-alarmmodal
          </a>
        </p>
      </div>
      </RoleGate>

      <ActionBar title="Auditfilters">
        <ActionButton
          variant="secondary"
          className="w-full"
          onClick={() => setShowHighwayOnly(true)}
        >
          Toon Snelwegovertredingen
        </ActionButton>
        <ActionButton
          variant="utility"
          className="w-full"
          onClick={() => {
            setShowHighwayOnly(false);
            setMinScore(95);
          }}
        >
          Alleen ≥95% Score
        </ActionButton>
        <ActionButton
          variant="slate"
          className="w-full"
          onClick={() => setActiveDisclaimer('privacy')}
        >
          Privacy Disclaimers
        </ActionButton>
        <ActionButton
          variant="primary"
          className="w-full"
          onClick={() => setActiveDisclaimer('maut')}
        >
          Maut {'&'} Juridische Voorwaarden
        </ActionButton>
      </ActionBar>

      {certStatus && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300">
          {certStatus}
        </div>
      )}

      {handoverSummary && (
        <div className="bg-[#1e293b] rounded-2xl border border-emerald-500/40 p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-[#f8fafc]">Overdracht voltooid</h2>
              <p className="text-xs text-[#cbd5e1]">
                WisselChauffeur · digitaal overdrachtsprotocol
              </p>
            </div>
            <span className="px-3 py-1.5 rounded-full text-[11px] font-bold border bg-emerald-500/15 text-emerald-300 border-emerald-500/40">
              {handoverSummary.status}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="bg-slate-900 rounded-xl border border-slate-700 p-3">
              <span className="text-[11px] text-[#cbd5e1] block">Cabine schoon</span>
              <span className="font-bold text-[#f8fafc]">
                {handoverSummary.cabinClean ? 'Ja' : 'Nee'}
              </span>
            </div>
            <div className="bg-slate-900 rounded-xl border border-slate-700 p-3">
              <span className="text-[11px] text-[#cbd5e1] block">Kilometerstand</span>
              <span className="font-bold text-[#f8fafc]">
                {handoverSummary.odometerKm.toLocaleString('nl-NL')} km
              </span>
            </div>
            <div className="bg-slate-900 rounded-xl border border-slate-700 p-3">
              <span className="text-[11px] text-[#cbd5e1] block">Brandstof / laadniveau</span>
              <span className="font-bold text-[#38bdf8]">{handoverSummary.fuelLevelPct}%</span>
            </div>
            <div className="bg-slate-900 rounded-xl border border-slate-700 p-3">
              <span className="text-[11px] text-[#cbd5e1] block">Tijdstip</span>
              <span className="font-bold text-[#f8fafc]">{handoverSummary.at}</span>
            </div>
            <div className="bg-slate-900 rounded-xl border border-slate-700 p-3">
              <span className="text-[11px] text-[#cbd5e1] block">Uitgaande chauffeur</span>
              <span className="font-bold text-[#f8fafc]">{handoverSummary.outgoingDriver}</span>
            </div>
            <div className="bg-slate-900 rounded-xl border border-slate-700 p-3">
              <span className="text-[11px] text-[#cbd5e1] block">Inkomende chauffeur</span>
              <span className="font-bold text-[#f8fafc]">{handoverSummary.incomingDriver}</span>
            </div>
          </div>
        </div>
      )}

      {showHandover && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end md:items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#1e293b] border-2 border-slate-600 rounded-2xl p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start gap-3">
              <div>
                <h3 className="text-lg font-bold text-[#f8fafc]">
                  🔄 Digitaal Overdrachtsprotocol
                </h3>
                <p className="text-xs text-[#cbd5e1]">
                  WisselChauffeur · checklist cabine, kilometers {'&'} dubbele aftekening
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowHandover(false)}
                className="text-[#cbd5e1] hover:text-white text-sm"
              >
                Sluiten
              </button>
            </div>

            <label className="flex items-center gap-3 cursor-pointer text-sm text-[#cbd5e1] bg-slate-900 border border-slate-700 rounded-xl px-4 py-3">
              <input
                type="checkbox"
                checked={cabinClean}
                onChange={(e) => setCabinClean(e.target.checked)}
                className="w-4 h-4 accent-emerald-500"
              />
              Cabine is schoon en opgeruimd
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#cbd5e1] mb-1">Kilometerstand (km)</label>
                <input
                  type="number"
                  min={0}
                  value={odometerKm}
                  onChange={(e) => setOdometerKm(e.target.value)}
                  placeholder="bijv. 482310"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-[#f8fafc]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#cbd5e1] mb-1">
                  Brandstof / laadniveau (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={fuelLevelPct}
                  onChange={(e) => setFuelLevelPct(e.target.value)}
                  placeholder="bijv. 65"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-[#f8fafc]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#cbd5e1] mb-1">
                  Handtekening uitgaande chauffeur
                </label>
                <input
                  type="text"
                  value={outgoingDriver}
                  onChange={(e) => setOutgoingDriver(e.target.value)}
                  placeholder="Naam uitgaande chauffeur"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-[#f8fafc]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#cbd5e1] mb-1">
                  Handtekening inkomende chauffeur
                </label>
                <input
                  type="text"
                  value={incomingDriver}
                  onChange={(e) => setIncomingDriver(e.target.value)}
                  placeholder="Naam inkomende chauffeur"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-[#f8fafc]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <ActionButton
                variant="slate"
                className="w-full"
                onClick={() => setShowHandover(false)}
              >
                Annuleren
              </ActionButton>
              <ActionButton
                variant="primary"
                className="w-full"
                disabled={
                  !odometerKm ||
                  fuelLevelPct === '' ||
                  !outgoingDriver.trim() ||
                  !incomingDriver.trim()
                }
                onClick={() => {
                  const summary = {
                    status: 'Overdracht voltooid',
                    cabinClean,
                    odometerKm: Number(odometerKm) || 0,
                    fuelLevelPct: Math.min(100, Math.max(0, Number(fuelLevelPct) || 0)),
                    outgoingDriver: outgoingDriver.trim(),
                    incomingDriver: incomingDriver.trim(),
                    at: new Date().toLocaleString('nl-NL'),
                  };
                  setHandoverSummary(summary);
                  setCertStatus(
                    `Overdracht voltooid · ${summary.outgoingDriver} → ${summary.incomingDriver}`
                  );
                  setShowHandover(false);
                }}
              >
                ✍️ Dubbele aftekening
              </ActionButton>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#1e293b] p-6 rounded-2xl border border-emerald-500/30">
          <span className="text-xs text-[#cbd5e1] uppercase tracking-wider">Naleving Tankbeleid</span>
          <p className="text-4xl font-black text-[#10b981] mt-2">{fleetScore}%</p>
          <div className="mt-3 w-full h-2 bg-slate-900 rounded-full overflow-hidden">
            <div className="h-full bg-[#10b981]" style={{ width: `${fleetScore}%` }} />
          </div>
        </div>
        <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-700">
          <span className="text-xs text-[#cbd5e1] uppercase tracking-wider">Stopnaleving</span>
          <p className="text-4xl font-black text-[#38bdf8] mt-2">{adherencePct}%</p>
          <p className="text-xs text-[#cbd5e1] mt-2">
            {approvedTotal} Autohof · {highwayTotal} niet-goedgekeurde snelweg
          </p>
        </div>
        <RoleGate componentId="csrd_co2">
          <div
            id="csrd-sectie"
            className="bg-[#1e293b] p-6 rounded-2xl border border-slate-700"
          >
            <span className="text-xs text-[#cbd5e1] uppercase tracking-wider">CO₂-Rapportage (YTD)</span>
            <p className="text-4xl font-black text-[#f8fafc] mt-2">{(totalCo2 / 1000).toFixed(1)} t</p>
          </div>
        </RoleGate>
        <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-700">
          <span className="text-xs text-[#cbd5e1] uppercase tracking-wider">Beleidsovertredingen (30d)</span>
          <p className="text-4xl font-black text-amber-400 mt-2">{policyHits}</p>
        </div>
      </div>

      <div className="bg-[#1e293b] rounded-2xl border border-slate-700 p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-[#f8fafc]">Chauffeurs-Scoring Algoritme</h2>
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs text-[#cbd5e1] flex items-center gap-2">
              Min. score
              <input
                type="number"
                min={70}
                max={100}
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value) || 0)}
                className="w-20 bg-slate-900 border border-slate-600 rounded-lg px-2 py-1 text-[#f8fafc]"
              />
            </label>
            <button
              type="button"
              onClick={() => setShowHighwayOnly((v) => !v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                showHighwayOnly
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-900 text-[#cbd5e1] border-slate-600'
              }`}
            >
              Alleen snelwegovertredingen
            </button>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="bg-slate-900 border border-slate-600 rounded-lg px-2 py-1.5 text-xs text-[#f8fafc]"
            >
              <option value="score">Sorteer: Score</option>
              <option value="approved">Sorteer: Autohof-stops</option>
              <option value="highway">Sorteer: Snelwegstops</option>
              <option value="driver">Sorteer: Chauffeur</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-700">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-900/60 text-[#cbd5e1] text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3">Chauffeur</th>
                <th className="px-4 py-3">Voertuig</th>
                <th className="px-4 py-3">Goedgekeurde Autohof</th>
                <th className="px-4 py-3">Niet-goedgekeurde Snelweg</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">CO₂ Bespaard</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {rows.map((entry) => {
                const ratio =
                  entry.approvedAutohofStops /
                  Math.max(1, entry.approvedAutohofStops + entry.unapprovedHighwayStops);
                return (
                  <tr key={entry.truck} className="hover:bg-slate-900/40">
                    <td className="px-4 py-3 font-semibold text-[#f8fafc]">{entry.driver}</td>
                    <td className="px-4 py-3 font-mono text-[#38bdf8]">{entry.truck}</td>
                    <td className="px-4 py-3 text-[#10b981] font-bold">{entry.approvedAutohofStops}</td>
                    <td className="px-4 py-3 text-amber-300 font-bold">
                      {entry.unapprovedHighwayStops}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 min-w-[140px]">
                        <div className="w-20 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${entry.score >= 95 ? 'bg-[#10b981]' : 'bg-amber-400'}`}
                            style={{ width: `${entry.score}%` }}
                          />
                        </div>
                        <span className="text-[#f8fafc] font-bold">{entry.score}%</span>
                      </div>
                      <p className="text-[10px] text-[#cbd5e1] mt-1">
                        Naleving {(ratio * 100).toFixed(0)}%
                      </p>
                    </td>
                    <td className="px-4 py-3 text-[#10b981] font-semibold">
                      {entry.co2SavedKg.toLocaleString('nl-NL')} kg
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                          entry.unapprovedHighwayStops === 0
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : entry.score >= 95
                              ? 'bg-sky-500/20 text-[#38bdf8] border-sky-500/30'
                              : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {entry.unapprovedHighwayStops === 0
                          ? 'Beleid OK'
                          : entry.score >= 95
                            ? 'Lichte afwijking'
                            : 'Beoordelen'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && (
          <p className="text-sm text-[#cbd5e1]">Geen chauffeurs voor de huidige filters.</p>
        )}
      </div>

      <RoleGate componentId="driver_eco_scores">
      <div
        id="eco-score-sectie"
        className="bg-[#1e293b] rounded-2xl border border-slate-700 p-5 space-y-4"
      >
        <div>
          <h2 className="text-lg font-bold text-[#f8fafc]">Chauffeurs Gamification / Eco-Score</h2>
          <p className="text-xs text-[#cbd5e1]">
            Ranglijst op eco-score, beleidsnaleving en brandstofverbruik (L/100 km)
          </p>
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-700">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-900/60 text-[#cbd5e1] text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3">Rang</th>
                <th className="px-4 py-3">Chauffeur</th>
                <th className="px-4 py-3">Eco-Score</th>
                <th className="px-4 py-3">Beleidsscore</th>
                <th className="px-4 py-3">Brandstof L/100 km</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {ecoScoreLeaderboard.map((entry) => {
                const medal =
                  entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : null;
                return (
                  <tr key={entry.rank} className="hover:bg-slate-900/40">
                    <td className="px-4 py-3 font-bold text-[#f8fafc]">
                      <span className="inline-flex items-center gap-2">
                        {medal && <span aria-hidden>{medal}</span>}
                        <span>#{entry.rank}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#f8fafc]">{entry.driver}</td>
                    <td className="px-4 py-3 text-[#10b981] font-bold">{entry.ecoScore}</td>
                    <td className="px-4 py-3 text-[#38bdf8] font-semibold">{entry.policyScore}%</td>
                    <td className="px-4 py-3 text-[#f8fafc] font-semibold">
                      {entry.fuelLPer100.toLocaleString('nl-NL', {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      </RoleGate>

      <div className="bg-[#1e293b] rounded-2xl border border-slate-700 p-5 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-[#f8fafc]">Gecombineerde Ruststops {'&'} ESPORG</h2>
          <p className="text-xs text-[#cbd5e1]">
            Gebundelde stop: tanken + 45 min tachograafrust + dineren in één Autohof
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {parkingSecurity
            .filter((p) => p.combinedRestStop)
            .map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-slate-700 bg-slate-900 p-4 space-y-2"
              >
                <div className="flex justify-between items-start gap-2">
                  <p className="text-sm font-bold text-[#f8fafc]">{p.name}</p>
                  <span className="px-2 py-1 rounded-full text-[11px] font-bold border border-amber-500/40 bg-amber-500/15 text-amber-300">
                    ESPORG{' '}
                    {p.esporgLevel === 'Platinum'
                      ? 'Platinum'
                      : p.esporgLevel === 'Gold'
                        ? 'Goud'
                        : p.esporgLevel === 'Silver'
                          ? 'Zilver'
                          : 'Brons'}
                  </span>
                </div>
                <p className="text-[11px] text-[#10b981] font-semibold">
                  Gecombineerde stop: tanken + 45 min rust + dineren
                </p>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  {p.hasCamera && (
                    <span className="px-2 py-1 rounded border border-sky-500/30 text-[#38bdf8]">Camera</span>
                  )}
                  {p.hasFence && (
                    <span className="px-2 py-1 rounded border border-emerald-500/30 text-emerald-300">Omheining</span>
                  )}
                  {p.hasRestaurant && (
                    <span className="px-2 py-1 rounded border border-slate-600 text-[#cbd5e1]">Restaurant</span>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="bg-[#1e293b] rounded-2xl border border-slate-700 p-5 space-y-3">
        <h2 className="text-lg font-bold text-[#f8fafc]">Juridische Voorwaarden {'&'} Maut-Disclaimer</h2>
        <div className="flex flex-wrap gap-2">
          {disclaimers.map((d) => (
            <button
              key={d.id}
              type="button"
              title={d.body}
              onClick={() => setActiveDisclaimer(activeDisclaimer === d.id ? null : d.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                activeDisclaimer === d.id
                  ? 'bg-sky-500/20 text-[#38bdf8] border-sky-500/40'
                  : 'bg-slate-900 text-[#cbd5e1] border-slate-600'
              }`}
            >
              {d.title}
            </button>
          ))}
        </div>
        {activeDisclaimer && (
          <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 text-sm text-[#cbd5e1]">
            <p className="font-bold text-[#f8fafc] mb-1">
              {disclaimers.find((d) => d.id === activeDisclaimer)?.title}
            </p>
            <p>{disclaimers.find((d) => d.id === activeDisclaimer)?.body}</p>
          </div>
        )}
      </div>
    </main>
  );
}
