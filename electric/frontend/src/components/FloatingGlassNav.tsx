import React, { useState, useEffect } from 'react';
import type { EvoraUser } from '../lib/firebase';
import { Menu, X } from 'lucide-react';

interface NavItem {
  label: string;
  targetId: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', targetId: 'home' },
  { label: 'Network', targetId: 'technology-section' },
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
      const scrollPos = window.scrollY + 280;
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
      {/* ══════════════ 1. SEPARATE TOP-LEFT EVORA BRANDMARK ══════════════ */}
      <div className="fixed top-5 md:top-6 left-5 md:left-10 z-50 pointer-events-auto">
        <button
          type="button"
          onClick={() => handleScrollTo('home')}
          className="flex items-center gap-2.5 px-4.5 py-2.5 rounded-full font-display text-base md:text-lg font-bold tracking-[0.14em] uppercase text-white transition-all duration-300 hover:scale-105 cursor-pointer shadow-[0_20px_50px_rgba(0,0,0,0.85)] group"
          style={{
            background: 'rgba(14, 14, 20, 0.82)',
            backdropFilter: 'blur(36px) saturate(220%)',
            WebkitBackdropFilter: 'blur(36px) saturate(220%)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.8), inset 0 1px 1.5px rgba(255, 255, 255, 0.35)',
          }}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#0052FF] shadow-[0_0_12px_#0052FF] group-hover:scale-125 transition-transform" />
          <span>
            <span className="text-[#0052FF]">EV</span>ORA
          </span>
        </button>
      </div>

      {/* ══════════════ 2. FLOATING LIQUID GLASS PILLBAR (TOP MIDDLE) ══════════════ */}
      <header className="fixed top-5 md:top-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center pointer-events-none">
        <div
          className="pointer-events-auto relative flex items-center gap-2 md:gap-3 px-3.5 md:px-5 py-2 md:py-2.5 rounded-full transition-all duration-500 shadow-[0_24px_70px_rgba(0,0,0,0.85)]"
          style={{
            background: 'rgba(14, 14, 20, 0.84)',
            backdropFilter: 'blur(48px) saturate(240%)',
            WebkitBackdropFilter: 'blur(48px) saturate(240%)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            boxShadow:
              '0 24px 70px -10px rgba(0, 0, 0, 0.85), inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.4), inset 0 -1.5px 2px 0 rgba(0, 0, 0, 0.6), 0 0 35px rgba(0, 82, 255, 0.12)',
          }}
        >
          {/* Top Edge Specular Refraction Highlight Line */}
          <div className="absolute inset-x-8 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/55 to-transparent rounded-full pointer-events-none" />

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
                  className={`relative px-5 py-2 rounded-full font-display text-xs font-bold tracking-[0.14em] uppercase transition-all duration-300 cursor-pointer select-none ${
                    isActive ? 'text-white' : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  {/* Active Glowing Glass Pill */}
                  {isActive && (
                    <div
                      className="absolute inset-0 rounded-full bg-[#0052FF] border border-[#38aaff]/60 shadow-[0_0_20px_rgba(0,82,255,0.7),inset_0_1px_1.5px_rgba(255,255,255,0.45)] transition-all duration-300"
                      style={{ animation: 'fadeIn 0.25s ease-out' }}
                    />
                  )}

                  {/* Hover Soft Glass Effect */}
                  {!isActive && isHovered && (
                    <div
                      className="absolute inset-0 rounded-full bg-white/10 border border-white/15 transition-all duration-200"
                      style={{ animation: 'fadeIn 0.2s ease-out' }}
                    />
                  )}

                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="w-[1px] h-4.5 bg-white/16" />

          {/* User Account / Log In */}
          <div className="flex items-center">
            {currentUser ? (
              <button
                type="button"
                onClick={onOpenProfile}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full font-display text-[11px] font-bold tracking-[0.12em] uppercase text-white bg-[#0052FF]/20 border border-[#0052FF]/50 hover:bg-[#0052FF]/30 transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(0,82,255,0.3)] hover:scale-105"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                <span className="max-w-[85px] truncate">{currentUser.displayName.split(' ')[0]}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="font-display text-[11px] font-bold tracking-[0.14em] uppercase text-neutral-300 hover:text-white px-3 py-1.5 transition-colors cursor-pointer"
              >
                Log In
              </button>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 ml-1 rounded-full bg-white/[0.06] text-white cursor-pointer"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Glass Dropdown Drawer */}
        {mobileMenuOpen && (
          <div
            className="pointer-events-auto absolute top-16 left-1/2 -translate-x-1/2 w-64 p-5 rounded-3xl text-white shadow-2xl flex flex-col gap-3 md:hidden"
            style={{
              background: 'rgba(14, 14, 20, 0.94)',
              backdropFilter: 'blur(48px) saturate(240%)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.9), 0 0 30px rgba(0,82,255,0.15)',
              animation: 'fadeUp 0.25s ease-out',
            }}
          >
            {NAV_ITEMS.map((item) => (
              <button
                key={item.targetId}
                type="button"
                onClick={() => handleScrollTo(item.targetId)}
                className="text-left font-display text-xs font-semibold tracking-[0.14em] uppercase text-neutral-200 hover:text-white py-1.5 border-b border-white/8 cursor-pointer"
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
              className="text-left font-display text-xs font-semibold tracking-[0.14em] uppercase text-[#38aaff] py-1.5 cursor-pointer"
            >
              {currentUser ? `My Account (${currentUser.displayName})` : 'Log In / Sign Up'}
            </button>
          </div>
        )}
      </header>
    </>
  );
};
