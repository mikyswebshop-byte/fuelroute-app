'use client';

import React, { useState } from 'react';
import { ActionBar, ActionButton } from '@/components/ActionBar';
import { RangeSlider } from '@/components/RangeSlider';
import { RoleGate } from '@/components/RoleGate';
import { netPriceMatrix, type FuelCardProvider } from '@/lib/mock-data';

const CARD_CHOICES: FuelCardProvider[] = ['DKV', 'UTA', 'Shell', 'BP', 'AS24', 'EDC'];

export default function SettingsPage() {
  const [mautClass, setMautClass] = useState('Euro 6 / 40 Ton Klasse (DE/NL/BE)');
  const [fuelMargin, setFuelMargin] = useState(0.12);
  const [obdActive, setObdActive] = useState(true);
  const [cardsLinked, setCardsLinked] = useState(true);
  const [ocrReady, setOcrReady] = useState(true);
  const [saved, setSaved] = useState(false);
  const [assignedCard, setAssignedCard] = useState<FuelCardProvider>('DKV');
  const [prefShowers, setPrefShowers] = useState(true);
  const [prefAdBlue, setPrefAdBlue] = useState(true);
  const [prefRestaurant, setPrefRestaurant] = useState(false);
  const [prefSecurityCert, setPrefSecurityCert] = useState(true);

  const sampleRow = netPriceMatrix[0];
  const sampleNet = sampleRow.nets[assignedCard];
  const sampleSaving = sampleRow.pumpPrice - sampleNet;

  const saveSettings = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  return (
    <main className="max-w-5xl mx-auto p-4 space-y-6" style={{ background: '#0b0f19' }}>
      <ActionBar title="Instellingen-acties">
        <ActionButton variant="primary" className="w-full" onClick={saveSettings}>
          💾 Opslaan
        </ActionButton>
        <ActionButton
          variant="secondary"
          className="w-full"
          onClick={() => setAssignedCard('DKV')}
        >
          💳 Standaard DKV
        </ActionButton>
        <RoleGate componentId="fleet_management_settings">
          <ActionButton
            variant="utility"
            className="w-full"
            onClick={() => {
              setPrefShowers(true);
              setPrefAdBlue(true);
              setPrefRestaurant(false);
              setPrefSecurityCert(true);
            }}
          >
            🛠 Fleet-voorkeuren reset
          </ActionButton>
        </RoleGate>
        <ActionButton
          variant="slate"
          className="w-full"
          onClick={() => {
            setObdActive(true);
            setCardsLinked(true);
            setOcrReady(true);
          }}
        >
          ↺ Integraties Aan
        </ActionButton>
      </ActionBar>

      <div className="bg-[#1e293b] border border-slate-700 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-[#f8fafc]">Instellingen</h1>
        <p className="text-sm text-[#cbd5e1] mt-1">
          Beheer integraties, API-koppelingen, gebruikersrollen en bedrijfsparameters.
        </p>
      </div>

      <div className="bg-[#1e293b] border border-slate-700 rounded-xl p-5 space-y-4">
        <h2 className="text-lg font-semibold text-[#38bdf8]">
          B2B Tankkaart Contract & Nettoprijs
        </h2>
        <p className="text-xs text-[#cbd5e1]">
          Kies de toegewezen fleet-tankkaart. Voorbeeldnettoprijs van {sampleRow.station}.
        </p>
        <div>
          <label className="block text-xs text-[#cbd5e1] mb-1">Toegewezen tankkaart</label>
          <select
            value={assignedCard}
            onChange={(e) => setAssignedCard(e.target.value as FuelCardProvider)}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-sm text-[#f8fafc] font-medium"
          >
            {CARD_CHOICES.map((card) => (
              <option key={card} value={card}>
                {card}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3">
            <span className="text-[#cbd5e1]">Pompprijs</span>
            <p className="text-lg font-black font-mono text-red-300 mt-1">
              € {sampleRow.pumpPrice.toFixed(3)}
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3">
            <span className="text-[#cbd5e1]">{assignedCard} nettoprijs</span>
            <p className="text-lg font-black font-mono text-[#10b981] mt-1">
              € {sampleNet.toFixed(3)}
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3">
            <span className="text-[#cbd5e1]">Besparing / L</span>
            <p className="text-lg font-black font-mono text-[#38bdf8] mt-1">
              −€ {sampleSaving.toFixed(3)}
            </p>
          </div>
        </div>
      </div>

      <RoleGate componentId="fleet_management_settings">
        <div className="bg-[#1e293b] border border-slate-700 rounded-xl p-5 space-y-4">
          <h2 className="text-lg font-semibold text-[#38bdf8]">
            Fleet voorzieningen-voorkeuren
          </h2>
          <p className="text-xs text-[#cbd5e1]">
            Standaardfilters voor rustplaatsen en tankstops in de fleet-planner.
          </p>
          <div className="space-y-3 text-xs">
            {(
              [
                {
                  label: 'Douches verplicht',
                  value: prefShowers,
                  set: setPrefShowers,
                },
                {
                  label: 'AdBlue aan pomp',
                  value: prefAdBlue,
                  set: setPrefAdBlue,
                },
                {
                  label: 'Restaurant / horeca',
                  value: prefRestaurant,
                  set: setPrefRestaurant,
                },
                {
                  label: 'Security-certificaat (Bosch / TPE)',
                  value: prefSecurityCert,
                  set: setPrefSecurityCert,
                },
              ] as const
            ).map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => item.set(!item.value)}
                className="w-full flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-slate-700 hover:border-slate-500 transition"
              >
                <span className="text-[#cbd5e1]">{item.label}</span>
                <span className={`font-bold ${item.value ? 'text-[#10b981]' : 'text-amber-400'}`}>
                  {item.value ? 'Aan' : 'Uit'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </RoleGate>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1e293b] border border-slate-700 rounded-xl p-5 space-y-4">
          <h2 className="text-lg font-semibold text-[#38bdf8]">API & Telematica-koppelingen</h2>
          <div className="space-y-3 text-xs">
            {(
              [
                {
                  label: 'Boordcomputer / OBD-API',
                  value: obdActive,
                  set: setObdActive,
                },
                {
                  label: 'Brandstofkaartaanbieder (DKV/UTA)',
                  value: cardsLinked,
                  set: setCardsLinked,
                },
                {
                  label: 'OCR CMR-scanner',
                  value: ocrReady,
                  set: setOcrReady,
                },
              ] as const
            ).map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => item.set(!item.value)}
                className="w-full flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-slate-700 hover:border-slate-500 transition"
              >
                <span className="text-[#cbd5e1]">{item.label}</span>
                <span className={`font-bold ${item.value ? 'text-[#10b981]' : 'text-amber-400'}`}>
                  {item.value ? 'Actief' : 'Uit'}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#1e293b] border border-slate-700 rounded-xl p-5 space-y-4">
          <h2 className="text-lg font-semibold text-[#38bdf8]">Bedrijfsparameters</h2>
          <div className="space-y-3 text-xs">
            <RoleGate componentId="maut_tol_matrix">
              <div>
                <label className="block text-[#cbd5e1] mb-1">Standaard Maut/Tol-berekening</label>
                <input
                  type="text"
                  value={mautClass}
                  onChange={(e) => setMautClass(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-[#f8fafc]"
                />
              </div>
            </RoleGate>
            <RangeSlider
              id="fuel-margin"
              label="Standaard brandstofmargedrempel"
              value={Math.round(fuelMargin * 100)}
              min={5}
              max={40}
              accent="#38bdf8"
              formatValue={(v) => `€ ${(v / 100).toFixed(2)} / L`}
              onChange={(v) => setFuelMargin(v / 100)}
            />
            <button
              type="button"
              onClick={saveSettings}
              className="w-full py-2.5 bg-[#38bdf8] hover:bg-sky-400 text-slate-950 font-bold rounded-lg transition"
            >
              Opslaan
            </button>
            {saved && (
              <p className="text-[11px] font-semibold text-[#10b981]">Instellingen opgeslagen</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
