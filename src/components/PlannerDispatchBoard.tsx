'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { AddVehicleModal } from '@/components/AddVehicleModal';
import {
  DispatchChatPanel,
  DispatchCmrPanel,
  DispatchFleetPanel,
  DispatchTruckDetail,
  type FleetFilter,
} from '@/components/DispatchPanels';
import { FleetMap } from '@/components/FleetMap';
import { MapEngineSwitcher, type MapEngineId } from '@/components/MapEngineSwitcher';
import { useUi } from '@/components/useUi';
import {
  addDispatchTruck,
  broadcastMessage,
  selectTruck,
  useDispatchFleet,
  useDispatchKpis,
  useSelectedTruckId,
} from '@/lib/dispatch-store';
import type { CmrShipment } from '@/lib/cmr-store';

export type DispatchTab = 'fleet' | 'cmr' | 'chat' | 'detail' | 'tools';

export function PlannerDispatchBoard({
  tools,
  onCmrApplied,
}: {
  tools?: ReactNode;
  onCmrApplied?: (cmr: CmrShipment) => void;
}) {
  const ui = useUi();
  const trucks = useDispatchFleet();
  const kpis = useDispatchKpis();
  const selectedId = useSelectedTruckId();
  const [tab, setTab] = useState<DispatchTab>('fleet');
  const [filter, setFilter] = useState<FleetFilter>('all');
  const [showAddTruck, setShowAddTruck] = useState(false);
  const [mapEngine, setMapEngine] = useState<MapEngineId>('here');

  useEffect(() => {
    if (selectedId && tab === 'fleet') {
      // keep fleet; user can open detail
    }
  }, [selectedId, tab]);

  const tabs: { id: DispatchTab; label: string; badge?: number }[] = [
    { id: 'fleet', label: ui('tab_fleet') },
    { id: 'cmr', label: ui('tab_cmr'), badge: kpis.cmrOpen || undefined },
    { id: 'chat', label: ui('tab_chat'), badge: kpis.unread || undefined },
    { id: 'detail', label: ui('tab_detail') },
    { id: 'tools', label: ui('tab_tools') },
  ];

  return (
    <div className="space-y-3 sm:space-y-4">
      <header className="fr-glass px-3 sm:px-5 py-3 sm:py-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="fr-label">{ui('dispatch_title')}</p>
          <h1 className="fr-display text-xl sm:text-2xl text-[#f2f6fb] mt-0.5">
            {ui('planner_title')}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--fr-text-muted)] mt-0.5">
            {ui('dispatch_subtitle')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowAddTruck(true)}
            className="rounded-[10px] px-3 py-2 text-xs font-bold bg-[#00a3ff] text-white hover:bg-[#007aff]"
          >
            {ui('action_add_truck')}
          </button>
          <button
            type="button"
            onClick={() => setTab('cmr')}
            className="rounded-[10px] px-3 py-2 text-xs font-bold border border-[#00a3ff]/50 text-[#7dd3fc] hover:bg-[#00a3ff]/10"
          >
            {ui('action_cmr_upload')}
          </button>
          <button
            type="button"
            onClick={() => {
              const msg = window.prompt(ui('broadcast_prompt'));
              if (msg) broadcastMessage(msg);
            }}
            className="rounded-[10px] px-3 py-2 text-xs font-bold border border-[#1e2a3a] text-[#c5d0e0] hover:border-[#00a3ff]/40"
          >
            {ui('action_broadcast')}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <KpiCard label={ui('kpi_online')} value={`${kpis.online}/${kpis.total}`} accent="#00a3ff" />
        <KpiCard label={ui('kpi_delayed')} value={String(kpis.delayed)} accent="#f59e0b" />
        <KpiCard label={ui('kpi_cmr_open')} value={String(kpis.cmrOpen)} accent="#a78bfa" />
        <KpiCard label={ui('kpi_unread')} value={String(kpis.unread)} accent="#28a745" />
      </div>

      <div
        className={`grid grid-cols-1 gap-3 lg:gap-4 lg:items-start ${
          tab === 'tools' ? '' : 'lg:grid-cols-12'
        }`}
      >
        {tab !== 'tools' && (
          <div className="lg:col-span-7 xl:col-span-8 space-y-2">
            <MapEngineSwitcher value={mapEngine} onChange={setMapEngine} />
            <FleetMap
              trucks={trucks}
              selectedTruckId={selectedId}
              onSelectTruck={(id) => {
                selectTruck(id);
                setTab('detail');
              }}
            />
          </div>
        )}

        <aside
          className={`fr-glass p-3 sm:p-4 flex flex-col min-h-[360px] ${
            tab === 'tools'
              ? 'w-full'
              : 'lg:col-span-5 xl:col-span-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)]'
          }`}
        >
          <div className="flex gap-1 overflow-x-auto pb-2 mb-2 border-b border-[#1e2a3a]">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`shrink-0 rounded-[10px] px-2.5 py-2 text-[11px] font-bold border ${
                  tab === t.id
                    ? 'border-[#00a3ff] bg-[#00a3ff]/15 text-[#7dd3fc]'
                    : 'border-transparent text-[#9aa8bc] hover:text-[#e8eef7]'
                }`}
              >
                {t.label}
                {t.badge != null && t.badge > 0 ? (
                  <span className="ml-1 inline-flex min-w-[1.1rem] justify-center rounded-full bg-[#00a3ff] px-1 text-[9px] text-white">
                    {t.badge}
                  </span>
                ) : null}
              </button>
            ))}
          </div>

          <div className={`flex-1 min-h-0 ${tab === 'tools' ? '' : 'overflow-y-auto'}`}>
            {tab === 'fleet' && (
              <DispatchFleetPanel filter={filter} onFilter={setFilter} />
            )}
            {tab === 'cmr' && (
              <DispatchCmrPanel
                onApplied={(cmr) => {
                  onCmrApplied?.(cmr);
                }}
              />
            )}
            {tab === 'chat' && <DispatchChatPanel />}
            {tab === 'detail' && (
              <DispatchTruckDetail onOpenChat={() => setTab('chat')} />
            )}
            {tab === 'tools' && (
              <div className="space-y-3 max-w-6xl mx-auto">{tools}</div>
            )}
          </div>
        </aside>
      </div>
      {showAddTruck && (
        <AddVehicleModal
          nextIndex={trucks.length + 1}
          onClose={() => setShowAddTruck(false)}
          onAdd={(row) => {
            addDispatchTruck(row);
            setShowAddTruck(false);
            setTab('fleet');
          }}
        />
      )}
    </div>
  );
}

function KpiCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-[12px] border border-[#1e2a3a] bg-[#0b0e11]/90 px-3 py-2.5">
      <p className="fr-label">{label}</p>
      <p className="text-xl font-black mt-0.5" style={{ color: accent }}>
        {value}
      </p>
    </div>
  );
}
