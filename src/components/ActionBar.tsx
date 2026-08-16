'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'utility' | 'slate' | 'danger';

const VARIANT_CLASS: Record<Variant, string> = {
  primary:
    'bg-[#00a3ff] text-white border border-transparent hover:bg-[#007aff] shadow-md shadow-[0_0_20px_rgba(0,163,255,0.35)]',
  secondary:
    'bg-transparent text-[#e8eef7] border border-[#00a3ff]/50 hover:bg-[#00a3ff]/10',
  utility:
    'bg-[#ff9500]/15 text-[#ffb84d] border border-[#ff9500]/40 hover:bg-[#ff9500]/25',
  slate:
    'bg-[#151d2a] text-[#c5d0e0] border border-[#1e2a3a] hover:bg-[#1a2433]',
  danger:
    'bg-[#ff3b30] text-white border border-transparent hover:bg-[#e0352b] shadow-md shadow-red-500/25',
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
      className={`inline-flex items-center justify-center gap-1.5 rounded-[10px] px-3.5 py-2.5 text-xs font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${VARIANT_CLASS[variant]} ${className}`}
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
      <p className="fr-label mb-2">{title}</p>
      <div className="flex flex-wrap items-center gap-2.5 [&_button]:!w-auto [&_button]:!h-auto [&_button]:!min-h-0">
        {children}
      </div>
    </div>
  );
}
