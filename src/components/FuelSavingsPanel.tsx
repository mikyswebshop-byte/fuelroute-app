'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';
import { useTelemetry } from '@/components/TelemetryProvider';
import { cockpitText, fillTpl } from '@/lib/cockpit-i18n';
import { localeToDriverLang } from '@/lib/driver-i18n';
import {
  buildFuelSavingsPlan,
  MAX_DETOUR_KM_DEFAULT,
  NL_REFERENCE_PRICE_PER_L,
  type RankedFuelStop,
} from '@/lib/fuel-savings';

export function FuelSavingsPanel({
  destination,
  onNavigate,
  onChatOffice,
}: {
  destination: string;
  onNavigate: (label: string) => void;
  onChatOffice?: () => void;
}) {
  const { locale } = useLanguage();
  const lang = localeToDriverLang(locale);
  const c = cockpitText(lang);
  const { fuelPct, rangeKm } = useTelemetry();
  const [maxDetourKm, setMaxDetourKm] = useState(MAX_DETOUR_KM_DEFAULT);
  const [chatDraft, setChatDraft] = useState('');
  const [chatSent, setChatSent] = useState<string | null>(null);

  const plan = useMemo(
    () =>
      buildFuelSavingsPlan({
        destination,
        fuelPct,
        rangeKm: rangeKm || 405,
        maxDetourKm,
        lang,
      }),
    [destination, fuelPct, rangeKm, maxDetourKm, lang]
  );

  const waitLabel = (w: RankedFuelStop['amenities']['wait']) => {
    if (w === 'druk') return c.waitBusy;
    if (w === 'storing') return c.waitFault;
    return c.waitNone;
  };

  const waitClass = (w: RankedFuelStop['amenities']['wait']) => {
    if (w === 'druk') return 'text-[#ffb84d] border-[#ff9500]/40 bg-[#ff9500]/10';
    if (w === 'storing') return 'text-[#ff8a82] border-[#ff3b30]/40 bg-[#ff3b30]/10';
    return 'text-[#86efac] border-[#28a745]/40 bg-[#28a745]/10';
  };

  return (
    <div className="space-y-3">
      <div className="rounded-[16px] border border-[#28a745]/45 bg-gradient-to-br from-[#0d2818] to-[#0b0e11] p-4 space-y-3 shadow-[0_0_28px_rgba(40,167,69,0.15)]">
        <p className="fr-label text-[#86efac]">{c.saveFuelEyebrow}</p>
        <h2 className="fr-display text-xl sm:text-2xl text-[#f2f6fb] leading-tight">
          {c.saveFuelHeadline}
        </h2>
        <p className="text-xs text-[#9aa8bc] leading-relaxed">
          {fillTpl(c.saveFuelBody, { km: maxDetourKm })}
        </p>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <p className="fr-label">{c.saveVsNl}</p>
            <p className="fr-display text-3xl text-[#86efac]">
              €{plan.headlineSavingEur.toFixed(0)}
            </p>
          </div>
          <div className="text-[11px] text-[#6b7a90] fr-mono pb-1">
            NL-ref €{NL_REFERENCE_PRICE_PER_L.toFixed(3)}/L
          </div>
        </div>
      </div>

      {plan.nlBorderAlert && (
        <div className="rounded-[14px] border-2 border-[#ff9500] bg-[#1a1008] px-4 py-3 space-y-2">
          <p className="text-sm font-black uppercase tracking-wide text-[#ff9500]">
            ⛽ {plan.nlBorderAlert.title}
          </p>
          <p className="text-xs text-[#ffd9a8] leading-relaxed">{plan.nlBorderAlert.body}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                onNavigate(
                  `${plan.nlBorderAlert!.station.stationName} ${plan.nlBorderAlert!.station.locationHighway}`
                )
              }
              className="h-11 px-4 rounded-[10px] text-xs font-bold bg-[#ff9500] text-[#1a0f00] touch-manipulation"
            >
              {fillTpl(c.navigateLiters, { l: plan.nlBorderAlert.litersAdvice })}
            </button>
            <span className="self-center fr-mono text-xs text-[#86efac]">
              ~€{plan.nlBorderAlert.savingEur.toFixed(0)} {c.advantage}
            </span>
          </div>
        </div>
      )}

      <div className="fr-glass p-4 space-y-3">
        <p className="fr-label">{c.tankStrategy}</p>
        <ol className="space-y-1.5 text-xs text-[#c5d0e0] list-decimal list-inside">
          {plan.strategyLines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ol>
        <label className="block text-[11px] text-[#9aa8bc]">
          {fillTpl(c.maxDetourLabel, { km: maxDetourKm })}
          <input
            type="range"
            min={5}
            max={20}
            step={1}
            value={maxDetourKm}
            onChange={(e) => setMaxDetourKm(Number(e.target.value))}
            className="w-full mt-1 accent-[#00a3ff]"
          />
        </label>
      </div>

      <div className="fr-glass p-4 space-y-2">
        <p className="fr-label">{fillTpl(c.pricesOnRoute, { km: maxDetourKm })}</p>
        <ul className="space-y-2">
          {plan.rankedStops.map((stop) => (
            <li
              key={stop.stationName}
              className={`rounded-[12px] border px-3 py-2.5 ${
                stop.country === 'NL'
                  ? 'border-[#ff3b30]/35 bg-[#ff3b30]/05'
                  : 'border-[#1e2a3a] bg-[#050a0f]'
              }`}
            >
              <div className="flex gap-2 items-start">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-[#f2f6fb]">{stop.stationName}</p>
                  <p className="text-[11px] text-[#9aa8bc]">
                    {stop.country} · {stop.locationHighway} · {c.detour} {stop.detourKm} km
                  </p>
                  <p className="text-[11px] text-[#7dd3fc] mt-0.5">{stop.recommendReason}</p>
                  {stop.avoidReason && (
                    <p className="text-[11px] text-[#ff8a82] mt-0.5">{stop.avoidReason}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className={`fr-chip text-[10px] ${waitClass(stop.amenities.wait)}`}>
                      {waitLabel(stop.amenities.wait)}
                    </span>
                    {stop.amenities.showers && (
                      <span className="fr-chip text-[10px]">🚿 {c.showerClean}</span>
                    )}
                    {stop.amenities.toilets && (
                      <span className="fr-chip text-[10px]">WC</span>
                    )}
                    {stop.amenities.restaurant && (
                      <span className="fr-chip text-[10px]">Restaurant</span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="fr-mono text-base font-bold text-[#00a3ff]">
                    €{stop.netPricePerL.toFixed(3)}
                  </p>
                  <p className="text-[10px] text-[#86efac]">
                    +€{Math.max(0, stop.savingVsNlTotalEur).toFixed(0)} {c.vsNl}
                  </p>
                  <p className="text-[10px] text-[#6b7a90] mt-0.5">±{stop.litersAdvice} L</p>
                  <button
                    type="button"
                    onClick={() => onNavigate(`${stop.stationName} ${stop.locationHighway}`)}
                    className="mt-1 text-[10px] font-bold text-[#86efac]"
                  >
                    {c.navigate}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <p className="text-[10px] text-[#6b7a90]">{c.amenityNote}</p>
      </div>

      <div className="fr-glass p-4 space-y-3">
        <p className="fr-label">{c.chatTitle}</p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/community"
            className="inline-flex h-11 items-center px-4 rounded-[10px] text-xs font-bold border border-[#00a3ff]/40 text-[#7dd3fc] bg-[#00a3ff]/10"
          >
            💬 {c.colleagueTips}
          </Link>
          <button
            type="button"
            onClick={() => {
              onChatOffice?.();
              setChatSent(c.chatSentOffice);
            }}
            className="inline-flex h-11 items-center px-4 rounded-[10px] text-xs font-bold border border-[#1e2a3a] text-[#c5d0e0] bg-[#151d2a]"
          >
            🏢 {c.officePlanner}
          </button>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={chatDraft}
            onChange={(e) => setChatDraft(e.target.value)}
            placeholder={c.chatPlaceholder}
            className="flex-1 bg-[#050a0f] border border-[#1e2a3a] rounded-[10px] px-3 py-2 text-xs text-[#f2f6fb]"
          />
          <button
            type="button"
            onClick={() => {
              if (!chatDraft.trim()) return;
              setChatSent(`${c.chatSend}: “${chatDraft.trim()}”`);
              setChatDraft('');
            }}
            className="px-3 rounded-[10px] text-xs font-bold bg-[#00a3ff] text-white"
          >
            {c.chatSend}
          </button>
        </div>
        {chatSent && <p className="text-[11px] text-[#86efac]">{chatSent}</p>}
      </div>
    </div>
  );
}
