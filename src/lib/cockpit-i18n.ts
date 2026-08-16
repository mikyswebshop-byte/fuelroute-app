/**
 * Extra cockpit-UI strings (profiel, tanken, chat, legal, CMR-detail).
 * Gekoppeld aan app-locale via localeToDriverLang.
 */

import type { DriverLang } from '@/lib/driver-i18n';
import { localeToDriverLang } from '@/lib/driver-i18n';
import type { AppLocale } from '@/lib/i18n';

export type CockpitCopy = {
  profileTitle: string;
  profileHint: string;
  combo: string;
  tractor: string;
  trailer: string;
  modelBody: string;
  heightM: string;
  widthM: string;
  lengthM: string;
  grossT: string;
  axles: string;
  axleLoadT: string;
  euroClass: string;
  trailerCoupled: string;
  reefer: string;
  adrDangerous: string;
  specialTransport: string;
  escort: string;
  adrClass: string;
  tunnelCode: string;
  specialNotes: string;
  specialNotesPh: string;
  comboTrekkerOplegger: string;
  comboTrekkerAanhanger: string;
  comboBakwagen: string;
  comboLzv: string;
  comboSpeciaal: string;
  saveFuelEyebrow: string;
  saveFuelHeadline: string;
  saveFuelBody: string;
  saveVsNl: string;
  navigateLiters: string;
  navigate: string;
  advantage: string;
  maxDetourLabel: string;
  tankStrategy: string;
  pricesOnRoute: string;
  detour: string;
  showerClean: string;
  chatTitle: string;
  colleagueTips: string;
  officePlanner: string;
  chatPlaceholder: string;
  chatSend: string;
  chatSentOffice: string;
  eCmrSignShort: string;
  fuelCard: string;
  waitNone: string;
  waitBusy: string;
  waitFault: string;
  legalTitle: string;
  legalMaut: string;
  legalRest: string;
  legalPrice: string;
  legalDriver: string;
  legalFoot: string;
  ecmrCheckTitle: string;
  cmrNumber: string;
  weight: string;
  noCmrLoaded: string;
  signCmr: string;
  officePing: string;
  // fuel plan templates ({n} placeholders filled in code)
  avoidNl: string;
  cheaperThanNl: string;
  deBorderPump: string;
  czCheaper: string;
  pumpFaultNote: string;
  tankBeforeNlTitle: string;
  tankBeforeNlBody: string;
  tankBeforeNlCz: string;
  strategyBorder: string;
  strategySkipNl: string;
  strategyRefillDe: string;
  strategyCz: string;
  strategyCzAlt: string;
  strategyBest: string;
  strategyFooter: string;
  vsNl: string;
  amenityNote: string;
};

