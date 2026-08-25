import React, { useState, useEffect } from 'react';

interface NavItem {
  label: string;
  targetId: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', targetId: 'home' },
  { label: 'About', targetId: 'about-section' },
  { label: 'Features', targetId: 'features-section' },
  { label: 'Network', targetId: 'technology-section' },
];

interface GlassPillNavProps {
  navDark?: boolean;
}

export const GlassPillNav: React.FC<GlassPillNavProps> = ({ navDark = false }) => {
  const [activeSection, setActiveSection] = useState<string>('home');
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 260;
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
    <div
      className="relative flex items-center p-2 rounded-full transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
      style={{
        background: navDark
          ? 'rgba(12, 12, 16, 0.82)'
          : 'rgba(255, 255, 255, 0.12)',
        backdropFilter: 'blur(36px) saturate(220%)',
        WebkitBackdropFilter: 'blur(36px) saturate(220%)',
        border: navDark
          ? '1px solid rgba(255, 255, 255, 0.18)'
          : '1px solid rgba(255, 255, 255, 0.28)',
        boxShadow: navDark
          ? '0 25px 60px -12px rgba(0, 0, 0, 0.7), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.3)'
          : '0 25px 60px -12px rgba(0, 0, 0, 0.45), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.45)',
      }}
    >
      {/* Top Glass Specular Refraction Highlight */}
      <div className="absolute inset-x-8 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full pointer-events-none" />

      <nav className="flex items-center gap-1.5 relative z-10">
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
              className={`relative px-6 py-3 rounded-full font-display text-[13px] font-bold tracking-[0.14em] uppercase transition-all duration-300 cursor-pointer select-none ${
                isActive
                  ? 'text-white'
                  : navDark
                  ? 'text-neutral-300 hover:text-white'
                  : 'text-white/85 hover:text-white'
              }`}
            >
              {/* Active Glass Pill Highlight */}
              {isActive && (
                <div
                  className="absolute inset-0 rounded-full bg-[#0052FF] border border-[#38aaff]/60 shadow-[0_0_24px_rgba(0,82,255,0.7),inset_0_1px_1.5px_rgba(255,255,255,0.45)] transition-all duration-300"
                  style={{ animation: 'fadeIn 0.25s ease-out' }}
                />
              )}

              {/* Hover effect when not active */}
              {!isActive && isHovered && (
                <div
                  className="absolute inset-0 rounded-full bg-white/12 border border-white/20 transition-all duration-200"
                  style={{ animation: 'fadeIn 0.2s ease-out' }}
                />
              )}

              <span className="relative z-10">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
