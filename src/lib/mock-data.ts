export type ComplianceStatus = 'Compliant' | 'Warning' | 'Critical';
export type TelematicsStatus = 'Online' | 'Offline';

export interface FleetTruckRow {
  truckId: string;
  licensePlate: string;
  model: string;
  driver: string;
  location: string;
  fuelLevel: number;
  activeSavings: number;
  compliance: ComplianceStatus;
  euroNorm: 'Euro 6' | 'Euro 5';
  telematics: TelematicsStatus;
  tankCapacity: number;
  avgConsumption: number;
}

export type PumpWaitStatus = 'geen' | 'druk' | 'storing';

export interface FuelStopRow {
  stationName: string;
  locationHighway: string;
  netPricePerL: number;
  detourMinutes: number;
  recommendedVolumeL: number;
  savingsEur: number;
  acceptedCards?: string[];
  adrCompliant?: boolean;
  clearanceHeightM?: number;
  waitStatus?: PumpWaitStatus;
  inTunnelRestriction?: boolean;
}

export interface EmergencyParkingSpot {
  id: string;
  name: string;
  type: 'Industriezone' | 'Partnerterrein' | 'Logistiek Hub';
  distanceKm: number;
  freeSpots: number;
  adrOk: boolean;
  secure: boolean;
}

export interface CardArbitrageRule {
  id: string;
  card: string;
  country: string;
  minLiters: number;
  surchargePerL: number;
  note: string;
  enabledDefault: boolean;
}

export interface ParkingSecurityRow {
  id: string;
  name: string;
  corridor: string;
  esporgLevel: 'Gold' | 'Silver' | 'Bronze' | 'Platinum';
  totalSpots: number;
  occupiedSpots: number;
  hasShowers: boolean;
  hasRestaurant: boolean;
  hasCamera: boolean;
  hasFence: boolean;
  combinedRestStop: boolean;
  hasAdBluePump?: boolean;
  boschCertified?: boolean;
  truckParkingEurope?: boolean;
}

export interface ReceiptDocument {
  id: string;
  type: 'tankbon' | 'cmr';
  fileName: string;
  stationName: string;
  truck: string;
  date: string;
  liters: number;
  netPricePerL: number;
  grossEur: number;
  vatDeEur: number;
  vatNlEur: number;
  provider: 'DKV' | 'UTA' | 'Shell';
  previewLabel: string;
  lineItems: { description: string; qty: number; unitPrice: number; total: number }[];
}

export interface DriverStopAdherence {
  driver: string;
  truck: string;
  approvedAutohofStops: number;
  unapprovedHighwayStops: number;
  score: number;
  policyHits: number;
  co2SavedKg: number;
}

export interface StationCompareRow {
  corridor: string;
  highwayStation: string;
  highwayPrice: number;
  autohofStation: string;
  autohofPrice: number;
  deltaPerL: number;
  cards: string[];
}

export interface InvoiceRow {
  id: string;
  provider: 'DKV' | 'UTA' | 'Shell';
  period: string;
  liters: number;
  grossEur: number;
  netEur: number;
  savingsEur: number;
  status: 'Betaald' | 'Open' | 'In controle';
  truckCount: number;
}

export const monthlySavings = [
  { month: 'Jan', savings: 3120 },
  { month: 'Feb', savings: 3480 },
  { month: 'Mrt', savings: 4010 },
  { month: 'Apr', savings: 3890 },
  { month: 'Mei', savings: 4420 },
  { month: 'Jun', savings: 4850 },
];

export const priceComparisonSeries = [
  { label: 'Jan', fuelroute: 1.61, highway: 1.78 },
  { label: 'Feb', fuelroute: 1.59, highway: 1.76 },
  { label: 'Mrt', fuelroute: 1.58, highway: 1.75 },
  { label: 'Apr', fuelroute: 1.57, highway: 1.74 },
  { label: 'Mei', fuelroute: 1.58, highway: 1.75 },
  { label: 'Jun', fuelroute: 1.58, highway: 1.75 },
];

