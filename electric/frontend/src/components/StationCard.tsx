import React from 'react';
import type { Station } from '../types';
import { Zap, MapPin, Heart, Navigation, ShieldCheck } from 'lucide-react';

interface StationCardProps {
  station: Station;
  isSelected?: boolean;
  isFavorite?: boolean;
  onSelect: (station: Station) => void;
  onBook: (station: Station) => void;
  onToggleFavorite: (stationId: string) => void;
}

export const StationCard: React.FC<StationCardProps> = ({
  station,
  isSelected,
  isFavorite,
  onSelect,
  onBook,
  onToggleFavorite,
}) => {
  const isAvailable = station.status === 'available' && station.availablePorts > 0;

  const handleDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div
      onClick={() => onSelect(station)}
      className={`group relative flex flex-col p-5 rounded-2xl transition-all duration-300 cursor-pointer border ${
        isSelected
          ? 'bg-[#141414] border-[#0052FF] shadow-[0_0_30px_rgba(0,82,255,0.25)]'
          : 'bg-[#0E0E0E] hover:bg-[#141414] border-white/8 hover:border-white/20'
      }`}
    >
      {/* Top row: Power badge, operator & favorite */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          {station.isEvoraHub ? (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0052FF]/15 border border-[#0052FF]/40 text-[#0052FF] text-[10px] font-display font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3" /> Evora Superhub
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-400 text-[10px] font-display font-medium uppercase tracking-wider">
              {station.operator}
            </span>
          )}

          {station.distanceKm !== undefined && (
            <span className="text-[11px] font-mono text-neutral-400">
              {station.distanceKm} km
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Power Badge */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0052FF] text-white font-display font-bold text-xs tracking-tight shadow-[0_0_12px_rgba(0,82,255,0.4)]">
            <Zap className="w-3.5 h-3.5 fill-current" />
            {station.maxPowerKw} kW
          </div>

          {/* Favorite button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(station.id);
            }}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Save favorite"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFavorite ? 'text-red-500 fill-red-500' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Station Name & Address */}
      <h4 className="font-display font-bold text-white text-base group-hover:text-[#0052FF] transition-colors leading-snug mb-1">
        {station.name}
      </h4>

      <p className="flex items-center gap-1.5 text-xs text-neutral-400 mb-3 line-clamp-1">
        <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
        {station.address}, {station.city}
      </p>

      {/* Plugs / Connectors Tags */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        {station.connectors.map((c) => (
          <span
            key={c}
            className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] font-mono text-neutral-300 uppercase"
          >
            {c}
          </span>
        ))}
      </div>

      {/* Details Row: Availability & Price */}
      <div className="flex items-center justify-between pt-3 border-t border-white/6 text-xs mt-auto">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isAvailable
                ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                : station.status === 'busy'
                ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                : 'bg-neutral-500'
            }`}
          />
          <span className="font-display text-neutral-300 font-medium">
            {station.availablePorts} of {station.totalPorts} guns open
          </span>
        </div>

        <div className="font-display font-bold text-white text-sm">
          {station.currency}
          {station.pricingPerKwh.toFixed(2)}
          <span className="text-[10px] text-neutral-400 font-normal"> / kWh</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        <button
          onClick={handleDirections}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white font-display text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 border border-white/5 cursor-pointer"
        >
          <Navigation className="w-3.5 h-3.5 text-[#0052FF]" />
          Route
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onBook(station);
          }}
          disabled={!isAvailable}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-display text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
            isAvailable
              ? 'bg-[#0052FF] hover:bg-[#0041CC] text-white shadow-[0_4px_16px_rgba(0,82,255,0.35)] active:scale-95'
              : 'bg-white/10 text-neutral-500 cursor-not-allowed'
          }`}
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          {isAvailable ? 'Reserve Slot' : 'All Busy'}
        </button>
      </div>
    </div>
  );
};
