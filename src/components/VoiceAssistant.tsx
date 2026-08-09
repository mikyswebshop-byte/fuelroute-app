'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type VoiceCommandId =
  | 'status'
  | 'tanken'
  | 'stilstand'
  | 'simuleer'
  | 'handschoenvak'
  | 'cmr'
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
  "Zeg: 'Status', 'Tanken', 'Stilstand', 'Simuleer', of 'Handschoenvak'";

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

export function matchVoiceCommand(transcript: string): VoiceCommandId {
  const t = transcript.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');

  if (t.includes('handschoen') || t.includes('document')) return 'handschoenvak';
  if (t.includes('cmr') || t.includes('handteken') || t.includes('signature')) return 'cmr';
  if (
    t.includes('simuleer') ||
    t.includes('start rit') ||
    t.includes('rijden') ||
    t.includes('start route')
  ) {
    return 'simuleer';
  }
  if (t.includes('stilstand') || t.includes('pauze') || t.includes('parkeren') || t.includes('stop')) {
    return 'stilstand';
  }
  if (
    t.includes('status') ||
    t.includes('voertuig') ||
    t.includes('telemetrie') ||
    t.includes('telemetry')
  ) {
    return 'status';
  }
  if (
    t.includes('tanken') ||
    t.includes('brandstof') ||
    t.includes('tankstation') ||
    t.includes('waar tank') ||
    t.includes('fuel')
  ) {
    return 'tanken';
  }
  if (t.includes('rijtijd') || t.includes('hoe lang')) return 'rijtijd';
  if (t.includes('bericht') || t.includes('message')) return 'berichten';
  if (t.includes('pech') || t.includes('nood') || t.includes('emergency')) return 'pech';
  return 'unknown';
}

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
  responses: {
    status: string;
    tanken: string;
    stilstand: string;
    simuleer: string;
    handschoenvak: string;
    cmr: string;
    rijtijd: string;
    berichten: string;
    pech: string;
    unknown: string;
    listening: string;
  };
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
      recRef.current?.abort();
    } catch {
      /* ignore */
    }

    const rec = new Ctor();
    rec.lang = speechLang;
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (ev) => {
      const transcript = ev.results?.[0]?.[0]?.transcript ?? '';
      setLastHeard(transcript);
      handleCommand(matchVoiceCommand(transcript));
      setListening(false);
    };
    rec.onerror = () => {
      setListening(false);
      setStatus(responsesRef.current.unknown);
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    setStatus(responsesRef.current.listening);
    try {
      rec.start();
    } catch {
      setListening(false);
    }
  }, [handleCommand, speechLang]);

  useEffect(
    () => () => {
      try {
        recRef.current?.abort();
      } catch {
        /* ignore */
      }
    },
    []
  );

  useEffect(() => {
    if (!showHint) return;
    const id = window.setTimeout(() => setShowHint(false), 6000);
    return () => window.clearTimeout(id);
  }, [showHint, listening]);

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => (listening ? stopListening() : startListening())}
        aria-pressed={listening}
        aria-label="Voice assistant"
        className={`rounded-full border-2 shadow-2xl transition flex items-center justify-center ${
          large ? 'w-28 h-28 text-4xl' : 'w-16 h-16 text-2xl'
        } ${
          listening
            ? 'bg-rose-600 border-rose-300 text-white animate-pulse'
            : 'bg-sky-600 border-sky-300 text-white hover:bg-sky-500'
        }`}
      >
        🎤
      </button>
      <p
        className={`font-bold ${large ? 'text-base' : 'text-xs'} ${
          listening ? 'text-rose-300' : 'text-slate-300'
        }`}
      >
        {listening ? responses.listening : supported ? 'Voice AI' : 'TTS only'}
      </p>

      {showHint && (
        <div
          className={`rounded-xl border border-sky-500/40 bg-sky-950/80 px-3 py-2 text-center shadow-lg ${
            large ? 'text-sm max-w-sm' : 'text-[11px] max-w-xs'
          } text-sky-100`}
        >
          🎤 {hint}
        </div>
      )}

      {(status || lastHeard) && !showHint && (
        <div
          className={`rounded-xl border border-slate-600 bg-slate-950/70 px-3 py-2 text-center ${
            large ? 'text-sm max-w-sm' : 'text-[11px] max-w-xs'
          } text-slate-200`}
        >
          {lastHeard && <p className="text-slate-500 mb-1 truncate">“{lastHeard}”</p>}
          {status && <p className="font-semibold">{status}</p>}
        </div>
      )}
    </div>
  );
}
