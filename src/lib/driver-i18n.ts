/**
 * Chauffeur-cockpit vertalingen.
 * App-locale → deze driver-dicts; ontbrekende talen vallen terug op EN.
 */

import type { AppLocale } from '@/lib/i18n';

export type DriverLang = 'NL' | 'EN' | 'PL' | 'RO' | 'DE' | 'BG' | 'UKR' | 'LT' | 'CS' | 'FR';

export const DRIVER_LANGS: { code: DriverLang; label: string }[] = [
  { code: 'NL', label: 'Nederlands' },
  { code: 'DE', label: 'Deutsch' },
  { code: 'EN', label: 'English' },
  { code: 'PL', label: 'Polski' },
  { code: 'RO', label: 'Română' },
  { code: 'BG', label: 'Български' },
  { code: 'CS', label: 'Čeština' },
  { code: 'FR', label: 'Français' },
  { code: 'UKR', label: 'Українська' },
  { code: 'LT', label: 'Lietuvių' },
];

export type DriverDict = {
  activeRoute: string;
  remainingDistance: string;
  eta: string;
  actionBar: string;
  uploadReceipt: string;
  syncTelematics: string;
  altStop: string;
  switchCard: string;
  emergencyParking: string;
  waitStatus: string;
  noWait: string;
  busy: string;
  pumpFault: string;
  crowdUpdate: string;
  audioMode: string;
  language: string;
  nextStop: string;
  startNav: string;
  eCmrSign: string;
  damagePhoto: string;
  fuelLevel: string;
  bufferWarn: string;
  remainingDrive: string;
  requiredRest: string;
  tachoSync: string;
  fuelTheftAlarm: string;
  // Cockpit
  readyPickDest: string;
  file: string;
  start: string;
  stop: string;
  drive: string;
  standstill: string;
  fuel: string;
  cmr: string;
  emergency: string;
  route: string;
  status: string;
  glovebox: string;
  photo: string;
  simulate: string;
  stopNav: string;
  destinationPlaceholder: string;
  vehicleCombo: string;
  truckAlerts: string;
  attention: string;
  nextTurnDefault: string;
  liveLocation: string;
  skip: string;
  driveTime: string;
  fuelShort: string;
  duty: string;
  driving: string;
  signHeight: string;
  signWeight: string;
  signIncline: string;
  signNoOvertake: string;
  signToll: string;
  signBorder: string;
  wholeRoute: string;
  myPosition: string;
  navStarted: string;
  navStopped: string;
  criticalWarnings: string;
  telemetrieDetail: string;
  gpsOnline: string;
  gpsOff: string;
  offlineBuffer: string;
  online: string;
  pechTitle: string;
  pechBody: string;
  confirmPech: string;
  close: string;
};

