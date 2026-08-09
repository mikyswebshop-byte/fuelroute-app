'use client';

import { useEffect, useState } from 'react';
import { isInsecureRemoteOrigin } from '@/lib/gps';

export function HttpsGpsToast() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isInsecureRemoteOrigin()) return;
    setVisible(true);
    const id = window.setTimeout(() => setVisible(false), 12_000);
    return () => window.clearTimeout(id);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed top-20 left-1/2 z-[80] w-[min(92vw,28rem)] -translate-x-1/2 px-3">
      <div className="rounded-2xl border border-amber-500/40 bg-amber-950/95 px-4 py-3 shadow-2xl backdrop-blur text-amber-50">
        <div className="flex items-start gap-3">
          <span className="text-xl shrink-0" aria-hidden>
            ⚠️
          </span>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-sm font-bold">HTTPS vereist voor iPhone GPS</p>
            <p className="text-xs text-amber-100/90 leading-relaxed">
              Je opent de app via HTTP ({typeof window !== 'undefined' ? window.location.host : ''}
              ). iOS Safari geeft alleen precieze locatie via HTTPS of localhost. Gebruik een
              tunnel (bijv. ngrok) of deploy op HTTPS voor echte iPhone-tracking.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="text-amber-200 hover:text-white text-sm font-bold shrink-0"
            aria-label="Sluiten"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
