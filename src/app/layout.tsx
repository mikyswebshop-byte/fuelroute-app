import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AppModeProvider } from '@/components/AppModeProvider';
import { BackToTop } from '@/components/BackToTop';
import { LanguageProvider } from '@/components/LanguageProvider';
import { LegalFooter } from '@/components/LegalFooter';
import { Navigation } from '@/components/Navigation';
import { QuickActionDrawer } from '@/components/QuickActionDrawer';
import { RoleProvider } from '@/components/RoleProvider';
import { TelemetryProvider } from '@/components/TelemetryProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

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
    <html lang="nl" className="dark">
      <body
        className={`${inter.className} relative min-h-screen flex flex-col antialiased`}
        style={{ background: '#0b0f19', color: '#cbd5e1' }}
      >
        <AppModeProvider>
          <TelemetryProvider>
            <LanguageProvider>
              <RoleProvider>
                <Navigation />
                {/* Main content sits above chrome; no full-screen blockers in the shell */}
                <div className="relative z-10 flex-1 py-6 pb-20 md:pb-6 pointer-events-auto">
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
