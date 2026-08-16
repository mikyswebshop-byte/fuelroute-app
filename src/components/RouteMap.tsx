'use client';

import { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap, Marker, Polyline } from 'leaflet';
import type { TruckAlert } from '@/lib/in-app-nav';
import type { TruckProfile } from '@/lib/truck-profile';

/** Kassel → München corridor (A7-achtig) with recognizable places. */
export const DEFAULT_ROUTE: [number, number][] = [
  [51.3127, 9.4797],
  [51.275, 9.534],
  [50.555, 9.68],
  [49.7913, 9.9534],
  [49.4521, 11.0767],
  [48.4011, 11.7775],
  [48.1351, 11.582],
];

const LANDMARKS: { name: string; lat: number; lng: number; kind: 'hub' | 'stop' | 'city' }[] = [
  { name: 'Kassel Hub', lat: 51.3127, lng: 9.4797, kind: 'hub' },
  { name: 'Autohof Lohfelden', lat: 51.275, lng: 9.534, kind: 'stop' },
  { name: 'Fulda', lat: 50.555, lng: 9.68, kind: 'city' },
  { name: 'Würzburg', lat: 49.7913, lng: 9.9534, kind: 'city' },
  { name: 'Nürnberg', lat: 49.4521, lng: 11.0767, kind: 'city' },
  { name: 'München Distribution', lat: 48.1351, lng: 11.582, kind: 'hub' },
];

export type RoadSignHud = {
  heightM: number;
  bridgeTonnageT: number;
  inclinePct: number;
  noOvertake: boolean;
  speedLimitKmh: number;
  toll: boolean;
  border: boolean;
};

export function buildRoadSignHud(
  profile: TruckProfile,
  alerts: TruckAlert[],
  trafficJam: boolean
): RoadSignHud {
  const hasBorder = alerts.some((a) => a.kind === 'border');
  const hasToll = alerts.some((a) => a.kind === 'toll');
  return {
    heightM: profile.heightM,
    bridgeTonnageT: Math.min(profile.grossWeightT, 40),
    inclinePct: trafficJam ? 0 : 3,
    noOvertake: profile.grossWeightT >= 7.5,
    speedLimitKmh: profile.grossWeightT > 12 ? 80 : 90,
    toll: hasToll,
    border: hasBorder,
  };
}

