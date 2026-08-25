import React, { useState } from 'react';
import { authService, type EvoraUser } from '../lib/firebase';
import { useToast } from '../context/ToastContext';
import { X, Mail, Lock, User, Sparkles, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: EvoraUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
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
      showToast(`Welcome back, ${user.displayName}!`, 'Signed in with Google', 'success');
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
      showToast('Missing details', 'Please fill out all fields.', 'error');
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
      onSuccess(user);
      onClose();
    } catch (err: any) {
      showToast('Sign In Failed', err.message || 'Invalid credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div
        className="relative w-full max-w-md rounded-3xl bg-[#0A0A0A] border border-white/12 p-8 text-white shadow-2xl flex flex-col gap-6"
        style={{ animation: 'fadeUp 0.3s ease-out' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="font-display text-xl font-bold tracking-[0.12em] uppercase mb-1">
              <span className="text-[#0052FF]">EV</span>ORA{' '}
              <span className="text-xs text-neutral-400 font-normal">ACCESS</span>
            </div>
            <p className="text-xs text-neutral-400">
              {mode === 'login'
                ? 'Sign in to access reserved charging slots & fast passes.'
                : 'Create an account to join the next-generation charging grid.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Google & Demo Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-neutral-100 text-black font-display text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-98 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            className="w-full py-2.5 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-[#38aaff] border border-blue-500/30 font-display text-[11px] font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Quick Demo Driver Login
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
            or with email
          </span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {mode === 'signup' && (
            <div className="relative flex items-center">
              <User className="absolute left-3.5 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#141414] border border-white/10 text-white placeholder:text-neutral-500 text-xs font-display outline-none focus:border-[#0052FF] transition-colors"
              />
            </div>
          )}

          <div className="relative flex items-center">
            <Mail className="absolute left-3.5 w-4 h-4 text-neutral-500" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#141414] border border-white/10 text-white placeholder:text-neutral-500 text-xs font-display outline-none focus:border-[#0052FF] transition-colors"
            />
          </div>

          <div className="relative flex items-center">
            <Lock className="absolute left-3.5 w-4 h-4 text-neutral-500" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#141414] border border-white/10 text-white placeholder:text-neutral-500 text-xs font-display outline-none focus:border-[#0052FF] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 rounded-xl bg-[#0052FF] hover:bg-[#0041CC] text-white font-display font-bold text-xs uppercase tracking-widest transition-all shadow-[0_4px_20px_rgba(0,82,255,0.4)] flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="text-center text-xs text-neutral-400 font-display">
          {mode === 'login' ? "Don't have an account? " : 'Already registered? '}
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-[#0052FF] font-semibold hover:underline cursor-pointer"
          >
            {mode === 'login' ? 'Create one here' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};
