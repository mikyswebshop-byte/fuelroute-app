'use client';

import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { useAppMode } from '@/components/AppModeProvider';
import { FuelGauge } from '@/components/charts';
import { ActiveCmrBanner, CmrImportPanel } from '@/components/CmrImportPanel';
import { GloveboxModal } from '@/components/GloveboxModal';
import { RouteMap } from '@/components/RouteMap';
import { SpeedGauge } from '@/components/SpeedGauge';
import { useTelemetry } from '@/components/TelemetryProvider';
import {
  VoiceAssistant,
  speakText,
  type VoiceCommandId,
} from '@/components/VoiceAssistant';
import { formatDriveTime } from '@/lib/calculations';
import { useActiveCmr, type CmrShipment } from '@/lib/cmr-store';
import { DEMO_GPS, trafficDelayMinutes } from '@/lib/gps';
import { recommendedFuelStops, type FuelStopRow } from '@/lib/mock-data';

function speechLangFromDriver(lang: string) {
  const map: Record<string, string> = {
    NL: 'nl-NL',
    DE: 'de-DE',
    EN: 'en-GB',
    PL: 'pl-PL',
    RO: 'ro-RO',
    BG: 'bg-BG',
    CS: 'cs-CZ',
    SK: 'sk-SK',
    FR: 'fr-FR',
    ES: 'es-ES',
    IT: 'it-IT',
    HU: 'hu-HU',
    DA: 'da-DK',
    SV: 'sv-SE',
    FI: 'fi-FI',
    PT: 'pt-PT',
    EL: 'el-GR',
    HR: 'hr-HR',
    UKR: 'uk-UA',
    LT: 'lt-LT',
  };
  return map[lang] ?? 'nl-NL';
}

type OverlayKind = 'status' | 'tanken' | 'route' | null;

function isNearNlBorder(stop: FuelStopRow) {
  return /border|nl\/de|de\/nl|venlo|bentheim|hamminkeln/i.test(
    `${stop.stationName} ${stop.locationHighway}`
  );
}

function isInNetherlands(stop: FuelStopRow) {
  return /\bNL\b|Venlo/i.test(`${stop.stationName} ${stop.locationHighway}`);
}

function openMapsNav(query: string) {
  const q = encodeURIComponent(query);
  window.open(
    `https://www.google.com/maps/dir/?api=1&destination=${q}&travelmode=driving`,
    '_blank',
    'noopener,noreferrer'
  );
}

