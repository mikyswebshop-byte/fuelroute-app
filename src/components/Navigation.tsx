'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppMode } from '@/components/AppModeProvider';
import { HeaderControls } from '@/components/HeaderControls';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useLanguage } from '@/components/LanguageProvider';
import { useRole } from '@/components/RoleProvider';
import { NAV_HREF_KEYS } from '@/lib/i18n';
import { navForRole } from '@/lib/roles';

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { role, roleLabel, clearRole, setRole, hydrated } = useRole();
  const { t } = useLanguage();
  const { effectiveSpeedKmh, isStandstill } = useAppMode();
  const isLanding = pathname === '/';
  const items = navForRole(role);
  const isChauffeur = role === 'chauffeur';
  const isDriving = isChauffeur && !isStandstill && effectiveSpeedKmh > 10;

  if (isLanding) {
    return (
      <div className="fixed top-4 right-4 z-[60]">
        <LanguageSelector />
      </div>
    );
  }

  const switchRole = () => {
    clearRole();
    router.push('/');
  };

  const goDriver = () => {
    setRole('chauffeur');
    router.push('/driver');
  };

  const goPlanner = () => {
    setRole('planner');
    router.push('/planner');
  };

  const labelFor = (href: string, fallback: string) => {
    const key = NAV_HREF_KEYS[href];
    return key ? t(key) : fallback;
  };

  return (
    <>
      <header className="border-b border-slate-800 sticky top-0 z-50 bg-[#1e293b]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 min-h-16 py-2 flex items-center justify-between gap-3">
          <Link
            href={role ? items[0]?.href ?? '/dashboard' : '/'}
            className="flex items-center space-x-3 shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center font-black text-slate-950 text-xl">
              F
            </div>
            <span className="font-extrabold text-xl text-[#f8fafc]">
              Fuel<span className="text-[#38bdf8]">Route</span>
            </span>
            {isChauffeur && (
              <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/50 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                {isDriving ? 'Drive Mode' : 'Cockpit'}
              </span>
            )}
          </Link>

          {!isDriving && (
            <nav className="hidden xl:flex items-center space-x-1 overflow-x-auto">
              {items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-2.5 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                      active
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {labelFor(item.href, item.label)}
                  </Link>
                );
              })}
            </nav>
          )}

          <div className="flex items-center gap-2 shrink-0">
            {!isDriving && <LanguageSelector compact />}
            {!isDriving && hydrated && (
              <div className="hidden md:flex items-center rounded-lg border border-slate-700 overflow-hidden">
                <button
                  type="button"
                  onClick={goDriver}
                  className={`px-2.5 py-1 text-[10px] font-bold ${
                    role === 'chauffeur'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {t('role_driver_short')}
                </button>
                <button
                  type="button"
                  onClick={goPlanner}
                  className={`px-2.5 py-1 text-[10px] font-bold ${
                    role === 'planner'
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {t('role_planner_short')}
                </button>
              </div>
            )}
            {hydrated && roleLabel && !isDriving && (
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-800/80 text-slate-200 border border-slate-700/60">
                  {t('role_label')}: {roleLabel}
                </span>
                <button
                  type="button"
                  onClick={switchRole}
                  className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-medium bg-indigo-950/40 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-900/40"
                >
                  {t('switch_role')}
                </button>
              </div>
            )}
            {!isChauffeur && <HeaderControls />}
          </div>
        </div>
      </header>

      {!isDriving && (
        <div className="xl:hidden border-b border-slate-800 px-2 py-2 flex overflow-x-auto gap-2 bg-[#1e293b]">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                  active ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-200'
                }`}
              >
                {labelFor(item.href, item.label)}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={switchRole}
            className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap bg-indigo-950/50 text-indigo-300 border border-indigo-500/30"
          >
            {t('switch_role_short')}
          </button>
        </div>
      )}
    </>
  );
}
