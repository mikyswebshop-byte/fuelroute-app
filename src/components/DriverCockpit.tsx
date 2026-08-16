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
import { useActiveCmr } from '@/lib/cmr-store';
import { DEMO_GPS, trafficDelayMinutes } from '@/lib/gps';

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

type OverlayKind = 'status' | 'tanken' | null;

export function DriverCockpit({
  lang,
  nextStopName,
  nextTurn,
  unreadMessages,
  onEmergency,
  onOpenSignature,
  onOpenBonScan,
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
  /** Open camera/file flow for tankbon or CMR photo */
  onOpenBonScan?: () => void;
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
  const [overlay, setOverlay] = useState<OverlayKind>(null);
  const [dismissGpsPrompt, setDismissGpsPrompt] = useState(false);
  const activeCmr = useActiveCmr();

  const isDriving = !isStandstill && (animating || displaySpeedKmh > 10);
  const speechLang = speechLangFromDriver(lang);
  const fuelLow = fuelPct < 20;
  const delayMin = trafficJam ? trafficDelayMinutes(nextStopKm, displaySpeedKmh) : 0;

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

  const openSignature = useCallback(() => {
    setOverlay(null);
    setShowGlovebox(false);
    onOpenSignature();
  }, [onOpenSignature]);

  const unreadKey = unreadMessages.join('\u0001');
  const responses = useMemo(() => {
    const drive = formatDriveTime(Math.round(etaMinutes));
    const msg =
      unreadMessages.length === 0
        ? 'Geen ongelezen berichten van de planner.'
        : `${unreadMessages.length} berichten. ${unreadMessages[0]}`;
    return {
      status: `Voertuigstatus: snelheid ${Math.round(displaySpeedKmh)} kilometer per uur, brandstof ${fuelPct.toFixed(0)} procent, rijtijd ${drive}.${trafficJam ? ' File gedetecteerd.' : ''}`,
      tanken: `Dichtstbijzijnde tankstop: ${nextStopName}, over ${nextStopKm.toFixed(0)} kilometer.`,
      stilstand: 'Stilstand-modus geactiveerd.',
      simuleer: 'Rit-simulatie gestart. Drive mode actief.',
      handschoenvak: 'Handschoenvak geopend.',
      cmr: 'CMR import of handtekening geopend.',
      cmr_foto: 'Bon of CMR foto openen. Kies galerij of camera.',
      nieuwe_route: 'Nieuwe route: CMR laden of planner openen.',
      navigatie: `Navigatie: ${nextTurn}. Volgende stop ${nextStopName}, ETA ${liveEtaLabel}.`,
      eta: `Geschatte aankomst ${liveEtaLabel}. Resterende rijtijd ${drive}.`,
      rijtijd: `Resterende rijtijd ${drive}. ETA ${liveEtaLabel}.`,
      berichten: msg,
      pech: 'Noodprotocol gestart. Pechhulp wordt geactiveerd.',
      unknown:
        "Sorry, ik begreep het niet. Zeg status, tanken, nieuwe route, CMR foto, navigatie of stilstand.",
      listening: 'Luistert...',
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etaMinutes, nextStopName, nextStopKm, unreadKey, displaySpeedKmh, fuelPct, trafficJam, liveEtaLabel]);

  const onVoiceCommand = useCallback(
    (cmd: Exclude<VoiceCommandId, 'unknown'>) => {
      switch (cmd) {
        case 'status':
        case 'rijtijd':
        case 'berichten':
        case 'eta':
        case 'navigatie':
          setOverlay('status');
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
          if (isStandstill) openGlovebox();
          break;
        case 'cmr':
          if (isStandstill) {
            setShowCmrImport(true);
          } else {
            openSignature();
          }
          break;
        case 'cmr_foto':
          onOpenBonScan?.();
          break;
        case 'nieuwe_route':
          setShowCmrImport(true);
          break;
        default:
          break;
      }
    },
    [isStandstill, onOpenBonScan, openGlovebox, openSignature, startSimulation, stopSimulation]
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
    : nextStopName;

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[var(--fr-bg)] text-[var(--fr-text)] pb-28">
      {/* Mode banner */}
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

      {/* Real OSM map + zoom */}
      <RouteMap
        lat={gps.lat}
        lng={gps.lng}
        trafficJam={trafficJam}
        statusLeft={`${gps.source === 'live' ? 'Live GPS' : 'Demo GPS'} · ${Math.round(displaySpeedKmh)} km/h`}
        statusRight={
          trafficJam ? 'FILE' : isDriving ? (gps.source === 'live' ? 'NAV live' : 'Simulatie') : 'Standby'
        }
      />

      {/* Status chips — kit §03 */}
      <div className="max-w-3xl mx-auto px-4 py-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
        <MetricChip label="Rijtijd" value={formatDriveTime(Math.round(etaMinutes))} />
        <MetricChip label="Volgende stop" value={`${nextStopKm.toFixed(0)} km`} />
        <MetricChip
          label="Brandstof"
          value={`${fuelPct.toFixed(0)}%`}
          warn={fuelLow}
        />
        <MetricChip
          label="Duty"
          value={trafficJam ? 'File' : isStandstill ? 'Stilstand' : 'Rijden'}
          ok={!trafficJam && !isStandstill}
        />
      </div>

      {/* Gauges — kit §07 / §19 */}
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

      {/* Parked tools grid — kit §02 */}
      {isStandstill && (
        <div className="max-w-3xl mx-auto px-4 pb-6 space-y-4">
          <ActiveCmrBanner onOpen={() => setShowCmrImport(true)} />
          <p className="fr-label">Stilstand-tools</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <ParkTile icon="📄" label="Glovebox" onClick={openGlovebox} />
            <ParkTile
              icon="📋"
              label="CMR laden"
              onClick={() => setShowCmrImport(true)}
            />
            <ParkTile icon="✍️" label="e-CMR" onClick={openSignature} />
            <ParkTile icon="⛽" label="Brandstof" onClick={() => setOverlay('tanken')} />
            <ParkTile icon="📡" label="Voertuig" onClick={() => setOverlay('status')} />
            <ParkTile
              icon="🆘"
              label="Nood"
              onClick={onEmergency}
              danger
            />
          </div>
          {parkedChildren}
        </div>
      )}

      {/* Fixed bottom FAB bar — kit §02 */}
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
            className="w-full max-w-md fr-glass p-5 space-y-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {overlay === 'status' ? (
              <>
                <h3 className="fr-display text-lg">Voertuigstatus</h3>
                <ul className="text-sm text-[#9aa8bc] space-y-2">
                  <li className="fr-mono">Snelheid: {Math.round(displaySpeedKmh)} km/h</li>
                  <li className="fr-mono">
                    GPS: {gps.lat.toFixed(4)}, {gps.lng.toFixed(4)}
                  </li>
                  <li>Brandstof: {fuelPct.toFixed(0)}%</li>
                  <li>ETA: {liveEtaLabel}</li>
                </ul>
              </>
            ) : (
              <>
                <h3 className="fr-display text-lg">Tankstation</h3>
                <p className="text-sm text-[#9aa8bc]">
                  Volgende stop:{' '}
                  <span className="font-bold text-[#00a3ff]">{nextStopName}</span>
                </p>
                <p className="text-sm text-[#9aa8bc] fr-mono">{nextStopKm.toFixed(0)} km</p>
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
              onApplied={() => {
                // Laat “Toegepast”-status even zien vóór sluiten
                window.setTimeout(() => setShowCmrImport(false), 1400);
              }}
            />
          </div>
        </div>
      )}
    </main>
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
}: {
  icon: string;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[14px] border p-4 text-left transition hover:border-[#00a3ff]/40 ${
        danger
          ? 'bg-[#ff3b30]/10 border-[#ff3b30]/35'
          : 'bg-[#0f1620] border-[#1e2a3a]'
      }`}
    >
      <p className="text-2xl mb-2">{icon}</p>
      <p className="text-sm font-bold text-[#e8eef7]">{label}</p>
    </button>
  );
}