const NL: CockpitCopy = {
  profileTitle: 'Jouw vrachtwagencombinatie',
  profileHint:
    'Navigatie gebruikt dit profiel voor doorrijhoogte, tonnage, breedte, ADR en speciaal transport — geen personenwagen-GPS.',
  combo: 'Combinatie',
  tractor: 'Trekker',
  trailer: 'Trailer / oplegger',
  modelBody: 'Model / opbouw',
  heightM: 'Hoogte m',
  widthM: 'Breedte m',
  lengthM: 'Lengte m',
  grossT: 'Bruto t',
  axles: 'Assen',
  axleLoadT: 'Aslast t',
  euroClass: 'Euroklasse',
  trailerCoupled: 'Trailer gekoppeld',
  reefer: 'Koeltrailer',
  adrDangerous: 'ADR / gevaarlijke stoffen',
  specialTransport: 'Speciaal transport',
  escort: 'Begeleiding / escort',
  adrClass: 'ADR-klasse',
  tunnelCode: 'Tunnelcode',
  specialNotes: 'Speciaal transport — notities / vergunning',
  specialNotesPh: 'Vergunningnr., routeplicht, BF3…',
  comboTrekkerOplegger: 'Trekker + oplegger',
  comboTrekkerAanhanger: 'Trekker + aanhanger',
  comboBakwagen: 'Bakwagen (star)',
  comboLzv: 'LZV / Ecocombi',
  comboSpeciaal: 'Speciaal / exceptioneel transport',
  saveFuelEyebrow: 'Geld besparen op tanken',
  saveFuelHeadline: 'Altijd de goedkoopste truck-pomp',
  saveFuelBody:
    'NL-diesel is bijna altijd duurder dan in DE/BE/CZ. FuelRoute waarschuwt vóór de grens, plant liters tot de volgende goedkope stop, en laat max {km} km omrijden als het echt loont.',
  saveVsNl: 'Besparing t.o.v. NL',
  navigateLiters: 'Navigeer · ±{l} L tanken',
  navigate: 'Navigeer',
  advantage: 'voordeel',
  maxDetourLabel: 'Max. omrijden voor goedkopere pomp: {km} km',
  tankStrategy: 'Tankstrategie op jouw rit',
  pricesOnRoute: 'Prijzen op / bij de route (≤ {km} km)',
  detour: 'omrijden',
  showerClean: 'Douche schoon*',
  chatTitle: "Chatten · collega’s & zaak",
  colleagueTips: 'Collega-tips',
  officePlanner: 'Zaak / planner',
  chatPlaceholder: 'Bijv. Douches Hamminkeln OK?',
  chatSend: 'Stuur',
  chatSentOffice: 'Bericht naar de zaak gezet (planner / dispatch).',
  eCmrSignShort: 'e-CMR tekenen',
  fuelCard: 'Kaart',
  waitNone: 'Geen wachttijd',
  waitBusy: 'Wachtrij',
  waitFault: 'Storing',
  legalTitle: 'Juridische disclaimers',
  legalMaut: 'Maut & Tolwetgeving',
  legalRest: 'EU Verordening 561/2006',
  legalPrice: 'Prijsarbitrage',
  legalDriver: 'Aansprakelijkheid chauffeur',
  legalFoot:
    'FuelRoute is beslisondersteuning. Indicatieve maut/tol en tankadviezen zijn niet juridisch bindend. De chauffeur blijft verantwoordelijk voor doorrijhoogte, borden en tachograaf.',
  ecmrCheckTitle: 'Controleer vóór handtekening',
  cmrNumber: 'CMR-nr',
  weight: 'Gewicht',
  noCmrLoaded: 'Geen CMR geladen',
  signCmr: 'Ondertekenen',
  officePing: 'Bericht naar zaak/planner verzonden — ze zien je tankplan & ETA.',
  avoidNl: 'Nederland: diesel meestal duurder — liever net over de grens in DE/BE',
  cheaperThanNl: '€{p}/L goedkoper dan NL-referentie',
  deBorderPump: 'DE-grenspomp vóór NL · {r}',
  czCheaper: 'Tsjechië vaak nog goedkoper · tank genoeg in DE om hier te komen',
  pumpFaultNote: ' · ⚠ pomp storing gemeld',
  tankBeforeNlTitle: 'Tank vóór de Nederlandse grens',
  tankBeforeNlBody:
    'Diesel in NL is bijna altijd duurder. Tank nu bij {station} (€{price}/L). Advies ±{liters} L — genoeg om door te rijden{cz}.',
  tankBeforeNlCz: ', en door te rijden naar goedkopere diesel in Tsjechië',
  strategyBorder:
    '1. DE-grens: {station} · ±{liters} L · bespaar ~€{save} t.o.v. NL',
  strategySkipNl: '2. Nog op Duitse diesel NL passeren — niet voltanken in NL (Venlo e.d.)',
  strategyRefillDe:
    '3. Opnieuw tanken in DE ({station}) met genoeg liters tot goedkope CZ-pomp',
  strategyCz: '4. Tsjechië: {station} · €{price}/L',
  strategyCzAlt: '4. In CZ tanken zodra je een goedkope truckpomp op route hebt',
  strategyBest: 'Beste deal nu: {station} · €{price}/L · omrijden {km} km',
  strategyFooter:
    'Omrijden max {km} km · let op wachttijd, schone douches/WC · check community-tips',
  vsNl: 'vs NL',
  amenityNote:
    '*Douche/WC op basis van partner-parkeerplaatsen / community. Prijzen zijn schattingen (tankkaart).',
};

