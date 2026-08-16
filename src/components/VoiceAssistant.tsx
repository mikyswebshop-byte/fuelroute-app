'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type VoiceCommandId =
  | 'status'
  | 'tanken'
  | 'stilstand'
  | 'simuleer'
  | 'handschoenvak'
  | 'cmr'
  | 'cmr_foto'
  | 'nieuwe_route'
  | 'navigatie'
  | 'eta'
  | 'rijtijd'
  | 'berichten'
  | 'pech'
  | 'unknown';

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((ev: { error?: string }) => void) | null;
  onend: (() => void) | null;
};

const DEFAULT_HINT =
  "Zeg gerust slordig: waar tanken, grens, goedkoopste pomp, douche, nieuwe route, bon foto…";

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function speakText(text: string, lang = 'nl-NL') {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = 1;
  window.speechSynthesis.speak(u);
}

function normalizeSpeech(raw: string): string {
  return raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Levenshtein — tolerante matching voor typo's / onduidelijke spraak. */
function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i]![0] = i;
  for (let j = 0; j <= n; j++) dp[0]![j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i]![j] = Math.min(
        dp[i - 1]![j]! + 1,
        dp[i]![j - 1]! + 1,
        dp[i - 1]![j - 1]! + cost
      );
    }
  }
  return dp[m]![n]!;
}

function fuzzyHas(haystack: string, needle: string, maxDist = 2): boolean {
  if (!needle) return false;
  if (haystack.includes(needle)) return true;
  const words = haystack.split(' ');
  for (const w of words) {
    if (Math.abs(w.length - needle.length) > maxDist) continue;
    if (editDistance(w, needle) <= maxDist) return true;
  }
  // multi-word needle: check sliding
  const parts = needle.split(' ');
  if (parts.length > 1) {
    return parts.every((p) => fuzzyHas(haystack, p, Math.max(1, maxDist - 1)));
  }
  return false;
}

function anyFuzzy(haystack: string, needles: string[], maxDist = 2): boolean {
  return needles.some((n) => fuzzyHas(haystack, n, maxDist));
}

export function matchVoiceCommand(transcript: string): VoiceCommandId {
  const t = normalizeSpeech(transcript);

  // Foto / bon / CMR scan (vaak slordig uitgesproken)
  if (
    anyFuzzy(t, ['fotograf', 'fotografeer', 'foto', 'scan', 'scannen'], 2) &&
    anyFuzzy(t, ['bon', 'tankbon', 'cmr', 'vrachtbrief', 'brief'], 2)
  ) {
    return 'cmr_foto';
  }
  if (anyFuzzy(t, ['tankbon', 'bonnetje', 'bonnet'], 2)) return 'cmr_foto';

  // Brandstofbesparing / grens — kern van de app
  if (
    anyFuzzy(t, ['grens', 'nederland', 'holland', 'venlo'], 2) ||
    anyFuzzy(t, ['goedkoop', 'goedkoopste', 'bespaar', 'besparing', 'prijs'], 2) ||
    anyFuzzy(t, ['tanken', 'tank', 'diesel', 'brandstof', 'pomp', 'tankstop', 'tankstation'], 2) ||
    t.includes('waar tank') ||
    t.includes('waar kan ik tank') ||
    anyFuzzy(t, ['douche', 'douches', 'wc', 'toilet', 'wachttijd', 'wachtrij'], 2)
  ) {
    return 'tanken';
  }

  if (
    anyFuzzy(t, ['nieuwe', 'andere'], 1) &&
    anyFuzzy(t, ['route', 'navigatie', 'rit'], 2)
  ) {
    return 'nieuwe_route';
  }
  if (anyFuzzy(t, ['bestemming', 'herplan', 'omleiden'], 2)) return 'nieuwe_route';

  if (anyFuzzy(t, ['navigatie', 'navigeer', 'navigeer', 'afslag', 'routebegeleiding'], 2)) {
    return 'navigatie';
  }
  if (anyFuzzy(t, ['eta', 'aankomst'], 1) || t.includes('hoe laat')) return 'eta';

  if (anyFuzzy(t, ['handschoen', 'handschoenvak', 'glovebox', 'documenten'], 2)) {
    return 'handschoenvak';
  }
  if (anyFuzzy(t, ['cmr', 'vrachtbrief', 'handteken', 'handtekening', 'ecmr'], 2)) {
    return 'cmr';
  }

  if (anyFuzzy(t, ['simuleer', 'simulatie'], 2) || t.includes('start rit')) return 'simuleer';
  if (anyFuzzy(t, ['stilstand', 'pauze', 'parkeren'], 2) || t.includes('stop rit')) {
    return 'stilstand';
  }

  if (anyFuzzy(t, ['status', 'voertuig', 'telemetrie'], 2)) return 'status';
  if (anyFuzzy(t, ['rijtijd', 'tachograaf', 'rust'], 2)) return 'rijtijd';
  if (anyFuzzy(t, ['bericht', 'berichten', 'planner', 'zaak', 'chat'], 2)) return 'berichten';
  if (anyFuzzy(t, ['pech', 'nood', 'sos', 'hulpdienst'], 1)) return 'pech';

  // Losse “rijden” alleen als geen ander match — start simulatie
  if (fuzzyHas(t, 'rijden', 1) && !fuzzyHas(t, 'stilstand', 2)) return 'simuleer';

  return 'unknown';
}

