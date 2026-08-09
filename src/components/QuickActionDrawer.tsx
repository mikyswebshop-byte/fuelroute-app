'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRole } from '@/components/RoleProvider';

const ACTIONS = [
  {
    href: '/driver?action=scan',
    label: 'Scan Bonnet / CMR',
    icon: '📸',
    className: 'bg-emerald-950/50 text-emerald-300 border-emerald-500/30',
  },
  {
    href: '/driver?action=schade',
    label: 'Meld Schade',
    icon: '🚨',
    className: 'bg-rose-950/40 text-rose-300 border-rose-500/30',
  },
  {
    href: '/fleet?action=service',
    label: 'Plan Onderhoud',
    icon: '🔧',
    className: 'bg-indigo-950/40 text-indigo-300 border-indigo-500/30',
  },
] as const;

export function QuickActionDrawer() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { role } = useRole();
  if (pathname === '/' || role === 'chauffeur') return null;

  return (
    <div className="fixed bottom-5 right-4 z-[55] md:hidden flex flex-col items-end gap-2">
      {open && (
        <div className="flex flex-col gap-2 mb-1 animate-in fade-in">
          {ACTIONS.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              onClick={() => setOpen(false)}
              className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-medium shadow-lg backdrop-blur-sm ${a.className}`}
            >
              <span aria-hidden>{a.icon}</span>
              {a.label}
            </Link>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="h-12 w-12 rounded-full bg-slate-800/95 border border-slate-600 text-slate-100 text-lg font-bold shadow-xl shadow-black/40"
        aria-expanded={open}
        aria-label={open ? 'Sluit snelle acties' : 'Open snelle acties'}
      >
        {open ? '×' : '⚡'}
      </button>
    </div>
  );
}