const EN: CockpitCopy = {
  ...NL,
  profileTitle: 'Your truck combination',
  profileHint:
    'Navigation uses this profile for clearance height, tonnage, width, ADR and special transport — not car GPS.',
  combo: 'Combination',
  tractor: 'Tractor',
  trailer: 'Trailer / semi',
  modelBody: 'Model / body',
  heightM: 'Height m',
  widthM: 'Width m',
  lengthM: 'Length m',
  grossT: 'Gross t',
  axles: 'Axles',
  axleLoadT: 'Axle load t',
  euroClass: 'Euro class',
  trailerCoupled: 'Trailer coupled',
  reefer: 'Reefer trailer',
  adrDangerous: 'ADR / dangerous goods',
  specialTransport: 'Special transport',
  escort: 'Escort required',
  adrClass: 'ADR class',
  tunnelCode: 'Tunnel code',
  specialNotes: 'Special transport — notes / permit',
  specialNotesPh: 'Permit no., route rules, BF3…',
  comboTrekkerOplegger: 'Tractor + semi-trailer',
  comboTrekkerAanhanger: 'Tractor + drawbar trailer',
  comboBakwagen: 'Rigid truck',
  comboLzv: 'LZV / Ecocombi',
  comboSpeciaal: 'Special / exceptional transport',
  saveFuelEyebrow: 'Save money on fuel',
  saveFuelHeadline: 'Always the cheapest truck pump',
  saveFuelBody:
    'NL diesel is almost always more expensive than DE/BE/CZ. FuelRoute warns before the border, plans liters to the next cheap stop, and allows max {km} km detour when it pays off.',
  saveVsNl: 'Savings vs NL',
  navigateLiters: 'Navigate · ±{l} L fill',
  navigate: 'Navigate',
  advantage: 'advantage',
  maxDetourLabel: 'Max. detour for cheaper pump: {km} km',
  tankStrategy: 'Fuel strategy on your trip',
  pricesOnRoute: 'Prices on / near route (≤ {km} km)',
  detour: 'detour',
  showerClean: 'Clean shower*',
  chatTitle: 'Chat · colleagues & office',
  colleagueTips: 'Colleague tips',
  officePlanner: 'Office / planner',
  chatPlaceholder: 'E.g. Showers Hamminkeln OK?',
  chatSend: 'Send',
  chatSentOffice: 'Message sent to office (planner / dispatch).',
  eCmrSignShort: 'Sign e-CMR',
  fuelCard: 'Card',
  waitNone: 'No wait',
  waitBusy: 'Queue',
  waitFault: 'Fault',
  legalTitle: 'Legal disclaimers',
  legalMaut: 'Toll legislation',
  legalRest: 'EU Regulation 561/2006',
  legalPrice: 'Price arbitrage',
  legalDriver: 'Driver liability',
  legalFoot:
    'FuelRoute is decision support. Indicative tolls and fuel advice are not legally binding. The driver remains responsible for clearance, signs and tachograph.',
  ecmrCheckTitle: 'Check before signing',
  cmrNumber: 'CMR no.',
  weight: 'Weight',
  noCmrLoaded: 'No CMR loaded',
  signCmr: 'Sign',
  officePing: 'Message sent to office/planner — they see your fuel plan & ETA.',
  avoidNl: 'Netherlands: diesel usually more expensive — prefer just across the border in DE/BE',
  cheaperThanNl: '€{p}/L cheaper than NL reference',
  deBorderPump: 'DE border pump before NL · {r}',
  czCheaper: 'Czechia often even cheaper · fill enough in DE to get here',
  pumpFaultNote: ' · ⚠ pump fault reported',
  tankBeforeNlTitle: 'Refuel before the Dutch border',
  tankBeforeNlBody:
    'Diesel in NL is almost always more expensive. Fill now at {station} (€{price}/L). Advice ±{liters} L — enough to continue{cz}.',
  tankBeforeNlCz: ', and continue to cheaper diesel in Czechia',
  strategyBorder:
    '1. DE border: {station} · ±{liters} L · save ~€{save} vs NL',
  strategySkipNl: '2. Cross NL on German diesel — do not fill up in NL (Venlo etc.)',
  strategyRefillDe:
    '3. Refuel again in DE ({station}) with enough liters until a cheap CZ pump',
  strategyCz: '4. Czechia: {station} · €{price}/L',
  strategyCzAlt: '4. Refuel in CZ when you have a cheap truck pump on route',
  strategyBest: 'Best deal now: {station} · €{price}/L · detour {km} km',
  strategyFooter:
    'Detour max {km} km · watch wait times, clean showers/WC · check community tips',
  vsNl: 'vs NL',
  amenityNote:
    '*Shower/WC based on partner parking / community. Prices are estimates (fuel card).',
};

