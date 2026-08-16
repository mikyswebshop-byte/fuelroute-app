'use client';

import { useCallback, useEffect, useState } from 'react';

export type CmrShipment = {
  id: string;
  fileName: string;
  sourceExt: 'pdf' | 'jpg' | 'png' | 'other';
  cmrNumber: string;
  shipper: string;
  consignee: string;
  origin: string;
  destination: string;
  goodsDescription: string;
  packages: number;
  grossWeightKg: number;
  emptyWeightT: number;
  loadedWeightT: number;
  volumeM3: number;
  adr: boolean;
  adrClass: string;
  truckPlate: string;
  trailerPlate: string;
  notes: string;
  createdAt: string;
};

const STORAGE_KEY = 'fuelroute-active-cmr';
const LIST_KEY = 'fuelroute-cmr-history';
const listeners = new Set<() => void>();

let activeCache: CmrShipment | null | undefined = undefined;
let historyCache: CmrShipment[] | undefined = undefined;

function emit() {
  listeners.forEach((l) => l());
}

function readActive(): CmrShipment | null {
  if (typeof window === 'undefined') return null;
  if (activeCache !== undefined) return activeCache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    activeCache = raw ? (JSON.parse(raw) as CmrShipment) : null;
  } catch {
    activeCache = null;
  }
  return activeCache;
}

function readHistory(): CmrShipment[] {
  if (typeof window === 'undefined') return [];
  if (historyCache !== undefined) return historyCache;
  try {
    const raw = localStorage.getItem(LIST_KEY);
    historyCache = raw ? (JSON.parse(raw) as CmrShipment[]) : [];
  } catch {
    historyCache = [];
  }
  return historyCache;
}

export function getActiveCmr(): CmrShipment | null {
  return readActive();
}

export function getCmrHistory(): CmrShipment[] {
  return readHistory();
}

