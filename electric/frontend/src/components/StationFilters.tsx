import React from 'react';
import type { ConnectorType, StationFilterState } from '../types';
import { Zap, Filter, Sparkles, Check } from 'lucide-react';

interface StationFiltersProps {
  filters: StationFilterState;
  onChange: (filters: StationFilterState) => void;
  totalCount: number;
}

const POWER_OPTIONS = [
  { label: 'All Speeds', value: 0 },
  { label: '100+ kW', value: 100 },
  { label: '150+ kW Fast', value: 150 },
  { label: '300+ kW Ultra', value: 300 },
];

const CONNECTOR_OPTIONS: ConnectorType[] = [
  'CCS2',
  'Tesla (NACS)',
  'Type 2',
  'CHAdeMO',
  'GB/T',
];

export const StationFilters: React.FC<StationFiltersProps> = ({
  filters,
  onChange,
  totalCount,
}) => {
  const toggleConnector = (connector: ConnectorType) => {
    const exists = filters.connectorTypes.includes(connector);
    const updated = exists
      ? filters.connectorTypes.filter((c) => c !== connector)
      : [...filters.connectorTypes, connector];
    onChange({ ...filters, connectorTypes: updated });
  };

  return (
    <div className="flex flex-col gap-3.5 p-4 rounded-2xl bg-[#111111]/90 backdrop-blur-xl border border-white/10 text-white">
      {/* Top row: summary count and sort */}
      <div className="flex items-center justify-between gap-4 text-xs font-display">
        <div className="flex items-center gap-2 text-neutral-400">
          <Filter className="w-3.5 h-3.5 text-[#0052FF]" />
          <span className="uppercase tracking-widest font-semibold">
            {totalCount} Stations Found
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-neutral-500 uppercase tracking-wider text-[10px]">Sort:</span>
          <select
            value={filters.sortBy}
            onChange={(e) =>
              onChange({ ...filters, sortBy: e.target.value as StationFilterState['sortBy'] })
            }
            className="bg-[#1A1A1A] text-neutral-200 border border-white/10 rounded-lg px-2.5 py-1 text-xs outline-none focus:border-[#0052FF] cursor-pointer"
          >
            <option value="distance">Nearest Distance</option>
            <option value="power">Highest Power (kW)</option>
            <option value="rating">Top Rated</option>
            <option value="price">Lowest Price / kWh</option>
          </select>
        </div>
      </div>

      {/* Speed (kW) Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 text-[11px] text-neutral-400 font-display uppercase tracking-wider mr-1">
          <Zap className="w-3 h-3 text-[#0052FF]" /> Power:
        </div>
        {POWER_OPTIONS.map((opt) => {
          const active = filters.minPowerKw === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange({ ...filters, minPowerKw: opt.value })}
              className={`px-3 py-1 rounded-full text-xs font-display font-medium tracking-wide transition-all duration-200 cursor-pointer ${
                active
                  ? 'bg-[#0052FF] text-white shadow-[0_0_15px_rgba(0,82,255,0.4)]'
                  : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Plugs / Connectors Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/5">
        <span className="text-[11px] text-neutral-400 font-display uppercase tracking-wider mr-1">
          Plugs:
        </span>
        {CONNECTOR_OPTIONS.map((c) => {
          const active = filters.connectorTypes.includes(c);
          return (
            <button
              key={c}
              onClick={() => toggleConnector(c)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-display font-medium tracking-wide transition-all duration-200 cursor-pointer ${
                active
                  ? 'bg-white text-black font-semibold shadow-md'
                  : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              {active && <Check className="w-3 h-3 text-[#0052FF]" />}
              {c}
            </button>
          );
        })}

        {/* Quick Toggles */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => onChange({ ...filters, onlyEvoraHubs: !filters.onlyEvoraHubs })}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-display tracking-wide transition-all duration-200 cursor-pointer ${
              filters.onlyEvoraHubs
                ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40 shadow-[0_0_10px_rgba(0,82,255,0.3)]'
                : 'bg-white/5 text-neutral-400 border border-white/5 hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3 text-[#0052FF]" />
            Evora Network Only
          </button>

          <button
            onClick={() => onChange({ ...filters, onlyAvailable: !filters.onlyAvailable })}
            className={`px-3 py-1 rounded-full text-xs font-display tracking-wide transition-all duration-200 cursor-pointer ${
              filters.onlyAvailable
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-white/5 text-neutral-400 border border-white/5 hover:text-white'
            }`}
          >
            Available Now
          </button>
        </div>
      </div>
    </div>
  );
};
