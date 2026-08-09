import type { ComplianceStatus, FuelStopRow } from '@/lib/mock-data';

export type FuelKind = 'Diesel' | 'AdBlue' | 'HVO100';
export type Topography = 'vlak' | 'heuvelachtig' | 'alpen';

/** Deterministic distance estimate from free-text origin/destination. */
export function estimateDistanceKm(origin: string, destination: string): number {
  const seed = hashString(`${origin.trim().toLowerCase()}|${destination.trim().toLowerCase()}`);
  return 420 + (seed % 360); // 420–779 km
}

export function estimateUsageL(distanceKm: number, cargoWeightTons: number): number {
  const rate = 27.5 + cargoWeightTons * 0.35;
  return Math.round((distanceKm / 100) * rate);
}

export function cardDiscountFactor(selectedCards: string[]): number {
  if (selectedCards.length === 0) return 0.55;
  let factor = 1;
  if (selectedCards.includes('DKV')) factor += 0.08;
  if (selectedCards.includes('UTA')) factor += 0.05;
  if (selectedCards.includes('Shell')) factor += 0.03;
  if (selectedCards.includes('BP')) factor += 0.02;
  if (selectedCards.includes('Esso')) factor += 0.02;
  return Math.min(factor, 1.25);
}

export function estimateSavingsEur(
  distanceKm: number,
  usageL: number,
  selectedCards: string[]
): number {
  const deltaPerL = 0.12 * cardDiscountFactor(selectedCards);
  const base = usageL * deltaPerL;
  const corridorBonus = distanceKm > 600 ? 6 : 2;
  return Math.round((base + corridorBonus) * 100) / 100;
}

export interface AdvancedRouteInput {
  origin: string;
  destination: string;
  emptyWeightT: number;
  loadedWeightT: number;
  coolingTrailer: boolean;
  fuelType: FuelKind;
  headwindPct: number;
  topography: Topography;
  selectedCards: string[];
  maxDetourMinutes: number;
}

export interface AdvancedRouteResult {
  distanceKm: number;
  estimatedUsageL: number;
  fuelAdvantageEur: number;
  extraKmCostEur: number;
  extraMautEur: number;
  netSavingsEur: number;
  consumptionRate: number;
}

export function calculateAdvancedRoute(input: AdvancedRouteInput): AdvancedRouteResult {
  const distanceKm = estimateDistanceKm(input.origin, input.destination);
  const cargoTons = Math.max(0, input.loadedWeightT - input.emptyWeightT);

  let rate = 27.5 + cargoTons * 0.35;
  if (input.coolingTrailer) rate += 2.8;
  if (input.fuelType === 'HVO100') rate *= 0.98;
  if (input.fuelType === 'AdBlue') rate += 0.4;

  // Wind: 10–20% extra at high slider values
  const windFactor = 1 + (input.headwindPct / 100) * 0.2;
  rate *= windFactor;

  if (input.topography === 'heuvelachtig') rate *= 1.08;
  if (input.topography === 'alpen') rate *= 1.16;

  const estimatedUsageL = Math.round((distanceKm / 100) * rate);
  const fuelAdvantageEur = estimateSavingsEur(distanceKm, estimatedUsageL, input.selectedCards);

  // Extra KM from typical Autohof detours (~0.8 km per allowed detour minute avg)
  const extraKm = Math.max(2, input.maxDetourMinutes * 0.75);
  const extraKmCostEur = Math.round(extraKm * 0.45 * 100) / 100; // brandstof+tijd
  const extraMautEur = Math.round(distanceKm * 0.18 * 100) / 100; // indicatieve maut

  // Formula: Netto Besparing = Brandstofvoordeel - (Extra KM + Extra Maut/Tol)
  // Extra KM cost is the "Extra KM" term; maut is separate.
  const netSavingsEur =
    Math.round((fuelAdvantageEur - (extraKmCostEur + extraMautEur * 0.05)) * 100) / 100;

  return {
    distanceKm,
    estimatedUsageL,
    fuelAdvantageEur,
    extraKmCostEur,
    extraMautEur,
    netSavingsEur,
    consumptionRate: Math.round(rate * 10) / 10,
  };
}

export interface StopFilterOptions {
  adrOnly?: boolean;
  maxTruckHeightM?: number;
  maxDetourMinutes?: number;
}

