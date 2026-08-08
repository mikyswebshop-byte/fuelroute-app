import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'FuelRoute | Fleet Management',
  description: 'Smart Route Planning & Dispatch',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body className="bg-slate-900 text-slate-200 min-h-screen flex">
        {/* Zijbalk Navigatie (Wordt verborgen bij printen) */}
        <aside className="w-64 bg-slate-950 border-r border-slate-800 hidden md:flex flex-col print:hidden">
          <div className="p-6 border-b border-slate-800">
            <h1 className="text-2xl font-black text-blue-500 tracking-tight">FUELROUTE<span className="text-slate-100">.</span></h1>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <Link href="/" className="block px-4 py-3 rounded-xl hover:bg-slate-800 transition font-medium text-sm">
              📊 Dashboard
            </Link>
            <Link href="/planner" className="block px-4 py-3 bg-blue-600/10 text-blue-400 rounded-xl hover:bg-blue-600/20 transition font-bold text-sm">
              🗺️ Routeplanner
            </Link>
            <Link href="/fleet" className="block px-4 py-3 rounded-xl hover:bg-slate-800 transition font-medium text-sm">
              🚛 Vlootbeheer
            </Link>
            <Link href="/settings" className="block px-4 py-3 rounded-xl hover:bg-slate-800 transition font-medium text-sm">
              ⚙️ Instellingen
            </Link>
          </nav>
          <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
            © 2026 FuelRoute V1.0
          </div>
        </aside>

        {/* Hoofdcontent */}
        <main className="flex-1 max-h-screen overflow-y-auto print:max-h-none print:overflow-visible">
          {children}
        </main>
      </body>
    </html>
  );
}