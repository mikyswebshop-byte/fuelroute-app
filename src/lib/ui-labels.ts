import type { ComplianceStatus, TelematicsStatus } from '@/lib/mock-data';

export function nalevingLabel(status: ComplianceStatus | string): string {
  switch (status) {
    case 'Compliant':
      return 'Conform';
    case 'Warning':
      return 'Waarschuwing';
    case 'Critical':
      return 'Kritiek';
    default:
      return status;
  }
}

export function telematicaLabel(status: TelematicsStatus | string): string {
  return status === 'Online' ? 'Verbonden' : 'Niet verbonden';
}

export function factuurStatusLabel(status: string): string {
  if (status === 'Betaald') return 'Betaald';
  if (status === 'Open') return 'Openstaand';
  if (status === 'In controle') return 'In controle';
  return status;
}
