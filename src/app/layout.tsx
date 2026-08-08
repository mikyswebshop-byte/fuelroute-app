import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FuelRoute',
  description: 'Slimme routeplanner voor brandstofbesparing',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body className={`${inter.className} bg-slate-900 text-white min-h-screen flex flex-col`}>
        <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-black bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                FuelRoute
              </span>
              <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">
                v1.0
              </span>
            </Link>

            <nav className="flex gap-6 text-sm font-medium">
              <Link href="/" className="hover:text-blue-400 transition-colors">
                Tankstations
              </Link>
              <Link href="/planner" className="hover:text-blue-400 transition-colors">
                Routeplanner
              </Link>
              <Link href="/trucks" className="hover:text-blue-400 transition-colors">
                Voertuigen
              </Link>
            </nav>
          </div>
        </header>

        <div className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6">
          {children}
        </div>
      </body>
    </html>
  );
}