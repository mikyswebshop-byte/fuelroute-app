/**
 * FuelRoute core: brandstofbesparing vóór NL-grens + route-tankstrategie.
 * Diesel in NL is vrijwel altijd duurder dan in DE/BE/CZ — daar zit de winst.
 */

import type { DriverLang } from '@/lib/driver-i18n';
import { cockpitText, fillTpl, type CockpitCopy } from '@/lib/cockpit-i18n';
import {
  parkingSecurity,
  recommendedFuelStops,
  type FuelStopRow,
  type ParkingSecurityRow,
  type PumpWaitStatus,
} from '@/lib/mock-data';

/** Typische NL nettoprijs diesel (tankkaart) — referentie om besparing te tonen. */
export const NL_REFERENCE_PRICE_PER_L = 1.718;

/** Max omrijden voor een goedkopere pomp (km). */
export const MAX_DETOUR_KM_DEFAULT = 20;

export type FuelCountry = 'NL' | 'DE' | 'BE' | 'CZ' | 'PL' | 'FR' | 'AT' | 'OTHER';

export type RankedFuelStop = FuelStopRow & {
  country: FuelCountry;
  detourKm: number;
  savingVsNlEurPerL: number;
  savingVsNlTotalEur: number;
  litersAdvice: number;
  score: number;
  amenities: {
    showers: boolean;
    toilets: boolean;
    restaurant: boolean;
    wait: PumpWaitStatus;
    parkingName?: string;
  };
  avoidReason?: string;
  recommendReason: string;
};

export function detectStopCountry(stop: FuelStopRow): FuelCountry {
  const blob = `${stop.stationName} ${stop.locationHighway}`.toUpperCase();
  if (/\bNL\b|VENLO|ROTTERDAM|AMSTERDAM|UTRECHT|BREDA/.test(blob)) return 'NL';
  if (/\bCZ\b|PRAHA|PRAGUE|PRAAG|BRNO|PLZEN/.test(blob)) return 'CZ';
  if (/\bBE\b|ANTWERP|ANTWERPEN|LIÈGE|LIEGE/.test(blob)) return 'BE';
  if (/\bPL\b|WARSZAWA|WARSAW|POZNAN/.test(blob)) return 'PL';
  if (/\bFR\b|LYON|PARIS|CALAIS/.test(blob)) return 'FR';
  if (/\bAT\b|WIEN|VIENNA|SALZBURG/.test(blob)) return 'AT';
  if (/\bDE\b|BORDER DE|A[0-9]|AUTHOF|RASTHOF|TANKSTELLE|HAMMINKELN|BENTHEIM|LOHFELDEN|WÜRZBURG|WURZBURG|KASSEL|HERSFELD/.test(blob)) {
    return 'DE';
  }
  if (/BORDER.*NL|NL\/DE|DE\/NL/.test(blob)) return 'DE'; // grensstations aan DE-kant
  return 'OTHER';
}

export function isNlBorderApproachStop(stop: FuelStopRow): boolean {
  const blob = `${stop.stationName} ${stop.locationHighway}`;
  return /border|bentheim|hamminkeln|nl\/de|de\/nl|venlo/i.test(blob);
}

function matchParking(stop: FuelStopRow): ParkingSecurityRow | undefined {
  const name = stop.stationName.toLowerCase();
  const hwy = stop.locationHighway.toLowerCase();
  return parkingSecurity.find(
    (p) =>
      name.includes(p.name.split(' ').slice(-1)[0].toLowerCase()) ||
      p.name.toLowerCase().includes(name.split(' ')[0] ?? '') ||
      (hwy.includes('a30') && p.corridor === 'A30') ||
      (hwy.includes('a7') && p.corridor === 'A7' && /lohfelden/i.test(p.name)) ||
      (hwy.includes('a3') && /hamminkeln|würzburg|wurzburg/i.test(p.name + stop.stationName)) ||
      (/venlo/i.test(name) && /venlo/i.test(p.name))
  );
}

/** Liters advies: genoeg om naar zaak + terug buitenland / volgende goedkope pomp te rijden. */
export function litersForStrategy(opts: {
  fuelPct: number;
  rangeKm: number;
  tankCapacityL?: number;
  nextCheapLegKm: number;
  roundTripDepotKm?: number;
}): number {
  const tank = opts.tankCapacityL ?? 900;
  const currentL = (opts.fuelPct / 100) * tank;
  const needForLeg = Math.ceil((opts.nextCheapLegKm / Math.max(opts.rangeKm, 1)) * tank * 0.35);
  const needDepot = opts.roundTripDepotKm
    ? Math.ceil((opts.roundTripDepotKm / Math.max(opts.rangeKm, 1)) * tank * 0.4)
    : 0;
  const target = Math.max(needForLeg, needDepot, 280);
  const fill = Math.min(tank - 40, Math.max(0, target - currentL + 80));
  return Math.round(Math.min(fill, tank * 0.85));
}

