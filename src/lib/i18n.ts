export type AppLocale =
  | 'NL'
  | 'DE'
  | 'EN'
  | 'CS'
  | 'SK'
  | 'PL'
  | 'FR'
  | 'ES'
  | 'IT'
  | 'RO'
  | 'HU'
  | 'BG'
  | 'DA'
  | 'SV'
  | 'FI'
  | 'PT'
  | 'EL'
  | 'HR';

export const LANGUAGE_STORAGE_KEY = 'selected_language';

export type LanguageOption = {
  code: AppLocale;
  flag: string;
  nativeName: string;
  localName: string;
  htmlLang: string;
};

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'NL', flag: '🇳🇱', nativeName: 'Nederlands', localName: 'Nederlands (NL)', htmlLang: 'nl' },
  { code: 'DE', flag: '🇩🇪', nativeName: 'Deutsch', localName: 'Deutsch (DE)', htmlLang: 'de' },
  { code: 'EN', flag: '🇬🇧', nativeName: 'English', localName: 'English (EN)', htmlLang: 'en' },
  { code: 'CS', flag: '🇨🇿', nativeName: 'Čeština', localName: 'Čeština / Tsjechisch (CS)', htmlLang: 'cs' },
  { code: 'SK', flag: '🇸🇰', nativeName: 'Slovenčina', localName: 'Slovenčina / Slowaaks (SK)', htmlLang: 'sk' },
  { code: 'PL', flag: '🇵🇱', nativeName: 'Polski', localName: 'Polski / Pools (PL)', htmlLang: 'pl' },
  { code: 'FR', flag: '🇫🇷', nativeName: 'Français', localName: 'Français / Frans (FR)', htmlLang: 'fr' },
  { code: 'ES', flag: '🇪🇸', nativeName: 'Español', localName: 'Español / Spaans (ES)', htmlLang: 'es' },
  { code: 'IT', flag: '🇮🇹', nativeName: 'Italiano', localName: 'Italiano / Italiaans (IT)', htmlLang: 'it' },
  { code: 'RO', flag: '🇷🇴', nativeName: 'Română', localName: 'Română / Roemeens (RO)', htmlLang: 'ro' },
  { code: 'HU', flag: '🇭🇺', nativeName: 'Magyar', localName: 'Magyar / Hongaars (HU)', htmlLang: 'hu' },
  { code: 'BG', flag: '🇧🇬', nativeName: 'Български', localName: 'Български / Bulgaars (BG)', htmlLang: 'bg' },
  { code: 'DA', flag: '🇩🇰', nativeName: 'Dansk', localName: 'Dansk (DA)', htmlLang: 'da' },
  { code: 'SV', flag: '🇸🇪', nativeName: 'Svenska', localName: 'Svenska (SV)', htmlLang: 'sv' },
  { code: 'FI', flag: '🇫🇮', nativeName: 'Suomi', localName: 'Suomi (FI)', htmlLang: 'fi' },
  { code: 'PT', flag: '🇵🇹', nativeName: 'Português', localName: 'Português (PT)', htmlLang: 'pt' },
  { code: 'EL', flag: '🇬🇷', nativeName: 'Ελληνικά', localName: 'Ελληνικά (EL)', htmlLang: 'el' },
  { code: 'HR', flag: '🇭🇷', nativeName: 'Hrvatski', localName: 'Hrvatski (HR)', htmlLang: 'hr' },
];

export type MessageKey =
  | 'nav_dashboard'
  | 'nav_planner'
  | 'nav_driver'
  | 'nav_fleet'
  | 'nav_trucks'
  | 'nav_stations'
  | 'nav_accounting'
  | 'nav_compliance'
  | 'nav_garage'
  | 'nav_settings'
  | 'role_label'
  | 'switch_role'
  | 'switch_role_short'
  | 'landing_subtitle'
  | 'landing_no_pin'
  | 'landing_hint'
  | 'dashboard_title'
  | 'dashboard_subtitle'
  | 'dashboard_actions'
  | 'zzp_actions'
  | 'quick_controls'
  | 'quick_controls_hint'
  | 'monthly_savings_target'
  | 'min_tank_reserve'
  | 'glovebox_title'
  | 'glovebox_subtitle'
  | 'glovebox_open'
  | 'glovebox_search'
  | 'glovebox_vehicle'
  | 'btn_view'
  | 'btn_download_pdf'
  | 'btn_share'
  | 'btn_close'
  | 'upload_title'
  | 'upload_hint'
  | 'upload_drop'
  | 'upload_ai_scanning'
  | 'upload_save'
  | 'upload_open_glovebox'
  | 'trucks_title'
  | 'trucks_subtitle'
  | 'garage_title'
  | 'garage_subtitle'
  | 'garage_actions'
  | 'garage_new_wo'
  | 'garage_damage'
  | 'garage_apk'
  | 'open_workorders'
  | 'fleet_title'
  | 'fleet_subtitle'
  | 'fuel_tolls'
  | 'duty_mode'
  | 'private_mode'
  | 'gps_on'
  | 'gps_off'
  | 'obd_linked'
  | 'offline_mode'
  | 'language'
  | 'doc_niwo'
  | 'doc_registration'
  | 'doc_insurance'
  | 'doc_damage_form'
  | 'doc_apk'
  | 'doc_adr'
  | 'telem_live'
  | 'telem_fuel'
  | 'telem_adblue'
  | 'telem_battery'
  | 'telem_tires'
  | 'telem_range'
  | 'telem_ok'
  | 'telem_warn'
  | 'role_driver_short'
  | 'role_planner_short'
  | 'cockpit_simulating'
  | 'ecmr_title'
  | 'ecmr_subtitle';

