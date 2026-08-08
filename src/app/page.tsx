export default function DashboardPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Overzicht</h1>
        <p className="text-slate-400 mt-1">Welkom terug. Hier is de actuele status van je vloot.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Actieve Routes</h3>
          <span className="text-4xl font-black text-emerald-400">14</span>
        </div>
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Brandstof Bespaard (Mnd)</h3>
          <span className="text-4xl font-black text-blue-400">1,240 L</span>
        </div>
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Alerts & Meldingen</h3>
          <span className="text-4xl font-black text-amber-400">2</span>
        </div>
      </div>

      {/* Recente Activiteit */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-lg overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-lg font-bold text-white">Recente Dispatches</h2>
        </div>
        <div className="p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/50 text-slate-400">
              <tr>
                <th className="p-4 font-semibold">Voertuig</th>
                <th className="p-4 font-semibold">Traject</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              <tr>
                <td className="p-4 text-white">DAF XF 480 (45-BJK-8)</td>
                <td className="p-4 text-slate-300">Rotterdam ➔ München</td>
                <td className="p-4"><span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-md text-xs font-bold">Onderweg</span></td>
              </tr>
              <tr>
                <td className="p-4 text-white">Volvo FH 500 (12-34-AB)</td>
                <td className="p-4 text-slate-300">Antwerpen ➔ Parijs</td>
                <td className="p-4"><span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-md text-xs font-bold">Gepland</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}