export const fleetTrucks: FleetTruckRow[] = [
  {
    truckId: 'TRUCK-DE-101',
    licensePlate: '45-BJK-8',
    model: 'DAF XF 480',
    driver: 'Jan de Vries',
    location: 'Kassel (A7)',
    fuelLevel: 18.4,
    activeSavings: 83.5,
    compliance: 'Compliant',
    euroNorm: 'Euro 6',
    telematics: 'Online',
    tankCapacity: 600,
    avgConsumption: 28.5,
  },
  {
    truckId: 'TRUCK-DE-102',
    licensePlate: '12-34-AB',
    model: 'Volvo FH 500',
    driver: 'Pieter Smit',
    location: 'Würzburg (A3)',
    fuelLevel: 42.0,
    activeSavings: 61.2,
    compliance: 'Compliant',
    euroNorm: 'Euro 6',
    telematics: 'Online',
    tankCapacity: 750,
    avgConsumption: 29.0,
  },
  {
    truckId: 'TRUCK-NL-103',
    licensePlate: '99-XYZ-1',
    model: 'Scania R500',
    driver: 'Mark Jansen',
    location: 'Venlo Hub (A67)',
    fuelLevel: 67.5,
    activeSavings: 44.8,
    compliance: 'Compliant',
    euroNorm: 'Euro 6',
    telematics: 'Online',
    tankCapacity: 800,
    avgConsumption: 27.8,
  },
  {
    truckId: 'TRUCK-BE-104',
    licensePlate: '1-ABC-234',
    model: 'MAN TGX 18.510',
    driver: 'Thomas Peeters',
    location: 'Antwerpen Port',
    fuelLevel: 55.2,
    activeSavings: 52.1,
    compliance: 'Warning',
    euroNorm: 'Euro 6',
    telematics: 'Online',
    tankCapacity: 700,
    avgConsumption: 28.9,
  },
  {
    truckId: 'TRUCK-DE-105',
    licensePlate: 'M-FR-4501',
    model: 'Mercedes Actros 1848',
    driver: 'Klaus Berger',
    location: 'München Süd (A99)',
    fuelLevel: 31.0,
    activeSavings: 71.4,
    compliance: 'Compliant',
    euroNorm: 'Euro 6',
    telematics: 'Online',
    tankCapacity: 780,
    avgConsumption: 28.2,
  },
  {
    truckId: 'TRUCK-NL-106',
    licensePlate: '88-KLM-3',
    model: 'DAF XG 530',
    driver: 'Sander Bakker',
    location: 'Rotterdam Maasvlakte',
    fuelLevel: 78.6,
    activeSavings: 29.9,
    compliance: 'Compliant',
    euroNorm: 'Euro 6',
    telematics: 'Online',
    tankCapacity: 850,
    avgConsumption: 27.4,
  },
  {
    truckId: 'TRUCK-DE-107',
    licensePlate: 'HH-TX-882',
    model: 'Volvo FH 460',
    driver: 'Erik Hoffmann',
    location: 'Hamburg Harbor',
    fuelLevel: 22.8,
    activeSavings: 58.0,
    compliance: 'Warning',
    euroNorm: 'Euro 6',
    telematics: 'Offline',
    tankCapacity: 720,
    avgConsumption: 29.3,
  },
  {
    truckId: 'TRUCK-BE-108',
    licensePlate: '2-DEF-567',
    model: 'Iveco S-Way 490',
    driver: 'Luc Dubois',
    location: 'Liège Logistics',
    fuelLevel: 49.1,
    activeSavings: 36.7,
    compliance: 'Compliant',
    euroNorm: 'Euro 6',
    telematics: 'Online',
    tankCapacity: 650,
    avgConsumption: 28.7,
  },
  {
    truckId: 'TRUCK-NL-109',
    licensePlate: '77-QRS-2',
    model: 'Scania S450',
    driver: 'Omar El Amrani',
    location: 'Utrecht A2',
    fuelLevel: 61.3,
    activeSavings: 41.5,
    compliance: 'Compliant',
    euroNorm: 'Euro 6',
    telematics: 'Online',
    tankCapacity: 760,
    avgConsumption: 27.9,
  },
  {
    truckId: 'TRUCK-DE-110',
    licensePlate: 'K-FR-2210',
    model: 'MAN TGX 18.480',
    driver: 'Stefan Weber',
    location: 'Köln Nord (A1)',
    fuelLevel: 14.2,
    activeSavings: 92.3,
    compliance: 'Critical',
    euroNorm: 'Euro 6',
    telematics: 'Online',
    tankCapacity: 690,
    avgConsumption: 28.8,
  },
  {
    truckId: 'TRUCK-DE-111',
    licensePlate: 'F-LG-3344',
    model: 'DAF XF 450',
    driver: 'Hans Müller',
    location: 'Frankfurt Ost (A5)',
    fuelLevel: 38.9,
    activeSavings: 55.6,
    compliance: 'Compliant',
    euroNorm: 'Euro 6',
    telematics: 'Online',
    tankCapacity: 640,
    avgConsumption: 28.1,
  },
  {
    truckId: 'TRUCK-NL-112',
    licensePlate: '33-TUV-9',
    model: 'Volvo FH Electric*',
    driver: 'Lisa Vermeer',
    location: 'Tilburg DC',
    fuelLevel: 72.0,
    activeSavings: 18.4,
    compliance: 'Compliant',
    euroNorm: 'Euro 6',
    telematics: 'Offline',
    tankCapacity: 700,
    avgConsumption: 27.6,
  },
];

