'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/** Page chrome padding — chauffeur needs map-first, no huge empty padding. */
export function MainShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const driver = pathname.startsWith('/driver');

  return (
    <div
      className={
        driver
          ? 'relative z-10 flex-1 pb-14 pointer-events-auto'
          : 'relative z-10 flex-1 py-6 pb-24 md:pb-6 pointer-events-auto'
      }
    >
      {children}
    </div>
  );
}