export type VoiceResponses = {
  status: string;
  tanken: string;
  stilstand: string;
  simuleer: string;
  handschoenvak: string;
  cmr: string;
  cmr_foto: string;
  nieuwe_route: string;
  navigatie: string;
  eta: string;
  rijtijd: string;
  berichten: string;
  pech: string;
  unknown: string;
  listening: string;
};

export function VoiceAssistant({
  speechLang = 'nl-NL',
  responses,
  onCommand,
  onEmergency,
  large = false,
  className = '',
  hint = DEFAULT_HINT,
}: {
  speechLang?: string;
  responses: VoiceResponses;
  onCommand?: (cmd: Exclude<VoiceCommandId, 'unknown'>) => void;
  onEmergency?: () => void;
  large?: boolean;
  className?: string;
  hint?: string;
}) {
  const [listening, setListening] = useState(false);
  const [lastHeard, setLastHeard] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [supported, setSupported] = useState(true);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const responsesRef = useRef(responses);
  const onCommandRef = useRef(onCommand);
  const onEmergencyRef = useRef(onEmergency);

  useEffect(() => {
    responsesRef.current = responses;
  }, [responses]);

  useEffect(() => {
    onCommandRef.current = onCommand;
  }, [onCommand]);

  useEffect(() => {
    onEmergencyRef.current = onEmergency;
  }, [onEmergency]);

  useEffect(() => {
    setSupported(Boolean(getRecognitionCtor()));
  }, []);

  const handleCommand = useCallback(
    (cmd: VoiceCommandId) => {
      const r = responsesRef.current;
      const speakAndShow = (text: string) => {
        setStatus(text);
        speakText(text, speechLang);
      };

      if (cmd === 'unknown') {
        speakAndShow(r.unknown);
        return;
      }

      speakAndShow(r[cmd]);
      if (cmd === 'pech') onEmergencyRef.current?.();
      onCommandRef.current?.(cmd);
    },
    [speechLang]
  );

  const stopListening = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {
      /* ignore */
    }
    setListening(false);
  }, []);

  const startListening = useCallback(() => {
    setShowHint(true);
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setSupported(false);
      setStatus(responsesRef.current.unknown);
      speakText(responsesRef.current.unknown, speechLang);
      return;
    }

    try {
      const rec = new Ctor();
      rec.lang = speechLang;
      rec.continuous = false;
      rec.interimResults = false;
      rec.onresult = (ev) => {
        const transcript = ev.results?.[0]?.[0]?.transcript ?? '';
        setLastHeard(transcript);
        setShowHint(false);
        handleCommand(matchVoiceCommand(transcript));
      };
      rec.onerror = () => {
        setListening(false);
        setShowHint(false);
      };
      rec.onend = () => {
        setListening(false);
        setShowHint(false);
      };
      recRef.current = rec;
      rec.start();
      setListening(true);
      window.setTimeout(() => setShowHint(false), 4000);
    } catch {
      setSupported(false);
    }
  }, [handleCommand, speechLang]);

  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`}>
      <button
        type="button"
        onClick={() => (listening ? stopListening() : startListening())}
        aria-pressed={listening}
        aria-label="Voice assistant"
        className={`rounded-full border-2 transition flex items-center justify-center ${
          large ? 'w-[72px] h-[72px] text-3xl' : 'w-14 h-14 text-xl'
        } ${
          listening
            ? 'bg-[#00a3ff] border-white/40 text-white fr-mic-active'
            : 'bg-[#00a3ff] border-[#00a3ff] text-white shadow-[0_0_28px_rgba(0,163,255,0.45)] hover:bg-[#007aff]'
        }`}
      >
        🎤
      </button>
      <p
        className={`font-semibold ${large ? 'text-xs' : 'text-[10px]'} ${
          listening ? 'text-[#00a3ff]' : 'text-[#6b7a90]'
        }`}
      >
        {listening ? responses.listening : supported ? 'Voice AI' : 'TTS only'}
      </p>

      {showHint && (
        <div
          className={`rounded-[12px] border border-[#00a3ff]/40 bg-[#0f1620]/95 px-3 py-2 text-center shadow-lg ${
            large ? 'text-xs max-w-[240px]' : 'text-[10px] max-w-[180px]'
          } text-[#c5e8ff]`}
        >
          🎤 {hint}
        </div>
      )}

      {(status || lastHeard) && !showHint && (
        <div
          className={`rounded-[12px] border border-[#1e2a3a] bg-[#0f1620]/95 px-3 py-2 text-center ${
            large ? 'text-xs max-w-[240px]' : 'text-[10px] max-w-[180px]'
          } text-[#c5d0e0]`}
        >
          {lastHeard && <p className="text-[#6b7a90] mb-1 truncate">“{lastHeard}”</p>}
          {status && <p className="font-semibold">{status}</p>}
        </div>
      )}
    </div>
  );
}