export const recommendedFuelStops: FuelStopRow[] = [
  {
    stationName: 'Autohof Lohfelden',
    locationHighway: 'A7 · Exit 79 · Kassel',
    netPricePerL: 1.582,
    detourMinutes: 2.5,
    recommendedVolumeL: 420,
    savingsEur: 18.9,
    acceptedCards: ['DKV', 'UTA', 'Shell'],
    adrCompliant: true,
    clearanceHeightM: 4.5,
    waitStatus: 'geen',
    inTunnelRestriction: false,
  },
  {
    stationName: 'Tankstelle Bad Hersfeld West',
    locationHighway: 'A4 · km 312 · DE',
    netPricePerL: 1.591,
    detourMinutes: 4.0,
    recommendedVolumeL: 280,
    savingsEur: 11.2,
    acceptedCards: ['DKV', 'UTA'],
    adrCompliant: false,
    clearanceHeightM: 4.0,
    waitStatus: 'druk',
    inTunnelRestriction: true,
  },
  {
    stationName: 'Autohof Hamminkeln',
    locationHighway: 'A3 · Border DE/NL',
    netPricePerL: 1.569,
    detourMinutes: 3.0,
    recommendedVolumeL: 500,
    savingsEur: 22.4,
    acceptedCards: ['DKV', 'UTA'],
    adrCompliant: true,
    clearanceHeightM: 4.4,
    waitStatus: 'geen',
    inTunnelRestriction: false,
  },
  {
    stationName: 'ARAL Truckstop Venlo',
    locationHighway: 'A67 · Venlo Hub · NL',
    netPricePerL: 1.599,
    detourMinutes: 1.5,
    recommendedVolumeL: 350,
    savingsEur: 9.8,
    acceptedCards: ['DKV', 'UTA'],
    adrCompliant: true,
    clearanceHeightM: 4.2,
    waitStatus: 'storing',
    inTunnelRestriction: false,
  },
  {
    stationName: 'Shell Autohof Bad Bentheim',
    locationHighway: 'A30 · Border NL/DE',
    netPricePerL: 1.575,
    detourMinutes: 2.0,
    recommendedVolumeL: 390,
    savingsEur: 14.6,
    acceptedCards: ['DKV', 'Shell'],
    adrCompliant: true,
    clearanceHeightM: 4.5,
    waitStatus: 'druk',
    inTunnelRestriction: false,
  },
  {
    stationName: 'TotalEnergies Rasthof Würzburg Nord',
    locationHighway: 'A3 · Würzburg · DE',
    netPricePerL: 1.605,
    detourMinutes: 5.5,
    recommendedVolumeL: 300,
    savingsEur: 7.1,
    acceptedCards: ['DKV', 'UTA'],
    adrCompliant: false,
    clearanceHeightM: 3.9,
    waitStatus: 'geen',
    inTunnelRestriction: true,
  },
  {
    stationName: 'OMV Truckstop Rozvadov',
    locationHighway: 'D5 · Border DE/CZ · Rozvadov',
    netPricePerL: 1.489,
    detourMinutes: 4.0,
    recommendedVolumeL: 480,
    savingsEur: 38.5,
    acceptedCards: ['DKV', 'UTA'],
    adrCompliant: true,
    clearanceHeightM: 4.4,
    waitStatus: 'geen',
    inTunnelRestriction: false,
  },
  {
    stationName: 'EuroOil Praha Západ',
    locationHighway: 'D5 · Praha · CZ',
    netPricePerL: 1.452,
    detourMinutes: 6.0,
    recommendedVolumeL: 420,
    savingsEur: 52.0,
    acceptedCards: ['DKV', 'UTA'],
    adrCompliant: true,
    clearanceHeightM: 4.3,
    waitStatus: 'druk',
    inTunnelRestriction: false,
  },
];

export const emergencyParkingSpots: EmergencyParkingSpot[] = [
  {
    id: 'ep1',
    name: 'Industriepark Lohfelden Ost',
    type: 'Industriezone',
    distanceKm: 4.2,
    freeSpots: 6,
    adrOk: true,
    secure: false,
  },
  {
    id: 'ep2',
    name: 'DB Schenker Partner Yard Kassel',
    type: 'Partnerterrein',
    distanceKm: 7.8,
    freeSpots: 3,
    adrOk: true,
    secure: true,
  },
  {
    id: 'ep3',
    name: 'Secure Logistics Hub Baunatal',
    type: 'Logistiek Hub',
    distanceKm: 11.5,
    freeSpots: 9,
    adrOk: true,
    secure: true,
  },
  {
    id: 'ep4',
    name: 'Gewerbegebiet Fuldabrück',
    type: 'Industriezone',
    distanceKm: 14.1,
    freeSpots: 2,
    adrOk: false,
    secure: false,
  },
];

export const cardArbitrageRules: CardArbitrageRule[] = [
  {
    id: 'r1',
    card: 'Shell',
    country: 'DE',
    minLiters: 200,
    surchargePerL: 0.0,
    note: 'Shell DE nettoprijs zonder toeslag vanaf 200 L',
    enabledDefault: true,
  },
  {
    id: 'r2',
    card: 'DKV',
    country: 'FR',
    minLiters: 300,
    surchargePerL: 0.025,
    note: 'DKV FR toeslag €0,025/L onder 300 L',
    enabledDefault: true,
  },
  {
    id: 'r3',
    card: 'UTA',
    country: 'BE',
    minLiters: 150,
    surchargePerL: 0.015,
    note: 'UTA BE minimale litertoeslag onder 150 L',
    enabledDefault: false,
  },
  {
    id: 'r4',
    card: 'DKV',
    country: 'DE',
    minLiters: 250,
    surchargePerL: 0.01,
    note: 'DKV DE high-flow korting alleen ≥250 L',
    enabledDefault: true,
  },
];

