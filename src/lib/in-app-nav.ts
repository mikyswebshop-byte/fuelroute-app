/**
 * In-app trucknavigatie (FuelRoute) — géén Google Maps / personenwagen-nav.
 * Corridor-routes + waarschuwingen op basis van actief voertuigprofiel.
 */

import {
  type TruckProfile,
  DEFAULT_TRUCK_PROFILE,
  COMBO_LABELS,
  profileSummary,
} from '@/lib/truck-profile';

export type LatLng = [number, number];

export type NavStep = {
  instruction: string;
  highway?: string;
};

export type TruckAlertKind =
  | 'height'
  | 'weight'
  | 'width'
  | 'length'
  | 'axle'
  | 'toll'
  | 'border'
  | 'adr'
  | 'tunnel'
  | 'city_ban'
  | 'weekend'
  | 'special'
  | 'cooling'
  | 'eco'
  | 'ferry'
  | 'profile';

export type TruckAlert = {
  kind: TruckAlertKind;
  severity: 'info' | 'warn' | 'critical';
  title: string;
  detail: string;
};

export type InAppRoute = {
  id: string;
  label: string;
  route: LatLng[];
  steps: NavStep[];
  etaHintMin: number;
  truckAlerts: TruckAlert[];
  vehicleSummary: string;
};

type CorridorMeta = {
  match: RegExp;
  id: string;
  label: string;
  route: LatLng[];
  steps: NavStep[];
  etaHintMin: number;
  /** Laagste doorrijhoogte op corridor (m) */
  minClearanceM: number;
  /** Max toegestaan bruto op standaard route (t) */
  maxWeightT: number;
  /** Smalle passages / breedte limiet (m) */
  maxWidthM: number;
  maxLengthM: number;
  hasAdrTunnelBan: boolean;
  hasEcoZone: boolean;
  crossesBorder: boolean;
  tollZones: string[];
  weekendBanRisk: boolean;
  cityAvoid: string;
};

