'use client';

import { useEffect, useRef } from 'react';
import type { Map as LeafletMap, Marker, Polyline } from 'leaflet';
import type { TruckAlert } from '@/lib/in-app-nav';

/** Kassel → München corridor (A7-achtig) with recognizable places. */
export const DEFAULT_ROUTE: [number, number][] = [
  [51.3127, 9.4797], // Kassel Hub
  [51.275, 9.534], // Autohof Lohfelden
  [50.555, 9.68], // Fulda
  [49.7913, 9.9534], // Würzburg
  [49.4521, 11.0767], // Nürnberg
  [48.4011, 11.7775], // Flughafen München / Allershausen
  [48.1351, 11.582], // München Distribution
];

const LANDMARKS: { name: string; lat: number; lng: number; kind: 'hub' | 'stop' | 'city' }[] = [
  { name: 'Kassel Hub', lat: 51.3127, lng: 9.4797, kind: 'hub' },
  { name: 'Autohof Lohfelden', lat: 51.275, lng: 9.534, kind: 'stop' },
  { name: 'Fulda', lat: 50.555, lng: 9.68, kind: 'city' },
  { name: 'Würzburg', lat: 49.7913, lng: 9.9534, kind: 'city' },
  { name: 'Nürnberg', lat: 49.4521, lng: 11.0767, kind: 'city' },
  { name: 'München Distribution', lat: 48.1351, lng: 11.582, kind: 'hub' },
];

function severityClass(s: TruckAlert['severity']) {
  if (s === 'critical') return 'border-[#ff3b30]/50 bg-[#2a0a08] text-[#ff8a82]';
  if (s === 'warn') return 'border-[#ff9500]/45 bg-[#1a1008] text-[#ffd9a8]';
  return 'border-[#1e2a3a] bg-black/70 text-[#c5d0e0]';
}

