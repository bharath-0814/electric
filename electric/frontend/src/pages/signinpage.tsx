import { useEffect, useRef, useState } from "react";
import "./signinpage.css";
import { FloatingGlassNav } from "../components/FloatingGlassNav";
import { BookingModal } from "../components/BookingModal";
import { BookingPassModal } from "../components/BookingPassModal";
import { UserBookingsDrawer } from "../components/UserBookingsDrawer";
import { AuthModal } from "../components/AuthModal";
import { UserProfileModal } from "../components/UserProfileModal";
import { ContactModal } from "../components/ContactModal";
import { authService, type EvoraUser } from "../lib/firebase";
import type { Station, Reservation } from "../types";

function useInView<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function useCounter(target: number, duration = 2200, active = false) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) return;
    let t0: number | null = null;
    const tick = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      setN(Math.round(ease * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration, active]);
  return n;
}

function Rule({ light = false, className = "" }: { light?: boolean; className?: string }) {
  return (
    <div
      className={`w-full h-px ${className}`}
      style={{ background: light ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)" }}
    />
  );
}

// Eyebrow label
function Label({ children, light = false, className = "" }: { children: string; light?: boolean; className?: string }) {
  return (
    <span
      className={`font-display text-[10px] font-bold tracking-[0.2em] uppercase ${className}`}
      style={{ color: light ? "rgba(255,255,255,0.6)" : "#717171" }}
    >
      {children}
    </span>
  );
}

// Animated counter stat
function StatBlock({
  value, suffix, label, active, delay = 0, light = false,
}: {
  value: number; suffix: string; label: string; active: boolean; delay?: number; light?: boolean;
}) {
  const n = useCounter(value, 2000, active);
  return (
    <div
      className="flex flex-col gap-2 py-10 px-8 border-r last:border-r-0"
      style={{
        borderColor: light ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)",
        opacity: active ? 1 : 0,
        animation: active ? `countUp 0.7s ${delay}ms cubic-bezier(0.16,1,0.3,1) both` : "none",
      }}
    >
      <span
        className="font-display text-5xl md:text-6xl font-bold tracking-tight leading-none"
        style={{ color: light ? "#fff" : "#0A0A0A" }}
      >
        {n.toLocaleString()}
        <span style={{ color: "#0052FF" }}>{suffix}</span>
      </span>
      <Label light={light}>{label}</Label>
    </div>
  );
}

/* ═══════════════════════════════════════
   Vehicle Finishes & Dynamic Palettes
═══════════════════════════════════════ */

interface VehicleFinish {
  id: string;
  name: string;
  swatchHex: string;
  glowColor: string;
  accentColor: string;
  imageUrl: string;
}

const VEHICLE_FINISHES: VehicleFinish[] = [
  {
    id: 'stealth-onyx',
    name: 'Stealth Onyx',
    swatchHex: '#1E1E24',
    glowColor: 'rgba(0, 82, 255, 0.22)',
    accentColor: '#0052FF',
    imageUrl: 'https://images.unsplash.com/photo-1704476944918-c1258561ebb9?w=1920&h=1080&fit=crop&auto=format&q=90',
  },
  {
    id: 'sapphire-blue',
    name: 'Electric Sapphire',
    swatchHex: '#2563EB',
    glowColor: 'rgba(37, 99, 235, 0.35)',
    accentColor: '#38aaff',
    imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1920&h=1080&fit=crop&auto=format&q=90',
  },
  {
    id: 'emerald-cyber',
    name: 'Emerald Matrix',
    swatchHex: '#059669',
    glowColor: 'rgba(16, 185, 129, 0.35)',
    accentColor: '#34d399',
    imageUrl: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=1920&h=1080&fit=crop&auto=format&q=90',
  },
  {
    id: 'liquid-copper',
    name: 'Liquid Copper',
    swatchHex: '#EA580C',
    glowColor: 'rgba(234, 88, 12, 0.35)',
    accentColor: '#fb923c',
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&h=1080&fit=crop&auto=format&q=90',
  },
  {
    id: 'cyber-violet',
    name: 'Cyber Violet',
    swatchHex: '#8B5CF6',
    glowColor: 'rgba(139, 92, 246, 0.35)',
    accentColor: '#a78bfa',
    imageUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1920&h=1080&fit=crop&auto=format&q=90',
  },
];

