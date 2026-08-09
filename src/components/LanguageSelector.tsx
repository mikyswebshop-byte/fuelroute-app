'use client';

import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { LANGUAGE_OPTIONS, localeOption } from '@/lib/i18n';

export function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t, hydrated } = useLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = localeOption(locale);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  if (!hydrated) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/70 ${
          compact ? 'px-2 py-1 text-[10px]' : 'px-2.5 py-1.5 text-xs'
        } text-slate-400`}
      >
        🌐 …
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('language')}
        title={t('language')}
        className={`inline-flex items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-900/80 text-slate-100 hover:bg-slate-800 transition ${
          compact ? 'px-2 py-1 text-[10px]' : 'px-2.5 py-1.5 text-xs'
        } font-semibold`}
      >
        <span aria-hidden>{current.flag}</span>
        <span className="hidden sm:inline">{current.code}</span>
        <span className="text-slate-400" aria-hidden>
          ▾
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t('language')}
          className="absolute right-0 mt-1.5 z-[80] w-64 max-h-80 overflow-y-auto rounded-xl border border-slate-700 bg-slate-900/95 shadow-2xl backdrop-blur-md py-1"
        >
          <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {t('language')}
          </p>
          {LANGUAGE_OPTIONS.map((opt) => {
            const active = opt.code === locale;
            return (
              <button
                key={opt.code}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  setLocale(opt.code);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs transition ${
                  active
                    ? 'bg-sky-500/15 text-sky-200'
                    : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span className="text-base leading-none" aria-hidden>
                  {opt.flag}
                </span>
                <span className="min-w-0">
                  <span className="font-semibold block truncate">{opt.nativeName}</span>
                  <span className="text-[10px] text-slate-500 block truncate">{opt.localName}</span>
                </span>
                {active && <span className="ml-auto text-sky-300 text-[10px]">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