const NL: DriverDict = {
  activeRoute: 'Actieve Route',
  remainingDistance: 'Resterende afstand',
  eta: 'ETA',
  actionBar: 'Chauffeur actiebalk',
  uploadReceipt: 'Foto Tankbon / CMR Uploaden',
  syncTelematics: 'Telematica Synchroniseren',
  altStop: 'Alternatieve Stop Kiezen',
  switchCard: 'Kaart Wisselen (DKV/UTA)',
  emergencyParking: 'Nood-Parking Vinden (15km)',
  waitStatus: 'Pomp-wachttijd & drukte',
  noWait: 'Geen wachttijd',
  busy: 'Druk (~20 min)',
  pumpFault: 'Pompstoring',
  crowdUpdate: '1-tik drukte-update',
  audioMode: 'Spraakgestuurde audio-instructies',
  language: 'Taal',
  nextStop: 'Volgende Tankstop',
  startNav: 'Start navigatie',
  eCmrSign: 'e-CMR Digitale Handtekening',
  damagePhoto: 'Incident / Schadefoto',
  fuelLevel: 'Brandstofniveau',
  bufferWarn: 'Dynamische Bufferwaarschuwing',
  remainingDrive: 'Resterende Rijtijd',
  requiredRest: 'tot verplichte 45m rust',
  tachoSync: 'Live Digitale Tachograaf Sync',
  fuelTheftAlarm: 'Dieseldiefstal / Tankdop Alarm',
  readyPickDest: 'Klaar · kies bestemming',
  file: 'FILE',
  start: 'Start',
  stop: 'Stop',
  drive: 'Rijden',
  standstill: 'Stilstand',
  fuel: 'Tanken',
  cmr: 'CMR',
  emergency: 'Nood',
  route: 'Route',
  status: 'Status',
  glovebox: 'Glovebox',
  photo: 'Foto',
  simulate: 'Simuleer',
  stopNav: 'Stop',
  destinationPlaceholder: 'Bestemming…',
  vehicleCombo: 'Voertuigcombinatie (hoogte, tonnage, ADR…)',
  truckAlerts: 'Truckwaarschuwingen',
  attention: 'aandacht',
  nextTurnDefault: 'Blijf links · A7 richting München',
  liveLocation: 'Live locatie',
  skip: 'Overslaan',
  driveTime: 'Rijtijd',
  fuelShort: 'Brandstof',
  duty: 'Duty',
  driving: 'Rijden',
  signHeight: 'Hoogte',
  signWeight: 'Tonnage',
  signIncline: 'Helling',
  signNoOvertake: 'Inhaalverbod',
  signToll: 'Maut',
  signBorder: 'Grens',
  wholeRoute: 'Hele route',
  myPosition: 'Mijn positie',
  navStarted: 'Trucknav gestart',
  navStopped: 'Trucknavigatie gestopt',
  criticalWarnings: 'kritieke waarschuwing(en)',
  telemetrieDetail: 'Gedetailleerde telemetrie',
  gpsOnline: 'GPS online',
  gpsOff: 'GPS uit',
  offlineBuffer: 'Offline buffer actief',
  online: 'Online',
  pechTitle: 'Pechhulp / Noodgeval',
  pechBody: 'Protocol actief · GPS gedeeld met planner & pechdienst',
  confirmPech: 'Bevestig pechmelding',
  close: 'Sluiten',
};

const EN: DriverDict = {
  ...NL,
  activeRoute: 'Active route',
  remainingDistance: 'Remaining distance',
  eta: 'ETA',
  language: 'Language',
  nextStop: 'Next fuel stop',
  startNav: 'Start navigation',
  eCmrSign: 'e-CMR digital signature',
  fuelLevel: 'Fuel level',
  remainingDrive: 'Remaining drive time',
  readyPickDest: 'Ready · pick destination',
  file: 'TRAFFIC JAM',
  start: 'Start',
  stop: 'Stop',
  drive: 'Drive',
  standstill: 'Parked',
  fuel: 'Fuel',
  cmr: 'CMR',
  emergency: 'SOS',
  route: 'Route',
  status: 'Status',
  glovebox: 'Glovebox',
  photo: 'Photo',
  simulate: 'Simulate',
  stopNav: 'Stop',
  destinationPlaceholder: 'Destination…',
  vehicleCombo: 'Vehicle combo (height, weight, ADR…)',
  truckAlerts: 'Truck warnings',
  attention: 'alerts',
  nextTurnDefault: 'Keep left · A7 towards Munich',
  liveLocation: 'Live location',
  skip: 'Skip',
  driveTime: 'Drive time',
  fuelShort: 'Fuel',
  duty: 'Duty',
  driving: 'Driving',
  signHeight: 'Height',
  signWeight: 'Weight',
  signIncline: 'Incline',
  signNoOvertake: 'No overtaking',
  signToll: 'Toll',
  signBorder: 'Border',
  wholeRoute: 'Full route',
  myPosition: 'My position',
  navStarted: 'Truck nav started',
  navStopped: 'Truck navigation stopped',
  criticalWarnings: 'critical warning(s)',
  telemetrieDetail: 'Detailed telemetry',
  gpsOnline: 'GPS online',
  gpsOff: 'GPS off',
  offlineBuffer: 'Offline buffer on',
  online: 'Online',
  pechTitle: 'Breakdown / Emergency',
  pechBody: 'Protocol active · GPS shared with planner & roadside',
  confirmPech: 'Confirm breakdown call',
  close: 'Close',
  uploadReceipt: 'Upload fuel receipt / CMR',
  noWait: 'No wait',
  busy: 'Busy (~20 min)',
  pumpFault: 'Pump fault',
};