const CORRIDORS: CorridorMeta[] = [
  {
    match: /praag|prague|praha|tsjech|czech/i,
    id: 'kassel-prague',
    label: 'Praag (CZ)',
    route: [
      [51.3127, 9.4797],
      [50.555, 9.68],
      [49.7913, 9.9534],
      [49.4521, 11.0767],
      [49.0134, 12.1016],
      [49.747, 12.409],
      [49.7475, 13.3776],
      [50.0755, 14.4378],
    ],
    steps: [
      { instruction: 'Volg A7 zuid richting Fulda / Würzburg', highway: 'A7' },
      { instruction: 'Neem A3 oost richting Nürnberg / Regensburg', highway: 'A3' },
      { instruction: 'Blijf op A3 → D5/E50 richting Plzeň / Praha', highway: 'A3 / D5' },
      { instruction: 'Grens DE/CZ Rozvadov — tol & documenten', highway: 'D5' },
      { instruction: 'D5 naar Praag — vermijd binnenstad, volg truckrouting', highway: 'D5' },
    ],
    etaHintMin: 307,
    minClearanceM: 4.5,
    maxWeightT: 40,
    maxWidthM: 2.6,
    maxLengthM: 18.75,
    hasAdrTunnelBan: false,
    hasEcoZone: true,
    crossesBorder: true,
    tollZones: ['DE LKW-Maut', 'CZ EETS/vignette'],
    weekendBanRisk: true,
    cityAvoid: 'Praag centrum (lage viaducten & milieuzone)',
  },
  {
    match: /münchen|munchen|munich/i,
    id: 'kassel-munich',
    label: 'München (DE)',
    route: [
      [51.3127, 9.4797],
      [51.275, 9.534],
      [50.555, 9.68],
      [49.7913, 9.9534],
      [49.4521, 11.0767],
      [48.4011, 11.7775],
      [48.1351, 11.582],
    ],
    steps: [
      { instruction: 'Blijf op A7 richting Fulda / Würzburg', highway: 'A7' },
      { instruction: 'Via A3 / A9 richting München', highway: 'A3 / A9' },
      { instruction: 'Aankomst München Distribution — geen stadskortingen', highway: 'A9' },
    ],
    etaHintMin: 280,
    minClearanceM: 4.5,
    maxWeightT: 40,
    maxWidthM: 2.6,
    maxLengthM: 18.75,
    hasAdrTunnelBan: false,
    hasEcoZone: true,
    crossesBorder: false,
    tollZones: ['DE LKW-Maut'],
    weekendBanRisk: false,
    cityAvoid: 'München binnenstad (bruggen < 4,0 m op shortcuts)',
  },
  {
    match: /duisburg|rheinhafen/i,
    id: 'to-duisburg',
    label: 'Duisburg Rheinhafen',
    route: [
      [51.3127, 9.4797],
      [51.45, 7.01],
      [51.4344, 6.7623],
    ],
    steps: [
      { instruction: 'Richting Ruhrgebied via A44 / A1', highway: 'A44' },
      { instruction: 'Haveninrit — volg truckrouting Rheinhafen', highway: 'A40' },
    ],
    etaHintMin: 140,
    minClearanceM: 4.2,
    maxWeightT: 40,
    maxWidthM: 2.55,
    maxLengthM: 18.75,
    hasAdrTunnelBan: true,
    hasEcoZone: true,
    crossesBorder: false,
    tollZones: ['DE LKW-Maut'],
    weekendBanRisk: false,
    cityAvoid: 'Havengebied aslastcontroles',
  },
  {
    match: /lohfelden|autohof lohfelden/i,
    id: 'stop-lohfelden',
    label: 'Autohof Lohfelden',
    route: [
      [51.3127, 9.4797],
      [51.275, 9.534],
    ],
    steps: [{ instruction: 'Afslag Autohof Lohfelden — tanken & rust', highway: 'A7' }],
    etaHintMin: 12,
    minClearanceM: 4.5,
    maxWeightT: 44,
    maxWidthM: 2.6,
    maxLengthM: 25.25,
    hasAdrTunnelBan: false,
    hasEcoZone: false,
    crossesBorder: false,
    tollZones: ['DE LKW-Maut'],
    weekendBanRisk: false,
    cityAvoid: '',
  },
  {
    match: /bentheim|hamminkeln|border.*nl|nl\/de|de\/nl|venlo/i,
    id: 'nl-border-de',
    label: 'DE-grenspomp (vóór NL)',
    route: [
      [51.3127, 9.4797],
      [52.303, 7.159],
    ],
    steps: [
      {
        instruction: 'Naar DE-grenspomp — tank vóór NL (duurder diesel)',
        highway: 'A30 / A3',
      },
    ],
    etaHintMin: 95,
    minClearanceM: 4.5,
    maxWeightT: 40,
    maxWidthM: 2.6,
    maxLengthM: 18.75,
    hasAdrTunnelBan: false,
    hasEcoZone: false,
    crossesBorder: true,
    tollZones: ['DE LKW-Maut'],
    weekendBanRisk: false,
    cityAvoid: '',
  },
  {
    match: /rozvadov|omv truckstop/i,
    id: 'stop-rozvadov',
    label: 'OMV Rozvadov (CZ)',
    route: [
      [51.3127, 9.4797],
      [49.7913, 9.9534],
      [49.0134, 12.1016],
      [49.747, 12.409],
    ],
    steps: [
      { instruction: 'A3 / D5 naar DE/CZ-grens Rozvadov', highway: 'A3 / D5' },
      { instruction: 'OMV Truckstop Rozvadov — goedkope CZ-diesel', highway: 'D5' },
    ],
    etaHintMin: 260,
    minClearanceM: 4.5,
    maxWeightT: 40,
    maxWidthM: 2.6,
    maxLengthM: 18.75,
    hasAdrTunnelBan: false,
    hasEcoZone: false,
    crossesBorder: true,
    tollZones: ['DE LKW-Maut', 'CZ EETS'],
    weekendBanRisk: true,
    cityAvoid: '',
  },
  {
    match: /würzburg|wurzburg/i,
    id: 'stop-wurzburg',
    label: 'Würzburg',
    route: [
      [51.3127, 9.4797],
      [50.555, 9.68],
      [49.7913, 9.9534],
    ],
    steps: [{ instruction: 'A7 zuid — blijf op Autobahn, vermijd stad Würzburg', highway: 'A7' }],
    etaHintMin: 110,
    minClearanceM: 4.5,
    maxWeightT: 40,
    maxWidthM: 2.6,
    maxLengthM: 18.75,
    hasAdrTunnelBan: false,
    hasEcoZone: false,
    crossesBorder: false,
    tollZones: ['DE LKW-Maut'],
    weekendBanRisk: false,
    cityAvoid: 'Würzburg stad (lage bruggen)',
  },
];

