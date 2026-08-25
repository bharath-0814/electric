import React, { useEffect, useState } from 'react';
import type { Reservation } from '../types';
import { tursoService } from '../lib/tursoClient';
import { useToast } from '../context/ToastContext';
import { X, QrCode, Ban, Zap, ShieldCheck } from 'lucide-react';

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
    <div className="fixed inset-0 z-[9999] flex justify-end bg-black/85 backdrop-blur-xl">
      <div
        className="relative w-full max-w-lg h-full border-l border-white/16 p-8 md:p-10 text-white flex flex-col gap-7 shadow-[0_0_80px_rgba(0,0,0,0.9)] overflow-y-auto"
        style={{
          background: 'rgba(14, 14, 20, 0.94)',
          backdropFilter: 'blur(48px) saturate(240%)',
          WebkitBackdropFilter: 'blur(48px) saturate(240%)',
          animation: 'slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold text-neutral-300 bg-white/8 border border-white/12 px-3 py-1 rounded-full mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0052FF]" /> Turso SQL Cloud Synced
            </div>
            <h3 className="font-display font-bold text-2xl md:text-3xl text-white tracking-tight">
              My Charging Passes
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.14] text-neutral-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        {loading ? (
          <div className="flex items-center justify-center py-24 text-neutral-400 font-display text-sm">
            Loading cloud reservations...
          </div>
        ) : reservations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center text-neutral-400 gap-3">
            <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center">
              <Zap className="w-8 h-8 text-[#0052FF]" />
            </div>
            <h4 className="font-display font-bold text-white text-lg">No Passes Yet</h4>
            <p className="text-xs text-neutral-400 max-w-xs leading-relaxed">
              When you reserve a high-power charging slot, your digital QR Fast-Pass will be encrypted and synced here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {reservations.map((r) => {
              const isConfirmed = r.status === 'confirmed' || r.status === 'active';
              return (
                <div
                  key={r.id}
                  className="p-6 rounded-3xl bg-white/[0.04] border border-white/12 flex flex-col gap-4 transition-all hover:border-white/25 hover:bg-white/[0.06]"
                  style={{
                    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.15)',
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[10px] font-display font-bold uppercase tracking-wider mb-2 ${
                          isConfirmed
                            ? 'bg-[#0052FF]/25 text-[#38aaff] border border-[#0052FF]/40'
                            : 'bg-white/5 text-neutral-500'
                        }`}
                      >
                        {r.status}
                      </span>
                      <h5 className="font-display font-bold text-base text-white">{r.stationName}</h5>
                      <p className="text-xs text-neutral-400 mt-0.5">{r.stationAddress}</p>
                    </div>

                    <span className="font-mono text-base font-bold text-[#38aaff]">
                      ${r.totalCost.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-neutral-300 font-mono py-2 border-y border-white/6">
                    <span className="font-semibold text-white">Gun #{r.portNumber}</span>
                    <span>•</span>
                    <span>{r.connectorType}</span>
                    <span>•</span>
                    <span>{r.durationMinutes} mins</span>
                  </div>

                  {isConfirmed && (
                    <div className="flex items-center gap-3 pt-1">
                      <button
                        onClick={() => {
                          onViewPass(r);
                          onClose();
                        }}
                        className="flex-1 h-12 flex items-center justify-center gap-2 rounded-2xl bg-[#0052FF] hover:bg-[#0041CC] text-white font-display text-xs font-bold uppercase tracking-wider transition-all shadow-[0_4px_20px_rgba(0,82,255,0.4)] cursor-pointer"
                      >
                        <QrCode className="w-4 h-4" />
                        View QR Pass
                      </button>

                      <button
                        onClick={() => handleCancel(r.id)}
                        className="h-12 px-4 rounded-2xl bg-white/[0.06] hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer flex items-center justify-center"
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
