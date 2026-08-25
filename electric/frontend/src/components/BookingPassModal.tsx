import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { Reservation } from '../types';
import { X, Navigation, Download } from 'lucide-react';

interface BookingPassModalProps {
  reservation: Reservation | null;
  onClose: () => void;
}

export const BookingPassModal: React.FC<BookingPassModalProps> = ({ reservation, onClose }) => {
  if (!reservation) return null;

  const handleOpenMaps = () => {
    const query = encodeURIComponent(`${reservation.stationName}, ${reservation.stationAddress}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div
        className="relative w-full max-w-md rounded-3xl bg-[#0A0A0A] border border-white/15 p-6 md:p-8 text-white shadow-[0_25px_70px_rgba(0,0,0,0.8),0_0_40px_rgba(0,82,255,0.2)] overflow-hidden flex flex-col gap-6"
        style={{ animation: 'fadeUp 0.3s ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-display font-bold text-xs uppercase tracking-widest text-[#0052FF]">
              Active Fast-Pass
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Board */}
        <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white text-black shadow-xl">
          <QRCodeSVG
            value={reservation.qrCode}
            size={180}
            level="H"
            includeMargin={false}
          />
          <span className="font-mono font-bold text-xs tracking-wider mt-4 text-neutral-800">
            {reservation.id}
          </span>
          <span className="text-[10px] text-neutral-500 uppercase tracking-widest mt-0.5">
            Scan at station pillar
          </span>
        </div>

        {/* Pass Details */}
        <div className="flex flex-col gap-3 p-4 rounded-2xl bg-[#141414] border border-white/8 text-xs font-display">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400">Station</span>
            <span className="font-bold text-white text-right max-w-[200px] truncate">
              {reservation.stationName}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-neutral-400">Assigned Port</span>
            <span className="font-mono font-bold text-white px-2 py-0.5 rounded bg-white/10">
              Gun #{reservation.portNumber} • {reservation.connectorType}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-neutral-400">Max Output</span>
            <span className="font-bold text-[#0052FF]">{reservation.powerKw} kW</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-neutral-400">Duration Lock</span>
            <span className="font-bold text-white">{reservation.durationMinutes} Minutes</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <span className="text-neutral-400">Estimated Total</span>
            <span className="font-bold text-base text-white">
              ${reservation.totalCost.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleOpenMaps}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-display text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5 text-[#0052FF]" />
            Navigate
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0052FF] hover:bg-[#0041CC] text-white font-display text-xs font-bold uppercase tracking-wider transition-all shadow-[0_4px_16px_rgba(0,82,255,0.4)] cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Save Pass
          </button>
        </div>
      </div>
    </div>
  );
};
