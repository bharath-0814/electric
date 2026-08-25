import { useEffect, useState } from "react";
import "./signinpage.css";
import { FloatingGlassNav } from "../components/FloatingGlassNav";
import { AuthModal } from "../components/AuthModal";
import { UserProfileModal } from "../components/UserProfileModal";
import { authService, type EvoraUser } from "../lib/firebase";
import {
  Zap,
  Activity,
  Sliders,
  Cpu,
  Radio,
  ShieldCheck
} from "lucide-react";

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
  topSpeed: string;
  frontTorque: number;
  rearTorque: number;
  efficiency: string;
  auraColor: string;
  accentHex: string;
  themeGradient: string;
}

const DRIVE_MODES: DriveModeConfig[] = [
  {
    id: "hyper",
    label: "Hyper Dynamic AWD",
    peakPower: "640 kW / 858 HP",
    torque: "885 Nm",
    zeroSixty: "2.7s",
    topSpeed: "195 mph",
    frontTorque: 42,
    rearTorque: 58,
    efficiency: "96.4%",
    auraColor: "rgba(0, 255, 157, 0.45)",
    accentHex: "#00FF9D",
    themeGradient: "linear-gradient(135deg, #00FF9D 0%, #00F0FF 100%)",
  },
  {
    id: "track",
    label: "Apex Vector Track",
    peakPower: "760 kW / 1020 HP",
    torque: "980 Nm",
    zeroSixty: "2.3s",
    topSpeed: "205 mph",
    frontTorque: 35,
    rearTorque: 65,
    efficiency: "93.8%",
    auraColor: "rgba(0, 82, 255, 0.5)",
    accentHex: "#00F0FF",
    themeGradient: "linear-gradient(135deg, #00F0FF 0%, #0052FF 100%)",
  },
  {
    id: "quantum",
    label: "Quantum Grid Sustain",
    peakPower: "380 kW / 510 HP",
    torque: "540 Nm",
    zeroSixty: "3.8s",
    topSpeed: "155 mph",
    frontTorque: 50,
    rearTorque: 50,
    efficiency: "99.4%",
    auraColor: "rgba(56, 189, 248, 0.4)",
    accentHex: "#38bdf8",
    themeGradient: "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)",
  },
];