export const parkingSecurity: ParkingSecurityRow[] = [
  {
    id: 'p1',
    name: 'Parkplatz Bad Bentheim Nord',
    corridor: 'A30',
    esporgLevel: 'Gold',
    totalSpots: 80,
    occupiedSpots: 68,
    hasShowers: true,
    hasRestaurant: true,
    hasCamera: true,
    hasFence: true,
    combinedRestStop: true,
    hasAdBluePump: true,
    boschCertified: true,
    truckParkingEurope: true,
  },
  {
    id: 'p2',
    name: 'Truck Parking Würzburg A3',
    corridor: 'A3',
    esporgLevel: 'Silver',
    totalSpots: 120,
    occupiedSpots: 112,
    hasShowers: true,
    hasRestaurant: true,
    hasCamera: true,
    hasFence: false,
    combinedRestStop: true,
    hasAdBluePump: true,
    boschCertified: false,
    truckParkingEurope: true,
  },
  {
    id: 'p3',
    name: 'ESPORG Secure Park Lohfelden',
    corridor: 'A7',
    esporgLevel: 'Platinum',
    totalSpots: 95,
    occupiedSpots: 71,
    hasShowers: true,
    hasRestaurant: true,
    hasCamera: true,
    hasFence: true,
    combinedRestStop: true,
    hasAdBluePump: true,
    boschCertified: true,
    truckParkingEurope: true,
  },
  {
    id: 'p4',
    name: 'Venlo Logistics Overnight',
    corridor: 'A67',
    esporgLevel: 'Silver',
    totalSpots: 140,
    occupiedSpots: 96,
    hasShowers: true,
    hasRestaurant: false,
    hasCamera: true,
    hasFence: true,
    combinedRestStop: false,
    hasAdBluePump: false,
    boschCertified: false,
    truckParkingEurope: true,
  },
  {
    id: 'p5',
    name: 'Hamminkeln Guarded Lot',
    corridor: 'A3',
    esporgLevel: 'Gold',
    totalSpots: 60,
    occupiedSpots: 41,
    hasShowers: true,
    hasRestaurant: true,
    hasCamera: true,
    hasFence: true,
    combinedRestStop: true,
    hasAdBluePump: true,
    boschCertified: true,
    truckParkingEurope: false,
  },
];

export const vatRefundByCountry = [
  { country: 'NL', countryName: 'Nederland', eligibleVatEur: 18420.5, exciseEur: 0, receipts: 86, status: 'Automatisch' },
  { country: 'DE', countryName: 'Duitsland', eligibleVatEur: 31240.8, exciseEur: 4210.2, receipts: 142, status: 'In behandeling' },
  { country: 'BE', countryName: 'België', eligibleVatEur: 9860.4, exciseEur: 1120.0, receipts: 38, status: 'Automatisch' },
  { country: 'FR', countryName: 'Frankrijk', eligibleVatEur: 6420.1, exciseEur: 880.5, receipts: 24, status: 'Handmatig' },
];


export const receiptDocuments: ReceiptDocument[] = [
  {
    id: 'RCP-88421',
    type: 'tankbon',
    fileName: 'tankbon_lohfelden_88421.jpg',
    stationName: 'Autohof Lohfelden',
    truck: '45-BJK-8',
    date: '2026-08-08',
    liters: 412.4,
    netPricePerL: 1.582,
    grossEur: 718.42,
    vatDeEur: 98.12,
    vatNlEur: 0,
    provider: 'DKV',
    previewLabel: 'Tankbon · Autohof Lohfelden',
    lineItems: [
      { description: 'Diesel B7 sneltankpomp', qty: 412.4, unitPrice: 1.582, total: 652.42 },
      { description: 'AdBlue', qty: 28, unitPrice: 0.89, total: 24.92 },
      { description: 'Btw DE 19%', qty: 1, unitPrice: 98.12, total: 98.12 },
    ],
  },
  {
    id: 'RCP-88455',
    type: 'tankbon',
    fileName: 'tankbon_venlo_88455.jpg',
    stationName: 'ARAL Truckstop Venlo',
    truck: '12-34-AB',
    date: '2026-08-07',
    liters: 355.0,
    netPricePerL: 1.599,
    grossEur: 628.45,
    vatDeEur: 0,
    vatNlEur: 109.2,
    provider: 'UTA',
    previewLabel: 'Tankbon · ARAL Venlo',
    lineItems: [
      { description: 'Diesel B7', qty: 355, unitPrice: 1.599, total: 567.65 },
      { description: 'Btw NL 21%', qty: 1, unitPrice: 109.2, total: 109.2 },
    ],
  },
  {
    id: 'CMR-22011',
    type: 'cmr',
    fileName: 'cmr_kassel_muenchen_22011.jpg',
    stationName: 'CMR · Kassel → München',
    truck: '45-BJK-8',
    date: '2026-08-08',
    liters: 0,
    netPricePerL: 0,
    grossEur: 0,
    vatDeEur: 0,
    vatNlEur: 0,
    provider: 'DKV',
    previewLabel: 'CMR-vrachtbrief',
    lineItems: [
      { description: 'Lading: gekoelde levensmiddelen', qty: 22, unitPrice: 0, total: 0 },
      { description: 'Brutogewicht (ton)', qty: 22, unitPrice: 0, total: 0 },
    ],
  },
];

export const driverStopAdherence: DriverStopAdherence[] = [
  {
    driver: 'Jan de Vries',
    truck: '45-BJK-8',
    approvedAutohofStops: 18,
    unapprovedHighwayStops: 0,
    score: 99.2,
    policyHits: 0,
    co2SavedKg: 1840,
  },
  {
    driver: 'Pieter Smit',
    truck: '12-34-AB',
    approvedAutohofStops: 14,
    unapprovedHighwayStops: 1,
    score: 96.8,
    policyHits: 1,
    co2SavedKg: 1520,
  },
  {
    driver: 'Mark Jansen',
    truck: '99-XYZ-1',
    approvedAutohofStops: 16,
    unapprovedHighwayStops: 0,
    score: 98.1,
    policyHits: 0,
    co2SavedKg: 1690,
  },
  {
    driver: 'Thomas Peeters',
    truck: '1-ABC-234',
    approvedAutohofStops: 9,
    unapprovedHighwayStops: 3,
    score: 91.4,
    policyHits: 3,
    co2SavedKg: 980,
  },
  {
    driver: 'Klaus Berger',
    truck: 'M-FR-4501',
    approvedAutohofStops: 13,
    unapprovedHighwayStops: 1,
    score: 97.5,
    policyHits: 1,
    co2SavedKg: 1410,
  },
  {
    driver: 'Sander Bakker',
    truck: '88-KLM-3',
    approvedAutohofStops: 19,
    unapprovedHighwayStops: 0,
    score: 99.6,
    policyHits: 0,
    co2SavedKg: 1760,
  },
  {
    driver: 'Erik Hoffmann',
    truck: 'HH-TX-882',
    approvedAutohofStops: 7,
    unapprovedHighwayStops: 4,
    score: 88.2,
    policyHits: 4,
    co2SavedKg: 720,
  },
  {
    driver: 'Luc Dubois',
    truck: '2-DEF-567',
    approvedAutohofStops: 12,
    unapprovedHighwayStops: 1,
    score: 95.9,
    policyHits: 1,
    co2SavedKg: 1180,
  },
];

