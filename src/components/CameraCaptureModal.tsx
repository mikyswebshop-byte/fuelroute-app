'use client';

import { useEffect, useId, useRef, useState, type ChangeEvent } from 'react';
import { ActionButton } from '@/components/ActionBar';
import {
  assessPhotoQuality,
  GUIDE_COPY,
  type CaptureGuide,
  type QualityResult,
} from '@/lib/photo-quality';

function GuideOverlay({ guide }: { guide: CaptureGuide }) {
  if (guide === 'anpr') {
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice">
        <rect x="40" y="250" width="280" height="90" rx="10" fill="none" stroke="#facc15" strokeWidth="4" />
        <rect x="48" y="258" width="264" height="74" rx="6" fill="none" stroke="#facc15" strokeWidth="1.5" strokeDasharray="8 6" opacity="0.8" />
        <text x="180" y="370" textAnchor="middle" fill="#facc15" fontSize="14" fontWeight="700">
          KENTEKEN
        </text>
      </svg>
    );
  }

  if (guide === 'walkaround' || guide === 'schade') {
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice">
        <path
          d="M70 420 L90 300 L120 240 L240 240 L280 300 L300 420 L280 440 L80 440 Z"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="3"
          strokeDasharray="10 8"
        />
        <path
          d="M110 300 L250 300 L260 360 L100 360 Z"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2"
          strokeDasharray="6 6"
          opacity="0.7"
        />
        <circle cx="120" cy="400" r="18" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 4" />
        <circle cx="240" cy="400" r="18" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 4" />
      </svg>
    );
  }

  if (guide === 'focus') {
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice">
        <circle cx="180" cy="320" r="70" fill="none" stroke="#10b981" strokeWidth="3" />
        <circle cx="180" cy="320" r="42" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="5 5" />
        <line x1="180" y1="230" x2="180" y2="270" stroke="#10b981" strokeWidth="2" />
        <line x1="180" y1="370" x2="180" y2="410" stroke="#10b981" strokeWidth="2" />
        <line x1="90" y1="320" x2="130" y2="320" stroke="#10b981" strokeWidth="2" />
        <line x1="230" y1="320" x2="270" y2="320" stroke="#10b981" strokeWidth="2" />
      </svg>
    );
  }

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice">
      <rect x="36" y="140" width="288" height="360" rx="8" fill="none" stroke="#34d399" strokeWidth="3" />
      <path d="M36 180 H70 M36 140 V174" stroke="#34d399" strokeWidth="5" strokeLinecap="round" />
      <path d="M324 180 H290 M324 140 V174" stroke="#34d399" strokeWidth="5" strokeLinecap="round" />
      <path d="M36 460 H70 M36 500 V466" stroke="#34d399" strokeWidth="5" strokeLinecap="round" />
      <path d="M324 460 H290 M324 500 V466" stroke="#34d399" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

type SourceMode = 'pick' | 'camera' | 'file';

