import React, { useState } from 'react';
import type { EvoraUser } from '../lib/firebase';
import { authService } from '../lib/firebase';
import { tursoService } from '../lib/tursoClient';
import type { ConnectorType } from '../types';
import { useToast } from '../context/ToastContext';
import { X, Car, LogOut, Check } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: EvoraUser;
  onLogout: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
}) => {
  if (!isOpen) return null;

  const [vehicleModel, setVehicleModel] = useState(
    localStorage.getItem('evora_vehicle_model') || 'Tesla Model 3 Long Range'
  );
  const [batteryKwh, setBatteryKwh] = useState(
    localStorage.getItem('evora_battery_kwh') || '78'
  );
  const [preferredPlug, setPreferredPlug] = useState<ConnectorType>(
    (localStorage.getItem('evora_pref_plug') as ConnectorType) || 'CCS2'
  );

  const { showToast } = useToast();

  const handleSaveProfile = async () => {
    localStorage.setItem('evora_vehicle_model', vehicleModel);
    localStorage.setItem('evora_battery_kwh', batteryKwh);
    localStorage.setItem('evora_pref_plug', preferredPlug);

    await tursoService.saveUserProfile(user.email, {
      vehicleModel,
      batteryCapacityKwh: Number(batteryKwh),
      preferredConnector: preferredPlug,
    });

    showToast('Vehicle Profile Synced', 'Battery specifications saved to Turso SQL.', 'success');
    onClose();
  };

  const handleSignOut = async () => {
    await authService.logout();
    onLogout();
    showToast('Signed Out', 'You have been safely signed out.', 'info');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 bg-black/85 backdrop-blur-xl">
      <div
        className="relative w-full max-w-lg rounded-[36px] p-8 md:p-12 text-white shadow-[0_32px_90px_rgba(0,0,0,0.85)] flex flex-col gap-7 overflow-hidden transition-all duration-300"
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

        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#0052FF] to-indigo-600 p-[2px] shadow-[0_0_20px_rgba(0,82,255,0.4)]">
              <div className="w-full h-full rounded-full bg-[#0D0D12] overflow-hidden flex items-center justify-center text-white font-display font-bold text-xl">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user.displayName.charAt(0).toUpperCase()
                )}
              </div>
            </div>

            <div>
              <h3 className="font-display font-bold text-xl text-white leading-tight">
                {user.displayName}
              </h3>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">{user.email}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/6 hover:bg-white/12 text-neutral-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vehicle Configuration */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2 text-xs font-display font-bold text-[#38aaff] uppercase tracking-wider">
            <Car className="w-4 h-4" /> My Electric Vehicle Profile
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-display text-neutral-300 uppercase tracking-wider font-semibold">
              Vehicle Model
            </label>
            <input
              type="text"
              value={vehicleModel}
              onChange={(e) => setVehicleModel(e.target.value)}
              placeholder="e.g. Porsche Taycan, Tesla Model Y, Hyundai Ioniq 5"
              className="w-full h-14 px-5 rounded-2xl bg-white/[0.05] border border-white/12 text-white placeholder:text-neutral-500 text-sm font-display outline-none focus:border-[#0052FF] focus:ring-4 focus:ring-[#0052FF]/20 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-display text-neutral-300 uppercase tracking-wider font-semibold">
                Battery Pack (kWh)
              </label>
              <input
                type="number"
                value={batteryKwh}
                onChange={(e) => setBatteryKwh(e.target.value)}
                className="w-full h-14 px-5 rounded-2xl bg-white/[0.05] border border-white/12 text-white text-sm font-mono outline-none focus:border-[#0052FF] focus:ring-4 focus:ring-[#0052FF]/20 transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-display text-neutral-300 uppercase tracking-wider font-semibold">
                Preferred Plug
              </label>
              <select
                value={preferredPlug}
                onChange={(e) => setPreferredPlug(e.target.value as ConnectorType)}
                className="w-full h-14 px-4 rounded-2xl bg-[#14141A] border border-white/12 text-white text-sm font-display outline-none focus:border-[#0052FF] focus:ring-4 focus:ring-[#0052FF]/20 transition-all cursor-pointer"
              >
                <option value="CCS2">CCS2</option>
                <option value="Tesla (NACS)">Tesla (NACS)</option>
                <option value="Type 2">Type 2</option>
                <option value="CHAdeMO">CHAdeMO</option>
                <option value="GB/T">GB/T</option>
              </select>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleSignOut}
            className="h-14 px-6 rounded-2xl bg-white/[0.06] hover:bg-red-500/20 text-neutral-300 hover:text-red-400 font-display text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Log Out
          </button>

          <button
            type="button"
            onClick={handleSaveProfile}
            className="flex-1 h-14 px-6 rounded-2xl bg-[#0052FF] hover:bg-[#0041CC] text-white font-display text-xs font-bold uppercase tracking-widest transition-all shadow-[0_8px_30px_rgba(0,82,255,0.45)] hover:shadow-[0_12px_40px_rgba(0,82,255,0.65)] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <Check className="w-4 h-4" /> Save Vehicle Specs
          </button>
        </div>
      </div>
    </div>
  );
};
