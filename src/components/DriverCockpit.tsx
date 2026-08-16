'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAppMode } from '@/components/AppModeProvider';
import { ActiveCmrBanner, CmrImportPanel } from '@/components/CmrImportPanel';
import { FuelSavingsPanel } from '@/components/FuelSavingsPanel';
import { GloveboxModal } from '@/components/GloveboxModal';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useLanguage } from '@/components/LanguageProvider';
import { RouteMap, DEFAULT_ROUTE, buildRoadSignHud } from '@/components/RouteMap';
import { useTelemetry } from '@/components/TelemetryProvider';
import {
  TruckProfilePanel,
  useTruckProfile,
} from '@/components/TruckProfilePanel';
import {
  VoiceAssistant,
  speakText,
  type VoiceCommandId,
} from '@/components/VoiceAssistant';
import { formatDriveTime } from '@/lib/calculations';
import { useActiveCmr, type CmrShipment } from '@/lib/cmr-store';
import { driverText, localeToDriverLang } from '@/lib/driver-i18n';
import { buildFuelSavingsPlan } from '@/lib/fuel-savings';
import { trafficDelayMinutes } from '@/lib/gps';
import {
  guidanceLine,
  resolveInAppRoute,
  type InAppRoute,
} from '@/lib/in-app-nav';
import { saveTruckProfile } from '@/lib/truck-profile';

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

