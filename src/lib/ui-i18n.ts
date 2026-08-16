/**
 * Pagina-UI vertalingen (planner, CMR, acties).
 * Nav-tabs blijven in i18n.ts; dit dekt de inhoud die nu hard NL was.
 */

import type { AppLocale } from '@/lib/i18n';

export type UiKey =
  | 'planner_title'
  | 'planner_subtitle'
  | 'planner_recalc'
  | 'map_engine'
  | 'map_note_here'
  | 'map_note_ptv'
  | 'map_note_tomtom'
  | 'map_note_trimble'
  | 'map_note_mapbox'
  | 'cmr_active_applied'
  | 'cmr_open'
  | 'cmr_import_title'
  | 'cmr_from_file'
  | 'cmr_ocr_hint'
  | 'cmr_drag'
  | 'cmr_formats'
  | 'cmr_choose_file'
  | 'cmr_photo_gallery'
  | 'cmr_fallback'
  | 'cmr_applied_trip'
  | 'cmr_clear'
  | 'cmr_shipper'
  | 'cmr_consignee'
  | 'cmr_history'
  | 'cmr_goods'
  | 'cmr_packages'
  | 'cmr_weight_kg'
  | 'cmr_weight_t'
  | 'cmr_truck'
  | 'cmr_trailer'
  | 'route_cost_matrix'
  | 'maut_calculator'
  | 'freight_price_preset'
  | 'margin_hint'
  | 'freight_price'
  | 'net_margin'
  | 'label_fuel'
  | 'label_maut'
  | 'label_depreciation'
  | 'label_margin_pct'
  | 'calc_updated'
  | 'live_tacho_title'
  | 'tacho_synced_label'
  | 'remaining_drive'
  | 'total_distance'
  | 'estimated_usage'
  | 'fuel_advantage'
  | 'net_savings'
  | 'zzp_title'
  | 'margin_calc'
  | 'load_cmr'
  | 'tacho_eets'
  | 'live_tacho'
  | 'border_waits'
  | 'combined_rest'
  | 'primary_actions'
  | 'calc_liters'
  | 'load_corridor'
  | 'strict_detour'
  | 'all_cards'
  | 'expenses'
  | 'expenses_hint'
  | 'scan_receipt'
  | 'route_input'
  | 'origin'
  | 'destination'
  | 'vehicle_cargo'
  | 'empty_weight'
  | 'loaded_weight'
  | 'fuel_type'
  | 'truck_routing'
  | 'max_height'
  | 'axle_limit'
  | 'width'
  | 'length'
  | 'adr_cargo'
  | 'reefer_active'
  | 'open'
  | 'clear'
  | 'choose_file_native'
  | 'no_file_chosen'
  | 'dispatch_title'
  | 'dispatch_subtitle'
  | 'kpi_online'
  | 'kpi_delayed'
  | 'kpi_cmr_open'
  | 'kpi_unread'
  | 'action_add_truck'
  | 'action_cmr_upload'
  | 'action_broadcast'
  | 'tab_fleet'
  | 'tab_cmr'
  | 'tab_chat'
  | 'tab_detail'
  | 'tab_tools'
  | 'fleet_filter_all'
  | 'fleet_filter_online'
  | 'fleet_filter_delayed'
  | 'fleet_filter_offline'
  | 'assign_cmr'
  | 'assign_to'
  | 'queued'
  | 'assigned'
  | 'in_progress'
  | 'chat_placeholder'
  | 'chat_send'
  | 'chat_empty'
  | 'detail_timeline'
  | 'detail_open_cockpit'
  | 'detail_no_truck'
  | 'broadcast_prompt'
  | 'status_driving'
  | 'status_rest'
  | 'status_loading'
  | 'status_offline';

type Pack = Record<UiKey, string>;

