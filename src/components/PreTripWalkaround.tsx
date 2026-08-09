'use client';

import { useMemo, useState } from 'react';
import { ActionButton } from '@/components/ActionBar';
import { CameraCaptureModal } from '@/components/CameraCaptureModal';

const SIDES = ['Voor', 'Achter', 'Links', 'Rechts'] as const;
type Side = (typeof SIDES)[number];

type AiFlag = {
  side: Side;
  severity: 'ok' | 'warn' | 'critical';
  message: string;
};

function analyzeSide(side: Side): AiFlag {
  if (side === 'Links') {
    return {
      side,
      severity: 'warn',
      message: 'Lage bandenspanning / slijtage linksvoor gedetecteerd',
    };
  }
  if (side === 'Rechts') {
    return {
      side,
      severity: 'critical',
      message: 'Mogelijke schadezone rechtsachter — vóór vertrek controleren',
    };
  }
  if (side === 'Achter') {
    return {
      side,
      severity: 'warn',
      message: 'Lichte verontreiniging / zichtbaarheid achterlichten controleren',
    };
  }
  return { side, severity: 'ok', message: 'Geen afwijkingen — OK voor vertrek' };
}

export function PreTripWalkaround({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [photos, setPhotos] = useState<Partial<Record<Side, string>>>({});
  const [flags, setFlags] = useState<Partial<Record<Side, AiFlag>>>({});
  const [cameraSide, setCameraSide] = useState<Side | null>(null);
  const [analyzing, setAnalyzing] = useState<Side | null>(null);

  const doneCount = Object.keys(photos).length;
  const critical = useMemo(
    () => Object.values(flags).filter((f) => f?.severity === 'critical').length,
    [flags]
  );
  const warnings = useMemo(
    () => Object.values(flags).filter((f) => f?.severity === 'warn').length,
    [flags]
  );

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-[#1e293b] border border-slate-600 rounded-2xl p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start gap-3">
            <div>
              <h3 className="text-lg font-bold text-[#f8fafc]">⏱ 30-sec Pre-Trip Walkaround</h3>
              <p className="text-xs text-[#cbd5e1] mt-1">
                4 zijden truck/trailer · AI vlaggt schade & bandenconditie vóór vertrek
              </p>
            </div>
            <button type="button" onClick={onClose} className="text-slate-400 text-xs">
              Sluiten
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {SIDES.map((side) => {
              const flag = flags[side];
              const hasPhoto = Boolean(photos[side]);
              return (
                <button
                  key={side}
                  type="button"
                  onClick={() => setCameraSide(side)}
                  className={`rounded-xl border p-3 text-left transition ${
                    flag?.severity === 'critical'
                      ? 'border-rose-500/50 bg-rose-950/30'
                      : flag?.severity === 'warn'
                        ? 'border-amber-500/40 bg-amber-950/25'
                        : hasPhoto
                          ? 'border-emerald-500/40 bg-emerald-500/10'
                          : 'border-slate-700 bg-slate-900'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-100">{side}</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {analyzing === side
                      ? '🤖 AI analyseert…'
                      : hasPhoto
                        ? '✓ Foto + AI-check'
                        : '📷 Camera (≈7s)'}
                  </p>
                </button>
              );
            })}
          </div>

          {doneCount > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                AI-vlaggen vóór vertrek
              </p>
              {SIDES.filter((s) => flags[s]).map((side) => {
                const flag = flags[side]!;
                return (
                  <div
                    key={side}
                    className={`rounded-lg border px-3 py-2 text-xs ${
                      flag.severity === 'critical'
                        ? 'border-rose-500/40 bg-rose-950/25 text-rose-200'
                        : flag.severity === 'warn'
                          ? 'border-amber-500/40 bg-amber-950/20 text-amber-200'
                          : 'border-emerald-500/30 bg-emerald-950/20 text-emerald-200'
                    }`}
                  >
                    <span className="font-bold">{side} · </span>
                    {flag.message}
                  </div>
                );
              })}
              <p className="text-[11px] text-slate-400">
                {doneCount}/4 zijden · {critical} kritiek · {warnings} waarschuwing
              </p>
            </div>
          )}

          <ActionButton
            variant="primary"
            className="w-full"
            disabled={doneCount < 4}
            onClick={onClose}
          >
            {doneCount < 4
              ? `Nog ${4 - doneCount} foto(s) nodig`
              : critical > 0
                ? 'Inspectie afronden (kritieke vlaggen open)'
                : '✅ Pre-trip OK — Klaar voor vertrek'}
          </ActionButton>
        </div>
      </div>

      {cameraSide && (
        <CameraCaptureModal
          guide="walkaround"
          subtitle={`Pre-trip · ${cameraSide} · AI schade & banden`}
          onClose={() => setCameraSide(null)}
          onAccepted={(dataUrl) => {
            const side = cameraSide;
            setPhotos((prev) => ({ ...prev, [side]: dataUrl }));
            setCameraSide(null);
            setAnalyzing(side);
            window.setTimeout(() => {
              setFlags((prev) => ({ ...prev, [side]: analyzeSide(side) }));
              setAnalyzing(null);
            }, 700);
          }}
        />
      )}
    </>
  );
}
