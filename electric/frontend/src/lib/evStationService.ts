import type { Station, StationFilterState } from '../types';

// Seeded Evora Premium Network Hubs
export const INITIAL_EVORA_STATIONS: Station[] = [
  {
    id: 'evora-sf-01',
    name: 'Evora SuperHub — Downtown San Francisco',
    operator: 'Evora Network',
    address: '450 Mission St, Financial District',
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    lat: 37.7909,
    lng: -122.3988,
    totalPorts: 12,
    availablePorts: 8,
    maxPowerKw: 350,
    connectors: ['CCS2', 'Tesla (NACS)', 'Type 2'],
    pricingPerKwh: 0.38,
    currency: '$',
    rating: 4.9,
    reviewsCount: 142,
    amenities: ['Ultra-Fast 350kW', 'Covered Canopy', '24/7 Security', 'Lounge & Coffee', 'Free Wi-Fi', 'Restrooms'],
    status: 'available',
    isEvoraHub: true,
    imageUrl: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'evora-la-01',
    name: 'Evora Oasis — Santa Monica Grand',
    operator: 'Evora Network',
    address: '1415 Ocean Ave',
    city: 'Santa Monica',
    state: 'CA',
    country: 'USA',
    lat: 34.0135,
    lng: -118.4952,
    totalPorts: 16,
    availablePorts: 11,
    maxPowerKw: 350,
    connectors: ['CCS2', 'Tesla (NACS)', 'CHAdeMO'],
    pricingPerKwh: 0.42,
    currency: '$',
    rating: 4.95,
    reviewsCount: 218,
    amenities: ['Liquid-Cooled 350kW', 'Solar Canopy', 'Organic Cafe', 'Valet Assist', 'Restrooms'],
    status: 'available',
    isEvoraHub: true,
    imageUrl: 'https://images.unsplash.com/photo-1558441719-75b281f68eb9?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'evora-ny-01',
    name: 'Evora Hub — Manhattan West Side',
    operator: 'Evora Network',
    address: '500 W 33rd St, Hudson Yards',
    city: 'New York',
    state: 'NY',
    country: 'USA',
    lat: 40.7538,
    lng: -74.0018,
    totalPorts: 14,
    availablePorts: 4,
    maxPowerKw: 250,
    connectors: ['CCS2', 'Tesla (NACS)', 'Type 2'],
    pricingPerKwh: 0.45,
    currency: '$',
    rating: 4.8,
    reviewsCount: 305,
    amenities: ['High-Power 250kW', 'Indoor Valet', 'Retail Center', 'Restrooms', 'Free Wi-Fi'],
    status: 'available',
    isEvoraHub: true,
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'evora-sea-01',
    name: 'Evora GreenWay — Seattle Center',
    operator: 'Evora Network',
    address: '305 Harrison St',
    city: 'Seattle',
    state: 'WA',
    country: 'USA',
    lat: 47.6219,
    lng: -122.3517,
    totalPorts: 8,
    availablePorts: 6,
    maxPowerKw: 150,
    connectors: ['CCS2', 'Type 2'],
    pricingPerKwh: 0.32,
    currency: '$',
    rating: 4.75,
    reviewsCount: 88,
    amenities: ['100% Hydro Powered', 'Covered Bays', 'Contactless Tap', 'Restrooms'],
    status: 'available',
    isEvoraHub: true,
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'evora-lon-01',
    name: 'Evora London Grid — King’s Cross',
    operator: 'Evora Network',
    address: 'Pancras Rd, Kings Cross',
    city: 'London',
    state: 'Greater London',
    country: 'UK',
    lat: 51.5314,
    lng: -0.1261,
    totalPorts: 10,
    availablePorts: 7,
    maxPowerKw: 350,
    connectors: ['CCS2', 'Type 2'],
    pricingPerKwh: 0.48,
    currency: '£',
    rating: 4.88,
    reviewsCount: 164,
    amenities: ['350kW CCS2', 'Underground Hub', 'EV Concierge', 'Coffee Bar', 'Wi-Fi'],
    status: 'available',
    isEvoraHub: true,
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'evora-ber-01',
    name: 'Evora E-Campus — Berlin Mitte',
    operator: 'Evora Network',
    address: 'Alexanderstraße 7',
    city: 'Berlin',
    state: 'Berlin',
    country: 'Germany',
    lat: 52.5219,
    lng: 13.4132,
    totalPorts: 12,
    availablePorts: 9,
    maxPowerKw: 300,
    connectors: ['CCS2', 'Type 2', 'CHAdeMO'],
    pricingPerKwh: 0.52,
    currency: '€',
    rating: 4.92,
    reviewsCount: 94,
    amenities: ['100% Wind Powered', 'Fast 300kW', 'Bistro', 'Air Pressure Station'],
    status: 'available',
    isEvoraHub: true,
    imageUrl: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'evora-blr-01',
    name: 'Evora ElectroPark — Indiranagar 100ft',
    operator: 'Evora Network',
    address: '100 Feet Rd, HAL 2nd Stage, Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    lat: 12.9719,
    lng: 77.6412,
    totalPorts: 10,
    availablePorts: 7,
    maxPowerKw: 150,
    connectors: ['CCS2', 'Type 2', 'GB/T'],
    pricingPerKwh: 18.5,
    currency: '₹',
    rating: 4.9,
    reviewsCount: 310,
    amenities: ['Liquid-Cooled 150kW', '24/7 Security Guard', 'Solar Rooftop', 'Cafe & Restroom', 'Wi-Fi'],
    status: 'available',
    isEvoraHub: true,
    imageUrl: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'evora-mum-01',
    name: 'Evora Coastal Supercharge — BKC Nexus',
    operator: 'Evora Network',
    address: 'G Block, Bandra Kurla Complex',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    lat: 19.0664,
    lng: 72.8687,
    totalPorts: 14,
    availablePorts: 5,
    maxPowerKw: 240,
    connectors: ['CCS2', 'Tesla (NACS)', 'GB/T'],
    pricingPerKwh: 21.0,
    currency: '₹',
    rating: 4.85,
    reviewsCount: 189,
    amenities: ['Fast DC 240kW', 'Covered Drive-thru', 'Food Court Nearby', 'Valet Parking'],
    status: 'available',
    isEvoraHub: true,
    imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'partner-01',
    name: 'Electrify Corridor — SFO Airport East',
    operator: 'Electrify America',
    address: 'North Access Rd, San Francisco Airport',
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    lat: 37.6213,
    lng: -122.3790,
    totalPorts: 8,
    availablePorts: 2,
    maxPowerKw: 150,
    connectors: ['CCS2', 'CHAdeMO'],
    pricingPerKwh: 0.44,
    currency: '$',
    rating: 4.4,
    reviewsCount: 92,
    amenities: ['Airport Corridor', '24/7 Access', 'Convenience Store'],
    status: 'busy',
    isEvoraHub: false,
  },
  {
    id: 'partner-02',
    name: 'ChargePoint Plaza — Santa Clara Tech Hub',
    operator: 'ChargePoint',
    address: '2800 Mission College Blvd',
    city: 'Santa Clara',
    state: 'CA',
    country: 'USA',
    lat: 37.3875,
    lng: -121.9754,
    totalPorts: 6,
    availablePorts: 0,
    maxPowerKw: 62.5,
    connectors: ['CCS2', 'Type 2'],
    pricingPerKwh: 0.35,
    currency: '$',
    rating: 4.2,
    reviewsCount: 45,
    amenities: ['Level 2 & DC Fast', 'Shopping Center'],
    status: 'offline',
    isEvoraHub: false,
  }
];

