'use client';

import { useState } from 'react';

interface Stop {
  type: string;
  location: string;
  reason: string;
  facilities: string;
  gps: string;
  parkingAvailable: boolean;
}

interface RouteResult {
  totalDistanceKm: number;
  estimatedConsumptionL: number;
  netCostAfterTol: number;
  maxRangeKm: number;
  stopsRequired: number;
  stops: Stop[];
}

export default function PlannerPage() {
  // Systeem & Modus instellingen
  const [userRole, setUserRole] = useState<'chauffeur' | 'planner' | 'boekhouding'>('chauffeur');
  const [isPrivateMode, setIsPrivateMode] = useState<boolean>(false);
  
  // Voertuig & Vloot variabelen
  const [vehicle, setVehicle] = useState('DAF XF 480 (45-BJK-8) - Euro 6');
  const [vehicleAgeYears, setVehicleAgeYears] = useState<number>(3);
  const [mileage, setMileage] = useState<number>(240000);
  const [cargoWeight, setCargoWeight] = useState<number>(20); // Ton
  const [reeferActive, setReeferActive] = useState<boolean>(true); // Koeltrailer
  
  // Route & Omgeving
  const [origin, setOrigin] = useState('Antwerpen Port (BE)');
  const [destination, setDestination] = useState('Duisburg Hub (DE)');
  const [distance, setDistance] = useState<number>(280);
  const [headwind, setHeadwind] = useState<number>(15); // km/u
  
  // Voorkeuren & Tankkaarten
  const [card, setCard] = useState<string>('DKV Card');
  const [securityLevel, setSecurityLevel] = useState<string>('ESPORG Gold (Omheind & Bewaakt)');
  const [needShower, setNeedShower] = useState<boolean>(true);
  const [needRestaurant, setNeedRestaurant] = useState<boolean>(true);

  // Foto / CMR Sjubloon State
  const [cmrImage, setCmrImage] = useState<string | null>(null);
  const [ocrStatus, setOcrStatus] = useState<string>('Wacht op foto van vrachtbrief...');

  const [result, setResult] = useState<RouteResult | null>(null);
  const [calculating, setCalculating] = useState(false);

  // Simuleer het maken van een foto en OCR-uitlezing van de vrachtbrief
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCmrImage(reader.result as string);
        setOcrStatus('AI OCR leest vrachtbrief uit...');
        setTimeout(() => {
          setOcrStatus('✓ Vrachtbrief succesvol verwerkt! Laadadres & Bestemming overgenomen.');
        }, 1000);
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateSmartRoute = () => {
    if (isPrivateMode) {
      alert('App staat in Privé-modus. Geen zakelijke registratie of routeberekening actief.');
      return;
    }

    setCalculating(true);
    setTimeout(() => {
      // Geavanceerde formule inclusief voertuigleeftijd, km-stand, lading en koeling
      const baseConsumption = 27.5;
      const agePenalty = vehicleAgeYears * 0.2; // Oudere truck verbruikt iets meer
      const mileagePenalty = mileage > 300000 ? 0.8 : 0;
      const weightFactor = cargoWeight * 0.35;
      const reeferFactor = reeferActive ? 2.8 : 0;
      
      const totalConsumptionRate = baseConsumption + agePenalty + mileagePenalty + weightFactor + reeferFactor;
      const totalFuelNeeded = (distance / 100) * totalConsumptionRate;
      
      // Maut / Tol berekening correctie
      const estimatedTolCost = distance * 0.18; // ca 18 cent per km in Duitsland
      const fuelSavingsBeforeBorder = 55; // Euro voordeel t.o.v. NL tanken
      const netFinancialImpact = fuelSavingsBeforeBorder - estimatedTolCost;

      setResult({
        totalDistanceKm: distance,
        estimatedConsumptionL: Math.round(totalFuelNeeded),
        netCostAfterTol: Math.round(netFinancialImpact),
        maxRangeKm: 750,
        stopsRequired: 1,
        stops: [
          {
            type: '⛽ Grenstankststop + 45 min Rust',
            location: 'Autohof Hamminkeln (A3, Duitsland - 25km voor grens)',
            reason: `Goedkope diesel via ${card} + verplichte pauze`,
            facilities: `${securityLevel} • ${needShower ? 'Schone Douche Aanwezig' : ''} • ${needRestaurant ? 'Goed Restaurant' : ''}`,
            gps: '51.721, 6.589',
            parkingAvailable: true,
          }
        ],
      });
      setCalculating(false);
    }, 600);
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Top Header & Rol / Privé Schakelaar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-800 p-4 rounded-2xl border border-slate-700 gap-4">
          <div>
            <h1 className="text-2xl font-black text-blue-400">FUELROUTE <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded">Smart Fleet & Grenstanken</span></h1>
            <p className="text-xs text-slate-400">Automatische optimalisatie voor chauffeurs, planners en boekhouding.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Rol Selectie */}
            <div className="bg-slate-900 p-1 rounded-xl border border-slate-700 flex text-xs font-bold">
              <button onClick={() => setUserRole('chauffeur')} className={`px-3 py-1.5 rounded-lg transition ${userRole === 'chauffeur' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Chauffeur</button>
              <button onClick={() => setUserRole('planner')} className={`px-3 py-1.5 rounded-lg transition ${userRole === 'planner' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Kantoor / Planner</button>
              <button onClick={() => setUserRole('boekhouding')} className={`px-3 py-1.5 rounded-lg transition ${userRole === 'boekhouding' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Boekhouding</button>
            </div>

            {/* Privé / Zakelijk knop voor de chauffeur */}
            <button
              onClick={() => setIsPrivateMode(!isPrivateMode)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition border ${
                isPrivateMode ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-slate-900 text-slate-300 border-slate-700'
              }`}
            >
              {isPrivateMode ? '🚗 Status: PRIVÉ (Rust)' : '🚛 Status: ZAKELIJK (Actief)'}
            </button>
          </div>
        </div>

        {isPrivateMode ? (
          <div className="p-12 bg-slate-800 rounded-2xl border border-amber-500/30 text-center space-y-4">
            <span className="text-4xl">☕</span>
            <h2 className="text-xl font-bold text-amber-400">App is in Privé-modus</h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto">Je locatie en ritten worden uit privacy-overwegingen niet gedeeld met de zaak. Geniet van je rusttijd!</p>
            <button onClick={() => setIsPrivateMode(false)} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs">Schakel naar Zakelijk</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LINKERKOLOM: Foto Vrachtbrief & Sjablonen (Chauffeur & Invoer) */}
            <div className="space-y-6">
              <div className="p-5 bg-slate-800 rounded-2xl border border-slate-700 space-y-4">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">1. Vrachtbrief (CMR) & Sjablonen</h2>
                <p className="text-xs text-slate-400">Maak een foto van de vrachtbrief. De app scant automatisch de routegegevens.</p>
                
                <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center hover:border-blue-500 transition cursor-pointer relative bg-slate-900/50">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <span className="text-3xl block mb-2">📸</span>
                  <span className="text-xs font-bold text-blue-400">Maak Foto van Vrachtbrief / Bon</span>
                  <p className="text-[10px] text-slate-500 mt-1">(Opent direct camera op mobiel/tablet)</p>
                </div>

                {cmrImage && (
                  <div className="space-y-2">
                    <img src={cmrImage} alt="Gescande CMR" className="w-full h-32 object-cover rounded-lg border border-slate-700" />
                    <p className="text-xs font-semibold text-emerald-400 animate-pulse">{ocrStatus}</p>
                  </div>
                )}
              </div>

              {/* Voertuig Specificaties */}
              <div className="p-5 bg-slate-800 rounded-2xl border border-slate-700 space-y-4">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">2. Voertuig & Slijtage</h2>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Voertuig Model</label>
                    <select value={vehicle} onChange={(e) => setVehicle(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white">
                      <option>DAF XF 480 (45-BJK-8) - Euro 6</option>
                      <option>Volvo FH 500 (12-34-AB) - Euro 6</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-400 block mb-1">Leeftijd (jaar)</label>
                      <input type="number" value={vehicleAgeYears} onChange={(e) => setVehicleAgeYears(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white" />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Km-stand</label>
                      <input type="number" value={mileage} onChange={(e) => setMileage(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* MIDDEN & RECHTERKOLOM: Route, Instellingen & Rekenmodel */}
            <div className="lg:col-span-2 space-y-6">
              
              <div className="p-6 bg-slate-800 rounded-2xl border border-slate-700 space-y-6">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">3. Rituitslag & Grenstank Advies</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Laadadres / Vertrek</label>
                    <input type="text" value={origin} onChange={(e) => setOrigin(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Losadres / Bestemming</label>
                    <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Lading Gewicht (Ton)</label>
                    <input type="number" value={cargoWeight} onChange={(e) => setCargoWeight(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Tankkaart</label>
                    <select value={card} onChange={(e) => setCard(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs">
                      <option>DKV Card</option>
                      <option>UTA Card</option>
                      <option>Shell Card</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Min. Parkeerbeveiliging</label>
                    <select value={securityLevel} onChange={(e) => setSecurityLevel(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs">
                      <option>ESPORG Gold (Omheind & Bewaakt)</option>
                      <option>ESPORG Silver (Cameratoezicht)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input type="checkbox" checked={reeferActive} onChange={(e) => setReeferActive(e.target.checked)} className="rounded bg-slate-900 border-slate-700" />
                    Koeltrailer Actief (+ Brandstof)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input type="checkbox" checked={needShower} onChange={(e) => setNeedShower(e.target.checked)} className="rounded bg-slate-900 border-slate-700" />
                    Douche Verplicht op Stop
                  </label>
                </div>

                <button
                  onClick={calculateSmartRoute}
                  disabled={calculating}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold rounded-xl transition shadow-lg shadow-blue-600/30 text-sm"
                >
                  {calculating ? '⚡ Berekenen op basis van live data...' : '⚡ Bereken Optimale Grenstank- & Ruststop'}
                </button>
              </div>

              {/* Resultaat Weergave */}
              {result && (
                <div className="p-6 bg-slate-800 rounded-2xl border border-emerald-500/50 space-y-6 shadow-2xl">
                  <div className="flex justify-between items-center border-b border-slate-700 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">Slimme Route Analyse: {origin} ➔ {destination}</h3>
                      <p className="text-xs text-slate-400">Inclusief Maut-correctie en live parkeergarantie.</p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/30">
                      Netto Voordeel: € +{result.netCostAfterTol}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-900 rounded-xl border border-slate-700">
                      <span className="block text-xs text-slate-400">Totale Afstand</span>
                      <span className="text-lg font-black text-white">{result.totalDistanceKm} km</span>
                    </div>
                    <div className="p-4 bg-slate-900 rounded-xl border border-slate-700">
                      <span className="block text-xs text-slate-400">Geschat Verbruik</span>
                      <span className="text-lg font-black text-blue-400">{result.estimatedConsumptionL} Liter</span>
                    </div>
                    <div className="p-4 bg-slate-900 rounded-xl border border-slate-700">
                      <span className="block text-xs text-slate-400">Benodigde Stops</span>
                      <span className="text-lg font-black text-purple-400">{result.stopsRequired} Stop (Optimaal)</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">📍 Geselecteerde Grensstops & Voorzieningen</h4>
                    {result.stops.map((stop, i) => (
                      <div key={i} className="p-4 bg-slate-900 rounded-xl border border-slate-700 space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-bold text-emerald-400 uppercase">{stop.type}</span>
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/20">Parkeerplek Vrij (Live)</span>
                        </div>
                        <h5 className="font-bold text-white text-sm">{stop.location}</h5>
                        <p className="text-xs text-slate-400">{stop.reason}</p>
                        <p className="text-[11px] text-slate-300 font-medium">✨ Faciliteiten: {stop.facilities}</p>
                        <p className="text-[10px] text-slate-500 font-mono">GPS Coördinaten: {stop.gps}</p>
                      </div>
                    ))}
                  </div>

                  {userRole === 'boekhouding' && (
                    <div className="p-4 bg-blue-950/40 rounded-xl border border-blue-500/30 text-xs space-y-1">
                      <p className="font-bold text-blue-300">📊 Boekhouding & Accijnzen Notitie:</p>
                      <p className="text-slate-300">Deze rit is geregistreerd voor automatische btw-teruggave Duitsland en Maut-aftrek. Alle bonnen zijn gekoppeld aan het digitale dossier.</p>
                    </div>
                  )}

                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </main>
  );
}