export function DriverCockpit({
  lang: _langProp,
  nextStopName,
  nextTurn: nextTurnProp,
  unreadMessages,
  onEmergency,
  onOpenSignature,
  onOpenBonScan,
  onOpenPreTrip,
  parkedChildren,
}: {
  lang?: string;
  remainingDriveMin?: number;
  fuelLevel?: number;
  nextStopKm?: number;
  nextStopName: string;
  nextTurn?: string;
  eta?: string;
  unreadMessages: string[];
  onEmergency: () => void;
  onOpenSignature: () => void;
  onOpenBonScan?: () => void;
  onOpenPreTrip?: () => void;
  parkedChildren?: ReactNode;
}) {
  const { locale } = useLanguage();
  const lang = localeToDriverLang(locale);
  const t = useMemo(() => driverText(lang), [lang]);
  const nextTurn = nextTurnProp || t.nextTurnDefault;
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
  } = useTelemetry();

  const [showGlovebox, setShowGlovebox] = useState(false);
  const [showCmrImport, setShowCmrImport] = useState(false);
  const [showEcmrPreview, setShowEcmrPreview] = useState(false);
  const [overlay, setOverlay] = useState<OverlayKind>(null);
  const [dismissGpsPrompt, setDismissGpsPrompt] = useState(false);
  const [destination, setDestination] = useState('Praag / Prague (CZ)');
  const [navFlash, setNavFlash] = useState<string | null>(null);
  const [officePing, setOfficePing] = useState<string | null>(null);
  const [navActive, setNavActive] = useState(false);
  const [activeNav, setActiveNav] = useState<InAppRoute | null>(null);
  const [navStep, setNavStep] = useState(0);
  const [liveGuidance, setLiveGuidance] = useState(nextTurn);
  const [truckProfile, setTruckProfile] = useTruckProfile();
  const activeCmr = useActiveCmr();

  const isDriving = !isStandstill && (animating || displaySpeedKmh > 10);
  const speechLang = speechLangFromDriver(lang);
  const fuelLow = fuelPct < 20;
  const delayMin = trafficJam ? trafficDelayMinutes(nextStopKm, displaySpeedKmh) : 0;

  useEffect(() => {
    if (!activeCmr) return;
    setTruckProfile((prev) => {
      const next = {
        ...prev,
        truckPlate: activeCmr.truckPlate || prev.truckPlate,
        trailerPlate: activeCmr.trailerPlate || prev.trailerPlate,
        grossWeightT: activeCmr.loadedWeightT || prev.grossWeightT,
        adr: activeCmr.adr,
        adrClass: activeCmr.adrClass || prev.adrClass,
      };
      saveTruckProfile(next);
      return next;
    });
  }, [activeCmr, setTruckProfile]);

  useEffect(() => {
    if (!navActive || !activeNav) return;
    setLiveGuidance(guidanceLine(activeNav, navStep));
    const id = window.setInterval(() => {
      setNavStep((s) => {
        const next = Math.min(s + 1, activeNav.steps.length - 1);
        setLiveGuidance(guidanceLine(activeNav, next));
        return next;
      });
    }, 45000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navActive, activeNav]);

  const fuelPlan = useMemo(
    () =>
      buildFuelSavingsPlan({
        destination,
        fuelPct,
        rangeKm: 405,
      }),
    [destination, fuelPct]
  );

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

  const stopNav = useCallback(() => {
    setNavActive(false);
    setActiveNav(null);
    setNavStep(0);
    setNavFlash(t.navStopped);
    window.setTimeout(() => setNavFlash(null), 2500);
  }, [t.navStopped]);

  const startNavTo = useCallback(
    (label: string) => {
      const originLabel = activeCmr?.origin;
      const fromLive = gps.source === 'live' ? { lat: gps.lat, lng: gps.lng } : undefined;
      const resolved = resolveInAppRoute(label, fromLive, truckProfile, originLabel);
      setDestination(label);
      setActiveNav(resolved);
      setNavStep(0);
      setNavActive(true);
      setDismissGpsPrompt(true);
      setOverlay(null);
      setShowGlovebox(false);
      setStandstill(false);
      setRouteActive(true);
      setSimulatedSpeedKmh(72);
      const guide = guidanceLine(resolved, 0);
      setLiveGuidance(guide);
      const crit = resolved.truckAlerts.filter((a) => a.severity === 'critical').length;
      setNavFlash(
        crit > 0
          ? `${t.navStarted} → ${originLabel ? `${originLabel} → ` : ''}${resolved.label} · ${crit} ${t.criticalWarnings}`
          : `${t.navStarted} → ${originLabel ? `${originLabel} → ` : ''}${resolved.label}`
      );
      window.setTimeout(() => setNavFlash(null), 5000);
      speakText(`${t.navStarted}. ${guide}.`, speechLang);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [
      activeCmr?.origin,
      gps.source,
      gps.lat,
      gps.lng,
      truckProfile,
      setStandstill,
      setRouteActive,
      setSimulatedSpeedKmh,
      speechLang,
      t.navStarted,
      t.criticalWarnings,
    ]
  );

  const unreadKey = unreadMessages.join('\u0001');
  const responses = useMemo(() => {
    const drive = formatDriveTime(Math.round(etaMinutes));
    const msg =
      unreadMessages.length === 0
        ? 'Geen ongelezen berichten van de planner.'
        : `${unreadMessages.length} berichten. ${unreadMessages[0]}`;
    const cheap = fuelPlan.nlBorderAlert?.station ?? fuelPlan.rankedStops[0];
    const saveEur = fuelPlan.headlineSavingEur;
    return {
      status: `Voertuigstatus: snelheid ${Math.round(displaySpeedKmh)} kilometer per uur, brandstof ${fuelPct.toFixed(0)} procent, rijtijd ${drive}.${trafficJam ? ' File gedetecteerd.' : ''}`,
      tanken: cheap
        ? `Tankadvies: ${cheap.stationName}, €${cheap.netPricePerL.toFixed(3)} per liter. Bespaar ongeveer ${saveEur.toFixed(0)} euro versus Nederland. ${fuelPlan.nlBorderAlert ? 'Tank vóór de Nederlandse grens.' : ''}`
        : `Dichtstbijzijnde tip: ${nextStopName}.`,
      stilstand: 'Stilstand-modus geactiveerd. Tools beschikbaar.',
      simuleer: 'Rit-simulatie gestart. Drive mode actief.',
      handschoenvak: 'Handschoenvak geopend.',
      cmr: 'CMR import geopend. Upload of bekijk vrachtbrief.',
      cmr_foto: 'Bon of CMR foto openen. Kies galerij of camera.',
      nieuwe_route: 'Nieuwe route: vul bestemming in of laad een CMR.',
      navigatie: navActive
        ? `Trucknavigatie actief: ${liveGuidance}. Bestemming ${destination}. Voertuig ${truckProfile.heightM} meter hoog, ${truckProfile.grossWeightT} ton.`
        : `Nog geen navigatie. Zeg start navigatie of kies bestemming. Nu: ${nextTurn}.`,
      eta: `Geschatte aankomst ${liveEtaLabel}. Resterende rijtijd ${drive}.`,
      rijtijd: `Resterende rijtijd ${drive}. ETA ${liveEtaLabel}.`,
      berichten: msg,
      pech: 'Noodprotocol gestart. Pechhulp wordt geactiveerd.',
      unknown:
        "Sorry, niet helemaal begrepen. Zeg bijvoorbeeld: waar tanken, goedkoopste pomp, grens waarschuwing, nieuwe route, bon foto, navigatie, douche, of status.",
      listening: 'Luistert...',
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    etaMinutes,
    nextStopName,
    unreadKey,
    displaySpeedKmh,
    fuelPct,
    trafficJam,
    liveEtaLabel,
    fuelPlan,
    nextTurn,
    destination,
    navActive,
    liveGuidance,
    truckProfile.heightM,
    truckProfile.grossWeightT,
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
          if (!navActive) startNavTo(destination);
          else setOverlay('route');
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
    [onOpenBonScan, openGlovebox, startSimulation, stopSimulation, navActive, startNavTo, destination]
  );

  const showGpsPrompt =
    !navActive &&
    !dismissGpsPrompt &&
    (gpsPermission === 'prompt' || gpsPermission === 'denied' || gpsPermission === 'unsupported') &&
    !gpsWatching;

  const bannerClass = trafficJam
    ? 'bg-[#ff9500] text-[#1a0f00]'
    : isDriving || navActive
      ? 'bg-[#00a3ff]/90 text-white'
      : 'bg-[#151d2a] text-[#c5d0e0]';

  const routeLabel = activeCmr
    ? `${activeCmr.origin} → ${activeCmr.destination}`
    : destination;

  const roadSigns = useMemo(
    () => buildRoadSignHud(truckProfile, activeNav?.truckAlerts ?? [], trafficJam),
    [truckProfile, activeNav?.truckAlerts, trafficJam]
  );

  const previewRoute = useMemo(() => {
    if (activeNav?.route) return activeNav.route;
    if (activeCmr) {
      return resolveInAppRoute(
        activeCmr.destination || destination,
        undefined,
        truckProfile,
        activeCmr.origin
      ).route;
    }
    return DEFAULT_ROUTE;
  }, [activeNav?.route, activeCmr, destination, truckProfile]);

  const mapLat =
    gps.source === 'live'
      ? gps.lat
      : (activeNav?.route[0]?.[0] ?? previewRoute[0]?.[0] ?? gps.lat);
  const mapLng =
    gps.source === 'live'
      ? gps.lng
      : (activeNav?.route[0]?.[1] ?? previewRoute[0]?.[1] ?? gps.lng);

  return (
    <main className="bg-[var(--fr-bg)] text-[var(--fr-text)] pb-[4.5rem]">
      <div className={`${bannerClass} px-3 py-1 flex items-center justify-between gap-2`}>
        <p className="text-[11px] font-bold truncate flex-1">
          {trafficJam
            ? t.file
            : navActive
              ? liveGuidance
              : isDriving
                ? nextTurn
                : t.readyPickDest}
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <p className="text-[10px] font-semibold opacity-95 fr-mono">
            {t.eta} {liveEtaLabel}
            {trafficJam && delayMin > 0 ? ` +${delayMin}m` : ''}
          </p>
          <LanguageSelector compact />
        </div>
      </div>

      {navFlash && (
        <div className="mx-3 mt-2 rounded-[8px] border border-[#28a745]/40 bg-[#28a745]/10 px-2.5 py-1.5 text-[11px] font-bold text-[#86efac]">
          {navFlash}
        </div>
      )}
      {officePing && (
        <div className="mx-3 mt-1.5 rounded-[8px] border border-[#00a3ff]/35 bg-[#00a3ff]/10 px-2.5 py-1.5 text-[11px] font-semibold text-[#7dd3fc]">
          {officePing}
        </div>
      )}

      {showGpsPrompt && (
        <div className="px-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => requestGpsPermission()}
              className="h-8 px-3 rounded-lg text-[11px] font-bold bg-[#00a3ff] text-white"
            >
              {t.liveLocation}
            </button>
            <button
              type="button"
              onClick={() => setDismissGpsPrompt(true)}
              className="h-8 px-3 rounded-lg text-[11px] font-semibold text-[#9aa8bc]"
            >
              {t.skip}
            </button>
          </div>
        </div>
      )}

      <RouteMap
        lat={mapLat}
        lng={mapLng}
        trafficJam={trafficJam}
        route={previewRoute}
        navigating={navActive}
        guidance={liveGuidance}
        speedKmh={displaySpeedKmh}
        etaLabel={liveEtaLabel}
        destinationLabel={routeLabel}
        signs={navActive ? roadSigns : null}
        onStopNav={stopNav}
        labels={{
          stop: t.stopNav,
          height: t.signHeight,
          weight: t.signWeight,
          incline: t.signIncline,
          noOvertake: t.signNoOvertake,
          toll: t.signToll,
          border: t.signBorder,
          file: t.file,
          wholeRoute: t.wholeRoute,
          myPosition: t.myPosition,
        }}
        heightClass="h-[min(46vh,420px)] min-h-[240px]"
      />

      <div className="sticky top-0 z-30 px-3 py-2 border-b border-[#1e2a3a] bg-[#0b0e11] space-y-2 shadow-lg">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="flex-1 min-w-0 bg-[#050a0f] border border-[#1e2a3a] rounded-[10px] px-3 py-2.5 text-sm text-[#f2f6fb]"
            placeholder={t.destinationPlaceholder}
          />
          {navActive ? (
            <button
              type="button"
              onClick={stopNav}
              className="h-11 px-4 rounded-[10px] font-bold bg-[#ff3b30] text-white text-sm shrink-0 touch-manipulation"
            >
              {t.stop}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => startNavTo(destination)}
              className="h-11 px-4 rounded-[10px] font-bold bg-[#00a3ff] text-white text-sm shrink-0 touch-manipulation"
            >
              {t.start}
            </button>
          )}
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          <QuickBtn
            label={isDriving ? t.standstill : t.drive}
            onClick={isDriving ? stopSimulation : startSimulation}
            accent={isDriving}
          />
          <QuickBtn label={t.fuel} onClick={() => setOverlay('tanken')} />
          <QuickBtn label={t.cmr} onClick={() => setShowCmrImport(true)} />
          <QuickBtn label={t.emergency} onClick={onEmergency} danger />
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          <QuickBtn label={t.route} onClick={() => setOverlay('route')} />
          <QuickBtn label={t.status} onClick={() => setOverlay('status')} />
          <QuickBtn label={t.glovebox} onClick={openGlovebox} />
          <QuickBtn
            label={t.photo}
            onClick={() => onOpenBonScan?.()}
            disabled={!isStandstill}
          />
        </div>
        <p className="text-[10px] text-[#6b7a90] truncate">
          {routeLabel} · {truckProfile.truckPlate} / {truckProfile.trailerPlate} ·{' '}
          {truckProfile.heightM.toFixed(1)} m · {truckProfile.grossWeightT} t · {t.fuelShort}{' '}
          {fuelPct.toFixed(0)}%
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-3 py-3 space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <MetricChip label={t.driveTime} value={formatDriveTime(Math.round(etaMinutes))} />
          <MetricChip label={t.nextStop} value={`${nextStopKm.toFixed(0)} km`} />
          <MetricChip label={t.fuelShort} value={`${fuelPct.toFixed(0)}%`} warn={fuelLow} />
          <MetricChip
            label={t.duty}
            value={trafficJam ? t.file : isStandstill ? t.standstill : t.driving}
            ok={!trafficJam && !isStandstill}
          />
        </div>

        <details className="fr-glass p-3" open={!navActive}>
          <summary className="fr-label cursor-pointer">{t.vehicleCombo}</summary>
          <div className="mt-3">
            <TruckProfilePanel profile={truckProfile} onChange={setTruckProfile} />
          </div>
        </details>

        {navActive && activeNav && (
          <details className="fr-glass p-3" open>
            <summary className="fr-label cursor-pointer">
              {t.truckAlerts} ({activeNav.truckAlerts.filter((a) => a.severity !== 'info').length}{' '}
              {t.attention}) — maut & grens hier
            </summary>
            <ul className="mt-2 space-y-2 max-h-56 overflow-y-auto">
              {activeNav.truckAlerts.map((a) => (
                <li
                  key={`${a.kind}-${a.title}`}
                  className={`rounded-[8px] border px-2.5 py-1.5 ${
                    a.severity === 'critical'
                      ? 'border-[#ff3b30]/45 bg-[#ff3b30]/08'
                      : a.severity === 'warn'
                        ? 'border-[#ff9500]/40 bg-[#ff9500]/08'
                        : 'border-[#1e2a3a] bg-[#050a0f]'
                  }`}
                >
                  <p className="text-xs font-bold text-[#f2f6fb]">{a.title}</p>
                  <p className="text-[11px] text-[#9aa8bc] mt-0.5 leading-snug">{a.detail}</p>
                </li>
              ))}
            </ul>
          </details>
        )}

        <FuelSavingsPanel
          destination={destination}
          onNavigate={startNavTo}
          onChatOffice={() =>
            setOfficePing('Bericht naar zaak/planner verzonden — ze zien je tankplan & ETA.')
          }
        />

        <ActiveCmrBanner onOpen={() => setShowCmrImport(true)} />
        {isStandstill && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <ParkTile icon="✍️" label="e-CMR tekenen" onClick={openEcmrFlow} />
            <ParkTile icon="🔍" label="Pre-trip" onClick={() => onOpenPreTrip?.()} />
            <ParkTile icon="📄" label="Glovebox" onClick={openGlovebox} />
          </div>
        )}
        {isStandstill && parkedChildren}
      </div>

      <div className="fixed bottom-0 inset-x-0 z-40 border-t border-[#1e2a3a]/80 bg-[#0b0e11]/80 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-3xl mx-auto px-3 py-2 flex items-end justify-between gap-2">
          <button
            type="button"
            onClick={isDriving ? stopSimulation : startSimulation}
            className={`flex-1 max-w-[120px] h-11 rounded-[10px] text-[11px] font-bold border ${
              isDriving
                ? 'bg-[#28a745]/15 text-[#86efac] border-[#28a745]/40'
                : 'bg-transparent text-[#c5d0e0] border-white/20'
            }`}
          >
            {isDriving ? t.standstill : t.simulate}
          </button>

          <VoiceAssistant
            large
            speechLang={speechLang}
            responses={responses}
            onEmergency={onEmergency}
            onCommand={onVoiceCommand}
            className="-mt-6"
          />

          <button
            type="button"
            onClick={() => {
              speakText(responses.pech, speechLang);
              onEmergency();
            }}
            className="w-12 h-12 rounded-xl bg-[#ff3b30] text-white text-xl font-black flex items-center justify-center"
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
                <h3 className="fr-display text-lg">Trucknavigatie</h3>
                <p className="text-sm text-[#9aa8bc]">{navActive ? liveGuidance : nextTurn}</p>
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
                  Start trucknavigatie
                </button>
              </>
            )}
            {overlay === 'tanken' && (
              <>
                <h3 className="fr-display text-lg">Tankadvies</h3>
                <p className="text-xs text-[#ffb84d]">
                  Kernregel: niet voltanken in NL als DE/BE/CZ goedkoper is.
                </p>
                <ul className="space-y-2">
                  {fuelPlan.rankedStops.slice(0, 5).map((stop) => (
                    <li key={stop.stationName} className="rounded-[10px] border border-[#1e2a3a] p-3">
                      <p className="text-sm font-bold text-[#f2f6fb]">{stop.stationName}</p>
                      <p className="text-[11px] text-[#9aa8bc]">
                        {stop.country} · {stop.locationHighway}
                      </p>
                      <p className="fr-mono text-sm text-[#00a3ff] mt-1">
                        €{stop.netPricePerL.toFixed(3)}/L · ±{stop.litersAdvice} L · +€
                        {Math.max(0, stop.savingVsNlTotalEur).toFixed(0)} vs NL
                      </p>
                      <button
                        type="button"
                        className="mt-2 text-xs font-bold text-[#86efac]"
                        onClick={() => {
                          startNavTo(`${stop.stationName} ${stop.locationHighway}`);
                          setOverlay(null);
                        }}
                      >
                        Start trucknavigatie →
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
                setTruckProfile((prev) => {
                  const next = {
                    ...prev,
                    truckPlate: cmr.truckPlate || prev.truckPlate,
                    trailerPlate: cmr.trailerPlate || prev.trailerPlate,
                    grossWeightT: cmr.loadedWeightT || prev.grossWeightT,
                    adr: cmr.adr,
                    adrClass: cmr.adrClass || prev.adrClass,
                  };
                  saveTruckProfile(next);
                  return next;
                });
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

function QuickBtn({
  label,
  onClick,
  danger,
  accent,
  disabled,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  accent?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`h-10 rounded-[9px] text-[11px] font-bold touch-manipulation disabled:opacity-40 ${
        danger
          ? 'bg-[#ff3b30]/90 text-white'
          : accent
            ? 'bg-[#28a745]/20 text-[#86efac] border border-[#28a745]/40'
            : 'bg-[#151d2a] text-[#e8eef7] border border-[#1e2a3a]'
      }`}
    >
      {label}
    </button>
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
