'use client';

import { useEffect, useMemo, useState } from 'react';
import { ActionBar, ActionButton } from '@/components/ActionBar';
import { CameraCaptureModal } from '@/components/CameraCaptureModal';
import { GloveboxModal } from '@/components/GloveboxModal';
import { useLanguage } from '@/components/LanguageProvider';
import { useUi } from '@/components/useUi';
import { RangeSlider } from '@/components/RangeSlider';
import { RoleGate } from '@/components/RoleGate';
import { TollCalculator } from '@/components/TollCalculator';
import { scrollToId } from '@/lib/access';
import {
  calculateAdvancedRoute,
  calculateCo2Barometer,
  calculateTotalRouteCost,
  calculateZzpMargin,
  filterAndScaleStops,
  formatDriveTime,
  type FuelKind,
  type Topography,
} from '@/lib/calculations';
import { applyCmrToPlannerFields, getActiveCmr, type CmrShipment } from '@/lib/cmr-store';
import {
  borderWaitTimes,
  cardArbitrageRules,
  eetsTollRates,
  expenseDeclarations,
  parkingSecurity,
  recommendedFuelStops,
  synchronizedRestStops,
} from '@/lib/mock-data';
import type { CaptureGuide } from '@/lib/photo-quality';

const FUEL_CARDS = ['DKV', 'UTA', 'Shell', 'BP', 'Esso'] as const;