const DE: CockpitCopy = {
  ...EN,
  profileTitle: 'Deine LKW-Kombination',
  profileHint:
    'Navigation nutzt dieses Profil für Durchfahrtshöhe, Tonnen, Breite, ADR und Sondertransport — kein Pkw-GPS.',
  combo: 'Kombination',
  tractor: 'Zugmaschine',
  trailer: 'Auflieger / Anhänger',
  modelBody: 'Modell / Aufbau',
  heightM: 'Höhe m',
  widthM: 'Breite m',
  lengthM: 'Länge m',
  grossT: 'Brutto t',
  axles: 'Achsen',
  axleLoadT: 'Achslast t',
  euroClass: 'Euroklasse',
  trailerCoupled: 'Auflieger gekoppelt',
  reefer: 'Kühlauflieger',
  adrDangerous: 'ADR / Gefahrgut',
  specialTransport: 'Sondertransport',
  escort: 'Begleitung / Escort',
  adrClass: 'ADR-Klasse',
  tunnelCode: 'Tunnelcode',
  specialNotes: 'Sondertransport — Notizen / Genehmigung',
  specialNotesPh: 'Genehmigungsnr., Routenpflicht, BF3…',
  comboTrekkerOplegger: 'Zugmaschine + Auflieger',
  comboTrekkerAanhanger: 'Zugmaschine + Anhänger',
  comboBakwagen: 'Solofahrzeug',
  comboLzv: 'LZV / Ecocombi',
  comboSpeciaal: 'Sonder- / Großraumtransport',
  saveFuelEyebrow: 'Beim Tanken sparen',
  saveFuelHeadline: 'Immer die günstigste LKW-Zapfsäule',
  saveFuelBody:
    'NL-Diesel ist fast immer teurer als in DE/BE/CZ. FuelRoute warnt vor der Grenze, plant Liter bis zum nächsten günstigen Stopp und erlaubt max. {km} km Umweg wenn es sich lohnt.',
  saveVsNl: 'Ersparnis vs NL',
  navigateLiters: 'Navigieren · ±{l} L tanken',
  navigate: 'Navigieren',
  advantage: 'Vorteil',
  maxDetourLabel: 'Max. Umweg für günstigere Zapfsäule: {km} km',
  tankStrategy: 'Tankstrategie auf deiner Tour',
  pricesOnRoute: 'Preise auf / nahe der Route (≤ {km} km)',
  detour: 'Umweg',
  showerClean: 'Dusche sauber*',
  chatTitle: 'Chat · Kollegen & Büro',
  colleagueTips: 'Kollegen-Tipps',
  officePlanner: 'Büro / Disposition',
  chatPlaceholder: 'Z.B. Duschen Hamminkeln OK?',
  chatSend: 'Senden',
  chatSentOffice: 'Nachricht an das Büro gesendet (Disposition).',
  eCmrSignShort: 'e-CMR unterschreiben',
  fuelCard: 'Karte',
  waitNone: 'Keine Wartezeit',
  waitBusy: 'Warteschlange',
  waitFault: 'Störung',
  legalTitle: 'Rechtliche Hinweise',
  legalMaut: 'Maut & Zollrecht',
  legalRest: 'EU-Verordnung 561/2006',
  legalPrice: 'Preisarbitrage',
  legalDriver: 'Haftung Fahrer',
  legalFoot:
    'FuelRoute ist Entscheidungshilfe. Indikative Maut und Tanktipps sind nicht rechtsverbindlich. Der Fahrer bleibt verantwortlich für Höhe, Schilder und Tachograph.',
  ecmrCheckTitle: 'Vor Unterschrift prüfen',
  cmrNumber: 'CMR-Nr.',
  weight: 'Gewicht',
  noCmrLoaded: 'Kein CMR geladen',
  signCmr: 'Unterschreiben',
  officePing: 'Nachricht an Büro/Disposition — sie sehen Tankplan & ETA.',
  avoidNl: 'Niederlande: Diesel meist teurer — lieber knapp über der Grenze in DE/BE',
  cheaperThanNl: '€{p}/L günstiger als NL-Referenz',
  deBorderPump: 'DE-Grenzzapfstelle vor NL · {r}',
  czCheaper: 'Tschechien oft noch günstiger · in DE genug tanken um hierher zu kommen',
  pumpFaultNote: ' · ⚠ Zapfstörung gemeldet',
  tankBeforeNlTitle: 'Vor der niederländischen Grenze tanken',
  tankBeforeNlBody:
    'Diesel in NL ist fast immer teurer. Jetzt tanken bei {station} (€{price}/L). Empfehlung ±{liters} L — genug zum Weiterfahren{cz}.',
  tankBeforeNlCz: ', und weiterfahren zu günstigerem Diesel in Tschechien',
  strategyBorder:
    '1. DE-Grenze: {station} · ±{liters} L · spare ~€{save} vs NL',
  strategySkipNl: '2. NL auf deutschem Diesel queren — nicht in NL volltanken (Venlo usw.)',
  strategyRefillDe:
    '3. In DE erneut tanken ({station}) mit genug Litern bis zur günstigen CZ-Zapfstelle',
  strategyCz: '4. Tschechien: {station} · €{price}/L',
  strategyCzAlt: '4. In CZ tanken sobald eine günstige LKW-Zapfstelle auf der Route ist',
  strategyBest: 'Bestes Angebot jetzt: {station} · €{price}/L · Umweg {km} km',
  strategyFooter:
    'Umweg max {km} km · Wartezeit, saubere Duschen/WC beachten · Community-Tipps prüfen',
  vsNl: 'vs NL',
  amenityNote:
    '*Dusche/WC laut Partnerparkplätzen / Community. Preise sind Schätzungen (Tankkarte).',
};

