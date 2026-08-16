'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

function pinIcon(color: string, label?: string) {
  return L.divIcon({
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
}: {
  lat: number;
  lng: number;
  trafficJam?: boolean;
  route?: [number, number][];
  className?: string;
  heightClass?: string;
  statusLeft?: string;
  statusRight?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const truckMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

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

    // Leaflet needs a tick after layout
    requestAnimationFrame(() => map.invalidateSize());

    return () => {
      map.remove();
      mapRef.current = null;
      truckMarkerRef.current = null;
      routeLineRef.current = null;
    };
    // Init once — position/route updates handled below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    truckMarkerRef.current?.setLatLng([lat, lng]);
  }, [lat, lng]);

  useEffect(() => {
    const line = routeLineRef.current;
    if (!line) return;
    line.setStyle({ color: trafficJam ? '#ff9500' : '#00a3ff' });
  }, [trafficJam]);

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

  return (
    <div
      className={`relative w-full overflow-hidden border-b border-[#1e2a3a] ${heightClass} ${className}`}
    >
      <div ref={containerRef} className="absolute inset-0 z-0 bg-[#0b0e11]" />

      {/* Zoom + / − */}
      <div className="absolute top-3 right-3 z-[500] flex flex-col gap-1.5">
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
