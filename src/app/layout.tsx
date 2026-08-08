import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FuelRoute | Multi-Role Fleet Platform',
  description: 'FuelRoute Platform voor Chauffeurs, Planners en Boekhouders',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased`}>
        <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-xl">
                F
              </div>
              <span className="font-extrabold text-xl text-white">
                Fuel<span className="text-blue-500">Route</span>
              </span>
            </Link>

            {/* Navigatietabs voor alle rollen */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link href="/dashboard" className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition">
                👑 Eigenaar
              </Link>
              <Link href="/" className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition">
                🗺️ Planner
              </Link>
              <Link href="/driver" className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition">
                🚛 Chauffeur
              </Link>
              <Link href="/fleet" className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition">
                🚛 Vloot
              </Link>
              <Link href="/accounting" className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition">
                📊 Boekhouder
              </Link>
              <Link href="/compliance" className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition">
                📜 Compliance
              </Link>
              <Link href="/stations" className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition">
                ⛽ Stations
              </Link>
              <Link href="/community" className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition">
                💬 Community
              </Link>
            </nav>

            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Online
            </span>
          </div>
        </header>

        {/* Mobiele Snelle Navigatie Balk */}
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-2 py-2 flex overflow-x-auto gap-2">
          <Link href="/dashboard" className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-white whitespace-nowrap">👑 Eigenaar</Link>
          <Link href="/" className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-white whitespace-nowrap">🗺️ Planner</Link>
          <Link href="/driver" className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-white whitespace-nowrap">🚛 Chauffeur</Link>
          <Link href="/accounting" className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-white whitespace-nowrap">📊 Boekhouder</Link>
        </div>

        <div className="flex-1 py-6">{children}</div>
      </body>
    </html>
  );
}