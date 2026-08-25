import { useEffect, useState } from "react";
import "./signinpage.css";
import { FloatingGlassNav } from "../components/FloatingGlassNav";
import { AuthModal } from "../components/AuthModal";
import { UserProfileModal } from "../components/UserProfileModal";
import { authService, type EvoraUser } from "../lib/firebase";
import { Zap, Gauge, Activity, Sliders } from "lucide-react";

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

/* ═══════════════════════════════════════
   Static Background Images & Specs
═══════════════════════════════════════ */

const HERO_GREEN_IMG = "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=1920&h=1080&fit=crop&auto=format&q=90";
const NIGHT_IMG      = "https://images.unsplash.com/photo-1748843765943-27ef9aad505d?w=1200&h=900&fit=crop&auto=format&q=90";
const NEON_IMG       = "https://images.unsplash.com/photo-1776610148977-07b1e2dca438?w=1200&h=900&fit=crop&auto=format&q=90";

interface DriveModeConfig {
  id: string;
  label: string;
  peakPower: string;
  torque: string;
  zeroSixty: string;
  frontTorque: number;
  rearTorque: number;
  efficiency: string;
  auraColor: string;
  accentHex: string;
}

const DRIVE_MODES: DriveModeConfig[] = [
  {
    id: "hyper",
    label: "Hyper Dynamic",
    peakPower: "640 kW",
    torque: "885 Nm",
    zeroSixty: "2.7s",
    frontTorque: 42,
    rearTorque: 58,
    efficiency: "96.4%",
    auraColor: "rgba(16, 185, 129, 0.42)",
    accentHex: "#34d399",
  },
  {
    id: "track",
    label: "Track Vector",
    peakPower: "760 kW",
    torque: "980 Nm",
    zeroSixty: "2.4s",
    frontTorque: 35,
    rearTorque: 65,
    efficiency: "93.8%",
    auraColor: "rgba(0, 82, 255, 0.45)",
    accentHex: "#38aaff",
  },
  {
    id: "eco",
    label: "Grid Sustain",
    peakPower: "380 kW",
    torque: "540 Nm",
    zeroSixty: "3.8s",
    frontTorque: 50,
    rearTorque: 50,
    efficiency: "99.4%",
    auraColor: "rgba(56, 189, 248, 0.35)",
    accentHex: "#38bdf8",
  },
];

