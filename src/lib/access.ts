import type { AppRole } from '@/lib/roles';

/** Fine-grained UI blocks that can be shown/hidden per persona. */
export type ComponentId =
  | 'fuel_theft_alerts'
  | 'financial_margins'
  | 'legal_disclaimers'
  | 'csrd_co2'
  | 'geofence_sms'
  | 'accounting_exports'
  | 'vehicle_costs'
  | 'maut_tol_matrix'
  | 'fleet_management_settings'
  | 'live_navigation_maps'
  | 'driver_eco_scores'
  | 'walkaround_forms'
  | 'werkorders'
  | 'apk_banden'
  | 'schaderapporten'
  | 'invoice_matching'
  | 'vat_reports'
  | 'csv_exports';

/** Components denied for a role. Omitted roles (and null) see everything. */
const ROLE_DENY: Partial<Record<AppRole, readonly ComponentId[]>> = {
  garage: [
    'fuel_theft_alerts',
    'financial_margins',
    'legal_disclaimers',
    'csrd_co2',
    'geofence_sms',
    'accounting_exports',
    'live_navigation_maps',
    'driver_eco_scores',
    'maut_tol_matrix',
    'invoice_matching',
    'vat_reports',
  ],
  chauffeur: [
    'accounting_exports',
    'vehicle_costs',
    'maut_tol_matrix',
    'fleet_management_settings',
    'csrd_co2',
    'financial_margins',
    'invoice_matching',
    'vat_reports',
    'csv_exports',
  ],
  accountant: [
    'live_navigation_maps',
    'driver_eco_scores',
    'walkaround_forms',
    'fuel_theft_alerts',
    'geofence_sms',
  ],
};

export function hasAccess(role: AppRole | null, componentId: ComponentId): boolean {
  if (!role) return true;
  const denied = ROLE_DENY[role];
  if (!denied) return true;
  return !denied.includes(componentId);
}

export function scrollToId(id: string) {
  if (typeof document === 'undefined') return;
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