type Messages = Record<MessageKey, string>;

const NL: Messages = {
  nav_dashboard: 'Dashboard',
  nav_planner: 'Rit-Planner',
  nav_driver: 'Chauffeur Cockpit',
  nav_fleet: 'Vlootbeheer',
  nav_trucks: 'Voertuigen',
  nav_stations: 'Tankstations & ESPORG',
  nav_accounting: 'Boekhouding & OCR',
  nav_compliance: 'Compliance & Audit',
  nav_garage: 'Garage / Werkplaats',
  nav_settings: 'Instellingen',
  role_label: 'Rol',
  switch_role: '🔄 Wissel Rol / Uitloggen',
  switch_role_short: '🔄 Wissel Rol',
  landing_subtitle: 'Kies uw rol om in te loggen',
  landing_no_pin: 'Geen PIN of wachtwoord · 1-klik toegang',
  landing_hint:
    'Uw rol bepaalt welke modules en navigatietabs zichtbaar zijn. U kunt later wisselen via Wissel Rol / Uitloggen.',
  dashboard_title: 'Dashboard Eigenaar & Directie',
  dashboard_subtitle: 'Drempelwaarden sturen live nalevingsbadges en doelvoortgang',
  dashboard_actions: 'Dashboard-acties',
  zzp_actions: 'ZZP & Eigenrijder',
  quick_controls: 'Snelle Bediening',
  quick_controls_hint: 'Sleep de schuifregelaars — meters en badges worden direct bijgewerkt',
  monthly_savings_target: 'Maandelijks Besparingsdoel',
  min_tank_reserve: 'Minimale Tankreserves',
  glovebox_title: 'Digitale Handschoenvak — Voertuigdocumenten & Licenties',
  glovebox_subtitle: 'Bekijk, download of deel documenten per voertuig',
  glovebox_open: '📄 Digitale Handschoenvak',
  glovebox_search: 'Zoeken',
  glovebox_vehicle: 'Voertuig',
  btn_view: 'Bekijken',
  btn_download_pdf: 'Download PDF',
  btn_share: 'Delen',
  btn_close: '✕ Sluiten',
  upload_title: 'Voertuigdocumenten Upload & Beheer',
  upload_hint: 'Upload PDF/JPG/PNG — AI vult type en vervaldatum in voor de Digitale Handschoenvak',
  upload_drop:
    'Sleep documenten hiernaartoe (PDF, JPG, PNG) of klik om te uploaden. AI herkent automatisch het documenttype en de vervaldatum.',
  upload_ai_scanning: '🔍 AI scant document...',
  upload_save: '💾 Opslaan in Digitale Handschoenvak',
  upload_open_glovebox: '📄 Open Digitale Handschoenvak',
  trucks_title: 'Voertuigen',
  trucks_subtitle: 'Compleet voertuigoverzicht met kenteken, EURO 6, telematica en tankniveau',
  garage_title: 'Garage / Werkplaats',
  garage_subtitle: 'Werkorders · schaderapporten · APK & banden voor monteurs',
  garage_actions: 'Garage-acties',
  garage_new_wo: '🔧 Nieuwe Werkorder',
  garage_damage: '🛠️ Schaderapporten',
  garage_apk: '🛞 APK & Banden',
  open_workorders: 'Open Werkorders',
  fleet_title: 'Vlootbeheer',
  fleet_subtitle: 'Bulk-onboarding · geofencing · trailertracking · diefstal & schade-alerts',
  fuel_tolls: 'Brandstof & Tol',
  duty_mode: '📡 Dienstmodus',
  private_mode: '🔒 Privémodus / Offline',
  gps_on: 'GPS Aan',
  gps_off: 'GPS Uit (AVG)',
  obd_linked: 'Boordcomputer Gekoppeld',
  offline_mode: 'Offline Modus Actief — Routes & Adviezen Lokaal Opgeslagen',
  language: 'Taal',
  doc_niwo: 'Eurovergunning / NIWO',
  doc_registration: 'Kentekenbewijs (Deel I & II)',
  doc_insurance: 'Verzekeringsbewijs / Groene Kaart',
  doc_damage_form: 'Europees Schadeformulier',
  doc_apk: 'APK & Technische Keuring',
  doc_adr: 'Veiligheidsprotocol & ADR',
  telem_live: 'Live telemetrie',
  telem_fuel: 'Brandstof',
  telem_adblue: 'AdBlue',
  telem_battery: 'Accu',
  telem_tires: 'Banden',
  telem_range: 'Bereik',
  telem_ok: 'OK',
  telem_warn: 'Waarschuwing',
  role_driver_short: 'Chauffeur',
  role_planner_short: 'Planner',
  cockpit_simulating: 'Simulatie actief',
  ecmr_title: 'e-CMR Handtekening',
  ecmr_subtitle: 'Digitale handtekening ontvanger · gekoppeld aan e-CMR',
};