export default function Signinpage() {
  // Drive mode state
  const [selectedMode, setSelectedMode] = useState<DriveModeConfig>(DRIVE_MODES[0]);
  const [showHud, setShowHud] = useState(true);

  // Interactive charging simulator state
  const [batterySize, setBatterySize] = useState<number>(82);
  const [chargingPower, setChargingPower] = useState<number>(350);
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

  // Real-time calculated simulation
  const chargedKwh = (batterySize * (targetSoc - 10)) / 100;
  const chargeMinutes = Math.max(7, Math.round((chargedKwh / chargingPower) * 60 * 1.12));
  const rangeAddedMiles = Math.round(chargedKwh * 3.8);
  const estimatedSavings = Math.round(rangeAddedMiles * 0.14);

  return (
    <div className="min-h-screen bg-[#060609] text-white selection:bg-[#00FF9D]/30 selection:text-white">

      {/* ══════════════ MASTER FLOATING ARCHITECTURAL NAVIGATION ══════════════ */}
      <FloatingGlassNav
        currentUser={currentUser}
        onOpenAuth={() => handleRequireAuth("Sign in with Google to access reserved charging slots & cloud telemetry.")}
        onOpenProfile={() => setProfileOpen(true)}
      />

      {/* ══════════════ 1. HERO COCKPIT & LIVE POWERTRAIN HUD ══════════════ */}
      <section id="home" className="relative min-h-screen flex items-end overflow-hidden pb-16 pt-28">
        
        {/* Cinematic Static Green-Lighted Performance EV Background */}
        <div className="absolute inset-0 bg-[#060609]">
          <img
            src={HERO_GREEN_IMG}
            alt="Evora performance electric vehicle"
            className="w-full h-full object-cover object-center"
            style={{ filter: "brightness(0.85) contrast(1.05)" }}
          />

          {/* Dynamic Illumination Aura Reflecting Selected Drive Mode */}
          <div
            className="absolute inset-0 transition-all duration-700 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 72% 58%, ${selectedMode.auraColor} 0%, transparent 62%)`,
            }}
          />

          {/* Multi-layered Vignette & Contrast Gradients */}
          <div className="absolute inset-0" style={{
            background: "linear-gradient(to top, #060609 0%, rgba(6,6,9,0.4) 40%, rgba(6,6,9,0.1) 100%)"
          }} />
          <div className="absolute inset-0" style={{
            background: "linear-gradient(to right, #060609 0%, rgba(6,6,9,0.85) 35%, rgba(6,6,9,0.2) 65%, transparent 100%)"
          }} />

          {/* Diagonal grid overlay line */}
          <div className="absolute inset-0 bg-diagonal-mesh opacity-20 pointer-events-none" />
        </div>

        {/* ── Top-Right Floating Powertrain & Wheel Vectoring Telemetry HUD ── */}
        {showHud && (
          <div
            className="absolute top-28 md:top-32 right-6 md:right-12 hidden lg:flex flex-col gap-4 z-20"
            style={{ animation: "fadeIn 0.8s 0.3s cubic-bezier(0.16,1,0.3,1) both" }}
          >
            {/* Liquid Glass Wheel Vectoring & Telemetry Card */}
            <div
              className="w-88 rounded-3xl p-6 text-white shadow-[0_30px_90px_rgba(0,0,0,0.95)] flex flex-col gap-5 transition-all duration-500 relative overflow-hidden"
              style={{
                background: "rgba(12, 13, 22, 0.82)",
                backdropFilter: "blur(48px) saturate(240%)",
                WebkitBackdropFilter: "blur(48px) saturate(240%)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 30px 90px -10px rgba(0,0,0,0.95), inset 0 1.5px 2px rgba(255,255,255,0.45)",
              }}
            >
              {/* Top Cyan Light Bar */}
              <div className="absolute inset-x-8 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent pointer-events-none" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00FF9D] shadow-[0_0_10px_#00FF9D] animate-ping" />
                  <span className="font-display font-bold text-xs uppercase tracking-[0.14em] text-white">
                    Powertrain Telemetry
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-[#00F0FF] border border-[#00F0FF]/30">
                  {selectedMode.label}
                </span>
              </div>

              {/* 3-Way Real-time Output Metric Columns */}
              <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/12">
                <div className="flex flex-col">
                  <span className="text-[10px] text-neutral-400 font-display uppercase tracking-wider">Output</span>
                  <span className="font-display font-bold text-base text-white">{selectedMode.peakPower.split('/')[0]}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-neutral-400 font-display uppercase tracking-wider">Torque</span>
                  <span className="font-display font-bold text-base" style={{ color: selectedMode.accentHex }}>{selectedMode.torque}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-neutral-400 font-display uppercase tracking-wider">0-60 MPH</span>
                  <span className="font-display font-bold text-base text-white">{selectedMode.zeroSixty}</span>
                </div>
              </div>

              {/* 4-Wheel Independent Vectoring HUD */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-300">Front Axle: <strong className="text-white">{selectedMode.frontTorque}%</strong></span>
                  <span className="text-neutral-300">Rear Axle: <strong className="text-white">{selectedMode.rearTorque}%</strong></span>
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

              {/* Live Status Indicators */}
              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 pt-1">
                <span className="flex items-center gap-1.5 text-white">
                  <Cpu className="w-3.5 h-3.5 text-[#00FF9D]" /> 800V SiC Dual Inverter
                </span>
                <span className="text-[#00F0FF]">{selectedMode.topSpeed}</span>
              </div>
            </div>

            {/* Interactive Drive Mode Switcher */}
            <div
              className="flex items-center gap-1.5 p-1.5 rounded-2xl border border-white/16 shadow-2xl transition-all duration-300"
              style={{
                background: "rgba(12, 13, 22, 0.85)",
                backdropFilter: "blur(32px) saturate(220%)",
                boxShadow: "0 20px 50px rgba(0,0,0,0.9), inset 0 1px 1.5px rgba(255,255,255,0.35)",
              }}
            >
              {DRIVE_MODES.map((mode) => {
                const isSelected = selectedMode.id === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setSelectedMode(mode)}
                    className={`flex-1 py-2 px-3 rounded-xl font-display text-[11px] font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer text-center ${
                      isSelected
                        ? "text-black shadow-[0_0_18px_rgba(0,255,157,0.6)] font-extrabold"
                        : "text-neutral-400 hover:text-white"
                    }`}
                    style={{
                      background: isSelected ? mode.accentHex : "transparent",
                    }}
                  >
                    {mode.id}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Main Hero Cockpit Content ── */}
        <div className="relative w-full max-w-7xl mx-auto px-6 md:px-8 z-10">
          <div className="mb-5">
            <div className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/12 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full animate-ping" style={{ background: selectedMode.accentHex }} />
              <span className="font-display text-[11px] font-bold tracking-[0.2em] uppercase text-white/90">
                Evora 800V Architecture
              </span>
            </div>
          </div>

          <h1
            className="font-display font-extrabold leading-[0.92] mb-8 tracking-tight"
            style={{ fontSize: "clamp(48px, 8.5vw, 115px)" }}
          >
            <span className="block text-white">
              Fueling the
            </span>
            <span className="block">
              <em style={{ fontStyle: "normal" }} className="text-gradient-cyan">Next</em> Electric
            </span>
            <span className="block text-white">
              Era.
            </span>
          </h1>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 max-w-2xl">
            <p className="text-neutral-300 text-sm md:text-base leading-relaxed">
              High-power 150–500kW liquid-cooled charging infrastructure paired with intelligent quad-motor torque distribution and real-time TomTom routing telemetry.
            </p>

            <div className="flex items-center gap-4 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => scrollToSection("powertrain-section")}
                className="font-display font-bold text-xs tracking-[0.14em] uppercase px-7 py-3.5 rounded-2xl transition-all duration-300 active:scale-95 cursor-pointer shadow-lg hover:scale-105"
                style={{
                  background: selectedMode.accentHex,
                  color: "#000",
                  boxShadow: `0 8px 30px ${selectedMode.auraColor}`,
                }}
              >
                Explore Technology
              </button>

              <button
                type="button"
                onClick={() => setShowHud(!showHud)}
                className="hidden lg:flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-300 font-display font-semibold text-xs tracking-[0.14em] uppercase text-white hover:text-white cursor-pointer bg-white/[0.06] backdrop-blur-md hover:scale-105"
              >
                <Sliders className="w-3.5 h-3.5 text-[#00FF9D]" />
                <span>{showHud ? "Hide HUD" : "View Telemetry HUD"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer z-10"
          onClick={() => scrollToSection("powertrain-section")}
        >
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-[#00FF9D]" />
        </div>
      </section>

      {/* ══════════════ 2. POWERTRAIN ARCHITECTURE & TORQUE VECTORING ══════════════ */}
      <section id="powertrain-section" className="py-28 max-w-7xl mx-auto px-6 md:px-8 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 pb-8 border-b border-white/10">
          <div>
            <div className="text-[11px] font-display font-bold uppercase tracking-[0.2em] text-[#00FF9D] mb-3">
              01 / Architecture
            </div>
            <h2 className="font-display font-bold text-3xl sm:text-5xl text-white tracking-tight leading-tight">
              Engineered for
              <br />
              <span className="text-gradient-cyan">Absolute Dynamics.</span>
            </h2>
          </div>
          <p className="text-neutral-400 text-sm max-w-md leading-relaxed">
            Every Evora powertrain component is engineered with Silicon Carbide inverters, sustaining 885Nm torque vectoring across all four wheels simultaneously.
          </p>
        </div>

        {/* 3 Prismatic Diagonal Glass Technology Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Activity,
              title: "Quad-Motor Vectoring",
              desc: "Independent wheel control with 1,000 adjustments per second for cornering grip and instant power transfer.",
              stat: "885 Nm",
              tag: "Dynamics",
            },
            {
              icon: Cpu,
              title: "800V Silicon Carbide",
              desc: "Ultra-dense power electronics maintaining 99.4% peak inverter efficiency under continuous track loads.",
              stat: "99.4%",
              tag: "Efficiency",
            },
            {
              icon: Radio,
              title: "TomTom Cloud Telemetry",
              desc: "Live route optimization, automated charging slot reservations, and real-time battery thermal pre-conditioning.",
              stat: "< 10 ms",
              tag: "Intelligence",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="liquid-glass-card rounded-3xl p-8 flex flex-col justify-between gap-8 group relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.08] border border-white/14 flex items-center justify-center text-[#00FF9D] group-hover:scale-110 transition-transform">
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#00F0FF] bg-[#00F0FF]/10 px-3 py-1 rounded-full border border-[#00F0FF]/25">
                  {item.tag}
                </span>
              </div>

              <div>
                <h3 className="font-display font-bold text-xl text-white mb-2 group-hover:text-[#00FF9D] transition-colors">
                  {item.title}
                </h3>
                <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] font-mono text-neutral-400">Specification</span>
                <span className="font-display font-bold text-lg text-white group-hover:text-[#00F0FF] transition-colors">
                  {item.stat}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════ 3. INTERACTIVE 350-500kW CHARGING STUDIO ══════════════ */}
      <section id="charging-section" className="py-28 bg-[#090A10] border-y border-white/10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Night Charge Ambient Showcase */}
          <div
            className="relative rounded-3xl overflow-hidden aspect-4/3 shadow-[0_30px_90px_rgba(0,0,0,0.9)] border border-white/14"
          >
            <img
              src={NIGHT_IMG}
              alt="EV charging at night"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060609] via-transparent to-transparent" />

            <div className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl liquid-glass-surface flex items-center justify-between">
              <div>
                <div className="font-display text-2xl font-bold text-white">
                  350 <span className="text-[#00FF9D] text-lg font-mono">kW</span>
                </div>
                <div className="text-[10px] uppercase font-mono tracking-widest text-neutral-400">Peak Liquid-Cooled Output</div>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#00F0FF]">
                <ShieldCheck className="w-4 h-4 text-[#00FF9D]" /> Dual-Gun 800V
              </div>
            </div>
          </div>

          {/* Right: Interactive Session Simulator Studio */}
          <div className="flex flex-col gap-8">
            <div>
              <div className="text-[11px] font-display font-bold uppercase tracking-[0.2em] text-[#00FF9D] mb-3">
                02 / Fast Charging
              </div>
              <h2 className="font-display font-bold text-3xl sm:text-5xl text-white tracking-tight leading-tight">
                Megawatt Speed.
                <br />
                <span className="text-gradient-cyan">Zero Idle Time.</span>
              </h2>
            </div>

            {/* Interactive Simulator Container */}
            <div className="liquid-glass-surface rounded-3xl p-7 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-xs uppercase tracking-wider text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#00FF9D]" /> Charging Session Simulator
                </span>
                <span className="text-[11px] font-mono text-[#00F0FF] bg-white/10 px-2.5 py-0.5 rounded-full">
                  10% → {targetSoc}% SoC
                </span>
              </div>

              {/* Battery Size Selector */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs text-neutral-400 font-display">Battery Pack:</span>
                <div className="flex items-center gap-2">
                  {[60, 82, 100].map((kwh) => (
                    <button
                      key={kwh}
                      type="button"
                      onClick={() => setBatterySize(kwh)}
                      className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-semibold transition-all cursor-pointer ${
                        batterySize === kwh
                          ? "bg-[#0052FF] text-white border border-[#00F0FF]/50 shadow-[0_0_15px_rgba(0,82,255,0.5)]"
                          : "bg-white/5 text-neutral-400 hover:text-white border border-white/10"
                      }`}
                    >
                      {kwh} kWh
                    </button>
                  ))}
                </div>
              </div>

              {/* Charge Power Selector */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs text-neutral-400 font-display">Charge Power:</span>
                <div className="flex items-center gap-2">
                  {[150, 250, 350].map((kw) => (
                    <button
                      key={kw}
                      type="button"
                      onClick={() => setChargingPower(kw)}
                      className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-semibold transition-all cursor-pointer ${
                        chargingPower === kw
                          ? "bg-[#00FF9D] text-black font-bold shadow-[0_0_15px_rgba(0,255,157,0.5)]"
                          : "bg-white/5 text-neutral-400 hover:text-white border border-white/10"
                      }`}
                    >
                      {kw} kW
                    </button>
                  ))}
                </div>
              </div>

              {/* Target SoC Slider */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs text-neutral-400 font-mono">
                  <span>Charge Target: <strong className="text-white">{targetSoc}%</strong></span>
                  <span className="text-[#00FF9D]">+{rangeAddedMiles} mi Range</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="5"
                  value={targetSoc}
                  onChange={(e) => setTargetSoc(Number(e.target.value))}
                  className="w-full accent-[#00FF9D] cursor-pointer"
                />
              </div>

              {/* Output Telemetry Grid */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/12 text-center">
                <div className="flex flex-col">
                  <span className="font-display font-bold text-2xl text-white">{chargeMinutes} <span className="text-xs font-normal text-neutral-400">min</span></span>
                  <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-display">Session Time</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-display font-bold text-2xl text-[#00FF9D]">+{rangeAddedMiles} <span className="text-xs font-normal text-neutral-400">mi</span></span>
                  <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-display">Range Added</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-display font-bold text-2xl text-[#00F0FF]">${estimatedSavings}</span>
                  <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-display">Saved vs Gas</span>
                </div>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={() => handleRequireAuth("Sign in with Google to reserve your high-power charging hub.")}
                className="font-display font-bold text-xs tracking-[0.14em] uppercase px-8 py-4 rounded-2xl transition-all duration-300 active:scale-95 cursor-pointer bg-[#0052FF] hover:bg-[#0041CC] text-white shadow-[0_8px_30px_rgba(0,82,255,0.45)] hover:shadow-[0_12px_45px_rgba(0,82,255,0.65)]"
              >
                Connect with Evora
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ 4. GLOBAL NETWORK & TOMTOM EV CORRIDOR ══════════════ */}
      <section id="network-section" className="py-32 max-w-7xl mx-auto px-6 md:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="relative rounded-3xl overflow-hidden aspect-4/3 shadow-2xl border border-white/14">
            <img
              src={NEON_IMG}
              alt="EV under neon lights"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col gap-8">
            <div>
              <div className="text-[11px] font-display font-bold uppercase tracking-[0.2em] text-[#00FF9D] mb-3">
                03 / Live Corridor
              </div>
              <h2 className="font-display font-bold text-3xl sm:text-5xl text-white tracking-tight leading-tight">
                570+ Hubs.
                <br />
                <span className="text-gradient-cyan">Always Reachable.</span>
              </h2>
            </div>

            <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
              Equipped with real-time TomTom telemetry, Evora balances network power in real time to ensure guaranteed available guns when you arrive.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "350kW Peak Output", desc: "Liquid-Cooled 800V Architecture" },
                { label: "Instant Cloud Pass", desc: "Google Identity & Turso SQL" },
                { label: "100% Green Power", desc: "Certified Clean Grid Balancing" },
                { label: "24/7 Live Telemetry", desc: "TomTom Dynamic Reach Radius" },
              ].map((item) => (
                <div key={item.label} className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col gap-1">
                  <span className="font-display font-bold text-xs text-white">{item.label}</span>
                  <span className="text-[11px] text-neutral-400 font-mono">{item.desc}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => handleRequireAuth("Sign in with Google to explore your nearest high-power charging hub.")}
              className="font-display font-bold text-xs tracking-[0.14em] uppercase px-8 py-4 rounded-2xl w-fit border border-white/20 text-white hover:bg-white/10 transition-all duration-300 active:scale-95 cursor-pointer"
            >
              Find Nearest Hub
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════ 5. ARCHITECTURAL LIQUID GLASS FOOTER ══════════════ */}
      <footer className="max-w-7xl mx-auto px-6 md:px-8 pb-12 pt-8">
        <div className="liquid-glass-surface rounded-3xl p-8 sm:p-12 flex flex-col gap-8">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div className="flex flex-col gap-3 max-w-sm">
              <div className="font-display text-2xl font-bold tracking-[0.16em] uppercase text-white">
                <span className="text-[#00F0FF]">EV</span>ORA
              </div>
              <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
                Next-generation electric vehicle charging architecture and dual-motor dynamics, synchronized with Turso Edge Cloud SQL.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              {[
                { title: "Platform", links: ["Cockpit", "Powertrain", "Charging", "Network"] },
                { title: "Network", links: ["570+ Hubs", "800V Specs", "TomTom API"] },
                { title: "Security", links: ["Google OAuth", "Turso DB", "Encryption"] },
              ].map((col) => (
                <div key={col.title} className="flex flex-col gap-3">
                  <span className="text-[10px] font-display font-bold uppercase tracking-[0.18em] text-[#00FF9D]">
                    {col.title}
                  </span>
                  {col.links.map((link) => (
                    <a
                      key={link}
                      href={link === "Cockpit" ? "#home" : link === "Powertrain" ? "#powertrain-section" : link === "Charging" ? "#charging-section" : link === "Network" ? "#network-section" : "#"}
                      onClick={(e) => {
                        if (link === "Cockpit") { e.preventDefault(); scrollToSection("home"); }
                        else if (link === "Powertrain") { e.preventDefault(); scrollToSection("powertrain-section"); }
                        else if (link === "Charging") { e.preventDefault(); scrollToSection("charging-section"); }
                        else if (link === "Network") { e.preventDefault(); scrollToSection("network-section"); }
                      }}
                      className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {link}
                    </a>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 font-mono">
            <span>© 2026 Evora Platform, Inc. All rights reserved.</span>
            <div className="flex items-center gap-6">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span className="text-[#00FF9D] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF9D] animate-ping" /> System 99.98% SLA
              </span>
            </div>
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
