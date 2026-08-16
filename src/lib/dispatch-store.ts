'use client';

import { useCallback, useEffect, useState } from 'react';
import { fleetTrucks, type FleetTruckRow } from '@/lib/mock-data';
import { resolveCityCoord } from '@/lib/in-app-nav';
import type { CmrShipment } from '@/lib/cmr-store';

export type TruckDutyStatus = 'driving' | 'rest' | 'loading' | 'offline';

export type DispatchTruck = {
  truckId: string;
  licensePlate: string;
  model: string;
  driverId: string;
  driverName: string;
  lat: number;
  lng: number;
  locationLabel: string;
  status: TruckDutyStatus;
  fuelLevel: number;
  delayed: boolean;
  assignedCmrId: string | null;
  originHint: string;
  destinationHint: string;
  etaLabel: string;
  remainingDriveMin: number;
  lastUpdate: string;
  euroNorm: 'Euro 6' | 'Euro 5';
  tankCapacity: number;
};

export type CmrAssignmentStatus = 'queued' | 'assigned' | 'in_progress' | 'done';

export type CmrAssignment = {
  id: string;
  cmrId: string;
  cmrNumber: string;
  origin: string;
  destination: string;
  truckId: string | null;
  driverId: string | null;
  driverName: string | null;
  status: CmrAssignmentStatus;
  createdAt: string;
  assignedAt?: string;
};

export type ChatMessage = {
  id: string;
  from: 'planner' | 'driver';
  text: string;
  at: string;
  read: boolean;
};

export type ChatThread = {
  driverId: string;
  driverName: string;
  truckId: string;
  messages: ChatMessage[];
};

export type ActivityKind =
  | 'depart'
  | 'fuel'
  | 'border'
  | 'rest'
  | 'cmr'
  | 'message'
  | 'load'
  | 'arrive'
  | 'alert';

export type ActivityEvent = {
  id: string;
  truckId: string;
  kind: ActivityKind;
  title: string;
  detail: string;
  at: string;
};

type DispatchState = {
  trucks: DispatchTruck[];
  assignments: CmrAssignment[];
  threads: ChatThread[];
  activities: ActivityEvent[];
  selectedTruckId: string | null;
};

const STORAGE_KEY = 'fuelroute-dispatch-v1';
const listeners = new Set<() => void>();

let cache: DispatchState | undefined;

function emit() {
  listeners.forEach((l) => l());
}

