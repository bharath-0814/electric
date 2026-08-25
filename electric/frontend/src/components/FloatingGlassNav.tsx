import React, { useState, useEffect } from 'react';
import type { EvoraUser } from '../lib/firebase';
import { Menu, X } from 'lucide-react';

interface NavItem {
  label: string;
  targetId: string;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Cockpit', targetId: 'home' },
  { label: 'Powertrain', targetId: 'powertrain-section' },
  { label: 'Charging', targetId: 'charging-section' },
  { label: 'Network', targetId: 'network-section' },
];

interface FloatingGlassNavProps {
  currentUser: EvoraUser | null;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
}

export const FloatingGlassNav: React.FC<FloatingGlassNavProps> = ({
  currentUser,
  onOpenAuth,
  onOpenProfile,
}) => {
  const [activeSection, setActiveSection] = useState<string>('home');
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 300;
      for (const item of [...NAV_ITEMS].reverse()) {
        const el = document.getElementById(item.targetId);
        if (el) {
          const top = el.offsetTop;
          if (scrollPos >= top) {
            setActiveSection(item.targetId);
            break;
          }
        }
      }
      if (window.scrollY < 180) {
        setActiveSection('home');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollTo = (targetId: string) => {
    setActiveSection(targetId);
    setMobileMenuOpen(false);
    if (targetId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      {/* ══════════════ 1. TOP-LEFT SCULPTED GLASS BRANDMARK ══════════════ */}
      <div className="fixed top-5 md:top-6 left-4 md:left-8 z-50 pointer-events-auto">
        <button
          type="button"
          onClick={() => handleScrollTo('home')}
          className="relative flex items-center gap-3 px-4.5 py-2.5 rounded-2xl font-display text-base font-bold tracking-[0.16em] uppercase text-white transition-all duration-300 hover:scale-105 cursor-pointer shadow-[0_20px_50px_rgba(0,0,0,0.85)] group overflow-hidden"
          style={{
            background: 'rgba(14, 15, 24, 0.82)',
            backdropFilter: 'blur(36px) saturate(220%)',
            WebkitBackdropFilter: 'blur(36px) saturate(220%)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.85), inset 0 1px 1.5px rgba(255, 255, 255, 0.4), 0 0 25px rgba(0, 240, 255, 0.15)',
          }}
        >
          {/* Top specular refraction */}
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

      {/* ══════════════ 2. TOP-MIDDLE DIAGONAL LIQUID GLASS CAPSULE ══════════════ */}
      <header className="fixed top-5 md:top-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center pointer-events-none">
        <div
          className="pointer-events-auto relative flex items-center gap-2 md:gap-3.5 px-4 md:px-6 py-2 md:py-2.5 rounded-2xl md:rounded-3xl transition-all duration-500 shadow-[0_25px_80px_rgba(0,0,0,0.9)]"
          style={{
            background: 'rgba(12, 13, 22, 0.86)',
            backdropFilter: 'blur(48px) saturate(240%)',
            WebkitBackdropFilter: 'blur(48px) saturate(240%)',
            border: '1px solid rgba(255, 255, 255, 0.20)',
            boxShadow:
              '0 30px 90px -10px rgba(0, 0, 0, 0.95), inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.45), inset 0 -1.5px 2px 0 rgba(0, 0, 0, 0.7), 0 0 40px rgba(0, 240, 255, 0.15)',
          }}
        >
          {/* Top Edge Cyan/White Specular Refraction Highlight Line */}
          <div className="absolute inset-x-8 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#00F0FF]/70 to-transparent rounded-full pointer-events-none" />

          {/* Navigation Items */}
          <nav className="flex items-center gap-1.5">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.targetId;
              const isHovered = hoveredSection === item.targetId;

              return (
                <button
                  key={item.targetId}
                  type="button"
                  onClick={() => handleScrollTo(item.targetId)}
                  onMouseEnter={() => setHoveredSection(item.targetId)}
                  onMouseLeave={() => setHoveredSection(null)}
                  className={`relative px-4 sm:px-5 py-2 rounded-xl font-display text-xs font-bold tracking-[0.14em] uppercase transition-all duration-300 cursor-pointer select-none ${
                    isActive ? 'text-white' : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  {/* Active Prismatic Neon Pill */}
                  {isActive && (
                    <div
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#0052FF] to-[#00A3FF] border border-[#00F0FF]/60 shadow-[0_0_20px_rgba(0,163,255,0.7),inset_0_1px_1.5px_rgba(255,255,255,0.5)] transition-all duration-300"
                      style={{ animation: 'fadeIn 0.2s ease-out' }}
                    />
                  )}

                  {/* Hover Soft Glass Effect */}
                  {!isActive && isHovered && (
                    <div
                      className="absolute inset-0 rounded-xl bg-white/10 border border-white/15 transition-all duration-200"
                      style={{ animation: 'fadeIn 0.2s ease-out' }}
                    />
                  )}

                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
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

        {/* Mobile Glass Dropdown Drawer */}
        {mobileMenuOpen && (
          <div
            className="pointer-events-auto absolute top-16 left-1/2 -translate-x-1/2 w-72 p-5 rounded-2xl text-white shadow-2xl flex flex-col gap-3 md:hidden"
            style={{
              background: 'rgba(12, 13, 22, 0.95)',
              backdropFilter: 'blur(48px) saturate(240%)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.9), 0 0 30px rgba(0,240,255,0.15)',
              animation: 'fadeUp 0.25s ease-out',
            }}
          >
            {NAV_ITEMS.map((item) => (
              <button
                key={item.targetId}
                type="button"
                onClick={() => handleScrollTo(item.targetId)}
                className="text-left font-display text-xs font-semibold tracking-[0.14em] uppercase text-neutral-200 hover:text-white py-2 border-b border-white/10 cursor-pointer"
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                if (currentUser) onOpenProfile();
                else onOpenAuth();
              }}
              className="text-left font-display text-xs font-semibold tracking-[0.14em] uppercase text-[#00F0FF] py-2 cursor-pointer"
            >
              {currentUser ? `My Account (${currentUser.displayName})` : 'Sign In / Register'}
            </button>
          </div>
        )}
      </header>
    </>
  );
};
