'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Map as LeafletMap, Marker, Polyline } from 'leaflet';
import type { DispatchTruck } from '@/lib/dispatch-store';
import { resolveInAppRoute, type LatLng } from '@/lib/in-app-nav';

const STATUS_COLOR: Record<DispatchTruck['status'], string> = {
  driving: '#00a3ff',
  rest: '#f59e0b',
  loading: '#a78bfa',
  offline: '#6b7a90',
};

function truckIconHtml(color: string, selected: boolean, plate: string) {
  const ring = selected ? '0 0 0 3px #fff, 0 0 16px ' + color : '0 0 10px ' + color + '99';
  const size = selected ? 28 : 22;
  const short = plate.split('-')[0]?.slice(0, 2) ?? '·';
  return `<div style="
    width:${size}px;height:${size}px;border-radius:50%;
    background:${color};border:2px solid #fff;
    box-shadow:${ring};
    display:flex;align-items:center;justify-content:center;
    font:700 8px/1 Sora,sans-serif;color:#fff;
    cursor:pointer;
  ">${short}</div>`;
}

export function FleetMap({
  trucks,
  selectedTruckId,
  onSelectTruck,
  heightClass = 'h-[42vh] min-h-[240px] lg:h-[calc(100vh-11rem)] lg:min-h-[420px]',
  className = '',
}: {
  trucks: DispatchTruck[];
  selectedTruckId: string | null;
  onSelectTruck: (truckId: string) => void;
  heightClass?: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());
  const routeLineRef = useRef<Polyline | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LRef = useRef<any>(null);
  const onSelectRef = useRef(onSelectTruck);
  onSelectRef.current = onSelectTruck;
  const [mapReady, setMapReady] = useState(false);

  const selected = useMemo(
    () => trucks.find((t) => t.truckId === selectedTruckId) ?? null,
    [trucks, selectedTruckId]
  );

  const selectedRoute: LatLng[] = useMemo(() => {
    if (!selected) return [];
    const resolved = resolveInAppRoute(
      selected.destinationHint,
      { lat: selected.lat, lng: selected.lng },
      undefined,
      selected.originHint
    );
    return resolved.route;
  }, [selected]);

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;

    void (async () => {
      const L = (await import('leaflet')).default;
      if (cancelled || !containerRef.current || mapRef.current) return;
      LRef.current = L;

      const map = L.map(containerRef.current, {
        zoomControl: false,
        attributionControl: false,
        minZoom: 4,
        maxZoom: 16,
      }).setView([50.8, 8.5], 6);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);

      L.control.zoom({ position: 'topright' }).addTo(map);
      mapRef.current = map;
      setMapReady(true);
    })();

    return () => {
      cancelled = true;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current.clear();
      routeLineRef.current?.remove();
      routeLineRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, []);

  // Sync truck markers
  useEffect(() => {
    const map = mapRef.current;
    const L = LRef.current;
    if (!map || !L || !mapReady) return;

    const seen = new Set<string>();
    trucks.forEach((t) => {
      seen.add(t.truckId);
      const color = STATUS_COLOR[t.status];
      const isSel = t.truckId === selectedTruckId;
      const html = truckIconHtml(color, isSel, t.licensePlate);
      const icon = L.divIcon({
        className: '',
        html,
        iconSize: [isSel ? 28 : 22, isSel ? 28 : 22],
        iconAnchor: [isSel ? 14 : 11, isSel ? 14 : 11],
      });

      const existing = markersRef.current.get(t.truckId);
      if (existing) {
        existing.setLatLng([t.lat, t.lng]);
        existing.setIcon(icon);
        existing.off('click');
        existing.on('click', () => onSelectRef.current(t.truckId));
      } else {
        const marker = L.marker([t.lat, t.lng], { icon, zIndexOffset: isSel ? 800 : 200 })
          .addTo(map)
          .bindTooltip(`${t.licensePlate} · ${t.driverName}`, {
            direction: 'top',
            offset: [0, -12],
            opacity: 0.95,
          });
        marker.on('click', () => onSelectRef.current(t.truckId));
        markersRef.current.set(t.truckId, marker);
      }
    });

    markersRef.current.forEach((m, id) => {
      if (!seen.has(id)) {
        m.remove();
        markersRef.current.delete(id);
      }
    });
  }, [trucks, selectedTruckId, mapReady]);

  // Selected route + focus
  useEffect(() => {
    const map = mapRef.current;
    const L = LRef.current;
    if (!map || !L || !mapReady) return;

    routeLineRef.current?.remove();
    routeLineRef.current = null;

    if (selectedRoute.length >= 2) {
      const line = L.polyline(selectedRoute, {
        color: '#00a3ff',
        weight: 5,
        opacity: 0.9,
        lineJoin: 'round',
      }).addTo(map);
      routeLineRef.current = line;
      try {
        map.fitBounds(line.getBounds().pad(0.18), { animate: true, maxZoom: 8 });
      } catch {
        /* ignore */
      }
    } else if (selected) {
      map.setView([selected.lat, selected.lng], 8, { animate: true });
    } else if (trucks.length > 0) {
      const bounds = L.latLngBounds(trucks.map((t: DispatchTruck) => [t.lat, t.lng]));
      try {
        map.fitBounds(bounds.pad(0.25), { animate: true, maxZoom: 7 });
      } catch {
        /* ignore */
      }
    }
  }, [selectedRoute, selected, trucks, mapReady]);

  return (
    <div
      className={`relative overflow-hidden rounded-[14px] border border-[var(--fr-border)] bg-[#050a0f] ${heightClass} ${className}`}
    >
      <div ref={containerRef} className="absolute inset-0 z-0" />
      <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
        {(
          [
            ['driving', 'Rijdend'],
            ['rest', 'Rust'],
            ['loading', 'Laden'],
            ['offline', 'Offline'],
          ] as const
        ).map(([k, label]) => (
          <span
            key={k}
            className="inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2 py-1 text-[10px] font-semibold text-[#e8eef7] backdrop-blur-sm"
          >
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: STATUS_COLOR[k] }}
            />
            {label}
          </span>
        ))}
      </div>
      {selected && (
        <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-10 sm:right-auto sm:max-w-sm">
          <div className="rounded-[12px] border border-[#00a3ff]/35 bg-black/70 px-3 py-2 backdrop-blur-md">
            <p className="fr-mono text-xs font-bold text-[#00a3ff]">{selected.licensePlate}</p>
            <p className="text-sm font-semibold text-[#f2f6fb] truncate">
              {selected.originHint} → {selected.destinationHint}
            </p>
            <p className="text-[11px] text-[#9aa8bc]">
              {selected.driverName} · {selected.locationLabel} · ETA {selected.etaLabel}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
