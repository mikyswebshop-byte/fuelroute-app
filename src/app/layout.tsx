import type { Metadata } from 'next';
import { JetBrains_Mono, Sora } from 'next/font/google';
import { AppModeProvider } from '@/components/AppModeProvider';
import { BackToTop } from '@/components/BackToTop';
import { LanguageProvider } from '@/components/LanguageProvider';
import { LegalFooter } from '@/components/LegalFooter';
import { Navigation } from '@/components/Navigation';
import { QuickActionDrawer } from '@/components/QuickActionDrawer';
import { RoleProvider } from '@/components/RoleProvider';
import { TelemetryProvider } from '@/components/TelemetryProvider';
import './globals.css';

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  weight: ['400', '500', '600', '700', '800'],
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'FuelRoute | Fleet OS',
  description: 'FuelRoute / Fleet OS — multi-rol vlootplatform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl" className={`dark ${sora.variable} ${jetbrains.variable}`}>
      <body
        className={`${sora.className} relative min-h-screen flex flex-col antialiased`}
        style={{ background: 'var(--fr-bg)', color: 'var(--fr-text-muted)' }}
      >
        <AppModeProvider>
          <TelemetryProvider>
            <LanguageProvider>
              <RoleProvider>
                <Navigation />
                <div className="relative z-10 flex-1 py-6 pb-24 md:pb-6 pointer-events-auto">
                  {children}
                </div>
                <LegalFooter />
                <QuickActionDrawer />
                <BackToTop />
              </RoleProvider>
            </LanguageProvider>
          </TelemetryProvider>
        </AppModeProvider>
      </body>
    </html>
  );
}