export function filterAndScaleStops(
  stops: FuelStopRow[],
  selectedCards: string[],
  cargoWeightTons: number,
  usageL: number,
  options?: StopFilterOptions
): FuelStopRow[] {
  const volumeFactor = Math.max(0.7, Math.min(1.35, cargoWeightTons / 20));
  const usageFactor = Math.max(0.8, Math.min(1.4, usageL / 220));
  const adrOnly = options?.adrOnly ?? false;
  const maxTruckHeightM = options?.maxTruckHeightM;
  const maxDetourMinutes = options?.maxDetourMinutes;

  return stops
    .filter((stop) => {
      if (maxDetourMinutes != null && stop.detourMinutes > maxDetourMinutes) return false;
      if (selectedCards.length > 0) {
        const accepted = stop.acceptedCards ?? ['DKV', 'UTA', 'Shell'];
        if (!selectedCards.some((c) => accepted.includes(c))) return false;
      }
      if (adrOnly) {
        if (!stop.adrCompliant) return false;
        if (stop.inTunnelRestriction) return false;
      }
      if (
        maxTruckHeightM != null &&
        stop.clearanceHeightM != null &&
        stop.clearanceHeightM < maxTruckHeightM
      ) {
        return false;
      }
      return true;
    })
    .map((stop) => {
      const cardBoost = cardDiscountFactor(
        (stop.acceptedCards ?? []).filter((c) => selectedCards.includes(c))
      );
      const volume = Math.round(stop.recommendedVolumeL * volumeFactor * usageFactor);
      const savings = Math.round(stop.savingsEur * volumeFactor * cardBoost * 100) / 100;
      return {
        ...stop,
        recommendedVolumeL: volume,
        savingsEur: savings,
      };
    })
    .sort((a, b) => b.savingsEur - a.savingsEur);
}

export function deriveCompliance(
  fuelLevel: number,
  base: ComplianceStatus,
  minTankAlarm: number
): ComplianceStatus {
  if (fuelLevel < minTankAlarm * 0.6) return 'Critical';
  if (fuelLevel < minTankAlarm) return 'Warning';
  if (base === 'Critical' || base === 'Warning') return base;
  return 'Compliant';
}

/** ZZP / eigenrijder: netto marge na brandstof, maut en afschrijving. */
export function calculateZzpMargin(input: {
  freightPriceEur: number;
  distanceKm: number;
  fuelCostEur: number;
  mautEur: number;
  depreciationPerKm?: number;
}) {
  const depRate = input.depreciationPerKm ?? 0.18;
  const depreciationEur = Math.round(input.distanceKm * depRate * 100) / 100;
  const totalCost =
    Math.round((input.fuelCostEur + input.mautEur + depreciationEur) * 100) / 100;
  const netMarginEur = Math.round((input.freightPriceEur - totalCost) * 100) / 100;
  const marginPct =
    input.freightPriceEur > 0
      ? Math.round((netMarginEur / input.freightPriceEur) * 1000) / 10
      : 0;
  return { depreciationEur, totalCost, netMarginEur, marginPct };
}

/** Totale Routekosten = Brandstof + EETS Tol/Maut (DE/FR/BE) + Omrijkm-kosten. */
export function calculateTotalRouteCost(input: {
  usageL: number;
  fuelPricePerL?: number;
  distanceKm: number;
  shareDe?: number;
  shareFr?: number;
  shareBe?: number;
  detourKmCostEur: number;
  borderIdleLiters?: number;
}) {
  const price = input.fuelPricePerL ?? 1.58;
  const shareDe = input.shareDe ?? 0.55;
  const shareFr = input.shareFr ?? 0.25;
  const shareBe = input.shareBe ?? 0.2;
  const fuelCostEur =
    Math.round((input.usageL + (input.borderIdleLiters ?? 0)) * price * 100) / 100;
  const eetsDe = Math.round(input.distanceKm * shareDe * 0.19 * 100) / 100;
  const eetsFr = Math.round(input.distanceKm * shareFr * 0.22 * 100) / 100;
  const eetsBe = Math.round(input.distanceKm * shareBe * 0.17 * 100) / 100;
  const eetsTotal = Math.round((eetsDe + eetsFr + eetsBe) * 100) / 100;
  const detour = input.detourKmCostEur;
  const total =
    Math.round((fuelCostEur + eetsTotal + detour) * 100) / 100;
  return { fuelCostEur, eetsDe, eetsFr, eetsBe, eetsTotal, detourKmCostEur: detour, total };
}

export function formatDriveTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}u ${String(m).padStart(2, '0')}m`;
}

/** Scope 3 CO₂-barometer: g CO₂/ton-km en besparing t.o.v. snelwegcorridor. */
export function calculateCo2Barometer(input: {
  distanceKm: number;
  cargoTons: number;
  usageL: number;
  highwayUsageFactor?: number;
}) {
  const cargo = Math.max(0.1, input.cargoTons);
  const factor = input.highwayUsageFactor ?? 1.12;
  const kgPerL = 2.68;
  const routeKg = input.usageL * kgPerL;
  const highwayKg = input.usageL * factor * kgPerL;
  const savedKg = Math.max(0, highwayKg - routeKg);
  const tonKm = cargo * input.distanceKm;
  const gPerTonKm = Math.round((routeKg * 1000) / tonKm);
  const savedGPerTonKm = Math.round((savedKg * 1000) / tonKm);
  const savingsPct = Math.round((savedKg / Math.max(highwayKg, 0.01)) * 1000) / 10;
  return {
    routeKg: Math.round(routeKg * 10) / 10,
    savedKg: Math.round(savedKg * 10) / 10,
    gPerTonKm,
    savedGPerTonKm,
    savingsPct,
  };
}

function hashString(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) {
    h = (h << 5) - h + value.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}