export function RouteMap({
  lat,
  lng,
  trafficJam = false,
  route = DEFAULT_ROUTE,
  className = '',
  heightClass = 'h-[42vh] min-h-[240px] max-h-[480px]',
  navigating = false,
  guidance,
  speedKmh = 0,
  etaLabel,
  destinationLabel,
  signs,
  onStopNav,
}: {
  lat: number;
  lng: number;
  trafficJam?: boolean;
  route?: [number, number][];
  className?: string;
  heightClass?: string;
  navigating?: boolean;
  guidance?: string;
  speedKmh?: number;
  etaLabel?: string;
  destinationLabel?: string;
  signs?: RoadSignHud | null;
  onStopNav?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const truckMarkerRef = useRef<Marker | null>(null);
  const routeLineRef = useRef<Polyline | null>(null);
  const [zoom, setZoom] = useState(8);
  const userZoomRef = useRef(false);

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
        attributionControl: false,
        minZoom: 5,
        maxZoom: 18,
      }).setView([lat, lng], navigating ? 13 : 8);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);

      const routeColor = trafficJam ? '#ff9500' : '#00a3ff';
      const line = L.polyline(route, {
        color: routeColor,
        weight: 6,
        opacity: 0.95,
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
        .bindPopup('Positie');

      if (!navigating) {
        map.fitBounds(line.getBounds(), { padding: [28, 28], maxZoom: 9 });
      }

      map.on('zoomend', () => setZoom(map.getZoom()));
      map.on('zoomstart', () => {
        userZoomRef.current = true;
      });

      mapRef.current = map;
      truckMarkerRef.current = truck;
      routeLineRef.current = line;
      setZoom(map.getZoom());
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

  // Follow truck while navigating — zoom in like TomTom, not whole-Europe fitBounds
  useEffect(() => {
    const map = mapRef.current;
    truckMarkerRef.current?.setLatLng([lat, lng]);
    if (!map || !navigating) return;
    const targetZoom = speedKmh > 50 ? 13 : speedKmh > 20 ? 14 : 15;
    if (!userZoomRef.current) {
      map.setView([lat, lng], targetZoom, { animate: true });
      setZoom(targetZoom);
    } else {
      map.panTo([lat, lng], { animate: true });
    }
  }, [lat, lng, navigating, speedKmh]);

  useEffect(() => {
    if (navigating) {
      userZoomRef.current = false;
    }
  }, [navigating]);

  useEffect(() => {
    const line = routeLineRef.current;
    const map = mapRef.current;
    if (!line || !map) return;
    line.setLatLngs(route);
    line.setStyle({ color: trafficJam ? '#ff9500' : navigating ? '#28a745' : '#00a3ff' });
    if (!navigating) {
      try {
        map.fitBounds(line.getBounds(), { padding: [36, 36], maxZoom: 10 });
      } catch {
        /* empty */
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
  }, [navigating]);

  const setZoomLevel = (z: number) => {
    const map = mapRef.current;
    if (!map) return;
    userZoomRef.current = true;
    const next = Math.min(18, Math.max(5, z));
    map.setZoom(next);
    setZoom(next);
  };

  const fitRoute = () => {
    const map = mapRef.current;
    const line = routeLineRef.current;
    if (!map || !line) return;
    userZoomRef.current = true;
    map.fitBounds(line.getBounds(), { padding: [36, 36], maxZoom: 10 });
  };

  const centerTruck = () => {
    userZoomRef.current = false;
    mapRef.current?.setView([lat, lng], Math.max(mapRef.current.getZoom(), 13), {
      animate: true,
    });
  };

  return (
    <div className={`relative w-full overflow-hidden ${heightClass} ${className}`}>
      <div ref={containerRef} className="absolute inset-0 z-0 bg-[#0b0e11]" />

      {/* TomTom-style speed + speed limit */}
      <div className="absolute bottom-3 left-3 z-[500] flex items-end gap-2 pointer-events-none">
        <div className="flex flex-col items-center justify-center w-[4.5rem] h-[4.5rem] rounded-full bg-white text-[#0b0e11] shadow-xl border-[3px] border-[#0b0e11]">
          <span className="fr-mono text-2xl font-black leading-none tabular-nums">
            {Math.round(speedKmh)}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-wide opacity-70">km/h</span>
        </div>
        {signs ? (
          <div className="flex flex-col items-center justify-center w-12 h-12 rounded-full bg-white border-[3px] border-[#ff3b30] shadow-lg">
            <span className="fr-mono text-sm font-black text-[#0b0e11] leading-none">
              {signs.speedLimitKmh}
            </span>
          </div>
        ) : null}
      </div>

      {/* Verkeersborden / truck info — één oogopslag */}
      {signs && (
        <div className="absolute top-2 left-2 z-[500] flex flex-wrap gap-1.5 max-w-[70%] pointer-events-none">
          <RoadSign kind="height" value={`${signs.heightM.toFixed(1)} m`} />
          <RoadSign kind="weight" value={`${signs.bridgeTonnageT} t`} />
          <RoadSign kind="incline" value={`${signs.inclinePct}%`} />
          {signs.noOvertake ? <RoadSign kind="noOvertake" value="Inhaalverbod" /> : null}
          {signs.toll ? <RoadSign kind="toll" value="Maut" /> : null}
          {signs.border ? <RoadSign kind="border" value="Grens" /> : null}
          {trafficJam ? <RoadSign kind="jam" value="File" /> : null}
        </div>
      )}

      {/* Transparante zoom-rail rechts */}
      <div className="absolute top-2 right-1.5 z-[500] flex flex-col items-center gap-1">
        {navigating && onStopNav ? (
          <button
            type="button"
            onClick={onStopNav}
            className="h-10 px-2.5 rounded-lg text-[10px] font-bold text-white bg-[#ff3b30]/85 backdrop-blur-sm touch-manipulation"
          >
            Stop
          </button>
        ) : null}
        <div className="flex flex-col items-center rounded-full bg-white/25 backdrop-blur-md border border-white/40 shadow-md py-1 px-0.5">
          <button
            type="button"
            onClick={() => setZoomLevel(zoom + 1)}
            className="w-10 h-10 text-xl font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] touch-manipulation"
            aria-label="Inzoomen"
          >
            +
          </button>
          <input
            type="range"
            min={5}
            max={18}
            step={1}
            value={zoom}
            onChange={(e) => setZoomLevel(Number(e.target.value))}
            className="h-24 w-8 accent-white [writing-mode:vertical-lr] direction-rtl touch-manipulation opacity-90"
            aria-label="Zoom"
          />
          <button
            type="button"
            onClick={() => setZoomLevel(zoom - 1)}
            className="w-10 h-10 text-xl font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] touch-manipulation"
            aria-label="Uitzoomen"
          >
            −
          </button>
        </div>
        <button
          type="button"
          onClick={fitRoute}
          className="w-10 h-10 rounded-full bg-white/25 backdrop-blur-md border border-white/40 text-white text-xs font-bold drop-shadow touch-manipulation"
          aria-label="Hele route"
          title="Hele route"
        >
          ⧉
        </button>
        <button
          type="button"
          onClick={centerTruck}
          className="w-10 h-10 rounded-full bg-[#00a3ff]/35 backdrop-blur-md border border-white/50 text-white text-sm font-bold touch-manipulation"
          aria-label="Centreer"
          title="Mijn positie"
        >
          ◎
        </button>
      </div>

      {/* Mini-instructie onderaan kaart (geen zwarte overlay-balk) */}
      {navigating && guidance ? (
        <div className="absolute bottom-3 right-14 left-[7.5rem] z-[500] pointer-events-none">
          <p className="text-[13px] font-bold text-white leading-snug drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] line-clamp-2">
            {guidance}
          </p>
          <p className="text-[10px] font-semibold text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] mt-0.5 truncate">
            {etaLabel ? `ETA ${etaLabel}` : ''}
            {destinationLabel ? ` · ${destinationLabel}` : ''}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function RoadSign({
  kind,
  value,
}: {
  kind: 'height' | 'weight' | 'incline' | 'noOvertake' | 'toll' | 'border' | 'jam';
  value: string;
}) {
  if (kind === 'height') {
    return (
      <div
        className="flex flex-col items-center justify-center min-w-[2.75rem] h-11 px-1 rounded-md bg-white border-2 border-[#0b0e11] shadow"
        title="Doorrijhoogte voertuig"
      >
        <span className="text-[8px] font-bold text-[#0b0e11] leading-none">↕</span>
        <span className="fr-mono text-[11px] font-black text-[#0b0e11] leading-none">{value}</span>
      </div>
    );
  }
  if (kind === 'weight') {
    return (
      <div
        className="flex flex-col items-center justify-center min-w-[2.75rem] h-11 px-1 rounded-md bg-white border-2 border-[#0b0e11] shadow"
        title="Brug / tonnage"
      >
        <span className="text-[8px] font-bold text-[#0b0e11] leading-none">t</span>
        <span className="fr-mono text-[11px] font-black text-[#0b0e11] leading-none">{value}</span>
      </div>
    );
  }
  if (kind === 'incline') {
    return (
      <div
        className="flex flex-col items-center justify-center min-w-[2.75rem] h-11 px-1 rounded-md bg-white border-2 border-[#0b0e11] shadow"
        title="Helling"
      >
        <span className="text-[8px] font-bold text-[#0b0e11] leading-none">↗</span>
        <span className="fr-mono text-[11px] font-black text-[#0b0e11] leading-none">{value}</span>
      </div>
    );
  }
  if (kind === 'noOvertake') {
    return (
      <div
        className="flex items-center justify-center w-11 h-11 rounded-full bg-white border-[3px] border-[#ff3b30] shadow"
        title="Inhaalverbod trucks"
      >
        <span className="text-[9px] font-black text-[#ff3b30] leading-none text-center px-0.5">
          🚛🚫
        </span>
      </div>
    );
  }
  if (kind === 'jam') {
    return (
      <div className="h-11 px-2 rounded-md bg-[#ff9500] text-[#1a0f00] text-[10px] font-black flex items-center shadow">
        FILE
      </div>
    );
  }
  return (
    <div className="h-11 px-2 rounded-md bg-[#0b0e11]/75 backdrop-blur border border-white/30 text-white text-[10px] font-bold flex items-center shadow">
      {value}
    </div>
  );
}