export function buildFuelSavingsPlan(input: {
  origin?: string;
  destination: string;
  fuelPct: number;
  rangeKm: number;
  maxDetourKm?: number;
  tankCapacityL?: number;
  lang?: DriverLang | string;
}): {
  nlBorderAlert: {
    title: string;
    body: string;
    litersAdvice: number;
    station: RankedFuelStop;
    savingEur: number;
  } | null;
  rankedStops: RankedFuelStop[];
  strategyLines: string[];
  headlineSavingEur: number;
} {
  const c: CockpitCopy = cockpitText(input.lang ?? 'NL');
  const maxDetourKm = input.maxDetourKm ?? MAX_DETOUR_KM_DEFAULT;
  const dest = input.destination.toLowerCase();
  const towardCz = /czech|tsjech|praag|prague|brno|plzen|ostrava/i.test(dest);
  const towardNl = /nederland|netherlands|\bnl\b|rotterdam|amsterdam|utrecht|eindhoven/i.test(dest);
  const crossesNl =
    towardNl ||
    towardCz ||
    /praag|munich|münchen|duitsland|duisburg|kassel/i.test(dest);

  const ranked: RankedFuelStop[] = recommendedFuelStops
    .map((stop) => {
      const country = detectStopCountry(stop);
      const detourKm = Math.round(stop.detourMinutes * 0.85 * 10) / 10;
      const parking = matchParking(stop);
      const litersAdvice = Math.max(
        250,
        Math.round(stop.recommendedVolumeL * (0.9 + (100 - input.fuelPct) / 200))
      );
      const savingVsNlEurPerL = Math.round((NL_REFERENCE_PRICE_PER_L - stop.netPricePerL) * 1000) / 1000;
      const savingVsNlTotalEur = Math.round(savingVsNlEurPerL * litersAdvice * 100) / 100;

      let avoidReason: string | undefined;
      if (country === 'NL' && savingVsNlEurPerL < 0.04) {
        avoidReason = c.avoidNl;
      }

      let recommendReason = fillTpl(c.cheaperThanNl, { p: savingVsNlEurPerL.toFixed(3) });
      if (isNlBorderApproachStop(stop) && country !== 'NL') {
        recommendReason = fillTpl(c.deBorderPump, { r: recommendReason });
      }
      if (country === 'CZ') {
        recommendReason = c.czCheaper;
      }
      if (stop.waitStatus === 'storing') {
        recommendReason += c.pumpFaultNote;
      }

      let score = savingVsNlTotalEur;
      score -= detourKm * 1.2;
      score -= stop.detourMinutes * 0.8;
      if (stop.waitStatus === 'druk') score -= 8;
      if (stop.waitStatus === 'storing') score -= 25;
      if (stop.waitStatus === 'geen') score += 4;
      if (parking?.hasShowers) score += 5;
      if (parking?.hasRestaurant) score += 2;
      if (country === 'NL') score -= 40;
      if (isNlBorderApproachStop(stop) && country === 'DE') score += 18;
      if (towardCz && country === 'CZ') score += 12;
      if (towardCz && country === 'DE' && isNlBorderApproachStop(stop)) score += 8;
      if (detourKm > maxDetourKm) score -= 50;

      return {
        ...stop,
        country,
        detourKm,
        savingVsNlEurPerL,
        savingVsNlTotalEur,
        litersAdvice,
        score,
        amenities: {
          showers: Boolean(parking?.hasShowers),
          toilets: true,
          restaurant: Boolean(parking?.hasRestaurant),
          wait: stop.waitStatus ?? 'geen',
          parkingName: parking?.name,
        },
        avoidReason,
        recommendReason,
      };
    })
    .filter((s) => s.detourKm <= maxDetourKm + 0.5)
    .sort((a, b) => b.score - a.score);

  const borderDe = ranked.find((s) => s.country === 'DE' && isNlBorderApproachStop(s));
  const litersAdvice = litersForStrategy({
    fuelPct: input.fuelPct,
    rangeKm: input.rangeKm,
    tankCapacityL: input.tankCapacityL,
    nextCheapLegKm: towardCz ? 520 : 180,
    roundTripDepotKm: towardNl ? 220 : 160,
  });

  const nlBorderAlert =
    crossesNl && borderDe
      ? {
          title: c.tankBeforeNlTitle,
          body: fillTpl(c.tankBeforeNlBody, {
            station: borderDe.stationName,
            price: borderDe.netPricePerL.toFixed(3),
            liters: litersAdvice,
            cz: towardCz ? c.tankBeforeNlCz : '',
          }),
          litersAdvice,
          station: {
            ...borderDe,
            litersAdvice,
            savingVsNlTotalEur:
              Math.round((NL_REFERENCE_PRICE_PER_L - borderDe.netPricePerL) * litersAdvice * 100) /
              100,
          },
          savingEur:
            Math.round((NL_REFERENCE_PRICE_PER_L - borderDe.netPricePerL) * litersAdvice * 100) /
            100,
        }
      : null;

  const strategyLines: string[] = [];
  if (nlBorderAlert) {
    strategyLines.push(
      fillTpl(c.strategyBorder, {
        station: nlBorderAlert.station.stationName,
        liters: nlBorderAlert.litersAdvice,
        save: nlBorderAlert.savingEur.toFixed(0),
      })
    );
  }
  if (towardCz) {
    const cz = ranked.find((s) => s.country === 'CZ');
    const deFill = ranked.find((s) => s.country === 'DE' && !isNlBorderApproachStop(s));
    strategyLines.push(c.strategySkipNl);
    if (deFill) {
      strategyLines.push(fillTpl(c.strategyRefillDe, { station: deFill.stationName }));
    }
    strategyLines.push(
      cz
        ? fillTpl(c.strategyCz, {
            station: cz.stationName,
            price: cz.netPricePerL.toFixed(3),
          })
        : c.strategyCzAlt
    );
  } else {
    const best = ranked.find((s) => s.country !== 'NL');
    if (best) {
      strategyLines.push(
        fillTpl(c.strategyBest, {
          station: best.stationName,
          price: best.netPricePerL.toFixed(3),
          km: best.detourKm,
        })
      );
    }
  }
  strategyLines.push(fillTpl(c.strategyFooter, { km: maxDetourKm }));

  const headlineSavingEur = nlBorderAlert?.savingEur ?? ranked[0]?.savingVsNlTotalEur ?? 0;

  return {
    nlBorderAlert,
    rankedStops: ranked.slice(0, 8),
    strategyLines,
    headlineSavingEur,
  };
}
