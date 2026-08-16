export type CaptureGuide =
  | 'cmr'
  | 'anpr'
  | 'walkaround'
  | 'focus'
  | 'tankbon'
  | 'schade';

export type QualityIssue = 'blur' | 'dark' | 'ocr' | null;

export interface QualityResult {
  ok: boolean;
  sharpness: number;
  brightness: number;
  ocrConfidence: number;
  issue: QualityIssue;
  tip: string;
  passMessage: string;
}

/** Documenten (CMR/tankbon): chauffeurs fotograferen 's nachts op parkeerplaatsen — streng is nutteloos. */
function thresholdsFor(guide: CaptureGuide) {
  if (guide === 'cmr' || guide === 'tankbon') {
    return {
      ocrMin: 35,
      brightnessMin: 8,
      sharpnessMin: 12,
      failBias: 0,
    };
  }
  if (guide === 'anpr') {
    return {
      ocrMin: 55,
      brightnessMin: 18,
      sharpnessMin: 28,
      failBias: 0,
    };
  }
  return {
    ocrMin: 45,
    brightnessMin: 14,
    sharpnessMin: 18,
    failBias: 0,
  };
}

function averageChannel(data: Uint8ClampedArray, step = 16): { avg: number; variance: number } {
  let sum = 0;
  let count = 0;
  const samples: number[] = [];
  for (let i = 0; i < data.length; i += 4 * step) {
    const y = 0.299 * data[i]! + 0.587 * data[i + 1]! + 0.114 * data[i + 2]!;
    sum += y;
    samples.push(y);
    count += 1;
  }
  const avg = count ? sum / count : 0;
  let varSum = 0;
  for (const s of samples) varSum += (s - avg) ** 2;
  return { avg, variance: count ? varSum / count : 0 };
}

function laplacianLikeSharpness(data: Uint8ClampedArray, width: number, height: number): number {
  let sum = 0;
  let count = 0;
  const stride = 8;
  for (let y = 0; y < height; y += stride) {
    for (let x = stride; x < width; x += stride) {
      const i = (y * width + x) * 4;
      const j = (y * width + (x - stride)) * 4;
      const a = 0.299 * data[i]! + 0.587 * data[i + 1]! + 0.114 * data[i + 2]!;
      const b = 0.299 * data[j]! + 0.587 * data[j + 1]! + 0.114 * data[j + 2]!;
      sum += Math.abs(a - b);
      count += 1;
    }
  }
  const meanGrad = count ? sum / count : 0;
  return Math.max(0, Math.min(100, Math.round(meanGrad * 4.2)));
}

function tipFor(issue: QualityIssue, guide: CaptureGuide): string {
  if (issue === 'dark') {
    return 'Bijna zwart beeld. Probeer zaklamp of kies een bestaand bestand uit de galerij.';
  }
  if (issue === 'blur') {
    return 'Beeld te onscherp. Nog één poging — of upload een bestand uit de galerij.';
  }
  if (issue === 'ocr') {
    if (guide === 'anpr') {
      return 'Kenteken onduidelijk. Iets dichterbij, of galerij-foto gebruiken.';
    }
    return 'We lezen wat we kunnen. Bij twijfel: controleer de gegevens na het opslaan.';
  }
  return 'Probeer opnieuw of kies een bestand uit de galerij.';
}

/**
 * Pixel-check voor camera. Voor CMR/tankbon: zeer tolerant (nacht / parkeerplaats).
 * Gebruik `forceAccept` voor galerij/PDF-uploads — die mogen nooit stranden op “belichting”.
 */
