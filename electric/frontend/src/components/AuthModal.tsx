import React, { useState, useEffect } from 'react';
import { authService, type EvoraUser } from '../lib/firebase';
import { tursoService } from '../lib/tursoClient';
import { useToast } from '../context/ToastContext';
import { X, Mail, Lock, User, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: EvoraUser) => void;
  promptReason?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  promptReason,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 5000);
    try {
      const user = await authService.loginWithGoogle();
      clearTimeout(timer);
      if (user && user.uid !== 'redirecting') {
        await tursoService.syncGoogleUser(user);
        showToast(`Welcome, ${user.displayName}!`, 'Authenticated with Google & Synced with Turso DB', 'success');
        onSuccess(user);
        onClose();
      }
    } catch (err: any) {
      clearTimeout(timer);
      showToast('Authentication Error', err.message || 'Could not sign in with Google.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      const user = await authService.loginWithEmail('alex.driver@evora.energy', 'demopass123');
      await tursoService.syncGoogleUser(user);
      showToast('Demo Driver Session Active', 'You are signed in as Alex Driver.', 'success');
      onSuccess(user);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Missing details', 'Please enter your email and password.', 'error');
      return;
    }

    setLoading(true);
    try {
      let user: EvoraUser;
      if (mode === 'signup') {
        user = await authService.registerWithEmail(email, password, name);
        showToast('Account Created!', `Welcome to the Evora Network, ${user.displayName}.`, 'success');
      } else {
        user = await authService.loginWithEmail(email, password);
        showToast(`Welcome back, ${user.displayName}!`, 'Signed in successfully.', 'success');
      }
      await tursoService.syncGoogleUser(user);
      onSuccess(user);
      onClose();
    } catch (err: any) {
      showToast('Sign In Failed', err.message || 'Invalid credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-2xl transition-all duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* ── Apple-Grade Liquid Glass Surface ── */}
      <div
        className="relative w-full max-w-[460px] rounded-[32px] p-7 sm:p-9 text-white shadow-[0_28px_90px_rgba(0,0,0,0.9)] flex flex-col gap-5 transition-all duration-300 select-none overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'rgba(15, 15, 22, 0.86)',
          backdropFilter: 'blur(50px) saturate(240%)',
          WebkitBackdropFilter: 'blur(50px) saturate(240%)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow:
            '0 32px 90px -10px rgba(0, 0, 0, 0.95), inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.38), inset 0 -1.5px 2px 0 rgba(0, 0, 0, 0.7), 0 0 45px rgba(0, 82, 255, 0.14)',
          animation: 'fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
        }}
      >
        {/* Top Edge Specular Refraction Highlight Line */}
        <div className="absolute inset-x-10 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/55 to-transparent pointer-events-none" />

        {/* ── 1. Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2.5">
              <div className="font-display text-2xl font-bold tracking-[0.14em] uppercase">
                <span className="text-[#0052FF]">EV</span>ORA
              </div>
              <span className="flex items-center gap-1.5 text-[10px] font-mono font-semibold text-neutral-300 bg-white/8 border border-white/12 px-2.5 py-0.5 rounded-full shadow-inner">
                <ShieldCheck className="w-3 h-3 text-[#38aaff]" /> Turso Edge SQL
              </span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed max-w-[340px]">
              {promptReason ||
                (mode === 'login'
                  ? 'Sign in to access high-power charging reservations, digital QR passes, and cloud vehicle specs.'
                  : 'Create your driver account to join the intelligent high-power charging grid.')}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/8 hover:bg-white/16 text-neutral-400 hover:text-white transition-all flex items-center justify-center cursor-pointer shrink-0 border border-white/10"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── 2. Quick Auth Actions ── */}
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-12 rounded-xl bg-white hover:bg-neutral-100 text-black font-display text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-3 transition-all shadow-[0_4px_20px_rgba(255,255,255,0.2)] active:scale-[0.98] cursor-pointer hover:shadow-[0_6px_25px_rgba(255,255,255,0.3)]"
          >
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.02 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            Continue with Google
          </button>

          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full h-10 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] text-[#58a6ff] border border-blue-500/30 font-display text-[11px] font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#58a6ff]" />
            Quick Demo Driver Session
          </button>
        </div>

        {/* ── 3. Hairline Divider ── */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-[1px] bg-white/10" />
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
            or with email
          </span>
          <div className="flex-1 h-[1px] bg-white/10" />
        </div>

        {/* ── 4. Form Inputs ── */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === 'signup' && (
            <div className="flex items-center h-12 rounded-xl bg-white/[0.05] border border-white/14 focus-within:border-[#0052FF] focus-within:bg-white/[0.08] focus-within:ring-2 focus-within:ring-[#0052FF]/30 transition-all px-3.5 gap-3">
              <User className="w-4 h-4 text-neutral-400 shrink-0" />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent text-white placeholder:text-neutral-500 text-xs font-display outline-none"
              />
            </div>
          )}

          <div className="flex items-center h-12 rounded-xl bg-white/[0.05] border border-white/14 focus-within:border-[#0052FF] focus-within:bg-white/[0.08] focus-within:ring-2 focus-within:ring-[#0052FF]/30 transition-all px-3.5 gap-3">
            <Mail className="w-4 h-4 text-neutral-400 shrink-0" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent text-white placeholder:text-neutral-500 text-xs font-display outline-none"
            />
          </div>

          <div className="flex items-center h-12 rounded-xl bg-white/[0.05] border border-white/14 focus-within:border-[#0052FF] focus-within:bg-white/[0.08] focus-within:ring-2 focus-within:ring-[#0052FF]/30 transition-all px-3.5 gap-3">
            <Lock className="w-4 h-4 text-neutral-400 shrink-0" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent text-white placeholder:text-neutral-500 text-xs font-display outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 mt-1 rounded-xl bg-[#0052FF] hover:bg-[#0041CC] text-white font-display font-bold text-xs uppercase tracking-widest transition-all shadow-[0_6px_25px_rgba(0,82,255,0.45)] hover:shadow-[0_10px_35px_rgba(0,82,255,0.65)] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* ── 5. Footer Switcher ── */}
        <div className="text-center text-xs text-neutral-300 font-display">
          {mode === 'login' ? "Don't have an account? " : 'Already registered? '}
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-[#38aaff] font-bold hover:underline cursor-pointer ml-1"
          >
            {mode === 'login' ? 'Create one here' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};
