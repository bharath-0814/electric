import React, { useEffect, useState } from 'react';
import type { Reservation } from '../types';
import { tursoService } from '../lib/tursoClient';
import { useToast } from '../context/ToastContext';
import { X, QrCode, Ban, Zap } from 'lucide-react';

interface UserBookingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  onViewPass: (reservation: Reservation) => void;
}

export const UserBookingsDrawer: React.FC<UserBookingsDrawerProps> = ({
  isOpen,
  onClose,
  userEmail,
  onViewPass,
}) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  const loadBookings = async () => {
    setLoading(true);
    const data = await tursoService.getUserReservations(userEmail);
    setReservations(data);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadBookings();
    }
  }, [isOpen, userEmail]);

  const handleCancel = async (id: string) => {
    await tursoService.cancelReservation(id);
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'cancelled' as const } : r))
    );
    showToast('Reservation Cancelled', 'Your time slot has been released.', 'info');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-9999 flex justify-end bg-black/75 backdrop-blur-sm">
      <div
        className="relative w-full max-w-md h-full bg-[#0B0B0B] border-l border-white/10 p-6 md:p-8 text-white flex flex-col gap-6 shadow-2xl overflow-y-auto"
        style={{ animation: 'slideInRight 0.3s ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="font-display font-bold text-xl text-white">My Charging Passes</h3>
            <p className="text-xs text-neutral-400">Turso SQL Cloud Synced</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-neutral-400 font-display text-xs">
            Loading reservations...
          </div>
        ) : reservations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center text-neutral-400">
            <Zap className="w-12 h-12 text-neutral-700 mb-3" />
            <h4 className="font-display font-bold text-white text-base">No Bookings Yet</h4>
            <p className="text-xs text-neutral-500 max-w-xs mt-1">
              Select a station on the live map and reserve a charging slot to see your fast pass here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {reservations.map((r) => {
              const isConfirmed = r.status === 'confirmed' || r.status === 'active';
              return (
                <div
                  key={r.id}
                  className="p-5 rounded-2xl bg-[#121212] border border-white/8 flex flex-col gap-3.5 transition-all hover:border-white/20"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-display font-bold uppercase tracking-wider mb-1.5 ${
                          isConfirmed
                            ? 'bg-[#0052FF]/20 text-[#0052FF] border border-[#0052FF]/30'
                            : 'bg-white/5 text-neutral-500'
                        }`}
                      >
                        {r.status}
                      </span>
                      <h5 className="font-display font-bold text-sm text-white">{r.stationName}</h5>
                      <p className="text-xs text-neutral-400">{r.stationAddress}</p>
                    </div>

                    <span className="font-mono text-sm font-bold text-white">
                      ${r.totalCost.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-neutral-400 font-mono">
                    <span>Gun #{r.portNumber}</span>
                    <span>•</span>
                    <span>{r.connectorType}</span>
                    <span>•</span>
                    <span>{r.durationMinutes} mins</span>
                  </div>

                  {isConfirmed && (
                    <div className="flex items-center gap-2 pt-2 border-t border-white/6">
                      <button
                        onClick={() => {
                          onViewPass(r);
                          onClose();
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#0052FF] hover:bg-[#0041CC] text-white font-display text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        View QR Pass
                      </button>

                      <button
                        onClick={() => handleCancel(r.id)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                        title="Cancel reservation"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
