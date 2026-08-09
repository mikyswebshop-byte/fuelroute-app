export type AppRole =
  | 'chauffeur'
  | 'zzp'
  | 'planner'
  | 'owner'
  | 'accountant'
  | 'garage';

export type NavItem = {
  href: string;
  label: string;
};

export const ROLE_STORAGE_KEY = 'fuelroute-active-role';

export const PERSONAS: {
  id: AppRole;
  icon: string;
  title: string;
  scope: string;
  accent: string;
  home: string;
}[] = [
  {
    id: 'chauffeur',
    icon: '🚛',
    title: 'Chauffeur',
    scope: 'Route, Walkaround check, Tanken, Schade',
    accent: 'border-emerald-500/30 hover:bg-emerald-950/40',
    home: '/driver',
  },
  {
    id: 'zzp',
    icon: '💼',
    title: "ZZP'er / Eigenrijder",
    scope: 'Route, Marges, Facturatie, Onderhoud',
    accent: 'border-amber-500/30 hover:bg-amber-950/30',
    home: '/planner',
  },
  {
    id: 'planner',
    icon: '🗺️',
    title: 'Planner / Dispatcher',
    scope: 'Live Vlootkaart, Multi-Engine Planner, Rijtijden',
    accent: 'border-sky-500/30 hover:bg-sky-950/40',
    home: '/planner',
  },
  {
    id: 'owner',
    icon: '🏢',
    title: 'Vlooteigenaar / Manager',
    scope: 'Executive KPIs, Vlootbeheer, CSRD CO2, Onderhoud',
    accent: 'border-indigo-500/30 hover:bg-indigo-950/40',
    home: '/dashboard',
  },
  {
    id: 'accountant',
    icon: '📊',
    title: 'Boekhouder / Financiën',
    scope: 'Fuel cards, Maut/Tol declaraties, Boekhoud-export',
    accent: 'border-violet-500/30 hover:bg-violet-950/40',
    home: '/accounting',
  },
  {
    id: 'garage',
    icon: '🔧',
    title: 'Garage / Monteur',
    scope: 'Werkorders, Schaderapporten, APK & Banden',
    accent: 'border-rose-500/30 hover:bg-rose-950/40',
    home: '/garage',
  },
];

const ALL_NAV: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/planner', label: 'Rit-Planner' },
  { href: '/driver', label: 'Chauffeur Cockpit' },
  { href: '/fleet', label: 'Vlootbeheer' },
  { href: '/trucks', label: 'Voertuigen' },
  { href: '/stations', label: 'Tankstations & ESPORG' },
  { href: '/accounting', label: 'Boekhouding & OCR' },
  { href: '/compliance', label: 'Compliance & Audit' },
  { href: '/garage', label: 'Garage / Werkplaats' },
  { href: '/settings', label: 'Instellingen' },
];

const ROLE_NAV: Record<AppRole, string[]> = {
  chauffeur: ['/driver', '/stations', '/planner', '/settings'],
  zzp: ['/planner', '/driver', '/accounting', '/trucks', '/stations', '/settings'],
  planner: ['/planner', '/fleet', '/driver', '/stations', '/compliance', '/settings'],
  owner: [
    '/dashboard',
    '/fleet',
    '/trucks',
    '/planner',
    '/compliance',
    '/accounting',
    '/stations',
    '/settings',
  ],
  accountant: ['/accounting', '/compliance', '/stations', '/dashboard', '/settings'],
  garage: ['/garage', '/trucks', '/fleet', '/settings'],
};

export function navForRole(role: AppRole | null): NavItem[] {
  if (!role) return ALL_NAV;
  const allowed = new Set(ROLE_NAV[role]);
  return ALL_NAV.filter((item) => allowed.has(item.href));
}

export function personaById(id: AppRole | null) {
  return PERSONAS.find((p) => p.id === id) ?? null;
}

export function isAppRole(value: string | null | undefined): value is AppRole {
  return (
    value === 'chauffeur' ||
    value === 'zzp' ||
    value === 'planner' ||
    value === 'owner' ||
    value === 'accountant' ||
    value === 'garage'
  );
}