export function RouteMap({
  lat,
  lng,
  trafficJam = false,
  route = DEFAULT_ROUTE,
  className = '',
  heightClass = 'h-[42vh] min-h-[240px] max-h-[480px]',
  statusLeft,
  statusRight,
  navigating = false,
  guidance,
  vehicleSummary,
  truckAlerts = [],
  onStopNav,
}: {
  lat: number;
  lng: number;
  trafficJam?: boolean;
  route?: [number, number][];
  className?: string;
  heightClass?: string;
  statusLeft?: string;
  statusRight?: string;
  navigating?: boolean;
  guidance?: string;
  vehicleSummary?: string;
  truckAlerts?: TruckAlert[];
  onStopNav?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const truckMarkerRef = useRef<Marker | null>(null);
  const routeLineRef = useRef<Polyline | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;

    void (async () => {
      const L = (await import('leaflet')).default;
      if (cancelled || !containerRef.current || mapRef.current) return;

      const pinIcon = (color: string, label?: string) =>
        L.divIcon({
          className: '',
          html: `<div style="
            width:22px;height:22px;border-radius:50%;
            background:${color};border:3px solid #fff;
            box-shadow:0 0 12px ${color}aa;
            display:flex;align-items:center;justify-content:center;
            font:700 9px/1 Sora,sans-serif;color:#fff;
          ">${label ?? ''}</div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

      const map = L.map(containerRef.current, {
        zoomControl: false,
        attributionControl: true,
        minZoom: 5,
        maxZoom: 18,
      }).setView([lat, lng], 8);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);

      const routeColor = trafficJam ? '#ff9500' : '#00a3ff';
      const line = L.polyline(route, {
        color: routeColor,
        weight: 5,
        opacity: 0.92,
        lineJoin: 'round',
      }).addTo(map);

      LANDMARKS.forEach((lm) => {
        const color =
          lm.kind === 'hub' ? '#00a3ff' : lm.kind === 'stop' ? '#28a745' : '#9aa8bc';
        L.marker([lm.lat, lm.lng], { icon: pinIcon(color) })
          .addTo(map)
          .bindPopup(`<strong>${lm.name}</strong>`);
      });

      const truck = L.marker([lat, lng], { icon: pinIcon('#ff3b30', '•') })
        .addTo(map)
        .bindPopup('Huidige positie');

      map.fitBounds(line.getBounds(), { padding: [36, 36], maxZoom: 9 });

      mapRef.current = map;
      truckMarkerRef.current = truck;
      routeLineRef.current = line;

      requestAnimationFrame(() => map.invalidateSize());
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      truckMarkerRef.current = null;
      routeLineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    truckMarkerRef.current?.setLatLng([lat, lng]);
    if (navigating && mapRef.current) {
      mapRef.current.setView([lat, lng], Math.max(mapRef.current.getZoom(), 10), {
        animate: true,
      });
    }
  }, [lat, lng, navigating]);

  useEffect(() => {
    const line = routeLineRef.current;
    const map = mapRef.current;
    if (!line || !map) return;
    line.setLatLngs(route);
    line.setStyle({ color: trafficJam ? '#ff9500' : navigating ? '#28a745' : '#00a3ff' });
    if (navigating || route.length > 2) {
      try {
        map.fitBounds(line.getBounds(), { padding: [48, 48], maxZoom: navigating ? 9 : 10 });
      } catch {
        /* empty bounds */
      }
    }
  }, [route, trafficJam, navigating]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const onResize = () => map.invalidateSize();
    window.addEventListener('resize', onResize);
    const t = window.setTimeout(onResize, 200);
    return () => {
      window.removeEventListener('resize', onResize);
      window.clearTimeout(t);
    };
  }, []);

  const zoomBy = (delta: number) => {
    const map = mapRef.current;
    if (!map) return;
    map.setZoom(map.getZoom() + delta);
  };

  const fitRoute = () => {
    const map = mapRef.current;
    const line = routeLineRef.current;
    if (!map || !line) return;
    map.fitBounds(line.getBounds(), { padding: [36, 36], maxZoom: 10 });
  };

  const centerTruck = () => {
    mapRef.current?.setView([lat, lng], Math.max(mapRef.current.getZoom(), 11), {
      animate: true,
    });
  };

  const topAlerts = truckAlerts.filter((a) => a.severity === 'critical').slice(0, 1);

  return (
    <div
      className={`relative w-full overflow-hidden border-b border-[#1e2a3a] ${
        navigating ? 'h-[52vh] min-h-[280px] max-h-[560px]' : heightClass
      } ${className}`}
    >
      <div ref={containerRef} className="absolute inset-0 z-0 bg-[#0b0e11]" />

      {navigating && (
        <div className="absolute top-0 inset-x-0 z-[600] pointer-events-none">
          <div className="mx-2 mt-2 rounded-[12px] bg-[#0b0e11]/88 border border-[#00a3ff]/35 backdrop-blur px-3 py-2 shadow-lg max-w-[calc(100%-5.5rem)]">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#7dd3fc]">
              Trucknav · in app
            </p>
            <p className="text-sm sm:text-base font-black text-white leading-snug mt-0.5">
              {guidance}
            </p>
            {vehicleSummary ? (
              <p className="text-[10px] text-[#9aa8bc] mt-1 fr-mono truncate">{vehicleSummary}</p>
            ) : null}
          </div>
          {topAlerts[0] ? (
            <div
              className={`mx-2 mt-1.5 rounded-[10px] border px-2.5 py-1.5 backdrop-blur max-w-[calc(100%-5.5rem)] ${severityClass(topAlerts[0].severity)}`}
            >
              <p className="text-[11px] font-bold leading-tight">{topAlerts[0].title}</p>
            </div>
          ) : null}
        </div>
      )}

      <div className="absolute top-3 right-3 z-[500] flex flex-col gap-1.5">
        {navigating && onStopNav ? (
          <button
            type="button"
            onClick={onStopNav}
            className="h-11 px-3 rounded-[12px] bg-[#ff3b30] text-white text-xs font-bold shadow-lg"
          >
            Stop nav
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => zoomBy(1)}
          className="w-11 h-11 rounded-[12px] bg-[#0b0e11]/92 border border-[#1e2a3a] text-white text-2xl font-bold shadow-lg backdrop-blur hover:border-[#00a3ff]/50"
          aria-label="Inzoomen"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => zoomBy(-1)}
          className="w-11 h-11 rounded-[12px] bg-[#0b0e11]/92 border border-[#1e2a3a] text-white text-2xl font-bold shadow-lg backdrop-blur hover:border-[#00a3ff]/50"
          aria-label="Uitzoomen"
        >
          −
        </button>
        <button
          type="button"
          onClick={fitRoute}
          className="w-11 h-11 rounded-[12px] bg-[#0b0e11]/92 border border-[#1e2a3a] text-white text-xs font-bold shadow-lg backdrop-blur hover:border-[#00a3ff]/50"
          aria-label="Hele route"
          title="Hele route"
        >
          ⧉
        </button>
        <button
          type="button"
          onClick={centerTruck}
          className="w-11 h-11 rounded-[12px] bg-[#00a3ff]/20 border border-[#00a3ff]/40 text-[#7dd3fc] text-sm font-bold shadow-lg backdrop-blur"
          aria-label="Centreer op positie"
          title="Mijn positie"
        >
          ◎
        </button>
      </div>

      <div className="absolute bottom-3 left-3 z-[500] flex flex-col gap-1.5 max-w-[min(72%,280px)] pointer-events-none">
        {statusLeft ? (
          <span className="fr-chip fr-mono bg-black/70 backdrop-blur border-white/10 w-fit whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
            {statusLeft}
          </span>
        ) : null}
        {statusRight ? (
          <span className="fr-chip bg-black/70 backdrop-blur border-white/10 w-fit">
            {statusRight}
          </span>
        ) : null}
      </div>
    </div>
  );
}
