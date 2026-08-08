import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FuelRoute - Slimme Routeplanner',
  description: 'Routeplanning en brandstofbeheer voor transport',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body className="bg-slate-900 text-slate-100 min-h-screen flex flex-col">
        {/* Navigatiebalk */}
        <header className="border-b border-slate-800 bg-slate-950 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-blue-400 tracking-tight">FuelRoute</span>
            <span className="text-xs px-2 py-0.5 bg-blue-950 text-blue-400 border border-blue-800 rounded font-mono">
              v1.0
            </span>
          </div>
          <nav className="flex gap-6 text-sm font-medium text-slate-300">
            <span className="text-blue-400 font-semibold border-b-2 border-blue-400 pb-1 cursor-pointer">
              Tankstations
            </span>
            <span className="text-slate-400 hover:text-white cursor-pointer transition">
              Routeplanner
            </span>
            <span className="text-slate-400 hover:text-white cursor-pointer transition">
              Voertuigen
            </span>
            <span className="text-slate-400 hover:text-white cursor-pointer transition">
              Facturen
            </span>
          </nav>
        </header>

        {/* Hoofdinhoud van de pagina */}
        <div className="flex-1">
          {children}
        </div>
      </body>
    </html>
  );
}