const DE: DriverDict = {
  ...EN,
  activeRoute: 'Aktive Route',
  remainingDistance: 'Verbleibende Distanz',
  eta: 'ETA',
  language: 'Sprache',
  nextStop: 'Nächster Tankstopp',
  startNav: 'Navigation starten',
  eCmrSign: 'e-CMR Digitale Unterschrift',
  fuelLevel: 'Kraftstoffstand',
  remainingDrive: 'Verbleibende Lenkzeit',
  readyPickDest: 'Bereit · Ziel wählen',
  file: 'STAU',
  start: 'Start',
  stop: 'Stop',
  drive: 'Fahren',
  standstill: 'Stillstand',
  fuel: 'Tanken',
  cmr: 'CMR',
  emergency: 'Not',
  route: 'Route',
  status: 'Status',
  glovebox: 'Handschuhfach',
  photo: 'Foto',
  simulate: 'Simulieren',
  stopNav: 'Stop',
  destinationPlaceholder: 'Ziel…',
  vehicleCombo: 'Fahrzeugkombination (Höhe, Tonnen, ADR…)',
  truckAlerts: 'LKW-Warnungen',
  attention: 'Hinweise',
  nextTurnDefault: 'Links bleiben · A7 Richtung München',
  liveLocation: 'Live-Standort',
  skip: 'Überspringen',
  driveTime: 'Lenkzeit',
  fuelShort: 'Kraftstoff',
  duty: 'Dienst',
  driving: 'Fahren',
  signHeight: 'Höhe',
  signWeight: 'Gewicht',
  signIncline: 'Steigung',
  signNoOvertake: 'Überholverbot',
  signToll: 'Maut',
  signBorder: 'Grenze',
  wholeRoute: 'Gesamte Route',
  myPosition: 'Meine Position',
  navStarted: 'LKW-Navi gestartet',
  navStopped: 'LKW-Navigation gestoppt',
  criticalWarnings: 'kritische Warnung(en)',
  telemetrieDetail: 'Detaillierte Telemetrie',
  gpsOnline: 'GPS online',
  gpsOff: 'GPS aus',
  offlineBuffer: 'Offline-Puffer aktiv',
  online: 'Online',
  pechTitle: 'Pannenhilfe / Notfall',
  pechBody: 'Protokoll aktiv · GPS an Dispo & Pannendienst',
  confirmPech: 'Pannenmeldung bestätigen',
  close: 'Schließen',
  uploadReceipt: 'Tankbeleg / CMR hochladen',
  noWait: 'Keine Wartezeit',
  busy: 'Ausgelastet (~20 Min)',
  pumpFault: 'Zapfstörung',
};

const PL: DriverDict = {
  ...EN,
  language: 'Język',
  readyPickDest: 'Gotowe · wybierz cel',
  file: 'KOREK',
  start: 'Start',
  stop: 'Stop',
  drive: 'Jazda',
  standstill: 'Postój',
  fuel: 'Tankowanie',
  emergency: 'SOS',
  route: 'Trasa',
  status: 'Status',
  glovebox: 'Schowek',
  photo: 'Zdjęcie',
  simulate: 'Symuluj',
  destinationPlaceholder: 'Cel…',
  vehicleCombo: 'Zestaw (wysokość, tonaż, ADR…)',
  truckAlerts: 'Ostrzeżenia ciężarówki',
  attention: 'uwagi',
  nextTurnDefault: 'Trzymaj lewo · A7 na Monachium',
  liveLocation: 'Lokalizacja na żywo',
  skip: 'Pomiń',
  driveTime: 'Czas jazdy',
  fuelShort: 'Paliwo',
  driving: 'Jazda',
  signHeight: 'Wysokość',
  signWeight: 'Tonaż',
  signIncline: 'Nachylenie',
  signNoOvertake: 'Zakaz wyprzedzania',
  signToll: 'Opłata',
  signBorder: 'Granica',
  wholeRoute: 'Cała trasa',
  myPosition: 'Moja pozycja',
  navStarted: 'Nawigacja ciężarówki start',
  navStopped: 'Nawigacja zatrzymana',
  criticalWarnings: 'krytyczne ostrzeżenia',
  pechTitle: 'Awaria / Nagły wypadek',
  pechBody: 'Protokół aktywny · GPS do dyspozytora',
  confirmPech: 'Potwierdź awarię',
  close: 'Zamknij',
  startNav: 'Start nawigacji',
  nextStop: 'Następny postój',
};

const RO: DriverDict = {
  ...EN,
  language: 'Limbă',
  readyPickDest: 'Gata · alege destinația',
  file: 'AMBUTEIAJ',
  start: 'Start',
  stop: 'Stop',
  drive: 'Conduc',
  standstill: 'Staționare',
  fuel: 'Alimentare',
  emergency: 'Urgență',
  route: 'Rută',
  glovebox: 'Torpedo',
  photo: 'Foto',
  simulate: 'Simulează',
  destinationPlaceholder: 'Destinație…',
  vehicleCombo: 'Combinație (înălțime, tonaj, ADR…)',
  truckAlerts: 'Avertismente camion',
  attention: 'atenție',
  nextTurnDefault: 'Ține stânga · A7 spre München',
  liveLocation: 'Locație live',
  skip: 'Omite',
  driveTime: 'Timp condus',
  fuelShort: 'Combustibil',
  driving: 'În mers',
  signHeight: 'Înălțime',
  signWeight: 'Tonaj',
  signIncline: 'Pantă',
  signNoOvertake: 'Interzis depășirea',
  signToll: 'Taxă',
  signBorder: 'Frontieră',
  wholeRoute: 'Tot traseul',
  myPosition: 'Poziția mea',
  navStarted: 'Navigație camion pornită',
  navStopped: 'Navigație oprită',
  criticalWarnings: 'avertismente critice',
  pechTitle: 'Pană / Urgență',
  confirmPech: 'Confirmă pana',
  close: 'Închide',
  startNav: 'Pornește navigarea',
};

const BG: DriverDict = {
  ...EN,
  language: 'Език',
  readyPickDest: 'Готово · изберете цел',
  file: 'ЗАДРЪСТВАНЕ',
  start: 'Старт',
  stop: 'Стоп',
  drive: 'Карай',
  standstill: 'Стоп',
  fuel: 'Зареждане',
  emergency: 'Спешно',
  route: 'Маршрут',
  glovebox: 'Жаблък',
  photo: 'Снимка',
  simulate: 'Симулация',
  destinationPlaceholder: 'Дестинация…',
  vehicleCombo: 'Комбинация (височина, тонаж, ADR…)',
  truckAlerts: 'Предупреждения камион',
  attention: 'внимание',
  nextTurnDefault: 'Дръжте вляво · A7 към Мюнхен',
  liveLocation: 'Жива локация',
  skip: 'Пропусни',
  driveTime: 'Време на път',
  fuelShort: 'Гориво',
  driving: 'В движение',
  signHeight: 'Височина',
  signWeight: 'Тонаж',
  signIncline: 'Наклон',
  signNoOvertake: 'Забрана за изпреварване',
  signToll: 'Такса',
  signBorder: 'Граница',
  wholeRoute: 'Целият маршрут',
  myPosition: 'Моята позиция',
  navStarted: 'Камион навигация старт',
  navStopped: 'Навигацията е спряна',
  criticalWarnings: 'критични предупреждения',
  pechTitle: 'Авария / Спешен случай',
  confirmPech: 'Потвърди авария',
  close: 'Затвори',
  startNav: 'Старт навигация',
};

