import React, { useState } from 'react';
import type { EvoraUser } from '../lib/firebase';
import { authService } from '../lib/firebase';
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

  const handleSaveProfile = () => {
    localStorage.setItem('evora_vehicle_model', vehicleModel);
    localStorage.setItem('evora_battery_kwh', batteryKwh);
    localStorage.setItem('evora_pref_plug', preferredPlug);
    showToast('Vehicle Profile Updated', 'Charging speed and range tuned to your car.', 'success');
    onClose();
  };

  const handleSignOut = async () => {
    await authService.logout();
    onLogout();
    showToast('Signed Out', 'You have been logged out safely.', 'info');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div
        className="relative w-full max-w-md rounded-3xl bg-[#0A0A0A] border border-white/12 p-8 text-white shadow-2xl flex flex-col gap-6"
        style={{ animation: 'fadeUp 0.3s ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#0052FF]/20 border border-[#0052FF]/40 flex items-center justify-center text-white font-display font-bold text-lg">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                user.displayName.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white leading-tight">
                {user.displayName}
              </h3>
              <p className="text-xs text-neutral-400 font-mono">{user.email}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vehicle Configuration */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs font-display font-bold text-[#0052FF] uppercase tracking-wider">
            <Car className="w-4 h-4" /> My Electric Vehicle
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-display text-neutral-400 uppercase tracking-wider">
              Vehicle Model
            </label>
            <input
              type="text"
              value={vehicleModel}
              onChange={(e) => setVehicleModel(e.target.value)}
              placeholder="e.g. Porsche Taycan, Tesla Model Y, Hyundai Ioniq 5"
              className="w-full px-4 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white text-xs font-display outline-none focus:border-[#0052FF]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-display text-neutral-400 uppercase tracking-wider">
                Battery Pack (kWh)
              </label>
              <input
                type="number"
                value={batteryKwh}
                onChange={(e) => setBatteryKwh(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white text-xs font-mono outline-none focus:border-[#0052FF]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-display text-neutral-400 uppercase tracking-wider">
                Preferred Plug
              </label>
              <select
                value={preferredPlug}
                onChange={(e) => setPreferredPlug(e.target.value as ConnectorType)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white text-xs font-display outline-none focus:border-[#0052FF]"
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
            className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-white/5 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 font-display text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Log Out
          </button>

          <button
            type="button"
            onClick={handleSaveProfile}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-[#0052FF] hover:bg-[#0041CC] text-white font-display text-xs font-bold uppercase tracking-widest transition-all shadow-[0_4px_16px_rgba(0,82,255,0.4)] cursor-pointer"
          >
            <Check className="w-4 h-4" /> Save Vehicle Specs
          </button>
        </div>
      </div>
    </div>
  );
};
