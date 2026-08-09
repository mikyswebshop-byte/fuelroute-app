'use client';

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { ActionButton } from '@/components/ActionBar';

export function SignatureModal({
  title,
  subtitle,
  onClose,
  onSave,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  onSave: (dataUrl: string, signerName: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const [signerName, setSignerName] = useState('');
  const [hasInk, setHasInk] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
  }, []);

  const pos = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#1e293b] border-2 border-slate-600 rounded-2xl p-5 space-y-4 shadow-2xl">
        <div className="flex justify-between items-start gap-3">
          <div>
            <h3 className="text-lg font-bold text-[#f8fafc]">{title}</h3>
            <p className="text-xs text-[#cbd5e1]">{subtitle}</p>
          </div>
          <button type="button" onClick={onClose} className="text-[#cbd5e1] hover:text-white text-sm">
            Sluiten
          </button>
        </div>

        <div>
          <label className="block text-xs text-[#cbd5e1] mb-1">Naam ontvanger / ondertekenaar</label>
          <input
            type="text"
            value={signerName}
            onChange={(e) => setSignerName(e.target.value)}
            placeholder="bijv. Logistiek Magazijn München"
            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-sm text-[#f8fafc]"
          />
        </div>

        <div>
          <p className="text-xs text-[#cbd5e1] mb-2">Digitale handtekening (op het scherm)</p>
          <canvas
            ref={canvasRef}
            width={640}
            height={220}
            className="w-full h-40 rounded-xl border-2 border-sky-500/30 touch-none cursor-crosshair bg-slate-950"
            onPointerDown={(e) => {
              drawing.current = true;
              const ctx = canvasRef.current?.getContext('2d');
              if (!ctx) return;
              const p = pos(e);
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              if (!drawing.current) return;
              const ctx = canvasRef.current?.getContext('2d');
              if (!ctx) return;
              const p = pos(e);
              ctx.lineTo(p.x, p.y);
              ctx.stroke();
              setHasInk(true);
            }}
            onPointerUp={() => {
              drawing.current = false;
            }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <ActionButton variant="slate" className="w-full" onClick={clear}>
            Wissen
          </ActionButton>
          <ActionButton
            variant="primary"
            className="w-full sm:col-span-2"
            disabled={!hasInk || !signerName.trim()}
            onClick={() => {
              const dataUrl = canvasRef.current?.toDataURL('image/png') ?? '';
              onSave(dataUrl, signerName.trim());
            }}
          >
            Handtekening Opslaan op e-CMR
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