export default function Signinpage() {
  // Drive mode state
  const [selectedMode, setSelectedMode] = useState<DriveModeConfig>(DRIVE_MODES[0]);
  const [showHud, setShowHud] = useState(true);

  // Interactive charging simulator state
  const [batterySize, setBatterySize] = useState<number>(82);
  const [targetSoc, setTargetSoc] = useState<number>(80);

  // User auth state
  const [currentUser, setCurrentUser] = useState<EvoraUser | null>(null);

  // Modals state
  const [authOpen, setAuthOpen] = useState(false);
  const [authPromptReason, setAuthPromptReason] = useState<string>("");
  const [pendingAuthAction, setPendingAuthAction] = useState<(() => void) | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

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

  // Charge simulator calculation
  const chargedKwh = (batterySize * (targetSoc - 10)) / 100;
  const chargeMinutes = Math.max(8, Math.round((chargedKwh / 350) * 60 * 1.15));
  const rangeAddedMiles = Math.round(chargedKwh * 3.6);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">

      {/* ══════════════ FLOATING NAVIGATION: EVORA (TOP LEFT) & PILLBAR (TOP MIDDLE) ══════════════ */}
      <FloatingGlassNav
        currentUser={currentUser}
        onOpenAuth={() => handleRequireAuth("Sign in with Google to access your cloud profile & vehicle specs.")}
        onOpenProfile={() => setProfileOpen(true)}
      />

      {/* ══════════════ HERO SECTION (STATIC GREEN LIGHTED EV WITH LIVE POWERTRAIN HUD) ══════════════ */}
      <section id="home" className="relative h-screen min-h-185 flex items-end overflow-hidden">
        {/* Static Green Lighted EV Background */}
        <div className="absolute inset-0 bg-black">
          <img
            src={HERO_GREEN_IMG}
            alt="Evora performance electric vehicle"
            className="w-full h-full object-cover object-center scale-[1.01] transition-transform duration-1000"
            style={{ filter: "brightness(0.85)" }}
          />

          {/* Dynamic Illumination Aura Reflecting Selected Drive Mode */}
          <div
            className="absolute inset-0 transition-all duration-700 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 75% 60%, ${selectedMode.auraColor} 0%, transparent 60%)`,
            }}
          />

          <div className="absolute inset-0" style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 45%, rgba(0,0,0,0.1) 100%)"
          }} />
          <div className="absolute inset-0" style={{
            background: "linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)"
          }} />
        </div>

        {/* ── Floating Interactive Powertrain & Wheel Power Telemetry HUD (Desktop / Tablet) ── */}
        {showHud && (
          <div
            className="absolute top-28 md:top-32 right-6 md:right-16 hidden lg:flex flex-col gap-4 z-20"
            style={{ animation: "fadeIn 0.8s 0.6s cubic-bezier(0.16,1,0.3,1) both" }}
          >
            {/* 1. Wheel Power & Torque Vectoring Liquid Glass Card */}
            <div
              className="w-80 rounded-3xl p-5 text-white shadow-[0_25px_70px_rgba(0,0,0,0.85)] flex flex-col gap-4 transition-all duration-500"
              style={{
                background: "rgba(14, 14, 20, 0.82)",
                backdropFilter: "blur(40px) saturate(220%)",
                WebkitBackdropFilter: "blur(40px) saturate(220%)",
                border: "1px solid rgba(255, 255, 255, 0.16)",
                boxShadow: "0 25px 70px -10px rgba(0,0,0,0.9), inset 0 1.5px 2px rgba(255,255,255,0.35)",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#34d399]" />
                  <span className="font-display font-bold text-xs uppercase tracking-wider">
                    Powertrain Telemetry
                  </span>
                </div>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-white/10 text-neutral-300">
                  {selectedMode.label}
                </span>
              </div>

              {/* Peak Stats Grid */}
              <div className="grid grid-cols-3 gap-2 py-1 border-y border-white/10">
                <div className="flex flex-col">
                  <span className="text-[10px] text-neutral-400 font-display uppercase tracking-wider">Output</span>
                  <span className="font-display font-bold text-base text-white">{selectedMode.peakPower}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-neutral-400 font-display uppercase tracking-wider">Torque</span>
                  <span className="font-display font-bold text-base" style={{ color: selectedMode.accentHex }}>{selectedMode.torque}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-neutral-400 font-display uppercase tracking-wider">0-60 mph</span>
                  <span className="font-display font-bold text-base text-white">{selectedMode.zeroSixty}</span>
                </div>
              </div>

              {/* Torque Vectoring Wheel Split */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-400">Front Axle: {selectedMode.frontTorque}%</span>
                  <span className="text-neutral-400">Rear Axle: {selectedMode.rearTorque}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden flex">
                  <div
                    className="h-full transition-all duration-700 rounded-l-full"
                    style={{ width: `${selectedMode.frontTorque}%`, background: "#0052FF" }}
                  />
                  <div
                    className="h-full transition-all duration-700 rounded-r-full"
                    style={{ width: `${selectedMode.rearTorque}%`, background: selectedMode.accentHex }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px] text-neutral-400 font-mono">
                <span className="flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-[#34d399]" /> Active Aero
                </span>
                <span>Eff: <strong className="text-white">{selectedMode.efficiency}</strong></span>
              </div>
            </div>

            {/* 2. Interactive Drive Mode Switcher Capsule */}
            <div
              className="flex items-center gap-1.5 p-1.5 rounded-full border border-white/14 shadow-2xl transition-all duration-300"
              style={{
                background: "rgba(14, 14, 20, 0.82)",
                backdropFilter: "blur(32px) saturate(220%)",
                boxShadow: "0 20px 50px rgba(0,0,0,0.85), inset 0 1px 1.5px rgba(255,255,255,0.3)",
              }}
            >
              {DRIVE_MODES.map((mode) => {
                const isSelected = selectedMode.id === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setSelectedMode(mode)}
                    className={`flex-1 py-2 px-3 rounded-full font-display text-[11px] font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? "text-white shadow-[0_0_16px_rgba(52,211,153,0.5)]"
                        : "text-neutral-400 hover:text-neutral-200"
                    }`}
                    style={{
                      background: isSelected ? mode.accentHex : "transparent",
                      color: isSelected ? (mode.id === "hyper" ? "#000" : "#fff") : undefined,
                    }}
                  >
                    {mode.id}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Main Hero Content ── */}
        <div className="relative w-full max-w-7xl mx-auto px-8 pb-20 z-10">
          <div className="fade-in mb-6" style={{ animationDelay: "200ms" }}>
            <div className="inline-flex items-center gap-3">
              <span className="w-6 h-px" style={{ background: selectedMode.accentHex }} />
              <Label light>Next-Generation EV Platform</Label>
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
              <em style={{ fontStyle: "normal", color: selectedMode.accentHex }}>Next</em> Electric
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
            <p style={{ color: "rgba(255,255,255,0.7)", maxWidth: "360px", lineHeight: 1.75, fontSize: "15px" }}>
              High-power 150-350kW liquid-cooled charging hubs engineered with dual-motor active torque distribution and TomTom EV intelligence.
            </p>

            <div className="flex items-center gap-4 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => scrollToSection("technology-section")}
                className="font-display font-bold text-xs tracking-[0.14em] uppercase px-7 py-3.5 rounded-full transition-all duration-300 active:scale-95 cursor-pointer shadow-lg hover:scale-[1.02]"
                style={{
                  background: selectedMode.accentHex,
                  color: selectedMode.id === "hyper" ? "#000" : "#fff",
                  boxShadow: `0 8px 30px ${selectedMode.auraColor}`,
                }}
              >
                Explore Technology
              </button>

              <button
                type="button"
                onClick={() => setShowHud(!showHud)}
                className="hidden lg:flex items-center gap-2 px-6 py-3.5 rounded-full border border-white/20 hover:border-white/40 transition-all duration-300 font-display font-semibold text-xs tracking-[0.14em] uppercase text-white/90 hover:text-white cursor-pointer bg-black/30 backdrop-blur-md"
              >
                <Sliders className="w-3.5 h-3.5 text-[#34d399]" />
                <span>{showHud ? "Hide HUD" : "View Telemetry HUD"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer z-10"
          onClick={() => scrollToSection("technology-section")}
          style={{ animation: "fadeIn 1s 2.2s ease both" }}
        >
          <div className="w-px h-10 bg-gradient-to-b from-transparent to-white/40"
            style={{ animation: "floatY 2s ease-in-out infinite" }} />
        </div>
      </section>

      {/* ══════════════ SPLIT SHOWCASE & INTERACTIVE CHARGING CALCULATOR ══════════════ */}
      <section id="technology-section" className="bg-[#0A0A0A] overflow-hidden py-28 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column: Charging Night Image & Active Session Widget */}
          <div
            className="relative rounded-3xl overflow-hidden order-1"
            style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.8)", aspectRatio: "4/3" }}
          >
            <img
              src={NIGHT_IMG}
              alt="EV charging at night"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(0,82,255,0.18) 0%, transparent 60%)" }} />

            <div
              className="absolute bottom-6 left-6 right-6 rounded-2xl px-6 py-4.5 flex items-center justify-between gap-4"
              style={{ background: "rgba(10,10,14,0.84)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.12)" }}
            >
              <div>
                <div className="font-display text-3xl font-bold text-white leading-none">
                  350 <span className="text-[#38aaff] text-xl font-normal">kW</span>
                </div>
                <div className="text-[10px] tracking-widest uppercase mt-1 font-semibold text-neutral-400">Peak Liquid-Cooled Output</div>
              </div>
              <div className="flex-1 max-w-36">
                <div className="h-1.5 rounded-full mb-1.5 bg-white/10 overflow-hidden">
                  <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-[#0052FF] to-[#34d399]" />
                </div>
                <div className="text-[9px] tracking-wider font-mono text-neutral-300">Continuous 800V Architecture</div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Fast Charge Simulator */}
          <div className="flex flex-col gap-8 order-2">
            <div>
              <Label light className="block mb-3">Charging Intelligence</Label>
              <h2
                className="font-display font-bold leading-tight text-white"
                style={{ fontSize: "clamp(28px, 3.5vw, 48px)" }}
              >
                Zero compromise.
                <br />
                <span className="text-gradient">Instant high power.</span>
              </h2>
            </div>

            <p className="text-neutral-400 text-sm md:text-base leading-relaxed">
              Every Evora hub is equipped with dual liquid-cooled DC fast chargers delivering sustained 350kW throughput from renewable power sources.
            </p>

            {/* Interactive Charging Time Simulator Card */}
            <div
              className="p-6 rounded-3xl text-white flex flex-col gap-5 border border-white/12"
              style={{
                background: "rgba(18, 18, 26, 0.75)",
                backdropFilter: "blur(32px)",
                boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-display font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#34d399]" /> Interactive Session Simulator
                </span>
                <span className="text-[11px] font-mono text-[#38aaff]">10% → {targetSoc}% SoC</span>
              </div>

              {/* Battery Selector Buttons */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400 font-display">Battery:</span>
                {[60, 82, 100].map((kwh) => (
                  <button
                    key={kwh}
                    type="button"
                    onClick={() => setBatterySize(kwh)}
                    className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-semibold transition-all cursor-pointer ${
                      batterySize === kwh
                        ? "bg-[#0052FF] text-white border border-[#38aaff]/60"
                        : "bg-white/5 text-neutral-400 hover:text-white border border-white/10"
                    }`}
                  >
                    {kwh} kWh
                  </button>
                ))}
              </div>

              {/* Target Slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs text-neutral-400 font-mono">
                  <span>Charge Target: {targetSoc}%</span>
                  <span>+{rangeAddedMiles} mi Range</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="5"
                  value={targetSoc}
                  onChange={(e) => setTargetSoc(Number(e.target.value))}
                  className="w-full accent-[#0052FF] cursor-pointer"
                />
              </div>

              {/* Real-Time Calculated Result Banner */}
              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/10 text-center">
                <div className="flex flex-col">
                  <span className="font-display font-bold text-2xl text-white">{chargeMinutes} <span className="text-xs font-normal text-neutral-400">min</span></span>
                  <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-display">Session Time</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-display font-bold text-2xl text-[#34d399]">+{rangeAddedMiles} <span className="text-xs font-normal text-neutral-400">mi</span></span>
                  <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-display">Added Range</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-display font-bold text-2xl text-[#38aaff]">350 <span className="text-xs font-normal text-neutral-400">kW</span></span>
                  <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-display">Peak Output</span>
                </div>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={() => handleRequireAuth("Sign in to connect with Evora and unlock high-power charging.")}
                className="font-display font-bold text-xs tracking-[0.14em] uppercase px-8 py-4 rounded-full transition-all duration-300 active:scale-95 cursor-pointer bg-[#0052FF] hover:bg-[#0041CC] text-white shadow-[0_8px_30px_rgba(0,82,255,0.4)] hover:shadow-[0_12px_45px_rgba(0,82,255,0.6)]"
              >
                Connect with Evora
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ SECOND IMAGE ROW / NETWORK OVERVIEW ══════════════ */}
      <section className="py-32 max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative rounded-3xl overflow-hidden aspect-4/3"
            style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
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
              570+ premium locations across major corridors and city centers. Every station is monitored 24/7 with TomTom live telemetry and smart load balancing.
            </p>

            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: "⚡", label: "350kW DC Fast Output" },
                { icon: "📱", label: "Instant Cloud Pass" },
                { icon: "🌿", label: "100% Renewable Energy" },
                { icon: "🔒", label: "Secure Turso Storage" },
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
              type="button"
              onClick={() => scrollToSection("technology-section")}
              className="font-display font-bold text-xs tracking-[0.14em] uppercase px-8 py-4 rounded-full w-fit border-2 border-[#0A0A0A] text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white transition-all duration-300 active:scale-95 cursor-pointer"
            >
              Explore Technology
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
            { title: "Platform", links: ["Technology", "Powertrain", "Telemetry"] },
            { title: "Company", links: ["Careers", "Press", "Blog"] },
            { title: "Support", links: ["Help Center", "Status", "Terms"] },
          ].map((col) => (
            <div key={col.title} className="flex flex-col gap-4">
              <Label>{col.title}</Label>
              {col.links.map((l) => (
                <a
                  key={l}
                  href={l === "Technology" || l === "Powertrain" || l === "Telemetry" ? "#technology-section" : "#"}
                  onClick={(e) => {
                    if (l === "Technology" || l === "Powertrain" || l === "Telemetry") {
                      e.preventDefault();
                      scrollToSection("technology-section");
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

      {/* ══════════════ MODALS ══════════════ */}
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
    </div>
  );
}
