'use client';

import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';
import { RoleGate } from '@/components/RoleGate';
import { useLanguage } from '@/components/LanguageProvider';
import { cockpitText } from '@/lib/cockpit-i18n';
import { localeToDriverLang } from '@/lib/driver-i18n';

export function LegalFooter() {
  const pathname = usePathname();
  const { locale } = useLanguage();
  const c = useMemo(() => cockpitText(localeToDriverLang(locale)), [locale]);
  const [activeTip, setActiveTip] = useState<string | null>(null);

  // Chauffeur-cockpit: geen leeg zwart disclaimer-vlak onder de rit
  if (pathname.startsWith('/driver')) return null;

  const items = [
    { id: 'maut', short: c.legalMaut, title: c.legalMaut, body: c.legalFoot },
    { id: 'rest', short: c.legalRest, title: c.legalRest, body: c.legalFoot },
    { id: 'price', short: c.legalPrice, title: c.legalPrice, body: c.legalFoot },
    { id: 'driver', short: c.legalDriver, title: c.legalDriver, body: c.legalFoot },
  ];

  return (
    <RoleGate componentId="legal_disclaimers">
      <footer className="mt-auto border-t border-slate-800 px-4 py-5" style={{ background: '#0b0f19' }}>
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#38bdf8]">
              {c.legalTitle}
            </span>
            {items.map((d) => (
              <button
                key={d.id}
                type="button"
                title={d.body}
                onClick={() => setActiveTip(activeTip === d.id ? null : d.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition ${
                  activeTip === d.id
                    ? 'bg-sky-500/20 text-[#38bdf8] border-sky-500/40'
                    : 'bg-[#1e293b] text-[#cbd5e1] border-slate-700 hover:border-slate-500'
                }`}
              >
                {d.short}
              </button>
            ))}
          </div>

          {activeTip && (
            <div className="rounded-lg border border-slate-700 bg-[#1e293b] p-3 text-xs text-[#cbd5e1]">
              <p className="font-bold text-[#f8fafc] mb-1">
                {items.find((d) => d.id === activeTip)?.title}
              </p>
              <p>{items.find((d) => d.id === activeTip)?.body}</p>
            </div>
          )}

          <p className="text-[10px] text-slate-500 leading-relaxed">{c.legalFoot}</p>
        </div>
      </footer>
    </RoleGate>
  );
}
