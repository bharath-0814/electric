export type ConnectorType = 'CCS2' | 'Type 2' | 'CHAdeMO' | 'Tesla (NACS)' | 'GB/T';

export type StationStatus = 'available' | 'busy' | 'offline';

export interface Station {
  id: string;
  name: string;
  operator: string;
  address: string;
  city: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
  totalPorts: number;
  availablePorts: number;
  maxPowerKw: number;
  connectors: ConnectorType[];
  pricingPerKwh: number;
  currency: string;
  rating: number;
  reviewsCount: number;
  amenities: string[];
  status: StationStatus;
  isEvoraHub: boolean;
  imageUrl?: string;
  distanceKm?: number;
}

export type ReservationStatus = 'confirmed' | 'active' | 'completed' | 'cancelled';

export interface Reservation {
  id: string;
  stationId: string;
  stationName: string;
  stationAddress: string;
  userEmail: string;
  userName: string;
  portNumber: number;
  connectorType: ConnectorType;
  powerKw: number;
  startTime: string; // ISO string
  durationMinutes: number;
  totalCost: number;
  status: ReservationStatus;
  qrCode: string;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  vehicleModel?: string;
  batteryCapacityKwh?: number;
  preferredConnector?: ConnectorType;
  savedStations: string[];
}

export interface StationFilterState {
  searchQuery: string;
  minPowerKw: number;
  connectorTypes: ConnectorType[];
  onlyAvailable: boolean;
  onlyEvoraHubs: boolean;
  sortBy: 'distance' | 'power' | 'rating' | 'price';
}
