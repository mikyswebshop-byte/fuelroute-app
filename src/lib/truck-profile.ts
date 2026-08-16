/**
 * Actief voertuigprofiel voor trucknavigatie.
 * Bepaalt doorrijhoogte, tonnage, ADR, speciaal transport, enz.
 */

export type ComboType =
  | 'trekker_oplegger'
  | 'trekker_aanhanger'
  | 'bakwagen'
  | 'lzv'
  | 'speciaal_transport';

export type TruckProfile = {
  truckPlate: string;
  trailerPlate: string;
  model: string;
  comboType: ComboType;
  trailerCoupled: boolean;
  /** Totale combinatiehoogte (m) */
  heightM: number;
  widthM: number;
  lengthM: number;
  /** Bruto combinatiegewicht (t) */
  grossWeightT: number;
  axleCount: number;
  maxAxleLoadT: number;
  euroClass: 'Euro 5' | 'Euro 6' | 'Euro 6e';
  adr: boolean;
  adrClass: string;
  /** Tunnelcode ADR (A–E), leeg indien geen ADR */
  adrTunnelCode: string;
  refrigerated: boolean;
  specialTransport: boolean;
  /** Bijv. breedte > 2,55 m, lengte > 16,5 m, begeleidingswagen */
  specialNotes: string;
  escortRequired: boolean;
};

export const COMBO_LABELS: Record<ComboType, string> = {
  trekker_oplegger: 'Trekker + oplegger',
  trekker_aanhanger: 'Trekker + aanhanger',
  bakwagen: 'Bakwagen (star)',
  lzv: 'LZV / Ecocombi',
  speciaal_transport: 'Speciaal / exceptioneel transport',
};

export const DEFAULT_TRUCK_PROFILE: TruckProfile = {
  truckPlate: '45-BJK-8',
  trailerPlate: 'OW-TR-992',
  model: 'DAF XF 480 + koeloplegger',
  comboType: 'trekker_oplegger',
  trailerCoupled: true,
  heightM: 4.0,
  widthM: 2.55,
  lengthM: 16.5,
  grossWeightT: 40,
  axleCount: 5,
  maxAxleLoadT: 11.5,
  euroClass: 'Euro 6',
  adr: false,
  adrClass: '',
  adrTunnelCode: '',
  refrigerated: true,
  specialTransport: false,
  specialNotes: '',
  escortRequired: false,
};

const STORAGE_KEY = 'fuelroute-truck-profile';

export function loadTruckProfile(): TruckProfile {
  if (typeof window === 'undefined') return DEFAULT_TRUCK_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_TRUCK_PROFILE;
    return { ...DEFAULT_TRUCK_PROFILE, ...(JSON.parse(raw) as Partial<TruckProfile>) };
  } catch {
    return DEFAULT_TRUCK_PROFILE;
  }
}

export function saveTruckProfile(profile: TruckProfile) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    /* ignore */
  }
}

/** Presets wanneer combo-type wisselt. */
export function applyComboPreset(combo: ComboType, current: TruckProfile): TruckProfile {
  const base = { ...current, comboType: combo };
  switch (combo) {
    case 'bakwagen':
      return {
        ...base,
        trailerPlate: '—',
        trailerCoupled: false,
        lengthM: 12,
        heightM: 3.8,
        widthM: 2.55,
        grossWeightT: 26,
        axleCount: 3,
        specialTransport: false,
        escortRequired: false,
      };
    case 'trekker_aanhanger':
      return {
        ...base,
        trailerCoupled: true,
        lengthM: 18.75,
        heightM: 4.0,
        widthM: 2.55,
        grossWeightT: 40,
        axleCount: 6,
        specialTransport: false,
      };
    case 'lzv':
      return {
        ...base,
        trailerCoupled: true,
        lengthM: 25.25,
        heightM: 4.0,
        widthM: 2.55,
        grossWeightT: 60,
        axleCount: 7,
        specialTransport: true,
        specialNotes: 'LZV — alleen toegestane corridors / vergunning',
        escortRequired: false,
      };
    case 'speciaal_transport':
      return {
        ...base,
        trailerCoupled: true,
        lengthM: 22,
        heightM: 4.2,
        widthM: 3.0,
        grossWeightT: 48,
        axleCount: 6,
        specialTransport: true,
        specialNotes: 'Exceptioneel transport — vergunning & begeleidingswagen vereist',
        escortRequired: true,
      };
    default:
      return {
        ...base,
        trailerCoupled: true,
        lengthM: 16.5,
        heightM: 4.0,
        widthM: 2.55,
        grossWeightT: 40,
        axleCount: 5,
        specialTransport: false,
        escortRequired: false,
        specialNotes: '',
      };
  }
}

export function profileSummary(p: TruckProfile): string {
  const combo = COMBO_LABELS[p.comboType];
  const trailer = p.trailerCoupled ? p.trailerPlate : 'geen trailer';
  return `${p.truckPlate} / ${trailer} · ${combo} · ${p.heightM.toFixed(1)} m · ${p.grossWeightT} t`;
}