const EN: Messages = {
  ...NL,
  nav_dashboard: 'Dashboard',
  nav_planner: 'Trip Planner',
  nav_driver: 'Driver Cockpit',
  nav_fleet: 'Fleet Management',
  nav_trucks: 'Vehicles',
  nav_stations: 'Fuel Stations & ESPORG',
  nav_accounting: 'Accounting & OCR',
  nav_compliance: 'Compliance & Audit',
  nav_garage: 'Garage / Workshop',
  nav_settings: 'Settings',
  role_label: 'Role',
  switch_role: '🔄 Switch Role / Sign out',
  switch_role_short: '🔄 Switch Role',
  landing_subtitle: 'Choose your role to sign in',
  landing_no_pin: 'No PIN or password · 1-click access',
  landing_hint:
    'Your role determines which modules and navigation tabs are visible. You can switch later via Switch Role / Sign out.',
  dashboard_title: 'Owner & Executive Dashboard',
  dashboard_subtitle: 'Thresholds drive live compliance badges and goal progress',
  dashboard_actions: 'Dashboard actions',
  zzp_actions: 'Owner-operator',
  quick_controls: 'Quick Controls',
  quick_controls_hint: 'Drag the sliders — meters and badges update instantly',
  monthly_savings_target: 'Monthly Savings Target',
  min_tank_reserve: 'Minimum Fuel Reserve',
  glovebox_title: 'Digital Glovebox — Vehicle Documents & Licences',
  glovebox_subtitle: 'View, download or share documents per vehicle',
  glovebox_open: '📄 Digital Glovebox',
  glovebox_search: 'Search',
  glovebox_vehicle: 'Vehicle',
  btn_view: 'View',
  btn_download_pdf: 'Download PDF',
  btn_share: 'Share',
  btn_close: '✕ Close',
  upload_title: 'Vehicle Documents Upload & Management',
  upload_hint: 'Upload PDF/JPG/PNG — AI fills type and expiry for the Digital Glovebox',
  upload_drop:
    'Drag documents here (PDF, JPG, PNG) or click to upload. AI automatically detects document type and expiry date.',
  upload_ai_scanning: '🔍 AI scanning document...',
  upload_save: '💾 Save to Digital Glovebox',
  upload_open_glovebox: '📄 Open Digital Glovebox',
  trucks_title: 'Vehicles',
  trucks_subtitle: 'Full vehicle overview with plate, EURO 6, telematics and fuel level',
  garage_title: 'Garage / Workshop',
  garage_subtitle: 'Work orders · damage reports · MOT & tyres for technicians',
  garage_actions: 'Garage actions',
  garage_new_wo: '🔧 New Work Order',
  garage_damage: '🛠️ Damage Reports',
  garage_apk: '🛞 MOT & Tyres',
  open_workorders: 'Open Work Orders',
  fleet_title: 'Fleet Management',
  fleet_subtitle: 'Bulk onboarding · geofencing · trailer tracking · theft & damage alerts',
  fuel_tolls: 'Fuel & Tolls',
  duty_mode: '📡 On duty',
  private_mode: '🔒 Private / Offline',
  gps_on: 'GPS On',
  gps_off: 'GPS Off (GDPR)',
  obd_linked: 'On-board Computer Linked',
  offline_mode: 'Offline Mode Active — Routes & Advice Stored Locally',
  language: 'Language',
  doc_niwo: 'EU Operator Licence / NIWO',
  doc_registration: 'Registration Certificate (Parts I & II)',
  doc_insurance: 'Insurance / Green Card',
  doc_damage_form: 'European Accident Statement',
  doc_apk: 'MOT & Technical Inspection',
  doc_adr: 'Safety Protocol & ADR',
  telem_live: 'Live telemetry',
  telem_fuel: 'Fuel',
  telem_adblue: 'AdBlue',
  telem_battery: 'Battery',
  telem_tires: 'Tyres',
  telem_range: 'Range',
  telem_ok: 'OK',
  telem_warn: 'Warning',
  role_driver_short: 'Driver',
  role_planner_short: 'Planner',
  cockpit_simulating: 'Simulation active',
  ecmr_title: 'e-CMR Signature',
  ecmr_subtitle: 'Recipient digital signature · linked to e-CMR',
};