export function CameraCaptureModal({
  guide,
  subtitle,
  onClose,
  onAccepted,
}: {
  guide: CaptureGuide;
  subtitle?: string;
  onClose: () => void;
  onAccepted: (dataUrl: string, quality: QualityResult) => void;
}) {
  const uid = useId();
  const galleryId = `${uid}-gallery`;
  const fileId = `${uid}-file`;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [mode, setMode] = useState<SourceMode>('pick');
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<QualityResult | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const copy = GUIDE_COPY[guide];

  useEffect(() => {
    if (mode !== 'camera') {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setCameraReady(false);
      return;
    }

    let cancelled = false;

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError('Camera niet beschikbaar — kies een bestand uit de galerij.');
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
          setCameraReady(true);
        }
      } catch {
        setCameraError('Geen cameratoegang. Kies een foto uit je galerij.');
      }
    }

    void start();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [mode]);

  const runValidation = (
    source: HTMLVideoElement | HTMLImageElement,
    opts?: { fromFile?: boolean }
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = 'videoWidth' in source ? source.videoWidth || 640 : source.naturalWidth || 640;
    const h = 'videoHeight' in source ? source.videoHeight || 480 : source.naturalHeight || 480;
    canvas.width = Math.min(960, w);
    canvas.height = Math.round((canvas.width / w) * h);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setPreview(dataUrl);
    setChecking(true);
    setResult(null);

    window.setTimeout(() => {
      const fromFile = opts?.fromFile ?? false;
      const docGuide = guide === 'cmr' || guide === 'tankbon';
      const quality = assessPhotoQuality(canvas, guide, {
        failBias: 0,
        // Galerij/bestand of CMR/tankbon: nooit afkeuren op “belichting/kader”
        forceAccept: fromFile || docGuide,
      });
      setChecking(false);
      setResult(quality);
      if (quality.ok) {
        setToast(quality.passMessage);
        window.setTimeout(() => {
          onAccepted(dataUrl, quality);
        }, 400);
      }
    }, 280);
  };

  const captureFromCamera = () => {
    const video = videoRef.current;
    if (!video || !cameraReady) return;
    runValidation(video);
  };

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMode('file');
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      runValidation(img, { fromFile: true });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      setCameraError('Bestand kon niet worden gelezen. Probeer JPG of PNG.');
      URL.revokeObjectURL(url);
    };
    img.src = url;
    e.target.value = '';
  };

  const retry = () => {
    setResult(null);
    setPreview(null);
    setToast(null);
    setChecking(false);
    setMode('pick');
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/80 flex items-end md:items-center justify-center p-3 md:p-4">
      <div className="w-full max-w-lg bg-[#0f1620] border border-[#1e2a3a] rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-4 py-3 border-b border-[#1e2a3a] flex justify-between items-start gap-3">
          <div>
            <h3 className="text-lg font-bold text-[#f8fafc]">{copy.title}</h3>
            <p className="text-xs text-[#9aa8bc]">{subtitle ?? copy.instruction}</p>
          </div>
          <button type="button" onClick={onClose} className="text-[#9aa8bc] hover:text-white text-sm shrink-0">
            Sluiten
          </button>
        </div>

        {/* Hidden inputs — géén capture op galerij/bestand (iOS forceert anders camera) */}
        <input
          id={galleryId}
          type="file"
          accept="image/*"
          className="absolute w-px h-px opacity-0"
          style={{ clip: 'rect(0,0,0,0)' }}
          onChange={onFile}
        />
        <input
          id={fileId}
          type="file"
          accept="image/*,.pdf,application/pdf,.jpg,.jpeg,.png"
          className="absolute w-px h-px opacity-0"
          style={{ clip: 'rect(0,0,0,0)' }}
          onChange={onFile}
        />

        {mode === 'pick' && !preview && (
          <div className="p-5 space-y-3">
            <p className="text-sm text-[#c5d0e0] text-center">
              Kies hoe je het document wilt toevoegen — camera opent alleen als jij dat wilt.
            </p>
            <label
              htmlFor={galleryId}
              className="flex items-center justify-center gap-2 w-full rounded-[12px] px-4 py-3.5 text-sm font-bold cursor-pointer bg-[#00a3ff] text-white touch-manipulation"
            >
              🖼️ Foto uit galerij
            </label>
            <label
              htmlFor={fileId}
              className="flex items-center justify-center gap-2 w-full rounded-[12px] px-4 py-3.5 text-sm font-bold cursor-pointer border border-[#00a3ff]/50 text-[#e8eef7] touch-manipulation"
            >
              📁 Bestand kiezen (JPG / PNG / PDF)
            </label>
            <button
              type="button"
              onClick={() => setMode('camera')}
              className="flex items-center justify-center gap-2 w-full rounded-[12px] px-4 py-3.5 text-sm font-bold border border-[#1e2a3a] bg-[#151d2a] text-[#c5d0e0] touch-manipulation"
            >
              📷 Live camera
            </button>
            {/* Native fallback */}
            <div className="pt-2">
              <p className="fr-label mb-1">Werkt de knop niet?</p>
              <input
                type="file"
                accept="image/*,.pdf,application/pdf"
                onChange={onFile}
                className="block w-full text-xs text-[#c5d0e0] file:mr-3 file:rounded-[8px] file:border-0 file:bg-[#00a3ff] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white"
              />
            </div>
          </div>
        )}

        {(mode === 'camera' || preview || checking) && (
          <div className="relative aspect-[3/4] max-h-[58vh] bg-slate-950 overflow-hidden">
            {!preview && mode === 'camera' && (
              <>
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  autoPlay
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {!cameraReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
                    <p className="text-sm text-[#cbd5e1] px-6 text-center">
                      {cameraError ?? 'Camera wordt gestart…'}
                    </p>
                  </div>
                )}
                <GuideOverlay guide={guide} />
              </>
            )}

            {preview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Vastgelegde foto" className="absolute inset-0 w-full h-full object-cover" />
            )}

            {checking && (
              <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                <div className="rounded-2xl bg-[#1e293b] border border-sky-500/40 px-5 py-4 text-center">
                  <p className="text-sm font-bold text-[#38bdf8] animate-pulse">AI-kwaliteitscontrole…</p>
                </div>
              </div>
            )}

            {toast && result?.ok && (
              <div className="absolute top-3 inset-x-3 rounded-xl bg-emerald-600 border-2 border-emerald-300/40 px-4 py-3 text-center shadow-lg">
                <p className="text-sm font-bold text-white">✓ AKKOORD — {toast}</p>
              </div>
            )}
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        {result && !result.ok && (
          <div className="mx-4 mt-3 rounded-xl border-2 border-red-500/50 bg-red-500/15 p-4 space-y-2">
            <p className="text-sm font-black text-red-300">AFGEKEURD</p>
            <p className="text-xs text-[#f8fafc]">{result.tip}</p>
          </div>
        )}

        {mode === 'camera' && !preview && (
          <div className="p-4 grid grid-cols-2 gap-2">
            <ActionButton variant="slate" className="w-full" onClick={() => setMode('pick')}>
              Terug
            </ActionButton>
            <ActionButton
              variant="primary"
              className="w-full"
              onClick={captureFromCamera}
              disabled={!cameraReady || checking}
            >
              📷 Vastleggen
            </ActionButton>
          </div>
        )}

        {result && !result.ok && (
          <div className="p-4 grid grid-cols-2 gap-2">
            <ActionButton variant="slate" className="w-full" onClick={onClose}>
              Annuleren
            </ActionButton>
            <ActionButton variant="primary" className="w-full" onClick={retry}>
              🔄 Opnieuw
            </ActionButton>
          </div>
        )}
      </div>
    </div>
  );
}