const NL: Pack = {
  planner_title: 'Rit-Planner',
  planner_subtitle: 'Planner & Dispatcher · voertuig, ADR, maut en nettobesparing',
  planner_recalc: '↻ Actuele herberekening',
  map_engine: 'Kaartmotor',
  map_note_here: 'Brughoogtes, aslasten, ADR/hazmat-tunnels',
  map_note_ptv: 'Europese Maut & EETS-tolmatrix',
  map_note_tomtom: 'Live vrachtverkeer & grensvertragingen',
  map_note_trimble: 'Turn-by-turn trucknavigatie',
  map_note_mapbox: 'Standaard vectorlaag (backup)',
  cmr_active_applied: 'Actieve CMR · Toegepast',
  cmr_open: 'Open',
  cmr_import_title: 'CMR / e-CMR import',
  cmr_from_file: 'Vrachtbrief uit bestand',
  cmr_ocr_hint: 'Kies een bestand of foto. Na OCR wordt de CMR direct toegepast op de rit.',
  cmr_drag: 'Sleep CMR hierheen of kies hieronder',
  cmr_formats: 'PDF · JPG · PNG · werkt op telefoon & PC',
  cmr_choose_file: 'Bestand kiezen',
  cmr_photo_gallery: 'Foto / galerij',
  cmr_fallback: 'Werkt de knop niet? Gebruik deze kiezer:',
  cmr_applied_trip: 'Toegepast op rit',
  cmr_clear: 'Wissen',
  cmr_shipper: 'Afzender',
  cmr_consignee: 'Ontvanger',
  cmr_history: 'Recente CMR’s',
  cmr_goods: 'Lading',
  cmr_packages: 'Colli',
  cmr_weight_kg: 'Bruto (kg)',
  cmr_weight_t: 'Beladen (t)',
  cmr_truck: 'Trekker',
  cmr_trailer: 'Oplegger',
  route_cost_matrix: 'Totale Routekosten Matrix',
  maut_calculator: 'Maut / Toll Calculator',
  freight_price_preset: '💶 Vrachtprijs €1.200',
  margin_hint:
    'Netto marge voor ZZP / eigenrijder op basis van vrachtprijs, brandstof, maut en afschrijving',
  freight_price: 'Vrachtprijs €',
  net_margin: 'Netto marge',
  label_fuel: 'Brandstof',
  label_maut: 'Maut',
  label_depreciation: 'Afschrijving',
  label_margin_pct: 'Marge %',
  calc_updated: 'Berekening bijgewerkt · nettobesparing',
  live_tacho_title: 'Live Tachograaf',
  tacho_synced_label: 'Gesynchroniseerd',
  remaining_drive: 'Resterende Rijtijd',
  total_distance: 'Totale Afstand',
  estimated_usage: 'Geschat Verbruik',
  fuel_advantage: 'Brandstofvoordeel',
  net_savings: 'Netto Besparing',
  zzp_title: 'ZZP & Eigenrijder',
  margin_calc: '💶 Rit-Margerekenmachine',
  load_cmr: '📋 CMR PDF / foto laden',
  tacho_eets: 'Tachograaf & EETS',
  live_tacho: 'Live Tachograaf Sync',
  border_waits: 'Grenswachttijden',
  combined_rest: 'Gecombineerde ruststops EG 561/2006',
  primary_actions: 'Primaire acties',
  calc_liters: 'Bereken Optimaal Aantal Liters',
  load_corridor: 'Standaardcorridor Laden',
  strict_detour: 'Strikte Omrijdtijd (4 min)',
  all_cards: 'Alle Tankkaarten',
  expenses: 'Onkosten declareren',
  expenses_hint: 'Scan tankbonnen en voeg Maaltijd / Tol declaraties toe',
  scan_receipt: 'Bon scannen',
  route_input: 'Route-invoer',
  origin: 'Vertrekpunt',
  destination: 'Bestemming',
  vehicle_cargo: 'Voertuig & Lading',
  empty_weight: 'Leeggewicht (ton)',
  loaded_weight: 'Beladen gewicht (ton)',
  fuel_type: 'Brandstoftype',
  truck_routing: 'Truck Routing · Afmetingen & Asbelasting',
  max_height: 'Max. hoogte (m)',
  axle_limit: 'Asbelasting limiet (t)',
  width: 'Breedte (m)',
  length: 'Lengte (m)',
  adr_cargo: 'Vervoert ADR / Gevaarlijke Stoffen',
  reefer_active: 'Koeltrailer actief',
  open: 'Open',
  clear: 'Wissen',
  choose_file_native: 'Bestand kiezen',
  no_file_chosen: 'Geen bestand gekozen',
  dispatch_title: 'Dispatcher',
  dispatch_subtitle: 'Live vloot · CMR · chat · rit-tools',
  kpi_online: 'Online',
  kpi_delayed: 'Vertraagd',
  kpi_cmr_open: 'CMR open',
  kpi_unread: 'Berichten',
  action_add_truck: '+ Truck',
  action_cmr_upload: 'CMR upload',
  action_broadcast: 'Broadcast',
  tab_fleet: 'Vloot',
  tab_cmr: 'CMR',
  tab_chat: 'Chat',
  tab_detail: 'Detail',
  tab_tools: 'Rit-tools',
  fleet_filter_all: 'Alles',
  fleet_filter_online: 'Online',
  fleet_filter_delayed: 'Vertraagd',
  fleet_filter_offline: 'Offline',
  assign_cmr: 'Toewijzen',
  assign_to: 'Wijs toe aan truck',
  queued: 'Wachtrij',
  assigned: 'Toegewezen',
  in_progress: 'Onderweg',
  chat_placeholder: 'Bericht aan chauffeur…',
  chat_send: 'Stuur',
  chat_empty: 'Kies een chauffeur om te chatten',
  detail_timeline: 'Activiteit',
  detail_open_cockpit: 'Open cockpit',
  detail_no_truck: 'Selecteer een truck op de kaart of in de vlootlijst',
  broadcast_prompt: 'Bericht aan alle online chauffeurs',
  status_driving: 'Rijdend',
  status_rest: 'Rust',
  status_loading: 'Laden',
  status_offline: 'Offline',
};

