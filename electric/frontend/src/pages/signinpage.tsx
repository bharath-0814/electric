import { useEffect, useState } from "react";
import "./signinpage.css";
import { FloatingGlassNav } from "../components/FloatingGlassNav";
import { HomeServiceHub } from "../components/HomeServiceHub";
import { AuthModal } from "../components/AuthModal";
import { UserProfileModal } from "../components/UserProfileModal";
import { authService, type EvoraUser } from "../lib/firebase";
import { BatteryCharging, Truck, ArrowRight, Zap } from "lucide-react";

const HERO_GREEN_IMG = "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=1920&h=1080&fit=crop&auto=format&q=90";

export default function Signinpage() {
  const [currentUser, setCurrentUser] = useState<EvoraUser | null>(null);
  const [activeView, setActiveView] = useState<'landing' | 'services'>('landing');
  const [authOpen, setAuthOpen] = useState(false);
  const [authPromptReason, setAuthPromptReason] = useState<string>("");
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    authService.checkRedirectResult().then((user) => {
      if (user) {
        setCurrentUser(user);
        setActiveView('services');
      }
    });
    const unsub = authService.subscribe((user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  const handleOpenAuth = (reason?: string) => {
    setAuthPromptReason(reason || "Sign in to access your Evora account and live charging telemetry.");
    setAuthOpen(true);
  };

  const handleSelectView = (view: 'landing' | 'services') => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-[#060609] text-white overflow-x-hidden flex flex-col">
      
      {/* ══════════════ FLOATING NAVIGATION ══════════════ */}
      <FloatingGlassNav
        currentUser={currentUser}
        activeView={activeView}
        onSelectView={handleSelectView}
        onOpenAuth={() => handleOpenAuth()}
        onOpenProfile={() => setProfileOpen(true)}
      />

      {/* ══════════════ FULLSCREEN CINEMATIC GREEN EV BACKGROUND ══════════════ */}
      <div className="fixed inset-0 bg-[#060609] pointer-events-none z-0">
        <img
          src={HERO_GREEN_IMG}
          alt="Evora electric vehicle"
          className="w-full h-full object-cover object-center"
          style={{ filter: "brightness(0.75) contrast(1.05)" }}
        />

        {/* Ambient Emerald Aura */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(circle at 75% 60%, rgba(0, 255, 157, 0.3) 0%, transparent 60%)",
          }}
        />

        {/* Deep Contrast Gradients */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to top, #060609 0%, rgba(6,6,9,0.7) 45%, rgba(6,6,9,0.3) 100%)"
        }} />
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to right, #060609 0%, rgba(6,6,9,0.85) 30%, transparent 70%)"
        }} />
      </div>

      {/* ══════════════ VIEW 1: CLEAN LANDING & AUTH COCKPIT ══════════════ */}
      {activeView === 'landing' ? (
        <main className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 min-h-screen flex flex-col justify-end pb-20 pt-36">
          <div className="flex flex-col gap-6 max-w-3xl">
            <div className="inline-flex items-center gap-3 w-fit px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/12 backdrop-blur-md">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00FF9D] shadow-[0_0_10px_#00FF9D] animate-pulse" />
              <span className="font-display text-[11px] font-bold tracking-[0.2em] uppercase text-white/90">
                Evora 800V Infrastructure Platform
              </span>
            </div>

            <h1
              className="font-display font-extrabold leading-[0.92] tracking-tight"
              style={{ fontSize: "clamp(48px, 8.5vw, 115px)" }}
            >
              <span className="block text-white">Fueling the</span>
              <span className="block">
                <em style={{ fontStyle: "normal" }} className="text-gradient-cyan">Next</em> Electric
              </span>
              <span className="block text-white">Era.</span>
            </h1>

            <p className="text-neutral-300 text-sm md:text-base leading-relaxed max-w-xl">
              Real-time battery range mapping, nearby 350kW liquid-cooled charging station discovery, and instant 24/7 EV emergency flatbed towing rescue.
            </p>

            {/* Quick Action Grid */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (currentUser) {
                    setActiveView('services');
                  } else {
                    handleOpenAuth("Sign in with Google to enter your personalized EV Driver Dashboard.");
                  }
                }}
                className="font-display font-bold text-xs tracking-[0.14em] uppercase px-8 py-4 rounded-2xl transition-all duration-300 active:scale-95 cursor-pointer bg-[#00FF9D] text-black shadow-[0_8px_30px_rgba(0,255,157,0.4)] hover:shadow-[0_12px_45px_rgba(0,255,157,0.6)] hover:scale-105 flex items-center justify-center gap-2"
              >
                <span>{currentUser ? 'Open Service Dashboard' : 'Sign In / Get Started'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setActiveView('services')}
                className="font-display font-bold text-xs tracking-[0.14em] uppercase px-7 py-4 rounded-2xl transition-all duration-300 active:scale-95 cursor-pointer bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/16 backdrop-blur-md hover:scale-105 flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 text-[#00F0FF]" />
                <span>Explore Stations & Towing</span>
              </button>
            </div>

            {/* Feature Highlights Pill */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-6 border-t border-white/10 max-w-xl">
              <div className="flex items-center gap-2 text-xs font-display text-neutral-300">
                <BatteryCharging className="w-4 h-4 text-[#00FF9D]" />
                <span>Range & Last-Point Map</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-display text-neutral-300">
                <Zap className="w-4 h-4 text-[#00F0FF]" />
                <span>350kW Fast Charging</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-display text-neutral-300">
                <Truck className="w-4 h-4 text-[#FF5E00]" />
                <span>EV Flatbed Towing</span>
              </div>
            </div>
          </div>
        </main>
      ) : (
        /* ══════════════ VIEW 2: INTERACTIVE HOME SERVICE HUB ══════════════ */
        <main className="relative z-10 w-full min-h-screen pt-28 pb-16">
          <HomeServiceHub
            currentUser={currentUser}
            onOpenAuth={() => handleOpenAuth()}
            onOpenProfile={() => setProfileOpen(true)}
          />
        </main>
      )}

      {/* ══════════════ MODALS ══════════════ */}
      <AuthModal
        isOpen={authOpen}
        promptReason={authPromptReason}
        onClose={() => setAuthOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          setAuthOpen(false);
          setActiveView('services');
        }}
      />

      {currentUser && (
        <UserProfileModal
          isOpen={profileOpen}
          onClose={() => setProfileOpen(false)}
          user={currentUser}
          onLogout={() => {
            setCurrentUser(null);
            setActiveView('landing');
          }}
        />
      )}
    </div>
  );
}