const CS: Messages = {
  ...EN,
  nav_dashboard: 'Přehled',
  nav_planner: 'Plánovač jízd',
  nav_driver: 'Kokpit řidiče',
  nav_fleet: 'Správa flotily',
  nav_trucks: 'Vozidla',
  nav_stations: 'Čerpací stanice & ESPORG',
  nav_accounting: 'Účetnictví & OCR',
  nav_compliance: 'Compliance & Audit',
  nav_garage: 'Garáž / Dílna',
  nav_settings: 'Nastavení',
  role_label: 'Role',
  switch_role: '🔄 Změnit roli / Odhlásit',
  switch_role_short: '🔄 Změnit roli',
  landing_subtitle: 'Vyberte roli pro přihlášení',
  landing_no_pin: 'Bez PINu nebo hesla · přístup na 1 klik',
  landing_hint:
    'Role určuje viditelné moduly a záložky. Později můžete přepnout přes Změnit roli / Odhlásit.',
  dashboard_title: 'Dashboard majitele & vedení',
  dashboard_subtitle: 'Prahové hodnoty řídí live compliance odznaky a plnění cílů',
  dashboard_actions: 'Akce dashboardu',
  zzp_actions: 'OSVČ / vlastní dopravce',
  quick_controls: 'Rychlé ovládání',
  quick_controls_hint: 'Posuňte posuvníky — měřiče a odznaky se ihned aktualizují',
  monthly_savings_target: 'Měsíční cíl úspor',
  min_tank_reserve: 'Minimální rezerva paliva',
  glovebox_title: 'Digitální schránka — Doklady vozidla & licence',
  glovebox_subtitle: 'Prohlížejte, stahujte nebo sdílejte doklady podle vozidla',
  glovebox_open: '📄 Digitální schránka',
  glovebox_search: 'Hledat',
  glovebox_vehicle: 'Vozidlo',
  btn_view: 'Zobrazit',
  btn_download_pdf: 'Stáhnout PDF',
  btn_share: 'Sdílet',
  btn_close: '✕ Zavřít',
  upload_title: 'Nahrávání & správa dokladů vozidla',
  upload_hint: 'Nahrajte PDF/JPG/PNG — AI doplní typ a datum platnosti do digitální schránky',
  upload_drop:
    'Přetáhněte sem dokumenty (PDF, JPG, PNG) nebo klikněte pro nahrání. AI automaticky rozpozná typ dokumentu a datum platnosti.',
  upload_ai_scanning: '🔍 AI skenuje dokument...',
  upload_save: '💾 Uložit do digitální schránky',
  upload_open_glovebox: '📄 Otevřít digitální schránku',
  trucks_title: 'Vozidla',
  trucks_subtitle: 'Přehled vozidel se SPZ, EURO 6, telematikou a stavem paliva',
  garage_title: 'Garáž / Dílna',
  garage_subtitle: 'Pracovní příkazy · škody · STK & pneumatiky pro techniky',
  garage_actions: 'Akce garáže',
  garage_new_wo: '🔧 Nový pracovní příkaz',
  garage_damage: '🛠️ Hlášení škod',
  garage_apk: '🛞 STK & Pneumatiky',
  open_workorders: 'Otevřené pracovní příkazy',
  fleet_title: 'Správa flotily',
  fleet_subtitle: 'Hromadný onboarding · geofencing · tracking návěsů · krádeže & škody',
  fuel_tolls: 'Palivo & Mýtné',
  duty_mode: '📡 Služba',
  private_mode: '🔒 Soukromí / Offline',
  gps_on: 'GPS Zapnuto',
  gps_off: 'GPS Vypnuto (GDPR)',
  obd_linked: 'Palubní počítač připojen',
  offline_mode: 'Offline režim aktivní — trasy a rady uloženy lokálně',
  language: 'Jazyk',
  doc_niwo: 'Eurolicence / NIWO',
  doc_registration: 'Technický průkaz (část I & II)',
  doc_insurance: 'Pojištění / Zelená karta',
  doc_damage_form: 'Evropský záznam o nehodě',
  doc_apk: 'STK & technická kontrola',
  doc_adr: 'Bezpečnostní protokol & ADR',
};

