'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { cockpitText } from '@/lib/cockpit-i18n';
import { localeToDriverLang } from '@/lib/driver-i18n';
import {
  applyComboPreset,
  loadTruckProfile,
  saveTruckProfile,
  type ComboType,
  type TruckProfile,
} from '@/lib/truck-profile';

export function TruckProfilePanel({
  profile,
  onChange,
}: {
  profile: TruckProfile;
  onChange: (p: TruckProfile) => void;
}) {
  const { locale } = useLanguage();
  const c = cockpitText(localeToDriverLang(locale));

  const comboLabels: Record<ComboType, string> = {
    trekker_oplegger: c.comboTrekkerOplegger,
    trekker_aanhanger: c.comboTrekkerAanhanger,
    bakwagen: c.comboBakwagen,
    lzv: c.comboLzv,
    speciaal_transport: c.comboSpeciaal,
  };

  const set = <K extends keyof TruckProfile>(key: K, value: TruckProfile[K]) => {
    const next = { ...profile, [key]: value };
    onChange(next);
    saveTruckProfile(next);
  };

  const onCombo = (combo: ComboType) => {
    const next = applyComboPreset(combo, profile);
    onChange(next);
    saveTruckProfile(next);
  };

  return (
    <div className="fr-glass p-4 space-y-3">
      <div>
        <p className="fr-label">{c.profileTitle}</p>
        <p className="text-[11px] text-[#9aa8bc] mt-0.5 leading-relaxed">{c.profileHint}</p>
      </div>

      <label className="block text-[11px] text-[#9aa8bc]">
        {c.combo}
        <select
          value={profile.comboType}
          onChange={(e) => onCombo(e.target.value as ComboType)}
          className="mt-1 w-full bg-[#050a0f] border border-[#1e2a3a] rounded-[10px] px-3 py-2.5 text-sm text-[#f2f6fb]"
        >
          {(Object.keys(comboLabels) as ComboType[]).map((k) => (
            <option key={k} value={k}>
              {comboLabels[k]}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-2">
        <label className="block text-[11px] text-[#9aa8bc]">
          {c.tractor}
          <input
            value={profile.truckPlate}
            onChange={(e) => set('truckPlate', e.target.value)}
            className="mt-1 w-full bg-[#050a0f] border border-[#1e2a3a] rounded-[10px] px-3 py-2 text-sm fr-mono text-[#f2f6fb]"
          />
        </label>
        <label className="block text-[11px] text-[#9aa8bc]">
          {c.trailer}
          <input
            value={profile.trailerPlate}
            onChange={(e) => set('trailerPlate', e.target.value)}
            disabled={!profile.trailerCoupled}
            className="mt-1 w-full bg-[#050a0f] border border-[#1e2a3a] rounded-[10px] px-3 py-2 text-sm fr-mono text-[#f2f6fb] disabled:opacity-40"
          />
        </label>
      </div>

      <label className="block text-[11px] text-[#9aa8bc]">
        {c.modelBody}
        <input
          value={profile.model}
          onChange={(e) => set('model', e.target.value)}
          className="mt-1 w-full bg-[#050a0f] border border-[#1e2a3a] rounded-[10px] px-3 py-2 text-sm text-[#f2f6fb]"
        />
      </label>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <NumField label={c.heightM} value={profile.heightM} step={0.05} min={3.2} max={4.5} onChange={(v) => set('heightM', v)} />
        <NumField label={c.widthM} value={profile.widthM} step={0.01} min={2.0} max={4.0} onChange={(v) => set('widthM', v)} />
        <NumField label={c.lengthM} value={profile.lengthM} step={0.1} min={6} max={30} onChange={(v) => set('lengthM', v)} />
        <NumField label={c.grossT} value={profile.grossWeightT} step={0.5} min={3.5} max={70} onChange={(v) => set('grossWeightT', v)} />
        <NumField label={c.axles} value={profile.axleCount} step={1} min={2} max={9} onChange={(v) => set('axleCount', Math.round(v))} />
        <NumField label={c.axleLoadT} value={profile.maxAxleLoadT} step={0.1} min={8} max={13} onChange={(v) => set('maxAxleLoadT', v)} />
        <label className="block text-[11px] text-[#9aa8bc] col-span-2">
          {c.euroClass}
          <select
            value={profile.euroClass}
            onChange={(e) => set('euroClass', e.target.value as TruckProfile['euroClass'])}
            className="mt-1 w-full bg-[#050a0f] border border-[#1e2a3a] rounded-[10px] px-3 py-2 text-sm text-[#f2f6fb]"
          >
            <option value="Euro 5">Euro 5</option>
            <option value="Euro 6">Euro 6</option>
            <option value="Euro 6e">Euro 6e</option>
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-[#c5d0e0]">
        <Toggle label={c.trailerCoupled} on={profile.trailerCoupled} onToggle={() => set('trailerCoupled', !profile.trailerCoupled)} />
        <Toggle label={c.reefer} on={profile.refrigerated} onToggle={() => set('refrigerated', !profile.refrigerated)} />
        <Toggle label={c.adrDangerous} on={profile.adr} onToggle={() => set('adr', !profile.adr)} />
        <Toggle
          label={c.specialTransport}
          on={profile.specialTransport}
          onToggle={() => {
            const on = !profile.specialTransport;
            const next = {
              ...profile,
              specialTransport: on,
              comboType: on ? ('speciaal_transport' as const) : profile.comboType,
              escortRequired: on ? true : profile.escortRequired,
            };
            onChange(next);
            saveTruckProfile(next);
          }}
        />
        <Toggle label={c.escort} on={profile.escortRequired} onToggle={() => set('escortRequired', !profile.escortRequired)} />
      </div>

      {profile.adr && (
        <div className="grid grid-cols-2 gap-2">
          <label className="block text-[11px] text-[#9aa8bc]">
            {c.adrClass}
            <input
              value={profile.adrClass}
              onChange={(e) => set('adrClass', e.target.value)}
              className="mt-1 w-full bg-[#050a0f] border border-[#ff3b30]/40 rounded-[10px] px-3 py-2 text-sm text-[#f2f6fb]"
            />
          </label>
          <label className="block text-[11px] text-[#9aa8bc]">
            {c.tunnelCode}
            <input
              value={profile.adrTunnelCode}
              onChange={(e) => set('adrTunnelCode', e.target.value.toUpperCase())}
              placeholder="D / E"
              className="mt-1 w-full bg-[#050a0f] border border-[#ff3b30]/40 rounded-[10px] px-3 py-2 text-sm text-[#f2f6fb]"
            />
          </label>
        </div>
      )}

      {(profile.specialTransport || profile.comboType === 'speciaal_transport') && (
        <label className="block text-[11px] text-[#9aa8bc]">
          {c.specialNotes}
          <textarea
            value={profile.specialNotes}
            onChange={(e) => set('specialNotes', e.target.value)}
            rows={2}
            placeholder={c.specialNotesPh}
            className="mt-1 w-full bg-[#050a0f] border border-[#ff9500]/40 rounded-[10px] px-3 py-2 text-sm text-[#f2f6fb]"
          />
        </label>
      )}
    </div>
  );
}

export function useTruckProfile() {
  const [profile, setProfile] = useState<TruckProfile>(DEFAULT_TRUCK_PROFILE_SAFE);
  useEffect(() => {
    setProfile(loadTruckProfile());
  }, []);
  return [profile, setProfile] as const;
}

const DEFAULT_TRUCK_PROFILE_SAFE = {
  truckPlate: '45-BJK-8',
  trailerPlate: 'OW-TR-992',
  model: 'DAF XF 480 + koeloplegger',
  comboType: 'trekker_oplegger' as const,
  trailerCoupled: true,
  heightM: 4.0,
  widthM: 2.55,
  lengthM: 16.5,
  grossWeightT: 40,
  axleCount: 5,
  maxAxleLoadT: 11.5,
  euroClass: 'Euro 6' as const,
  adr: false,
  adrClass: '',
  adrTunnelCode: '',
  refrigerated: true,
  specialTransport: false,
  specialNotes: '',
  escortRequired: false,
};

function NumField({
  label,
  value,
  step,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  step: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block text-[11px] text-[#9aa8bc]">
      {label}
      <input
        type="number"
        step={step}
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="mt-1 w-full bg-[#050a0f] border border-[#1e2a3a] rounded-[10px] px-3 py-2 text-sm fr-mono text-[#f2f6fb]"
      />
    </label>
  );
}

function Toggle({
  label,
  on,
  onToggle,
}: {
  label: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`rounded-[10px] border px-3 py-2 font-semibold ${
        on
          ? 'border-[#00a3ff]/50 bg-[#00a3ff]/15 text-[#7dd3fc]'
          : 'border-[#1e2a3a] bg-[#0b0e11] text-[#9aa8bc]'
      }`}
    >
      {on ? '✓ ' : ''}
      {label}
    </button>
  );
}
