'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageProvider';
import { useRole } from '@/components/RoleProvider';
import { PERSONAS, personaById, type AppRole } from '@/lib/roles';

const LAST_HOME_KEY = 'fuelroute-last-home';

export default function PersonaLandingPage() {
  const router = useRouter();
  const { setRole, role, roleLabel, hydrated } = useRole();
  const { t } = useLanguage();

  const selectRole = (next: AppRole, home: string) => {
    setRole(next);
    try {
      localStorage.setItem(LAST_HOME_KEY, home);
    } catch {
      /* ignore */
    }
    router.push(`${home}?role=${next}`);
  };

  const continueSession = () => {
    if (!role) return;
    const persona = personaById(role);
    const home =
      (typeof window !== 'undefined' && localStorage.getItem(LAST_HOME_KEY)) ||
      persona?.home ||
      '/';
    router.push(`${home}?role=${role}`);
  };

  // Soft auto-continue only when already on / with a saved role — show banner instead of forcing
  useEffect(() => {
    if (!hydrated || !role) return;
    try {
      if (!localStorage.getItem(LAST_HOME_KEY) && personaById(role)?.home) {
        localStorage.setItem(LAST_HOME_KEY, personaById(role)!.home);
      }
    } catch {
      /* ignore */
    }
  }, [hydrated, role]);

  return (
    <main className="relative min-h-[calc(100vh-2rem)] flex items-center justify-center px-4 py-10 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: "url('/landing-fleet.jpg')" }}
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[#050a0f]/88 backdrop-blur-[2px] pointer-events-none"
        aria-hidden
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          background:
            'radial-gradient(ellipse at 30% 20%, rgba(0,163,255,0.28), transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(40,167,69,0.12), transparent 45%)',
        }}
        aria-hidden
      />

      <div className="relative z-20 pointer-events-auto fr-glass p-6 sm:p-8 shadow-2xl shadow-black/50 max-w-4xl w-full">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-[12px] bg-[#00a3ff] text-white font-black text-2xl mb-4 shadow-[0_0_28px_rgba(0,163,255,0.45)]">
            F
          </div>
          <h1 className="fr-display text-2xl sm:text-3xl tracking-tight">
            FuelRoute <span className="text-[#6b7a90] font-semibold">/</span> Fleet OS
          </h1>
          <p className="mt-2 text-sm text-[var(--fr-text-muted)]">{t('landing_subtitle')}</p>
          <p className="mt-1 text-[11px] text-[#6b7a90]">
            Geen wachtwoord — tik je rol. Bij verbroken verbinding: open de site opnieuw en tik
            Doorgaan.
          </p>
        </div>

        {hydrated && role && (
          <button
            type="button"
            onClick={continueSession}
            className="mb-6 w-full rounded-[14px] border border-[#28a745]/45 bg-[#28a745]/15 px-4 py-3.5 text-left touch-manipulation hover:bg-[#28a745]/25"
          >
            <p className="fr-label text-[#86efac]">Snel verder</p>
            <p className="text-base font-bold text-[#f2f6fb] mt-0.5">
              Doorgaan als {roleLabel ?? role}
            </p>
            <p className="text-[11px] text-[#9aa8bc] mt-1">
              Je rol stond nog opgeslagen — één tik, geen opnieuw kiezen.
            </p>
          </button>
        )}

        <div className="relative z-30 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PERSONAS.map((persona) => (
            <button
              key={persona.id}
              type="button"
              onClick={() => selectRole(persona.id, persona.home)}
              className={`relative z-40 pointer-events-auto touch-manipulation text-left rounded-[14px] border border-[#1e2a3a] bg-[#0b0e11]/70 p-4 transition hover:border-[#00a3ff]/50 hover:bg-[#0f1620] hover:shadow-[0_0_24px_rgba(0,163,255,0.12)] ${persona.accent}`}
            >
              <div className="flex items-start gap-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#151d2a] border border-[#1e2a3a] text-xl"
                  aria-hidden
                >
                  {persona.icon}
                </span>
                <div>
                  <p className="text-sm font-bold text-[#f2f6fb]">{persona.title}</p>
                  <p className="text-[11px] text-[#6b7a90] mt-1 leading-relaxed">{persona.scope}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <p className="mt-6 text-center text-[11px] text-[#6b7a90]">{t('landing_hint')}</p>
      </div>
    </main>
  );
}