const EN: Pack = {
  planner_title: 'Trip Planner',
  planner_subtitle: 'Planner & Dispatcher · vehicle, ADR, tolls and net savings',
  planner_recalc: '↻ Live recalculation',
  map_engine: 'Map engine',
  map_note_here: 'Bridge heights, axle loads, ADR/hazmat tunnels',
  map_note_ptv: 'European toll & EETS matrix',
  map_note_tomtom: 'Live truck traffic & border delays',
  map_note_trimble: 'Turn-by-turn truck navigation',
  map_note_mapbox: 'Standard vector layer (backup)',
  cmr_active_applied: 'Active CMR · Applied',
  cmr_open: 'Open',
  cmr_import_title: 'CMR / e-CMR import',
  cmr_from_file: 'Consignment note from file',
  cmr_ocr_hint: 'Choose a file or photo. After OCR the CMR is applied to the trip.',
  cmr_drag: 'Drop CMR here or choose below',
  cmr_formats: 'PDF · JPG · PNG · phone & PC',
  cmr_choose_file: 'Choose file',
  cmr_photo_gallery: 'Photo / gallery',
  cmr_fallback: 'Button not working? Use this picker:',
  cmr_applied_trip: 'Applied to trip',
  cmr_clear: 'Clear',
  cmr_shipper: 'Shipper',
  cmr_consignee: 'Consignee',
  cmr_history: 'Recent CMRs',
  cmr_goods: 'Goods',
  cmr_packages: 'Packages',
  cmr_weight_kg: 'Gross (kg)',
  cmr_weight_t: 'Loaded (t)',
  cmr_truck: 'Tractor',
  cmr_trailer: 'Trailer',
  route_cost_matrix: 'Total route cost matrix',
  maut_calculator: 'Toll / Maut calculator',
  freight_price_preset: '💶 Freight price €1,200',
  margin_hint:
    'Net margin for owner-operators based on freight price, fuel, tolls and depreciation',
  freight_price: 'Freight price €',
  net_margin: 'Net margin',
  label_fuel: 'Fuel',
  label_maut: 'Tolls',
  label_depreciation: 'Depreciation',
  label_margin_pct: 'Margin %',
  calc_updated: 'Calculation updated · net savings',
  live_tacho_title: 'Live tachograph',
  tacho_synced_label: 'Synced',
  remaining_drive: 'Remaining drive time',
  total_distance: 'Total distance',
  estimated_usage: 'Estimated usage',
  fuel_advantage: 'Fuel advantage',
  net_savings: 'Net savings',
  zzp_title: 'Owner-operator',
  margin_calc: '💶 Trip margin calculator',
  load_cmr: '📋 Load CMR PDF / photo',
  tacho_eets: 'Tachograph & EETS',
  live_tacho: 'Live tachograph sync',
  border_waits: 'Border waiting times',
  combined_rest: 'Combined rest stops EC 561/2006',
  primary_actions: 'Primary actions',
  calc_liters: 'Calculate optimal liters',
  load_corridor: 'Load standard corridor',
  strict_detour: 'Strict detour (4 min)',
  all_cards: 'All fuel cards',
  expenses: 'Expense claims',
  expenses_hint: 'Scan fuel receipts and add meal / toll claims',
  scan_receipt: 'Scan receipt',
  route_input: 'Route input',
  origin: 'Origin',
  destination: 'Destination',
  vehicle_cargo: 'Vehicle & cargo',
  empty_weight: 'Empty weight (t)',
  loaded_weight: 'Loaded weight (t)',
  fuel_type: 'Fuel type',
  truck_routing: 'Truck routing · dimensions & axle load',
  max_height: 'Max. height (m)',
  axle_limit: 'Axle load limit (t)',
  width: 'Width (m)',
  length: 'Length (m)',
  adr_cargo: 'ADR / dangerous goods',
  reefer_active: 'Reefer trailer active',
  open: 'Open',
  clear: 'Clear',
  choose_file_native: 'Choose file',
  no_file_chosen: 'No file chosen',
  dispatch_title: 'Dispatcher',
  dispatch_subtitle: 'Live fleet · CMR · chat · trip tools',
  kpi_online: 'Online',
  kpi_delayed: 'Delayed',
  kpi_cmr_open: 'CMR open',
  kpi_unread: 'Messages',
  action_add_truck: '+ Truck',
  action_cmr_upload: 'Upload CMR',
  action_broadcast: 'Broadcast',
  tab_fleet: 'Fleet',
  tab_cmr: 'CMR',
  tab_chat: 'Chat',
  tab_detail: 'Detail',
  tab_tools: 'Trip tools',
  fleet_filter_all: 'All',
  fleet_filter_online: 'Online',
  fleet_filter_delayed: 'Delayed',
  fleet_filter_offline: 'Offline',
  assign_cmr: 'Assign',
  assign_to: 'Assign to truck',
  queued: 'Queued',
  assigned: 'Assigned',
  in_progress: 'In progress',
  chat_placeholder: 'Message to driver…',
  chat_send: 'Send',
  chat_empty: 'Select a driver to chat',
  detail_timeline: 'Activity',
  detail_open_cockpit: 'Open cockpit',
  detail_no_truck: 'Select a truck on the map or fleet list',
  broadcast_prompt: 'Message to all online drivers',
  status_driving: 'Driving',
  status_rest: 'Rest',
  status_loading: 'Loading',
  status_offline: 'Offline',
};