export function assessPhotoQuality(
  canvas: HTMLCanvasElement,
  guide: CaptureGuide,
  options?: { failBias?: number; forceAccept?: boolean }
): QualityResult {
  const forceAccept = options?.forceAccept ?? false;
  const th = thresholdsFor(guide);
  const failBias = options?.failBias ?? th.failBias;
  const passMessage =
    guide === 'cmr' || guide === 'tankbon'
      ? 'Document ontvangen — gegevens worden uitgelezen'
      : 'Foto goedgekeurd';

  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    if (forceAccept || guide === 'cmr' || guide === 'tankbon') {
      return {
        ok: true,
        sharpness: 70,
        brightness: 50,
        ocrConfidence: 70,
        issue: null,
        tip: '',
        passMessage,
      };
    }
    return {
      ok: false,
      sharpness: 0,
      brightness: 0,
      ocrConfidence: 0,
      issue: 'blur',
      tip: tipFor('blur', guide),
      passMessage,
    };
  }

  const { width, height } = canvas;
  const image = ctx.getImageData(0, 0, width, height);
  const { avg: brightnessRaw } = averageChannel(image.data, 12);
  const brightness = Math.round((brightnessRaw / 255) * 100);
  const sharpness = laplacianLikeSharpness(image.data, width, height);

  const brightnessScore =
    brightness < 15
      ? 40 + brightness
      : brightness > 92
        ? 75
        : 70 + Math.min(25, (55 - Math.abs(brightness - 48)) / 2);
  let ocrConfidence = Math.round(
    Math.max(0, Math.min(100, sharpness * 0.45 + brightnessScore * 0.55))
  );

  // Documenten: boost — we willen doorlaten, niet pesten
  if (guide === 'cmr' || guide === 'tankbon') {
    ocrConfidence = Math.min(100, Math.max(ocrConfidence, 55) + 15);
  }

  let issue: QualityIssue = null;
  if (!forceAccept) {
    if (brightness < th.brightnessMin) issue = 'dark';
    else if (sharpness < th.sharpnessMin) issue = 'blur';
    else if (ocrConfidence < th.ocrMin) issue = 'ocr';
  }

  // CMR / tankbon / galerij: altijd doorlaten (tenzij echt leeg/zwart frame)
  const isDoc = guide === 'cmr' || guide === 'tankbon';
  const emptyFrame = brightness < 4 && sharpness < 4;
  const finalOk = forceAccept || isDoc ? !emptyFrame || forceAccept : issue === null;

  return {
    ok: finalOk,
    sharpness,
    brightness,
    ocrConfidence: finalOk ? Math.max(ocrConfidence, isDoc ? 60 : th.ocrMin) : ocrConfidence,
    issue: finalOk ? null : issue,
    tip: finalOk ? '' : tipFor(issue, guide),
    passMessage,
  };
}

export const GUIDE_COPY: Record<
  CaptureGuide,
  { title: string; instruction: string; captureLabel: string }
> = {
  cmr: {
    title: 'CMR Vrachtbrief',
    instruction:
      'Foto of bestand — ook bij weinig licht oké. Scherpte hoeft niet perfect (nacht / parkeerplaats).',
    captureLabel: 'Vastleggen',
  },
  tankbon: {
    title: 'Tankbon / document',
    instruction:
      'Foto of galerij — nachtfoto’s mogen. We lezen wat er staat; jij kunt daarna controleren.',
    captureLabel: 'Vastleggen',
  },
  anpr: {
    title: 'ANPR Kenteken Scan',
    instruction: 'Lijn het kenteken uit — of kies een duidelijke galerijfoto',
    captureLabel: 'Foto Maken',
  },
  walkaround: {
    title: 'Walkaround Inspectie (4 Hoeken)',
    instruction: 'Lijn de zijkant/hoek uit — nacht oké, liever met zaklamp',
    captureLabel: 'Foto Maken',
  },
  focus: {
    title: 'Slot / Zegel & Dashboard Check',
    instruction: 'Richt op slot, zegel of display',
    captureLabel: 'Foto Maken',
  },
  schade: {
    title: 'Incident / Schadefoto',
    instruction: 'Schade in beeld — ook bij weinig licht accepteren we de foto',
    captureLabel: 'Foto Maken',
  },
};
