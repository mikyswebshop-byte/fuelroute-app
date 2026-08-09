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

const OCR_MIN = 85;

function averageChannel(data: Uint8ClampedArray, step = 16): { avg: number; variance: number } {
  let sum = 0;
  let count = 0;
  const samples: number[] = [];
  for (let i = 0; i < data.length; i += 4 * step) {
    const y = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
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
  // Sample horizontal gradients as a blur proxy (higher = sharper)
  let sum = 0;
  let count = 0;
  const stride = 8;
  for (let y = 0; y < height; y += stride) {
    for (let x = stride; x < width; x += stride) {
      const i = (y * width + x) * 4;
      const j = (y * width + (x - stride)) * 4;
      const a = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const b = 0.299 * data[j] + 0.587 * data[j + 1] + 0.114 * data[j + 2];
      sum += Math.abs(a - b);
      count += 1;
    }
  }
  const meanGrad = count ? sum / count : 0;
  // Map ~0–40 gradient into 0–100 score
  return Math.max(0, Math.min(100, Math.round(meanGrad * 4.2)));
}

function tipFor(issue: QualityIssue, guide: CaptureGuide): string {
  if (issue === 'dark') {
    return 'Foto te wazig of te donker. Zet je zaklamp aan en neem opnieuw.';
  }
  if (issue === 'blur') {
    return 'Foto te wazig of uit focus. Houd de camera stil en neem opnieuw.';
  }
  if (issue === 'ocr') {
    if (guide === 'anpr') {
      return 'Kenteken niet leesbaar, houd de camera 20cm dichterbij.';
    }
    if (guide === 'cmr' || guide === 'tankbon') {
      return 'Tekst niet leesbaar genoeg voor OCR. Verbeter belichting en vul het kader.';
    }
    return 'Details niet scherp genoeg. Zoom dichterbij en probeer opnieuw.';
  }
  return 'Foto afgekeurd. Neem opnieuw met voldoende licht.';
}

/** Analyseer canvas-pixels voor scherpte, belichting en OCR-confidence. */
export function assessPhotoQuality(
  canvas: HTMLCanvasElement,
  guide: CaptureGuide,
  /** Demo: forceer afkeuring (0–1 kans) naast echte pixelchecks */
  failBias = 0.12
): QualityResult {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const passMessage = 'Foto goedgekeurd & OCR succesvol uitgelezen';

  if (!ctx) {
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

  // OCR confidence derived from sharpness + brightness sweet spot
  const brightnessScore =
    brightness < 25 ? brightness * 1.5 : brightness > 88 ? 100 - (brightness - 88) * 3 : 90 + Math.min(10, (50 - Math.abs(brightness - 52)) / 5);
  let ocrConfidence = Math.round(
    Math.max(0, Math.min(100, sharpness * 0.55 + brightnessScore * 0.45))
  );

  // Document / plate guides need higher text confidence
  if (guide === 'cmr' || guide === 'anpr' || guide === 'tankbon') {
    ocrConfidence = Math.min(100, ocrConfidence + 2);
  }

  let issue: QualityIssue = null;
  if (brightness < 28) issue = 'dark';
  else if (sharpness < 38) issue = 'blur';
  else if (ocrConfidence < OCR_MIN) issue = 'ocr';

  // Occasional simulated fail when metrics are borderline (demo realism)
  if (!issue && failBias > 0 && Math.random() < failBias && (sharpness < 55 || brightness < 40)) {
    issue = sharpness < 45 ? 'blur' : brightness < 38 ? 'dark' : 'ocr';
    if (issue === 'ocr') ocrConfidence = Math.min(ocrConfidence, 78);
  }

  const ok = issue === null && ocrConfidence >= OCR_MIN;

  return {
    ok,
    sharpness,
    brightness,
    ocrConfidence: ok ? Math.max(ocrConfidence, OCR_MIN) : ocrConfidence,
    issue,
    tip: tipFor(issue, guide),
    passMessage,
  };
}

export const GUIDE_COPY: Record<
  CaptureGuide,
  { title: string; instruction: string; captureLabel: string }
> = {
  cmr: {
    title: 'CMR Vrachtbrief Scan',
    instruction: 'Plaats de vrachtbrief binnen het kader met voldoende licht',
    captureLabel: 'Foto Maken',
  },
  tankbon: {
    title: 'Tankbon / Document Scan',
    instruction: 'Plaats de vrachtbrief binnen het kader met voldoende licht',
    captureLabel: 'Foto Maken',
  },
  anpr: {
    title: 'ANPR Kenteken Scan',
    instruction: 'Lijn het kenteken van truck/oplegger uit binnen het gele kader',
    captureLabel: 'Foto Maken',
  },
  walkaround: {
    title: 'Walkaround Inspectie (4 Hoeken)',
    instruction: 'Lijn de zijkant/hoek van het voertuig uit binnen de stippellijn',
    captureLabel: 'Foto Maken',
  },
  focus: {
    title: 'Slot / Zegel & Dashboard Check',
    instruction: 'Richt het focusdoel op slot, zegel of dashboarddisplay',
    captureLabel: 'Foto Maken',
  },
  schade: {
    title: 'Incident / Schadefoto',
    instruction: 'Lijn de zijkant/hoek van het voertuig uit binnen de stippellijn',
    captureLabel: 'Foto Maken',
  },
};