const DE: Pack = {
  ...EN,
  planner_title: 'Tourenplaner',
  planner_subtitle: 'Planer & Dispatcher · Fahrzeug, ADR, Maut und Nettoersparnis',
  planner_recalc: '↻ Aktuelle Neuberechnung',
  map_engine: 'Kartenmotor',
  map_note_here: 'Brückenhöhen, Achslasten, ADR/Gefahrgut-Tunnel',
  map_note_ptv: 'Europäische Maut & EETS-Matrix',
  map_note_tomtom: 'Live LKW-Verkehr & Grenzverzögerungen',
  map_note_trimble: 'Turn-by-turn LKW-Navigation',
  map_note_mapbox: 'Standard-Vektorlayer (Backup)',
  cmr_active_applied: 'Aktiver CMR · Übernommen',
  cmr_open: 'Öffnen',
  cmr_import_title: 'CMR / e-CMR Import',
  cmr_from_file: 'Frachtbrief aus Datei',
  cmr_ocr_hint: 'Datei oder Foto wählen. Nach OCR wird der CMR direkt auf die Tour angewandt.',
  cmr_drag: 'CMR hierher ziehen oder unten wählen',
  cmr_formats: 'PDF · JPG · PNG · Telefon & PC',
  cmr_choose_file: 'Datei wählen',
  cmr_photo_gallery: 'Foto / Galerie',
  cmr_fallback: 'Taste funktioniert nicht? Diesen Picker nutzen:',
  cmr_applied_trip: 'Auf Tour übernommen',
  cmr_clear: 'Löschen',
  cmr_shipper: 'Absender',
  cmr_consignee: 'Empfänger',
  cmr_history: 'Letzte CMR',
  cmr_goods: 'Ladung',
  cmr_packages: 'Colli',
  cmr_weight_kg: 'Brutto (kg)',
  cmr_weight_t: 'Beladen (t)',
  cmr_truck: 'Zugmaschine',
  cmr_trailer: 'Auflieger',
  route_cost_matrix: 'Gesamte Routenkosten-Matrix',
  maut_calculator: 'Maut / Toll-Rechner',
  freight_price_preset: '💶 Frachtpreis €1.200',
  margin_hint:
    'Nettomarge für Selbstfahrer auf Basis von Frachtpreis, Kraftstoff, Maut und Abschreibung',
  freight_price: 'Frachtpreis €',
  net_margin: 'Nettomarge',
  label_fuel: 'Kraftstoff',
  label_maut: 'Maut',
  label_depreciation: 'Abschreibung',
  label_margin_pct: 'Marge %',
  calc_updated: 'Berechnung aktualisiert · Nettoersparnis',
  live_tacho_title: 'Live-Tachograph',
  tacho_synced_label: 'Synchronisiert',
  remaining_drive: 'Verbleibende Lenkzeit',
  total_distance: 'Gesamtdistanz',
  estimated_usage: 'Geschätzter Verbrauch',
  fuel_advantage: 'Kraftstoffvorteil',
  net_savings: 'Nettoersparnis',
  zzp_title: 'Selbstfahrer / ZZP',
  margin_calc: '💶 Touren-Margenrechner',
  load_cmr: '📋 CMR PDF / Foto laden',
  tacho_eets: 'Tachograph & EETS',
  live_tacho: 'Live-Tachograph-Sync',
  border_waits: 'Grenzwartezeiten',
  combined_rest: 'Kombinierte Ruhepausen EG 561/2006',
  primary_actions: 'Primäre Aktionen',
  calc_liters: 'Optimale Literzahl berechnen',
  load_corridor: 'Standardkorridor laden',
  strict_detour: 'Strikte Umwegzeit (4 Min)',
  all_cards: 'Alle Tankkarten',
  expenses: 'Spesen deklarieren',
  expenses_hint: 'Tankbelege scannen und Mahlzeit / Maut hinzufügen',
  scan_receipt: 'Beleg scannen',
  route_input: 'Routeneingabe',
  origin: 'Startort',
  destination: 'Ziel',
  vehicle_cargo: 'Fahrzeug & Ladung',
  empty_weight: 'Leergewicht (t)',
  loaded_weight: 'Beladenes Gewicht (t)',
  fuel_type: 'Kraftstoffart',
  truck_routing: 'LKW-Routing · Maße & Achslast',
  max_height: 'Max. Höhe (m)',
  axle_limit: 'Achslast-Limit (t)',
  width: 'Breite (m)',
  length: 'Länge (m)',
  adr_cargo: 'ADR / Gefahrgut',
  reefer_active: 'Kühlauflieger aktiv',
  open: 'Öffnen',
  clear: 'Löschen',
  choose_file_native: 'Datei wählen',
  no_file_chosen: 'Keine Datei gewählt',
  dispatch_title: 'Disposition',
  dispatch_subtitle: 'Live-Flotte · CMR · Chat · Tour-Tools',
  kpi_online: 'Online',
  kpi_delayed: 'Verspätet',
  kpi_cmr_open: 'CMR offen',
  kpi_unread: 'Nachrichten',
  action_add_truck: '+ LKW',
  action_cmr_upload: 'CMR laden',
  action_broadcast: 'Broadcast',
  tab_fleet: 'Flotte',
  tab_cmr: 'CMR',
  tab_chat: 'Chat',
  tab_detail: 'Detail',
  tab_tools: 'Tour-Tools',
  fleet_filter_all: 'Alle',
  fleet_filter_online: 'Online',
  fleet_filter_delayed: 'Verspätet',
  fleet_filter_offline: 'Offline',
  assign_cmr: 'Zuweisen',
  assign_to: 'LKW zuweisen',
  queued: 'Warteschlange',
  assigned: 'Zugewiesen',
  in_progress: 'Unterwegs',
  chat_placeholder: 'Nachricht an Fahrer…',
  chat_send: 'Senden',
  chat_empty: 'Fahrer zum Chatten wählen',
  detail_timeline: 'Aktivität',
  detail_open_cockpit: 'Cockpit öffnen',
  detail_no_truck: 'LKW auf Karte oder Liste wählen',
  broadcast_prompt: 'Nachricht an alle Online-Fahrer',
  status_driving: 'Fahrend',
  status_rest: 'Pause',
  status_loading: 'Laden',
  status_offline: 'Offline',
};

