'use client';

import { useCallback } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { uiText, type UiKey } from '@/lib/ui-i18n';

/** Vertaling voor pagina-inhoud (planner, CMR, acties). */
export function useUi() {
  const { locale } = useLanguage();
  return useCallback((key: UiKey) => uiText(locale, key), [locale]);
}
