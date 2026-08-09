'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'utility' | 'slate' | 'danger';

const VARIANT_CLASS: Record<Variant, string> = {
  primary:
    'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/40',
  secondary:
    'bg-indigo-950/40 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-900/40',
  utility:
    'bg-amber-950/30 text-amber-200/90 border border-amber-500/25 hover:bg-amber-900/30',
  slate:
    'bg-slate-800/80 text-slate-200 border border-slate-700/60 hover:bg-slate-700',
  danger:
    'bg-rose-950/40 text-rose-300 border border-rose-500/30 hover:bg-rose-900/40',
};

export function ActionButton({
  variant = 'slate',
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${VARIANT_CLASS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function ActionBar({
  title = 'Actiebalk',
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-6">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
        {title}
      </p>
      <div className="flex flex-wrap items-center gap-2.5 [&_button]:!w-auto [&_button]:!h-auto [&_button]:!min-h-0 [&_button]:!py-2 [&_button]:!px-3.5 [&_button]:!text-xs [&_button]:!rounded-lg [&_button]:!shadow-sm">
        {children}
      </div>
    </div>
  );
}