const CS: Pack = {
  ...EN,
  planner_title: 'Plánovač jízd',
  planner_subtitle: 'Plánovač & dispečink · vozidlo, ADR, mýto a čisté úspory',
  planner_recalc: '↻ Aktuální přepočet',
  map_engine: 'Mapový engine',
  map_note_here: 'Výšky mostů, nápravy, ADR/tunely',
  map_note_ptv: 'Evropské mýto & EETS',
  map_note_tomtom: 'Živý provoz kamionů & hranice',
  map_note_trimble: 'Turn-by-turn navigace kamionu',
  map_note_mapbox: 'Standardní vektorová vrstva (záloha)',
  cmr_active_applied: 'Aktivní CMR · Použito',
  cmr_open: 'Otevřít',
  cmr_import_title: 'Import CMR / e-CMR',
  cmr_from_file: 'Nákladní list ze souboru',
  cmr_ocr_hint: 'Vyberte soubor nebo foto. Po OCR se CMR ihned použije na jízdu.',
  cmr_drag: 'Přetáhněte CMR sem nebo vyberte níže',
  cmr_formats: 'PDF · JPG · PNG · telefon & PC',
  cmr_choose_file: 'Vybrat soubor',
  cmr_photo_gallery: 'Foto / galerie',
  cmr_fallback: 'Tlačítko nefunguje? Použijte tento výběr:',
  cmr_applied_trip: 'Použito na jízdu',
  cmr_clear: 'Vymazat',
  cmr_shipper: 'Odesílatel',
  cmr_consignee: 'Příjemce',
  cmr_history: 'Nedávné CMR',
  cmr_goods: 'Náklad',
  cmr_packages: 'Kolie',
  cmr_weight_kg: 'Hrubá (kg)',
  cmr_weight_t: 'Naloženo (t)',
  cmr_truck: 'Tahač',
  cmr_trailer: 'Návěs',
  route_cost_matrix: 'Matice celkových nákladů trasy',
  maut_calculator: 'Kalkulačka mýta',
  freight_price_preset: '💶 Cena přepravy €1.200',
  margin_hint:
    'Čistá marže pro OSVČ podle ceny přepravy, paliva, mýta a odpisů',
  freight_price: 'Cena přepravy €',
  net_margin: 'Čistá marže',
  label_fuel: 'Palivo',
  label_maut: 'Mýto',
  label_depreciation: 'Odpisy',
  label_margin_pct: 'Marže %',
  calc_updated: 'Výpočet aktualizován · čisté úspory',
  live_tacho_title: 'Živý tachograf',
  tacho_synced_label: 'Synchronizováno',
  remaining_drive: 'Zbývající doba řízení',
  total_distance: 'Celková vzdálenost',
  estimated_usage: 'Odhadovaná spotřeba',
  fuel_advantage: 'Výhoda paliva',
  net_savings: 'Čisté úspory',
  zzp_title: 'OSVČ / vlastní dopravce',
  margin_calc: '💶 Kalkulačka marže jízdy',
  load_cmr: '📋 Načíst CMR PDF / foto',
  tacho_eets: 'Tachograf & EETS',
  live_tacho: 'Živá synchronizace tachografu',
  border_waits: 'Čekací doby na hranicích',
  combined_rest: 'Kombinované odpočinky ES 561/2006',
  primary_actions: 'Hlavní akce',
  calc_liters: 'Vypočítat optimální litry',
  load_corridor: 'Načíst standardní koridor',
  strict_detour: 'Striktní objížďka (4 min)',
  all_cards: 'Všechny tankovací karty',
  expenses: 'Vyúčtování výdajů',
  expenses_hint: 'Skenujte účtenky a přidejte jídlo / mýto',
  scan_receipt: 'Skenovat účtenku',
  route_input: 'Zadání trasy',
  origin: 'Výchozí bod',
  destination: 'Cíl',
  vehicle_cargo: 'Vozidlo & náklad',
  empty_weight: 'Hmotnost prázdného (t)',
  loaded_weight: 'Hmotnost naloženého (t)',
  fuel_type: 'Typ paliva',
  truck_routing: 'Routing kamionu · rozměry & nápravy',
  max_height: 'Max. výška (m)',
  axle_limit: 'Limit nápravy (t)',
  width: 'Šířka (m)',
  length: 'Délka (m)',
  adr_cargo: 'ADR / nebezpečný náklad',
  reefer_active: 'Chladírenský návěs aktivní',
  open: 'Otevřít',
  clear: 'Vymazat',
  choose_file_native: 'Vybrat soubor',
  no_file_chosen: 'Žádný soubor nevybrán',
  dispatch_title: 'Dispečink',
  dispatch_subtitle: 'Živá flotila · CMR · chat · nástroje jízdy',
  kpi_online: 'Online',
  kpi_delayed: 'Zpožděno',
  kpi_cmr_open: 'CMR otevřené',
  kpi_unread: 'Zprávy',
  action_add_truck: '+ Kamion',
  action_cmr_upload: 'Nahrát CMR',
  action_broadcast: 'Broadcast',
  tab_fleet: 'Flotila',
  tab_cmr: 'CMR',
  tab_chat: 'Chat',
  tab_detail: 'Detail',
  tab_tools: 'Nástroje',
  fleet_filter_all: 'Vše',
  fleet_filter_online: 'Online',
  fleet_filter_delayed: 'Zpožděno',
  fleet_filter_offline: 'Offline',
  assign_cmr: 'Přiřadit',
  assign_to: 'Přiřadit kamionu',
  queued: 'Ve frontě',
  assigned: 'Přiřazeno',
  in_progress: 'Na cestě',
  chat_placeholder: 'Zpráva řidiči…',
  chat_send: 'Odeslat',
  chat_empty: 'Vyberte řidiče pro chat',
  detail_timeline: 'Aktivita',
  detail_open_cockpit: 'Otevřít kokpit',
  detail_no_truck: 'Vyberte kamion na mapě nebo v seznamu',
  broadcast_prompt: 'Zpráva všem online řidičům',
  status_driving: 'Jízda',
  status_rest: 'Odpočinek',
  status_loading: 'Nakládka',
  status_offline: 'Offline',
};

