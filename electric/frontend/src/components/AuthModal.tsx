import React, { useState } from 'react';
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

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const user = await authService.loginWithGoogle();
      await tursoService.syncGoogleUser(user);
      showToast(`Welcome, ${user.displayName}!`, 'Authenticated with Google & Synced with Turso DB', 'success');
      onSuccess(user);
      onClose();
    } catch (err: any) {
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 bg-black/85 backdrop-blur-xl">
      {/* Apple-grade Glassmorphism Container */}
      <div
        className="relative w-full max-w-lg rounded-[36px] p-8 md:p-12 text-white shadow-[0_32px_90px_rgba(0,0,0,0.85)] flex flex-col gap-7 overflow-hidden transition-all duration-300"
        style={{
          background: 'rgba(13, 13, 18, 0.88)',
          backdropFilter: 'blur(40px) saturate(240%)',
          WebkitBackdropFilter: 'blur(40px) saturate(240%)',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          boxShadow:
            '0 32px 80px -10px rgba(0, 0, 0, 0.9), inset 0 1px 1px 0 rgba(255, 255, 255, 0.3), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.6), 0 0 35px rgba(0, 82, 255, 0.15)',
          animation: 'fadeUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        }}
      >
        {/* Top Edge Refraction Highlight */}
        <div className="absolute inset-x-8 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="font-display text-2xl font-bold tracking-[0.14em] uppercase">
                <span className="text-[#0052FF]">EV</span>ORA
              </div>
              <span className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-neutral-300 bg-white/8 border border-white/12 px-3 py-1 rounded-full shadow-inner">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0052FF]" /> Turso Edge SQL
              </span>
            </div>
            <p className="text-sm text-neutral-300 leading-relaxed max-w-sm">
              {promptReason ||
                (mode === 'login'
                  ? 'Sign in to access high-power charging reservations, digital QR passes, and cloud vehicle specs.'
                  : 'Create your driver account to join the intelligent high-power charging grid.')}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/6 hover:bg-white/12 text-neutral-400 hover:text-white transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Google Auth Button (Apple Style) */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-14 rounded-2xl bg-white hover:bg-neutral-100 text-black font-display text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-3.5 transition-all shadow-[0_6px_25px_rgba(255,255,255,0.2)] active:scale-[0.98] cursor-pointer hover:shadow-[0_8px_30px_rgba(255,255,255,0.3)]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            className="w-full h-11 rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] text-[#58a6ff] border border-blue-500/30 font-display text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#58a6ff]" />
            Quick Demo Driver Session
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 my-1">
          <div className="flex-1 h-[1px] bg-white/10" />
          <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-widest">
            or with email
          </span>
          <div className="flex-1 h-[1px] bg-white/10" />
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'signup' && (
            <div className="relative flex items-center">
              <User className="absolute left-4 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-14 pl-12 pr-5 rounded-2xl bg-white/[0.05] border border-white/12 text-white placeholder:text-neutral-500 text-sm font-display outline-none focus:border-[#0052FF] focus:ring-4 focus:ring-[#0052FF]/20 transition-all"
              />
            </div>
          )}

          <div className="relative flex items-center">
            <Mail className="absolute left-4 w-5 h-5 text-neutral-400" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-14 pl-12 pr-5 rounded-2xl bg-white/[0.05] border border-white/12 text-white placeholder:text-neutral-500 text-sm font-display outline-none focus:border-[#0052FF] focus:ring-4 focus:ring-[#0052FF]/20 transition-all"
            />
          </div>

          <div className="relative flex items-center">
            <Lock className="absolute left-4 w-5 h-5 text-neutral-400" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-14 pl-12 pr-5 rounded-2xl bg-white/[0.05] border border-white/12 text-white placeholder:text-neutral-500 text-sm font-display outline-none focus:border-[#0052FF] focus:ring-4 focus:ring-[#0052FF]/20 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 mt-2 rounded-2xl bg-[#0052FF] hover:bg-[#0041CC] text-white font-display font-bold text-sm uppercase tracking-widest transition-all shadow-[0_8px_30px_rgba(0,82,255,0.45)] hover:shadow-[0_12px_40px_rgba(0,82,255,0.65)] flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.98]"
          >
            {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="text-center text-sm text-neutral-300 font-display">
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
