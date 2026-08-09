'use client';

import { useState } from 'react';
import { RoleGate } from '@/components/RoleGate';

const DISCLAIMERS = [
  {
    id: 'maut',
    title: 'Maut & Tolwetgeving',
    short: 'Maut & Tolwetgeving',
    body: 'Maut- en tolberekeningen (o.a. Duitse Lkw-Maut) zijn indicatief en gebaseerd op publieke tariefklassen. Definitieve afrekening volgt via de officieel erkende tolheffer of dienstverlener.',
  },
  {
    id: 'rest',
    title: 'EU Verordening 561/2006',
    short: 'EU Verordening 561/2006',
    body: 'FuelRoute ondersteunt planning binnen Verordening (EG) nr. 561/2006. De chauffeur en vervoerder blijven verantwoordelijk voor naleving van rij-, pauze- en rusttijden via de tachograaf.',
  },
  {
    id: 'price',
    title: 'Prijsarbitrage Disclaimer',
    short: 'Prijsarbitrage',
    body: 'Getoonde nettoprijzen en besparingen zijn schattingen op basis van tankkaarttarieven en marktdata. Actuele pomp- of nettoprijzen kunnen afwijken; controleer altijd de geldende stationsprijs vóór het tanken.',
  },
  {
    id: 'driver',
    title: 'Juridische Aansprakelijkheid Chauffeur',
    short: 'Aansprakelijkheid Chauffeur',
    body: 'De chauffeur blijft eindverantwoordelijk voor voertuigdoorrijhoogte, naleving van verkeersborden, aslast/gewichslimieten en tachograaflimieten. Navigatie- en tankadviezen van FuelRoute ontslaan de chauffeur niet van deze wettelijke plichten.',
  },
] as const;

export function LegalFooter() {
  const [activeTip, setActiveTip] = useState<string | null>(null);

  return (
    <RoleGate componentId="legal_disclaimers">
      <footer className="mt-auto border-t border-slate-800 px-4 py-5" style={{ background: '#0b0f19' }}>
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#38bdf8]">
              Juridische Disclaimers
            </span>
            {DISCLAIMERS.map((d) => (
              <button
                key={d.id}
                type="button"
                title={d.body}
                onClick={() => setActiveTip(activeTip === d.id ? null : d.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition ${
                  activeTip === d.id
                    ? 'bg-sky-500/20 text-[#38bdf8] border-sky-500/40'
                    : 'bg-[#1e293b] text-[#cbd5e1] border-slate-700 hover:border-slate-500'
                }`}
              >
                {d.short}
              </button>
            ))}
          </div>

          {activeTip && (
            <div className="rounded-lg border border-slate-700 bg-[#1e293b] p-3 text-xs text-[#cbd5e1]">
              <p className="font-bold text-[#f8fafc] mb-1">
                {DISCLAIMERS.find((d) => d.id === activeTip)?.title}
              </p>
              <p>{DISCLAIMERS.find((d) => d.id === activeTip)?.body}</p>
            </div>
          )}

          <p className="text-[10px] text-slate-500 leading-relaxed">
            FuelRoute is een beslisondersteunend vlootplatform. Indicatieve maut/tol, adviezen op basis
            van EU Verordening 561/2006 en brandstofprijsarbitrage vormen geen juridisch bindend advies.
            De chauffeur blijft eindverantwoordelijk voor voertuigdoorrijhoogte, verkeersborden en
            tachograaflimieten. Controleer altijd lokale wetgeving, tachograafstatus en actuele
            stationsvoorwaarden. Dienstmodus/Privémodus: in privémodus wordt real-time GPS-tracking
            uitgeschakeld conform AVG/GDPR.
          </p>
        </div>
      </footer>
    </RoleGate>
  );
}