const PL: Pack = {
  ...EN,
  planner_title: 'Planer tras',
  planner_subtitle: 'Planer & dyspozytor · pojazd, ADR, opłaty i oszczędności',
  planner_recalc: '↻ Aktualne przeliczenie',
  map_engine: 'Silnik map',
  cmr_active_applied: 'Aktywny CMR · Zastosowano',
  cmr_open: 'Otwórz',
  cmr_import_title: 'Import CMR / e-CMR',
  cmr_from_file: 'List przewozowy z pliku',
  cmr_choose_file: 'Wybierz plik',
  cmr_photo_gallery: 'Zdjęcie / galeria',
  cmr_clear: 'Wyczyść',
  primary_actions: 'Główne działania',
  calc_liters: 'Oblicz optymalne litry',
  scan_receipt: 'Skanuj paragon',
  expenses: 'Rozliczenie kosztów',
  tacho_eets: 'Tachograf & EETS',
  live_tacho: 'Live sync tachografu',
  border_waits: 'Czasy oczekiwania na granicy',
  route_input: 'Wprowadzanie trasy',
  origin: 'Punkt startu',
  destination: 'Cel',
};

const FR: Pack = {
  ...EN,
  planner_title: 'Planificateur',
  planner_subtitle: 'Planificateur & dispatcher · véhicule, ADR, péages et économies',
  planner_recalc: '↻ Recalcul actuel',
  map_engine: 'Moteur cartographique',
  cmr_active_applied: 'CMR actif · Appliqué',
  cmr_open: 'Ouvrir',
  cmr_import_title: 'Import CMR / e-CMR',
  cmr_choose_file: 'Choisir un fichier',
  cmr_photo_gallery: 'Photo / galerie',
  cmr_clear: 'Effacer',
  primary_actions: 'Actions principales',
  calc_liters: 'Calculer les litres optimaux',
  scan_receipt: 'Scanner le ticket',
  expenses: 'Notes de frais',
  tacho_eets: 'Tachygraphe & EETS',
  route_input: 'Saisie d’itinéraire',
  origin: 'Départ',
  destination: 'Destination',
};

const PACKS: Partial<Record<AppLocale, Pack>> = {
  NL,
  EN,
  DE,
  CS,
  SK: CS,
  PL,
  FR,
};

export function uiText(locale: AppLocale, key: UiKey): string {
  return PACKS[locale]?.[key] ?? EN[key] ?? NL[key] ?? key;
}
