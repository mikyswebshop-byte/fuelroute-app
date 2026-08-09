'use client';

import type { ReactNode } from 'react';
import { useRole } from '@/components/RoleProvider';
import { hasAccess, type ComponentId } from '@/lib/access';

export function RoleGate({
  componentId,
  children,
  fallback = null,
}: {
  componentId: ComponentId;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { role } = useRole();
  if (!hasAccess(role, componentId)) return <>{fallback}</>;
  return <>{children}</>;
}