export const stationComparisons: StationCompareRow[] = [
  {
    corridor: 'A3 · Arnhem → Frankfurt',
    highwayStation: 'Raststätte Spessart Süd',
    highwayPrice: 1.749,
    autohofStation: 'Autohof Rohrbrunn',
    autohofPrice: 1.598,
    deltaPerL: 0.151,
    cards: ['DKV', 'UTA'],
  },
  {
    corridor: 'A7 · Hamburg → München',
    highwayStation: 'Raststätte Göttinger Land',
    highwayPrice: 1.762,
    autohofStation: 'Autohof Lohfelden',
    autohofPrice: 1.582,
    deltaPerL: 0.18,
    cards: ['DKV', 'UTA', 'Shell'],
  },
  {
    corridor: 'A1 · Köln → Bremen',
    highwayStation: 'Raststätte Münsterland Nord',
    highwayPrice: 1.735,
    autohofStation: 'Autohof Ladbergen',
    autohofPrice: 1.601,
    deltaPerL: 0.134,
    cards: ['DKV', 'Shell'],
  },
  {
    corridor: 'A67 / E34 · Antwerpen → Venlo',
    highwayStation: 'Raststätte Meerhout',
    highwayPrice: 1.689,
    autohofStation: 'ARAL Truckstop Venlo',
    autohofPrice: 1.599,
    deltaPerL: 0.09,
    cards: ['DKV', 'UTA', 'BP'],
  },
  {
    corridor: 'A30 · Hengelo → Osnabrück',
    highwayStation: 'Raststätte Grönegau',
    highwayPrice: 1.728,
    autohofStation: 'Shell Autohof Bad Bentheim',
    autohofPrice: 1.575,
    deltaPerL: 0.153,
    cards: ['DKV', 'UTA', 'Shell'],
  },
  {
    corridor: 'A4 · Köln → Dresden',
    highwayStation: 'Raststätte Eisenach',
    highwayPrice: 1.755,
    autohofStation: 'Tankstelle Bad Hersfeld West',
    autohofPrice: 1.591,
    deltaPerL: 0.164,
    cards: ['DKV', 'UTA'],
  },
  {
    corridor: 'A2 · Dortmund → Hannover',
    highwayStation: 'Raststätte Bielefeld',
    highwayPrice: 1.741,
    autohofStation: 'Autohof Gütersloh',
    autohofPrice: 1.588,
    deltaPerL: 0.153,
    cards: ['DKV', 'UTA', 'Shell'],
  },
  {
    corridor: 'E19 · Bruxelles → Antwerpen',
    highwayStation: 'Aire de Nivelles',
    highwayPrice: 1.702,
    autohofStation: 'Q8 Truckstop Boom',
    autohofPrice: 1.612,
    deltaPerL: 0.09,
    cards: ['DKV', 'UTA'],
  },
];

export const fuelInvoices: InvoiceRow[] = [
  {
    id: 'INV-DKV-2026-06',
    provider: 'DKV',
    period: 'Juni 2026',
    liters: 42850,
    grossEur: 71240.5,
    netEur: 67850.2,
    savingsEur: 3120.4,
    status: 'Betaald',
    truckCount: 12,
  },
  {
    id: 'INV-UTA-2026-06',
    provider: 'UTA',
    period: 'Juni 2026',
    liters: 18620,
    grossEur: 31240.8,
    netEur: 29780.1,
    savingsEur: 1240.6,
    status: 'Betaald',
    truckCount: 8,
  },
  {
    id: 'INV-DKV-2026-07',
    provider: 'DKV',
    period: 'Juli 2026',
    liters: 45110,
    grossEur: 74180.3,
    netEur: 70520.9,
    savingsEur: 3485.2,
    status: 'In controle',
    truckCount: 12,
  },
  {
    id: 'INV-UTA-2026-07',
    provider: 'UTA',
    period: 'Juli 2026',
    liters: 19240,
    grossEur: 32110.4,
    netEur: 30580.7,
    savingsEur: 1310.8,
    status: 'Open',
    truckCount: 9,
  },
  {
    id: 'INV-SHELL-2026-07',
    provider: 'Shell',
    period: 'Juli 2026',
    liters: 6240,
    grossEur: 10480.2,
    netEur: 9980.5,
    savingsEur: 420.1,
    status: 'Open',
    truckCount: 4,
  },
];