function slugDriver(name: string) {
  return `drv-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
}

function guessCoords(location: string, index: number): { lat: number; lng: number; label: string } {
  const city = resolveCityCoord(location);
  if (city) return { lat: city.lat, lng: city.lng, label: city.label };

  const hubs: { match: RegExp; lat: number; lng: number; label: string }[] = [
    { match: /venlo/i, lat: 51.3704, lng: 6.1724, label: 'Venlo' },
    { match: /antwerp|antwerpen/i, lat: 51.2194, lng: 4.4025, label: 'Antwerpen' },
    { match: /würzburg|wurzburg/i, lat: 49.7913, lng: 9.9534, label: 'Würzburg' },
    { match: /hamburg/i, lat: 53.5511, lng: 9.9937, label: 'Hamburg' },
    { match: /liège|liege/i, lat: 50.6326, lng: 5.5797, label: 'Liège' },
    { match: /köln|koln|cologne/i, lat: 50.9375, lng: 6.9603, label: 'Köln' },
    { match: /frankfurt/i, lat: 50.1109, lng: 8.6821, label: 'Frankfurt' },
    { match: /tilburg/i, lat: 51.5555, lng: 5.0913, label: 'Tilburg' },
    { match: /maasvlakte|rotterdam/i, lat: 51.955, lng: 4.05, label: 'Rotterdam' },
  ];
  const hit = hubs.find((h) => h.match.test(location));
  if (hit) return { lat: hit.lat, lng: hit.lng, label: hit.label };

  // Spread leftovers around DE/NL corridor
  const baseLat = 50.2 + (index % 5) * 0.45;
  const baseLng = 6.5 + (index % 4) * 1.1;
  return { lat: baseLat, lng: baseLng, label: location };
}

function statusFromRow(row: FleetTruckRow, index: number): TruckDutyStatus {
  if (row.telematics === 'Offline') return 'offline';
  if (row.compliance === 'Critical') return 'loading';
  if (index % 5 === 2) return 'rest';
  if (index % 7 === 0) return 'loading';
  return 'driving';
}

function seedHints(row: FleetTruckRow, index: number): {
  origin: string;
  dest: string;
  eta: string;
} {
  const corridors = [
    { origin: 'Amsterdam (NL)', dest: 'Praag / Prague (CZ)', eta: '18:40' },
    { origin: 'Kassel Hub (DE)', dest: 'München Distribution (DE)', eta: '16:40' },
    { origin: 'Antwerpen Port (BE)', dest: 'Duisburg Hub (DE)', eta: '14:20' },
    { origin: 'Rotterdam Maasvlakte', dest: 'Frankfurt Ost (DE)', eta: '17:05' },
    { origin: 'Venlo Hub (NL)', dest: 'Praag / Prague (CZ)', eta: '20:10' },
  ];
  return corridors[index % corridors.length];
}

function rowToDispatch(row: FleetTruckRow, index: number): DispatchTruck {
  const coords = guessCoords(row.location, index);
  const hints = seedHints(row, index);
  const status = statusFromRow(row, index);
  return {
    truckId: row.truckId,
    licensePlate: row.licensePlate,
    model: row.model,
    driverId: slugDriver(row.driver),
    driverName: row.driver,
    lat: coords.lat,
    lng: coords.lng,
    locationLabel: row.location,
    status,
    fuelLevel: row.fuelLevel,
    delayed: row.compliance !== 'Compliant' || row.fuelLevel < 20,
    assignedCmrId: index === 0 ? 'seed-cmr-ams-prg' : null,
    originHint: hints.origin,
    destinationHint: hints.dest,
    etaLabel: hints.eta,
    remainingDriveMin: 45 + ((index * 17) % 180),
    lastUpdate: new Date(Date.now() - index * 7 * 60_000).toISOString(),
    euroNorm: row.euroNorm,
    tankCapacity: row.tankCapacity,
  };
}

function seedActivities(trucks: DispatchTruck[]): ActivityEvent[] {
  const now = Date.now();
  const events: ActivityEvent[] = [];
  trucks.slice(0, 8).forEach((t, i) => {
    events.push(
      {
        id: `act-${t.truckId}-1`,
        truckId: t.truckId,
        kind: 'depart',
        title: 'Vertrokken',
        detail: `${t.originHint} · ${t.licensePlate}`,
        at: new Date(now - (i + 1) * 90 * 60_000).toISOString(),
      },
      {
        id: `act-${t.truckId}-2`,
        truckId: t.truckId,
        kind: 'fuel',
        title: 'Getankt',
        detail: `Autohof · ${Math.round(280 + i * 20)} L`,
        at: new Date(now - (i + 1) * 55 * 60_000).toISOString(),
      },
      {
        id: `act-${t.truckId}-3`,
        truckId: t.truckId,
        kind: i % 2 === 0 ? 'border' : 'rest',
        title: i % 2 === 0 ? 'Grens gepasseerd' : 'Rustpauze',
        detail: i % 2 === 0 ? 'NL/DE · documenten OK' : '45 min · EG 561/2006',
        at: new Date(now - (i + 1) * 25 * 60_000).toISOString(),
      }
    );
  });
  return events.sort((a, b) => b.at.localeCompare(a.at));
}

function seedThreads(trucks: DispatchTruck[]): ChatThread[] {
  return trucks.slice(0, 6).map((t, i) => ({
    driverId: t.driverId,
    driverName: t.driverName,
    truckId: t.truckId,
    messages: [
      {
        id: `m-${t.driverId}-1`,
        from: 'driver' as const,
        text:
          i % 2 === 0
            ? 'File bij Oberhausen, +18 min ETA.'
            : 'CMR ontvangen, start laden over 10 min.',
        at: new Date(Date.now() - (40 - i) * 60_000).toISOString(),
        read: i > 1,
      },
      {
        id: `m-${t.driverId}-2`,
        from: 'planner' as const,
        text: 'Oké, houd me op de hoogte. Tankadvies volgt.',
        at: new Date(Date.now() - (35 - i) * 60_000).toISOString(),
        read: true,
      },
    ],
  }));
}

function seedAssignments(trucks: DispatchTruck[]): CmrAssignment[] {
  const first = trucks[0];
  return [
    {
      id: 'asn-seed-1',
      cmrId: 'seed-cmr-ams-prg',
      cmrNumber: 'CMR-01345',
      origin: 'Amsterdam (NL)',
      destination: 'Praag / Prague (CZ)',
      truckId: first?.truckId ?? null,
      driverId: first?.driverId ?? null,
      driverName: first?.driverName ?? null,
      status: 'in_progress',
      createdAt: new Date(Date.now() - 3 * 3600_000).toISOString(),
      assignedAt: new Date(Date.now() - 2.5 * 3600_000).toISOString(),
    },
    {
      id: 'asn-seed-2',
      cmrId: 'seed-cmr-queued',
      cmrNumber: 'CMR-24650',
      origin: 'Kassel Hub (DE)',
      destination: 'München Distribution (DE)',
      truckId: null,
      driverId: null,
      driverName: null,
      status: 'queued',
      createdAt: new Date(Date.now() - 50 * 60_000).toISOString(),
    },
  ];
}

function buildSeed(): DispatchState {
  const trucks = fleetTrucks.map(rowToDispatch);
  return {
    trucks,
    assignments: seedAssignments(trucks),
    threads: seedThreads(trucks),
    activities: seedActivities(trucks),
    selectedTruckId: trucks[0]?.truckId ?? null,
  };
}

function readState(): DispatchState {
  if (typeof window === 'undefined') return buildSeed();
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      cache = JSON.parse(raw) as DispatchState;
      return cache;
    }
  } catch {
    /* ignore */
  }
  cache = buildSeed();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    /* ignore */
  }
  return cache;
}

function writeState(next: DispatchState) {
  cache = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  emit();
}

function mutate(fn: (prev: DispatchState) => DispatchState) {
  writeState(fn(readState()));
}

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function getDispatchState(): DispatchState {
  return readState();
}

export function selectTruck(truckId: string | null) {
  mutate((s) => ({ ...s, selectedTruckId: truckId }));
}

export function addDispatchTruck(row: FleetTruckRow) {
  mutate((s) => {
    const truck = rowToDispatch(row, s.trucks.length);
    truck.locationLabel = row.location || 'Nieuw in vloot';
    truck.status = 'offline';
    const activity: ActivityEvent = {
      id: uid('act'),
      truckId: truck.truckId,
      kind: 'alert',
      title: 'Truck toegevoegd',
      detail: `${truck.licensePlate} · ${truck.model}`,
      at: new Date().toISOString(),
    };
    return {
      ...s,
      trucks: [truck, ...s.trucks],
      activities: [activity, ...s.activities],
      selectedTruckId: truck.truckId,
      threads: [
        {
          driverId: truck.driverId,
          driverName: truck.driverName,
          truckId: truck.truckId,
          messages: [],
        },
        ...s.threads.filter((t) => t.driverId !== truck.driverId),
      ],
    };
  });
}

export function queueCmrAssignment(cmr: CmrShipment) {
  mutate((s) => {
    const existing = s.assignments.find((a) => a.cmrId === cmr.id);
    if (existing) {
      return {
        ...s,
        assignments: s.assignments.map((a) =>
          a.cmrId === cmr.id
            ? {
                ...a,
                cmrNumber: cmr.cmrNumber,
                origin: cmr.origin,
                destination: cmr.destination,
                status: a.status === 'done' ? 'queued' : a.status,
              }
            : a
        ),
      };
    }
    const asn: CmrAssignment = {
      id: uid('asn'),
      cmrId: cmr.id,
      cmrNumber: cmr.cmrNumber,
      origin: cmr.origin,
      destination: cmr.destination,
      truckId: null,
      driverId: null,
      driverName: null,
      status: 'queued',
      createdAt: new Date().toISOString(),
    };
    return { ...s, assignments: [asn, ...s.assignments] };
  });
}

export function assignCmrToTruck(assignmentId: string, truckId: string) {
  mutate((s) => {
    const truck = s.trucks.find((t) => t.truckId === truckId);
    if (!truck) return s;
    const asn = s.assignments.find((a) => a.id === assignmentId);
    if (!asn) return s;
    const assignedAt = new Date().toISOString();
    const activity: ActivityEvent = {
      id: uid('act'),
      truckId,
      kind: 'cmr',
      title: 'CMR toegewezen',
      detail: `${asn.cmrNumber} · ${asn.origin} → ${asn.destination}`,
      at: assignedAt,
    };
    const msg: ChatMessage = {
      id: uid('m'),
      from: 'planner',
      text: `Nieuwe rit toegewezen: ${asn.cmrNumber} · ${asn.origin} → ${asn.destination}. Bevestig laden.`,
      at: assignedAt,
      read: true,
    };
    const threads = [...s.threads];
    const idx = threads.findIndex((t) => t.driverId === truck.driverId);
    if (idx >= 0) {
      threads[idx] = { ...threads[idx], messages: [...threads[idx].messages, msg] };
    } else {
      threads.unshift({
        driverId: truck.driverId,
        driverName: truck.driverName,
        truckId: truck.truckId,
        messages: [msg],
      });
    }
    return {
      ...s,
      trucks: s.trucks.map((t) =>
        t.truckId === truckId
          ? {
              ...t,
              assignedCmrId: asn.cmrId,
              originHint: asn.origin,
              destinationHint: asn.destination,
              status: t.status === 'offline' ? 'loading' : t.status,
            }
          : t
      ),
      assignments: s.assignments.map((a) =>
        a.id === assignmentId
          ? {
              ...a,
              truckId,
              driverId: truck.driverId,
              driverName: truck.driverName,
              status: 'assigned',
              assignedAt,
            }
          : a
      ),
      activities: [activity, ...s.activities],
      threads,
      selectedTruckId: truckId,
    };
  });
}

export function sendDispatchMessage(driverId: string, text: string) {
  const trimmed = text.trim();
  if (!trimmed) return;
  mutate((s) => {
    const truck = s.trucks.find((t) => t.driverId === driverId);
    const threads = [...s.threads];
    let idx = threads.findIndex((t) => t.driverId === driverId);
    if (idx < 0 && truck) {
      threads.unshift({
        driverId,
        driverName: truck.driverName,
        truckId: truck.truckId,
        messages: [],
      });
      idx = 0;
    }
    if (idx < 0) return s;
    const msg: ChatMessage = {
      id: uid('m'),
      from: 'planner',
      text: trimmed,
      at: new Date().toISOString(),
      read: true,
    };
    threads[idx] = { ...threads[idx], messages: [...threads[idx].messages, msg] };
    const activity: ActivityEvent | null = truck
      ? {
          id: uid('act'),
          truckId: truck.truckId,
          kind: 'message',
          title: 'Bericht naar chauffeur',
          detail: trimmed.slice(0, 80),
          at: msg.at,
        }
      : null;
    return {
      ...s,
      threads,
      activities: activity ? [activity, ...s.activities] : s.activities,
    };
  });

  // Demo driver reply
  window.setTimeout(() => {
    mutate((s) => {
      const threads = [...s.threads];
      const idx = threads.findIndex((t) => t.driverId === driverId);
      if (idx < 0) return s;
      const reply: ChatMessage = {
        id: uid('m'),
        from: 'driver',
        text: 'Ontvangen — ik check het en geef status door.',
        at: new Date().toISOString(),
        read: false,
      };
      threads[idx] = { ...threads[idx], messages: [...threads[idx].messages, reply] };
      return { ...s, threads };
    });
  }, 1600);
}

export function markThreadRead(driverId: string) {
  mutate((s) => ({
    ...s,
    threads: s.threads.map((t) =>
      t.driverId === driverId
        ? { ...t, messages: t.messages.map((m) => ({ ...m, read: true })) }
        : t
    ),
  }));
}

export function broadcastMessage(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return;
  const online = readState().trucks.filter((t) => t.status !== 'offline');
  online.forEach((t) => sendDispatchMessage(t.driverId, `Broadcast: ${trimmed}`));
}

export function resetDispatchStore() {
  cache = buildSeed();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    /* ignore */
  }
  emit();
}

function useDispatchSlice<T>(selector: (s: DispatchState) => T): T {
  const [value, setValue] = useState(() => selector(readState()));
  useEffect(() => {
    const sync = () => setValue(selector(readState()));
    listeners.add(sync);
    sync();
    return () => {
      listeners.delete(sync);
    };
  }, [selector]);
  return value;
}

export function useDispatchFleet() {
  return useDispatchSlice(useCallback((s) => s.trucks, []));
}

export function useDispatchAssignments() {
  return useDispatchSlice(useCallback((s) => s.assignments, []));
}

export function useDispatchThreads() {
  return useDispatchSlice(useCallback((s) => s.threads, []));
}

export function useSelectedTruckId() {
  return useDispatchSlice(useCallback((s) => s.selectedTruckId, []));
}

export function useSelectedTruck(): DispatchTruck | null {
  return useDispatchSlice(
    useCallback((s) => s.trucks.find((t) => t.truckId === s.selectedTruckId) ?? null, [])
  );
}

export function useTruckActivities(truckId: string | null) {
  return useDispatchSlice(
    useCallback(
      (s) => (truckId ? s.activities.filter((a) => a.truckId === truckId) : []),
      [truckId]
    )
  );
}

export function useDispatchChat(driverId: string | null) {
  return useDispatchSlice(
    useCallback(
      (s) => (driverId ? s.threads.find((t) => t.driverId === driverId) ?? null : null),
      [driverId]
    )
  );
}

export function useDispatchKpis() {
  return useDispatchSlice(
    useCallback((s) => {
      const online = s.trucks.filter((t) => t.status !== 'offline').length;
      const delayed = s.trucks.filter((t) => t.delayed).length;
      const cmrOpen = s.assignments.filter((a) => a.status === 'queued' || a.status === 'assigned')
        .length;
      const unread = s.threads.reduce(
        (n, t) => n + t.messages.filter((m) => m.from === 'driver' && !m.read).length,
        0
      );
      return { online, delayed, cmrOpen, unread, total: s.trucks.length };
    }, [])
  );
}
