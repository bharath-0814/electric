import React, { useState } from 'react';
import type { EvoraUser } from '../lib/firebase';
import { Menu, X, BatteryCharging, Truck } from 'lucide-react';

interface FloatingGlassNavProps {
  currentUser: EvoraUser | null;
  activeView: 'landing' | 'services';
  onSelectView: (view: 'landing' | 'services', tab?: 'battery' | 'towing') => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
}

export const FloatingGlassNav: React.FC<FloatingGlassNavProps> = ({
  currentUser,
  activeView,
  onSelectView,
  onOpenAuth,
  onOpenProfile,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  return (
    <>
      {/* ══════════════ 1. TOP-LEFT SCULPTED GLASS BRANDMARK ══════════════ */}
      <div className="fixed top-5 md:top-6 left-4 md:left-8 z-50 pointer-events-auto">
        <button
          type="button"
          onClick={() => onSelectView('landing')}
          className="relative flex items-center gap-3 px-4.5 py-2.5 rounded-2xl font-display text-base font-bold tracking-[0.16em] uppercase text-white shadow-[0_20px_50px_rgba(0,0,0,0.85)] cursor-pointer select-none overflow-hidden transition-all duration-300 hover:scale-105"
          style={{
            background: 'rgba(14, 15, 24, 0.82)',
            backdropFilter: 'blur(36px) saturate(220%)',
            WebkitBackdropFilter: 'blur(36px) saturate(220%)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.85), inset 0 1px 1.5px rgba(255, 255, 255, 0.4), 0 0 25px rgba(0, 240, 255, 0.15)',
          }}
        >
          <div className="absolute inset-x-4 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#00F0FF]/80 to-transparent pointer-events-none" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#00FF9D] shadow-[0_0_12px_#00FF9D] animate-pulse" />
          <span className="flex items-center">
            <span className="text-[#00F0FF]">EV</span>ORA
          </span>
          <span className="hidden sm:inline text-[9px] font-mono tracking-widest text-[#00FF9D] bg-[#00FF9D]/10 border border-[#00FF9D]/20 px-2 py-0.5 rounded-md">
            800V
          </span>
        </button>
      </div>

      {/* ══════════════ 2. TOP-MIDDLE LIQUID GLASS CAPSULE ══════════════ */}
      <header className="fixed top-5 md:top-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center pointer-events-none">
        <div
          className="pointer-events-auto relative flex items-center gap-2 md:gap-3 px-3.5 md:px-5 py-2 md:py-2.5 rounded-2xl md:rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.9)]"
          style={{
            background: 'rgba(12, 13, 22, 0.88)',
            backdropFilter: 'blur(48px) saturate(240%)',
            WebkitBackdropFilter: 'blur(48px) saturate(240%)',
            border: '1px solid rgba(255, 255, 255, 0.20)',
            boxShadow:
              '0 30px 90px -10px rgba(0, 0, 0, 0.95), inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.45), inset 0 -1.5px 2px 0 rgba(0, 0, 0, 0.7), 0 0 40px rgba(0, 240, 255, 0.15)',
          }}
        >
          <div className="absolute inset-x-8 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#00F0FF]/70 to-transparent rounded-full pointer-events-none" />

          <nav className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onSelectView('landing')}
              className={`relative px-3 sm:px-4 py-2 rounded-xl font-display text-xs font-bold tracking-[0.12em] uppercase transition-all duration-300 cursor-pointer select-none ${
                activeView === 'landing' ? 'text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {activeView === 'landing' && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#0052FF] to-[#00A3FF] border border-[#00F0FF]/60 shadow-[0_0_20px_rgba(0,163,255,0.7),inset_0_1px_1.5px_rgba(255,255,255,0.5)]" />
              )}
              <span className="relative z-10">Home</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectView('services', 'battery')}
              className={`relative px-3 sm:px-4 py-2 rounded-xl font-display text-xs font-bold tracking-[0.12em] uppercase transition-all duration-300 cursor-pointer select-none flex items-center gap-1.5 ${
                activeView === 'services' ? 'text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {activeView === 'services' && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#0052FF] to-[#00A3FF] border border-[#00F0FF]/60 shadow-[0_0_20px_rgba(0,163,255,0.7),inset_0_1px_1.5px_rgba(255,255,255,0.5)]" />
              )}
              <BatteryCharging className="w-3.5 h-3.5 relative z-10 text-[#00FF9D]" />
              <span className="relative z-10">Battery & Stations</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectView('services', 'towing')}
              className="relative px-3 sm:px-4 py-2 rounded-xl font-display text-xs font-bold tracking-[0.12em] uppercase text-neutral-400 hover:text-white transition-all duration-300 cursor-pointer select-none hidden md:flex items-center gap-1.5"
            >
              <Truck className="w-3.5 h-3.5 text-[#FF5E00]" />
              <span>Towing Rescue</span>
            </button>
          </nav>

          <div className="w-[1px] h-5 bg-white/20" />

          {/* User Account / Log In Button */}
          <div className="flex items-center gap-2">
            {currentUser ? (
              <button
                type="button"
                onClick={onOpenProfile}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-display text-[11px] font-bold tracking-[0.12em] uppercase text-white bg-[#00FF9D]/15 border border-[#00FF9D]/40 hover:bg-[#00FF9D]/25 transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(0,255,157,0.25)] hover:scale-105"
              >
                <span className="w-2 h-2 rounded-full bg-[#00FF9D] shadow-[0_0_8px_#00FF9D]" />
                <span className="max-w-[85px] truncate">{currentUser.displayName.split(' ')[0]}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="font-display text-[11px] font-bold tracking-[0.14em] uppercase text-white bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-1.5 rounded-xl transition-all hover:scale-105 cursor-pointer shadow-sm"
              >
                Sign In
              </button>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-xl bg-white/[0.08] text-white cursor-pointer"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div
            className="pointer-events-auto absolute top-16 left-1/2 -translate-x-1/2 w-64 p-4 rounded-2xl text-white shadow-2xl flex flex-col gap-3 md:hidden"
            style={{
              background: 'rgba(12, 13, 22, 0.95)',
              backdropFilter: 'blur(48px) saturate(240%)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.9), 0 0 30px rgba(0,240,255,0.15)',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onSelectView('landing');
              }}
              className="text-left font-display text-xs font-semibold tracking-[0.14em] uppercase text-white py-2 border-b border-white/10 cursor-pointer"
            >
              Home Cockpit
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onSelectView('services', 'battery');
              }}
              className="text-left font-display text-xs font-semibold tracking-[0.14em] uppercase text-[#00FF9D] py-2 border-b border-white/10 cursor-pointer flex items-center gap-2"
            >
              <BatteryCharging className="w-4 h-4" /> Battery & Map
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onSelectView('services', 'towing');
              }}
              className="text-left font-display text-xs font-semibold tracking-[0.14em] uppercase text-[#FF5E00] py-2 border-b border-white/10 cursor-pointer flex items-center gap-2"
            >
              <Truck className="w-4 h-4" /> Towing Service
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                if (currentUser) onOpenProfile();
                else onOpenAuth();
              }}
              className="text-left font-display text-xs font-semibold tracking-[0.14em] uppercase text-[#00F0FF] py-2 cursor-pointer"
            >
              {currentUser ? `Account (${currentUser.displayName})` : 'Sign In'}
            </button>
          </div>
        )}
      </header>
    </>
  );
};