const CS: DriverDict = {
  ...EN,
  language: 'Jazyk',
  readyPickDest: 'Připraveno · zvolte cíl',
  file: 'KOLONA',
  start: 'Start',
  stop: 'Stop',
  drive: 'Jízda',
  standstill: 'Stání',
  fuel: 'Tankování',
  emergency: 'SOS',
  route: 'Trasa',
  glovebox: 'Schránka',
  photo: 'Foto',
  simulate: 'Simulovat',
  destinationPlaceholder: 'Cíl…',
  vehicleCombo: 'Souprava (výška, tonáž, ADR…)',
  truckAlerts: 'Varování kamionu',
  attention: 'upozornění',
  nextTurnDefault: 'Držte vlevo · A7 směr Mnichov',
  liveLocation: 'Živá poloha',
  skip: 'Přeskočit',
  driveTime: 'Doba jízdy',
  fuelShort: 'Palivo',
  driving: 'Jízda',
  signHeight: 'Výška',
  signWeight: 'Tonáž',
  signIncline: 'Stoupání',
  signNoOvertake: 'Zákaz předjíždění',
  signToll: 'Mýto',
  signBorder: 'Hranice',
  wholeRoute: 'Celá trasa',
  myPosition: 'Moje poloha',
  navStarted: 'Kamionová navigace start',
  navStopped: 'Navigace zastavena',
  criticalWarnings: 'kritická varování',
  pechTitle: 'Porucha / Nouzový stav',
  confirmPech: 'Potvrdit poruchu',
  close: 'Zavřít',
  startNav: 'Spustit navigaci',
};

const FR: DriverDict = {
  ...EN,
  language: 'Langue',
  readyPickDest: 'Prêt · choisir destination',
  file: 'EMBOUTEILLAGE',
  start: 'Démarrer',
  stop: 'Stop',
  drive: 'Conduire',
  standstill: 'Arrêt',
  fuel: 'Carburant',
  emergency: 'Urgence',
  route: 'Itinéraire',
  glovebox: 'Boîte à gants',
  photo: 'Photo',
  simulate: 'Simuler',
  destinationPlaceholder: 'Destination…',
  vehicleCombo: 'Ensemble (hauteur, tonnage, ADR…)',
  truckAlerts: 'Alertes camion',
  attention: 'alertes',
  nextTurnDefault: 'Restez à gauche · A7 vers Munich',
  liveLocation: 'Position live',
  skip: 'Passer',
  driveTime: 'Temps de conduite',
  fuelShort: 'Carburant',
  driving: 'En route',
  signHeight: 'Hauteur',
  signWeight: 'Tonnage',
  signIncline: 'Pente',
  signNoOvertake: 'Interdiction de dépasser',
  signToll: 'Péage',
  signBorder: 'Frontière',
  wholeRoute: 'Tout l’itinéraire',
  myPosition: 'Ma position',
  navStarted: 'Nav camion démarrée',
  navStopped: 'Navigation arrêtée',
  criticalWarnings: 'alerte(s) critique(s)',
  pechTitle: 'Panne / Urgence',
  confirmPech: 'Confirmer la panne',
  close: 'Fermer',
  startNav: 'Démarrer la navigation',
};