export function setActiveCmr(cmr: CmrShipment | null) {
  try {
    if (cmr) localStorage.setItem(STORAGE_KEY, JSON.stringify(cmr));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  activeCache = cmr;
  if (cmr) {
    const hist = [cmr, ...readHistory().filter((h) => h.id !== cmr.id)].slice(0, 12);
    try {
      localStorage.setItem(LIST_KEY, JSON.stringify(hist));
    } catch {
      /* ignore */
    }
    historyCache = hist;
  }
  emit();
}

export function useActiveCmr(): CmrShipment | null {
  const [cmr, setCmr] = useState<CmrShipment | null>(null);

  useEffect(() => {
    setCmr(readActive());
    const onStore = () => setCmr(readActive());
    listeners.add(onStore);
    return () => {
      listeners.delete(onStore);
    };
  }, []);

  return cmr;
}

export function useCmrHistory(): CmrShipment[] {
  const [list, setList] = useState<CmrShipment[]>([]);
  useEffect(() => {
    setList(readHistory());
    const onStore = () => setList(readHistory());
    listeners.add(onStore);
    return () => {
      listeners.delete(onStore);
    };
  }, []);
  return list;
}

function extOf(name: string): CmrShipment['sourceExt'] {
  if (/\.pdf$/i.test(name)) return 'pdf';
  if (/\.jpe?g$/i.test(name)) return 'jpg';
  if (/\.png$/i.test(name)) return 'png';
  return 'other';
}

/** Deterministic demo OCR from filename + size — no server required. */
export function parseCmrFromFile(file: File): CmrShipment {
  const name = file.name.toLowerCase();
  const seed = Array.from(name).reduce((a, c) => a + c.charCodeAt(0), file.size % 997);

  const munich = /munchen|munich|münchen|muc/i.test(name);
  const rotterdam = /rotterdam|rtm/i.test(name);
  const antwerp = /antwerp|antwerpen/i.test(name);
  const amsterdamPrague =
    /amsterdam|praag|prague|franc|croco|afzender|formulier|01345/i.test(name);
  const adr = /adr|gevaar|hazmat|klasse/i.test(name);

  let origin = 'Kassel Hub (DE)';
  let destination = 'München Distribution (DE)';
  let shipper = 'FuelRoute Logistics GmbH';
  let consignee = 'Bayern Fresh Distribution AG';
  let goods = 'Gekoelde levensmiddelen (groep II)';
  let grossWeightKg = 24_800;
  let packages = 26;
  let volumeM3 = 78;
  let adrClass = '';
  let cmrNumber = `CMR-${22000 + (seed % 7000)}`;
  let truckPlate = '45-BJK-8';
  let trailerPlate = 'OW-TR-992';
  let emptyWeightT = 15;

  if (amsterdamPrague) {
    // Matches typical NL→CZ sample CMR (o.a. Afzender.com → FRANC TRANSPORT)
    origin = 'Amsterdam (NL)';
    destination = 'Praag / Prague (CZ)';
    shipper = 'Afzender.com · Grotestraatweg 123b, Amsterdam';
    consignee = 'FRANC TRANSPORT s.r.o., Prague (CZ)';
    goods = 'Machine (Europallet 825 kg) + Kleinmateriaal (doos 2 kg)';
    grossWeightKg = 827;
    packages = 2;
    volumeM3 = 2.4;
    cmrNumber = 'CMR-01345';
    truckPlate = '45-BJK-8';
    trailerPlate = 'OW-TR-992';
    emptyWeightT = 14.5;
  } else if (rotterdam) {
    origin = 'Rotterdam Maasvlakte (NL)';
    destination = 'Duisburg Rheinhafen (DE)';
    shipper = 'Maas Terminal B.V.';
    consignee = 'Rhein Cargo GmbH';
    goods = 'Containers 40ft · algemene cargo';
    grossWeightKg = 28_400;
    packages = 2;
    volumeM3 = 67;
  } else if (antwerp) {
    origin = 'Antwerpen Haven (BE)';
    destination = 'Lyon Distribution (FR)';
    shipper = 'Schelde Forwarding NV';
    consignee = 'Rhône Logistique SAS';
    goods = 'Paletten industriële onderdelen';
    grossWeightKg = 22_100;
    packages = 33;
  } else if (munich) {
    origin = 'Kassel Hub (DE)';
    destination = 'München Distribution (DE)';
  }

  if (adr) {
    goods = 'ADR klasse 3 · brandbare vloeistoffen (verpakt)';
    adrClass = '3';
    grossWeightKg = 18_600;
    packages = 18;
    volumeM3 = 42;
  }

  // Light sample CMRs keep exact weight; heavy demos get slight OCR jitter
  if (!amsterdamPrague) {
    grossWeightKg = Math.round(grossWeightKg + (seed % 400) - 200);
  }
  const cargoT = Math.max(0.1, Math.round((grossWeightKg / 1000) * 10) / 10);
  const loadedWeightT = Math.round((emptyWeightT + cargoT) * 10) / 10;

  return {
    id: `cmr-${Date.now()}-${seed.toString(36)}`,
    fileName: file.name,
    sourceExt: extOf(file.name),
    cmrNumber,
    shipper,
    consignee,
    origin,
    destination,
    goodsDescription: goods,
    packages,
    grossWeightKg,
    emptyWeightT,
    loadedWeightT,
    volumeM3,
    adr: adr || /klasse\s*3/i.test(goods),
    adrClass: adr ? adrClass || '3' : '',
    truckPlate,
    trailerPlate,
    notes: `Automatisch toegepast uit ${extOf(file.name).toUpperCase()} · controleer gewicht & adressen`,
    createdAt: new Date().toISOString(),
  };
}

export function applyCmrToPlannerFields(cmr: CmrShipment) {
  return {
    origin: cmr.origin,
    destination: cmr.destination,
    emptyWeightT: cmr.emptyWeightT,
    loadedWeightT: cmr.loadedWeightT,
    adrCargo: cmr.adr,
    freightHint: Math.round(cmr.grossWeightKg * 0.045),
  };
}

export function useSetActiveCmr() {
  return useCallback((cmr: CmrShipment | null) => setActiveCmr(cmr), []);
}