const SK: Messages = {
  ...EN,
  nav_dashboard: 'Prehľad',
  nav_planner: 'Plánovač jázd',
  nav_driver: 'Kokpit vodiča',
  nav_fleet: 'Správa flotily',
  nav_trucks: 'Vozidlá',
  nav_stations: 'Čerpacie stanice & ESPORG',
  nav_accounting: 'Účtovníctvo & OCR',
  nav_compliance: 'Compliance & Audit',
  nav_garage: 'Garáž / Dielňa',
  nav_settings: 'Nastavenia',
  role_label: 'Rola',
  switch_role: '🔄 Zmeniť rolu / Odhlásiť',
  switch_role_short: '🔄 Zmeniť rolu',
  landing_subtitle: 'Vyberte rolu na prihlásenie',
  landing_no_pin: 'Bez PIN-u alebo hesla · prístup na 1 klik',
  landing_hint:
    'Rola určuje viditeľné moduly a záložky. Neskôr môžete prepnúť cez Zmeniť rolu / Odhlásiť.',
  dashboard_title: 'Dashboard majiteľa & vedenia',
  dashboard_subtitle: 'Prahové hodnoty riadia live compliance odznaky a plnenie cieľov',
  dashboard_actions: 'Akcie dashboardu',
  zzp_actions: 'SZČO / vlastný dopravca',
  quick_controls: 'Rýchle ovládanie',
  quick_controls_hint: 'Posuňte posuvníky — merače a odznaky sa ihneď aktualizujú',
  monthly_savings_target: 'Mesačný cieľ úspor',
  min_tank_reserve: 'Minimálna rezerva paliva',
  glovebox_title: 'Digitálna schránka — Doklady vozidla & licencie',
  glovebox_subtitle: 'Prezerajte, sťahujte alebo zdieľajte doklady podľa vozidla',
  glovebox_open: '📄 Digitálna schránka',
  glovebox_search: 'Hľadať',
  glovebox_vehicle: 'Vozidlo',
  btn_view: 'Zobraziť',
  btn_download_pdf: 'Stiahnuť PDF',
  btn_share: 'Zdieľať',
  btn_close: '✕ Zavrieť',
  upload_title: 'Nahrávanie & správa dokladov vozidla',
  upload_hint: 'Nahrajte PDF/JPG/PNG — AI doplní typ a dátum platnosti do digitálnej schránky',
  upload_drop:
    'Pretiahnite sem dokumenty (PDF, JPG, PNG) alebo kliknite na nahratie. AI automaticky rozpozná typ dokumentu a dátum platnosti.',
  upload_ai_scanning: '🔍 AI skenuje dokument...',
  upload_save: '💾 Uložiť do digitálnej schránky',
  upload_open_glovebox: '📄 Otvoriť digitálnu schránku',
  trucks_title: 'Vozidlá',
  trucks_subtitle: 'Prehľad vozidiel s EČV, EURO 6, telematikou a stavom paliva',
  garage_title: 'Garáž / Dielňa',
  garage_subtitle: 'Pracovné príkazy · škody · STK & pneumatiky pre technikov',
  garage_actions: 'Akcie garáže',
  garage_new_wo: '🔧 Nový pracovný príkaz',
  garage_damage: '🛠️ Hlásenia škôd',
  garage_apk: '🛞 STK & Pneumatiky',
  open_workorders: 'Otvorené pracovné príkazy',
  fleet_title: 'Správa flotily',
  fleet_subtitle: 'Hromadný onboarding · geofencing · tracking návesov · krádeže & škody',
  fuel_tolls: 'Palivo & Mýto',
  duty_mode: '📡 Služba',
  private_mode: '🔒 Súkromie / Offline',
  gps_on: 'GPS Zapnuté',
  gps_off: 'GPS Vypnuté (GDPR)',
  obd_linked: 'Palubný počítač pripojený',
  offline_mode: 'Offline režim aktívny — trasy a rady uložené lokálne',
  language: 'Jazyk',
  doc_niwo: 'Eurolicencia / NIWO',
  doc_registration: 'Technický preukaz (časť I & II)',
  doc_insurance: 'Poistenie / Zelená karta',
  doc_damage_form: 'Európsky záznam o nehode',
  doc_apk: 'STK & technická kontrola',
  doc_adr: 'Bezpečnostný protokol & ADR',
};

