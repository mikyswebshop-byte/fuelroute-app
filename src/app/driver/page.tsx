'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActionBar, ActionButton } from '@/components/ActionBar';
import { CameraCaptureModal } from '@/components/CameraCaptureModal';
import { DriveModeOverlay } from '@/components/DriveModeOverlay';
import { DriverCockpit } from '@/components/DriverCockpit';
import { useAppMode } from '@/components/AppModeProvider';
import { useLanguage } from '@/components/LanguageProvider';
import { useTelemetry } from '@/components/TelemetryProvider';
import type { AppLocale } from '@/lib/i18n';
import {
  MapEngineSwitcher,
  type MapEngineId,
} from '@/components/MapEngineSwitcher';
import { PreTripWalkaround } from '@/components/PreTripWalkaround';
import { RoleGate } from '@/components/RoleGate';
import { useRole } from '@/components/RoleProvider';
import { SignatureModal } from '@/components/SignatureModal';
import { TelemetryStatusBar } from '@/components/TelemetryStatusBar';
import { scrollToId } from '@/lib/access';
import { getActiveCmr } from '@/lib/cmr-store';
import {
  VehicleDamagePicker,
  type DamageZone,
  type VehicleOutline,
} from '@/components/VehicleDamagePicker';
import { FuelGauge } from '@/components/charts';
import { formatDriveTime } from '@/lib/calculations';
import { DRIVER_LANGS, driverText, type DriverLang } from '@/lib/driver-i18n';
import {
  altFuelStations,
  communityDriverTips,
  emergencyParkingSpots,
  recommendedFuelStops,
  weatherAlerts,
  type AltFuelKind,
  type PumpWaitStatus,
} from '@/lib/mock-data';
import type { CaptureGuide, QualityResult } from '@/lib/photo-quality';

const ALT_FUEL_FILTERS: Array<AltFuelKind | 'Alle'> = [
  'Alle',
  'Diesel',
  'LNG',
  'Waterstof',
  'Elektrisch',
];

const CMR_TRUCK_PLATE = '45-BJK-8';
const CMR_TRAILER_PLATE = 'OW-TR-992';
const WALKAROUND_POINTS = ['Voor', 'Achter', 'Links', 'Rechts', 'Slot/Zegel'] as const;
type WalkPoint = (typeof WALKAROUND_POINTS)[number];

type CameraSession = {
  guide: CaptureGuide;
  label: string;
  context:
    | { kind: 'walk'; point: WalkPoint }
    | { kind: 'anpr'; target: 'truck' | 'trailer' }
    | { kind: 'doc'; docType: 'cmr' | 'tankbon' }
    | { kind: 'focus'; target: 'fuel' | 'reefer' | 'slot' }
    | { kind: 'schade' };
};

interface OcrResult {
  stationName: string;
  liters: number;
  netPricePerL: number;
  vatDeEur: number;
  vatNlEur: number;
  docType: 'tankbon' | 'cmr';
  fileName: string;
}

interface DamagePhoto {
  dataUrl: string;
  fileName: string;
  linkedTo: string;
  at: string;
}

const RESERVE_PCT = 10;

function waitLabel(status: PumpWaitStatus | undefined, t: ReturnType<typeof driverText>) {
  if (status === 'druk') return t.busy;
  if (status === 'storing') return t.pumpFault;
  return t.noWait;
}

function waitClass(status: PumpWaitStatus | undefined) {
  if (status === 'druk') return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  if (status === 'storing') return 'bg-red-500/20 text-red-300 border-red-500/40';
  return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
}