export function PlannerTripTools() {
  const { t } = useLanguage();
  const ui = useUi();
  const [origin, setOrigin] = useState('Kassel Hub (DE)');
  const [destination, setDestination] = useState('München Distribution (DE)');
  const [emptyWeightT, setEmptyWeightT] = useState(15);
  const [loadedWeightT, setLoadedWeightT] = useState(40);
  const [coolingTrailer, setCoolingTrailer] = useState(true);
  const [fuelType, setFuelType] = useState<FuelKind>('Diesel');
  const [headwindPct, setHeadwindPct] = useState(12);
  const [topography, setTopography] = useState<Topography>('heuvelachtig');
  const [maxDetourMinutes, setMaxDetourMinutes] = useState(6);
  const [selectedCards, setSelectedCards] = useState<string[]>(['DKV', 'UTA', 'Shell']);
  const [calcFlash, setCalcFlash] = useState(false);
  const [freightPriceEur, setFreightPriceEur] = useState(1200);
  const [showGlovebox, setShowGlovebox] = useState(false);
  const [expenses, setExpenses] = useState(expenseDeclarations);
  const [cameraGuide, setCameraGuide] = useState<CaptureGuide | null>(null);
  const [zzpFlash, setZzpFlash] = useState(false);
  const [remainingDriveMin, setRemainingDriveMin] = useState(84);
  const [syncRest, setSyncRest] = useState(true);
  const [tachoFlash, setTachoFlash] = useState(false);
  const [costFlash, setCostFlash] = useState(false);
  const [borderFlash, setBorderFlash] = useState(false);
  const [maxDetourKm, setMaxDetourKm] = useState(8);
  const [minSavingsPerL, setMinSavingsPerL] = useState(0.15);
  const [tachoSynced, setTachoSynced] = useState(false);
  const [navFlash, setNavFlash] = useState<string | null>(null);

  const [maxHeightM, setMaxHeightM] = useState(4.0);
  const [axleLoadT, setAxleLoadT] = useState(11.5);
  const [truckWidthM, setTruckWidthM] = useState(2.55);
  const [truckLengthM, setTruckLengthM] = useState(16.5);
  const [adrCargo, setAdrCargo] = useState(false);
  const [enabledRules, setEnabledRules] = useState<string[]>(() =>
    cardArbitrageRules.filter((r) => r.enabledDefault).map((r) => r.id)
  );
  const [cmrFlash, setCmrFlash] = useState<string | null>(null);

  const applyCmr = (cmr: CmrShipment) => {
    const fields = applyCmrToPlannerFields(cmr);
    setOrigin(fields.origin);
    setDestination(fields.destination);
    setEmptyWeightT(fields.emptyWeightT);
    setLoadedWeightT(fields.loadedWeightT);
    setAdrCargo(fields.adrCargo);
    setFreightPriceEur(fields.freightHint);
    setCalcFlash(true);
    window.setTimeout(() => setCalcFlash(false), 1200);
    setCmrFlash(
      `CMR ${cmr.cmrNumber} toegepast · ${cmr.grossWeightKg.toLocaleString('nl-NL')} kg · ${cmr.goodsDescription}`
    );
    window.setTimeout(() => setCmrFlash(null), 4000);
  };

  useEffect(() => {
    const existing = getActiveCmr();
    if (!existing) return;
    const fields = applyCmrToPlannerFields(existing);
    setOrigin(fields.origin);
    setDestination(fields.destination);
    setEmptyWeightT(fields.emptyWeightT);
    setLoadedWeightT(fields.loadedWeightT);
    setAdrCargo(fields.adrCargo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargoWeight = Math.max(0, loadedWeightT - emptyWeightT);

  const summary = useMemo(
    () =>
      calculateAdvancedRoute({
        origin,
        destination,
        emptyWeightT,
        loadedWeightT,
        coolingTrailer,
        fuelType,
        headwindPct,
        topography,
        selectedCards,
        maxDetourMinutes,
      }),
    [
      origin,
      destination,
      emptyWeightT,
      loadedWeightT,
      coolingTrailer,
      fuelType,
      headwindPct,
      topography,
      selectedCards,
      maxDetourMinutes,
    ]
  );

  const stops = useMemo(
    () =>
      filterAndScaleStops(
        recommendedFuelStops,
        selectedCards,
        cargoWeight,
        summary.estimatedUsageL,
        {
          adrOnly: adrCargo,
          maxTruckHeightM: maxHeightM,
          maxDetourMinutes,
        }
      ).filter((stop) => {
        const detourKm = stop.detourMinutes * 0.8;
        if (detourKm > maxDetourKm) return false;
        // Alleen stops met voldoende netto-voordeel t.o.v. drempel
        const impliedSavingPerL = stop.savingsEur / Math.max(stop.recommendedVolumeL, 1);
        return impliedSavingPerL >= minSavingsPerL * 0.35 || stop.savingsEur >= 8;
      }),
    [
      selectedCards,
      cargoWeight,
      summary.estimatedUsageL,
      maxDetourMinutes,
      adrCargo,
      maxHeightM,
      maxDetourKm,
      minSavingsPerL,
    ]
  );

  const co2 = useMemo(
    () =>
      calculateCo2Barometer({
        distanceKm: summary.distanceKm,
        cargoTons: Math.max(cargoWeight, 1),
        usageL: summary.estimatedUsageL,
      }),
    [summary.distanceKm, cargoWeight, summary.estimatedUsageL]
  );

  const { fuelCostEur, mautEur, margin } = useMemo(() => {
    const fuelCostEur = summary.estimatedUsageL * 1.58;
    const mautEur = summary.extraMautEur;
    const margin = calculateZzpMargin({
      freightPriceEur,
      distanceKm: summary.distanceKm,
      fuelCostEur,
      mautEur,
    });
    return { fuelCostEur, mautEur, margin };
  }, [freightPriceEur, summary.distanceKm, summary.estimatedUsageL, summary.extraMautEur]);

  const borderIdleLiters = useMemo(
    () =>
      borderWaitTimes.reduce(
        (sum, b) => sum + (b.waitMinutes / 60) * b.idleFuelLPerH,
        0
      ),
    []
  );

  const routeCost = useMemo(
    () =>
      calculateTotalRouteCost({
        usageL: summary.estimatedUsageL,
        distanceKm: summary.distanceKm,
        detourKmCostEur: summary.extraKmCostEur,
        borderIdleLiters,
      }),
    [summary.estimatedUsageL, summary.distanceKm, summary.extraKmCostEur, borderIdleLiters]
  );

  useEffect(() => {
    const id = window.setInterval(() => {
      setRemainingDriveMin((m) => (m > 0 ? m - 1 : 0));
    }, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const activeRuleCount = enabledRules.length;
  const estimatedSurcharge =
    cardArbitrageRules
      .filter((r) => enabledRules.includes(r.id))
      .reduce((s, r) => s + r.surchargePerL, 0) * 100;

  const toggleCard = (card: string) => {
    setSelectedCards((prev) =>
      prev.includes(card) ? prev.filter((c) => c !== card) : [...prev, card]
    );
  };

  const toggleRule = (id: string) => {
    setEnabledRules((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const runCalc = () => {
    setCalcFlash(true);
    window.setTimeout(() => setCalcFlash(false), 1200);
  };

  const flashZzp = () => {
    setZzpFlash(true);
    window.setTimeout(() => setZzpFlash(false), 1200);
  };

  const syncTacho = () => {
    setRemainingDriveMin(84);
    setTachoSynced(true);
    setTachoFlash(true);
    window.setTimeout(() => setTachoFlash(false), 2500);
  };

  const flashCosts = () => {
    setCostFlash(true);
    window.setTimeout(() => setCostFlash(false), 1200);
  };

  const flashBorders = () => {
    setBorderFlash(true);
    window.setTimeout(() => setBorderFlash(false), 1200);
  };

  return (
    <div className="space-y-6">
        <div className="bg-[#1e293b] p-5 rounded-2xl border border-slate-700 flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-[#38bdf8]">{ui('tab_tools')}</h2>
            <p className="text-sm text-[#cbd5e1]">{ui('planner_subtitle')}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              runCalc();
              scrollToId('route-samenvatting');
            }}
            className="self-start text-xs font-bold px-4 py-2.5 rounded-[10px] bg-[#00a3ff] text-white border border-[#00a3ff] shadow-[0_0_16px_rgba(0,163,255,0.35)] hover:bg-[#007aff] touch-manipulation"
          >
            {ui('planner_recalc')}
          </button>
        </div>

        <RoleGate componentId="financial_margins">
        <ActionBar title={ui('zzp_title')}>
          <ActionButton
            variant="primary"
            className="w-full py-3"
            onClick={() => {
              flashZzp();
              scrollToId('marge-planner-sectie');
            }}
          >
            {ui('margin_calc')}
          </ActionButton>
          <ActionButton
            variant="secondary"
            className="w-full py-3"
            onClick={() => setShowGlovebox(true)}
          >
            {t('glovebox_open')}
          </ActionButton>
          <ActionButton
            variant="primary"
            className="w-full py-3"
            onClick={() => scrollToId('route-samenvatting')}
          >
            {ui('load_cmr')}
          </ActionButton>
          <ActionButton
            variant="utility"
            className="w-full py-3"
            onClick={() => setCameraGuide('tankbon')}
          >
            🧾 {ui('expenses')}
          </ActionButton>
          <ActionButton
            variant="slate"
            className="w-full py-3"
            onClick={() => setFreightPriceEur(1200)}
          >
            {ui('freight_price_preset')}
          </ActionButton>
        </ActionBar>
        </RoleGate>

        <ActionBar title={ui('tacho_eets')}>
          <ActionButton variant="primary" className="w-full py-3" onClick={syncTacho}>
            ⏱ {ui('live_tacho')}
          </ActionButton>
          <RoleGate componentId="maut_tol_matrix">
            <ActionButton
              variant="secondary"
              className="w-full py-3"
              onClick={() => {
                flashCosts();
                scrollToId('maut-matrix-sectie');
              }}
            >
              🛣 {ui('route_cost_matrix')}
            </ActionButton>
            <ActionButton
              variant="utility"
              className="w-full py-3"
              onClick={() => scrollToId('toll-calculator')}
            >
              💶 {ui('maut_calculator')}
            </ActionButton>
          </RoleGate>
          <ActionButton
            variant="utility"
            className="w-full py-3"
            onClick={() => {
              flashBorders();
              scrollToId('border-wait-sectie');
            }}
          >
            🛂 {ui('border_waits')}
          </ActionButton>
          <ActionButton
            variant="slate"
            className="w-full py-3"
            onClick={() => setSyncRest((v) => !v)}
          >
            {ui('combined_rest')}
          </ActionButton>
        </ActionBar>

        <ActionBar title={ui('primary_actions')}>
          <ActionButton variant="primary" onClick={runCalc} className="w-full">
            ⚡ {ui('calc_liters')}
          </ActionButton>
          <ActionButton
            variant="secondary"
            className="w-full"
            onClick={() => {
              setOrigin('Antwerpen Port (BE)');
              setDestination('Duisburg Hub (DE)');
            }}
          >
            🗺️ {ui('load_corridor')}
          </ActionButton>
          <ActionButton
            variant="utility"
            className="w-full"
            onClick={() => setMaxDetourMinutes(4)}
          >
            ⏱️ {ui('strict_detour')}
          </ActionButton>
          <ActionButton
            variant="slate"
            className="w-full"
            onClick={() => setSelectedCards(['DKV', 'UTA', 'Shell', 'BP', 'Esso'])}
          >
            💳 {ui('all_cards')}
          </ActionButton>
        </ActionBar>

        {calcFlash && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300">
            {ui('calc_updated')} €{summary.netSavingsEur.toFixed(2)}
            {adrCargo ? ' · ADR' : ''}
          </div>
        )}

        <RoleGate componentId="financial_margins">
        <div
          id="marge-planner-sectie"
          className={`bg-[#1e293b] p-6 rounded-2xl border space-y-4 transition-colors ${
            zzpFlash ? 'border-emerald-500/60 ring-2 ring-emerald-500/30' : 'border-slate-700'
          }`}
        >
          <h2 className="text-sm font-bold text-[#f8fafc] uppercase tracking-wider">
            {ui('margin_calc')}
          </h2>
          <p className="text-xs text-[#cbd5e1]">{ui('margin_hint')}</p>
          <div className="max-w-xs">
            <label className="block text-xs text-[#cbd5e1] mb-1">{ui('freight_price')}</label>
            <input
              type="number"
              min={0}
              step={10}
              value={freightPriceEur}
              onChange={(e) => setFreightPriceEur(Number(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-sm text-[#f8fafc]"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="rounded-xl bg-slate-900/70 border border-slate-600 px-3 py-3">
              <p className="text-[11px] text-[#cbd5e1]">{ui('net_margin')}</p>
              <p
                className={`text-lg font-black ${
                  margin.netMarginEur >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                €{margin.netMarginEur.toFixed(2)}
              </p>
            </div>
            <div className="rounded-xl bg-slate-900/70 border border-slate-600 px-3 py-3">
              <p className="text-[11px] text-[#cbd5e1]">{ui('label_fuel')}</p>
              <p className="text-lg font-bold text-[#f8fafc]">€{fuelCostEur.toFixed(2)}</p>
            </div>
            <div className="rounded-xl bg-slate-900/70 border border-slate-600 px-3 py-3">
              <p className="text-[11px] text-[#cbd5e1]">{ui('label_maut')}</p>
              <p className="text-lg font-bold text-[#f8fafc]">€{mautEur.toFixed(2)}</p>
            </div>
            <div className="rounded-xl bg-slate-900/70 border border-slate-600 px-3 py-3">
              <p className="text-[11px] text-[#cbd5e1]">{ui('label_depreciation')}</p>
              <p className="text-lg font-bold text-[#f8fafc]">
                €{margin.depreciationEur.toFixed(2)}
              </p>
            </div>
            <div className="rounded-xl bg-slate-900/70 border border-slate-600 px-3 py-3">
              <p className="text-[11px] text-[#cbd5e1]">{ui('label_margin_pct')}</p>
              <p
                className={`text-lg font-black ${
                  margin.marginPct >= 0 ? 'text-[#38bdf8]' : 'text-red-400'
                }`}
              >
                {margin.marginPct.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
        </RoleGate>

        <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-700 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-[#f8fafc] uppercase tracking-wider">
                {ui('expenses')}
              </h2>
              <p className="text-xs text-[#cbd5e1] mt-1">{ui('expenses_hint')}</p>
            </div>
            <ActionButton
              variant="utility"
              className="w-full sm:w-auto py-3"
              onClick={() => setCameraGuide('tankbon')}
            >
              📷 {ui('scan_receipt')}
            </ActionButton>
          </div>
          <ul className="space-y-2">
            {expenses.map((ex) => (
              <li
                key={ex.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-slate-600 bg-slate-900/50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-[#f8fafc]">
                    {ex.type} · €{ex.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-[#cbd5e1]">
                    {ex.note} · {ex.date}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {cameraGuide && (
          <CameraCaptureModal
            guide={cameraGuide}
            subtitle={ui('expenses_hint')}
            onClose={() => setCameraGuide(null)}
            onAccepted={(_dataUrl, quality) => {
              const type = expenses.length % 2 === 0 ? 'Maaltijd' : 'Tol';
              const amount =
                type === 'Maaltijd'
                  ? Math.round((12 + (quality.ocrConfidence % 10)) * 10) / 10
                  : Math.round((35 + (quality.ocrConfidence % 20)) * 10) / 10;
              setExpenses((prev) => [
                {
                  id: `ex-${Date.now()}`,
                  type,
                  amount,
                  note: `Camera-scan (${cameraGuide}) · OCR ${quality.ocrConfidence}%`,
                  date: new Date().toISOString().slice(0, 10),
                },
                ...prev,
              ]);
              setCameraGuide(null);
            }}
          />
        )}

        <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-700 space-y-5">
          <h2 className="text-sm font-bold text-[#f8fafc] uppercase tracking-wider">
            {ui('route_input')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#cbd5e1] mb-1">{ui('origin')}</label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-sm text-[#f8fafc]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#cbd5e1] mb-1">{ui('destination')}</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-sm text-[#f8fafc]"
              />
            </div>
          </div>

          <h3 className="text-xs font-bold text-[#38bdf8] uppercase tracking-wider pt-2">
            {ui('vehicle_cargo')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-[#cbd5e1] mb-1">{ui('empty_weight')}</label>
              <input
                type="number"
                min={8}
                max={25}
                value={emptyWeightT}
                onChange={(e) => setEmptyWeightT(Number(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-sm text-[#f8fafc]"
              />
              <p className="text-[11px] text-[#cbd5e1] mt-1">bijv. 15t</p>
            </div>
            <div>
              <label className="block text-xs text-[#cbd5e1] mb-1">{ui('loaded_weight')}</label>
              <input
                type="number"
                min={10}
                max={44}
                value={loadedWeightT}
                onChange={(e) => setLoadedWeightT(Number(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-sm text-[#f8fafc]"
              />
              <p className="text-[11px] text-[#cbd5e1] mt-1">bijv. 40t · lading {cargoWeight}t</p>
            </div>
            <div>
              <label className="block text-xs text-[#cbd5e1] mb-1">{ui('fuel_type')}</label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value as FuelKind)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-sm text-[#f8fafc]"
              >
                <option value="Diesel">Diesel</option>
                <option value="AdBlue">AdBlue (+verbruik)</option>
                <option value="HVO100">HVO100</option>
              </select>
            </div>
          </div>

          <h3 className="text-xs font-bold text-[#38bdf8] uppercase tracking-wider pt-2">
            {ui('truck_routing')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-[#cbd5e1] mb-1">{ui('max_height')}</label>
              <input
                type="number"
                step={0.1}
                min={3.5}
                max={4.5}
                value={maxHeightM}
                onChange={(e) => setMaxHeightM(Number(e.target.value) || 4)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-sm text-[#f8fafc]"
              />
              <p className="text-[11px] text-[#cbd5e1] mt-1">Vermijd lage bruggen</p>
            </div>
            <div>
              <label className="block text-xs text-[#cbd5e1] mb-1">{ui('axle_limit')}</label>
              <input
                type="number"
                step={0.1}
                min={8}
                max={12}
                value={axleLoadT}
                onChange={(e) => setAxleLoadT(Number(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-sm text-[#f8fafc]"
              />
              <p className="text-[11px] text-[#cbd5e1] mt-1">Gewichtbeperkte wegen</p>
            </div>
            <div>
              <label className="block text-xs text-[#cbd5e1] mb-1">{ui('width')}</label>
              <input
                type="number"
                step={0.01}
                min={2.0}
                max={2.6}
                value={truckWidthM}
                onChange={(e) => setTruckWidthM(Number(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-sm text-[#f8fafc]"
              />
              <p className="text-[11px] text-[#cbd5e1] mt-1">Smalle dorpen</p>
            </div>
            <div>
              <label className="block text-xs text-[#cbd5e1] mb-1">{ui('length')}</label>
              <input
                type="number"
                step={0.1}
                min={10}
                max={18.75}
                value={truckLengthM}
                onChange={(e) => setTruckLengthM(Number(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-sm text-[#f8fafc]"
              />
              <p className="text-[11px] text-[#cbd5e1] mt-1">Draaicirkel / tunnels</p>
            </div>
          </div>
          <p className="text-xs text-[#cbd5e1] bg-slate-900 border border-slate-700 rounded-xl px-4 py-3">
            Routeparameters: {maxHeightM.toFixed(1)} m × {truckWidthM.toFixed(2)} m ×{' '}
            {truckLengthM.toFixed(1)} m · asbelasting ≤ {axleLoadT.toFixed(1)} t — lage bruggen,
            gewichtsbeperkingen en smalle dorpen worden vermeden.
          </p>

          <label className="flex items-start gap-3 cursor-pointer text-sm text-[#f8fafc] bg-amber-500/10 border-2 border-amber-500/50 rounded-xl px-4 py-4">
            <input
              type="checkbox"
              checked={adrCargo}
              onChange={(e) => setAdrCargo(e.target.checked)}
              className="w-5 h-5 mt-0.5 accent-amber-500"
            />
            <span>
              <span className="font-bold block">{ui('adr_cargo')}</span>
              <span className="text-xs text-[#cbd5e1]">
                Filtert verboden tunnels/eco-zones en toont alleen ADR-conforme tankstations &
                parkeerplaatsen
              </span>
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer text-sm text-[#cbd5e1] bg-slate-900 border border-slate-700 rounded-xl px-4 py-3">
            <input
              type="checkbox"
              checked={coolingTrailer}
              onChange={(e) => setCoolingTrailer(e.target.checked)}
              className="w-4 h-4 accent-emerald-500"
            />
            {ui('reefer_active')} (+extra diesel ±2,8 L/100km)
          </label>

          <h3 className="text-xs font-bold text-[#38bdf8] uppercase tracking-wider pt-2">
            Omgeving {'&'} Weer
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <RangeSlider
              id="headwind"
              label={`Windeffect · +${Math.round(headwindPct * 0.2)}% verbruik`}
              value={headwindPct}
              min={0}
              max={100}
              unit="%"
              accent="#f59e0b"
              onChange={setHeadwindPct}
            />
            <div>
              <label className="block text-xs text-[#cbd5e1] mb-1">Topografie</label>
              <select
                value={topography}
                onChange={(e) => setTopography(e.target.value as Topography)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-sm text-[#f8fafc]"
              >
                <option value="vlak">Vlak</option>
                <option value="heuvelachtig">Heuvelachtig</option>
                <option value="alpen">Alpen / bergachtig</option>
              </select>
            </div>
            <RangeSlider
              id="max-detour-min"
              label="Maximale Omrijdtijd"
              value={maxDetourMinutes}
              min={1}
              max={20}
              unit="min"
              accent="#818cf8"
              onChange={setMaxDetourMinutes}
            />
          </div>

          <div className="rounded-xl border border-slate-700/60 bg-slate-900/50 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  Dynamische Omrijd-Drempel
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  Max. {maxDetourKm} km omrijden voor ≥ €{minSavingsPerL.toFixed(2)}/L besparing
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RangeSlider
                id="max-detour-km"
                label="Max. omrijkm"
                value={maxDetourKm}
                min={2}
                max={25}
                unit="km"
                accent="#34d399"
                onChange={setMaxDetourKm}
              />
              <RangeSlider
                id="min-savings-l"
                label="Min. brandstofvoordeel"
                value={Math.round(minSavingsPerL * 100)}
                min={5}
                max={30}
                accent="#818cf8"
                formatValue={(v) => `€ ${(v / 100).toFixed(2)}/L`}
                onChange={(v) => setMinSavingsPerL(v / 100)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#cbd5e1] mb-2">Geactiveerde Tankkaarten</label>
            <div className="flex flex-wrap gap-2">
              {FUEL_CARDS.map((card) => {
                const active = selectedCards.includes(card);
                return (
                  <button
                    key={card}
                    type="button"
                    onClick={() => toggleCard(card)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold border transition ${
                      active
                        ? 'bg-blue-600 text-white border-blue-400/40'
                        : 'bg-slate-900 text-[#cbd5e1] border-slate-600'
                    }`}
                  >
                    {card}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-[#1e293b] p-5 rounded-2xl border border-slate-700 space-y-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-[#f8fafc] uppercase tracking-wider">
                Tankkaart Netto-Prijs Arbitrage
              </h2>
              <p className="text-xs text-[#cbd5e1]">
                Shell DE vs DKV FR fee-structuren · minimale litertoeslagen
              </p>
            </div>
            <span className="text-xs font-mono text-amber-300">
              {activeRuleCount} regels actief · ~€{(estimatedSurcharge / 100).toFixed(3)}/L toeslag
            </span>
          </div>
          <div className="space-y-2">
            {cardArbitrageRules.map((rule) => {
              const on = enabledRules.includes(rule.id);
              return (
                <label
                  key={rule.id}
                  className={`flex items-start gap-3 cursor-pointer rounded-xl border px-4 py-3 transition ${
                    on
                      ? 'border-amber-500/40 bg-amber-500/10'
                      : 'border-slate-700 bg-slate-900'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => toggleRule(rule.id)}
                    className="w-4 h-4 mt-1 accent-amber-500"
                  />
                  <span className="flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-[#f8fafc]">
                        {rule.card} {rule.country}
                      </span>
                      <span className="text-[11px] font-mono text-[#38bdf8]">
                        min. {rule.minLiters} L
                      </span>
                      {rule.surchargePerL > 0 && (
                        <span className="text-[11px] font-mono text-amber-300">
                          +€{rule.surchargePerL.toFixed(3)}/L
                        </span>
                      )}
                    </span>
                    <span className="block text-xs text-[#cbd5e1] mt-0.5">{rule.note}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <div id="route-samenvatting" className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-700">
            <span className="text-xs text-[#cbd5e1]">{ui('total_distance')}</span>
            <p className="text-2xl font-black text-[#f8fafc] mt-1">{summary.distanceKm} km</p>
          </div>
          <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-700">
            <span className="text-xs text-[#cbd5e1]">{ui('estimated_usage')}</span>
            <p className="text-2xl font-black text-[#38bdf8] mt-1">{summary.estimatedUsageL} L</p>
            <p className="text-[11px] text-[#cbd5e1] mt-1">{summary.consumptionRate} L/100km</p>
          </div>
          <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-700">
            <span className="text-xs text-[#cbd5e1]">{ui('fuel_advantage')}</span>
            <p className="text-2xl font-black text-emerald-400 mt-1">
              €{summary.fuelAdvantageEur.toFixed(2)}
            </p>
          </div>
          <div className="bg-[#1e293b] p-5 rounded-xl border border-emerald-500/40">
            <span className="text-xs text-[#cbd5e1]">{ui('net_savings')}</span>
            <p className="text-2xl font-black text-[#10b981] mt-1">
              €{summary.netSavingsEur.toFixed(2)}
            </p>
          </div>
        </div>

        <div
          className={`bg-[#1e293b] p-5 rounded-2xl border space-y-3 transition-colors ${
            tachoFlash ? 'border-emerald-500/60 ring-2 ring-emerald-500/30' : 'border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-sm font-bold text-[#f8fafc] uppercase tracking-wider">
              {ui('live_tacho_title')}
            </h2>
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#c5d0e0] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={tachoSynced}
                onChange={(e) => {
                  if (e.target.checked) syncTacho();
                  else setTachoSynced(false);
                }}
                className="w-5 h-5 rounded border-[#1e2a3a] accent-[#00a3ff]"
              />
              {ui('tacho_synced_label')}
            </label>
          </div>
          <p className="text-lg font-black text-[#38bdf8]">
            {ui('remaining_drive')}: {formatDriveTime(remainingDriveMin)}
          </p>
          <p className="text-xs text-[#cbd5e1]">
            Na de dagelijkse rijtijd geldt 9u verkorte of 11u reguliere dagelijkse rust (EG
            561/2006). Sync reset naar 1u 24m.
          </p>
          {tachoFlash && (
            <div className="rounded-[10px] border border-[#28a745]/40 bg-[#28a745]/10 px-3 py-2 text-xs font-bold text-[#86efac]">
              ✓ {ui('tacho_synced_label')} · {formatDriveTime(remainingDriveMin)}
            </div>
          )}
          <ActionButton variant="primary" className="w-full sm:w-auto py-3" onClick={syncTacho}>
            ⏱ {ui('live_tacho')}
          </ActionButton>
        </div>

        <RoleGate componentId="maut_tol_matrix">
          <TollCalculator defaultDistanceKm={summary.distanceKm} />
        </RoleGate>

        <RoleGate componentId="maut_tol_matrix">
        <div
          id="maut-matrix-sectie"
          className={`bg-[#1e293b] p-5 rounded-2xl border space-y-3 transition-colors ${
            costFlash ? 'border-blue-500/60 ring-2 ring-blue-500/30' : 'border-slate-700'
          }`}
        >
          <h2 className="text-sm font-bold text-[#f8fafc] uppercase tracking-wider">
            {ui('route_cost_matrix')}
          </h2>
          <p className="text-sm text-[#cbd5e1] font-mono bg-slate-900 border border-slate-700 rounded-xl p-4">
            Totale Routekosten = Brandstofkosten + EETS Tol/Maut (DE, FR, BE) + Omrijkm-Kosten
          </p>
          <p className="text-[11px] text-[#cbd5e1]">
            Tarieven:{' '}
            {eetsTollRates.map((r) => `${r.country} €${r.ratePerKm}/km`).join(' · ')}
            {' · '}incl. stationair brandstof aan grens ({borderIdleLiters.toFixed(1)} L)
          </p>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-sm">
            <div className="rounded-lg bg-slate-900 border border-slate-700 p-3">
              <span className="text-[11px] text-[#cbd5e1] block">{ui('label_fuel')}</span>
              <span className="font-bold text-[#f8fafc]">€ {routeCost.fuelCostEur.toFixed(2)}</span>
            </div>
            <div className="rounded-lg bg-slate-900 border border-slate-700 p-3">
              <span className="text-[11px] text-[#cbd5e1] block">EETS DE</span>
              <span className="font-bold text-amber-300">€ {routeCost.eetsDe.toFixed(2)}</span>
            </div>
            <div className="rounded-lg bg-slate-900 border border-slate-700 p-3">
              <span className="text-[11px] text-[#cbd5e1] block">EETS FR</span>
              <span className="font-bold text-amber-300">€ {routeCost.eetsFr.toFixed(2)}</span>
            </div>
            <div className="rounded-lg bg-slate-900 border border-slate-700 p-3">
              <span className="text-[11px] text-[#cbd5e1] block">EETS BE</span>
              <span className="font-bold text-amber-300">€ {routeCost.eetsBe.toFixed(2)}</span>
            </div>
            <div className="rounded-lg bg-slate-900 border border-slate-700 p-3">
              <span className="text-[11px] text-[#cbd5e1] block">Omrijkm</span>
              <span className="font-bold text-red-300">
                € {routeCost.detourKmCostEur.toFixed(2)}
              </span>
            </div>
            <div className="rounded-lg bg-slate-900 border border-emerald-500/40 p-3">
              <span className="text-[11px] text-[#cbd5e1] block">Totaal</span>
              <span className="font-black text-[#10b981]">€ {routeCost.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        </RoleGate>

        <div
          id="border-wait-sectie"
          className={`bg-[#1e293b] p-5 rounded-2xl border space-y-3 transition-colors ${
            borderFlash ? 'border-amber-500/60 ring-2 ring-amber-500/30' : 'border-slate-700'
          }`}
        >
          <h2 className="text-sm font-bold text-[#f8fafc] uppercase tracking-wider">
            {ui('border_waits')}
          </h2>
          <p className="text-xs text-[#cbd5e1]">
            Idle-brandstofkosten bij stationair draaien tijdens wachttijd (€1,58/L)
          </p>
          <div className="flex flex-wrap gap-2">
            {borderWaitTimes.map((b) => {
              const idleL = (b.waitMinutes / 60) * b.idleFuelLPerH;
              const idleEur = idleL * 1.58;
              const severityClass =
                b.severity === 'hoog'
                  ? 'border-red-500/40 bg-red-500/10 text-red-300'
                  : b.severity === 'middel'
                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                    : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300';
              return (
                <span
                  key={b.id}
                  className={`inline-flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 px-3 py-2 rounded-xl border text-xs font-semibold ${severityClass}`}
                >
                  <span className="font-bold">{b.crossing}</span>
                  <span className="font-mono opacity-90">
                    {b.waitMinutes} min · ~{idleL.toFixed(1)} L · €{idleEur.toFixed(2)}
                  </span>
                </span>
              );
            })}
          </div>
        </div>

        <RoleGate componentId="csrd_co2">
        <div
          id="csrd-planner-sectie"
          className="bg-[#1e293b] p-5 rounded-2xl border border-slate-700/60 space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-[#f8fafc] uppercase tracking-wider">
                CO₂ / ESG CSRD Scope 3 Barometer
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Interactieve g CO₂/ton-km vs. typische snelwegcorridor
              </p>
            </div>
            <span className="text-[11px] font-mono text-emerald-300">
              −{co2.savingsPct}% · −{co2.savedGPerTonKm} g/ton-km
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="rounded-lg bg-slate-900/80 border border-slate-700/60 p-3">
              <span className="text-[11px] text-slate-400 block">Route intensiteit</span>
              <span className="font-bold text-slate-100">{co2.gPerTonKm} g/ton-km</span>
            </div>
            <div className="rounded-lg bg-slate-900/80 border border-slate-700/60 p-3">
              <span className="text-[11px] text-slate-400 block">Bespaard</span>
              <span className="font-bold text-emerald-300">{co2.savedKg} kg CO₂</span>
            </div>
            <div className="rounded-lg bg-slate-900/80 border border-slate-700/60 p-3">
              <span className="text-[11px] text-slate-400 block">Route-uitstoot</span>
              <span className="font-bold text-slate-200">{co2.routeKg} kg</span>
            </div>
            <div className="rounded-lg bg-slate-900/80 border border-slate-700/60 p-3">
              <span className="text-[11px] text-slate-400 block">{ui('map_engine')}</span>
              <span className="font-bold text-indigo-300">HERE / PTV</span>
            </div>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-700/50">
            <div
              className="h-full bg-gradient-to-r from-emerald-700/80 to-emerald-400/70"
              style={{ width: `${Math.min(100, co2.savingsPct * 4)}%` }}
            />
          </div>
        </div>
        </RoleGate>

        <div className="bg-[#1e293b] p-5 rounded-2xl border border-slate-700/60 space-y-3">
          <h2 className="text-sm font-bold text-[#f8fafc] uppercase tracking-wider">
            Rustplaats Security Rating (ESPORG)
          </h2>
          <p className="text-xs text-slate-400">
            Brons · Zilver · Goud · Platinum gecertificeerde truckparkeerplaatsen
          </p>
          <div className="flex flex-wrap gap-2">
            {parkingSecurity.map((p) => {
              const levelNl =
                p.esporgLevel === 'Platinum'
                  ? 'Platinum'
                  : p.esporgLevel === 'Gold'
                    ? 'Goud'
                    : p.esporgLevel === 'Silver'
                      ? 'Zilver'
                      : 'Brons';
              const tierClass =
                p.esporgLevel === 'Platinum'
                  ? 'border-violet-500/35 bg-violet-950/30 text-violet-200'
                  : p.esporgLevel === 'Gold'
                    ? 'border-amber-500/30 bg-amber-950/25 text-amber-200'
                    : p.esporgLevel === 'Silver'
                      ? 'border-slate-400/30 bg-slate-800/50 text-slate-200'
                      : 'border-orange-500/25 bg-orange-950/20 text-orange-200/90';
              return (
                <span
                  key={p.id}
                  className={`inline-flex flex-col px-3 py-2 rounded-lg border text-[11px] ${tierClass}`}
                >
                  <span className="font-semibold">{p.name}</span>
                  <span className="opacity-80">ESPORG {levelNl}</span>
                </span>
              );
            })}
          </div>
        </div>

        {syncRest && (
          <div className="bg-[#1e293b] p-5 rounded-2xl border border-slate-700 space-y-3">
            <h2 className="text-sm font-bold text-[#f8fafc] uppercase tracking-wider">
              Gesynchroniseerde Stopplanning
            </h2>
            <p className="text-xs text-[#cbd5e1]">
              Tankbeurt + 45 min tachograafrust + dagelijkse rustoptie (EG 561/2006)
            </p>
            <ul className="space-y-2">
              {synchronizedRestStops.map((stop) => (
                <li
                  key={stop.stationName}
                  className="rounded-xl border border-slate-600 bg-slate-900/50 px-4 py-3"
                >
                  <p className="text-sm font-semibold text-[#f8fafc]">{stop.stationName}</p>
                  <p className="text-xs text-[#cbd5e1] mt-1">
                    Tankbeurt {stop.fuelLiters} L · {stop.restType} · {stop.dailyRestOption}
                  </p>
                  <p className="text-[11px] text-[#38bdf8] mt-0.5">{stop.regulation}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <RoleGate componentId="maut_tol_matrix">
        <div
          id="maut-formule-sectie"
          className="bg-[#1e293b] p-5 rounded-2xl border border-slate-700 space-y-2"
        >
          <h2 className="text-sm font-bold text-[#f8fafc]">Maut {'&'} Netto Besparing Formule</h2>
          <p className="text-sm text-[#cbd5e1] font-mono bg-slate-900 border border-slate-700 rounded-xl p-4">
            Netto Besparing = Brandstofvoordeel − (Extra KM + Extra Maut/Tol)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg bg-slate-900 border border-slate-700 p-3">
              <span className="text-[11px] text-[#cbd5e1] block">Brandstofvoordeel</span>
              <span className="font-bold text-[#10b981]">€ {summary.fuelAdvantageEur.toFixed(2)}</span>
            </div>
            <div className="rounded-lg bg-slate-900 border border-slate-700 p-3">
              <span className="text-[11px] text-[#cbd5e1] block">Extra KM-kosten</span>
              <span className="font-bold text-amber-300">€ {summary.extraKmCostEur.toFixed(2)}</span>
            </div>
            <div className="rounded-lg bg-slate-900 border border-slate-700 p-3">
              <span className="text-[11px] text-[#cbd5e1] block">Extra Maut/Tol (indicatief)</span>
              <span className="font-bold text-red-300">€ {summary.extraMautEur.toFixed(2)}</span>
            </div>
          </div>
        </div>
        </RoleGate>

        <div className="bg-[#1e293b] rounded-2xl border border-slate-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-[#f8fafc]">Aanbevolen Tankstops</h2>
              {navFlash && (
                <div className="mt-2 rounded-[10px] border border-[#28a745]/40 bg-[#28a745]/10 px-3 py-2 text-xs font-bold text-[#86efac]">
                  {navFlash}
                </div>
              )}
              <p className="text-xs text-[#cbd5e1]">
                Gefilterd op kaarten, omrijdtijd {maxDetourMinutes} min, hoogte ≥ {maxHeightM} m
                {adrCargo ? ' · alleen ADR-conform' : ''}
              </p>
            </div>
            <span className="text-xs font-mono text-[#38bdf8]">{stops.length} stops</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-900/60 text-[#cbd5e1] text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3">Stationsnaam</th>
                  <th className="px-4 py-3">Locatie / Snelweg</th>
                  <th className="px-4 py-3">Nettoprijs / L</th>
                  <th className="px-4 py-3">ADR / Doorrijd</th>
                  <th className="px-4 py-3">Omrijdtijd</th>
                  <th className="px-4 py-3">Volume</th>
                  <th className="px-4 py-3">Besparing (€)</th>
                  <th className="px-4 py-3">Actie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {stops.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-[#cbd5e1]">
                      Geen stops voor de geselecteerde filters. Pas ADR, hoogte of omrijdtijd aan.
                    </td>
                  </tr>
                ) : (
                  stops.map((stop) => (
                    <tr key={stop.stationName} className="hover:bg-slate-900/40">
                      <td className="px-4 py-3 font-semibold text-[#f8fafc]">{stop.stationName}</td>
                      <td className="px-4 py-3 text-[#cbd5e1]">{stop.locationHighway}</td>
                      <td className="px-4 py-3 font-mono text-[#38bdf8]">
                        € {stop.netPricePerL.toFixed(3)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {stop.adrCompliant ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              ADR OK
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                              Geen ADR
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-[#cbd5e1] border border-slate-600">
                            {stop.clearanceHeightM?.toFixed(1)} m
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#cbd5e1]">+{stop.detourMinutes.toFixed(1)} min</td>
                      <td className="px-4 py-3 text-[#f8fafc]">{stop.recommendedVolumeL} L</td>
                      <td className="px-4 py-3 font-bold text-[#10b981]">
                        € {stop.savingsEur.toFixed(2)}
                      </td>
                      <td className="px-3 py-3 align-middle min-w-[9.5rem]">
                        <button
                          type="button"
                          onClick={() => {
                            setNavFlash(
                              `Trucknavigatie → ${stop.stationName} (open chauffeur-cockpit — géén Google Maps)`
                            );
                            window.setTimeout(() => setNavFlash(null), 3500);
                            window.location.href = '/driver';
                          }}
                          className="w-full min-h-[2.75rem] px-2.5 py-2 rounded-[10px] text-[11px] font-bold leading-snug whitespace-normal break-words bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white border border-emerald-400/30 touch-manipulation"
                        >
                          Trucknavigatie
                          <span className="block font-semibold opacity-90">in FuelRoute</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      {showGlovebox && (
        <GloveboxModal
          onClose={() => setShowGlovebox(false)}
          onOpenDamageReport={() => {
            window.location.href = '/driver?action=schade';
          }}
        />
      )}
    </div>
  );
}