// Distance Calculation (Haversine in km)
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export const evStationService = {
  // Fetch stations with filtering and search
  async getStations(
    userLat?: number,
    userLng?: number,
    filters?: Partial<StationFilterState>
  ): Promise<Station[]> {
    let stations = [...INITIAL_EVORA_STATIONS];

    // Calculate distance if user coords provided
    if (userLat !== undefined && userLng !== undefined) {
      stations = stations.map((s) => ({
        ...s,
        distanceKm: calculateDistanceKm(userLat, userLng, s.lat, s.lng),
      }));
    }

    // Search query filter (city, name, address, operator)
    if (filters?.searchQuery?.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      stations = stations.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q) ||
          s.state.toLowerCase().includes(q) ||
          s.country.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q) ||
          s.operator.toLowerCase().includes(q)
      );
    }

    // Min Power kW filter
    if (filters?.minPowerKw && filters.minPowerKw > 0) {
      stations = stations.filter((s) => s.maxPowerKw >= filters.minPowerKw!);
    }

    // Connector types filter
    if (filters?.connectorTypes && filters.connectorTypes.length > 0) {
      stations = stations.filter((s) =>
        filters.connectorTypes!.some((type) => s.connectors.includes(type))
      );
    }

    // Only Available filter
    if (filters?.onlyAvailable) {
      stations = stations.filter((s) => s.availablePorts > 0 && s.status === 'available');
    }

    // Only Evora Hubs filter
    if (filters?.onlyEvoraHubs) {
      stations = stations.filter((s) => s.isEvoraHub);
    }

    // Sorting
    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case 'power':
          stations.sort((a, b) => b.maxPowerKw - a.maxPowerKw);
          break;
        case 'rating':
          stations.sort((a, b) => b.rating - a.rating);
          break;
        case 'price':
          stations.sort((a, b) => a.pricingPerKwh - b.pricingPerKwh);
          break;
        case 'distance':
        default:
          if (userLat !== undefined) {
            stations.sort((a, b) => (a.distanceKm || 99999) - (b.distanceKm || 99999));
          }
          break;
      }
    }

    return stations;
  },

  // Get single station by ID
  async getStationById(id: string): Promise<Station | null> {
    const station = INITIAL_EVORA_STATIONS.find((s) => s.id === id);
    return station || null;
  },
};