const FALLBACK: CorridorMeta = {
  match: /.*/,
  id: 'generic',
  label: 'Bestemming',
  route: [
    [51.3127, 9.4797],
    [50.555, 9.68],
    [49.7913, 9.9534],
    [48.1351, 11.582],
  ],
  steps: [
    { instruction: 'Truckroute in FuelRoute — volg de blauwe lijn', highway: 'Corridor' },
    { instruction: 'Volgende instructie volgt op GPS / simulatie', highway: 'Live' },
  ],
  etaHintMin: 180,
  minClearanceM: 4.5,
  maxWeightT: 40,
  maxWidthM: 2.55,
  maxLengthM: 18.75,
  hasAdrTunnelBan: false,
  hasEcoZone: false,
  crossesBorder: false,
  tollZones: ['DE LKW-Maut'],
  weekendBanRisk: false,
  cityAvoid: 'Binnenstedelijke shortcuts',
};

/** Bouw alle vrachtwagenwaarschuwingen voor dit voertuig × corridor. */
export function buildTruckAlerts(profile: TruckProfile, corridor: CorridorMeta): TruckAlert[] {
  const alerts: TruckAlert[] = [];
  const clearanceMargin = corridor.minClearanceM - profile.heightM;

  alerts.push({
    kind: 'profile',
    severity: 'info',
    title: `Voertuig · ${COMBO_LABELS[profile.comboType]}`,
    detail: `${profile.model} · ${profile.truckPlate}${
      profile.trailerCoupled ? ` + ${profile.trailerPlate}` : ' (geen trailer)'
    } · ${profile.heightM.toFixed(2)} m H · ${profile.widthM.toFixed(2)} m B · ${profile.lengthM.toFixed(1)} m L · ${profile.grossWeightT} t · ${profile.axleCount}-as · ${profile.euroClass}`,
  });

  if (clearanceMargin < 0.15) {
    alerts.push({
      kind: 'height',
      severity: 'critical',
      title: `Doorrijhoogte KRITIEK · voertuig ${profile.heightM.toFixed(2)} m`,
      detail: `Corridor min. ${corridor.minClearanceM.toFixed(1)} m — marge ${clearanceMargin.toFixed(2)} m. Route herberekenen of lagere opbouw.`,
    });
  } else if (clearanceMargin < 0.4) {
    alerts.push({
      kind: 'height',
      severity: 'warn',
      title: `Doorrijhoogte krap · ${profile.heightM.toFixed(2)} m`,
      detail: `Laagste punt corridor ${corridor.minClearanceM.toFixed(1)} m (marge ${clearanceMargin.toFixed(2)} m). Geen personenwagen-shortcuts.`,
    });
  } else {
    alerts.push({
      kind: 'height',
      severity: 'info',
      title: `Doorrijhoogte OK · ${profile.heightM.toFixed(2)} m`,
      detail: `Corridor vrij tot ${corridor.minClearanceM.toFixed(1)} m. Lage bruggen / viaducten op Autobahn vermeden.`,
    });
  }

  if (profile.grossWeightT > corridor.maxWeightT + 0.1) {
    alerts.push({
      kind: 'weight',
      severity: 'critical',
      title: `Tonnage overschreden · ${profile.grossWeightT} t`,
      detail: `Standaard corridor max ${corridor.maxWeightT} t. Speciaal transport / vergunning of andere route verplicht.`,
    });
  } else {
    alerts.push({
      kind: 'weight',
      severity: profile.grossWeightT > corridor.maxWeightT - 2 ? 'warn' : 'info',
      title: `Tonnage · ${profile.grossWeightT} t (max ${corridor.maxWeightT} t)`,
      detail: `Bruto combinatie · aslast ≤ ${profile.maxAxleLoadT} t · ${profile.axleCount} assen.`,
    });
  }

  if (profile.widthM > corridor.maxWidthM) {
    alerts.push({
      kind: 'width',
      severity: 'critical',
      title: `Breedte · ${profile.widthM.toFixed(2)} m > limiet ${corridor.maxWidthM} m`,
      detail: 'Exceptioneel breedte — begeleidingswagen / vergunning & verboden smalle wegen.',
    });
  } else if (profile.widthM > 2.55) {
    alerts.push({
      kind: 'width',
      severity: 'warn',
      title: `Breedte · ${profile.widthM.toFixed(2)} m (boven standaard 2,55 m)`,
      detail: 'Controleer landelijke uitzonderingen en spiegelbreedte.',
    });
  } else {
    alerts.push({
      kind: 'width',
      severity: 'info',
      title: `Breedte OK · ${profile.widthM.toFixed(2)} m`,
      detail: `Corridor tot ${corridor.maxWidthM} m — smalle dorpen worden vermeden.`,
    });
  }

  if (profile.lengthM > corridor.maxLengthM) {
    alerts.push({
      kind: 'length',
      severity: profile.comboType === 'lzv' || profile.specialTransport ? 'warn' : 'critical',
      title: `Lengte · ${profile.lengthM.toFixed(1)} m > corridor ${corridor.maxLengthM} m`,
      detail:
        profile.comboType === 'lzv'
          ? 'LZV alleen op toegestane wegen — controleer DE/NL LZV-netwerk.'
          : 'Te lange combinatie voor standaardroute — herroute of ontkoppel.',
    });
  } else {
    alerts.push({
      kind: 'length',
      severity: 'info',
      title: `Lengte OK · ${profile.lengthM.toFixed(1)} m`,
      detail: `Max op corridor ${corridor.maxLengthM} m · ${COMBO_LABELS[profile.comboType]}.`,
    });
  }

  alerts.push({
    kind: 'axle',
    severity: profile.maxAxleLoadT > 11.5 ? 'warn' : 'info',
    title: `Aslast · max ${profile.maxAxleLoadT.toFixed(1)} t · ${profile.axleCount}-as`,
    detail: 'Gewichtbeperkte bruggen/wegen gefilterd. Haven/industrie: aslastcontroles mogelijk.',
  });

  for (const zone of corridor.tollZones) {
    alerts.push({
      kind: 'toll',
      severity: 'info',
      title: `Tol / Maut · ${zone}`,
      detail: `${profile.euroClass} · ${profile.axleCount}-as — OBU/EETS controleren vóór vertrek.`,
    });
  }

  if (corridor.crossesBorder) {
    alerts.push({
      kind: 'border',
      severity: 'warn',
      title: 'Landsgrens op route',
      detail: 'CMR, kentekens, ADR-documenten en tolkastje klaarhouden.',
    });
  }

  if (profile.adr) {
    alerts.push({
      kind: 'adr',
      severity: 'critical',
      title: `ADR actief · klasse ${profile.adrClass || '?'} · tunnel ${profile.adrTunnelCode || '?'}`,
      detail: corridor.hasAdrTunnelBan
        ? 'Corridor bevat ADR-tunnelrestricties — alleen toegestane tunnels / omleiding.'
        : 'ADR-conforme tankstops & parkeerplaatsen verplicht. Oranje borden / instructiekaart.',
    });
    if (corridor.hasAdrTunnelBan) {
      alerts.push({
        kind: 'tunnel',
        severity: 'critical',
        title: 'ADR-tunnelbeperking',
        detail: `Tunnelcategorie ${profile.adrTunnelCode || 'onbekend'} — verboden tunnels worden omzeild.`,
      });
    }
  }

  if (corridor.hasEcoZone) {
    alerts.push({
      kind: 'eco',
      severity: profile.euroClass === 'Euro 5' ? 'critical' : 'warn',
      title: `Milieuzone / Umweltzone`,
      detail:
        profile.euroClass === 'Euro 5'
          ? 'Euro 5 — risico op verbod in milieuzones. Route mijdt stadskernen waar mogelijk.'
          : `${profile.euroClass} — milieusticker/registratie controleren (${corridor.cityAvoid || 'steden op route'}).`,
    });
  }

  if (corridor.cityAvoid) {
    alerts.push({
      kind: 'city_ban',
      severity: 'warn',
      title: 'Geen personenwagen-korting',
      detail: `Vermijd: ${corridor.cityAvoid}. FuelRoute houdt truckrouting aan.`,
    });
  }

  if (corridor.weekendBanRisk && profile.grossWeightT > 7.5) {
    alerts.push({
      kind: 'weekend',
      severity: 'warn',
      title: 'Weekend-/feestdag rijverbod (DE/CZ)',
      detail: 'Trucks > 7,5 t: controleer zondag/feestdagverboden vóór vertrek.',
    });
  }

  if (profile.refrigerated) {
    alerts.push({
      kind: 'cooling',
      severity: 'info',
      title: 'Koeltrailer actief',
      detail: 'Extra diesel ±2–3 L/100 km · temperatuurlog & dieselreserve meenemen.',
    });
  }

  if (profile.specialTransport || profile.comboType === 'speciaal_transport') {
    alerts.push({
      kind: 'special',
      severity: 'critical',
      title: 'Speciaal / exceptioneel transport',
      detail:
        profile.specialNotes ||
        'Vergunning, routeplicht en eventueel begeleidingswagen verplicht. Geen standaard Autobahn-nav.',
    });
  }

  if (profile.escortRequired) {
    alerts.push({
      kind: 'special',
      severity: 'critical',
      title: 'Begeleidingswagen vereist',
      detail: 'Vertrek niet zonder escort / BF3 volgens vergunning.',
    });
  }

  if (profile.comboType === 'lzv') {
    alerts.push({
      kind: 'special',
      severity: 'warn',
      title: 'LZV / Ecocombi',
      detail: 'Alleen LZV-toegestane wegen. Afwijkende lengte/gewicht — geen standaard 40 t-route.',
    });
  }

  if (!profile.trailerCoupled && profile.comboType !== 'bakwagen') {
    alerts.push({
      kind: 'profile',
      severity: 'warn',
      title: 'Trailer ontkoppeld',
      detail: 'Navigatie als solo-trekker — lengte/gewicht herberekend. Koppelstatus controleren.',
    });
  }

  return alerts;
}