export const complianceDrivers = [
  { driver: 'Jan de Vries', truck: '45-BJK-8', score: 99.2, policyHits: 0, co2SavedKg: 1840 },
  { driver: 'Pieter Smit', truck: '12-34-AB', score: 96.8, policyHits: 1, co2SavedKg: 1520 },
  { driver: 'Mark Jansen', truck: '99-XYZ-1', score: 98.1, policyHits: 0, co2SavedKg: 1690 },
  { driver: 'Thomas Peeters', truck: '1-ABC-234', score: 91.4, policyHits: 3, co2SavedKg: 980 },
  { driver: 'Klaus Berger', truck: 'M-FR-4501', score: 97.5, policyHits: 1, co2SavedKg: 1410 },
  { driver: 'Sander Bakker', truck: '88-KLM-3', score: 99.6, policyHits: 0, co2SavedKg: 1760 },
  { driver: 'Erik Hoffmann', truck: 'HH-TX-882', score: 88.2, policyHits: 4, co2SavedKg: 720 },
  { driver: 'Luc Dubois', truck: '2-DEF-567', score: 95.9, policyHits: 1, co2SavedKg: 1180 },
];

export type FleetAlertType = 'diefstal' | 'schade' | 'parkeerplek';

export interface FleetAlert {
  id: string;
  truckId: string;
  type: FleetAlertType;
  title: string;
  detail: string;
  at: string;
  severity: 'hoog' | 'middel' | 'info';
}

export const fleetAlerts: FleetAlert[] = [
  {
    id: 'fa1',
    truckId: 'TRUCK-DE-101',
    type: 'diefstal',
    title: 'Verdachte nachtelijke brandstofdaling',
    detail: '−48 L tussen 02:14–03:02 zonder tanktransactie',
    at: 'Vandaag 03:05',
    severity: 'hoog',
  },
  {
    id: 'fa2',
    truckId: 'TRUCK-NL-103',
    type: 'schade',
    title: 'AI-detectie zijpaneelschade',
    detail: 'Nieuwe deuk rechtsachter herkend via walkaround-foto',
    at: 'Vandaag 06:41',
    severity: 'middel',
  },
  {
    id: 'fa3',
    truckId: 'TRUCK-DE-105',
    type: 'parkeerplek',
    title: '1 Vrachtwagenplek zojuist vrijgekomen',
    detail: 'ESPORG Autohof Lohfelden · bij vertrek TRUCK-BE-104',
    at: 'Zojuist',
    severity: 'info',
  },
  {
    id: 'fa4',
    truckId: 'TRUCK-BE-104',
    type: 'diefstal',
    title: 'Onverklaarde tankdaling overnight',
    detail: '−22 L bij stilstand · geen CMR-tankbon',
    at: 'Gisteren 23:18',
    severity: 'hoog',
  },
  {
    id: 'fa5',
    truckId: 'TRUCK-NL-112',
    type: 'schade',
    title: 'AI-paneelschade bumper voor',
    detail: 'Vergelijking met vorige inspectie · claimdossier geopend',
    at: 'Gisteren 18:02',
    severity: 'middel',
  },
];

export const communityParkingEvents = [
  {
    id: 'cp1',
    message: '1 Vrachtwagenplek zojuist vrijgekomen bij vertrek',
    location: 'Autohof Lohfelden · A7',
    minutesAgo: 2,
  },
  {
    id: 'cp2',
    message: '2 plekken vrij na vertrek tandem',
    location: 'Secure Hub Baunatal',
    minutesAgo: 11,
  },
  {
    id: 'cp3',
    message: '1 Vrachtwagenplek zojuist vrijgekomen bij vertrek',
    location: 'ARAL Truckstop Venlo',
    minutesAgo: 28,
  },
];

export type MatchStatus = 'Match' | 'Afwijking' | 'Controle';

export interface InvoiceMatchRow {
  id: string;
  provider: 'DKV' | 'UTA' | 'Shell';
  receiptId: string;
  truck: string;
  litersInvoice: number;
  litersReceipt: number;
  gpsMoving: boolean;
  status: MatchStatus;
  flag: string;
}

export const invoiceMatchRows: InvoiceMatchRow[] = [
  {
    id: 'IM-01',
    provider: 'DKV',
    receiptId: 'RCP-88421',
    truck: '45-BJK-8',
    litersInvoice: 412.4,
    litersReceipt: 412.4,
    gpsMoving: true,
    status: 'Match',
    flag: 'Bon + GPS + factuurregel in balans',
  },
  {
    id: 'IM-02',
    provider: 'Shell',
    receiptId: '—',
    truck: '99-XYZ-1',
    litersInvoice: 180.0,
    litersReceipt: 0,
    gpsMoving: false,
    status: 'Afwijking',
    flag: 'Mogelijke afwijking: Tankbeurt geregistreerd terwijl truck stilstond',
  },
  {
    id: 'IM-03',
    provider: 'UTA',
    receiptId: 'RCP-88455',
    truck: '12-34-AB',
    litersInvoice: 360.0,
    litersReceipt: 355.0,
    gpsMoving: true,
    status: 'Controle',
    flag: 'Litersfactuur +5 L t.o.v. gescande bon',
  },
  {
    id: 'IM-04',
    provider: 'DKV',
    receiptId: '—',
    truck: '88-KLM-3',
    litersInvoice: 95.0,
    litersReceipt: 0,
    gpsMoving: false,
    status: 'Afwijking',
    flag: 'Mogelijke afwijking: Tankbeurt geregistreerd terwijl truck stilstond',
  },
];

