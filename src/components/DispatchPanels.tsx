'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ActionButton } from '@/components/ActionBar';
import { ActiveCmrBanner, CmrImportPanel } from '@/components/CmrImportPanel';
import { useUi } from '@/components/useUi';
import {
  assignCmrToTruck,
  markThreadRead,
  queueCmrAssignment,
  selectTruck,
  sendDispatchMessage,
  useDispatchAssignments,
  useDispatchChat,
  useDispatchFleet,
  useDispatchThreads,
  useSelectedTruck,
  useTruckActivities,
  type CmrAssignment,
  type DispatchTruck,
  type TruckDutyStatus,
} from '@/lib/dispatch-store';
import type { CmrShipment } from '@/lib/cmr-store';
import { formatDriveTime } from '@/lib/calculations';

const STATUS_KEY: Record<TruckDutyStatus, 'status_driving' | 'status_rest' | 'status_loading' | 'status_offline'> =
  {
    driving: 'status_driving',
    rest: 'status_rest',
    loading: 'status_loading',
    offline: 'status_offline',
  };

function statusClass(s: TruckDutyStatus) {
  if (s === 'driving') return 'text-[#7dd3fc] border-[#00a3ff]/40 bg-[#00a3ff]/10';
  if (s === 'rest') return 'text-amber-200 border-amber-500/40 bg-amber-500/10';
  if (s === 'loading') return 'text-violet-200 border-violet-500/40 bg-violet-500/10';
  return 'text-[#9aa8bc] border-[#1e2a3a] bg-[#0b0e11]';
}

type FleetFilter = 'all' | 'online' | 'delayed' | 'offline';

