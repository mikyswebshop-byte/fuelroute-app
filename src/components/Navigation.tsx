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
      <header className="sticky top-0 z-50 border-b border-[#1e2a3a] bg-[#0b0e11]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 min-h-14 py-2 flex items-center justify-between gap-3">
          <Link
            href={role ? items[0]?.href ?? '/dashboard' : '/'}
            className="flex items-center gap-2.5 shrink-0"
          >
            <div className="w-8 h-8 rounded-[10px] bg-[#00a3ff] flex items-center justify-center font-black text-white text-lg shadow-[0_0_20px_rgba(0,163,255,0.4)]">
              F
            </div>
            <span className="font-bold text-lg tracking-tight text-[#f2f6fb]">
              Fuel<span className="text-[#00a3ff]">Route</span>
            </span>
            {isChauffeur && (
              <span className="hidden sm:inline fr-chip text-[10px] border-[#28a745]/30 bg-[#28a745]/10 text-[#86efac]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#28a745]" />
                {isDriving ? 'Drive Mode' : 'Cockpit'}
              </span>
            )}
          </Link>

          {!isDriving && (
            <nav className="hidden xl:flex items-center gap-0.5 overflow-x-auto">
              {items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                      active
                        ? 'bg-[#00a3ff]/15 text-[#7dd3fc] border border-[#00a3ff]/35'
                        : 'text-[#9aa8bc] border border-transparent hover:text-[#f2f6fb] hover:bg-[#151d2a]'
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
              <div className="hidden md:flex items-center rounded-lg border border-[#1e2a3a] overflow-hidden bg-[#050a0f]">
                <button
                  type="button"
                  onClick={goDriver}
                  className={`px-2.5 py-1.5 text-[10px] font-bold transition ${
                    role === 'chauffeur'
                      ? 'bg-[#28a745] text-white'
                      : 'text-[#9aa8bc] hover:bg-[#151d2a]'
                  }`}
                >
                  {t('role_driver_short')}
                </button>
                <button
                  type="button"
                  onClick={goPlanner}
                  className={`px-2.5 py-1.5 text-[10px] font-bold transition ${
                    role === 'planner'
                      ? 'bg-[#00a3ff] text-white'
                      : 'text-[#9aa8bc] hover:bg-[#151d2a]'
                  }`}
                >
                  {t('role_planner_short')}
                </button>
              </div>
            )}
            {hydrated && roleLabel && !isDriving && (
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="fr-chip text-[#c5d0e0]">{t('role_label')}: {roleLabel}</span>
                <button
                  type="button"
                  onClick={switchRole}
                  className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-[10px] font-semibold bg-[#151d2a] text-[#7dd3fc] border border-[#00a3ff]/30 hover:bg-[#1a2433]"
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
        <div className="xl:hidden border-b border-[#1e2a3a] px-2 py-2 flex overflow-x-auto gap-2 bg-[#0b0e11]">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                  active
                    ? 'bg-[#00a3ff]/20 text-[#7dd3fc] border border-[#00a3ff]/40'
                    : 'bg-[#050a0f] text-[#9aa8bc] border border-[#1e2a3a]'
                }`}
              >
                {labelFor(item.href, item.label)}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={switchRole}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap bg-[#151d2a] text-[#7dd3fc] border border-[#00a3ff]/30"
          >
            {t('switch_role_short')}
          </button>
        </div>
      )}
    </>
  );
}