export const gloveboxDocuments = [
  {
    id: 'gb1',
    title: 'Kentekenbewijs deel I',
    category: 'Registratie',
    expires: '2031-04-12',
    status: 'Geldig' as const,
  },
  {
    id: 'gb2',
    title: 'Eurovignet',
    category: 'Tol',
    expires: '2026-09-30',
    status: 'Verloopt binnenkort' as const,
  },
  {
    id: 'gb3',
    title: 'WA-verzekering',
    category: 'Verzekering',
    expires: '2026-12-01',
    status: 'Geldig' as const,
  },
  {
    id: 'gb4',
    title: 'APK-keuring',
    category: 'Keuring',
    expires: '2026-08-22',
    status: 'Verloopt binnenkort' as const,
  },
];

export const expenseDeclarations = [
  { id: 'ex1', type: 'Tol', amount: 48.2, note: 'Lkw-Maut DE A7', date: '2026-08-08' },
  { id: 'ex2', type: 'Truckwash', amount: 32.5, note: 'Autohof wasstraat', date: '2026-08-07' },
  { id: 'ex3', type: 'Maaltijd', amount: 14.9, note: 'Ruststop diner', date: '2026-08-07' },
  { id: 'ex4', type: 'Veerboot', amount: 186.0, note: 'Dover–Calais', date: '2026-08-05' },
];

export const geofenceDestinations = [
  {
    id: 'gf1',
    client: 'München Distribution',
    radiusKm: 5,
    distanceKm: 4.2,
    inside: true,
    notifySms: true,
    notifyEmail: true,
    lastNotify: 'SMS + e-mail · 14:02',
  },
  {
    id: 'gf2',
    client: 'Duisburg Hub',
    radiusKm: 5,
    distanceKm: 18.6,
    inside: false,
    notifySms: true,
    notifyEmail: false,
    lastNotify: 'Nog niet getriggerd',
  },
  {
    id: 'gf3',
    client: 'Antwerpen Port Gate C',
    radiusKm: 5,
    distanceKm: 3.1,
    inside: true,
    notifySms: true,
    notifyEmail: true,
    lastNotify: 'E-mail · 11:48',
  },
];

export const ecoScoreLeaderboard = [
  { rank: 1, driver: 'Sander Bakker', ecoScore: 98, policyScore: 99.6, fuelLPer100: 26.1 },
  { rank: 2, driver: 'Jan de Vries', ecoScore: 97, policyScore: 99.2, fuelLPer100: 26.4 },
  { rank: 3, driver: 'Mark Jansen', ecoScore: 95, policyScore: 98.1, fuelLPer100: 27.0 },
  { rank: 4, driver: 'Klaus Berger', ecoScore: 93, policyScore: 97.5, fuelLPer100: 27.3 },
  { rank: 5, driver: 'Pieter Smit', ecoScore: 90, policyScore: 96.8, fuelLPer100: 28.1 },
  { rank: 6, driver: 'Erik Hoffmann', ecoScore: 82, policyScore: 88.2, fuelLPer100: 30.4 },
];

export const trailerTracking = [
  {
    id: 'TRL-4401',
    type: 'Oplegger koel',
    plate: 'OW-TR-992',
    lat: 51.312,
    lng: 9.479,
    location: 'Kassel Hub',
    status: 'Gekoppeld',
    cargo: 'Gekoeld · 22t',
  },
  {
    id: 'TRL-4418',
    type: 'Wissellaadbak',
    plate: 'WLB-118',
    lat: 51.434,
    lng: 6.762,
    location: 'Duisburg Yard',
    status: 'Ongekoppeld',
    cargo: 'Leeg',
  },
  {
    id: 'TRL-4422',
    type: 'Oplegger droge lading',
    plate: 'OW-TR-210',
    lat: 51.219,
    lng: 4.402,
    location: 'Antwerpen Port',
    status: 'Ongekoppeld',
    cargo: 'Pallets · 18t',
  },
];

export const weatherAlerts = [
  {
    id: 'w1',
    type: 'Zijwind',
    severity: 'hoog',
    message: 'Zware zijwind A7 km 240–280 · max 85 km/h aanbevolen',
    audio: true,
  },
  {
    id: 'w2',
    type: 'IJzel',
    severity: 'middel',
    message: 'IJzelrisico nachtrustzone Bad Hersfeld · verhoogde remweg',
    audio: true,
  },
  {
    id: 'w3',
    type: 'Hittegolf',
    severity: 'info',
    message: 'Hittegolf DE zuid · controleer bandenspanning & koeltrailer',
    audio: false,
  },
];

export const communityDriverTips = [
  {
    id: 'tip1',
    address: 'München Distribution Gate B',
    tip: 'Smalle inrit · max 2,55 m · bel code #4412 · douches links na portier',
    author: 'Jan de Vries',
  },
  {
    id: 'tip2',
    address: 'Autohof Lohfelden parking Oost',
    tip: 'Beste douches bij restaurant · ADR-parkeerplaatsen rij 3',
    author: 'Pieter Smit',
  },
  {
    id: 'tip3',
    address: 'Duisburg Hub Dock 7',
    tip: 'Poortcode wisselt dagelijks · bel planner · geen keren op helling',
    author: 'Mark Jansen',
  },
];

export type AltFuelKind = 'Diesel' | 'LNG' | 'Waterstof' | 'Elektrisch';