export function DriverCockpit({
  lang,
  nextStopName,
  nextTurn,
  unreadMessages,
  onEmergency,
  onOpenSignature,
  onOpenBonScan,
  onOpenPreTrip,
  parkedChildren,
}: {
  lang: string;
  remainingDriveMin?: number;
  fuelLevel?: number;
  nextStopKm?: number;
  nextStopName: string;
  nextTurn: string;
  eta?: string;
  unreadMessages: string[];
  onEmergency: () => void;
  onOpenSignature: () => void;
  onOpenBonScan?: () => void;
  onOpenPreTrip?: () => void;
  parkedChildren?: ReactNode;
}) {
  const {
    setSimulatedSpeedKmh,
    isStandstill,
    setStandstill,
    setRouteActive,
    trafficJam,
    gps,
    gpsPermission,
    gpsWatching,
    requestGpsPermission,
  } = useAppMode();
  const {
    fuelPct,
    nextStopKm,
    etaMinutes,
    etaClock: liveEtaLabel,
    displaySpeedKmh,
    animating,
    engineRpm,
    batteryV,
  } = useTelemetry();

  const [showGlovebox, setShowGlovebox] = useState(false);
  const [showCmrImport, setShowCmrImport] = useState(false);
  const [showEcmrPreview, setShowEcmrPreview] = useState(false);
  const [overlay, setOverlay] = useState<OverlayKind>(null);
  const [dismissGpsPrompt, setDismissGpsPrompt] = useState(false);
  const [dismissBorderWarn, setDismissBorderWarn] = useState(false);
  const [destination, setDestination] = useState('München Distribution (DE)');
  const [navFlash, setNavFlash] = useState<string | null>(null);
  const activeCmr = useActiveCmr();

  const isDriving = !isStandstill && (animating || displaySpeedKmh > 10);
  const speechLang = speechLangFromDriver(lang);
  const fuelLow = fuelPct < 20;
  const delayMin = trafficJam ? trafficDelayMinutes(nextStopKm, displaySpeedKmh) : 0;

  const cheapStops = useMemo(
    () => [...recommendedFuelStops].sort((a, b) => a.netPricePerL - b.netPricePerL).slice(0, 5),
    []
  );
  const cheapestDeBeforeNl = useMemo(() => {
    const borderDe = recommendedFuelStops
      .filter((s) => isNearNlBorder(s) && !isInNetherlands(s))
      .sort((a, b) => a.netPricePerL - b.netPricePerL);
    return borderDe[0] ?? cheapStops[0];
  }, [cheapStops]);

  const showNlBorderWarn = !dismissBorderWarn && (fuelPct < 35 || fuelLow);

  const closeGlovebox = useCallback(() => setShowGlovebox(false), []);
  const openGlovebox = useCallback(() => {
    setOverlay(null);
    setShowGlovebox(true);
  }, []);

  const startSimulation = useCallback(() => {
    setOverlay(null);
    setShowGlovebox(false);
    setStandstill(false);
    setRouteActive(true);
    setSimulatedSpeedKmh(72);
  }, [setRouteActive, setSimulatedSpeedKmh, setStandstill]);

  const stopSimulation = useCallback(() => {
    setStandstill(true);
    setSimulatedSpeedKmh(0);
  }, [setSimulatedSpeedKmh, setStandstill]);

  const openEcmrFlow = useCallback(() => {
    setOverlay(null);
    setShowGlovebox(false);
    setShowEcmrPreview(true);
  }, []);

  const startNavTo = useCallback((label: string) => {
    setNavFlash(`Navigatie → ${label}`);
    window.setTimeout(() => setNavFlash(null), 4000);
    openMapsNav(label);
  }, []);

  const unreadKey = unreadMessages.join('\u0001');
  const responses = useMemo(() => {
    const drive = formatDriveTime(Math.round(etaMinutes));
    const msg =
      unreadMessages.length === 0
        ? 'Geen ongelezen berichten van de planner.'
        : `${unreadMessages.length} berichten. ${unreadMessages[0]}`;
    const cheap = cheapestDeBeforeNl;
    return {
      status: `Voertuigstatus: snelheid ${Math.round(displaySpeedKmh)} kilometer per uur, brandstof ${fuelPct.toFixed(0)} procent, rijtijd ${drive}.${trafficJam ? ' File gedetecteerd.' : ''}`,
      tanken: `Goedkoopste tip: ${cheap.stationName}, €${cheap.netPricePerL.toFixed(3)} per liter. ${showNlBorderWarn ? 'Tank in Duitsland vóór de Nederlandse grens.' : ''} Volgende stop ${nextStopName}.`,
      stilstand: 'Stilstand-modus geactiveerd. Tools beschikbaar.',
      simuleer: 'Rit-simulatie gestart. Drive mode actief.',
      handschoenvak: 'Handschoenvak geopend.',
      cmr: 'CMR import geopend. Upload of bekijk vrachtbrief.',
      cmr_foto: 'Bon of CMR foto openen. Kies galerij of camera.',
      nieuwe_route: 'Nieuwe route: vul bestemming in of laad een CMR.',
      navigatie: `Navigatie: ${nextTurn}. Bestemming ${destination}. ETA ${liveEtaLabel}.`,
      eta: `Geschatte aankomst ${liveEtaLabel}. Resterende rijtijd ${drive}.`,
      rijtijd: `Resterende rijtijd ${drive}. ETA ${liveEtaLabel}.`,
      berichten: msg,
      pech: 'Noodprotocol gestart. Pechhulp wordt geactiveerd.',
      unknown:
        "Sorry, niet begrepen. Zeg: status, tanken, nieuwe route, CMR foto, bon fotograferen, navigatie, stilstand of handschoenvak.",
      listening: 'Luistert...',
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    etaMinutes,
    nextStopName,
    nextStopKm,
    unreadKey,
    displaySpeedKmh,
    fuelPct,
    trafficJam,
    liveEtaLabel,
    cheapestDeBeforeNl,
    showNlBorderWarn,
    nextTurn,
    destination,
  ]);

  const onVoiceCommand = useCallback(
    (cmd: Exclude<VoiceCommandId, 'unknown'>) => {
      switch (cmd) {
        case 'status':
        case 'rijtijd':
        case 'berichten':
        case 'eta':
          setOverlay('status');
          break;
        case 'navigatie':
          setOverlay('route');
          break;
        case 'tanken':
          setOverlay('tanken');
          break;
        case 'stilstand':
          stopSimulation();
          break;
        case 'simuleer':
          startSimulation();
          break;
        case 'handschoenvak':
          openGlovebox();
          break;
        case 'cmr':
          setShowCmrImport(true);
          break;
        case 'cmr_foto':
          onOpenBonScan?.();
          break;
        case 'nieuwe_route':
          setOverlay('route');
          setShowCmrImport(true);
          break;
        default:
          break;
      }
    },
    [onOpenBonScan, openGlovebox, startSimulation, stopSimulation]
  );

  const showGpsPrompt =
    !dismissGpsPrompt &&
    (gpsPermission === 'prompt' || gpsPermission === 'denied' || gpsPermission === 'unsupported') &&
    !gpsWatching;

  const bannerClass = trafficJam
    ? 'bg-[#ff9500] text-[#1a0f00]'
    : isDriving
      ? 'bg-[#00a3ff] text-white'
      : 'bg-[#28a745] text-white';

  const routeLabel = activeCmr
    ? `${activeCmr.origin} → ${activeCmr.destination}`
    : `${destination}`;

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[var(--fr-bg)] text-[var(--fr-text)] pb-32">
      <div className={`${bannerClass} px-4 py-3 sm:py-4 transition-colors`}>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-90">
          {trafficJam ? 'File / Vertraging' : isDriving ? 'Rij-modus · Handsfree' : 'Stilstand-modus'}
        </p>
        <p className="fr-display text-2xl sm:text-3xl md:text-4xl leading-tight mt-1 text-inherit">
          {trafficJam ? 'FILE / VERTRAGING' : nextTurn}
        </p>
        <p className="text-sm mt-1 font-semibold opacity-95">
          ETA {liveEtaLabel}
          {trafficJam && delayMin > 0 ? ` · +${delayMin} min` : ''} · {routeLabel}
          {activeCmr ? ` · ${activeCmr.loadedWeightT} t` : ''}
        </p>
      </div>

      {showNlBorderWarn && (
        <div className="mx-4 mt-3 rounded-[14px] border border-[#ff9500]/50 bg-[#1a1008] px-4 py-3 flex gap-3 items-start">
          <span className="text-xl" aria-hidden>
            ⛽
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-[#ff9500]">Grens NL — tank in Duitsland</p>
            <p className="text-xs text-[#ffd9a8] mt-1 leading-relaxed">
              Brandstof {fuelPct.toFixed(0)}%. Tank vóór Nederland bij{' '}
              <span className="font-bold">{cheapestDeBeforeNl.stationName}</span> (€
              {cheapestDeBeforeNl.netPricePerL.toFixed(3)}/L) — vermijd duurder tanken in NL (bijv.
              Venlo).
            </p>
            <button
              type="button"
              className="mt-2 text-xs font-bold text-[#00a3ff]"
              onClick={() =>
                startNavTo(
                  `${cheapestDeBeforeNl.stationName} ${cheapestDeBeforeNl.locationHighway}`
                )
              }
            >
              Navigeer naar grens-tankstop →
            </button>
          </div>
          <button
            type="button"
            className="text-[#ffb84d] text-sm font-bold"
            onClick={() => setDismissBorderWarn(true)}
            aria-label="Sluiten"
          >
            ✕
          </button>
        </div>
      )}

      {navFlash && (
        <div className="mx-4 mt-3 rounded-[10px] border border-[#28a745]/40 bg-[#28a745]/10 px-3 py-2 text-xs font-bold text-[#86efac]">
          {navFlash}
        </div>
      )}

      {showGpsPrompt && (
        <div className="max-w-3xl mx-auto px-4 pt-4">
          <div className="fr-glass p-4 space-y-3">
            <p className="text-sm font-bold text-[#e8eef7]">Locatie delen voor live GPS</p>
            <p className="text-xs text-[#9aa8bc] leading-relaxed">
              Sta locatietoegang toe voor tracking, filesignalering en ETA. Bij weigering: democoördinaten (
              {DEMO_GPS.label}).
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => requestGpsPermission()}
                className="fr-btn-primary px-4 py-2.5 text-sm"
              >
                Locatie toestaan
              </button>
              <button
                type="button"
                onClick={() => setDismissGpsPrompt(true)}
                className="px-4 py-2.5 rounded-[10px] text-sm font-semibold bg-[#151d2a] text-[#9aa8bc] border border-[#1e2a3a]"
              >
                Later / demo
              </button>
            </div>
          </div>
        </div>
      )}

      <RouteMap
        lat={gps.lat}
        lng={gps.lng}
        trafficJam={trafficJam}
        statusLeft={`${gps.source === 'live' ? 'Live GPS' : 'Demo GPS'} · ${Math.round(displaySpeedKmh)} km/h`}
        statusRight={
          trafficJam ? 'FILE' : isDriving ? (gps.source === 'live' ? 'NAV live' : 'Simulatie') : 'Standby'
        }
      />

      <div className="max-w-3xl mx-auto px-4 py-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
        <MetricChip label="Rijtijd" value={formatDriveTime(Math.round(etaMinutes))} />
        <MetricChip label="Volgende stop" value={`${nextStopKm.toFixed(0)} km`} />
        <MetricChip label="Brandstof" value={`${fuelPct.toFixed(0)}%`} warn={fuelLow} />
        <MetricChip
          label="Duty"
          value={trafficJam ? 'File' : isStandstill ? 'Stilstand' : 'Rijden'}
          ok={!trafficJam && !isStandstill}
        />
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-4">
        <div className="fr-glass p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <SpeedGauge speedKmh={displaySpeedKmh} />
          <FuelGauge level={fuelPct} />
          <div className="sm:col-span-2 grid grid-cols-3 gap-2">
            <MiniStat label="RPM" value={`${engineRpm}`} />
            <MiniStat label="Accu" value={`${batteryV.toFixed(1)} V`} />
            <MiniStat label="ETA" value={liveEtaLabel} />
          </div>
        </div>
      </div>

      {/* Route + navigatie — altijd beschikbaar */}
      <div className="max-w-3xl mx-auto px-4 pb-4 space-y-3">
        <div className="fr-glass p-4 space-y-3">
          <p className="fr-label">Bestemming / nieuwe route</p>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full bg-[#050a0f] border border-[#1e2a3a] rounded-[10px] px-3 py-2.5 text-sm text-[#f2f6fb]"
            placeholder="Bestemming…"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => startNavTo(destination)}
              className="flex-1 min-w-[140px] h-12 rounded-[12px] font-bold bg-[#00a3ff] text-white touch-manipulation"
            >
              🗺️ Start navigatie
            </button>
            <button
              type="button"
              onClick={() => setShowCmrImport(true)}
              className="flex-1 min-w-[140px] h-12 rounded-[12px] font-bold border border-[#00a3ff]/40 text-[#7dd3fc] bg-[#00a3ff]/10 touch-manipulation"
            >
              📋 Route uit CMR
            </button>
          </div>
        </div>

        <div className="fr-glass p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="fr-label">Goedkoopste tankstops</p>
            <button
              type="button"
              className="text-[11px] font-bold text-[#00a3ff]"
              onClick={() => setOverlay('tanken')}
            >
              Alles
            </button>
          </div>
          <ul className="space-y-2">
            {cheapStops.map((stop, i) => (
              <li
                key={stop.stationName}
                className="rounded-[12px] border border-[#1e2a3a] bg-[#050a0f] px-3 py-2.5 flex items-center gap-3"
              >
                <span className="fr-mono text-xs text-[#6b7a90] w-4">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-[#f2f6fb] truncate">{stop.stationName}</p>
                  <p className="text-[11px] text-[#9aa8bc] truncate">{stop.locationHighway}</p>
                  {isInNetherlands(stop) && (
                    <p className="text-[10px] font-bold text-[#ff9500] mt-0.5">NL — duurder, liever DE</p>
                  )}
                  {isNearNlBorder(stop) && !isInNetherlands(stop) && (
                    <p className="text-[10px] font-bold text-[#86efac] mt-0.5">
                      DE bij NL-grens · aanbevolen
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="fr-mono text-sm font-bold text-[#00a3ff]">
                    €{stop.netPricePerL.toFixed(3)}
                  </p>
                  <button
                    type="button"
                    onClick={() => startNavTo(`${stop.stationName} ${stop.locationHighway}`)}
                    className="mt-1 text-[10px] font-bold text-[#86efac]"
                  >
                    Navigeer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Tools — ook deels tijdens rijden (alleen stilstand voor foto/handtekening) */}
      <div className="max-w-3xl mx-auto px-4 pb-6 space-y-4">
        <ActiveCmrBanner onOpen={() => setShowCmrImport(true)} />
        <p className="fr-label">{isStandstill ? 'Stilstand-tools' : 'Snelkoppelingen'}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <ParkTile icon="📋" label="CMR laden" onClick={() => setShowCmrImport(true)} />
          <ParkTile icon="✍️" label="e-CMR tekenen" onClick={openEcmrFlow} />
          <ParkTile icon="📄" label="Glovebox" onClick={openGlovebox} />
          <ParkTile
            icon="📷"
            label="Bon / CMR foto"
            onClick={() => onOpenBonScan?.()}
            disabled={!isStandstill}
          />
          <ParkTile
            icon="🔍"
            label="Pre-trip foto’s"
            onClick={() => onOpenPreTrip?.()}
            disabled={!isStandstill}
          />
          <ParkTile icon="⛽" label="Tankstops" onClick={() => setOverlay('tanken')} />
          <ParkTile icon="🗺️" label="Route" onClick={() => setOverlay('route')} />
          <ParkTile icon="📡" label="Status" onClick={() => setOverlay('status')} />
          <ParkTile icon="🆘" label="Nood" onClick={onEmergency} danger />
        </div>
        {!isStandstill && (
          <p className="text-[11px] text-[#6b7a90]">
            Foto’s en pre-trip alleen bij stilstand (veiligheid). Spraak blijft actief.
          </p>
        )}
        {isStandstill && parkedChildren}
      </div>

      <div className="fixed bottom-0 inset-x-0 z-40 border-t border-[#1e2a3a] bg-[#0b0e11]/92 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-end justify-between gap-3">
          <button
            type="button"
            onClick={isDriving ? stopSimulation : startSimulation}
            className={`flex-1 max-w-[140px] h-12 rounded-[12px] text-xs font-bold border ${
              isDriving
                ? 'bg-[#28a745]/15 text-[#86efac] border-[#28a745]/40'
                : 'bg-[#151d2a] text-[#c5d0e0] border-[#1e2a3a]'
            }`}
          >
            {isDriving ? '🛑 Stilstand' : '🚗 Simuleer'}
          </button>

          <VoiceAssistant
            large
            speechLang={speechLang}
            responses={responses}
            onEmergency={onEmergency}
            onCommand={onVoiceCommand}
            className="-mt-8"
          />

          <button
            type="button"
            onClick={() => {
              speakText(responses.pech, speechLang);
              onEmergency();
            }}
            className="w-14 h-14 rounded-2xl bg-[#ff3b30] text-white text-2xl font-black shadow-lg shadow-red-500/30 flex items-center justify-center"
            aria-label="Noodgeval"
          >
            ⚠
          </button>
        </div>
      </div>

      {overlay && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-4"
          onClick={() => setOverlay(null)}
        >
          <div
            className="w-full max-w-md fr-glass p-5 space-y-3 shadow-2xl max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {overlay === 'status' && (
              <>
                <h3 className="fr-display text-lg">Voertuigstatus</h3>
                <ul className="text-sm text-[#9aa8bc] space-y-2">
                  <li className="fr-mono">Snelheid: {Math.round(displaySpeedKmh)} km/h</li>
                  <li className="fr-mono">
                    GPS: {gps.lat.toFixed(4)}, {gps.lng.toFixed(4)}
                  </li>
                  <li>Brandstof: {fuelPct.toFixed(0)}%</li>
                  <li>ETA: {liveEtaLabel}</li>
                  <li>Bestemming: {destination}</li>
                </ul>
              </>
            )}
            {overlay === 'route' && (
              <>
                <h3 className="fr-display text-lg">Navigatie</h3>
                <p className="text-sm text-[#9aa8bc]">{nextTurn}</p>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-[#050a0f] border border-[#1e2a3a] rounded-[10px] px-3 py-2.5 text-sm text-[#f2f6fb]"
                />
                <button
                  type="button"
                  onClick={() => {
                    startNavTo(destination);
                    setOverlay(null);
                  }}
                  className="w-full h-12 rounded-[12px] font-bold bg-[#00a3ff] text-white"
                >
                  Start navigatie
                </button>
              </>
            )}
            {overlay === 'tanken' && (
              <>
                <h3 className="fr-display text-lg">Tankstations</h3>
                <p className="text-xs text-[#ffb84d]">
                  Tip: tank in DE bij de NL-grens — niet in Venlo (NL) als het kan.
                </p>
                <ul className="space-y-2">
                  {cheapStops.map((stop) => (
                    <li key={stop.stationName} className="rounded-[10px] border border-[#1e2a3a] p-3">
                      <p className="text-sm font-bold text-[#f2f6fb]">{stop.stationName}</p>
                      <p className="text-[11px] text-[#9aa8bc]">{stop.locationHighway}</p>
                      <p className="fr-mono text-sm text-[#00a3ff] mt-1">
                        €{stop.netPricePerL.toFixed(3)}/L · bespaar €{stop.savingsEur.toFixed(2)}
                      </p>
                      <button
                        type="button"
                        className="mt-2 text-xs font-bold text-[#86efac]"
                        onClick={() => {
                          startNavTo(`${stop.stationName} ${stop.locationHighway}`);
                          setOverlay(null);
                        }}
                      >
                        Start navigatie →
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <button
              type="button"
              onClick={() => setOverlay(null)}
              className="w-full h-12 rounded-[12px] font-bold bg-[#151d2a] text-white border border-[#1e2a3a]"
            >
              Sluiten
            </button>
          </div>
        </div>
      )}

      {showGlovebox ? <GloveboxModal onClose={closeGlovebox} /> : null}

      {showCmrImport && (
        <div
          className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          onClick={() => setShowCmrImport(false)}
        >
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={() => setShowCmrImport(false)}
                className="text-sm font-semibold text-[#9aa8bc] hover:text-white"
              >
                Sluiten
              </button>
            </div>
            <CmrImportPanel
              onApplied={(cmr) => {
                setDestination(cmr.destination);
                window.setTimeout(() => setShowCmrImport(false), 1200);
              }}
            />
          </div>
        </div>
      )}

      {showEcmrPreview && (
        <EcmrPreviewModal
          cmr={activeCmr}
          destination={destination}
          onClose={() => setShowEcmrPreview(false)}
          onLoadCmr={() => {
            setShowEcmrPreview(false);
            setShowCmrImport(true);
          }}
          onSign={() => {
            setShowEcmrPreview(false);
            onOpenSignature();
          }}
        />
      )}
    </main>
  );
}

function EcmrPreviewModal({
  cmr,
  destination,
  onClose,
  onLoadCmr,
  onSign,
}: {
  cmr: CmrShipment | null;
  destination: string;
  onClose: () => void;
  onLoadCmr: () => void;
  onSign: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-lg fr-glass p-5 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between gap-3">
          <div>
            <p className="fr-label">e-CMR</p>
            <h3 className="fr-display text-lg">Controleer vóór handtekening</h3>
          </div>
          <button type="button" onClick={onClose} className="text-sm text-[#9aa8bc]">
            Sluiten
          </button>
        </div>

        {cmr ? (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs rounded-[12px] border border-[#1e2a3a] bg-[#050a0f] p-3">
            <div>
              <dt className="fr-label">CMR-nr</dt>
              <dd className="fr-mono text-[#00a3ff] font-bold">{cmr.cmrNumber}</dd>
            </div>
            <div>
              <dt className="fr-label">Gewicht</dt>
              <dd className="fr-mono text-[#f2f6fb]">
                {cmr.grossWeightKg.toLocaleString('nl-NL')} kg · {cmr.loadedWeightT} t
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="fr-label">Afzender</dt>
              <dd className="text-[#e8eef7] font-semibold">{cmr.shipper}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="fr-label">Ontvanger</dt>
              <dd className="text-[#e8eef7] font-semibold">{cmr.consignee}</dd>
            </div>
            <div>
              <dt className="fr-label">Van</dt>
              <dd className="text-[#e8eef7]">{cmr.origin}</dd>
            </div>
            <div>
              <dt className="fr-label">Naar</dt>
              <dd className="text-[#e8eef7]">{cmr.destination}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="fr-label">Goederen</dt>
              <dd className="text-[#e8eef7]">{cmr.goodsDescription}</dd>
            </div>
            <div>
              <dt className="fr-label">Trekker / oplegger</dt>
              <dd className="fr-mono text-[#e8eef7]">
                {cmr.truckPlate} / {cmr.trailerPlate}
              </dd>
            </div>
            {cmr.adr && (
              <div>
                <dt className="fr-label">ADR</dt>
                <dd className="text-[#ff8a82] font-bold">Klasse {cmr.adrClass || '•'}</dd>
              </div>
            )}
          </dl>
        ) : (
          <div className="rounded-[12px] border border-[#ff9500]/40 bg-[#ff9500]/10 p-4 space-y-2">
            <p className="text-sm font-bold text-[#ffb84d]">Geen CMR geladen</p>
            <p className="text-xs text-[#ffd9a8]">
              Laad eerst een vrachtbrief (JPG/PNG/PDF). Bestemming nu: {destination}.
            </p>
            <button
              type="button"
              onClick={onLoadCmr}
              className="w-full h-11 rounded-[10px] font-bold bg-[#00a3ff] text-white"
            >
              📋 CMR laden
            </button>
          </div>
        )}

        <button
          type="button"
          disabled={!cmr}
          onClick={onSign}
          className="w-full h-12 rounded-[12px] font-bold bg-[#28a745] text-white disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ✓ Akkoord — digitale handtekening
        </button>
      </div>
    </div>
  );
}

function MetricChip({
  label,
  value,
  warn,
  ok,
}: {
  label: string;
  value: string;
  warn?: boolean;
  ok?: boolean;
}) {
  return (
    <div
      className={`rounded-[12px] border px-3 py-2.5 ${
        warn
          ? 'bg-[#ff3b30]/10 border-[#ff3b30]/35'
          : ok
            ? 'bg-[#28a745]/10 border-[#28a745]/35'
            : 'bg-[#0f1620] border-[#1e2a3a]'
      }`}
    >
      <p className="fr-label">{label}</p>
      <p
        className={`fr-display text-lg mt-0.5 tabular-nums ${
          warn ? 'text-[#ff8a82]' : ok ? 'text-[#86efac]' : 'text-[#f2f6fb]'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] bg-[#050a0f] border border-[#1e2a3a] px-3 py-2 text-center">
      <p className="fr-label">{label}</p>
      <p className="fr-mono text-sm font-semibold text-[#e8eef7] mt-0.5">{value}</p>
    </div>
  );
}

function ParkTile({
  icon,
  label,
  onClick,
  danger,
  disabled,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-[14px] border p-4 text-left transition touch-manipulation disabled:opacity-40 disabled:cursor-not-allowed ${
        danger
          ? 'bg-[#ff3b30]/10 border-[#ff3b30]/35'
          : 'bg-[#0f1620] border-[#1e2a3a] hover:border-[#00a3ff]/40'
      }`}
    >
      <p className="text-2xl mb-2">{icon}</p>
      <p className="text-sm font-bold text-[#e8eef7]">{label}</p>
      {disabled && <p className="text-[10px] text-[#6b7a90] mt-1">Alleen stilstand</p>}
    </button>
  );
}