export function resolveInAppRoute(
  destination: string,
  from?: { lat: number; lng: number },
  profile: TruckProfile = DEFAULT_TRUCK_PROFILE
): InAppRoute {
  const corridor = CORRIDORS.find((c) => c.match.test(destination)) ?? {
    ...FALLBACK,
    label: destination.trim() || FALLBACK.label,
  };
  const route = [...corridor.route] as LatLng[];
  if (from && Number.isFinite(from.lat) && Number.isFinite(from.lng)) {
    route[0] = [from.lat, from.lng];
  }
  return {
    id: corridor.id,
    label: destination.trim() || corridor.label,
    route,
    steps: corridor.steps,
    etaHintMin: corridor.etaHintMin,
    truckAlerts: buildTruckAlerts(profile, corridor),
    vehicleSummary: profileSummary(profile),
  };
}

export function guidanceLine(route: InAppRoute, stepIndex = 0): string {
  const step = route.steps[Math.min(stepIndex, Math.max(0, route.steps.length - 1))];
  if (!step) return `Navigeer naar ${route.label}`;
  return step.highway ? `${step.instruction} (${step.highway})` : step.instruction;
}

export function criticalAlertCount(alerts: TruckAlert[]): number {
  return alerts.filter((a) => a.severity === 'critical').length;
}
