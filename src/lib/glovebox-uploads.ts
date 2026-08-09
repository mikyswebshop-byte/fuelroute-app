'use client';

import { useCallback, useEffect, useState } from 'react';

export type DocType =
  | 'Kentekenbewijs'
  | 'Verzekering'
  | 'APK'
  | 'NIWO'
  | 'ADR'
  | 'Overig';

export type UploadedGloveDoc = {
  id: string;
  plate: string;
  docType: DocType;
  expires: string;
  notes: string;
  fileName: string;
  createdAt: string;
};

const STORAGE_KEY = 'fuelroute-glovebox-uploads';
const EMPTY_UPLOADS: UploadedGloveDoc[] = [];
const listeners = new Set<() => void>();

let memoryCache: UploadedGloveDoc[] = EMPTY_UPLOADS;
let memoryRaw: string | null | undefined = undefined;

function emit() {
  listeners.forEach((l) => l());
}

function readCached(): UploadedGloveDoc[] {
  if (typeof window === 'undefined') return EMPTY_UPLOADS;
  let raw: string | null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return memoryCache;
  }
  if (raw === memoryRaw) return memoryCache;
  memoryRaw = raw;
  if (!raw) {
    memoryCache = EMPTY_UPLOADS;
    return memoryCache;
  }
  try {
    const parsed = JSON.parse(raw) as UploadedGloveDoc[];
    memoryCache = Array.isArray(parsed) ? parsed : EMPTY_UPLOADS;
  } catch {
    memoryCache = EMPTY_UPLOADS;
  }
  return memoryCache;
}

function write(docs: UploadedGloveDoc[]) {
  const raw = JSON.stringify(docs);
  try {
    localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    /* ignore */
  }
  memoryRaw = raw;
  memoryCache = docs;
  emit();
}

export function getGloveboxUploads(): UploadedGloveDoc[] {
  return readCached();
}

export function addGloveboxUpload(
  doc: Omit<UploadedGloveDoc, 'id' | 'createdAt'>
): UploadedGloveDoc {
  const next: UploadedGloveDoc = {
    ...doc,
    id: `up-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  write([next, ...readCached()]);
  return next;
}

export function subscribeGloveboxUploads(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Stable subscribe/store hook — avoids useSyncExternalStore getSnapshot identity loops. */
export function useGloveboxUploads(): UploadedGloveDoc[] {
  const [docs, setDocs] = useState<UploadedGloveDoc[]>(EMPTY_UPLOADS);

  const refresh = useCallback(() => {
    setDocs(readCached());
  }, []);

  useEffect(() => {
    refresh();
    return subscribeGloveboxUploads(refresh);
  }, [refresh]);

  return docs;
}

/** Simulated OCR from filename / mime cues. */
export function simulateOcr(file: File): {
  docType: DocType;
  expires: string;
  notes: string;
  plateHint?: string;
} {
  const name = file.name.toLowerCase();
  let docType: DocType = 'Overig';
  if (/apk|keuring/.test(name)) docType = 'APK';
  else if (/niwo|euroverg|vergunning/.test(name)) docType = 'NIWO';
  else if (/adr|gevaar/.test(name)) docType = 'ADR';
  else if (/verzek|polis|groene|insurance/.test(name)) docType = 'Verzekering';
  else if (/kenteken|rdw|registration|deel/.test(name)) docType = 'Kentekenbewijs';
  else if (file.type.includes('pdf')) docType = 'Verzekering';
  else if (file.type.startsWith('image/')) docType = 'Kentekenbewijs';

  const base = new Date();
  base.setMonth(base.getMonth() + (docType === 'APK' ? 10 : 18));
  const expires = base.toISOString().slice(0, 10);

  const notesByType: Record<DocType, string> = {
    Kentekenbewijs: 'OCR: RDW-controle herkend',
    Verzekering: 'Polisnr: VP-OCR-' + String(Math.floor(100000 + Math.random() * 899999)),
    APK: 'OCR: keuringsstation herkend',
    NIWO: 'Licentienr: EU-OCR-' + String(Math.floor(100000 + Math.random() * 899999)),
    ADR: 'OCR: ADR-instructiekaart',
    Overig: 'Handmatig controleren aanbevolen',
  };

  const plateMatch = file.name.match(/(\d{1,2}-[A-Z]{2,3}-\d{1,2}|[A-Z0-9]{2}-\d{2}-[A-Z]{2})/i);

  return {
    docType,
    expires,
    notes: notesByType[docType],
    plateHint: plateMatch?.[1]?.toUpperCase(),
  };
}
