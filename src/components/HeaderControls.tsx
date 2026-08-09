'use client';

import { useAppMode } from '@/components/AppModeProvider';
import { useLanguage } from '@/components/LanguageProvider';

export function HeaderControls() {
  const { dutyMode, setDutyMode, gpsTrackingEnabled, offlineMode } = useAppMode();
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
      {offlineMode && (
        <span
          className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/40 max-w-[220px] leading-tight"
          title={t('offline_mode')}
        >
          {t('offline_mode')}
        </span>
      )}
      {!offlineMode && (
        <span
          className="hidden lg:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          title={t('obd_linked')}
        >
          {t('obd_linked')}
        </span>
      )}
      <button
        type="button"
        onClick={() => setDutyMode(dutyMode === 'dienst' ? 'prive' : 'dienst')}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold border-2 transition ${
          dutyMode === 'prive'
            ? 'bg-amber-600 text-white border-amber-400/50 shadow-lg shadow-amber-900/40'
            : 'bg-emerald-600 text-white border-emerald-400/40 shadow-lg shadow-emerald-900/40'
        }`}
        title={dutyMode === 'prive' ? t('private_mode') : t('duty_mode')}
      >
        {dutyMode === 'prive' ? t('private_mode') : t('duty_mode')}
      </button>
      <span
        className={`hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
          gpsTrackingEnabled
            ? 'bg-sky-500/10 text-[#38bdf8] border-sky-500/20'
            : 'bg-slate-700/60 text-slate-300 border-slate-600'
        }`}
      >
        {gpsTrackingEnabled ? t('gps_on') : t('gps_off')}
      </span>
    </div>
  );
}

