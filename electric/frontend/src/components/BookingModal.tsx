import React, { useState } from 'react';
import type { Station, Reservation, ConnectorType } from '../types';
import { tursoService } from '../lib/tursoClient';
import { useToast } from '../context/ToastContext';
import confetti from 'canvas-confetti';
import { X, Zap, ArrowRight } from 'lucide-react';

interface BookingModalProps {
  station: Station | null;
  userEmail: string;
  userName: string;
  onClose: () => void;
  onSuccess: (reservation: Reservation) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  station,
  userEmail,
  userName,
  onClose,
  onSuccess,
}) => {
  if (!station) return null;

  const [selectedConnector, setSelectedConnector] = useState<ConnectorType>(
    station.connectors[0] || 'CCS2'
  );
  const [selectedPort, setSelectedPort] = useState<number>(1);
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [loading, setLoading] = useState<boolean>(false);

  const { showToast } = useToast();

  // Price Calculation: Duration * Avg Speed (kW) * pricingPerKwh
  const estimatedKwh = Math.round((station.maxPowerKw * (durationMinutes / 60) * 0.75) * 10) / 10;
  const estimatedCost = Math.round(estimatedKwh * station.pricingPerKwh * 100) / 100;

  const handleConfirmReservation = async () => {
    setLoading(true);
    try {
      const reservationId = `RES-${Date.now().toString(36).toUpperCase()}-${Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase()}`;

      const newReservation: Reservation = {
        id: reservationId,
        stationId: station.id,
        stationName: station.name,
        stationAddress: station.address,
        userEmail,
        userName,
        portNumber: selectedPort,
        connectorType: selectedConnector,
        powerKw: station.maxPowerKw,
        startTime: new Date().toISOString(),
        durationMinutes,
        totalCost: estimatedCost,
        status: 'confirmed',
        qrCode: `EVORA://PASS/${reservationId}/${station.id}/${selectedPort}`,
        createdAt: new Date().toISOString(),
      };

      // Save into Turso SQL
      await tursoService.createReservation(newReservation);

      // Confetti effect
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#0052FF', '#ffffff', '#38aaff', '#10B981'],
      });

      showToast(
        'Slot Locked & Confirmed',
        `Port #${selectedPort} reserved at ${station.name}.`,
        'success'
      );

      onSuccess(newReservation);
    } catch (err: any) {
      showToast('Booking Failed', err.message || 'Could not lock charging slot.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 bg-black/85 backdrop-blur-xl">
      <div
        className="relative w-full max-w-lg rounded-[36px] p-8 md:p-12 text-white shadow-[0_32px_90px_rgba(0,0,0,0.85)] flex flex-col gap-6 overflow-hidden transition-all duration-300"
        style={{
          background: 'rgba(13, 13, 18, 0.88)',
          backdropFilter: 'blur(40px) saturate(240%)',
          WebkitBackdropFilter: 'blur(40px) saturate(240%)',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          boxShadow:
            '0 32px 80px -10px rgba(0, 0, 0, 0.9), inset 0 1px 1px 0 rgba(255, 255, 255, 0.3), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.6), 0 0 35px rgba(0, 82, 255, 0.15)',
          animation: 'fadeUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        }}
      >
        <div className="absolute inset-x-8 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between pb-5 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-display font-bold uppercase tracking-wider text-[#38aaff] bg-[#0052FF]/20 border border-[#0052FF]/35 px-3 py-1 rounded-full">
                ⚡ {station.isEvoraHub ? 'Evora Supercharging Hub' : station.operator}
              </span>
              <span className="text-xs font-mono font-bold text-white bg-white/10 px-2.5 py-1 rounded-full">
                {station.maxPowerKw} kW
              </span>
            </div>
            <h3 className="font-display font-bold text-2xl text-white">{station.name}</h3>
            <p className="text-xs text-neutral-400 mt-1">{station.address}</p>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/6 hover:bg-white/12 text-neutral-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Connector Selection */}
        <div className="flex flex-col gap-2.5">
          <label className="text-xs font-display text-neutral-300 uppercase tracking-wider font-semibold">
            Select Connector Type
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {station.connectors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedConnector(c)}
                className={`py-3 px-3 rounded-2xl font-display text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                  selectedConnector === c
                    ? 'bg-[#0052FF] text-white border-[#38aaff]/60 shadow-[0_0_20px_rgba(0,82,255,0.45)]'
                    : 'bg-white/[0.04] text-neutral-300 border-white/10 hover:border-white/20'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Charging Port Selection */}
        <div className="flex flex-col gap-2.5">
          <label className="text-xs font-display text-neutral-300 uppercase tracking-wider font-semibold">
            Select Charging Port Gun
          </label>
          <div className="grid grid-cols-4 gap-2.5">
            {Array.from({ length: Math.min(station.totalPorts, 8) }).map((_, i) => {
              const portNum = i + 1;
              const isSelected = selectedPort === portNum;
              return (
                <button
                  key={portNum}
                  type="button"
                  onClick={() => setSelectedPort(portNum)}
                  className={`py-3 rounded-2xl font-mono text-xs font-bold transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-[#0052FF] text-white border-[#38aaff]/60 shadow-[0_0_20px_rgba(0,82,255,0.45)]'
                      : 'bg-white/[0.04] text-neutral-300 border-white/10 hover:border-white/20'
                  }`}
                >
                  Gun #{portNum}
                </button>
              );
            })}
          </div>
        </div>

        {/* Duration Selection */}
        <div className="flex flex-col gap-2.5">
          <label className="text-xs font-display text-neutral-300 uppercase tracking-wider font-semibold">
            Session Duration
          </label>
          <div className="grid grid-cols-4 gap-2.5">
            {[15, 30, 45, 60].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => setDurationMinutes(mins)}
                className={`py-3 rounded-2xl font-display text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                  durationMinutes === mins
                    ? 'bg-white text-black border-white shadow-md'
                    : 'bg-white/[0.04] text-neutral-300 border-white/10 hover:border-white/20'
                }`}
              >
                {mins} Mins
              </button>
            ))}
          </div>
        </div>

        {/* Energy & Price Estimate Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/12 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-display text-neutral-400 uppercase tracking-wider">
              Estimated Energy Added
            </span>
            <span className="font-mono text-xl font-bold text-white flex items-center gap-1 mt-0.5">
              <Zap className="w-4 h-4 text-[#0052FF]" />
              ~{estimatedKwh} kWh
            </span>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[11px] font-display text-neutral-400 uppercase tracking-wider">
              Estimated Cost
            </span>
            <span className="font-mono text-2xl font-bold text-[#38aaff]">
              ${estimatedCost.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Confirm Reservation Button */}
        <button
          type="button"
          onClick={handleConfirmReservation}
          disabled={loading}
          className="w-full h-14 rounded-2xl bg-[#0052FF] hover:bg-[#0041CC] text-white font-display text-sm font-bold uppercase tracking-widest transition-all shadow-[0_8px_30px_rgba(0,82,255,0.45)] hover:shadow-[0_12px_40px_rgba(0,82,255,0.65)] flex items-center justify-center gap-2.5 active:scale-[0.98] cursor-pointer"
        >
          {loading ? 'Locking Gun & Slot...' : 'Confirm Fast-Pass Reservation'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
