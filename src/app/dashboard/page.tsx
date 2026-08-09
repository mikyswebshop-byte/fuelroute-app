'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActionBar, ActionButton } from '@/components/ActionBar';
import { PriceLineChart, SavingsBarChart } from '@/components/charts';
import { GloveboxModal } from '@/components/GloveboxModal';
import { useLanguage } from '@/components/LanguageProvider';
import { RangeSlider } from '@/components/RangeSlider';
import { RoleGate } from '@/components/RoleGate';
import { calculateZzpMargin, deriveCompliance } from '@/lib/calculations';
import {
  fleetTrucks,
  gloveboxDocuments,
  monthlySavings,
  priceComparisonSeries,
} from '@/lib/mock-data';
import { nalevingLabel } from '@/lib/ui-labels';

const CURRENT_SAVINGS = 4850;

function complianceBadge(status: string) {
  if (status === 'Compliant') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  if (status === 'Warning') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  return 'bg-red-500/20 text-red-400 border-red-500/30';
}

function glowOnce(el: HTMLElement | null) {
  if (!el) return;
  el.classList.remove('field-glow');
  void el.offsetWidth;
  el.classList.add('field-glow');
  window.setTimeout(() => el.classList.remove('field-glow'), 1400);
}

export default function DashboardPage() {
  const { t } = useLanguage();
  const [monthlyTarget, setMonthlyTarget] = useState(5000);
  const [minTankAlarm, setMinTankAlarm] = useState(20);
  const [freightPrice, setFreightPrice] = useState(1200);
  const [distanceKm, setDistanceKm] = useState(520);
  const [fuelCost, setFuelCost] = useState(380);
  const [maut, setMaut] = useState(95);
  const [showGlovebox, setShowGlovebox] = useState(false);
  const marginRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const targetFieldRef = useRef<HTMLDivElement>(null);
  const alarmFieldRef = useRef<HTMLDivElement>(null);

  const focusControl = useCallback((ref: React.RefObject<HTMLDivElement | null>) => {
    const section = controlsRef.current;
    const field = ref.current;
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: field?.offsetTop ?? 0, behavior: 'smooth' });
    }
    window.setTimeout(() => glowOnce(field), 320);
  }, []);

  const safeTarget = Math.max(monthlyTarget, 1);
  const progressPct = Math.min(100, Math.round((CURRENT_SAVINGS / safeTarget) * 100));
  const targetMet = CURRENT_SAVINGS >= safeTarget;

  const zzpMargin = useMemo(
    () =>
      calculateZzpMargin({
        freightPriceEur: freightPrice,
        distanceKm,
        fuelCostEur: fuelCost,
        mautEur: maut,
      }),
    [freightPrice, distanceKm, fuelCost, maut]
  );

  const expiringDocs = useMemo(
    () =>
      gloveboxDocuments.filter(
        (d) =>
          d.status === 'Verloopt binnenkort' ||
          d.title.includes('APK') ||
          d.title.includes('Eurovignet')
      ),
    []
  );

  const fleetRows = useMemo(
    () =>
      fleetTrucks.map((truck) => ({
        ...truck,
        liveCompliance: deriveCompliance(truck.fuelLevel, truck.compliance, minTankAlarm),
      })),
    [minTankAlarm]
  );

  const belowAlarm = fleetRows.filter((t) => t.fuelLevel < minTankAlarm).length;
  const criticalCount = fleetRows.filter((t) => t.liveCompliance === 'Critical').length;
  const warningCount = fleetRows.filter((t) => t.liveCompliance === 'Warning').length;
  const compliantCount = fleetRows.filter((t) => t.liveCompliance === 'Compliant').length;
  const fleetCompliancePct = Math.round((compliantCount / fleetRows.length) * 1000) / 10;

  return (
    <main className="max-w-7xl mx-auto p-4 space-y-6" style={{ background: '#0b0f19' }}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#f8fafc]">{t('dashboard_title')}</h1>
          <p className="text-sm text-[#cbd5e1]">{t('dashboard_subtitle')}</p>
        </div>
        <span className="text-xs font-mono px-3 py-1 rounded-full border border-sky-500/30 bg-sky-500/10 text-[#38bdf8]">
          Actueel · juni 2026
        </span>
      </div>

      <RoleGate componentId="financial_margins">
        <ActionBar title={t('zzp_actions')}>
          <ActionButton
            variant="primary"
            className="w-full py-3"
            onClick={() => {
              marginRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              window.setTimeout(() => glowOnce(marginRef.current), 320);
            }}
          >
            💶 Rit-Margerekenmachine
          </ActionButton>
          <ActionButton
            variant="secondary"
            className="w-full"
            onClick={() => setShowGlovebox(true)}
          >
            {t('glovebox_open')}
          </ActionButton>
          <ActionButton
            variant="utility"
            className="w-full"
            onClick={() => {
              setFreightPrice(1200);
              marginRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              window.setTimeout(() => glowOnce(marginRef.current), 320);
            }}
          >
            📋 Voorbeeldvracht €1.200
          </ActionButton>
        </ActionBar>
      </RoleGate>

      <ActionBar title={t('dashboard_actions')}>
        <ActionButton
          variant="primary"
          className="w-full"
          onClick={() => {
            setMonthlyTarget(CURRENT_SAVINGS);
            focusControl(targetFieldRef);
          }}
        >
          🎯 Stel Doel op Huidige Besparing
        </ActionButton>
        <ActionButton
          variant="secondary"
          className="w-full"
          onClick={() => {
            setMinTankAlarm(20);
            focusControl(alarmFieldRef);
          }}
        >
          ⛽ Reset Minimale Tankreserves 20%
        </ActionButton>
        <ActionButton
          variant="utility"
          className="w-full"
          onClick={() => {
            setMinTankAlarm(25);
            focusControl(alarmFieldRef);
          }}
        >
          🚨 Streng Alarm 25%
        </ActionButton>
        <ActionButton
          variant="slate"
          className="w-full"
          onClick={() => {
            setMonthlyTarget(6000);
            focusControl(targetFieldRef);
          }}
        >
          📈 Verhoog Maanddoel €6.000
        </ActionButton>
      </ActionBar>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RoleGate componentId="financial_margins">
        <div
          ref={marginRef}
          id="marge-sectie"
          className="bg-[#1e293b] p-4 rounded-xl border border-emerald-500/30 space-y-3"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-[#f8fafc]">Rit-Margerekenmachine</h2>
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                zzpMargin.netMarginEur >= 0
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-red-500/20 text-red-400 border-red-500/30'
              }`}
            >
              {zzpMargin.marginPct}% marge
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-[#cbd5e1] mb-1">Vrachtprijs (€)</label>
              <input
                type="number"
                value={freightPrice}
                onChange={(e) => setFreightPrice(Number(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-sm text-[#f8fafc] focus:outline-none focus:border-[#38bdf8]"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[#cbd5e1] mb-1">Afstand (km)</label>
              <input
                type="number"
                value={distanceKm}
                onChange={(e) => setDistanceKm(Number(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-sm text-[#f8fafc] focus:outline-none focus:border-[#38bdf8]"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[#cbd5e1] mb-1">Brandstof (€)</label>
              <input
                type="number"
                value={fuelCost}
                onChange={(e) => setFuelCost(Number(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-sm text-[#f8fafc] focus:outline-none focus:border-[#38bdf8]"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[#cbd5e1] mb-1">Maut (€)</label>
              <input
                type="number"
                value={maut}
                onChange={(e) => setMaut(Number(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-sm text-[#f8fafc] focus:outline-none focus:border-[#38bdf8]"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
            <div className="rounded-lg border border-slate-600 bg-slate-900 p-2">
              <p className="text-[#cbd5e1]">Afschrijving</p>
              <p className="font-bold text-[#f8fafc]">€ {zzpMargin.depreciationEur.toFixed(2)}</p>
            </div>
            <div className="rounded-lg border border-slate-600 bg-slate-900 p-2">
              <p className="text-[#cbd5e1]">Totale kosten</p>
              <p className="font-bold text-[#f8fafc]">€ {zzpMargin.totalCost.toFixed(2)}</p>
            </div>
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2">
              <p className="text-[#cbd5e1]">Netto marge</p>
              <p className="font-bold text-[#10b981]">€ {zzpMargin.netMarginEur.toFixed(2)}</p>
            </div>
          </div>
        </div>
        </RoleGate>

        <div className="bg-[#1e293b] p-4 rounded-xl border border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-[#f8fafc]">Handschoenkast · verloopalerts</h2>
            <span className="text-[11px] font-semibold text-amber-400">
              APK / Eurovignet
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {expiringDocs.map((doc) => (
              <div
                key={doc.id}
                className="flex-1 min-w-[140px] rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2"
              >
                <p className="text-xs font-bold text-amber-300">{doc.title}</p>
                <p className="text-[11px] text-[#cbd5e1]">
                  Verloopt {new Date(doc.expires).toLocaleDateString('nl-NL')} · {doc.status}
                </p>
              </div>
            ))}
          </div>
          <ActionButton
            variant="slate"
            className="w-full mt-1"
            onClick={() => setShowGlovebox(true)}
          >
            {t('upload_open_glovebox')}
          </ActionButton>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-700">
          <span className="text-xs text-[#cbd5e1]">Actieve Vrachtwagens</span>
          <p className="text-2xl font-black text-[#f8fafc] mt-1">12 vrachtwagens</p>
        </div>
        <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-700">
          <span className="text-xs text-[#cbd5e1]">Maandelijkse Besparing</span>
          <p className="text-2xl font-black text-[#10b981] mt-1">€ 4.850,-</p>
        </div>
        <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-700">
          <span className="text-xs text-[#cbd5e1]">Nalevingsscore (Compliance)</span>
          <p className="text-2xl font-black text-[#38bdf8] mt-1">{fleetCompliancePct}%</p>
          <p className="text-[11px] text-[#cbd5e1] mt-1">
            {compliantCount} conform · {warningCount} waarschuwing · {criticalCount} kritiek
          </p>
        </div>
        <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-700">
          <span className="text-xs text-[#cbd5e1]">Totaal Afgelegde KM</span>
          <p className="text-2xl font-black text-[#f8fafc] mt-1">42.300 km</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-700 space-y-3">
          <div>
            <h2 className="text-lg font-bold text-[#f8fafc]">Brandstofbesparing per Maand</h2>
            <p className="text-xs text-[#cbd5e1]">jan – jun · nettobesparing t.o.v. snelwegtanken</p>
          </div>
          <SavingsBarChart data={monthlySavings} />
        </div>
        <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-700 space-y-3">
          <div>
            <h2 className="text-lg font-bold text-[#f8fafc]">Tankstation Netto-Prijsvergelijking</h2>
            <p className="text-xs text-[#cbd5e1]">
              Snelweg Raststätte vs. Autohof · FuelRoute-netto (€1,58) vs snelweggemiddelde (€1,75)
            </p>
          </div>
          <PriceLineChart data={priceComparisonSeries} />
        </div>
      </div>

      <div className="bg-[#1e293b] rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-[#f8fafc]">Vloot Overzicht</h2>
            <p className="text-xs text-[#cbd5e1]">
              Naleving herberekend t.o.v. minimale tankreserves {minTankAlarm}%
            </p>
          </div>
          <span className="text-xs text-[#10b981] font-semibold">● Boordcomputer Gekoppeld</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-900/60 text-[#cbd5e1] text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3">Truck-ID</th>
                <th className="px-4 py-3">Chauffeur</th>
                <th className="px-4 py-3">Huidige Locatie</th>
                <th className="px-4 py-3">Brandstofniveau (%)</th>
                <RoleGate componentId="vehicle_costs">
                  <th className="px-4 py-3">Actieve Besparing (€)</th>
                </RoleGate>
                <th className="px-4 py-3">Nalevingsstatus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {fleetRows.map((truck) => (
                <tr key={truck.truckId} className="hover:bg-slate-900/40">
                  <td className="px-4 py-3 font-mono text-[#38bdf8]">{truck.truckId}</td>
                  <td className="px-4 py-3 text-[#f8fafc]">{truck.driver}</td>
                  <td className="px-4 py-3 text-[#cbd5e1]">{truck.location}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${truck.fuelLevel < minTankAlarm ? 'bg-amber-400' : 'bg-[#10b981]'}`}
                          style={{ width: `${truck.fuelLevel}%` }}
                        />
                      </div>
                      <span
                        className={
                          truck.fuelLevel < minTankAlarm
                            ? 'text-amber-400 font-bold'
                            : 'text-[#f8fafc]'
                        }
                      >
                        {truck.fuelLevel.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <RoleGate componentId="vehicle_costs">
                    <td className="px-4 py-3 font-semibold text-[#10b981]">
                      € {truck.activeSavings.toFixed(2)}
                    </td>
                  </RoleGate>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${complianceBadge(truck.liveCompliance)}`}
                    >
                      {nalevingLabel(truck.liveCompliance)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div
        ref={controlsRef}
        className="bg-[#1e293b] p-5 rounded-xl border border-slate-700 space-y-4"
      >
        <div>
          <h2 className="text-lg font-bold text-[#f8fafc]">{t('quick_controls')}</h2>
          <p className="text-xs text-[#cbd5e1]">{t('quick_controls_hint')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            ref={targetFieldRef}
            className="rounded-xl border border-slate-700/80 bg-slate-950/40 p-4 space-y-3 transition-colors"
          >
            <RangeSlider
              id="monthly-target"
              label={t('monthly_savings_target')}
              value={monthlyTarget}
              min={1000}
              max={10000}
              step={50}
              accent="#10b981"
              formatValue={(v) => `€ ${v.toLocaleString('nl-NL')}`}
              onChange={setMonthlyTarget}
            />
            <div>
              <div className="flex justify-between text-[11px] text-[#cbd5e1] mb-1">
                <span>
                  Voortgang: €{CURRENT_SAVINGS.toLocaleString('nl-NL')} / €
                  {safeTarget.toLocaleString('nl-NL')}
                </span>
                <span className={targetMet ? 'text-[#10b981] font-bold' : 'text-[#38bdf8] font-bold'}>
                  {progressPct}% {targetMet ? '· Doel behaald' : '· Onder doel'}
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all ${targetMet ? 'bg-[#10b981]' : 'bg-[#38bdf8]'}`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          <div
            ref={alarmFieldRef}
            className="rounded-xl border border-slate-700/80 bg-slate-950/40 p-4 space-y-3 transition-colors"
          >
            <RangeSlider
              id="min-tank-alarm"
              label={t('min_tank_reserve')}
              value={minTankAlarm}
              min={5}
              max={40}
              step={1}
              unit="%"
              accent="#fbbf24"
              onChange={setMinTankAlarm}
            />
            <p className="text-[11px] text-amber-400">
              {belowAlarm} voertuigen onder {minTankAlarm}% · {criticalCount} kritieke badges actief
            </p>
            <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2 text-emerald-400 font-bold">
                {compliantCount} Conform
              </div>
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-amber-400 font-bold">
                {warningCount} Waarschuwing
              </div>
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-red-400 font-bold">
                {criticalCount} Kritiek
              </div>
            </div>
          </div>
        </div>
      </div>

      {showGlovebox && (
        <GloveboxModal
          onClose={() => setShowGlovebox(false)}
          onOpenDamageReport={() => {
            window.location.href = '/driver?action=schade';
          }}
        />
      )}
    </main>
  );
}
