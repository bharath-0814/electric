import React, { useState } from 'react';
import type { Station, ConnectorType, Reservation } from '../types';
import { tursoService } from '../lib/tursoClient';
import { useToast } from '../context/ToastContext';
import { X, BatteryCharging, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { showToast } = useToast();

  // Energy & Price estimation
  const effectivePowerKw = Math.min(station.maxPowerKw, 150);
  const estimatedKwh = Math.round(((effectivePowerKw * (durationMinutes / 60)) * 0.85) * 10) / 10;
  const energyCost = Math.round(estimatedKwh * station.pricingPerKwh * 100) / 100;
  const reservationFee = 1.5;
  const totalCost = Math.round((energyCost + reservationFee) * 100) / 100;

  const handleConfirmBooking = async () => {
    setIsSubmitting(true);
    try {
      const reservationId = `EVR-${Date.now().toString(36).toUpperCase()}-${Math.floor(
        Math.random() * 900 + 100
      )}`;

      const startTime = new Date().toISOString();

      const reservation: Reservation = {
        id: reservationId,
        stationId: station.id,
        stationName: station.name,
        stationAddress: `${station.address}, ${station.city}`,
        userEmail: userEmail || 'guest.driver@evora.energy',
        userName: userName || 'Evora Driver',
        portNumber: selectedPort,
        connectorType: selectedConnector,
        powerKw: station.maxPowerKw,
        startTime,
        durationMinutes,
        totalCost,
        status: 'confirmed',
        qrCode: `EVORA-PASS:${reservationId}:${station.id}:PORT${selectedPort}`,
        createdAt: new Date().toISOString(),
      };

      await tursoService.createReservation(reservation);

      // Celebration effect
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0052FF', '#ffffff', '#38aaff'],
        });
      } catch {}

      showToast('Charging Slot Confirmed!', `Reserved Gun #${selectedPort} at ${station.name}`, 'success');
      onSuccess(reservation);
    } catch (err) {
      showToast('Booking failed', 'Please check connection and try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div
        className="relative w-full max-w-lg rounded-3xl bg-[#0C0C0C] border border-white/12 p-6 md:p-8 text-white shadow-2xl overflow-hidden flex flex-col gap-6"
        style={{ animation: 'fadeUp 0.3s ease-out' }}
      >
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#0052FF]/20 text-[#0052FF] text-[10px] font-display font-bold uppercase tracking-wider">
                Slot Reservation
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                {station.currency}{station.pricingPerKwh}/kWh
              </span>
            </div>
            <h3 className="font-display font-bold text-xl text-white leading-tight">
              {station.name}
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">{station.address}, {station.city}</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Connector Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-display font-semibold uppercase tracking-wider text-neutral-400">
            1. Select Plug / Connector
          </label>
          <div className="grid grid-cols-3 gap-2">
            {station.connectors.map((connector) => (
              <button
                key={connector}
                type="button"
                onClick={() => setSelectedConnector(connector)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-display font-semibold transition-all cursor-pointer ${
                  selectedConnector === connector
                    ? 'bg-[#0052FF] text-white border-[#0052FF] shadow-[0_0_15px_rgba(0,82,255,0.4)]'
                    : 'bg-white/5 text-neutral-300 border-white/5 hover:border-white/20'
                }`}
              >
                {connector}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Select Port & Time */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-display font-semibold uppercase tracking-wider text-neutral-400">
              2. Charging Gun / Port
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {Array.from({ length: Math.min(station.totalPorts, 8) }).map((_, i) => (
                <button
                  key={i + 1}
                  type="button"
                  onClick={() => setSelectedPort(i + 1)}
                  className={`py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    selectedPort === i + 1
                      ? 'bg-white text-black'
                      : 'bg-white/5 text-neutral-400 hover:text-white border border-white/5'
                  }`}
                >
                  #{i + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-display font-semibold uppercase tracking-wider text-neutral-400">
              Duration
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDurationMinutes(mins)}
                  className={`py-2 rounded-lg text-xs font-display font-semibold transition-all cursor-pointer ${
                    durationMinutes === mins
                      ? 'bg-[#0052FF] text-white'
                      : 'bg-white/5 text-neutral-400 hover:text-white border border-white/5'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Estimated Output & Price breakdown */}
        <div className="p-4 rounded-2xl bg-[#141414] border border-white/8 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-neutral-400">
              <BatteryCharging className="w-4 h-4 text-[#0052FF]" />
              Estimated Energy Added:
            </span>
            <span className="font-mono font-bold text-white text-sm">~{estimatedKwh} kWh</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400">Energy Subtotal ({estimatedKwh} kWh @ {station.currency}{station.pricingPerKwh}):</span>
            <span className="font-mono text-neutral-200">{station.currency}{energyCost.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400">Reservation Lock Fee:</span>
            <span className="font-mono text-neutral-200">{station.currency}{reservationFee.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/10 font-display">
            <span className="font-bold text-sm text-white">Estimated Total</span>
            <span className="font-bold text-lg text-[#0052FF]">
              {station.currency}{totalCost.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Bottom Confirm Button */}
        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleConfirmBooking}
          className="w-full py-4 rounded-2xl bg-[#0052FF] hover:bg-[#0041CC] text-white font-display font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-[0_8px_32px_rgba(0,82,255,0.4)] flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
        >
          {isSubmitting ? (
            'Locking Gun Slot...'
          ) : (
            <>
              Confirm & Generate QR Pass
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