export default function DriverPage() {
  const {
    offlineMode,
    setOfflineMode,
    setSimulatedSpeedKmh,
    simulatedSpeedKmh,
    gpsTrackingEnabled,
  } = useAppMode();
  const { role } = useRole();
  const { locale, t: tUi } = useLanguage();
  const telemetry = useTelemetry();
  const [langOverride, setLangOverride] = useState<DriverLang | null>(null);

  const localeToDriver = (code: AppLocale): DriverLang => {
    const map: Partial<Record<AppLocale, DriverLang>> = {
      NL: 'NL',
      EN: 'EN',
      DE: 'DE',
      PL: 'PL',
      RO: 'RO',
      BG: 'BG',
    };
    return map[code] ?? 'EN';
  };

  const lang = langOverride ?? localeToDriver(locale);
  const t = driverText(lang);

  const altStops = useMemo(() => recommendedFuelStops.slice(0, 4), []);
  const [selectedStopId, setSelectedStopId] = useState(altStops[0]?.stationName ?? '');
  const [navActive, setNavActive] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showBufferWarning, setShowBufferWarning] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [showDamage, setShowDamage] = useState(false);
  const [showDamagePicker, setShowDamagePicker] = useState(false);
  const [damageZoneLabel, setDamageZoneLabel] = useState<string | null>(null);
  const [showWalkaround, setShowWalkaround] = useState(false);
  const [showPreTrip, setShowPreTrip] = useState(false);
  const [showAnpr, setShowAnpr] = useState(false);
  const [showGaugeOcr, setShowGaugeOcr] = useState(false);
  const [ocrStatus, setOcrStatus] = useState('Wacht op foto…');
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [engineRpm, setEngineRpm] = useState(1180);
  const [pingMs, setPingMs] = useState(42);
  const [driverCardSynced, setDriverCardSynced] = useState(true);
  const [telematicsOnline, setTelematicsOnline] = useState(true);
  const [activeCard, setActiveCard] = useState<'DKV' | 'UTA'>('DKV');
  const fuelLevel = telemetry.fuelPct;
  const setFuelLevel = telemetry.setFuelPct;
  const remainingDriveMin = Math.round(telemetry.etaMinutes);
  const setRemainingDriveMin = telemetry.setBaseEtaMinutes;
  const [showTheftAlarm, setShowTheftAlarm] = useState(false);
  const [mapEngine, setMapEngine] = useState<MapEngineId>('trimble');
  const [trailerCoupled, setTrailerCoupled] = useState(true);
  const [stationaryRest, setStationaryRest] = useState(true);
  const lastFuelAtRest = useRef(18.4);
  const [audioMode, setAudioMode] = useState(false);
  const [waitStatuses, setWaitStatuses] = useState<Record<string, PumpWaitStatus>>(() =>
    Object.fromEntries(
      recommendedFuelStops.map((s) => [s.stationName, s.waitStatus ?? 'geen'])
    )
  );
  const [crowdFlash, setCrowdFlash] = useState<string | null>(null);
  const [signatureInfo, setSignatureInfo] = useState<{
    name: string;
    dataUrl: string;
  } | null>(null);
  const [damagePhotos, setDamagePhotos] = useState<DamagePhoto[]>([]);
  const [walkPhotos, setWalkPhotos] = useState<Partial<Record<WalkPoint, string>>>({});
  const [activeWalkPoint, setActiveWalkPoint] = useState<WalkPoint>('Voor');
  const [cameraSession, setCameraSession] = useState<CameraSession | null>(null);
  const [qualityToast, setQualityToast] = useState<string | null>(null);
  const [scannedTruckPlate, setScannedTruckPlate] = useState<string | null>(null);
  const [scannedTrailerPlate, setScannedTrailerPlate] = useState<string | null>(null);
  const [anprMismatch, setAnprMismatch] = useState(false);
  const [reeferTempC, setReeferTempC] = useState<number | null>(null);
  const [dashFuelPct, setDashFuelPct] = useState<number | null>(null);
  const [overrideNote, setOverrideNote] = useState<string | null>(null);
  const [overrideCount, setOverrideCount] = useState(0);
  const [showPechhulp, setShowPechhulp] = useState(false);
  const [altFuelFilter, setAltFuelFilter] = useState<AltFuelKind | 'Alle'>('Alle');
  const [showTips, setShowTips] = useState(false);
  const [showAltFuel, setShowAltFuel] = useState(false);
  const [breakdownLang, setBreakdownLang] = useState<'NL' | 'DE' | 'EN'>('NL');

  const selectedStop = altStops.find((s) => s.stationName === selectedStopId) ?? altStops[0];
  const nearReserve = fuelLevel <= RESERVE_PCT + 8;
  const selectedWait = waitStatuses[selectedStop?.stationName ?? ''] ?? 'geen';

  const nearbyParking = useMemo(
    () => emergencyParkingSpots.filter((p) => p.distanceKm <= 15).sort((a, b) => a.distanceKm - b.distanceKm),
    []
  );

  const filteredAltFuel = useMemo(
    () =>
      altFuelFilter === 'Alle'
        ? altFuelStations
        : altFuelStations.filter((s) => s.kind === altFuelFilter),
    [altFuelFilter]
  );

  useEffect(() => {
    const id = window.setInterval(() => {
      setEngineRpm(1050 + Math.round(Math.random() * 400));
      setPingMs(28 + Math.round(Math.random() * 40));
    }, 2500);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const action = new URLSearchParams(window.location.search).get('action');
    if (action === 'scan') {
      setCameraSession({
        guide: 'cmr',
        label: 'CMR',
        context: { kind: 'doc', docType: 'cmr' },
      });
    } else if (action === 'schade') {
      setShowDamagePicker(true);
    }
  }, []);

  useEffect(() => {
    if (nearReserve) setShowBufferWarning(true);
  }, [nearReserve]);

  useEffect(() => {
    if (stationaryRest && fuelLevel < lastFuelAtRest.current - 3) {
      setShowTheftAlarm(true);
    }
  }, [fuelLevel, stationaryRest]);

  const simulateFuelTheft = () => {
    setStationaryRest(true);
    setFuelLevel(Math.max(0, fuelLevel - 5));
  };

  const acknowledgeTheftAlarm = () => {
    lastFuelAtRest.current = fuelLevel;
    setShowTheftAlarm(false);
  };

  const selectAlternative = (stationName: string) => {
    setSelectedStopId(stationName);
    setNavActive(false);
  };

  const reportCrowd = (status: PumpWaitStatus) => {
    if (!selectedStop) return;
    setWaitStatuses((prev) => ({ ...prev, [selectedStop.stationName]: status }));
    setCrowdFlash(selectedStop.stationName);
    window.setTimeout(() => setCrowdFlash(null), 1500);
  };

  const applyAnpr = (kind: 'truck' | 'trailer', mismatch = false) => {
    if (kind === 'truck') {
      const plate = mismatch ? '99-XXX-1' : CMR_TRUCK_PLATE;
      setScannedTruckPlate(plate);
      const trailer = scannedTrailerPlate ?? CMR_TRAILER_PLATE;
      setAnprMismatch(plate !== CMR_TRUCK_PLATE || trailer !== CMR_TRAILER_PLATE);
    } else {
      const plate = mismatch ? 'ZZ-99-YY' : CMR_TRAILER_PLATE;
      setScannedTrailerPlate(plate);
      const truck = scannedTruckPlate ?? CMR_TRUCK_PLATE;
      setAnprMismatch(truck !== CMR_TRUCK_PLATE || plate !== CMR_TRAILER_PLATE);
    }
  };

  const openCamera = (session: CameraSession) => setCameraSession(session);

  const openSchadeFlow = () => setShowDamagePicker(true);

  const onDamageZoneConfirm = (zone: DamageZone, outline: VehicleOutline) => {
    setDamageZoneLabel(`${outline}: ${zone.label}`);
    setShowDamagePicker(false);
    openCamera({
      guide: 'schade',
      label: 'Schade',
      context: { kind: 'schade' },
    });
  };

  const onCameraAccepted = (dataUrl: string, quality: QualityResult) => {
    if (!cameraSession) return;
    const { context } = cameraSession;
    setQualityToast(
      `${quality.passMessage} · OCR ${quality.ocrConfidence}% · scherpte ${quality.sharpness}%`
    );
    window.setTimeout(() => setQualityToast(null), 3200);

    if (context.kind === 'walk') {
      setWalkPhotos((prev) => ({ ...prev, [context.point]: dataUrl }));
      setActiveWalkPoint(context.point);
      setShowWalkaround(true);
    } else if (context.kind === 'anpr') {
      applyAnpr(context.target, false);
      setShowAnpr(true);
    } else if (context.kind === 'doc') {
      setPreviewUrl(dataUrl);
      setShowUpload(true);
      setOcrStatus('✓ OCR geslaagd · metadata geëxtraheerd');
      setOcrResult({
        docType: context.docType,
        fileName: context.docType === 'cmr' ? 'cmr-scan.jpg' : 'tankbon-scan.jpg',
        stationName: selectedStop?.stationName ?? 'Autohof Lohfelden',
        liters: context.docType === 'cmr' ? 0 : 412.4,
        netPricePerL: context.docType === 'cmr' ? 0 : selectedStop?.netPricePerL ?? 1.582,
        vatDeEur: context.docType === 'cmr' ? 0 : 98.12,
        vatNlEur: 0,
      });
      if (context.docType === 'tankbon') {
        setFuelLevel(72);
        lastFuelAtRest.current = 72;
        setShowBufferWarning(false);
      }
      if (context.docType === 'cmr') setShowSignature(true);
    } else if (context.kind === 'focus') {
      if (context.target === 'fuel') {
        const pct = Math.max(quality.brightness, 18);
        setDashFuelPct(pct);
        setFuelLevel(pct);
        lastFuelAtRest.current = pct;
      } else if (context.target === 'reefer') {
        setReeferTempC(-18 + Math.round((100 - quality.sharpness) / 25));
      } else {
        setWalkPhotos((prev) => ({ ...prev, 'Slot/Zegel': dataUrl }));
        setShowWalkaround(true);
      }
      setShowGaugeOcr(true);
    } else if (context.kind === 'schade') {
      const zonePart = damageZoneLabel ? ` · ${damageZoneLabel}` : '';
      setDamagePhotos((prev) => [
        {
          dataUrl,
          fileName: 'schade-scan.jpg',
          linkedTo: `Route Kassel→München · e-CMR · Boekhouding${zonePart}`,
          at: new Date().toLocaleString('nl-NL'),
        },
        ...prev,
      ]);
      setShowDamage(true);
    }

    setCameraSession(null);
  };

  const unreadMessages = useMemo(
    () => [
      'Planner: Levervenster München verschoven naar 19:15.',
      'DKV: Tankstop Autohof bevestigd.',
    ],
    []
  );

  const openPechhulp = useCallback(() => setShowPechhulp(true), []);
  const openSignature = useCallback(() => setShowSignature(true), []);

  if (role === 'chauffeur') {
    return (
      <>
        <DriverCockpit
          lang={lang}
          nextStopName={selectedStop?.stationName ?? 'Autohof'}
          nextTurn="Blijf links · A7 richting München"
          unreadMessages={unreadMessages}
          onEmergency={openPechhulp}
          onOpenSignature={openSignature}
          onOpenBonScan={() =>
            setCameraSession({
              guide: 'tankbon',
              label: 'Bon / CMR foto',
              context: { kind: 'doc', docType: 'tankbon' },
            })
          }
          onOpenPreTrip={() => setShowPreTrip(true)}
          parkedChildren={
            <div className="space-y-3">
              <TelemetryStatusBar />
              <div className="fr-glass p-4 text-sm text-[var(--fr-text-muted)]">
                <p className="fr-display text-base mb-1">Gedetailleerde telemetrie</p>
                <p className="fr-mono text-xs">
                  RPM {telemetry.engineRpm} · Ping {pingMs} ms · Kaart {activeCard}
                </p>
                <p className="text-xs text-[#6b7a90] mt-1">
                  {gpsTrackingEnabled ? 'GPS online' : 'GPS uit'} ·{' '}
                  {offlineMode ? 'Offline buffer actief' : 'Online'}
                </p>
              </div>
            </div>
          }
        />

        {showPechhulp && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end md:items-center justify-center p-4">
            <div className="w-full max-w-lg fr-glass border border-[#ff3b30]/40 p-5 space-y-4 shadow-2xl">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <h3 className="fr-display text-lg text-[#ff8a82]">🆘 Pechhulp / Noodgeval</h3>
                  <p className="text-xs text-[var(--fr-text-muted)] mt-1">
                    Protocol actief · GPS gedeeld met planner {'&'} pechdienst
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPechhulp(false)}
                  className="text-[#9aa8bc] hover:text-white text-sm"
                >
                  Sluiten
                </button>
              </div>
              <div className="rounded-[12px] border border-[#1e2a3a] bg-[#050a0f] p-4">
                <p className="fr-label text-[#00a3ff]">GPS-positie</p>
                <p className="fr-mono text-xl font-bold text-[#f2f6fb] mt-1">51.312, 9.479</p>
              </div>
              <ActionButton variant="danger" className="w-full" onClick={() => setShowPechhulp(false)}>
                Bevestig pechmelding
              </ActionButton>
            </div>
          </div>
        )}

        {showSignature && (
          <SignatureModal
            title={tUi('ecmr_title')}
            subtitle={tUi('ecmr_subtitle')}
            contextLines={(() => {
              const cmr = getActiveCmr();
              if (!cmr) {
                return ['Geen CMR geladen — handtekening zonder vrachtgegevens.'];
              }
              return [
                `${cmr.cmrNumber} · ${cmr.origin} → ${cmr.destination}`,
                `${cmr.shipper} → ${cmr.consignee}`,
                `${cmr.goodsDescription} · ${cmr.grossWeightKg.toLocaleString('nl-NL')} kg`,
                `Kenteken ${cmr.truckPlate} / ${cmr.trailerPlate}`,
              ];
            })()}
            onClose={() => setShowSignature(false)}
            onSave={(dataUrl, signerName) => {
              setSignatureInfo({ name: signerName, dataUrl });
              setShowSignature(false);
            }}
          />
        )}

        {cameraSession && (
          <CameraCaptureModal
            guide={cameraSession.guide}
            subtitle={cameraSession.label}
            onClose={() => setCameraSession(null)}
            onAccepted={onCameraAccepted}
          />
        )}

        {showPreTrip && (
          <PreTripWalkaround open={showPreTrip} onClose={() => setShowPreTrip(false)} />
        )}
      </>
    );
  }

  return (
    <main className="max-w-5xl mx-auto p-4 space-y-5" style={{ background: '#0b0f19' }}>
      <DriveModeOverlay
        guidance={`Volgende stop: ${selectedStop?.stationName ?? 'Autohof'} · blijf op A7 · tankreserve ${fuelLevel.toFixed(0)}%.`}
      />

      <div className="bg-gradient-to-r from-sky-900/40 to-[#1e293b] border border-sky-500/30 rounded-2xl p-5 flex flex-col md:flex-row justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#38bdf8]">{t.activeRoute}</p>
          <h1 className="text-2xl font-black text-[#f8fafc] mt-1">Kassel ➔ München</h1>
          <p className="text-sm text-[#cbd5e1] mt-1">
            TRUCK-DE-101 · DAF XF 480 ({CMR_TRUCK_PLATE}) · Trailer {CMR_TRAILER_PLATE} · Kaart{' '}
            {activeCard}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {offlineMode && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/40">
                Offline Modus Actief — Routes {'&'} Adviezen Lokaal Opgeslagen
              </span>
            )}
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                gpsTrackingEnabled
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-700 text-slate-300 border-slate-600'
              }`}
            >
              GPS {gpsTrackingEnabled ? 'Aan' : 'Uit (AVG)'}
            </span>
          </div>
        </div>
        <div className="text-right space-y-2">
          <div className="flex items-center justify-end gap-2 flex-wrap">
            <label className="text-[11px] text-[#cbd5e1]">{t.language}</label>
            <select
              value={lang}
              onChange={(e) => setLangOverride(e.target.value as DriverLang)}
              className="bg-slate-900 border border-slate-600 rounded-lg px-2 py-1.5 text-xs font-bold text-[#f8fafc]"
            >
              {DRIVER_LANGS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <label className="inline-flex items-center gap-2 cursor-pointer text-[11px] text-[#cbd5e1]">
            <input
              type="checkbox"
              checked={audioMode}
              onChange={(e) => setAudioMode(e.target.checked)}
              className="w-4 h-4 accent-sky-500"
            />
            {t.audioMode}
          </label>
          <p className="text-xs text-[#cbd5e1]">{t.remainingDistance}</p>
          <p className="text-xl font-black text-[#f8fafc]">412 km</p>
          <p className="text-xs text-[#10b981] font-semibold">{t.eta} 16:40</p>
          {navActive && (
            <span className="inline-flex mt-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
              NAV → {selectedStop?.stationName}
              {audioMode ? ' · 🔊' : ''}
            </span>
          )}
        </div>
      </div>

      <RoleGate componentId="live_navigation_maps">
        <MapEngineSwitcher value={mapEngine} onChange={setMapEngine} />
      </RoleGate>

      <TelemetryStatusBar
        fuelPct={fuelLevel}
        tireWarn={fuelLevel < 15}
        rangeKm={Math.round(fuelLevel * 22)}
      />

      <ActionBar title="Trailer Drop & Swap">
        <ActionButton
          variant={trailerCoupled ? 'primary' : 'slate'}
          onClick={() => setTrailerCoupled(true)}
        >
          🔗 Koppelen · {CMR_TRAILER_PLATE}
        </ActionButton>
        <ActionButton
          variant={!trailerCoupled ? 'utility' : 'slate'}
          onClick={() => setTrailerCoupled(false)}
        >
          🔓 Ontkoppelen
        </ActionButton>
        <span
          className={`inline-flex items-center px-2.5 py-1.5 rounded-lg text-[11px] font-medium border ${
            trailerCoupled
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
              : 'bg-amber-950/30 text-amber-200 border-amber-500/25'
          }`}
        >
          Status: {trailerCoupled ? 'Gekoppeld' : 'Ontkoppeld / swap ready'} · nav via{' '}
          {mapEngine.toUpperCase()}
        </span>
      </ActionBar>

      <ActionBar title="Camera & AI-validatie">
        <ActionButton
          variant="primary"
          onClick={() =>
            openCamera({
              guide: 'cmr',
              label: 'CMR',
              context: { kind: 'doc', docType: 'cmr' },
            })
          }
        >
          📷 CMR Vrachtbrief Scannen
        </ActionButton>
        <ActionButton
          variant="secondary"
          className="w-full py-3"
          onClick={() =>
            openCamera({
              guide: 'anpr',
              label: 'ANPR truck',
              context: { kind: 'anpr', target: 'truck' },
            })
          }
        >
          📷 ANPR Kenteken Scannen
        </ActionButton>
        <RoleGate componentId="walkaround_forms">
          <ActionButton
            variant="primary"
            className="w-full py-3"
            onClick={() => {
              setShowPreTrip(true);
              scrollToId('walkaround-sectie');
            }}
          >
            ⏱ 30-sec Pre-Trip Check
          </ActionButton>
          <ActionButton
            variant="secondary"
            className="w-full py-3"
            onClick={() => {
              setShowWalkaround(true);
              openCamera({
                guide: 'walkaround',
                label: 'Walkaround',
                context: { kind: 'walk', point: activeWalkPoint },
              });
              scrollToId('walkaround-sectie');
            }}
          >
            📷 Walkaround 4-Hoeken
          </ActionButton>
        </RoleGate>
        <ActionButton
          variant="secondary"
          className="w-full py-3"
          onClick={() =>
            openCamera({
              guide: 'focus',
              label: 'Dashboard',
              context: { kind: 'focus', target: 'fuel' },
            })
          }
        >
          📷 Slot / Dashboard Focus
        </ActionButton>
      </ActionBar>

      <ActionBar title="Tachograaf & Welzijn">
        <ActionButton
          variant="primary"
          className="w-full py-3"
          onClick={() => {
            setDriverCardSynced(true);
            setTelematicsOnline(true);
          }}
        >
          ⏱ {t.tachoSync}
        </ActionButton>
        <ActionButton
          variant="utility"
          className="w-full"
          onClick={() => setRemainingDriveMin(84)}
        >
          🔄 Reset rijtijd (84m)
        </ActionButton>
        <RoleGate componentId="fuel_theft_alerts">
          <ActionButton variant="danger" className="w-full" onClick={simulateFuelTheft}>
            ⛽ {t.fuelTheftAlarm}
          </ActionButton>
        </RoleGate>
        <ActionButton
          variant="secondary"
          className="w-full"
          onClick={() => setAudioMode((v) => !v)}
        >
          🔊 Voice guidance {audioMode ? 'Aan' : 'Uit'}
        </ActionButton>
      </ActionBar>

      <div className="bg-gradient-to-r from-emerald-900/40 to-[#1e293b] border-2 border-emerald-500/40 rounded-2xl p-5 shadow-lg">
        <p className="text-xs font-bold uppercase tracking-wider text-[#10b981]">
          Digitale tachograaf
        </p>
        <p className="text-2xl sm:text-3xl font-black text-[#f8fafc] mt-2 leading-tight">
          {t.remainingDrive}: {formatDriveTime(remainingDriveMin)}{' '}
          <span className="text-lg sm:text-xl font-bold text-[#cbd5e1]">{t.requiredRest}</span>
        </p>
        {stationaryRest && (
          <p className="text-[11px] text-emerald-300 mt-2 font-semibold">
            Stilstand / rust actief · dieselsensoren bewaken tankniveau
          </p>
        )}
      </div>

      <ActionBar title="Veiligheid & community">
        <ActionButton
          variant="utility"
          className="w-full py-3"
          onClick={() => scrollToId('weer-waarschuwingen')}
        >
          🌬 Weer {'&'} Wind Waarschuwingen
        </ActionButton>
        <ActionButton
          variant="secondary"
          className="w-full"
          onClick={() => setShowTips((v) => !v)}
        >
          📌 Community Driver Tips
        </ActionButton>
        <ActionButton
          variant="danger"
          className="w-full"
          onClick={() => setShowPechhulp(true)}
        >
          🆘 Digitaal Schadeformulier {'&'} Pechhulp
        </ActionButton>
        <ActionButton
          variant="primary"
          className="w-full"
          onClick={() => setShowAltFuel((v) => !v)}
        >
          ⚡ EV / LNG / H2 Stations
        </ActionButton>
        <RoleGate componentId="fuel_theft_alerts">
          <ActionButton variant="danger" className="w-full" onClick={simulateFuelTheft}>
            ⛽ Simuleer Dieseldiefstal
          </ActionButton>
        </RoleGate>
      </ActionBar>

      <div
        id="weer-waarschuwingen"
        className="bg-[#1e293b] border border-sky-500/30 rounded-2xl p-4 space-y-3"
      >
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-[#f8fafc]">🌬 Weer {'&'} Wind Waarschuwingen</h3>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#38bdf8]">
            Audio / visueel
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {weatherAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`min-w-[220px] flex-1 rounded-xl border px-3 py-2.5 ${
                alert.severity === 'hoog'
                  ? 'border-red-500/40 bg-red-500/10'
                  : alert.severity === 'middel'
                    ? 'border-amber-500/40 bg-amber-500/10'
                    : 'border-sky-500/30 bg-sky-500/10'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p
                  className={`text-xs font-bold ${
                    alert.severity === 'hoog'
                      ? 'text-red-300'
                      : alert.severity === 'middel'
                        ? 'text-amber-300'
                        : 'text-[#38bdf8]'
                  }`}
                >
                  {alert.type}
                </p>
                {alert.audio && (
                  <span className="text-[10px] font-bold text-[#f8fafc]">🔊 Audio</span>
                )}
              </div>
              <p className="text-[11px] text-[#cbd5e1] mt-1">{alert.message}</p>
            </div>
          ))}
        </div>
      </div>

      {showTips && (
        <div className="bg-[#1e293b] border border-blue-500/30 rounded-2xl p-4 space-y-3">
          <h3 className="text-sm font-bold text-[#f8fafc]">📌 Community Driver Tips</h3>
          <ul className="space-y-2">
            {communityDriverTips.map((tip) => (
              <li
                key={tip.id}
                className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5"
              >
                <p className="text-xs font-bold text-[#38bdf8]">{tip.address}</p>
                <p className="text-sm text-[#f8fafc] mt-0.5">{tip.tip}</p>
                <p className="text-[11px] text-[#cbd5e1] mt-1">— {tip.author}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showAltFuel && (
        <div className="bg-[#1e293b] border border-emerald-500/30 rounded-2xl p-4 space-y-3">
          <h3 className="text-sm font-bold text-[#f8fafc]">⚡ EV / LNG / H2 Stations</h3>
          <div className="flex flex-wrap gap-2">
            {ALT_FUEL_FILTERS.map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() => setAltFuelFilter(kind)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition ${
                  altFuelFilter === kind
                    ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-300'
                    : 'border-slate-600 bg-slate-900 text-[#cbd5e1] hover:border-slate-500'
                }`}
              >
                {kind}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredAltFuel.length === 0 ? (
              <p className="text-xs text-[#cbd5e1] col-span-full">
                Geen stations voor filter “{altFuelFilter}”. Probeer Alle of LNG / Waterstof /
                Elektrisch.
              </p>
            ) : (
              filteredAltFuel.map((station) => (
                <div
                  key={station.id}
                  className="rounded-xl border border-slate-700 bg-slate-900 p-3 flex justify-between gap-2"
                >
                  <div>
                    <p className="text-sm font-bold text-[#f8fafc]">{station.name}</p>
                    <p className="text-[11px] text-[#cbd5e1]">
                      {station.highway} · +{station.detourMin} min
                    </p>
                  </div>
                  <span className="shrink-0 self-start px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-500/40 bg-emerald-500/10 text-emerald-300">
                    {station.kind}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {qualityToast && (
        <div className="rounded-xl border-2 border-emerald-500/50 bg-emerald-500/15 px-4 py-3 text-sm font-bold text-emerald-300">
          ✓ AKKOORD — {qualityToast}
        </div>
      )}

      <ActionBar title={t.actionBar}>
        <ActionButton variant="danger" className="w-full" onClick={() => setShowEmergency(true)}>
          🚨 {t.emergencyParking}
        </ActionButton>
        <ActionButton
          variant="utility"
          className="w-full"
          onClick={() => {
            const idx = altStops.findIndex((s) => s.stationName === selectedStopId);
            const next = altStops[(idx + 1) % altStops.length];
            if (!next) return;
            selectAlternative(next.stationName);
            setOverrideCount((c) => c + 1);
            setOverrideNote(
              `Route aangepast / Wijk af: ${next.stationName} · geen penalty-score`
            );
          }}
        >
          🔀 Route Aanpassen / Wijk Af
        </ActionButton>
        <ActionButton
          variant="primary"
          className="w-full"
          onClick={() =>
            openCamera({
              guide: 'tankbon',
              label: 'Tankbon',
              context: { kind: 'doc', docType: 'tankbon' },
            })
          }
        >
          📷 {t.uploadReceipt}
        </ActionButton>
        <ActionButton variant="secondary" className="w-full" onClick={openSchadeFlow}>
          🛠️ {t.damagePhoto}
        </ActionButton>
      </ActionBar>

      <ActionBar title="Inspectie & OCR">
        <ActionButton variant="primary" className="w-full" onClick={() => setShowGaugeOcr(true)}>
          🌡️ Reefer {'&'} Brandstofmeter OCR
        </ActionButton>
        <ActionButton variant="secondary" className="w-full" onClick={() => setShowAnpr(true)}>
          📷 ANPR Kenteken-Match
        </ActionButton>
        <ActionButton variant="utility" className="w-full" onClick={() => setShowSignature(true)}>
          ✍️ {t.eCmrSign}
        </ActionButton>
        <ActionButton
          variant="slate"
          className="w-full"
          onClick={() => setSimulatedSpeedKmh(simulatedSpeedKmh > 10 ? 0 : 68)}
        >
          🚗 Drive Mode {simulatedSpeedKmh > 10 ? 'Uit' : 'Aan (>10 km/h)'}
        </ActionButton>
      </ActionBar>

      <ActionBar title="Extra acties">
        <ActionButton
          variant="secondary"
          className="w-full"
          onClick={() => {
            setTelematicsOnline(true);
            setDriverCardSynced(true);
            setOfflineMode(false);
          }}
        >
          📡 {t.syncTelematics}
        </ActionButton>
        <ActionButton
          variant="utility"
          className="w-full"
          onClick={() => setOfflineMode(!offlineMode)}
        >
          📦 {offlineMode ? 'Online Hervatten' : 'Offline Cache Activeren'}
        </ActionButton>
        <RoleGate componentId="walkaround_forms">
          <ActionButton
            variant="slate"
            className="w-full"
            onClick={() => {
              setShowWalkaround(true);
              scrollToId('walkaround-sectie');
            }}
          >
            🔍 Walkaround Overzicht
          </ActionButton>
        </RoleGate>
        <RoleGate componentId="live_navigation_maps">
          <ActionButton
            variant="primary"
            className="w-full"
            onClick={() => {
              setActiveCard((c) => (c === 'DKV' ? 'UTA' : 'DKV'));
              setNavActive(true);
            }}
          >
            🗺️ {t.startNav} / {t.switchCard}
          </ActionButton>
        </RoleGate>
      </ActionBar>

      {overrideNote && (
        <div className="rounded-xl border border-sky-500/40 bg-sky-500/10 px-4 py-3 text-sm font-semibold text-[#38bdf8]">
          {overrideNote} · overrides zonder penalty: {overrideCount}
        </div>
      )}

      {cameraSession && (
        <CameraCaptureModal
          guide={cameraSession.guide}
          subtitle={cameraSession.label}
          onClose={() => setCameraSession(null)}
          onAccepted={onCameraAccepted}
        />
      )}

      {nearReserve && (
        <button
          type="button"
          onClick={() => setShowBufferWarning(true)}
          className="w-full h-12 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold border-2 border-amber-400/40 shadow-lg"
        >
          ⚠ {t.bufferWarn} — ≤{RESERVE_PCT}%
        </button>
      )}

      {(signatureInfo || damagePhotos.length > 0) && (
        <div className="bg-[#1e293b] border border-emerald-500/30 rounded-2xl p-4 space-y-2 text-sm">
          {signatureInfo && (
            <p className="text-[#10b981] font-semibold">
              ✓ e-CMR ondertekend door {signatureInfo.name} · gekoppeld aan route {'&'} boekhouding
            </p>
          )}
          {damagePhotos.length > 0 && (
            <p className="text-amber-300 font-semibold">
              {damagePhotos.length} schadefoto(s) gekoppeld aan actieve rit / e-CMR / boekhouding
            </p>
          )}
        </div>
      )}

      <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-[#f8fafc]">{t.waitStatus}</h3>
          <span
            className={`self-start px-3 py-1 rounded-full text-[11px] font-bold border ${waitClass(selectedWait)}`}
          >
            {waitLabel(selectedWait, t)}
          </span>
        </div>
        <p className="text-xs text-[#cbd5e1]">
          {selectedStop?.stationName} · live status
          {crowdFlash === selectedStop?.stationName ? ' · update verzonden ✓' : ''}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <ActionButton variant="primary" className="w-full !h-12" onClick={() => reportCrowd('geen')}>
            {t.noWait}
          </ActionButton>
          <ActionButton variant="utility" className="w-full !h-12" onClick={() => reportCrowd('druk')}>
            {t.busy}
          </ActionButton>
          <ActionButton variant="danger" className="w-full !h-12" onClick={() => reportCrowd('storing')}>
            {t.pumpFault}
          </ActionButton>
        </div>
        <p className="text-[11px] text-[#cbd5e1]">{t.crowdUpdate}</p>
      </div>

      <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900 rounded-xl border border-slate-700 p-3">
          <p className="text-[11px] text-[#cbd5e1]">Boordcomputer Status</p>
          <p className={`text-sm font-bold ${telematicsOnline ? 'text-[#10b981]' : 'text-amber-400'}`}>
            {telematicsOnline ? 'Gekoppeld' : 'Verslechterd'}
          </p>
        </div>
        <div className="bg-slate-900 rounded-xl border border-slate-700 p-3">
          <p className="text-[11px] text-[#cbd5e1]">Motor RPM Sync</p>
          <p className="text-sm font-bold text-[#f8fafc]">{engineRpm} tpm</p>
        </div>
        <div className="bg-slate-900 rounded-xl border border-slate-700 p-3">
          <p className="text-[11px] text-[#cbd5e1]">OBD2-signaal</p>
          <p className="text-sm font-bold text-[#38bdf8]">{pingMs} ms</p>
        </div>
        <div className="bg-slate-900 rounded-xl border border-slate-700 p-3">
          <p className="text-[11px] text-[#cbd5e1]">Digitale chauffeurskaart</p>
          <p className={`text-sm font-bold ${driverCardSynced ? 'text-[#10b981]' : 'text-red-400'}`}>
            {driverCardSynced ? 'Gesynchroniseerd' : 'Niet gesynchroniseerd'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#1e293b] border border-amber-500/40 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#f8fafc]">{t.fuelLevel}</h2>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
              Waarschuwing Reserve Tank
            </span>
          </div>
          <FuelGauge level={fuelLevel} />
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-center">
            <p className="text-sm font-bold text-amber-300">
              {fuelLevel.toFixed(1)}% — actie vereist bij ≤{RESERVE_PCT}% reserve
            </p>
          </div>
        </div>

        <div className="bg-[#1e293b] border border-[#10b981]/40 rounded-2xl p-5 space-y-4 flex flex-col">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#10b981]">{t.nextStop}</p>
            <h2 className="text-xl font-black text-[#f8fafc] mt-1">
              {selectedStop?.stationName ?? '—'}
            </h2>
            <p className="text-xs text-[#cbd5e1] mt-1">{selectedStop?.locationHighway}</p>
            <span
              className={`inline-flex mt-2 px-2.5 py-1 rounded-full text-[11px] font-bold border ${waitClass(selectedWait)}`}
            >
              {waitLabel(selectedWait, t)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900 rounded-xl border border-slate-700 p-3">
              <span className="text-[11px] text-[#cbd5e1] block">Nettoprijs</span>
              <span className="text-lg font-black text-[#38bdf8]">
                € {(selectedStop?.netPricePerL ?? 0).toFixed(3)} / L
              </span>
            </div>
            <div className="bg-slate-900 rounded-xl border border-slate-700 p-3">
              <span className="text-[11px] text-[#cbd5e1] block">Omrijdtijd</span>
              <span className="text-lg font-black text-[#f8fafc]">
                +{(selectedStop?.detourMinutes ?? 0).toFixed(1)} min
              </span>
            </div>
            <div className="bg-slate-900 rounded-xl border border-slate-700 p-3">
              <span className="text-[11px] text-[#cbd5e1] block">Adviesvolume</span>
              <span className="text-lg font-black text-[#f8fafc]">
                {selectedStop?.recommendedVolumeL ?? 0} L
              </span>
            </div>
            <div className="bg-slate-900 rounded-xl border border-slate-700 p-3">
              <span className="text-[11px] text-[#cbd5e1] block">Besparing</span>
              <span className="text-lg font-black text-[#10b981]">
                € {(selectedStop?.savingsEur ?? 0).toFixed(2)}
              </span>
            </div>
          </div>

          <ActionButton variant="primary" className="w-full" onClick={() => setNavActive(true)}>
            {t.startNav}
          </ActionButton>
        </div>
      </div>

      <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-4 space-y-3">
        <h3 className="text-sm font-bold text-[#f8fafc]">{t.altStop}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {altStops.map((stop) => {
            const active = stop.stationName === selectedStopId;
            const ws = waitStatuses[stop.stationName] ?? 'geen';
            return (
              <button
                key={stop.stationName}
                type="button"
                onClick={() => selectAlternative(stop.stationName)}
                className={`text-left p-3 rounded-xl border transition ${
                  active
                    ? 'border-emerald-400/50 bg-emerald-500/10'
                    : 'border-slate-700 bg-slate-900 hover:border-slate-500'
                }`}
              >
                <div className="flex justify-between gap-2">
                  <p className="text-sm font-bold text-[#f8fafc]">{stop.stationName}</p>
                  <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold border ${waitClass(ws)}`}>
                    {waitLabel(ws, t)}
                  </span>
                </div>
                <p className="text-[11px] text-[#cbd5e1]">
                  €{stop.netPricePerL.toFixed(3)} · +{stop.detourMinutes} min · €
                  {stop.savingsEur.toFixed(2)}
                  {stop.adrCompliant ? ' · ADR' : ''}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div id="walkaround-sectie" className="sr-only" aria-hidden />

      <RoleGate componentId="walkaround_forms">
        <PreTripWalkaround open={showPreTrip} onClose={() => setShowPreTrip(false)} />
      </RoleGate>

      {showWalkaround && (
        <RoleGate componentId="walkaround_forms">
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#1e293b] border-2 border-slate-600 rounded-2xl p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start gap-3">
              <div>
                <h3 className="text-lg font-bold text-[#f8fafc]">4-Hoeken Walkaround Check</h3>
                <p className="text-xs text-[#cbd5e1]">
                  Visuele inspectie · schadeclaims {'&'} ladingzekering (Slot/Zegel)
                </p>
              </div>
              <button type="button" onClick={() => setShowWalkaround(false)} className="text-[#cbd5e1] text-sm">
                Sluiten
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {WALKAROUND_POINTS.map((point) => (
                <button
                  key={point}
                  type="button"
                  onClick={() => {
                    setActiveWalkPoint(point);
                    openCamera({
                      guide: point === 'Slot/Zegel' ? 'focus' : 'walkaround',
                      label: point,
                      context:
                        point === 'Slot/Zegel'
                          ? { kind: 'focus', target: 'slot' }
                          : { kind: 'walk', point },
                    });
                  }}
                  className={`rounded-xl border p-3 text-left transition ${
                    walkPhotos[point]
                      ? 'border-emerald-500/40 bg-emerald-500/10'
                      : activeWalkPoint === point
                        ? 'border-sky-500/40 bg-sky-500/10'
                        : 'border-slate-700 bg-slate-900'
                  }`}
                >
                  <p className="text-xs font-bold text-[#f8fafc]">{point}</p>
                  <p className="text-[10px] text-[#cbd5e1] mt-1">
                    {walkPhotos[point] ? '✓ Foto goedgekeurd' : '📷 Camera + AI-check'}
                  </p>
                </button>
              ))}
            </div>
            {walkPhotos[activeWalkPoint] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={walkPhotos[activeWalkPoint]}
                alt={`Inspectie ${activeWalkPoint}`}
                className="w-full h-36 object-cover rounded-xl border border-slate-600"
              />
            )}
            <p className="text-xs text-[#cbd5e1]">
              {Object.keys(walkPhotos).length}/{WALKAROUND_POINTS.length} hoeken vastgelegd ·
              gekoppeld aan schadeclaim {'&'} e-CMR
            </p>
            <ActionButton variant="primary" className="w-full" onClick={() => setShowWalkaround(false)}>
              Inspectie Afronden
            </ActionButton>
          </div>
        </div>
        </RoleGate>
      )}

      {showAnpr && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#1e293b] border-2 border-slate-600 rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-start gap-3">
              <div>
                <h3 className="text-lg font-bold text-[#f8fafc]">ANPR Kenteken-Match</h3>
                <p className="text-xs text-[#cbd5e1]">
                  Truck + trailer vs CMR-vrachtbrief ({CMR_TRUCK_PLATE} / {CMR_TRAILER_PLATE})
                </p>
              </div>
              <button type="button" onClick={() => setShowAnpr(false)} className="text-[#cbd5e1] text-sm">
                Sluiten
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <ActionButton
                variant="primary"
                className="w-full"
                onClick={() =>
                  openCamera({
                    guide: 'anpr',
                    label: 'Truckkenteken',
                    context: { kind: 'anpr', target: 'truck' },
                  })
                }
              >
                📷 Scan Truckkenteken
              </ActionButton>
              <ActionButton
                variant="secondary"
                className="w-full"
                onClick={() =>
                  openCamera({
                    guide: 'anpr',
                    label: 'Trailerkenteken',
                    context: { kind: 'anpr', target: 'trailer' },
                  })
                }
              >
                📷 Scan Trailerkenteken
              </ActionButton>
              <ActionButton
                variant="utility"
                className="w-full sm:col-span-2"
                onClick={() => applyAnpr('truck', true)}
              >
                Simuleer Mismatch-alert
              </ActionButton>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#cbd5e1]">Truck (scan)</span>
                <span className="font-mono font-bold text-[#f8fafc]">
                  {scannedTruckPlate ?? '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#cbd5e1]">Trailer (scan)</span>
                <span className="font-mono font-bold text-[#f8fafc]">
                  {scannedTrailerPlate ?? '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#cbd5e1]">CMR-match</span>
                {(scannedTruckPlate || scannedTrailerPlate) && (
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                      anprMismatch
                        ? 'bg-red-500/20 text-red-300 border-red-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    {anprMismatch ? '⚠ MISMATCH met CMR' : '✓ Match met CMR'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showGaugeOcr && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#1e293b] border-2 border-slate-600 rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-start gap-3">
              <div>
                <h3 className="text-lg font-bold text-[#f8fafc]">Reefer {'&'} Brandstofmeter OCR</h3>
                <p className="text-xs text-[#cbd5e1]">Dashboard diesel + koeltrailer °C</p>
              </div>
              <button type="button" onClick={() => setShowGaugeOcr(false)} className="text-[#cbd5e1] text-sm">
                Sluiten
              </button>
            </div>
            <ActionButton
              variant="primary"
              className="w-full"
              onClick={() =>
                openCamera({
                  guide: 'focus',
                  label: 'Brandstofmeter',
                  context: { kind: 'focus', target: 'fuel' },
                })
              }
            >
              📷 Foto Dashboard Brandstofmeter
            </ActionButton>
            <ActionButton
              variant="secondary"
              className="w-full"
              onClick={() =>
                openCamera({
                  guide: 'focus',
                  label: 'Koeltrailer °C',
                  context: { kind: 'focus', target: 'reefer' },
                })
              }
            >
              📷 Foto Koeltrailer Temperatuur
            </ActionButton>
            <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[11px] text-[#cbd5e1]">Diesel (OCR)</p>
                <p className="text-xl font-black text-[#38bdf8]">
                  {dashFuelPct != null ? `${dashFuelPct}%` : '—'}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#cbd5e1]">Reefer °C (OCR)</p>
                <p className="text-xl font-black text-emerald-300">
                  {reeferTempC != null ? `${reeferTempC} °C` : '—'}
                </p>
              </div>
            </div>
            <ActionButton variant="slate" className="w-full" onClick={() => setShowGaugeOcr(false)}>
              Bevestigen
            </ActionButton>
          </div>
        </div>
      )}

      {showEmergency && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#1e293b] border-2 border-red-500/50 rounded-2xl p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start gap-3">
              <div>
                <h3 className="text-lg font-black text-red-300">🚨 {t.emergencyParking}</h3>
                <p className="text-xs text-[#cbd5e1]">
                  Alternatieve truckspots binnen 15 km · industrie, partner, secure hubs
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowEmergency(false)}
                className="text-[#cbd5e1] hover:text-white text-sm"
              >
                Sluiten
              </button>
            </div>
            <div className="space-y-2">
              {nearbyParking.map((spot) => (
                <div
                  key={spot.id}
                  className="rounded-xl border border-slate-600 bg-slate-900 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-bold text-[#f8fafc]">{spot.name}</p>
                    <p className="text-[11px] text-[#cbd5e1]">
                      {spot.type} · {spot.distanceKm.toFixed(1)} km · {spot.freeSpots} vrije plekken
                      {spot.secure ? ' · 🔒 Secure' : ''}
                      {spot.adrOk ? ' · ADR OK' : ' · Geen ADR'}
                    </p>
                  </div>
                  <ActionButton
                    variant="danger"
                    className="!h-11 shrink-0"
                    onClick={() => {
                      setNavActive(true);
                      setShowEmergency(false);
                    }}
                  >
                    Navigeer
                  </ActionButton>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showPechhulp && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end md:items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#1e293b] border-2 border-red-500/50 rounded-2xl p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start gap-3">
              <div>
                <h3 className="text-lg font-black text-red-300">
                  🆘 Digitaal Schadeformulier {'&'} Pechhulp
                </h3>
                <p className="text-xs text-[#cbd5e1]">
                  Locatie delen · pechhulp via DKV / UTA · taalbreakdown
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPechhulp(false)}
                className="text-[#cbd5e1] hover:text-white text-sm"
              >
                Sluiten
              </button>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#38bdf8]">
                GPS-positie
              </p>
              <p className="text-xl font-mono font-black text-[#f8fafc]">51.312, 9.479</p>
              <p className="text-[11px] text-[#cbd5e1]">Kassel Hub · A7 corridor</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-[#f8fafc]">Taal pechmelding / breakdown</p>
              <div className="flex flex-wrap gap-2">
                {(['NL', 'DE', 'EN'] as const).map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setBreakdownLang(code)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border ${
                      breakdownLang === code
                        ? 'border-sky-400/50 bg-sky-500/20 text-[#38bdf8]'
                        : 'border-slate-600 bg-slate-900 text-[#cbd5e1]'
                    }`}
                  >
                    {code}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-[#cbd5e1]">
                {breakdownLang === 'NL' &&
                  'Pechhulp aangevraagd · Nederlandse melding naar centrale.'}
                {breakdownLang === 'DE' &&
                  'Pannenhilfe angefordert · deutsche Meldung an Zentrale.'}
                {breakdownLang === 'EN' &&
                  'Breakdown assistance requested · English alert to dispatch.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <ActionButton
                variant="danger"
                className="w-full"
                onClick={() => {
                  setActiveCard('DKV');
                  setShowPechhulp(false);
                }}
              >
                🆘 DKV Pechhulp
              </ActionButton>
              <ActionButton
                variant="utility"
                className="w-full"
                onClick={() => {
                  setActiveCard('UTA');
                  setShowPechhulp(false);
                }}
              >
                🆘 UTA Pechhulp
              </ActionButton>
            </div>

            <ActionButton
              variant="secondary"
              className="w-full"
              onClick={() => {
                setShowPechhulp(false);
                openSchadeFlow();
              }}
            >
              📷 Digitaal Schadeformulier
            </ActionButton>
          </div>
        </div>
      )}

      {showSignature && (
        <SignatureModal
          title={t.eCmrSign}
          subtitle="Digitale handtekening ontvanger · gekoppeld aan e-CMR, route en boekhouding"
          onClose={() => setShowSignature(false)}
          onSave={(dataUrl, signerName) => {
            setSignatureInfo({ name: signerName, dataUrl });
            setShowSignature(false);
          }}
        />
      )}

      {showDamagePicker && (
        <VehicleDamagePicker
          onConfirm={onDamageZoneConfirm}
          onClose={() => setShowDamagePicker(false)}
        />
      )}

      {showDamage && damagePhotos[0] && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#1e293b] border-2 border-amber-500/40 rounded-2xl p-5 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-amber-300">{t.damagePhoto}</h3>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={damagePhotos[0].dataUrl}
              alt="Schadefoto"
              className="w-full h-40 object-cover rounded-xl border border-slate-600"
            />
            <p className="text-xs text-[#cbd5e1]">
              Gekoppeld aan: {damagePhotos[0].linkedTo}
              <br />
              {damagePhotos[0].at} · {damagePhotos[0].fileName}
            </p>
            <ActionButton variant="primary" className="w-full" onClick={() => setShowDamage(false)}>
              Bevestigen
            </ActionButton>
          </div>
        </div>
      )}

      {showTheftAlarm && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#1e293b] border-2 border-red-500/60 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="rounded-xl border-2 border-red-500/50 bg-red-500/15 p-4 space-y-2">
              <p className="text-sm font-black text-red-300 uppercase tracking-wider">AFGEKEURD</p>
              <h3 className="text-xl font-black text-red-200">{t.fuelTheftAlarm}</h3>
              <p className="text-sm text-[#f8fafc]">
                Dieseldiefstal Sensoren {'&'} Tankdop Alarm — onverwachte brandstofdaling tijdens
                stilstand ({fuelLevel.toFixed(1)}% nu, was {lastFuelAtRest.current.toFixed(1)}%).
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <ActionButton variant="primary" className="w-full" onClick={acknowledgeTheftAlarm}>
                Acknowledge
              </ActionButton>
              <ActionButton
                variant="danger"
                className="w-full"
                onClick={() => {
                  acknowledgeTheftAlarm();
                  setShowPechhulp(true);
                }}
              >
                Call security
              </ActionButton>
            </div>
          </div>
        </div>
      )}

      {showBufferWarning && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#1e293b] border-2 border-amber-500/50 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-xl font-black text-amber-300">{t.bufferWarn}</h3>
            <p className="text-sm text-[#cbd5e1]">
              Actieve tank ({fuelLevel.toFixed(1)}%) nadert de veiligheidsreserve van {RESERVE_PCT}%.
            </p>
            <div className="grid grid-cols-1 gap-2">
              <ActionButton
                variant="primary"
                className="w-full"
                onClick={() => {
                  setShowBufferWarning(false);
                  setNavActive(true);
                }}
              >
                {t.startNav}
              </ActionButton>
              <ActionButton
                variant="danger"
                className="w-full"
                onClick={() => {
                  setShowBufferWarning(false);
                  setShowEmergency(true);
                }}
              >
                🚨 {t.emergencyParking}
              </ActionButton>
              <ActionButton
                variant="slate"
                className="w-full"
                onClick={() => setShowBufferWarning(false)}
              >
                Later Herinneren
              </ActionButton>
            </div>
          </div>
        </div>
      )}

      {showUpload && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end md:items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#1e293b] border border-slate-600 rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-[#f8fafc]">{t.uploadReceipt}</h3>
                <p className="text-xs text-[#cbd5e1]">Uploaden of scannen — Automatische OCR-Herkenning</p>
              </div>
              <button
                type="button"
                onClick={() => setShowUpload(false)}
                className="text-[#cbd5e1] hover:text-white text-sm"
              >
                Sluiten
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <ActionButton
                variant="primary"
                className="w-full"
                onClick={() =>
                  openCamera({
                    guide: 'cmr',
                    label: 'CMR',
                    context: { kind: 'doc', docType: 'cmr' },
                  })
                }
              >
                📷 CMR met kader + AI
              </ActionButton>
              <ActionButton
                variant="secondary"
                className="w-full"
                onClick={() =>
                  openCamera({
                    guide: 'tankbon',
                    label: 'Tankbon',
                    context: { kind: 'doc', docType: 'tankbon' },
                  })
                }
              >
                📷 Tankbon met kader + AI
              </ActionButton>
            </div>

            {previewUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Voorbeeld van geüpload document"
                className="w-full h-36 object-cover rounded-lg border border-slate-700"
              />
            )}

            <p className="text-xs font-semibold text-[#10b981]">{ocrStatus}</p>

            {ocrResult && (
              <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#cbd5e1]">Documenttype</span>
                  <span className="text-[#f8fafc] font-bold uppercase">{ocrResult.docType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#cbd5e1]">Tankstation</span>
                  <span className="text-[#f8fafc] font-bold">{ocrResult.stationName}</span>
                </div>
                {ocrResult.docType === 'tankbon' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-[#cbd5e1]">Gedetecteerde Liters</span>
                      <span className="text-[#38bdf8] font-bold">{ocrResult.liters} L</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#cbd5e1]">Btw-Splitsing (DE/NL)</span>
                      <span className="text-[#10b981] font-bold">
                        €{ocrResult.vatDeEur.toFixed(2)} / €{ocrResult.vatNlEur.toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
                {ocrResult.docType === 'cmr' && (
                  <ActionButton
                    variant="utility"
                    className="w-full mt-2"
                    onClick={() => {
                      setShowUpload(false);
                      setShowSignature(true);
                    }}
                  >
                    ✍️ {t.eCmrSign}
                  </ActionButton>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
