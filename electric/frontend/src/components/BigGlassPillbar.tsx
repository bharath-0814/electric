import React, { useState, useEffect } from 'react';
import { Home, Compass, Zap, QrCode, User } from 'lucide-react';
import type { EvoraUser } from '../lib/firebase';

interface BigGlassPillbarProps {
  currentUser: EvoraUser | null;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onOpenPasses: () => void;
}

export const BigGlassPillbar: React.FC<BigGlassPillbarProps> = ({
  currentUser,
  onOpenAuth,
  onOpenProfile,
  onOpenPasses,
}) => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 300;
      const stationEl = document.getElementById('station-section');
      const featEl = document.getElementById('features-section');
      const techEl = document.getElementById('technology-section');
      const aboutEl = document.getElementById('about-section');

      if (stationEl && scrollPos >= stationEl.offsetTop && (!featEl || scrollPos < featEl.offsetTop)) {
        setActiveTab('stations');
      } else if (featEl && scrollPos >= featEl.offsetTop && (!techEl || scrollPos < techEl.offsetTop)) {
        setActiveTab('features');
      } else if (techEl && scrollPos >= techEl.offsetTop) {
        setActiveTab('technology');
      } else if (aboutEl && scrollPos >= aboutEl.offsetTop) {
        setActiveTab('about');
      } else {
        setActiveTab('home');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string, tabName: string) => {
    setActiveTab(tabName);
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const navTabs = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      action: () => scrollTo('home', 'home'),
    },
    {
      id: 'stations',
      label: 'Stations Radar',
      icon: Compass,
      action: () => scrollTo('station-section', 'stations'),
    },
    {
      id: 'features',
      label: 'Features',
      icon: Zap,
      action: () => scrollTo('features-section', 'features'),
    },
    {
      id: 'passes',
      label: 'Fast Passes',
      icon: QrCode,
      action: onOpenPasses,
    },
    {
      id: 'profile',
      label: currentUser ? currentUser.displayName.split(' ')[0] : 'Sign In',
      icon: User,
      action: currentUser ? onOpenProfile : onOpenAuth,
    },
  ];

  return (
    <div className="fixed bottom-7 inset-x-0 z-50 flex justify-center items-center pointer-events-none px-4">
      {/* Big Glass Surface Capsule */}
      <div
        className="pointer-events-auto relative flex items-center gap-2 md:gap-3 px-4 md:px-6 py-3 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(0,82,255,0.2)] transition-all duration-300"
        style={{
          background: 'rgba(14, 12, 22, 0.78)',
          backdropFilter: 'blur(28px) saturate(220%)',
          WebkitBackdropFilter: 'blur(28px) saturate(220%)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow:
            '0 25px 50px -12px rgba(0, 0, 0, 0.75), inset 0 1px 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.5), 0 0 25px rgba(0, 82, 255, 0.18)',
        }}
      >
        {/* Top Edge Refraction Highlight */}
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent rounded-full pointer-events-none" />

        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isHovered = hoveredTab === tab.id;

          return (
            <div key={tab.id} className="relative flex flex-col items-center">
              {/* Tooltip on hover */}
              {isHovered && (
                <div className="absolute -top-10 px-3 py-1 rounded-full bg-black/90 text-white font-display text-[10px] uppercase tracking-wider whitespace-nowrap border border-white/10 shadow-lg pointer-events-none animate-fadeIn">
                  {tab.label}
                </div>
              )}

              <button
                type="button"
                onClick={tab.action}
                onMouseEnter={() => setHoveredTab(tab.id)}
                onMouseLeave={() => setHoveredTab(null)}
                className={`relative flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-full transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'text-white bg-white/10 shadow-[0_0_20px_rgba(0,82,255,0.4)] scale-105'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
                title={tab.label}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'text-[#0052FF] scale-110' : ''
                  }`}
                />

                {/* User avatar indicator if logged in */}
                {tab.id === 'profile' && currentUser && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 border border-black shadow-[0_0_8px_#34d399]" />
                )}
              </button>

              {/* Glowing Active Dot Indicator (As seen in Image 1) */}
              <div
                className={`w-1.5 h-1.5 rounded-full mt-0.5 transition-all duration-300 ${
                  isActive
                    ? 'bg-[#0052FF] shadow-[0_0_10px_#0052FF] opacity-100 scale-100'
                    : 'opacity-0 scale-50'
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
