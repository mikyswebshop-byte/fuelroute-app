'use client';

import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { useAppMode } from '@/components/AppModeProvider';
import { GloveboxModal } from '@/components/GloveboxModal';
import { SpeedGauge } from '@/components/SpeedGauge';
import { useTelemetry } from '@/components/TelemetryProvider';
import {
  VoiceAssistant,
  speakText,
  type VoiceCommandId,
} from '@/components/VoiceAssistant';
import { formatDriveTime } from '@/lib/calculations';
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
  } = useTelemetry();

  const [showGlovebox, setShowGlovebox] = useState(false);
  const [overlay, setOverlay] = useState<OverlayKind>(null);
  const [dismissGpsPrompt, setDismissGpsPrompt] = useState(false);

  const isDriving = !isStandstill && (animating || displaySpeedKmh > 10);
  const speechLang = speechLangFromDriver(lang);
  const fuelLow = fuelPct < 20;

  const delayMin = trafficJam
    ? trafficDelayMinutes(nextStopKm, displaySpeedKmh)
    : 0;

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
      cmr: 'e-CMR handtekening geopend.',
      rijtijd: `Resterende rijtijd ${drive}. ETA ${liveEtaLabel}.`,
      berichten: msg,
      pech: 'Noodprotocol gestart. Pechhulp wordt geactiveerd.',
      unknown: "Sorry, ik begreep het niet. Zeg status, tanken, stilstand, simuleer of handschoenvak.",
      listening: 'Luistert...',
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- unreadMessages via unreadKey
  }, [
    etaMinutes,
    nextStopName,
    nextStopKm,
    unreadKey,
    displaySpeedKmh,
    fuelPct,
    trafficJam,
    liveEtaLabel,
  ]);

  const onVoiceCommand = useCallback(
    (cmd: Exclude<VoiceCommandId, 'unknown'>) => {
      switch (cmd) {
        case 'status':
        case 'rijtijd':
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
          if (isStandstill) openSignature();
          break;
        case 'berichten':
          setOverlay('status');
          break;
        case 'pech':
          break;
        default:
          break;
      }
    },
    [isStandstill, openGlovebox, openSignature, startSimulation, stopSimulation]
  );

  const showGpsPrompt =
    !dismissGpsPrompt &&
    (gpsPermission === 'prompt' || gpsPermission === 'denied' || gpsPermission === 'unsupported') &&
    !gpsWatching;

  const headerTone = trafficJam
    ? 'bg-amber-600'
    : isDriving
      ? 'bg-sky-600'
      : 'bg-emerald-700';

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#0b0f19] text-slate-100">
      <div className={`${headerTone} text-white px-4 py-4 sm:py-5 transition-colors`}>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-90">
          {trafficJam
            ? 'File / Vertraging'
            : isDriving
              ? 'Rij-modus · Handsfree'
              : 'Stilstand-modus'}
        </p>
        <p className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight mt-1">
          {trafficJam ? 'FILE / VERTRAGING' : nextTurn}
        </p>
        <p className="text-sm sm:text-base mt-1 font-semibold opacity-95">
          ETA {liveEtaLabel}
          {trafficJam && delayMin > 0 ? ` · +${delayMin} min vertraging` : ''} · {nextStopName}
        </p>
      </div>

      {showGpsPrompt && (
        <div className="max-w-3xl mx-auto px-4 pt-4">
          <div className="rounded-2xl border border-sky-500/40 bg-sky-950/50 p-4 space-y-3">
            <p className="text-sm font-bold text-sky-100">Locatie delen voor live GPS</p>
            <p className="text-xs text-slate-300 leading-relaxed">
              Sta locatietoegang toe voor echte iPhone-tracking, filesignalering en ETA. Bij weigering
              gebruiken we democoördinaten ({DEMO_GPS.label}).
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setDismissGpsPrompt(false);
                  requestGpsPermission();
                }}
                className="px-4 py-2.5 rounded-xl text-sm font-bold bg-sky-600 hover:bg-sky-500 text-white"
              >
                📍 Locatie toestaan
              </button>
              <button
                type="button"
                onClick={() => setDismissGpsPrompt(true)}
                className="px-4 py-2.5 rounded-xl text-sm font-bold bg-slate-800 text-slate-300 border border-slate-600"
              >
                Later / demo
              </button>
            </div>
            {gpsPermission === 'denied' && (
              <p className="text-[11px] text-amber-300">
                Toestemming geweigerd — demopositie actief ({gps.lat.toFixed(3)}, {gps.lng.toFixed(3)}).
              </p>
            )}
            {gpsPermission === 'unsupported' && (
              <p className="text-[11px] text-amber-300">
                Geolocation niet beschikbaar in deze browser — demopositie actief.
              </p>
            )}
          </div>
        </div>
      )}

      {gpsWatching && gpsPermission === 'prompt' && (
        <div className="max-w-3xl mx-auto px-4 pt-3">
          <p className="text-xs text-sky-300 font-semibold animate-pulse">
            Wachten op locatietoestemming…
          </p>
        </div>
      )}

      <div className="relative w-full h-[38vh] min-h-[220px] max-h-[420px] bg-slate-900 overflow-hidden border-b border-slate-800">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            backgroundImage:
              'radial-gradient(circle at 30% 40%, #1e3a5f 0%, transparent 45%), radial-gradient(circle at 70% 60%, #134e4a 0%, transparent 40%), linear-gradient(160deg, #0f172a, #1e293b 55%, #0b0f19)',
          }}
        />
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="none">
          <path
            d="M40 320 C160 280, 220 200, 340 180 S520 140, 640 120 S740 80, 780 60"
            fill="none"
            stroke={trafficJam ? '#fbbf24' : '#38bdf8'}
            strokeWidth="10"
            strokeLinecap="round"
            opacity="0.85"
          />
          <circle cx="340" cy="180" r="14" fill="#f8fafc" stroke="#0ea5e9" strokeWidth="4" />
          <circle cx="640" cy="120" r="10" fill="#10b981" />
        </svg>
        <div className="absolute top-3 right-3 w-28 sm:w-36 pointer-events-none drop-shadow-xl">
          <SpeedGauge speedKmh={displaySpeedKmh} />
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex justify-between gap-2 flex-wrap">
          <span className="px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur text-xs font-bold border border-white/10">
            {gps.source === 'live' ? 'Live GPS' : gps.source === 'demo' ? 'Demo GPS' : 'Kaart'} ·{' '}
            {Math.round(displaySpeedKmh)} km/h
            {animating ? ` · ${engineRpm} rpm` : ''}
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur text-xs font-bold border border-white/10">
            {trafficJam
              ? 'FILE'
              : isDriving
                ? gps.source === 'live'
                  ? 'NAV live'
                  : 'Simulatie'
                : 'NAV standby'}
          </span>
        </div>
      </div>

      {!isDriving ? (
        <div className="max-w-3xl mx-auto px-4 py-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatusChip
            label="Rijtijd Over"
            value={formatDriveTime(Math.round(etaMinutes))}
            accent="sky"
          />
          <StatusChip
            label="Volgende Stop"
            value={`${nextStopKm.toFixed(0)} km`}
            accent="emerald"
          />
          <StatusChip
            label="Brandstof"
            value={`${fuelPct.toFixed(0)}%`}
            accent={fuelLow ? 'rose' : 'amber'}
            warn={fuelLow}
          />
        </div>
      ) : (
        <div className="max-w-3xl mx-auto px-4 py-3 flex justify-center gap-2 flex-wrap">
          <span
            className={`px-3 py-1.5 rounded-lg border text-sm font-bold ${
              trafficJam
                ? 'bg-amber-950 border-amber-500/50 text-amber-200'
                : 'bg-slate-900 border-slate-600 text-sky-200'
            }`}
          >
            ETA {liveEtaLabel}
            {trafficJam && delayMin > 0 ? ` (+${delayMin}m)` : ''}
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-600 text-sm font-bold text-emerald-200">
            {nextStopKm.toFixed(0)} km
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-600 text-sm font-bold text-slate-200">
            {Math.round(displaySpeedKmh)} km/h
          </span>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 pb-6 flex flex-col sm:flex-row items-center justify-center gap-6">
        <VoiceAssistant
          large
          speechLang={speechLang}
          responses={responses}
          onEmergency={onEmergency}
          onCommand={onVoiceCommand}
        />
        <button
          type="button"
          onClick={() => {
            speakText(responses.pech, speechLang);
            onEmergency();
          }}
          className="w-28 h-28 rounded-full bg-rose-600 hover:bg-rose-500 border-4 border-rose-300 text-white text-3xl font-black shadow-2xl flex items-center justify-center"
          aria-label="Noodgeval"
        >
          🆘
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-6 flex flex-wrap gap-2 justify-center">
        <button
          type="button"
          onClick={startSimulation}
          className={`px-4 py-3 rounded-xl text-sm font-bold border ${
            isDriving && !trafficJam
              ? 'bg-amber-500/20 text-amber-200 border-amber-500/40'
              : 'bg-slate-800 text-slate-300 border-slate-600'
          }`}
        >
          🚗 Simuleer Rijden
        </button>
        <button
          type="button"
          onClick={stopSimulation}
          className={`px-4 py-3 rounded-xl text-sm font-bold border ${
            isStandstill
              ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40'
              : 'bg-slate-800 text-slate-300 border-slate-600'
          }`}
        >
          🛑 Stilstand
        </button>
        {gps.source !== 'live' && (
          <button
            type="button"
            onClick={requestGpsPermission}
            className="px-4 py-3 rounded-xl text-sm font-bold border bg-sky-950/50 text-sky-200 border-sky-500/40"
          >
            📍 GPS starten
          </button>
        )}
      </div>

      {isStandstill && (
        <div className="max-w-3xl mx-auto px-4 pb-24 space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Stilstand-tools
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={openGlovebox}
              className="rounded-2xl border border-slate-600 bg-[#1e293b] p-5 text-left hover:border-sky-500/40"
            >
              <p className="text-2xl mb-2">📄</p>
              <p className="font-bold text-slate-100">Digitale Handschoenvak</p>
              <p className="text-xs text-slate-400 mt-1">Documenten {'&'} licenties</p>
            </button>
            <button
              type="button"
              onClick={openSignature}
              className="rounded-2xl border border-slate-600 bg-[#1e293b] p-5 text-left hover:border-emerald-500/40"
            >
              <p className="text-2xl mb-2">✍️</p>
              <p className="font-bold text-slate-100">e-CMR Handtekening</p>
              <p className="text-xs text-slate-400 mt-1">Alleen beschikbaar bij stilstand</p>
            </button>
          </div>
          {parkedChildren}
        </div>
      )}

      {overlay && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-4"
          onClick={() => setOverlay(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-600 bg-[#1e293b] p-5 space-y-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {overlay === 'status' ? (
              <>
                <h3 className="text-lg font-black text-slate-100">Voertuigstatus</h3>
                <ul className="text-sm text-slate-300 space-y-2">
                  <li>Snelheid: {Math.round(displaySpeedKmh)} km/h</li>
                  <li>
                    GPS: {gps.source === 'live' ? 'live' : gps.source === 'demo' ? 'demo' : 'uit'} ·{' '}
                    {gps.lat.toFixed(4)}, {gps.lng.toFixed(4)}
                  </li>
                  <li>Brandstof: {fuelPct.toFixed(0)}%</li>
                  <li>ETA: {liveEtaLabel}</li>
                  <li>Modus: {trafficJam ? 'File' : isStandstill ? 'Stilstand' : 'Rijden'}</li>
                </ul>
              </>
            ) : (
              <>
                <h3 className="text-lg font-black text-slate-100">Tankstation</h3>
                <p className="text-sm text-slate-300">
                  Volgende stop: <span className="font-bold text-emerald-300">{nextStopName}</span>
                </p>
                <p className="text-sm text-slate-300">Afstand: {nextStopKm.toFixed(0)} km</p>
                <p className="text-sm text-slate-300">
                  Brandstofreserve: {fuelPct.toFixed(0)}%
                  {fuelLow ? ' · laag' : ''}
                </p>
              </>
            )}
            <button
              type="button"
              onClick={() => setOverlay(null)}
              className="w-full h-12 rounded-xl font-bold bg-slate-700 text-white"
            >
              Sluiten
            </button>
          </div>
        </div>
      )}

      {showGlovebox ? <GloveboxModal onClose={closeGlovebox} /> : null}
    </main>
  );
}

function StatusChip({
  label,
  value,
  accent,
  warn,
}: {
  label: string;
  value: string;
  accent: 'sky' | 'emerald' | 'amber' | 'rose';
  warn?: boolean;
}) {
  const styles = {
    sky: 'border-sky-500/40 bg-sky-950/40 text-sky-200',
    emerald: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-200',
    amber: 'border-amber-500/40 bg-amber-950/40 text-amber-200',
    rose: 'border-rose-500/50 bg-rose-950/50 text-rose-100 ring-2 ring-rose-500/40',
  }[accent];

  return (
    <div className={`rounded-2xl border-2 px-4 py-5 text-center ${styles}`}>
      <p className="text-[11px] font-bold uppercase tracking-wider opacity-80">{label}</p>
      <p className={`mt-2 font-black tabular-nums ${warn ? 'text-4xl' : 'text-3xl sm:text-4xl'}`}>
        {value}
      </p>
    </div>
  );
}
