export default function FleetPage() {
    const trucks = [
      { id: '45-BJK-8', merk: 'DAF XF 480', tank: 600, verbruik: '28.5L/100km', status: 'Beschikbaar' },
      { id: '12-34-AB', merk: 'Volvo FH 500', tank: 750, verbruik: '29.0L/100km', status: 'Onderweg' },
      { id: '99-XYZ-1', merk: 'Scania R500', tank: 800, verbruik: '27.8L/100km', status: 'Onderhoud' },
    ];
  
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Vlootbeheer</h1>
            <p className="text-slate-400 mt-1">Beheer voertuigspecificaties voor nauwkeurige routeberekeningen.</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition">
            + Nieuw Voertuig
          </button>
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trucks.map((truck) => (
            <div key={truck.id} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex flex-col justify-between h-48">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-white">{truck.merk}</h3>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide ${
                    truck.status === 'Beschikbaar' ? 'bg-emerald-500/20 text-emerald-400' :
                    truck.status === 'Onderweg' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {truck.status}
                  </span>
                </div>
                <p className="text-slate-400 font-mono text-sm">{truck.id}</p>
              </div>
              
              <div className="pt-4 border-t border-slate-700 flex justify-between text-sm">
                <span className="text-slate-300">⛽ {truck.tank} Liter</span>
                <span className="text-slate-300">📊 {truck.verbruik}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }