import React, { useState, useEffect } from 'react';
import type { EvoraUser } from '../lib/firebase';
import { evStationService } from '../lib/evStationService';
import { towingService, type TowingProvider } from '../lib/towingService';
import type { Station } from '../types';
import { useToast } from '../context/ToastContext';
import {
  BatteryCharging,
  Zap,
  Truck,
  Car,
  MapPin,
  Compass,
  Phone,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  Sparkles,
  AlertTriangle,
  Crosshair,
} from 'lucide-react';

interface EVCarModel {
  name: string;
  batteryKwh: number;
  efficiencyMiKwh: number;
  defaultPlug: string;
}

const POPULAR_EV_MODELS: EVCarModel[] = [
  { name: 'Tesla Model 3 Long Range', batteryKwh: 78, efficiencyMiKwh: 4.1, defaultPlug: 'Tesla (NACS)' },
  { name: 'Tesla Model Y Performance', batteryKwh: 82, efficiencyMiKwh: 3.6, defaultPlug: 'Tesla (NACS)' },
  { name: 'Porsche Taycan 4S', batteryKwh: 93, efficiencyMiKwh: 3.1, defaultPlug: 'CCS2' },
  { name: 'Hyundai Ioniq 5 AWD', batteryKwh: 77, efficiencyMiKwh: 3.5, defaultPlug: 'CCS2' },
  { name: 'Mercedes-Benz EQS Sedan', batteryKwh: 108, efficiencyMiKwh: 3.4, defaultPlug: 'CCS2' },
  { name: 'Audi e-tron GT', batteryKwh: 93, efficiencyMiKwh: 3.0, defaultPlug: 'CCS2' },
  { name: 'BMW i4 M50', batteryKwh: 84, efficiencyMiKwh: 3.3, defaultPlug: 'CCS2' },
  { name: 'Ford Mustang Mach-E ER', batteryKwh: 91, efficiencyMiKwh: 3.2, defaultPlug: 'CCS2' },
];

interface HomeServiceHubProps {
  currentUser: EvoraUser | null;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
}

