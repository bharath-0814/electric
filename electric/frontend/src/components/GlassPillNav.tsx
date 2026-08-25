import React, { useState, useEffect } from 'react';
import { GlassSurface } from './GlassSurface';

interface NavItem {
  label: string;
  targetId: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', targetId: 'home' },
  { label: 'About', targetId: 'about-section' },
  { label: 'Features', targetId: 'features-section' },
  { label: 'Stations', targetId: 'station-section' },
];

interface GlassPillNavProps {
  navDark?: boolean;
}

export const GlassPillNav: React.FC<GlassPillNavProps> = ({ navDark = false }) => {
  const [activeSection, setActiveSection] = useState<string>('home');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
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
      if (window.scrollY < 200) {
        setActiveSection('home');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollTo = (targetId: string) => {
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
    <GlassSurface
      borderRadius="9999px"
      blur={24}
      opacity={navDark ? 0.75 : 0.45}
      borderWidth={1}
      className="px-2 py-1.5 shadow-2xl"
    >
      <nav className="flex items-center gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.targetId;
          return (
            <button
              key={item.targetId}
              type="button"
              onClick={() => handleScrollTo(item.targetId)}
              className={`relative px-4 py-1.5 rounded-full font-display text-[11px] font-semibold tracking-[0.16em] uppercase transition-all duration-300 cursor-pointer select-none ${
                isActive
                  ? 'text-white'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              {/* Active Glass Pill Background */}
              {isActive && (
                <div
                  className="absolute inset-0 rounded-full bg-[#0052FF]/30 border border-[#0052FF]/50 shadow-[0_0_15px_rgba(0,82,255,0.4)] transition-all duration-300"
                  style={{ animation: 'fadeIn 0.25s ease-out' }}
                />
              )}

              {/* Hover effect when not active */}
              {!isActive && (
                <div className="absolute inset-0 rounded-full hover:bg-white/5 transition-colors" />
              )}

              <span className="relative z-10">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </GlassSurface>
  );
};
