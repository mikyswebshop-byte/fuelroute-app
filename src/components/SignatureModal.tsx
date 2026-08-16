'use client';

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { ActionButton } from '@/components/ActionBar';

type PadId = 'sender' | 'receiver';

function useSignaturePad(bg = '#0b0e11', ink = '#00a3ff') {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const [hasInk, setHasInk] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [bg, ink]);

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
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    setHasInk(false);
  };

  const handlers = {
    onPointerDown: (e: ReactPointerEvent<HTMLCanvasElement>) => {
      drawing.current = true;
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      const p = pos(e);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    },
    onPointerMove: (e: ReactPointerEvent<HTMLCanvasElement>) => {
      if (!drawing.current) return;
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      const p = pos(e);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      setHasInk(true);
    },
    onPointerUp: () => {
      drawing.current = false;
    },
  };

  return { canvasRef, hasInk, clear, handlers };
}

export function SignatureModal({
  title,
  subtitle,
  onClose,
  onSave,
  contextLines,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  onSave: (dataUrl: string, signerName: string) => void;
  /** Extra lines shown above the pads (CMR summary). */
  contextLines?: string[];
}) {
  const [step, setStep] = useState(2); // Gegevens → Lading → Handtekeningen → Overzicht
  const [signerName, setSignerName] = useState('');
  const sender = useSignaturePad();
  const receiver = useSignaturePad();

  const steps = ['Gegevens', 'Lading', 'Handtekeningen', 'Overzicht'] as const;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl fr-glass p-5 sm:p-6 space-y-5 shadow-2xl">
        <div className="flex justify-between items-start gap-3">
          <div>
            <p className="fr-label mb-1">e-CMR</p>
            <h3 className="fr-display text-lg sm:text-xl">{title}</h3>
            <p className="text-xs text-[var(--fr-text-muted)] mt-1">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--fr-text-dim)] hover:text-white text-sm font-semibold"
          >
            Sluiten
          </button>
        </div>

        {contextLines && contextLines.length > 0 && (
          <ul className="rounded-[12px] border border-[#00a3ff]/30 bg-[#00a3ff]/10 px-3 py-2.5 text-xs text-[#c5e8ff] space-y-1">
            {contextLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        )}

        {/* Stepper — kit §05 */}
        <div className="flex gap-1 sm:gap-2">
          {steps.map((label, i) => {
            const active = i === step;
            const done = i < step;
            return (
              <button
                key={label}
                type="button"
                onClick={() => setStep(i)}
                className={`flex-1 rounded-[10px] px-2 py-2 text-[10px] sm:text-xs font-bold border transition ${
                  active
                    ? 'bg-[#00a3ff]/15 border-[#00a3ff]/50 text-[#7dd3fc]'
                    : done
                      ? 'bg-[#28a745]/10 border-[#28a745]/35 text-[#86efac]'
                      : 'bg-[#0b0e11] border-[#1e2a3a] text-[#6b7a90]'
                }`}
              >
                {i + 1}. {label}
              </button>
            );
          })}
        </div>

        {step < 2 && (
          <div className="rounded-[12px] border border-[#1e2a3a] bg-[#0b0e11] p-4 text-sm text-[var(--fr-text-muted)]">
            {step === 0
              ? 'Vrachtgegevens bevestigd. Ga door naar lading of handtekeningen.'
              : 'Lading gecontroleerd. Ga door naar digitale handtekeningen.'}
            <div className="mt-3">
              <ActionButton variant="primary" onClick={() => setStep(step + 1)}>
                Volgende
              </ActionButton>
            </div>
          </div>
        )}

        {step === 2 && (
          <>
            <div>
              <label className="fr-label mb-1 block">Naam ontvanger / ondertekenaar</label>
              <input
                type="text"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="bijv. Logistiek Magazijn München"
                className="w-full bg-[#050a0f] border border-[#1e2a3a] rounded-[10px] p-2.5 text-sm text-[#f2f6fb] focus:outline-none focus:border-[#00a3ff]/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SigPad
                label="Afzender"
                pad={sender}
                id="sender"
              />
              <SigPad
                label="Ontvanger"
                pad={receiver}
                id="receiver"
              />
            </div>
          </>
        )}

        {step === 3 && (
          <div className="rounded-[12px] border border-[#28a745]/35 bg-[#28a745]/10 p-4 text-sm text-[#86efac]">
            Klaar om op te slaan. Controleer beide handtekeningen en bevestig.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <ActionButton
            variant="slate"
            className="w-full"
            onClick={() => {
              sender.clear();
              receiver.clear();
            }}
          >
            Wissen
          </ActionButton>
          <ActionButton
            variant="primary"
            className="w-full sm:col-span-2"
            disabled={!receiver.hasInk || !signerName.trim()}
            onClick={() => {
              const dataUrl = receiver.canvasRef.current?.toDataURL('image/png') ?? '';
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

function SigPad({
  label,
  pad,
}: {
  label: string;
  pad: ReturnType<typeof useSignaturePad>;
  id: PadId;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="fr-label">{label}</p>
        <button
          type="button"
          onClick={pad.clear}
          className="w-7 h-7 rounded-lg bg-[#ff3b30]/15 border border-[#ff3b30]/40 text-[#ff8a82] text-xs font-black"
          aria-label={`${label} wissen`}
        >
          ✕
        </button>
      </div>
      <canvas
        ref={pad.canvasRef}
        width={640}
        height={220}
        className="w-full h-36 rounded-[12px] border border-[#00a3ff]/30 touch-none cursor-crosshair bg-[#050a0f]"
        {...pad.handlers}
      />
    </div>
  );
}
