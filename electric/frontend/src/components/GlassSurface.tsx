import React, { useRef, useState } from 'react';

interface GlassSurfaceProps {
  children: React.ReactNode;
  className?: string;
  borderRadius?: string;
  blur?: number;
  opacity?: number;
  borderWidth?: number;
  highlightGlow?: boolean;
  style?: React.CSSProperties;
}

export const GlassSurface: React.FC<GlassSurfaceProps> = ({
  children,
  className = '',
  borderRadius = '9999px',
  blur = 20,
  opacity = 0.65,
  borderWidth = 1,
  highlightGlow = true,
  style = {},
}) => {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, active: false });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!surfaceRef.current || !highlightGlow) return;
    const rect = surfaceRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    });
  };

  const handleMouseLeave = () => {
    setMousePos((prev) => ({ ...prev, active: false }));
  };

  return (
    <div
      ref={surfaceRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden transition-all duration-300 ${className}`}
      style={{
        borderRadius,
        backdropFilter: `blur(${blur}px) saturate(180%)`,
        WebkitBackdropFilter: `blur(${blur}px) saturate(180%)`,
        background: `rgba(14, 14, 16, ${opacity})`,
        border: `${borderWidth}px solid rgba(255, 255, 255, 0.12)`,
        boxShadow: `
          0 8px 32px 0 rgba(0, 0, 0, 0.37),
          inset 0 1px 1px 0 rgba(255, 255, 255, 0.15),
          inset 0 -1px 1px 0 rgba(0, 0, 0, 0.4)
        `,
        ...style,
      }}
    >
      {/* Specular Radial Glow on Cursor Hover */}
      {highlightGlow && mousePos.active && (
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-300"
          style={{
            borderRadius,
            background: `radial-gradient(180px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 82, 255, 0.25), transparent 70%)`,
          }}
        />
      )}

      {/* Top Glass Refraction Edge Line */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
        style={{ borderRadius }}
      />

      <div className="relative z-10">{children}</div>
    </div>
  );
};
