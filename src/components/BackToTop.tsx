'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function BackToTop() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  if (pathname === '/' || pathname.startsWith('/driver') || !visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })}
      aria-label="Naar boven"
      title="Naar boven"
      className="fixed bottom-8 right-8 z-50 bg-slate-800/90 hover:bg-slate-700 text-slate-100 border border-slate-700 p-4 rounded-full shadow-2xl backdrop-blur-md transition-all max-md:bottom-24"
    >
      <span className="text-base font-bold leading-none" aria-hidden>
        ↑
      </span>
    </button>
  );
}
