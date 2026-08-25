import { useEffect, useRef, useState } from "react";
import "./signinpage.css";
import { FloatingGlassNav } from "../components/FloatingGlassNav";
import { AuthModal } from "../components/AuthModal";
import { UserProfileModal } from "../components/UserProfileModal";
import { authService, type EvoraUser } from "../lib/firebase";

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
        <span style={{ color: "#34d399" }}>{suffix}</span>
      </span>
      <Label light={light}>{label}</Label>
    </div>
  );
}

/* ═══════════════════════════════════════
   Static Background Images
═══════════════════════════════════════ */

// Static Green Lighted EV Background
const HERO_GREEN_IMG = "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=1920&h=1080&fit=crop&auto=format&q=90";
const NIGHT_IMG      = "https://images.unsplash.com/photo-1748843765943-27ef9aad505d?w=1200&h=900&fit=crop&auto=format&q=90";
const NEON_IMG       = "https://images.unsplash.com/photo-1776610148977-07b1e2dca438?w=1200&h=900&fit=crop&auto=format&q=90";

export default function Signinpage() {
  // User auth state
  const [currentUser, setCurrentUser] = useState<EvoraUser | null>(null);

  // Modals state
  const [authOpen, setAuthOpen] = useState(false);
  const [authPromptReason, setAuthPromptReason] = useState<string>("");
  const [pendingAuthAction, setPendingAuthAction] = useState<(() => void) | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-[#FAFAFA]">

      {/* ══════════════ FLOATING NAVIGATION: EVORA (TOP LEFT) & PILLBAR (TOP MIDDLE) ══════════════ */}
      <FloatingGlassNav
        currentUser={currentUser}
        onOpenAuth={() => handleRequireAuth("Sign in with Google to access your cloud profile & vehicle specs.")}
        onOpenProfile={() => setProfileOpen(true)}
      />

      {/* ══════════════ HERO SECTION (STATIC GREEN LIGHTED BACKGROUND) ══════════════ */}
      <section id="home" className="relative h-screen min-h-175 flex items-end overflow-hidden">
        {/* Static Green Lighted EV Background */}
        <div className="absolute inset-0 bg-black">
          <img
            src={HERO_GREEN_IMG}
            alt="Evora green lighted electric vehicle"
            className="w-full h-full object-cover object-center"
            style={{ filter: "brightness(0.85)" }}
          />

          {/* Emerald Green Ambient Illumination Aura */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(circle at 75% 60%, rgba(16, 185, 129, 0.38) 0%, transparent 60%)",
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
              <span className="w-6 h-px bg-[#34d399]" />
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
              <em style={{ fontStyle: "normal", color: "#34d399" }}>Next</em> Electric
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
                className="font-display font-bold text-[12px] tracking-[0.15em] uppercase px-8 py-4 rounded-full transition-all duration-300 active:scale-95 cursor-pointer text-black bg-[#34d399] hover:bg-[#2ecc71] shadow-[0_8px_32px_rgba(52,211,153,0.4)] hover:shadow-[0_12px_44px_rgba(52,211,153,0.6)]"
              >
                Explore Features
              </button>
              <button
                onClick={() => scrollToSection("technology-section")}
                className="font-display font-semibold text-[12px] tracking-[0.15em] uppercase flex items-center gap-2 transition-all duration-300 group cursor-pointer text-white/80 hover:text-white"
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

        {/* Scroll indicator */}
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
                onClick={() => scrollToSection("features-section")}
                className="font-display font-bold text-[12px] tracking-[0.15em] uppercase px-8 py-4 rounded-full transition-all duration-300 active:scale-95 cursor-pointer"
                style={{ background: "#0052FF", color: "#fff", boxShadow: "0 8px 32px rgba(0,82,255,0.35)" }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 12px 44px rgba(0,82,255,0.55)")}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,82,255,0.35)")}
              >
                Explore Features
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
                  href={l === "Features" ? "#features-section" : l === "Network" ? "#technology-section" : "#"}
                  onClick={(e) => {
                    if (l === "Features") {
                      e.preventDefault();
                      scrollToSection("features-section");
                    } else if (l === "Network") {
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