export function DispatchFleetPanel({
  filter,
  onFilter,
}: {
  filter: FleetFilter;
  onFilter: (f: FleetFilter) => void;
}) {
  const ui = useUi();
  const trucks = useDispatchFleet();
  const selected = useSelectedTruck();

  const filtered = useMemo(() => {
    return trucks.filter((t) => {
      if (filter === 'online') return t.status !== 'offline';
      if (filter === 'offline') return t.status === 'offline';
      if (filter === 'delayed') return t.delayed;
      return true;
    });
  }, [trucks, filter]);

  const filters: { id: FleetFilter; label: string }[] = [
    { id: 'all', label: ui('fleet_filter_all') },
    { id: 'online', label: ui('fleet_filter_online') },
    { id: 'delayed', label: ui('fleet_filter_delayed') },
    { id: 'offline', label: ui('fleet_filter_offline') },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onFilter(f.id)}
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold border ${
              filter === f.id
                ? 'border-[#00a3ff] bg-[#00a3ff]/15 text-[#7dd3fc]'
                : 'border-[#1e2a3a] text-[#9aa8bc]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <ul className="space-y-1.5 max-h-[52vh] lg:max-h-[calc(100vh-16rem)] overflow-y-auto pr-1">
        {filtered.map((t) => (
          <li key={t.truckId}>
            <button
              type="button"
              onClick={() => selectTruck(t.truckId)}
              className={`w-full text-left rounded-[12px] border px-3 py-2.5 transition ${
                selected?.truckId === t.truckId
                  ? 'border-[#00a3ff]/50 bg-[#00a3ff]/10'
                  : 'border-[#1e2a3a] bg-[#0b0e11] hover:border-[#00a3ff]/30'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="fr-mono text-sm font-bold text-[#00a3ff]">{t.licensePlate}</span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ${statusClass(t.status)}`}
                >
                  {ui(STATUS_KEY[t.status])}
                </span>
              </div>
              <p className="text-xs text-[#e8eef7] mt-0.5">{t.driverName}</p>
              <p className="text-[11px] text-[#6b7a90] truncate">
                {t.locationLabel} · {t.fuelLevel.toFixed(0)}% · ETA {t.etaLabel}
              </p>
              {t.delayed && (
                <p className="text-[10px] font-semibold text-amber-300 mt-1">⏱ delayed</p>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DispatchCmrPanel({ onApplied }: { onApplied?: (cmr: CmrShipment) => void }) {
  const ui = useUi();
  const assignments = useDispatchAssignments();
  const trucks = useDispatchFleet();
  const [assignFor, setAssignFor] = useState<string | null>(null);

  const statusLabel = (a: CmrAssignment) => {
    if (a.status === 'queued') return ui('queued');
    if (a.status === 'assigned') return ui('assigned');
    if (a.status === 'in_progress') return ui('in_progress');
    return 'Done';
  };

  return (
    <div className="space-y-4">
      <ActiveCmrBanner />
      <CmrImportPanel
        compact
        onApplied={(cmr) => {
          queueCmrAssignment(cmr);
          onApplied?.(cmr);
        }}
      />
      <div className="space-y-2">
        <p className="fr-label">{ui('queued')} / {ui('assigned')}</p>
        <ul className="space-y-2 max-h-[36vh] overflow-y-auto">
          {assignments.map((a) => (
            <li
              key={a.id}
              className="rounded-[12px] border border-[#1e2a3a] bg-[#0b0e11] p-3 space-y-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="fr-mono text-xs font-bold text-[#00a3ff]">{a.cmrNumber}</span>
                <span className="text-[10px] font-bold uppercase text-[#9aa8bc]">
                  {statusLabel(a)}
                </span>
              </div>
              <p className="text-xs text-[#e8eef7]">
                {a.origin} → {a.destination}
              </p>
              {a.driverName && (
                <p className="text-[11px] text-[#6b7a90]">
                  {a.driverName} · {a.truckId}
                </p>
              )}
              {(a.status === 'queued' || a.status === 'assigned') && (
                <div className="space-y-1.5">
                  {assignFor === a.id ? (
                    <select
                      className="w-full bg-[#050a0f] border border-[#1e2a3a] rounded-[10px] px-2 py-2 text-xs text-[#e8eef7]"
                      defaultValue=""
                      onChange={(e) => {
                        const tid = e.target.value;
                        if (!tid) return;
                        assignCmrToTruck(a.id, tid);
                        setAssignFor(null);
                      }}
                    >
                      <option value="" disabled>
                        {ui('assign_to')}
                      </option>
                      {trucks.map((t) => (
                        <option key={t.truckId} value={t.truckId}>
                          {t.licensePlate} · {t.driverName}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <ActionButton
                      variant="primary"
                      className="w-full py-2 text-xs"
                      onClick={() => setAssignFor(a.id)}
                    >
                      {ui('assign_cmr')}
                    </ActionButton>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function DispatchChatPanel() {
  const ui = useUi();
  const threads = useDispatchThreads();
  const selectedTruck = useSelectedTruck();
  const [activeDriverId, setActiveDriverId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    const preferred = selectedTruck?.driverId;
    if (!preferred) return;
    setActiveDriverId(preferred);
    markThreadRead(preferred);
  }, [selectedTruck?.driverId]);

  const thread = useDispatchChat(activeDriverId ?? threads[0]?.driverId ?? null);

  const openThread = (driverId: string) => {
    setActiveDriverId(driverId);
    markThreadRead(driverId);
  };

  return (
    <div className="flex flex-col gap-3 h-full min-h-[320px]">
      <ul className="flex gap-1.5 overflow-x-auto pb-1">
        {threads.map((t) => {
          const unread = t.messages.filter((m) => m.from === 'driver' && !m.read).length;
          return (
            <button
              key={t.driverId}
              type="button"
              onClick={() => openThread(t.driverId)}
              className={`shrink-0 rounded-[10px] border px-2.5 py-1.5 text-[11px] font-semibold ${
                activeDriverId === t.driverId
                  ? 'border-[#00a3ff] bg-[#00a3ff]/15 text-[#7dd3fc]'
                  : 'border-[#1e2a3a] text-[#9aa8bc]'
              }`}
            >
              {t.driverName.split(' ')[0]}
              {unread > 0 ? ` · ${unread}` : ''}
            </button>
          );
        })}
      </ul>

      {!thread ? (
        <p className="text-sm text-[#6b7a90] py-8 text-center">{ui('chat_empty')}</p>
      ) : (
        <>
          <div className="flex-1 min-h-[180px] max-h-[40vh] overflow-y-auto space-y-2 rounded-[12px] border border-[#1e2a3a] bg-[#050a0f] p-3">
            <p className="fr-label">
              {thread.driverName} · {thread.truckId}
            </p>
            {thread.messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[90%] rounded-[10px] px-3 py-2 text-xs ${
                  m.from === 'planner'
                    ? 'ml-auto bg-[#00a3ff]/20 text-[#e8eef7] border border-[#00a3ff]/30'
                    : 'bg-[#1e2a3a] text-[#c5d0e0]'
                }`}
              >
                {m.text}
                <p className="text-[10px] text-[#6b7a90] mt-1">
                  {new Date(m.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))}
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!activeDriverId || !draft.trim()) return;
              sendDispatchMessage(activeDriverId, draft);
              setDraft('');
            }}
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={ui('chat_placeholder')}
              className="flex-1 bg-[#050a0f] border border-[#1e2a3a] rounded-[10px] px-3 py-2.5 text-sm text-[#f2f6fb]"
            />
            <ActionButton variant="primary" type="submit" className="px-4">
              {ui('chat_send')}
            </ActionButton>
          </form>
        </>
      )}
    </div>
  );
}

export function DispatchTruckDetail({ onOpenChat }: { onOpenChat?: () => void }) {
  const ui = useUi();
  const truck = useSelectedTruck();
  const activities = useTruckActivities(truck?.truckId ?? null);

  if (!truck) {
    return (
      <p className="text-sm text-[#6b7a90] py-10 text-center px-4">{ui('detail_no_truck')}</p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[12px] border border-[#00a3ff]/30 bg-[#00a3ff]/05 p-3 space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="fr-mono text-lg font-bold text-[#00a3ff]">{truck.licensePlate}</span>
          <span
            className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${statusClass(truck.status)}`}
          >
            {ui(STATUS_KEY[truck.status])}
          </span>
        </div>
        <p className="text-sm font-semibold text-[#f2f6fb]">{truck.model}</p>
        <p className="text-xs text-[#9aa8bc]">{truck.driverName}</p>
      </div>

      <dl className="grid grid-cols-2 gap-2 text-xs">
        <DetailCell label={ui('label_fuel')} value={`${truck.fuelLevel.toFixed(0)}%`} />
        <DetailCell label="ETA" value={truck.etaLabel} />
        <DetailCell
          label={ui('remaining_drive')}
          value={formatDriveTime(truck.remainingDriveMin)}
        />
        <DetailCell label="Positie" value={truck.locationLabel} />
        <DetailCell
          label={ui('origin')}
          value={truck.originHint}
          className="col-span-2"
        />
        <DetailCell
          label={ui('destination')}
          value={truck.destinationHint}
          className="col-span-2"
        />
      </dl>

      <div className="flex flex-wrap gap-2">
        <ActionButton
          variant="primary"
          className="flex-1"
          onClick={() => {
            selectTruck(truck.truckId);
            onOpenChat?.();
          }}
        >
          {ui('tab_chat')}
        </ActionButton>
        <Link
          href="/driver"
          className="inline-flex flex-1 items-center justify-center rounded-[10px] px-3 py-2.5 text-xs font-semibold border border-[#1e2a3a] bg-[#0b0e11] text-[#e8eef7] hover:border-[#00a3ff]/40"
        >
          {ui('detail_open_cockpit')}
        </Link>
      </div>

      <div>
        <p className="fr-label mb-2">{ui('detail_timeline')}</p>
        <ol className="space-y-2 max-h-[28vh] overflow-y-auto">
          {activities.length === 0 && (
            <li className="text-xs text-[#6b7a90]">—</li>
          )}
          {activities.map((a) => (
            <li
              key={a.id}
              className="rounded-[10px] border border-[#1e2a3a] bg-[#050a0f] px-3 py-2"
            >
              <div className="flex justify-between gap-2">
                <span className="text-xs font-semibold text-[#e8eef7]">{a.title}</span>
                <span className="text-[10px] fr-mono text-[#6b7a90]">
                  {new Date(a.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-[11px] text-[#9aa8bc] mt-0.5">{a.detail}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function DetailCell({
  label,
  value,
  className = '',
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`rounded-[10px] border border-[#1e2a3a] bg-[#0b0e11] px-2.5 py-2 ${className}`}>
      <dt className="fr-label">{label}</dt>
      <dd className="text-[#e8eef7] font-semibold mt-0.5 truncate">{value}</dd>
    </div>
  );
}

export type { FleetFilter, DispatchTruck };