/** Partial overrides; missing keys fall back to EN then NL. */
const PARTIALS: Partial<Record<AppLocale, Partial<Messages>>> = {
  DE: {
    nav_dashboard: 'Dashboard',
    nav_planner: 'Tourenplaner',
    nav_driver: 'Fahrer-Cockpit',
    nav_fleet: 'Flottenverwaltung',
    nav_trucks: 'Fahrzeuge',
    nav_stations: 'Tankstellen & ESPORG',
    nav_accounting: 'Buchhaltung & OCR',
    nav_compliance: 'Compliance & Audit',
    nav_garage: 'Werkstatt',
    nav_settings: 'Einstellungen',
    role_label: 'Rolle',
    switch_role: '🔄 Rolle wechseln / Abmelden',
    switch_role_short: '🔄 Rolle wechseln',
    landing_subtitle: 'Wählen Sie Ihre Rolle zum Anmelden',
    landing_no_pin: 'Keine PIN oder Passwort · 1-Klick-Zugang',
    dashboard_title: 'Dashboard Eigentümer & Geschäftsführung',
    dashboard_subtitle: 'Schwellenwerte steuern Live-Compliance und Zielfortschritt',
    dashboard_actions: 'Dashboard-Aktionen',
    quick_controls: 'Schnellsteuerung',
    glovebox_title: 'Digitales Handschuhfach — Fahrzeugdokumente & Lizenzen',
    glovebox_open: '📄 Digitales Handschuhfach',
    btn_view: 'Ansehen',
    btn_download_pdf: 'PDF herunterladen',
    btn_share: 'Teilen',
    btn_close: '✕ Schließen',
    upload_title: 'Fahrzeugdokumente Upload & Verwaltung',
    upload_save: '💾 Im digitalen Handschuhfach speichern',
    trucks_title: 'Fahrzeuge',
    garage_title: 'Werkstatt',
    garage_new_wo: '🔧 Neuer Werkstattauftrag',
    open_workorders: 'Offene Werkstattaufträge',
    fleet_title: 'Flottenverwaltung',
    fuel_tolls: 'Kraftstoff & Maut',
    language: 'Sprache',
    duty_mode: '📡 Dienstmodus',
    private_mode: '🔒 Privat / Offline',
  },
  PL: {
    nav_dashboard: 'Pulpit',
    nav_planner: 'Planer tras',
    nav_driver: 'Kokpit kierowcy',
    nav_fleet: 'Zarządzanie flotą',
    nav_trucks: 'Pojazdy',
    nav_stations: 'Stacje paliw & ESPORG',
    nav_accounting: 'Księgowość & OCR',
    nav_garage: 'Warsztat',
    nav_settings: 'Ustawienia',
    role_label: 'Rola',
    switch_role: '🔄 Zmień rolę / Wyloguj',
    landing_subtitle: 'Wybierz rolę, aby się zalogować',
    dashboard_title: 'Pulpit właściciela i zarządu',
    glovebox_title: 'Cyfrowa schowek — Dokumenty pojazdu i licencje',
    glovebox_open: '📄 Cyfrowa schowek',
    trucks_title: 'Pojazdy',
    garage_title: 'Warsztat',
    fleet_title: 'Zarządzanie flotą',
    language: 'Język',
    fuel_tolls: 'Paliwo & Opłaty drogowe',
  },
  FR: {
    nav_dashboard: 'Tableau de bord',
    nav_planner: 'Planificateur',
    nav_driver: 'Cockpit conducteur',
    nav_fleet: 'Gestion de flotte',
    nav_trucks: 'Véhicules',
    nav_stations: 'Stations & ESPORG',
    nav_accounting: 'Comptabilité & OCR',
    nav_garage: 'Garage / Atelier',
    nav_settings: 'Paramètres',
    role_label: 'Rôle',
    switch_role: '🔄 Changer de rôle / Déconnexion',
    landing_subtitle: 'Choisissez votre rôle pour vous connecter',
    dashboard_title: 'Tableau de bord propriétaire & direction',
    glovebox_title: 'Boîte à gants numérique — Documents & licences',
    glovebox_open: '📄 Boîte à gants numérique',
    trucks_title: 'Véhicules',
    garage_title: 'Garage / Atelier',
    fleet_title: 'Gestion de flotte',
    language: 'Langue',
    fuel_tolls: 'Carburant & Péages',
  },
  ES: {
    nav_dashboard: 'Panel',
    nav_planner: 'Planificador',
    nav_driver: 'Cabina del conductor',
    nav_fleet: 'Gestión de flota',
    nav_trucks: 'Vehículos',
    nav_stations: 'Estaciones & ESPORG',
    nav_accounting: 'Contabilidad & OCR',
    nav_garage: 'Taller',
    nav_settings: 'Ajustes',
    role_label: 'Rol',
    switch_role: '🔄 Cambiar rol / Cerrar sesión',
    landing_subtitle: 'Elija su rol para iniciar sesión',
    dashboard_title: 'Panel de propietario y dirección',
    glovebox_title: 'Guantera digital — Documentos y licencias',
    glovebox_open: '📄 Guantera digital',
    trucks_title: 'Vehículos',
    garage_title: 'Taller',
    fleet_title: 'Gestión de flota',
    language: 'Idioma',
    fuel_tolls: 'Combustible & Peajes',
  },
  IT: {
    nav_dashboard: 'Dashboard',
    nav_planner: 'Pianificatore',
    nav_driver: 'Cockpit autista',
    nav_fleet: 'Gestione flotta',
    nav_trucks: 'Veicoli',
    nav_stations: 'Stazioni & ESPORG',
    nav_accounting: 'Contabilità & OCR',
    nav_garage: 'Officina',
    nav_settings: 'Impostazioni',
    role_label: 'Ruolo',
    switch_role: '🔄 Cambia ruolo / Esci',
    landing_subtitle: 'Scegli il ruolo per accedere',
    dashboard_title: 'Dashboard proprietario & direzione',
    glovebox_title: 'Vano portaoggetti digitale — Documenti e licenze',
    glovebox_open: '📄 Vano portaoggetti digitale',
    trucks_title: 'Veicoli',
    garage_title: 'Officina',
    fleet_title: 'Gestione flotta',
    language: 'Lingua',
    fuel_tolls: 'Carburante & Pedaggi',
  },
  RO: {
    nav_dashboard: 'Panou',
    nav_planner: 'Planificator',
    nav_driver: 'Cockpit șofer',
    nav_fleet: 'Management flotă',
    nav_trucks: 'Vehicule',
    nav_garage: 'Service',
    nav_settings: 'Setări',
    role_label: 'Rol',
    switch_role: '🔄 Schimbă rolul / Deconectare',
    landing_subtitle: 'Alegeți rolul pentru autentificare',
    dashboard_title: 'Panou proprietar & conducere',
    glovebox_open: '📄 Torpedou digital',
    trucks_title: 'Vehicule',
    garage_title: 'Service',
    fleet_title: 'Management flotă',
    language: 'Limbă',
    fuel_tolls: 'Combustibil & Taxe',
  },
  HU: {
    nav_dashboard: 'Irányítópult',
    nav_planner: 'Útvonaltervező',
    nav_driver: 'Sofőr kokpit',
    nav_fleet: 'Flottakezelés',
    nav_trucks: 'Járművek',
    nav_garage: 'Műhely',
    nav_settings: 'Beállítások',
    role_label: 'Szerep',
    switch_role: '🔄 Szerep váltása / Kijelentkezés',
    landing_subtitle: 'Válassza ki a szerepet a bejelentkezéshez',
    dashboard_title: 'Tulajdonosi & vezetői irányítópult',
    glovebox_open: '📄 Digitális kesztyűtartó',
    trucks_title: 'Járművek',
    garage_title: 'Műhely',
    fleet_title: 'Flottakezelés',
    language: 'Nyelv',
    fuel_tolls: 'Üzemanyag & Útdíj',
  },
  BG: {
    nav_dashboard: 'Табло',
    nav_planner: 'Планировчик',
    nav_driver: 'Кабина на шофьора',
    nav_fleet: 'Управление на автопарк',
    nav_trucks: 'Превозни средства',
    nav_garage: 'Гараж / Работилница',
    nav_settings: 'Настройки',
    role_label: 'Роля',
    switch_role: '🔄 Смяна на роля / Изход',
    landing_subtitle: 'Изберете роля за вход',
    dashboard_title: 'Табло на собственик и ръководство',
    glovebox_open: '📄 Дигитално жабче',
    trucks_title: 'Превозни средства',
    garage_title: 'Гараж / Работилница',
    fleet_title: 'Управление на автопарк',
    language: 'Език',
    fuel_tolls: 'Гориво & Тол',
  },
  DA: {
    nav_dashboard: 'Dashboard',
    nav_planner: 'Ruteplanlægger',
    nav_driver: 'Chauffør-cockpit',
    nav_fleet: 'Flådestyring',
    nav_trucks: 'Køretøjer',
    nav_garage: 'Værksted',
    nav_settings: 'Indstillinger',
    role_label: 'Rolle',
    switch_role: '🔄 Skift rolle / Log ud',
    landing_subtitle: 'Vælg din rolle for at logge ind',
    dashboard_title: 'Dashboard ejer & ledelse',
    glovebox_open: '📄 Digital handskerum',
    trucks_title: 'Køretøjer',
    garage_title: 'Værksted',
    fleet_title: 'Flådestyring',
    language: 'Sprog',
    fuel_tolls: 'Brændstof & Bompenge',
  },
  SV: {
    nav_dashboard: 'Instrumentpanel',
    nav_planner: 'Ruttplanerare',
    nav_driver: 'Förarens cockpit',
    nav_fleet: 'Flotthantering',
    nav_trucks: 'Fordon',
    nav_garage: 'Verkstad',
    nav_settings: 'Inställningar',
    role_label: 'Roll',
    switch_role: '🔄 Byt roll / Logga ut',
    landing_subtitle: 'Välj din roll för att logga in',
    dashboard_title: 'Instrumentpanel ägare & ledning',
    glovebox_open: '📄 Digitalt handskfack',
    trucks_title: 'Fordon',
    garage_title: 'Verkstad',
    fleet_title: 'Flotthantering',
    language: 'Språk',
    fuel_tolls: 'Bränsle & Vägtullar',
  },
  FI: {
    nav_dashboard: 'Koontinäyttö',
    nav_planner: 'Reittisuunnittelija',
    nav_driver: 'Kuljettajan ohjaamo',
    nav_fleet: 'Kalustonhallinta',
    nav_trucks: 'Ajoneuvot',
    nav_garage: 'Korjaamo',
    nav_settings: 'Asetukset',
    role_label: 'Rooli',
    switch_role: '🔄 Vaihda roolia / Kirjaudu ulos',
    landing_subtitle: 'Valitse rooli kirjautuaksesi',
    dashboard_title: 'Omistajan & johdon koontinäyttö',
    glovebox_open: '📄 Digitaalinen hansikaslokero',
    trucks_title: 'Ajoneuvot',
    garage_title: 'Korjaamo',
    fleet_title: 'Kalustonhallinta',
    language: 'Kieli',
    fuel_tolls: 'Polttoaine & Tietullit',
  },
  PT: {
    nav_dashboard: 'Painel',
    nav_planner: 'Planeador',
    nav_driver: 'Cockpit do motorista',
    nav_fleet: 'Gestão de frota',
    nav_trucks: 'Veículos',
    nav_garage: 'Oficina',
    nav_settings: 'Definições',
    role_label: 'Função',
    switch_role: '🔄 Mudar função / Terminar sessão',
    landing_subtitle: 'Escolha a função para iniciar sessão',
    dashboard_title: 'Painel do proprietário & direção',
    glovebox_open: '📄 Porta-luvas digital',
    trucks_title: 'Veículos',
    garage_title: 'Oficina',
    fleet_title: 'Gestão de frota',
    language: 'Idioma',
    fuel_tolls: 'Combustível & Portagens',
  },
  EL: {
    nav_dashboard: 'Πίνακας',
    nav_planner: 'Σχεδιαστής διαδρομών',
    nav_driver: 'Cockpit οδηγού',
    nav_fleet: 'Διαχείριση στόλου',
    nav_trucks: 'Οχήματα',
    nav_garage: 'Συνεργείο',
    nav_settings: 'Ρυθμίσεις',
    role_label: 'Ρόλος',
    switch_role: '🔄 Αλλαγή ρόλου / Αποσύνδεση',
    landing_subtitle: 'Επιλέξτε ρόλο για σύνδεση',
    dashboard_title: 'Πίνακας ιδιοκτήτη & διοίκησης',
    glovebox_open: '📄 Ψηφιακό ντουλαπάκι',
    trucks_title: 'Οχήματα',
    garage_title: 'Συνεργείο',
    fleet_title: 'Διαχείριση στόλου',
    language: 'Γλώσσα',
    fuel_tolls: 'Καύσιμα & Διόδια',
  },
  HR: {
    nav_dashboard: 'Nadzorna ploča',
    nav_planner: 'Planer ruta',
    nav_driver: 'Kokpit vozača',
    nav_fleet: 'Upravljanje flotom',
    nav_trucks: 'Vozila',
    nav_garage: 'Radionica',
    nav_settings: 'Postavke',
    role_label: 'Uloga',
    switch_role: '🔄 Promijeni ulogu / Odjava',
    landing_subtitle: 'Odaberite ulogu za prijavu',
    dashboard_title: 'Nadzorna ploča vlasnika i uprave',
    glovebox_open: '📄 Digitalni pretinac',
    trucks_title: 'Vozila',
    garage_title: 'Radionica',
    fleet_title: 'Upravljanje flotom',
    language: 'Jezik',
    fuel_tolls: 'Gorivo & Cestarine',
  },
};

const FULL: Partial<Record<AppLocale, Messages>> = {
  NL,
  EN,
  CS,
  SK,
};

export function isAppLocale(value: string | null | undefined): value is AppLocale {
  return LANGUAGE_OPTIONS.some((o) => o.code === value);
}

export function translate(locale: AppLocale, key: MessageKey): string {
  const fromFull = FULL[locale]?.[key];
  if (fromFull) return fromFull;
  const fromPartial = PARTIALS[locale]?.[key];
  if (fromPartial) return fromPartial;
  return EN[key] ?? NL[key] ?? key;
}

export const NAV_HREF_KEYS: Record<string, MessageKey> = {
  '/dashboard': 'nav_dashboard',
  '/planner': 'nav_planner',
  '/driver': 'nav_driver',
  '/fleet': 'nav_fleet',
  '/trucks': 'nav_trucks',
  '/stations': 'nav_stations',
  '/accounting': 'nav_accounting',
  '/compliance': 'nav_compliance',
  '/garage': 'nav_garage',
  '/settings': 'nav_settings',
};

export function localeOption(code: AppLocale): LanguageOption {
  return LANGUAGE_OPTIONS.find((o) => o.code === code) ?? LANGUAGE_OPTIONS[0]!;
}