const NIGHT_IMG   = "https://images.unsplash.com/photo-1748843765943-27ef9aad505d?w=1200&h=900&fit=crop&auto=format&q=90";
const NEON_IMG    = "https://images.unsplash.com/photo-1776610148977-07b1e2dca438?w=1200&h=900&fit=crop&auto=format&q=90";

export default function Signinpage() {
  // Vehicle selected finish state
  const [selectedFinish, setSelectedFinish] = useState<VehicleFinish>(VEHICLE_FINISHES[0]);

  // User auth state
  const [currentUser, setCurrentUser] = useState<EvoraUser | null>(null);

  // Modals state
  const [authOpen, setAuthOpen] = useState(false);
  const [authPromptReason, setAuthPromptReason] = useState<string>("");
  const [pendingAuthAction, setPendingAuthAction] = useState<(() => void) | null>(null);

  const [profileOpen, setProfileOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [bookingsDrawerOpen, setBookingsDrawerOpen] = useState(false);
  const [bookingStation, setBookingStation] = useState<Station | null>(null);
  const [activeReservationPass, setActiveReservationPass] = useState<Reservation | null>(null);

  const statsSection = useInView<HTMLDivElement>(0.3);
  const featSection  = useInView<HTMLDivElement>(0.15);

  // Sync Firebase / User & Check Redirect Login
  useEffect(() => {
    authService.checkRedirectResult().then((user) => {
      if (user) setCurrentUser(user);
    });
    const unsub = authService.subscribe((user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleRequireAuth = (reason: string, onAuthed?: () => void) => {
    setAuthPromptReason(reason);
    if (onAuthed) {
      setPendingAuthAction(() => onAuthed);
    } else {
      setPendingAuthAction(null);
    }
    setAuthOpen(true);
  };

  const handleAuthSuccess = (user: EvoraUser) => {
    setCurrentUser(user);
    setAuthOpen(false);
    if (pendingAuthAction) {
      pendingAuthAction();
      setPendingAuthAction(null);
    }
  };

  const handleBookingSuccess = (reservation: Reservation) => {
    setBookingStation(null);
    setActiveReservationPass(reservation);
  };

  const handleOpenPassesDrawer = () => {
    if (!currentUser) {
      handleRequireAuth("Sign in with Google to view and manage your active charging passes.", () => {
        setBookingsDrawerOpen(true);
      });
    } else {
      setBookingsDrawerOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">

      {/* ══════════════ MASTER FLOATING LIQUID GLASS PILLBAR (TOP CENTER) ══════════════ */}
      <FloatingGlassNav
        currentUser={currentUser}
        onOpenPasses={handleOpenPassesDrawer}
        onOpenAuth={() => handleRequireAuth("Sign in with Google to access reserved charging slots & fast passes.")}
        onOpenProfile={() => setProfileOpen(true)}
        onOpenContact={() => setContactOpen(true)}
      />

      {/* ══════════════ HERO SECTION (DYNAMIC VEHICLE FINISH CHANGER) ══════════════ */}
      <section id="home" className="relative h-screen min-h-175 flex items-end overflow-hidden">
        {/* Dynamic Cross-Fading Vehicle Images */}
        <div className="absolute inset-0 bg-black">
          {VEHICLE_FINISHES.map((finish) => (
            <img
              key={finish.id}
              src={finish.imageUrl}
              alt={`${finish.name} vehicle`}
              className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ease-in-out ${
                selectedFinish.id === finish.id ? 'opacity-90 scale-100' : 'opacity-0 scale-105 pointer-events-none'
              }`}
              style={{ filter: "brightness(0.85)" }}
            />
          ))}

          {/* Dynamic Illumination Aura reflecting selected vehicle finish */}
          <div
            className="absolute inset-0 transition-all duration-700 ease-in-out pointer-events-none"
            style={{
              background: `radial-gradient(circle at 75% 65%, ${selectedFinish.glowColor} 0%, transparent 60%)`,
            }}
          />

          <div className="absolute inset-0" style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.1) 100%)"
          }} />
          <div className="absolute inset-0" style={{
            background: "linear-gradient(to right, rgba(0,0,0,0.65) 0%, transparent 55%)"
          }} />
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-8 pb-20">
          <div className="fade-in mb-6" style={{ animationDelay: "200ms" }}>
            <div className="inline-flex items-center gap-3">
              <span className="w-6 h-px" style={{ background: selectedFinish.accentColor }} />
              <Label light>Next-Generation EV Charging</Label>
            </div>
          </div>

          <h1
            className="font-display font-bold leading-[0.95] mb-8"
            style={{ fontSize: "clamp(52px, 9vw, 120px)", color: "#fff" }}
          >
            <span
              className="block overflow-hidden"
              style={{ animation: "maskReveal 1.1s 0.4s cubic-bezier(0.77,0,0.175,1) both" }}
            >
              Fueling the
            </span>
            <span
              className="block overflow-hidden"
              style={{ animation: "maskReveal 1.1s 0.6s cubic-bezier(0.77,0,0.175,1) both" }}
            >
              <em style={{ fontStyle: "normal", color: selectedFinish.accentColor }}>Next</em> Electric
            </span>
            <span
              className="block overflow-hidden"
              style={{ animation: "maskReveal 1.1s 0.8s cubic-bezier(0.77,0,0.175,1) both" }}
            >
              Era.
            </span>
          </h1>

          <div
            className="flex flex-col sm:flex-row items-start sm:items-center gap-8"
            style={{ animation: "fadeUp 0.8s 1.2s cubic-bezier(0.16,1,0.3,1) both" }}
          >
            <p style={{ color: "rgba(255,255,255,0.65)", maxWidth: "340px", lineHeight: 1.7, fontSize: "15px" }}>
              High-power 150-350kW liquid-cooled charging hubs connected to an intelligent renewable grid with TomTom EV route intelligence.
            </p>

            <div className="flex items-center gap-4 shrink-0">
              <button
                onClick={() => scrollToSection("features-section")}
                className="font-display font-bold text-[12px] tracking-[0.15em] uppercase px-8 py-4 rounded-full transition-all duration-300 active:scale-95 cursor-pointer"
                style={{
                  background: selectedFinish.accentColor,
                  color: "#fff",
                  boxShadow: `0 8px 32px ${selectedFinish.glowColor}`,
                }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 12px 48px ${selectedFinish.glowColor}`)}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = `0 8px 32px ${selectedFinish.glowColor}`)}
              >
                Explore Features
              </button>
              <button
                onClick={() => scrollToSection("technology-section")}
                className="font-display font-semibold text-[12px] tracking-[0.15em] uppercase flex items-center gap-2 transition-all duration-300 group cursor-pointer"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                <span>Our Network</span>
                <svg
                  width="16" height="16" viewBox="0 0 16 16" fill="none"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* ══════════════ INTERACTIVE VEHICLE FINISH SELECTOR ══════════════ */}
        <div
          className="absolute bottom-20 right-8 md:right-16 hidden lg:flex items-center gap-4 z-20"
          style={{ animation: "fadeIn 0.8s 1.8s ease both" }}
        >
          {/* Liquid Glass Finish Selector Capsule */}
          <div
            className="flex items-center gap-3 px-4 py-2.5 rounded-full border border-white/16 shadow-[0_20px_50px_rgba(0,0,0,0.85)] transition-all duration-300"
            style={{
              background: 'rgba(14, 14, 20, 0.78)',
              backdropFilter: 'blur(32px) saturate(220%)',
              WebkitBackdropFilter: 'blur(32px) saturate(220%)',
              boxShadow: '0 20px 50px -10px rgba(0,0,0,0.8), inset 0 1px 1.5px rgba(255,255,255,0.35)',
            }}
          >
            <span className="text-[10px] font-display font-bold uppercase tracking-widest text-neutral-400">
              Color
            </span>

            {/* Interactive Swatch Dots */}
            <div className="flex items-center gap-2">
              {VEHICLE_FINISHES.map((finish) => {
                const isSelected = selectedFinish.id === finish.id;
                return (
                  <button
                    key={finish.id}
                    type="button"
                    onClick={() => setSelectedFinish(finish)}
                    className={`w-6 h-6 rounded-full transition-all duration-300 cursor-pointer relative flex items-center justify-center ${
                      isSelected
                        ? 'scale-125 ring-2 ring-white shadow-[0_0_12px_rgba(255,255,255,0.7)] z-10'
                        : 'opacity-70 hover:opacity-100 hover:scale-110'
                    }`}
                    style={{
                      background: finish.swatchHex,
                      border: isSelected ? '2px solid #ffffff' : '1.5px solid rgba(255,255,255,0.3)',
                    }}
                    title={`Switch to ${finish.name}`}
                    aria-label={`Select ${finish.name}`}
                  />
                );
              })}
            </div>

            <div className="w-[1px] h-4 bg-white/20" />

            <div className="flex flex-col">
              <span className="text-[11px] font-display font-bold text-white leading-tight">
                {selectedFinish.name}
              </span>
              <span className="text-[9px] font-mono text-neutral-400">102K+ Reviews</span>
            </div>
          </div>
        </div>

        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
          onClick={() => scrollToSection("stats-section")}
          style={{ animation: "fadeIn 1s 2.2s ease both" }}
        >
          <div className="w-px h-10 bg-gradient-to-b from-transparent to-white/40"
            style={{ animation: "floatY 2s ease-in-out infinite" }} />
        </div>
      </section>

      {/* ══════════════ STATS ══════════════ */}
      <section
        id="stats-section"
        ref={statsSection.ref}
        className="bg-[#FAFAFA] border-b"
        style={{ borderColor: "rgba(0,0,0,0.06)" }}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5">
          <StatBlock value={570}  suffix="+"  label="Premium Locations"   active={statsSection.visible} delay={0}   />
          <StatBlock value={2200} suffix="+"  label="High-Power Chargers" active={statsSection.visible} delay={100} />
          <StatBlock value={1200} suffix="+"  label="DC Fast Chargers"    active={statsSection.visible} delay={200} />
          <StatBlock value={1400} suffix="+"  label="Level 2 Chargers"    active={statsSection.visible} delay={300} />
          <StatBlock value={24}   suffix="/7" label="Station Reliability" active={statsSection.visible} delay={400} />
        </div>
      </section>

      {/* ══════════════ BRAND STATEMENT ══════════════ */}
      <section id="about-section" className="py-28 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
            <div>
              <Label className="block mb-5">Our Belief</Label>
              <h2
                className="font-display font-bold leading-[1.08] text-[#0A0A0A]"
                style={{ fontSize: "clamp(30px, 4.5vw, 58px)", animation: "fadeUp 0.8s 0.1s both" }}
              >
                The future of driving
                <br />shouldn't wait.{" "}
                <span className="text-gradient">Evora</span>
                <br />
                <span className="text-gradient">makes it instant.</span>
              </h2>
            </div>

            <div
              className="flex flex-col gap-6 lg:pt-16"
              style={{ animation: "fadeUp 0.8s 0.25s both" }}
            >
              <p style={{ color: "#3A3A3A", lineHeight: 1.85, fontSize: "15px" }}>
                We built Evora because the transition to electric shouldn't feel like a compromise. Every station we deploy is positioned, designed, and calibrated to make charging feel as natural as breathing — whether you're crossing the country or running errands.
              </p>
              <div className="w-12 h-px" style={{ background: "rgba(0,82,255,0.3)" }} />
              <p style={{ color: "#717171", lineHeight: 1.85, fontSize: "15px" }}>
                Our proprietary liquid-cooled cables sustain peak output across every session. Powered by TomTom EV network intelligence, our AI balances load in real time, drawing from the cleanest available grid sources.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ FEATURES ══════════════ */}
      <section
        id="features-section"
        ref={featSection.ref}
        className="py-28"
      >
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 items-end gap-8 mb-16 pb-8 border-b" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
            <div>
              <Label className="block mb-3">What Sets Us Apart</Label>
              <h2
                className="font-display font-bold text-[#0A0A0A] leading-tight"
                style={{
                  fontSize: "clamp(26px, 3.5vw, 48px)",
                  opacity: featSection.visible ? 1 : 0,
                  animation: featSection.visible ? "fadeUp 0.7s 0.1s both" : "none",
                }}
              >
                Engineered
                <br />for the road
                <br />ahead.
              </h2>
            </div>
            <div />
            <div className="flex justify-end items-end">
              <button
                onClick={() => scrollToSection("technology-section")}
                className="font-display font-bold text-[11px] tracking-[0.15em] uppercase flex items-center gap-2 group transition-colors duration-300 cursor-pointer"
                style={{ color: "#0052FF" }}
              >
                <span>Our Network</span>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="transition-transform duration-300 group-hover:translate-x-1">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="flex flex-col divide-y" style={{ "--divide-color": "rgba(0,0,0,0.06)" } as React.CSSProperties}>
            {[
              { num: "01", title: "Ultra-Fast 150-350 kW",   desc: "Dual-gun liquid-cooled DC output sustains peak power for the full session. 200 miles of range in under 15 minutes.",                                                              tag: "Speed"          },
              { num: "02", title: "Smart Grid Intelligence",   desc: "Real-time AI load balancing draws from renewable sources, reducing your carbon footprint by up to 80% per charge.",                                                                    tag: "Sustainability" },
              { num: "03", title: "TomTom EV Predictive Availability", desc: "Surface live occupancy, reachable radius, and real-time traffic delay before you leave — so you always arrive to an open gun.",                               tag: "Connectivity"   },
              { num: "04", title: "Multi-Layer Safety",        desc: "Automatic fault detection, arc suppression, surge protection, and tamper-resistant hardware — monitored around the clock.",                                                              tag: "Safety"         },
            ].map((f, i) => (
              <div
                key={f.num}
                className="group grid grid-cols-12 items-center gap-6 py-7 cursor-default transition-all duration-300 hover:bg-[#f5f7ff] -mx-4 px-4 rounded-xl"
                style={{
                  borderColor: "rgba(0,0,0,0.06)",
                  opacity: featSection.visible ? 1 : 0,
                  animation: featSection.visible ? `fadeUp 0.55s ${i * 90 + 150}ms both` : "none",
                }}
              >
                <span
                  className="col-span-1 font-mono font-bold text-xs tracking-[0.2em] tabular-nums"
                  style={{ color: "#C8C8C8" }}
                >
                  {f.num}
                </span>

                <h3
                  className="col-span-12 md:col-span-3 font-display font-bold text-lg leading-snug transition-colors duration-300 group-hover:text-[#0052FF]"
                  style={{ color: "#0A0A0A" }}
                >
                  {f.title}
                </h3>

                <p
                  className="col-span-12 md:col-span-5 text-sm leading-relaxed"
                  style={{ color: "#717171" }}
                >
                  {f.desc}
                </p>

                <div className="col-span-12 md:col-span-3 flex items-center justify-between md:justify-end gap-4">
                  <span
                    className="font-display text-[10px] font-bold tracking-[0.18em] uppercase px-3 py-1.5 rounded-full"
                    style={{ background: "rgba(0,82,255,0.07)", color: "#0052FF" }}
                  >
                    {f.tag}
                  </span>
                  <svg
                    width="16" height="16" viewBox="0 0 16 16" fill="none"
                    className="opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1 shrink-0"
                    style={{ color: "#0052FF" }}
                  >
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ SPLIT SHOWCASE ══════════════ */}
      <section id="technology-section" className="bg-[#0A0A0A] overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 py-28 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div
            className="relative rounded-2xl overflow-hidden order-1"
            style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.6)", aspectRatio: "4/3" }}
          >
            <img
              src={NIGHT_IMG}
              alt="EV charging at night"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(0,82,255,0.12) 0%, transparent 55%)" }} />

            <div
              className="absolute bottom-6 left-6 right-6 rounded-xl px-5 py-4 flex items-center justify-between gap-4"
              style={{ background: "rgba(10,10,10,0.8)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div>
                <div className="font-display text-2xl font-bold" style={{ color: "#fff" }}>
                  350 <span style={{ color: "#0052FF" }}>kW</span>
                </div>
                <div className="text-[10px] tracking-widest uppercase mt-0.5 font-semibold" style={{ color: "rgba(255,255,255,0.35)" }}>Peak Charge Rate</div>
              </div>
              <div className="flex-1 max-w-30">
                <div className="h-1 rounded-full mb-1.5" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <div className="h-full w-[88%] rounded-full" style={{ background: "linear-gradient(90deg, #0052FF, #38aaff)" }} />
                </div>
                <div className="text-[9px] tracking-wider font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>Ultra Session active</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-10 order-2">
            <div>
              <Label light className="block mb-4">Our Technology</Label>
              <h2
                className="font-display font-bold leading-tight"
                style={{ fontSize: "clamp(28px, 3.5vw, 48px)", color: "#fff" }}
              >
                Power that moves
                <br />
                <span className="text-gradient">at your speed.</span>
              </h2>
            </div>

            <p style={{ color: "rgba(255,255,255,0.45)", lineHeight: 1.85, fontSize: "15px" }}>
              Evora stations are deployed at premium locations — urban centers, highway corridors, destination hubs with TomTom EV routing. You're never more than minutes from an ultra-fast charge.
            </p>

            <div
              className="grid grid-cols-2 gap-px rounded-xl overflow-hidden"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              {[
                { stat: "350 kW",  label: "Liquid-cooled\npeak output" },
                { stat: "99.8%",   label: "Network\nuptime SLA" },
                { stat: "80%",     label: "Carbon reduction\nper session" },
                { stat: "< 1 min", label: "Average session\nstart time" },
              ].map(({ stat, label }) => (
                <div
                  key={stat}
                  className="flex flex-col gap-1.5 p-5"
                  style={{ background: "#141414" }}
                >
                  <span className="font-display font-bold text-2xl" style={{ color: "#fff" }}>{stat}</span>
                  <span className="text-xs leading-snug whitespace-pre-line" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</span>
                </div>
              ))}
            </div>

            <div>
              <button
                onClick={() => setContactOpen(true)}
                className="font-display font-bold text-[12px] tracking-[0.15em] uppercase px-8 py-4 rounded-full transition-all duration-300 active:scale-95 cursor-pointer"
                style={{ background: "#0052FF", color: "#fff", boxShadow: "0 8px 32px rgba(0,82,255,0.35)" }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 12px 44px rgba(0,82,255,0.55)")}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,82,255,0.35)")}
              >
                Connect with Evora
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ SECOND IMAGE ROW ══════════════ */}
      <section className="py-32 max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative rounded-2xl overflow-hidden aspect-4/3"
            style={{ boxShadow: "0 16px 48px rgba(0,0,0,0.1)" }}>
            <img
              src={NEON_IMG}
              alt="EV under neon lights"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col gap-8">
            <Label>The Evora Network</Label>
            <h2
              className="font-display font-bold text-[#0A0A0A] leading-tight"
              style={{ fontSize: "clamp(28px, 4vw, 52px)" }}
            >
              Wherever you
              <br />
              drive, we're there.
            </h2>
            <p style={{ color: "#717171", lineHeight: 1.8, fontSize: "15px" }}>
              570+ premium locations across major corridors and city centers. Every station is monitored 24/7 with TomTom live telemetry.
            </p>

            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: "⚡", label: "Fast DC Charging" },
                { icon: "📱", label: "QR Pass Control" },
                { icon: "🌿", label: "Green Energy" },
                { icon: "🔒", label: "Secure Payment" },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <span
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-base shrink-0"
                    style={{ background: "rgba(0,82,255,0.07)" }}
                  >
                    {icon}
                  </span>
                  <span className="font-display font-bold text-sm" style={{ color: "#3A3A3A" }}>{label}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => scrollToSection("features-section")}
              className="font-display font-bold text-[12px] tracking-[0.15em] uppercase px-8 py-4 rounded-full w-fit border-2 transition-all duration-300 active:scale-95 group cursor-pointer"
              style={{ borderColor: "#0A0A0A", color: "#0A0A0A" }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "#0A0A0A";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#0A0A0A";
              }}
            >
              Explore Features
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer className="max-w-7xl mx-auto px-8 pt-16 pb-10">
        <div className="flex flex-col md:flex-row justify-between gap-12 pb-12">
          {/* Brand */}
          <div className="flex flex-col gap-4 max-w-xs">
            <div className="font-display text-xl font-bold tracking-[0.12em] uppercase">
              <span style={{ color: "#0052FF" }}>EV</span>
              <span style={{ color: "#0A0A0A" }}>ORA</span>
            </div>
            <p style={{ color: "#717171", fontSize: "14px", lineHeight: 1.7 }}>
              Intelligent EV charging infrastructure built for the next generation of mobility.
            </p>
          </div>

          {/* Links */}
          {[
            { title: "Product", links: ["Features", "Network", "Pricing", "App"] },
            { title: "Company", links: ["About", "Careers", "Press", "Blog"] },
            { title: "Support", links: ["Help Center", "Contact", "Status", "Terms"] },
          ].map((col) => (
            <div key={col.title} className="flex flex-col gap-4">
              <Label>{col.title}</Label>
              {col.links.map((l) => (
                <a
                  key={l}
                  href={l === "Features" ? "#features-section" : l === "Network" ? "#technology-section" : l === "About" ? "#about-section" : "#"}
                  onClick={(e) => {
                    if (l === "Features") {
                      e.preventDefault();
                      scrollToSection("features-section");
                    } else if (l === "Network") {
                      e.preventDefault();
                      scrollToSection("technology-section");
                    } else if (l === "About") {
                      e.preventDefault();
                      scrollToSection("about-section");
                    } else if (l === "Contact" || l === "Help Center") {
                      e.preventDefault();
                      setContactOpen(true);
                    }
                  }}
                  className="text-sm font-semibold transition-colors duration-200 cursor-pointer"
                  style={{ color: "#717171" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#0A0A0A")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#717171")}
                >
                  {l}
                </a>
              ))}
            </div>
          ))}
        </div>

        <Rule />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8">
          <p className="text-[12px]" style={{ color: "#C0C0C0" }}>© 2026 Evora Energy, Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            {["Privacy Policy", "Terms of Service", "Cookie Settings"].map((l) => (
              <a key={l} href="#" className="text-[11px] font-semibold transition-colors duration-200"
                style={{ color: "#C0C0C0" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#0A0A0A")}
                onMouseLeave={e => (e.currentTarget.style.color = "#C0C0C0")}
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>

      {/* ══════════════ MODALS & DRAWERS ══════════════ */}
      <AuthModal
        isOpen={authOpen}
        promptReason={authPromptReason}
        onClose={() => {
          setAuthOpen(false);
          setPendingAuthAction(null);
        }}
        onSuccess={handleAuthSuccess}
      />

      {currentUser && (
        <UserProfileModal
          isOpen={profileOpen}
          onClose={() => setProfileOpen(false)}
          user={currentUser}
          onLogout={() => setCurrentUser(null)}
        />
      )}

      <ContactModal
        isOpen={contactOpen}
        onClose={() => setContactOpen(false)}
      />

      <UserBookingsDrawer
        isOpen={bookingsDrawerOpen}
        onClose={() => setBookingsDrawerOpen(false)}
        userEmail={currentUser?.email || ""}
        onViewPass={(reservation) => setActiveReservationPass(reservation)}
      />

      <BookingModal
        station={bookingStation}
        userEmail={currentUser?.email || "driver@evora.energy"}
        userName={currentUser?.displayName || "Evora Driver"}
        onClose={() => setBookingStation(null)}
        onSuccess={handleBookingSuccess}
      />

      <BookingPassModal
        reservation={activeReservationPass}
        onClose={() => setActiveReservationPass(null)}
      />
    </div>
  );
}
