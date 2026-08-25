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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 bg-black/85 backdrop-blur-xl">
      <div
        className="relative w-full max-w-lg rounded-[36px] p-8 md:p-10 text-white shadow-[0_32px_90px_rgba(0,0,0,0.85)] flex flex-col gap-6 overflow-hidden transition-all duration-300"
        style={{
          background: 'rgba(13, 13, 18, 0.90)',
          backdropFilter: 'blur(40px) saturate(240%)',
          WebkitBackdropFilter: 'blur(40px) saturate(240%)',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          boxShadow:
            '0 32px 80px -10px rgba(0, 0, 0, 0.9), inset 0 1px 1px 0 rgba(255, 255, 255, 0.3), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.6), 0 0 35px rgba(0, 82, 255, 0.15)',
          animation: 'fadeUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        }}
      >
        <div className="absolute inset-x-8 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399] animate-pulse" />
            <div>
              <span className="font-display font-bold text-xs uppercase tracking-widest text-[#38aaff]">
                Verified Digital Fast-Pass
              </span>
              <h4 className="font-display font-bold text-lg text-white">Ready for Charging</h4>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/6 hover:bg-white/12 text-neutral-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Card */}
        <div className="flex flex-col items-center justify-center p-8 rounded-3xl bg-white text-black shadow-2xl">
          <QRCodeSVG
            value={reservation.qrCode}
            size={200}
            level="H"
            includeMargin={false}
          />
          <span className="font-mono font-bold text-sm tracking-wider mt-4 text-neutral-900">
            {reservation.id}
          </span>
          <span className="text-[11px] text-neutral-500 uppercase tracking-widest mt-0.5 font-display font-semibold">
            Hold against charging pillar scanner
          </span>
        </div>

        {/* Pass Details */}
        <div className="flex flex-col gap-3.5 p-5 rounded-2xl bg-white/[0.04] border border-white/10 text-xs font-display">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400">Hub Station</span>
            <span className="font-bold text-white text-right max-w-[240px] truncate">
              {reservation.stationName}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-neutral-400">Assigned Bay</span>
            <span className="font-mono font-bold text-[#38aaff] px-2.5 py-1 rounded-xl bg-[#0052FF]/20 border border-[#0052FF]/30">
              Gun #{reservation.portNumber} • {reservation.connectorType}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-neutral-400">Output Rate</span>
            <span className="font-bold text-white font-mono">{reservation.powerKw} kW Ultra-DC</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-neutral-400">Duration</span>
            <span className="font-bold text-white font-mono">{reservation.durationMinutes} Minutes</span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <span className="text-neutral-400">Total Charged / Locked</span>
            <span className="font-mono font-bold text-xl text-white">
              ${reservation.totalCost.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleOpenMaps}
            className="h-14 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] text-white font-display text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Navigation className="w-4 h-4 text-[#38aaff]" />
            Turn-by-Turn
          </button>
          <button
            onClick={handlePrint}
            className="h-14 rounded-2xl bg-[#0052FF] hover:bg-[#0041CC] text-white font-display text-xs font-bold uppercase tracking-wider transition-all shadow-[0_8px_30px_rgba(0,82,255,0.45)] hover:shadow-[0_12px_40px_rgba(0,82,255,0.65)] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            Save Fast-Pass
          </button>
        </div>
      </div>
    </div>
  );
};
