import React, { useEffect, useState } from 'react';
import type { Station, StationFilterState } from '../types';
import { StationCard } from './StationCard';
import { StationFilters } from './StationFilters';
import { tomtomService, type TomTomRouteResult } from '../lib/tomtomService';
import { tursoService } from '../lib/tursoClient';
import { useToast } from '../context/ToastContext';
import {
  Search,
  Crosshair,
  Zap,
  X,
  Navigation,
  BatteryCharging,
  Car,
  Compass,
} from 'lucide-react';

interface StationMapProps {
  onBookStation: (station: Station) => void;
  userEmail?: string;
  onRequireAuth: (reason: string, onAuthed?: () => void) => void;
}

export const StationMap: React.FC<StationMapProps> = ({
  onBookStation,
  userEmail,
  onRequireAuth,
}) => {
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('San Francisco');
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // TomTom Routing and Range State
  const [activeRoute, setActiveRoute] = useState<TomTomRouteResult | null>(null);
  const [calculatingRoute, setCalculatingRoute] = useState(false);
  const [batteryKwh, setBatteryKwh] = useState<number>(75);
  const [estimatedRangeKm, setEstimatedRangeKm] = useState<number>(390);

  const [filters, setFilters] = useState<StationFilterState>({
    searchQuery: '',
    minPowerKw: 0,
    connectorTypes: [],
    onlyAvailable: false,
    onlyEvoraHubs: false,
    sortBy: 'distance',
  });

  const { showToast } = useToast();

  // Load user favorites from Turso
  useEffect(() => {
    if (userEmail) {
      tursoService.getFavorites(userEmail).then(setFavorites);
    } else {
      setFavorites([]);
    }
  }, [userEmail]);

  // Fetch stations via TomTom EV API
  const fetchTomTomStations = async (query?: string, lat?: number, lon?: number) => {
    setLoading(true);
    try {
      const data = await tomtomService.searchEVStations(query, lat, lon);
      setStations(data);
      if (data.length > 0 && !selectedStation) {
        setSelectedStation(data[0]);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTomTomStations(searchQuery, userLocation?.lat, userLocation?.lng);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    fetchTomTomStations(searchQuery);
    showToast('TomTom EV Search', `Searching live EV charging hubs in ${searchQuery}...`, 'info');
  };

  // Locate user GPS
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation not supported', 'Please search for your city manually.', 'error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        fetchTomTomStations(undefined, latitude, longitude);
        showToast('Location Detected', 'Loaded nearest TomTom EV stations.', 'success');
      },
      () => {
        showToast('Location Access Denied', 'Please enter your city name.', 'info');
      }
    );
  };

  // TomTom Route Calculation for selected station
  const handleCalculateRoute = async (station: Station) => {
    if (!userEmail) {
      onRequireAuth(
        'Please sign in with Google to calculate real-time TomTom EV route and traffic delays.',
        () => handleCalculateRoute(station)
      );
      return;
    }

    setSelectedStation(station);
    setCalculatingRoute(true);

    const originLat = userLocation?.lat || 37.7749;
    const originLon = userLocation?.lng || -122.4194;

    const route = await tomtomService.calculateRoute(originLat, originLon, station.lat, station.lng);
    setActiveRoute(route);
    setCalculatingRoute(false);

    if (route) {
      showToast(
        'TomTom Route Calculated',
        `${Math.round((route.lengthInMeters / 1000) * 10) / 10} km • ~${Math.round(
          route.travelTimeInSeconds / 60
        )} mins travel time`,
        'success'
      );
    }
  };

  // Update Reachable Range on battery adjustment
  useEffect(() => {
    tomtomService.calculateReachableRange(37.7749, -122.4194, batteryKwh).then((range) => {
      if (range?.distanceInKm) {
        setEstimatedRangeKm(range.distanceInKm);
      }
    });
  }, [batteryKwh]);

  const handleBookTrigger = (station: Station) => {
    if (!userEmail) {
      onRequireAuth(
        'Please sign in with Google to reserve a fast-charging slot and receive your verified QR Pass.',
        () => onBookStation(station)
      );
    } else {
      onBookStation(station);
    }
  };

  const handleToggleFavorite = async (stationId: string) => {
    if (!userEmail) {
      onRequireAuth('Sign in with Google to save favorite stations to your cloud profile.');
      return;
    }
    const isFav = await tursoService.toggleFavorite(userEmail, stationId);
    setFavorites((prev) => (isFav ? [...prev, stationId] : prev.filter((id) => id !== stationId)));
    showToast(
      isFav ? 'Added to Favorites' : 'Removed from Favorites',
      undefined,
      isFav ? 'success' : 'info'
    );
  };

  // Filter stations locally
  const filteredStations = stations.filter((s) => {
    if (filters.minPowerKw > 0 && s.maxPowerKw < filters.minPowerKw) return false;
    if (filters.onlyAvailable && s.availablePorts === 0) return false;
    if (filters.onlyEvoraHubs && !s.isEvoraHub) return false;
    if (
      filters.connectorTypes.length > 0 &&
      !filters.connectorTypes.some((type) => s.connectors.includes(type))
    ) {
      return false;
    }
    return true;
  });

  return (
    <div id="station-map-explorer" className="w-full flex flex-col gap-8">
      {/* Top Search Bar with TomTom Status */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 flex items-center">
          <Search className="absolute left-4 w-4 h-4 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search city, destination, or corridor (e.g. San Francisco, Los Angeles, New York, London, Bengaluru)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-32 py-3.5 rounded-full bg-[#111111] border border-white/10 text-white placeholder:text-neutral-500 font-display text-xs tracking-wide outline-none focus:border-[#0052FF] transition-all shadow-lg"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-24 p-1 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={handleLocateMe}
            title="Locate near me"
            className="absolute right-2.5 flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#0052FF] hover:bg-[#0041CC] text-white font-display text-[10px] font-bold uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(0,82,255,0.4)] cursor-pointer"
          >
            <Crosshair className="w-3 h-3" /> Near Me
          </button>
        </form>

        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#111111] border border-white/10 text-neutral-300 text-xs font-mono shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>TomTom EV Live API Connected</span>
        </div>
      </div>

      {/* Filter Chips */}
      <StationFilters
        filters={filters}
        onChange={setFilters}
        totalCount={filteredStations.length}
      />

      {/* TomTom EV Explorer Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Station List (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <span className="font-display text-xs font-bold uppercase tracking-wider text-neutral-400">
              Charging Hubs Available ({filteredStations.length})
            </span>
            <span className="font-mono text-[11px] text-[#0052FF]">
              150kW - 350kW Ultra Speed
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-neutral-400 font-display text-xs gap-3 rounded-3xl bg-[#0E0E0E] border border-white/8">
              <Zap className="w-8 h-8 text-[#0052FF] animate-bounce" />
              <span>Querying TomTom EV Charging Stations API...</span>
            </div>
          ) : filteredStations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center text-neutral-400 rounded-3xl bg-[#0E0E0E] border border-white/8">
              <Zap className="w-12 h-12 text-neutral-700 mb-3" />
              <h5 className="font-display font-bold text-white text-base">No Stations Found</h5>
              <p className="text-xs text-neutral-500 max-w-xs mt-1">
                Try clearing your filters or searching for another city or corridor.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 max-h-[720px] overflow-y-auto custom-scroll pr-1">
              {filteredStations.map((station) => (
                <div key={station.id} className="relative">
                  <StationCard
                    station={station}
                    isSelected={selectedStation?.id === station.id}
                    isFavorite={favorites.includes(station.id)}
                    onSelect={(s) => {
                      setSelectedStation(s);
                      handleCalculateRoute(s);
                    }}
                    onBook={handleBookTrigger}
                    onToggleFavorite={handleToggleFavorite}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: TomTom EV Intelligence & Route Dashboard (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6 sticky top-28">
          {/* Selected Station Live Routing Card */}
          {selectedStation ? (
            <div className="p-6 rounded-3xl bg-[#0E0E12] border border-white/12 flex flex-col gap-5 shadow-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#0052FF]/20 border border-[#0052FF]/40 text-[#38aaff] text-[10px] font-display font-bold uppercase tracking-wider mb-2">
                    {selectedStation.isEvoraHub ? '⚡ Flagship Evora Superhub' : 'TomTom Verified Partner'}
                  </span>
                  <h4 className="font-display font-bold text-white text-lg">
                    {selectedStation.name}
                  </h4>
                  <p className="text-xs text-neutral-400 mt-0.5">{selectedStation.address}</p>
                </div>
                <span className="font-mono text-xs font-bold text-emerald-400 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  {selectedStation.availablePorts} Open
                </span>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/8 text-center font-mono">
                <div>
                  <div className="text-[10px] text-neutral-400 uppercase">Peak Power</div>
                  <div className="text-sm font-bold text-white">{selectedStation.maxPowerKw} kW</div>
                </div>
                <div>
                  <div className="text-[10px] text-neutral-400 uppercase">Pricing</div>
                  <div className="text-sm font-bold text-[#0052FF]">
                    {selectedStation.currency}{selectedStation.pricingPerKwh}/kWh
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-neutral-400 uppercase">Rating</div>
                  <div className="text-sm font-bold text-amber-400">★ {selectedStation.rating}</div>
                </div>
              </div>

              {/* TomTom Extended Route Details */}
              <div className="p-4 rounded-2xl bg-[#14141A] border border-white/8 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs font-display font-bold text-white">
                  <span className="flex items-center gap-1.5 text-[#38aaff]">
                    <Navigation className="w-3.5 h-3.5" /> TomTom Live Route & Traffic
                  </span>
                  {calculatingRoute ? (
                    <span className="text-neutral-400 text-[10px]">Calculating...</span>
                  ) : (
                    <span className="text-emerald-400 text-[10px] font-mono">Real-Time Traffic</span>
                  )}
                </div>

                {activeRoute ? (
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <div className="text-[10px] text-neutral-400">Distance</div>
                      <div className="font-bold text-white text-sm">
                        {Math.round((activeRoute.lengthInMeters / 1000) * 10) / 10} km
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <div className="text-[10px] text-neutral-400">Drive Time</div>
                      <div className="font-bold text-white text-sm">
                        ~{Math.round(activeRoute.travelTimeInSeconds / 60)} mins
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleCalculateRoute(selectedStation)}
                    className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-display text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Compass className="w-3.5 h-3.5 text-[#0052FF]" /> Calculate TomTom EV Route
                  </button>
                )}
              </div>

              {/* Action Reserve Button */}
              <button
                onClick={() => handleBookTrigger(selectedStation)}
                className="w-full py-3.5 rounded-2xl bg-[#0052FF] hover:bg-[#0041CC] text-white font-display font-bold text-xs uppercase tracking-widest transition-all shadow-[0_4px_20px_rgba(0,82,255,0.4)] flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Zap className="w-4 h-4" /> Reserve Charging Slot & Pass
              </button>
            </div>
          ) : null}

          {/* TomTom EV Reachable Range Estimator Card */}
          <div className="p-6 rounded-3xl bg-[#0E0E12] border border-white/12 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-display font-bold text-[#0052FF] uppercase tracking-wider">
              <Car className="w-4 h-4" /> TomTom Reachable Range Simulator
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Estimate your vehicle's single-charge range and radius across our high-power corridors.
            </p>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-400">Battery Pack Size</span>
                <span className="text-white font-bold">{batteryKwh} kWh</span>
              </div>
              <input
                type="range"
                min="40"
                max="120"
                step="5"
                value={batteryKwh}
                onChange={(e) => setBatteryKwh(Number(e.target.value))}
                className="w-full accent-[#0052FF] cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0052FF]/20 to-purple-600/20 border border-[#0052FF]/30 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-display font-semibold text-white">
                <BatteryCharging className="w-4 h-4 text-[#0052FF]" /> Estimated Highway Range
              </div>
              <span className="font-mono text-lg font-bold text-white">
                ~{estimatedRangeKm} <span className="text-xs font-normal text-neutral-400">km</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