const UKR: DriverDict = {
  ...EN,
  language: 'Мова',
  readyPickDest: 'Готово · оберіть пункт',
  file: 'ЗАТОР',
  start: 'Старт',
  stop: 'Стоп',
  drive: 'Їхати',
  standstill: 'Стоянка',
  fuel: 'Заправка',
  emergency: 'SOS',
  route: 'Маршрут',
  glovebox: 'Бардачок',
  photo: 'Фото',
  simulate: 'Симуляція',
  destinationPlaceholder: 'Пункт призначення…',
  vehicleCombo: 'Склад (висота, тоннаж, ADR…)',
  truckAlerts: 'Попередження вантажівки',
  attention: 'увага',
  nextTurnDefault: 'Тримайте ліворуч · A7 на Мюнхен',
  liveLocation: 'Жива локація',
  skip: 'Пропустити',
  driveTime: 'Час їзди',
  fuelShort: 'Паливо',
  driving: 'В дорозі',
  signHeight: 'Висота',
  signWeight: 'Тоннаж',
  signIncline: 'Ухил',
  signNoOvertake: 'Обгін заборонено',
  signToll: 'Мита',
  signBorder: 'Кордон',
  wholeRoute: 'Весь маршрут',
  myPosition: 'Моя позиція',
  navStarted: 'Навігація вантажівки старт',
  navStopped: 'Навігацію зупинено',
  criticalWarnings: 'критичні попередження',
  pechTitle: 'Аварія / Надзвичайна ситуація',
  confirmPech: 'Підтвердити аварію',
  close: 'Закрити',
  startNav: 'Старт навігації',
};

const LT: DriverDict = {
  ...EN,
  language: 'Kalba',
  readyPickDest: 'Paruošta · pasirinkite tikslą',
  file: 'KAMŠTIS',
  start: 'Pradėti',
  stop: 'Stop',
  drive: 'Vairuoti',
  standstill: 'Stovėjimas',
  fuel: 'Degalinė',
  emergency: 'SOS',
  route: 'Maršrutas',
  glovebox: 'Daiktadėžė',
  photo: 'Nuotrauka',
  simulate: 'Simuliuoti',
  destinationPlaceholder: 'Tikslas…',
  vehicleCombo: 'Sąstatas (aukštis, tonažas, ADR…)',
  truckAlerts: 'Sunkvežimio įspėjimai',
  attention: 'įspėjimai',
  nextTurnDefault: 'Laikykitės kairėje · A7 link Miuncheno',
  liveLocation: 'Gyva vieta',
  skip: 'Praleisti',
  driveTime: 'Vairavimo laikas',
  fuelShort: 'Kuras',
  driving: 'Važiuoja',
  signHeight: 'Aukštis',
  signWeight: 'Tonažas',
  signIncline: 'Nuolydis',
  signNoOvertake: 'Lenkti draudžiama',
  signToll: 'Rinkliava',
  signBorder: 'Siena',
  wholeRoute: 'Visas maršrutas',
  myPosition: 'Mano vieta',
  navStarted: 'Sunkvežimio navigacija pradėta',
  navStopped: 'Navigacija sustabdyta',
  criticalWarnings: 'kritiniai įspėjimai',
  pechTitle: 'Gedimas / Avarija',
  confirmPech: 'Patvirtinti gedimą',
  close: 'Uždaryti',
  startNav: 'Pradėti navigaciją',
};

const DICTS: Record<DriverLang, DriverDict> = {
  NL,
  EN,
  DE,
  PL,
  RO,
  BG,
  CS,
  FR,
  UKR,
  LT,
};

export function localeToDriverLang(code: AppLocale | string): DriverLang {
  const map: Record<string, DriverLang> = {
    NL: 'NL',
    EN: 'EN',
    DE: 'DE',
    PL: 'PL',
    RO: 'RO',
    BG: 'BG',
    CS: 'CS',
    SK: 'CS',
    FR: 'FR',
    UKR: 'UKR',
    LT: 'LT',
    ES: 'EN',
    IT: 'EN',
    HU: 'EN',
    DA: 'EN',
    SV: 'EN',
    FI: 'EN',
    PT: 'EN',
    EL: 'EN',
    HR: 'EN',
  };
  return map[code] ?? 'EN';
}

export function driverText(lang: DriverLang | AppLocale | string): DriverDict {
  if (lang in DICTS) return DICTS[lang as DriverLang];
  return DICTS[localeToDriverLang(lang)];
}
