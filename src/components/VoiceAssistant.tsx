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
  "Zeg: Status, Tanken, Nieuwe route, CMR foto, Bon, Stilstand, Navigatie…";

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

  if (
    t.includes('fotograf') ||
    t.includes('cmr foto') ||
    t.includes('fotografeer cmr') ||
    t.includes('bon foto') ||
    t.includes('bon scannen') ||
    t.includes('tankbon') ||
    t.includes('fotografeer bon') ||
    (t.includes('bon') && (t.includes('foto') || t.includes('scan') || t.includes('maak')))
  ) {
    return 'cmr_foto';
  }
  if (
    t.includes('nieuwe route') ||
    t.includes('nieuwe navigatie') ||
    t.includes('andere route') ||
    t.includes('route wijzigen') ||
    t.includes('bestemming') ||
    t.includes('herplan')
  ) {
    return 'nieuwe_route';
  }
  if (t.includes('navigatie') || t.includes('navigeer') || t.includes('volgende afslag')) {
    return 'navigatie';
  }
  if (t.includes('eta') || t.includes('aankomst') || t.includes('hoe laat')) return 'eta';
  if (t.includes('handschoen') || t.includes('document')) return 'handschoenvak';
  if (t.includes('cmr') || t.includes('handteken') || t.includes('vrachtbrief') || t.includes('signature')) {
    return 'cmr';
  }
  if (
    t.includes('simuleer') ||
    t.includes('start rit') ||
    t.includes('rijden') ||
    t.includes('start route')
  ) {
    return 'simuleer';
  }
  if (t.includes('stilstand') || t.includes('pauze') || t.includes('parkeren') || t.includes('stop rit')) {
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
