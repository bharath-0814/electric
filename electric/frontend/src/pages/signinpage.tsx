import { useEffect, useState } from "react";
import "./signinpage.css";
import { FloatingGlassNav } from "../components/FloatingGlassNav";
import { AuthModal } from "../components/AuthModal";
import { UserProfileModal } from "../components/UserProfileModal";
import { authService, type EvoraUser } from "../lib/firebase";

const HERO_GREEN_IMG = "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=1920&h=1080&fit=crop&auto=format&q=90";

export default function Signinpage() {
  const [currentUser, setCurrentUser] = useState<EvoraUser | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authPromptReason, setAuthPromptReason] = useState<string>("");
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    authService.checkRedirectResult().then((user) => {
      if (user) setCurrentUser(user);
    });
    const unsub = authService.subscribe((user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  const handleOpenAuth = (reason?: string) => {
    setAuthPromptReason(reason || "Sign in to access your Evora account.");
    setAuthOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-[#060609] text-white overflow-hidden flex flex-col justify-between">
      {/* ══════════════ FLOATING NAVIGATION ══════════════ */}
      <FloatingGlassNav
        currentUser={currentUser}
        onOpenAuth={() => handleOpenAuth()}
        onOpenProfile={() => setProfileOpen(true)}
      />

      {/* ══════════════ FULLSCREEN CLEAN EV HERO BACKGROUND ══════════════ */}
      <div className="absolute inset-0 bg-[#060609]">
        <img
          src={HERO_GREEN_IMG}
          alt="Evora electric vehicle"
          className="w-full h-full object-cover object-center"
          style={{ filter: "brightness(0.88)" }}
        />

        {/* Ambient Emerald Aura */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(circle at 75% 60%, rgba(0, 255, 157, 0.35) 0%, transparent 60%)",
          }}
        />

        {/* Vignette & Gradients */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to top, #060609 0%, rgba(6,6,9,0.35) 45%, rgba(6,6,9,0.1) 100%)"
        }} />
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to right, rgba(6,6,9,0.75) 0%, transparent 60%)"
        }} />
      </div>

      {/* ══════════════ CLEAN MINIMAL HERO CONTENT ══════════════ */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 mt-auto pb-20 pt-32">
        <div className="flex flex-col gap-6 max-w-3xl">
          <div className="inline-flex items-center gap-3 w-fit px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/12 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#00FF9D] shadow-[0_0_8px_#00FF9D] animate-pulse" />
            <span className="font-display text-[11px] font-bold tracking-[0.2em] uppercase text-white/90">
              Next-Generation EV Platform
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
            High-power liquid-cooled charging infrastructure connected to an intelligent renewable grid.
          </p>

          <div className="flex items-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => handleOpenAuth("Sign in with Google to connect with Evora.")}
              className="font-display font-bold text-xs tracking-[0.14em] uppercase px-8 py-4 rounded-2xl transition-all duration-300 active:scale-95 cursor-pointer bg-[#00FF9D] text-black shadow-[0_8px_30px_rgba(0,255,157,0.4)] hover:shadow-[0_12px_45px_rgba(0,255,157,0.6)] hover:scale-105"
            >
              Get Started
            </button>
          </div>
        </div>
      </main>

      {/* ══════════════ MODALS ══════════════ */}
      <AuthModal
        isOpen={authOpen}
        promptReason={authPromptReason}
        onClose={() => setAuthOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          setAuthOpen(false);
        }}
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