export const HomeServiceHub: React.FC<HomeServiceHubProps> = ({
  currentUser,
  onOpenAuth,
}) => {
  const [activeTab, setActiveTab] = useState<'battery' | 'towing'>('battery');

  // Service A: Battery & Range Map State
  const [selectedModel, setSelectedModel] = useState<string>(
    localStorage.getItem('evora_vehicle_model') || POPULAR_EV_MODELS[0].name
  );
  const [batteryPercent, setBatteryPercent] = useState<number>(65);
  const [customBatteryKwh, setCustomBatteryKwh] = useState<number>(78);
  const [searchLocation, setSearchLocation] = useState<string>('San Francisco');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({ lat: 37.7749, lng: -122.4194 });
  const [nearbyStations, setNearbyStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  // Service B: Towing Service State
  const [emergencyIssue, setEmergencyIssue] = useState<string>('0% Battery / Stranded');
  const [towingProviders, setTowingProviders] = useState<TowingProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<TowingProvider | null>(null);
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [activeDispatch, setActiveDispatch] = useState<{
    dispatchId: string;
    etaMinutes: number;
    driverName: string;
    truckPlate: string;
  } | null>(null);

  const { showToast } = useToast();

  // Find vehicle spec
  const currentVehicleSpec =
    POPULAR_EV_MODELS.find((m) => m.name === selectedModel) || {
      name: selectedModel,
      batteryKwh: customBatteryKwh,
      efficiencyMiKwh: 3.5,
      defaultPlug: 'CCS2',
    };

  // Compute remaining range & reach limit ("where he will reach until the last point")
  const usableKwh = (currentVehicleSpec.batteryKwh * batteryPercent) / 100;
  const maxReachMiles = Math.round(usableKwh * currentVehicleSpec.efficiencyMiKwh);
  const maxReachKm = Math.round(maxReachMiles * 1.60934);
  const safeBufferMiles = Math.max(10, Math.round(maxReachMiles * 0.15));

  // Load nearby stations based on location
  useEffect(() => {
    evStationService.getStations(userCoords.lat, userCoords.lng, { searchQuery: searchLocation }).then((list) => {
      setNearbyStations(list);
      if (list.length > 0) setSelectedStation(list[0]);
    });
  }, [userCoords, searchLocation]);

  // Load nearby towing providers
  useEffect(() => {
    const list = towingService.getNearbyProviders(userCoords.lat, userCoords.lng, searchLocation);
    setTowingProviders(list);
    if (list.length > 0) setSelectedProvider(list[0]);
  }, [userCoords, searchLocation]);

  // Auto-detect GPS location
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation not supported', 'Please enter your location manually.', 'info');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        setSearchLocation('My Current GPS Location');
        showToast('GPS Location Locked', 'Calculating live battery reach and nearby rescue providers.', 'success');
      },
      () => {
        showToast('Location Permission Denied', 'Using default city location.', 'info');
      }
    );
  };

  // Dispatch Tow Truck
  const handleRequestTow = async (provider: TowingProvider) => {
    if (!currentUser) {
      onOpenAuth();
      showToast('Sign In Required', 'Please sign in with Google to dispatch verified EV towing rescue.', 'info');
      return;
    }

    setIsDispatching(true);
    showToast('Dispatching EV Rescue Flatbed...', `Contacting ${provider.name}`, 'info');

    const result = await towingService.dispatchTowTruck(provider.id, {
      lat: userCoords.lat,
      lng: userCoords.lng,
      address: searchLocation,
    });

    setIsDispatching(false);
    setActiveDispatch(result);
    showToast('Tow Truck Dispatched!', `${result.driverName} is en route in ${result.truckPlate}.`, 'success');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-10 flex flex-col gap-8 text-white">
      
      {/* ══════════════ TOP SERVICE SELECTOR TAB BAR ══════════════ */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 rounded-3xl liquid-glass-surface">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#00FF9D] uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-[#00FF9D]" /> Evora Intelligent Driver Hub
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight">
            {activeTab === 'battery' ? 'Battery Range & Charging Station Reach' : 'Emergency EV Flatbed Towing Service'}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-xl">
            {activeTab === 'battery'
              ? 'Calculate your vehicle’s exact distance limit and map all reachable high-power charging hubs.'
              : 'Stranded or low on power? Connect instantly with verified EV-certified hydraulic flatbed towing.'}
          </p>
        </div>

        {/* Segmented Switcher Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/[0.05] border border-white/12 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('battery')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-display text-xs font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
              activeTab === 'battery'
                ? 'bg-gradient-to-r from-[#0052FF] to-[#00A3FF] text-white shadow-[0_0_20px_rgba(0,163,255,0.6)]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <BatteryCharging className="w-4 h-4" /> Battery & Stations Map
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('towing')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-display text-xs font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
              activeTab === 'towing'
                ? 'bg-gradient-to-r from-[#FF5E00] to-[#FF8C00] text-white shadow-[0_0_20px_rgba(255,94,0,0.6)]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Truck className="w-4 h-4" /> Towing Service
          </button>
        </div>
      </div>

      {/* ══════════════ TAB 1: BATTERY INFO & REACHABLE STATIONS MAP ══════════════ */}
      {activeTab === 'battery' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Vehicle & Battery Inputs (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Card 1: Vehicle Model & Battery Level Input */}
            <div className="p-7 rounded-3xl liquid-glass-surface flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="font-display font-bold text-xs uppercase tracking-wider text-white flex items-center gap-2">
                  <Car className="w-4 h-4 text-[#00FF9D]" /> 1. Vehicle Battery Telemetry
                </span>
                <span className="text-[11px] font-mono text-[#00F0FF] bg-[#00F0FF]/10 px-2.5 py-0.5 rounded-full border border-[#00F0FF]/25">
                  {currentVehicleSpec.batteryKwh} kWh Pack
                </span>
              </div>

              {/* Select Car Model */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-display font-semibold text-neutral-300 uppercase tracking-wider">
                  Car Model
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => {
                    setSelectedModel(e.target.value);
                    const found = POPULAR_EV_MODELS.find((m) => m.name === e.target.value);
                    if (found) setCustomBatteryKwh(found.batteryKwh);
                  }}
                  className="w-full h-13 px-4 rounded-2xl bg-[#12131F] border border-white/14 text-white text-xs sm:text-sm font-display outline-none focus:border-[#0052FF] transition-all cursor-pointer"
                >
                  {POPULAR_EV_MODELS.map((car) => (
                    <option key={car.name} value={car.name}>
                      {car.name} ({car.batteryKwh} kWh)
                    </option>
                  ))}
                </select>
              </div>

              {/* Current Battery Percentage Slider */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-display font-semibold text-neutral-300 uppercase tracking-wider">
                    Current Battery Percentage
                  </label>
                  <span className="font-mono text-lg font-bold text-[#00FF9D]">
                    {batteryPercent}% SoC
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={batteryPercent}
                    onChange={(e) => setBatteryPercent(Number(e.target.value))}
                    className="w-full h-2 rounded-full accent-[#00FF9D] cursor-pointer"
                  />
                </div>

                <div className="flex justify-between text-[11px] font-mono text-neutral-400">
                  <span>0% Empty</span>
                  <span>50%</span>
                  <span>100% Full</span>
                </div>
              </div>

              {/* Location Input & GPS Lock */}
              <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                <label className="text-xs font-display font-semibold text-neutral-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Your Current Location</span>
                  <button
                    type="button"
                    onClick={handleLocateMe}
                    className="text-[#00F0FF] hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    <Crosshair className="w-3 h-3" /> Auto Detect GPS
                  </button>
                </label>
                <div className="relative flex items-center">
                  <MapPin className="absolute left-4 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    placeholder="Enter city or corridor..."
                    className="w-full h-12 pl-11 pr-4 rounded-2xl bg-white/[0.05] border border-white/14 text-white text-xs sm:text-sm font-display outline-none focus:border-[#0052FF] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Reachable Radius & Range Metrics Output */}
            <div className="p-7 rounded-3xl liquid-glass-surface flex flex-col gap-5 border border-[#00FF9D]/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-display font-bold uppercase tracking-wider text-[#00FF9D] flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#00FF9D]" /> 2. Reachable Distance Limit
                </span>
                <span className="text-[11px] font-mono text-white bg-white/10 px-2.5 py-0.5 rounded-full">
                  ~{usableKwh.toFixed(1)} kWh Available
                </span>
              </div>

              {/* Large Range Readout */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-center font-mono">
                <div className="flex flex-col">
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-display">Max Reach (Miles)</span>
                  <span className="text-3xl font-extrabold text-white mt-1">
                    {maxReachMiles} <span className="text-sm font-normal text-neutral-400">mi</span>
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-display">Max Reach (Kilometers)</span>
                  <span className="text-3xl font-extrabold text-[#00FF9D] mt-1">
                    {maxReachKm} <span className="text-sm font-normal text-neutral-400">km</span>
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Safety Radius Recommendation:</strong> Plan your charging stop within <strong>{maxReachMiles - safeBufferMiles} miles</strong> to preserve a 15% reserve buffer.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Map & Reachable Charging Stations (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Map Visualizer Display */}
            <div className="relative rounded-3xl overflow-hidden liquid-glass-surface p-6 flex flex-col gap-4 min-h-[380px]">
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-2 text-xs font-display font-bold text-white uppercase tracking-wider">
                  <Navigation className="w-4 h-4 text-[#00F0FF]" /> Reachable Coverage Boundary Map
                </div>
                <span className="text-[11px] font-mono text-[#00FF9D] bg-[#00FF9D]/10 border border-[#00FF9D]/30 px-3 py-1 rounded-full">
                  Radius: {maxReachMiles} mi / {maxReachKm} km
                </span>
              </div>

              {/* Simulated Visual Radar Map Surface */}
              <div className="relative w-full h-72 rounded-2xl bg-[#090A12] border border-white/12 overflow-hidden flex items-center justify-center bg-dot-matrix">
                
                {/* Concentric Reach Rings */}
                <div className="absolute w-64 h-64 rounded-full border border-[#00FF9D]/20 animate-ping opacity-25" />
                <div className="absolute w-52 h-52 rounded-full border border-[#00F0FF]/30 bg-[#00F0FF]/5" />
                <div className="absolute w-32 h-32 rounded-full border border-[#00FF9D]/40 bg-[#00FF9D]/10" />

                {/* Center User Pin */}
                <div className="relative z-10 flex flex-col items-center gap-1">
                  <div className="w-7 h-7 rounded-full bg-[#0052FF] border-2 border-white shadow-[0_0_20px_#0052FF] flex items-center justify-center text-white">
                    <Car className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-white bg-black/80 px-2 py-0.5 rounded-md border border-white/20">
                    You ({batteryPercent}%)
                  </span>
                </div>

                {/* Stations Pinned within Radius */}
                {nearbyStations.slice(0, 4).map((st, i) => {
                  const offsets = [
                    { top: '22%', left: '68%' },
                    { top: '65%', left: '72%' },
                    { top: '30%', left: '25%' },
                    { top: '75%', left: '32%' },
                  ][i] || { top: '50%', left: '50%' };

                  const isSelected = selectedStation?.id === st.id;

                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setSelectedStation(st)}
                      className={`absolute z-10 flex flex-col items-center cursor-pointer transition-transform hover:scale-110 ${
                        isSelected ? 'scale-110' : 'opacity-85'
                      }`}
                      style={{ top: offsets.top, left: offsets.left }}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center border text-white ${
                          isSelected
                            ? 'bg-[#00FF9D] text-black border-white shadow-[0_0_15px_#00FF9D]'
                            : 'bg-[#14141E] border-[#00F0FF] text-[#00F0FF]'
                        }`}
                      >
                        <Zap className="w-3 h-3" />
                      </div>
                      <span className="text-[9px] font-mono text-white bg-black/90 px-1.5 py-0.5 rounded mt-0.5 border border-white/20 whitespace-nowrap">
                        {st.name.split('—')[0]} ({st.maxPowerKw}kW)
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Station Live Card */}
              {selectedStation && (
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-sm text-white">
                        {selectedStation.name}
                      </span>
                      <span className="text-[10px] font-mono text-[#00FF9D] bg-[#00FF9D]/10 px-2 py-0.5 rounded-full">
                        {selectedStation.availablePorts} Ports Available
                      </span>
                    </div>
                    <span className="text-xs text-neutral-400 font-mono">
                      {selectedStation.address} • {selectedStation.maxPowerKw}kW Ultra Fast DC • {selectedStation.currency}{selectedStation.pricingPerKwh}/kWh
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => showToast('Navigation Started', `Navigating to ${selectedStation.name}`, 'success')}
                    className="h-10 px-5 rounded-xl bg-[#0052FF] hover:bg-[#0041CC] text-white font-display text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md transition-all shrink-0"
                  >
                    <Navigation className="w-3.5 h-3.5" /> Navigate
                  </button>
                </div>
              )}
            </div>

            {/* List of Nearby Reachable Stations */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-display font-bold uppercase tracking-wider text-neutral-400 px-1">
                Reachable Stations Along Your Path ({nearbyStations.length})
              </span>

              <div className="flex flex-col gap-3 max-h-[340px] overflow-y-auto pr-1">
                {nearbyStations.map((st) => (
                  <div
                    key={st.id}
                    onClick={() => setSelectedStation(st)}
                    className={`p-4 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-4 border ${
                      selectedStation?.id === st.id
                        ? 'bg-white/[0.08] border-[#00FF9D] shadow-[0_0_20px_rgba(0,255,157,0.15)]'
                        : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#0052FF]/15 border border-[#0052FF]/30 flex items-center justify-center text-[#00F0FF] shrink-0">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-display font-bold text-xs sm:text-sm text-white">{st.name}</span>
                        <span className="text-[11px] text-neutral-400 font-mono">
                          {st.maxPowerKw}kW • {st.connectors.join(', ')}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <span className="font-mono font-bold text-xs text-[#00FF9D]">{st.currency}{st.pricingPerKwh}/kWh</span>
                      <span className="text-[10px] text-neutral-400 font-mono">{st.availablePorts} ports open</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ TAB 2: EMERGENCY EV TOWING SERVICE ══════════════ */}
      {activeTab === 'towing' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Emergency Situation & Location (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Towing Request Setup Card */}
            <div className="p-7 rounded-3xl liquid-glass-surface flex flex-col gap-6 border border-[#FF5E00]/30">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="font-display font-bold text-xs uppercase tracking-wider text-[#FF5E00] flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#FF5E00]" /> 1. EV Roadside Incident Report
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  Flatbed Dispatch Ready
                </span>
              </div>

              {/* Issue Type Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-display font-semibold text-neutral-300 uppercase tracking-wider">
                  Incident Type
                </label>
                <select
                  value={emergencyIssue}
                  onChange={(e) => setEmergencyIssue(e.target.value)}
                  className="w-full h-13 px-4 rounded-2xl bg-[#12131F] border border-white/14 text-white text-xs sm:text-sm font-display outline-none focus:border-[#FF5E00] transition-all cursor-pointer"
                >
                  <option value="0% Battery / Stranded">0% Battery / Stranded on Road</option>
                  <option value="Flat Tire / Damaged Alloy">Flat Tire / Damaged Wheel</option>
                  <option value="Drivetrain High-Voltage Lock">Drivetrain High-Voltage Lockout</option>
                  <option value="Minor Collision / Inoperable">Minor Collision / Inoperable</option>
                  <option value="Transport to Evora SuperHub">Transport to Nearest Evora SuperHub</option>
                </select>
              </div>

              {/* Exact Location Detection */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-display font-semibold text-neutral-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Breakdown Location</span>
                  <button
                    type="button"
                    onClick={handleLocateMe}
                    className="text-[#00F0FF] hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    <Crosshair className="w-3 h-3" /> Pinpoint GPS
                  </button>
                </label>
                <div className="relative flex items-center">
                  <MapPin className="absolute left-4 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    placeholder="Enter current street, highway mile marker, or city..."
                    className="w-full h-12 pl-11 pr-4 rounded-2xl bg-white/[0.05] border border-white/14 text-white text-xs sm:text-sm font-display outline-none focus:border-[#FF5E00] transition-all"
                  />
                </div>
              </div>

              {/* EV Flatbed Safety Assurance Banner */}
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col gap-2 text-xs">
                <div className="flex items-center gap-2 text-[#00FF9D] font-bold font-display uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-[#00FF9D]" /> EV Zero-Damage Guarantee
                </div>
                <p className="text-neutral-400 leading-relaxed text-[11px]">
                  All dispatched tow vehicles are certified hydraulic flatbeds equipped with free-wheeling dollies to protect dual-motor permanent magnet drive units from regeneration current damage.
                </p>
              </div>
            </div>

            {/* Active Dispatch Status Tracker */}
            {activeDispatch && (
              <div className="p-7 rounded-3xl liquid-glass-surface flex flex-col gap-4 border border-emerald-400 shadow-[0_0_30px_rgba(0,255,157,0.2)]">
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-xs uppercase tracking-wider text-[#00FF9D] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00FF9D]" /> Tow Truck En Route
                  </span>
                  <span className="font-mono text-xs text-white font-bold bg-emerald-500/20 px-2.5 py-0.5 rounded-full">
                    ETA: {activeDispatch.etaMinutes} Mins
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-neutral-400">Driver</span>
                    <div className="font-bold text-white text-sm">{activeDispatch.driverName}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400">Truck Plate</span>
                    <div className="font-bold text-[#00FF9D] text-sm">{activeDispatch.truckPlate}</div>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-neutral-400 flex items-center justify-between">
                  <span>Dispatch ID: {activeDispatch.dispatchId}</span>
                  <span className="text-emerald-400 font-bold">GPS Live Tracking Active</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Nearby EV Towing Providers (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <span className="font-display font-bold text-xs uppercase tracking-wider text-neutral-400 px-1">
              Nearby EV-Certified Towing Services ({towingProviders.length})
            </span>

            <div className="flex flex-col gap-4">
              {towingProviders.map((provider) => {
                const isSelected = selectedProvider?.id === provider.id;

                return (
                  <div
                    key={provider.id}
                    onClick={() => setSelectedProvider(provider)}
                    className={`p-6 rounded-3xl liquid-glass-card flex flex-col gap-4 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#FF5E00] shadow-[0_0_30px_rgba(255,94,0,0.2)] bg-white/[0.08]'
                        : 'border-white/12 hover:border-white/20'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-display font-bold text-base text-white">
                            {provider.name}
                          </h4>
                          <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md">
                            ★ {provider.rating} ({provider.reviewsCount})
                          </span>
                        </div>
                        <span className="text-xs text-neutral-400 font-mono mt-0.5 block">
                          {provider.flatbedType} • {provider.coverageArea}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end font-mono">
                          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3" /> ~{provider.etaMins} min ETA
                          </span>
                          <span className="text-[11px] text-neutral-400">{provider.distanceKm} km away</span>
                        </div>
                      </div>
                    </div>

                    {/* Features Tags */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {provider.features.map((feat) => (
                        <span
                          key={feat}
                          className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-neutral-300"
                        >
                          ✓ {feat}
                        </span>
                      ))}
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
                        <Phone className="w-3.5 h-3.5 text-[#00FF9D]" />
                        <span>{provider.phone}</span>
                      </div>

                      <button
                        type="button"
                        disabled={isDispatching}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRequestTow(provider);
                        }}
                        className="h-11 px-6 rounded-xl bg-gradient-to-r from-[#FF5E00] to-[#FF8C00] hover:opacity-95 text-white font-display text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-[0_4px_20px_rgba(255,94,0,0.4)] active:scale-95 cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        {isDispatching ? 'Contacting Fleet...' : `Request Rescue (${provider.currency}${provider.baseRate})`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