const CS: CockpitCopy = {
  ...EN,
  profileTitle: 'Vaše souprava',
  profileHint:
    'Navigace používá tento profil pro výšku, tonáž, šířku, ADR a speciální transport — ne GPS osobního auta.',
  combo: 'Kombinace',
  tractor: 'Tahač',
  trailer: 'Návěs / přívěs',
  modelBody: 'Model / nástavba',
  heightM: 'Výška m',
  widthM: 'Šířka m',
  lengthM: 'Délka m',
  grossT: 'Brutto t',
  axles: 'Nápravy',
  axleLoadT: 'Hmotnost nápravy t',
  euroClass: 'Euro třída',
  trailerCoupled: 'Návěs připojen',
  reefer: 'Chladírenský návěs',
  adrDangerous: 'ADR / nebezpečný náklad',
  specialTransport: 'Speciální transport',
  escort: 'Doprovod / escort',
  adrClass: 'Třída ADR',
  tunnelCode: 'Kód tunelu',
  specialNotes: 'Speciální transport — poznámky / povolení',
  specialNotesPh: 'Č. povolení, povinná trasa, BF3…',
  comboTrekkerOplegger: 'Tahač + návěs',
  comboTrekkerAanhanger: 'Tahač + přívěs',
  comboBakwagen: 'Sólo (pevná nástavba)',
  comboLzv: 'LZV / Ecocombi',
  comboSpeciaal: 'Speciální / nadrozměrný transport',
  saveFuelEyebrow: 'Ušetřit na tankování',
  saveFuelHeadline: 'Vždy nejlevnější čerpací stanice pro kamiony',
  saveFuelBody:
    'NL nafta je téměř vždy dražší než v DE/BE/CZ. FuelRoute varuje před hranicí, plánuje litry do další levné zastávky a povolí max {km} km objížďky, když se to vyplatí.',
  saveVsNl: 'Úspora oproti NL',
  navigateLiters: 'Navigovat · ±{l} L natankovat',
  navigate: 'Navigovat',
  advantage: 'výhoda',
  maxDetourLabel: 'Max. objížďka pro levnější pumpu: {km} km',
  tankStrategy: 'Strategie tankování na vaší jízdě',
  pricesOnRoute: 'Ceny na / u trasy (≤ {km} km)',
  detour: 'objížďka',
  showerClean: 'Čistá sprcha*',
  chatTitle: 'Chat · kolegové & firma',
  colleagueTips: 'Tipy kolegů',
  officePlanner: 'Firma / dispečink',
  chatPlaceholder: 'Např. Sprchy Hamminkeln OK?',
  chatSend: 'Odeslat',
  chatSentOffice: 'Zpráva odeslána firmě (dispečink).',
  eCmrSignShort: 'Podepsat e-CMR',
  fuelCard: 'Karta',
  waitNone: 'Bez čekání',
  waitBusy: 'Fronta',
  waitFault: 'Porucha',
  legalTitle: 'Právní upozornění',
  legalMaut: 'Mýto a legislativa',
  legalRest: 'Nařízení EU 561/2006',
  legalPrice: 'Cenová arbitráž',
  legalDriver: 'Odpovědnost řidiče',
  legalFoot:
    'FuelRoute je podpora rozhodování. Orientační mýto a tipy na tankování nejsou právně závazné. Řidič zůstává odpovědný za výšku, značky a tachograf.',
  ecmrCheckTitle: 'Zkontrolujte před podpisem',
  cmrNumber: 'Č. CMR',
  weight: 'Hmotnost',
  noCmrLoaded: 'Žádné CMR nenačteno',
  signCmr: 'Podepsat',
  officePing: 'Zpráva firmě/dispečinku — vidí váš plán tankování a ETA.',
  avoidNl: 'Nizozemsko: nafta obvykle dražší — raději těsně za hranicí v DE/BE',
  cheaperThanNl: '€{p}/L levnější než NL reference',
  deBorderPump: 'DE hraniční pumpa před NL · {r}',
  czCheaper: 'Česko často ještě levnější · v DE natankujte dost, abyste sem dojeli',
  pumpFaultNote: ' · ⚠ hlášena porucha pumpy',
  tankBeforeNlTitle: 'Natankujte před nizozemskou hranicí',
  tankBeforeNlBody:
    'Nafta v NL je téměř vždy dražší. Natankujte teď u {station} (€{price}/L). Doporučení ±{liters} L — dost na pokračování{cz}.',
  tankBeforeNlCz: ' a dál k levnější naftě v Česku',
  strategyBorder:
    '1. DE hranice: {station} · ±{liters} L · úspora ~€{save} vs NL',
  strategySkipNl: '2. Projet NL na německou naftu — v NL nedoplňovat (Venlo apod.)',
  strategyRefillDe:
    '3. Znovu tankovat v DE ({station}) s dostatkem litrů do levné CZ pumpy',
  strategyCz: '4. Česko: {station} · €{price}/L',
  strategyCzAlt: '4. V CZ tankovat, jakmile máte levnou kamionovou pumpu na trase',
  strategyBest: 'Nejlepší nabídka: {station} · €{price}/L · objížďka {km} km',
  strategyFooter:
    'Objížďka max {km} km · sledujte čekání, čisté sprchy/WC · tipy komunity',
  vsNl: 'vs NL',
  amenityNote:
    '*Sprcha/WC podle partnerských parkovišť / komunity. Ceny jsou odhady (tankovací karta).',
};

const PL: CockpitCopy = {
  ...EN,
  profileTitle: 'Twój zestaw',
  navigate: 'Nawiguj',
  chatSend: 'Wyślij',
  eCmrSignShort: 'Podpisz e-CMR',
  fuelCard: 'Karta',
  waitNone: 'Bez kolejki',
  detour: 'objazd',
};

const FR: CockpitCopy = {
  ...EN,
  profileTitle: 'Votre combinaison',
  navigate: 'Naviguer',
  chatSend: 'Envoyer',
  eCmrSignShort: 'Signer e-CMR',
  fuelCard: 'Carte',
  waitNone: "Pas d'attente",
  detour: 'détour',
};

const PACKS: Record<DriverLang, CockpitCopy> = {
  NL,
  EN,
  DE,
  CS,
  PL,
  FR,
  RO: EN,
  BG: EN,
  UKR: EN,
  LT: EN,
};

export function cockpitText(lang: DriverLang | AppLocale | string): CockpitCopy {
  const code = lang in PACKS ? (lang as DriverLang) : localeToDriverLang(lang);
  return PACKS[code] ?? EN;
}

export function fillTpl(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ''));
}
