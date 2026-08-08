// 1. Voertuig & Verbruik (De Truck)
export interface Truck {
    id: string;
    license_plate: string;
    model: string;
    year?: number;
    mileage?: number;
    
    // Brandstof & Tank
    fuel_type: 'Diesel' | 'HVO100' | 'LNG';
    euro_norm: 'Euro 5' | 'Euro 6' | 'Zero Emission';
    tank_capacity_liters: number;
    secondary_tank_liters: number;
    current_fuel_pct: number; // bijv. 75%
    min_reserve_pct: number; // bijv. 10%
  
    // Gewicht & Opbouw
    empty_weight_ton: number;
    cargo_weight_ton: number;
    has_cooling: boolean;
    has_crane_or_lift: boolean;
  
    // Verbruik & Chauffeur
    avg_consumption: number; // L / 100km
    driver_foot_factor: number; // 1.0 = normaal, 1.15 = aggresief (+15%)
  }
  
  // 2. Omgeving (Route, Terrein & Weer)
  export interface EnvironmentConditions {
    elevation_gain_m: number;
    is_city_route: boolean;
    headwind_kmh: number;
    temperature_celsius: number;
    traffic_delay_minutes: number;
  }
  
  // 3. Tankstations
  export interface Station {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    clearance_height_m: number;
    has_high_flow_pump: boolean;
    has_adblue: boolean;
    accepted_cards: string[];
    diesel_price_eur: number;
    is_operational: boolean;
  }
  
  // 4. Parkeren & Faciliteiten
  export interface ParkingArea {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    total_spots: number;
    occupied_spots: number;
    esporg_security_level: 'None' | 'Bronze' | 'Silver' | 'Gold';
    has_showers: boolean;
    has_restaurant: boolean;
  }
  
  // 5. Chauffeur & Tachograaf (De Wet)
  export interface DriverTachograph {
    continuous_driving_minutes: number; // Max 270 (4.5 uur)
    daily_driving_minutes: number; // Max 540 (9 uur)
    required_rest_break_minutes: number; // 45 min
  }
  
  // Het Algoritme: De Dynamische Buffer Berekening
  export function calculateEffectiveRange(truck: Truck, env: EnvironmentConditions): number {
    const totalTankLiters = truck.tank_capacity_liters + truck.secondary_tank_liters;
    const usableLiters = totalTankLiters * ((truck.current_fuel_pct - truck.min_reserve_pct) / 100);
  
    // Basissnelheid verbruik
    let calculatedConsumption = truck.avg_consumption * truck.driver_foot_factor;
  
    // Gewichtscorrectie: +1.5% verbruik per ton lading boven leeggewicht
    calculatedConsumption += truck.cargo_weight_ton * 0.45;
  
    // Koeling / Opbouw toeslag
    if (truck.has_cooling) calculatedConsumption += 2.5; // +2.5L/100km
  
    // Omgevingsfactoren (Wind & File)
    if (env.headwind_kmh > 20) calculatedConsumption *= 1.10; // +10% bij tegenwind
    if (env.traffic_delay_minutes > 30) calculatedConsumption *= 1.08; // +8% bij file
  
    // Bereken maximale veilige actieradius in kilometers
    return Math.max(0, (usableLiters / calculatedConsumption) * 100);
  }