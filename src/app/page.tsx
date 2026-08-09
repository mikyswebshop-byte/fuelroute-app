'use client';

import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageProvider';
import { useRole } from '@/components/RoleProvider';
import { PERSONAS, type AppRole } from '@/lib/roles';

export default function PersonaLandingPage() {
  const router = useRouter();
  const { setRole } = useRole();
  const { t } = useLanguage();

  const selectRole = (role: AppRole, home: string) => {
    setRole(role);
    router.push(`${home}?role=${role}`);
  };

  return (
    <main className="relative min-h-[calc(100vh-2rem)] flex items-center justify-center px-4 py-10 overflow-hidden">
      {/* Decorative full-bleed background — must not capture touch */}
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: "url('/landing-fleet.jpg')" }}
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm pointer-events-none"
        aria-hidden
      />

      <div className="relative z-20 pointer-events-auto bg-slate-900/70 border border-slate-800 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-2xl max-w-4xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-sky-500 text-slate-950 font-black text-2xl mb-4">
            F
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-50 tracking-tight">
            FuelRoute / Fleet OS
          </h1>
          <p className="mt-2 text-sm text-slate-300">{t('landing_subtitle')}</p>
          <p className="mt-1 text-[11px] text-slate-500">{t('landing_no_pin')}</p>
        </div>

        <div className="relative z-30 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PERSONAS.map((persona) => (
            <button
              key={persona.id}
              type="button"
              onClick={() => selectRole(persona.id, persona.home)}
              className={`relative z-40 pointer-events-auto touch-manipulation text-left rounded-xl border bg-slate-950/50 p-4 transition shadow-sm ${persona.accent}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl" aria-hidden>
                  {persona.icon}
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-100">{persona.title}</p>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {persona.scope}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <p className="mt-6 text-center text-[11px] text-slate-500">{t('landing_hint')}</p>
      </div>
    </main>
  );
}
