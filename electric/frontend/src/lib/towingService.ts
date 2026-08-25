export interface TowingProvider {
  id: string;
  name: string;
  phone: string;
  rating: number;
  reviewsCount: number;
  distanceKm: number;
  etaMins: number;
  flatbedType: 'EV Certified Hydraulic Flatbed' | 'Heavy Duty EV Recovery' | 'Enclosed Luxury Transport';
  baseRate: number;
  currency: string;
  availableTrucks: number;
  coverageArea: string;
  lat: number;
  lng: number;
  features: string[];
}

export const SEEDED_TOWING_PROVIDERS: TowingProvider[] = [
  {
    id: 'tow-sf-01',
    name: 'Apex EV Heavy Flatbed Rescue',
    phone: '+1 (415) 890-4321',
    rating: 4.95,
    reviewsCount: 312,
    distanceKm: 2.1,
    etaMins: 8,
    flatbedType: 'EV Certified Hydraulic Flatbed',
    baseRate: 75,
    currency: '$',
    availableTrucks: 4,
    coverageArea: 'San Francisco & Bay Area Corridors',
    lat: 37.7845,
    lng: -122.4089,
    features: ['Zero-Wheel-Spin Dolly Rollers', 'Non-Regen Flatbed Lift', '12V Battery Jump Kit', 'Live GPS Tracking'],
  },
  {
    id: 'tow-sf-02',
    name: 'VoltCare Rapid EV Towing',
    phone: '+1 (415) 555-0199',
    rating: 4.88,
    reviewsCount: 184,
    distanceKm: 3.8,
    etaMins: 14,
    flatbedType: 'Heavy Duty EV Recovery',
    baseRate: 65,
    currency: '$',
    availableTrucks: 2,
    coverageArea: 'San Francisco Peninsula & SFO',
    lat: 37.7650,
    lng: -122.4200,
    features: ['Low-Clearance Ramp', 'On-Site Emergency 20kW Boost', 'Certified Tesla/Porsche Technicians'],
  },
  {
    id: 'tow-sf-03',
    name: 'Corridor EV Angel Transport',
    phone: '+1 (800) 444-EVOR',
    rating: 4.92,
    reviewsCount: 95,
    distanceKm: 5.4,
    etaMins: 18,
    flatbedType: 'Enclosed Luxury Transport',
    baseRate: 90,
    currency: '$',
    availableTrucks: 3,
    coverageArea: 'Greater Highway 101 & 280',
    lat: 37.7500,
    lng: -122.4100,
    features: ['All-Weather Enclosed Flatbed', 'Direct Tow to Evora SuperHub', 'Zero Damage Guarantee'],
  },
  {
    id: 'tow-ny-01',
    name: 'Manhattan Rapid EV Rescue',
    phone: '+1 (212) 555-8989',
    rating: 4.9,
    reviewsCount: 240,
    distanceKm: 1.8,
    etaMins: 9,
    flatbedType: 'EV Certified Hydraulic Flatbed',
    baseRate: 85,
    currency: '$',
    availableTrucks: 5,
    coverageArea: 'NYC Midtown & Hudson Yards',
    lat: 40.7580,
    lng: -73.9855,
    features: ['Zero-Wheel-Spin Dolly Rollers', 'Direct Port Rescue', '24/7 Dispatch'],
  },
  {
    id: 'tow-blr-01',
    name: 'ElectroRescue Bangalore Express',
    phone: '+91 98800 12345',
    rating: 4.94,
    reviewsCount: 420,
    distanceKm: 2.5,
    etaMins: 12,
    flatbedType: 'EV Certified Hydraulic Flatbed',
    baseRate: 1200,
    currency: '₹',
    availableTrucks: 6,
    coverageArea: 'Indiranagar, Koramangala, Whitefield',
    lat: 12.9750,
    lng: 77.6350,
    features: ['Hydraulic Flatbed Carrier', 'Emergency DC Mobile Boost', 'Authorized EV Partner'],
  }
];

export const towingService = {
  // Get nearby providers based on user coordinates
  getNearbyProviders(_userLat?: number, _userLng?: number, cityQuery?: string): TowingProvider[] {
    let list = [...SEEDED_TOWING_PROVIDERS];

    if (cityQuery && cityQuery.trim()) {
      const q = cityQuery.toLowerCase().trim();
      const filtered = list.filter(
        (p) =>
          p.coverageArea.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q)
      );
      if (filtered.length > 0) return filtered;
    }

    // Default to nearest
    return list;
  },

  // Simulate dispatch
  async dispatchTowTruck(providerId: string, _userLocation: { lat: number; lng: number; address: string }): Promise<{
    dispatchId: string;
    etaMinutes: number;
    driverName: string;
    truckPlate: string;
  }> {
    const provider = SEEDED_TOWING_PROVIDERS.find((p) => p.id === providerId) || SEEDED_TOWING_PROVIDERS[0];
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          dispatchId: `EVORA-TOW-${Math.floor(100000 + Math.random() * 900000)}`,
          etaMinutes: provider.etaMins,
          driverName: ['Marcus Vance', 'David Chen', 'Sarah Jenkins', 'Rajesh Kumar'][Math.floor(Math.random() * 4)],
          truckPlate: `EV-RESQ-${Math.floor(10 + Math.random() * 89)}`,
        });
      }, 1200);
    });
  }
};