export const altFuelStations = [
  {
    id: 'af1',
    name: 'Shell LNG Duisburg',
    kind: 'LNG' as AltFuelKind,
    highway: 'A3 · Duisburg',
    detourMin: 3,
  },
  {
    id: 'af2',
    name: 'H2 Mobility Kassel',
    kind: 'Waterstof' as AltFuelKind,
    highway: 'A7 · Kassel',
    detourMin: 8,
  },
  {
    id: 'af3',
    name: 'Ionity Truck Charge München',
    kind: 'Elektrisch' as AltFuelKind,
    highway: 'A9 · München Noord',
    detourMin: 5,
  },
  {
    id: 'af4',
    name: 'TotalEnergies LNG Würzburg',
    kind: 'LNG' as AltFuelKind,
    highway: 'A3 · Würzburg',
    detourMin: 4,
  },
];

export type FuelCardProvider = 'DKV' | 'UTA' | 'Shell' | 'BP' | 'AS24' | 'EDC';

export interface NetPriceMatrixRow {
  station: string;
  corridor: string;
  pumpPrice: number;
  nets: Record<FuelCardProvider, number>;
}

export const netPriceMatrix: NetPriceMatrixRow[] = [
  {
    station: 'Autohof Lohfelden',
    corridor: 'A7 DE',
    pumpPrice: 1.689,
    nets: { DKV: 1.582, UTA: 1.588, Shell: 1.575, BP: 1.595, AS24: 1.579, EDC: 1.591 },
  },
  {
    station: 'ARAL Truckstop Venlo',
    corridor: 'A67 NL',
    pumpPrice: 1.699,
    nets: { DKV: 1.599, UTA: 1.592, Shell: 1.605, BP: 1.601, AS24: 1.588, EDC: 1.598 },
  },
  {
    station: 'Shell Autohof Bad Bentheim',
    corridor: 'A30 DE',
    pumpPrice: 1.679,
    nets: { DKV: 1.585, UTA: 1.59, Shell: 1.565, BP: 1.598, AS24: 1.58, EDC: 1.593 },
  },
  {
    station: 'TotalEnergies Würzburg Nord',
    corridor: 'A3 DE',
    pumpPrice: 1.705,
    nets: { DKV: 1.605, UTA: 1.61, Shell: 1.612, BP: 1.608, AS24: 1.599, EDC: 1.615 },
  },
];

export const eetsTollRates = [
  { country: 'DE', label: 'Duitsland Lkw-Maut', ratePerKm: 0.19 },
  { country: 'FR', label: 'Frankrijk EETS/toll', ratePerKm: 0.22 },
  { country: 'BE', label: 'België Viapass', ratePerKm: 0.17 },
];

export const borderWaitTimes = [
  {
    id: 'bw1',
    crossing: 'Dover / Calais',
    waitMinutes: 48,
    idleFuelLPerH: 3.2,
    severity: 'hoog' as const,
  },
  {
    id: 'bw2',
    crossing: 'PL / UA (Korczowa)',
    waitMinutes: 95,
    idleFuelLPerH: 3.5,
    severity: 'hoog' as const,
  },
  {
    id: 'bw3',
    crossing: 'CH Basel / Weil',
    waitMinutes: 22,
    idleFuelLPerH: 2.8,
    severity: 'middel' as const,
  },
  {
    id: 'bw4',
    crossing: 'NL / DE Venlo',
    waitMinutes: 8,
    idleFuelLPerH: 2.5,
    severity: 'laag' as const,
  },
];

export const synchronizedRestStops = [
  {
    stationName: 'Autohof Lohfelden',
    fuelLiters: 420,
    restType: '45 min tachograafrust',
    regulation: 'EG 561/2006',
    dailyRestOption: '9u verkorte dagelijkse rust',
  },
  {
    stationName: 'Autohof Hamminkeln',
    fuelLiters: 500,
    restType: '45 min tachograafrust',
    regulation: 'EG 561/2006',
    dailyRestOption: '11u reguliere dagelijkse rust',
  },
];

export interface MaintenanceItem {
  truckId: string;
  plate: string;
  odometerKm: number;
  nextServiceKm: number;
  message: string;
  type: 'grote_beurt' | 'banden' | 'apk' | 'olie';
  partner?: string;
}

export const maintenanceSchedule: MaintenanceItem[] = [
  {
    truckId: 'TRUCK-DE-101',
    plate: '45-BJK-8',
    odometerKm: 468800,
    nextServiceKm: 472000,
    message: 'Grote beurt nodig over 3.200 km',
    type: 'grote_beurt',
    partner: 'DAF Partner Kassel',
  },
  {
    truckId: 'TRUCK-NL-103',
    plate: '12-34-AB',
    odometerKm: 312400,
    nextServiceKm: 315000,
    message: 'Winterbanden wissel ingepland',
    type: 'banden',
    partner: 'Euromaster Venlo',
  },
  {
    truckId: 'TRUCK-DE-105',
    plate: '99-XYZ-1',
    odometerKm: 521100,
    nextServiceKm: 522500,
    message: 'Olieverversing over 1.400 km',
    type: 'olie',
    partner: 'Bosch Car Service Duisburg',
  },
  {
    truckId: 'TRUCK-BE-104',
    plate: '1-ABC-234',
    odometerKm: 198200,
    nextServiceKm: 210000,
    message: 'APK-voorbereiding over 11.800 km',
    type: 'apk',
    partner: 'Volvo Truck Center Antwerpen',
  },
];

export const servicePartners = [
  'DAF Partner Kassel',
  'Euromaster Venlo',
  'Bosch Car Service Duisburg',
  'Volvo Truck Center Antwerpen',
  'MAN Service München',
];

