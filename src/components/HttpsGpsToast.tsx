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
      <div className="rounded-[14px] border border-[#ff9500]/45 bg-[#1a1008]/95 px-4 py-3 shadow-2xl backdrop-blur text-[#ffe0b2]">
        <div className="flex items-start gap-3">
          <span className="text-xl shrink-0" aria-hidden>
            ⚠️
          </span>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-sm font-bold uppercase tracking-wide text-[#ff9500]">
              HTTP WARNING
            </p>
            <p className="text-xs text-[#ffd9a8]/90 leading-relaxed">
              Niet veilig (HTTP)
              {typeof window !== 'undefined' ? ` · ${window.location.host}` : ''}. Schakel over naar
              HTTPS voor iPhone-GPS. Gebruik een tunnel (ngrok) of deploy op HTTPS.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="text-[#ffb84d] hover:text-white text-sm font-bold shrink-0"
            aria-label="Sluiten"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
