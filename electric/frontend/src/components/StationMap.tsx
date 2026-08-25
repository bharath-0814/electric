import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import './mapStyles.css';
import type { Station, StationFilterState } from '../types';
import { StationCard } from './StationCard';
import { StationFilters } from './StationFilters';
import { evStationService } from '../lib/evStationService';
import { tursoService } from '../lib/tursoClient';
import { useToast } from '../context/ToastContext';
import { Search, Crosshair, Map as MapIcon, List, Zap, X } from 'lucide-react';

interface StationMapProps {
  onBookStation: (station: Station) => void;
  userEmail?: string;
}

export const StationMap: React.FC<StationMapProps> = ({ onBookStation, userEmail }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'list'>('split');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<StationFilterState>({
    searchQuery: '',
    minPowerKw: 0,
    connectorTypes: [],
    onlyAvailable: false,
    onlyEvoraHubs: false,
    sortBy: 'distance',
  });

  const { showToast } = useToast();

  // Load user favorites
  useEffect(() => {
    tursoService.getFavorites(userEmail || '').then(setFavorites);
  }, [userEmail]);

  // Fetch stations when filters or user location change
  useEffect(() => {
    evStationService
      .getStations(userLocation?.lat, userLocation?.lng, { ...filters, searchQuery })
      .then((data) => {
        setStations(data);
      });
  }, [filters, searchQuery, userLocation]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center (San Francisco / Global Hub)
    const initialCenter: [number, number] = [37.7749, -122.4194];
    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 12,
      zoomControl: true,
    });

    // Dark Matter CartoDB Tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://carto.com/">CARTO</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers on the map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    // Render stations markers
    stations.forEach((station) => {
      const isSelected = selectedStation?.id === station.id;
      const customIcon = L.divIcon({
        className: 'custom-evora-icon',
        html: `
          <div class="evora-marker-pin ${station.isEvoraHub ? 'pulse' : ''}" style="${
          isSelected ? 'border-color: #fff; background: #0052FF; transform: scale(1.2);' : ''
        }">
            <span>⚡</span>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
        popupAnchor: [0, -20],
      });

      const marker = L.marker([station.lat, station.lng], { icon: customIcon });

      const popupContent = document.createElement('div');
      popupContent.className = 'p-4 flex flex-col gap-2.5 min-w-[240px]';
      popupContent.innerHTML = `
        <div class="flex items-center justify-between gap-2">
          <span class="text-[10px] font-bold uppercase tracking-wider text-[#0052FF] font-display">
            ${station.isEvoraHub ? '⚡ Evora Superhub' : station.operator}
          </span>
          <span class="text-[11px] font-bold text-white bg-[#0052FF] px-2 py-0.5 rounded font-display">
            ${station.maxPowerKw} kW
          </span>
        </div>
        <div class="font-display font-bold text-white text-sm">${station.name}</div>
        <div class="text-xs text-neutral-400 leading-snug">${station.address}</div>
        <div class="flex items-center justify-between pt-2 border-t border-white/10 text-xs font-display">
          <span class="text-emerald-400 font-medium">${station.availablePorts}/${station.totalPorts} Open</span>
          <span class="text-white font-bold">${station.currency}${station.pricingPerKwh}/kWh</span>
        </div>
        <button id="popup-book-btn-${station.id}" class="mt-1 w-full py-2 bg-[#0052FF] hover:bg-[#0041CC] text-white font-display text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-[0_4px_16px_rgba(0,82,255,0.4)] cursor-pointer">
          Reserve Slot
        </button>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        setSelectedStation(station);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`popup-book-btn-${station.id}`);
        if (btn) {
          btn.onclick = () => onBookStation(station);
        }
      });

      markersLayer.addLayer(marker);
    });

    // If there are stations, optionally fit bounds if search happened
    if (stations.length > 0 && searchQuery) {
      const bounds = L.latLngBounds(stations.map((s) => [s.lat, s.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [stations, selectedStation, searchQuery, onBookStation]);

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

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 13, { duration: 1.5 });

          if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng([latitude, longitude]);
          } else {
            const userIcon = L.divIcon({
              className: 'user-pin',
              html: `<div class="user-location-pin"></div>`,
              iconSize: [18, 18],
              iconAnchor: [9, 9],
            });
            userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon }).addTo(
              mapInstanceRef.current
            );
          }
        }
        showToast('Location Detected', 'Showing nearest EV charging hubs.', 'success');
      },
      () => {
        showToast('Location Access Denied', 'Please search your area in the search bar.', 'info');
      }
    );
  };

  const handleToggleFavorite = async (stationId: string) => {
    const isFav = await tursoService.toggleFavorite(userEmail || '', stationId);
    setFavorites((prev) => (isFav ? [...prev, stationId] : prev.filter((id) => id !== stationId)));
    showToast(
      isFav ? 'Added to Favorites' : 'Removed from Favorites',
      undefined,
      isFav ? 'success' : 'info'
    );
  };

  const handleSelectStation = (station: Station) => {
    setSelectedStation(station);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([station.lat, station.lng], 14, { duration: 1 });
    }
  };

  return (
    <div id="station-map-explorer" className="w-full flex flex-col gap-6">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search input with GPS button */}
        <div className="relative flex-1 flex items-center">
          <Search className="absolute left-4 w-4 h-4 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search city, neighborhood, or hub (e.g., San Francisco, London, Berlin, Indiranagar)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-24 py-3.5 rounded-full bg-[#111111] border border-white/10 text-white placeholder:text-neutral-500 font-display text-xs tracking-wide outline-none focus:border-[#0052FF] transition-all shadow-lg"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-12 p-1 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={handleLocateMe}
            title="Locate near me"
            className="absolute right-2.5 flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#0052FF] hover:bg-[#0041CC] text-white font-display text-[10px] font-bold uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(0,82,255,0.4)] cursor-pointer"
          >
            <Crosshair className="w-3 h-3" /> Near Me
          </button>
        </div>

        {/* View toggle tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#111111] border border-white/10 rounded-full shrink-0">
          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-display text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              viewMode === 'split'
                ? 'bg-[#0052FF] text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" /> Split
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-display text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              viewMode === 'map'
                ? 'bg-[#0052FF] text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Map View
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-display text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-[#0052FF] text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5" /> List ({stations.length})
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      <StationFilters
        filters={filters}
        onChange={setFilters}
        totalCount={stations.length}
      />

      {/* Main Container: Map and List */}
      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[640px] rounded-3xl overflow-hidden border border-white/10 bg-[#080808]">
        {/* Left Side: Station List (Hidden in 'map' mode) */}
        {(viewMode === 'split' || viewMode === 'list') && (
          <div
            className={`flex flex-col gap-4 p-5 overflow-y-auto max-h-[640px] custom-scroll ${
              viewMode === 'list' ? 'col-span-12' : 'lg:col-span-5 col-span-12'
            }`}
          >
            {stations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center text-neutral-400">
                <Zap className="w-10 h-10 text-neutral-600 mb-3" />
                <h5 className="font-display font-bold text-white text-base mb-1">
                  No Charging Stations Found
                </h5>
                <p className="text-xs text-neutral-500 max-w-xs">
                  Try adjusting your kW power or connector plug filters, or search for a different city.
                </p>
              </div>
            ) : (
              <div
                className={`grid gap-4 ${
                  viewMode === 'list'
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                    : 'grid-cols-1'
                }`}
              >
                {stations.map((station) => (
                  <StationCard
                    key={station.id}
                    station={station}
                    isSelected={selectedStation?.id === station.id}
                    isFavorite={favorites.includes(station.id)}
                    onSelect={handleSelectStation}
                    onBook={onBookStation}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Right Side: Map Canvas (Hidden in 'list' mode) */}
        {(viewMode === 'split' || viewMode === 'map') && (
          <div
            className={`relative w-full h-[640px] rounded-2xl overflow-hidden ${
              viewMode === 'map' ? 'col-span-12' : 'lg:col-span-7 col-span-12'
            }`}
          >
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Quick Map Floating Pill */}
            <div className="absolute top-4 left-4 z-999 pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0A0A0A]/90 backdrop-blur-md border border-white/10 text-white text-[11px] font-display font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#0052FF] animate-ping" />
              Live Evora Grid Network
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
