import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { X, Send, CheckCircle2, Building2, User, Mail, MessageSquare } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [topic, setTopic] = useState('host_station');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { showToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    showToast('Inquiry Received', 'An Evora infrastructure specialist will contact you within 24 hours.', 'success');
    setTimeout(() => {
      onClose();
      setSubmitted(false);
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 bg-black/85 backdrop-blur-xl">
      {/* Liquid Glass Modal Container */}
      <div
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-[36px] p-8 md:p-12 text-white shadow-[0_32px_90px_rgba(0,0,0,0.85)] flex flex-col gap-8 overflow-hidden transition-all duration-300"
        style={{
          background: 'rgba(14, 14, 20, 0.88)',
          backdropFilter: 'blur(48px) saturate(240%)',
          WebkitBackdropFilter: 'blur(48px) saturate(240%)',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          boxShadow:
            '0 32px 90px -10px rgba(0, 0, 0, 0.9), inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.35), inset 0 -1.5px 2px 0 rgba(0, 0, 0, 0.7), 0 0 45px rgba(0, 82, 255, 0.15)',
          animation: 'fadeUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        }}
      >
        {/* Top Edge Specular Refraction Highlight Line */}
        <div className="absolute inset-x-10 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0052FF] shadow-[0_0_10px_#0052FF]" />
              <span className="text-xs font-display font-bold uppercase tracking-[0.16em] text-[#38aaff]">
                Evora Infrastructure Partners
              </span>
            </div>
            <h3 className="font-display font-bold text-3xl md:text-4xl text-white tracking-tight">
              Host a High-Power Station
            </h3>
            <p className="text-sm text-neutral-300 mt-1.5 leading-relaxed max-w-lg">
              Deploy ultra-fast 150-350kW liquid-cooled charging hubs at your retail destination, commercial campus, or fleet depot.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-3 rounded-full bg-white/[0.06] hover:bg-white/[0.14] text-neutral-400 hover:text-white transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            <h4 className="font-display font-bold text-2xl text-white">Inquiry Received</h4>
            <p className="text-sm text-neutral-300 max-w-md leading-relaxed">
              Thank you for partnering with Evora. An infrastructure deployment lead will review your location specifications and connect within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Row 1: Name and Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-display uppercase tracking-wider text-neutral-300 font-semibold">
                  Your Full Name
                </label>
                <div className="flex items-center rounded-2xl bg-white/[0.05] border border-white/12 focus-within:border-[#0052FF] focus-within:ring-4 focus-within:ring-[#0052FF]/20 transition-all overflow-hidden">
                  <div className="w-14 h-14 flex items-center justify-center text-neutral-400 shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Johnathan Vance"
                    className="w-full h-14 pr-5 bg-transparent text-white placeholder:text-neutral-500 text-sm font-display outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-display uppercase tracking-wider text-neutral-300 font-semibold">
                  Work Email Address
                </label>
                <div className="flex items-center rounded-2xl bg-white/[0.05] border border-white/12 focus-within:border-[#0052FF] focus-within:ring-4 focus-within:ring-[#0052FF]/20 transition-all overflow-hidden">
                  <div className="w-14 h-14 flex items-center justify-center text-neutral-400 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@enterprise.com"
                    className="w-full h-14 pr-5 bg-transparent text-white placeholder:text-neutral-500 text-sm font-display outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Organization & Topic */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-display uppercase tracking-wider text-neutral-300 font-semibold">
                  Property or Company
                </label>
                <div className="flex items-center rounded-2xl bg-white/[0.05] border border-white/12 focus-within:border-[#0052FF] focus-within:ring-4 focus-within:ring-[#0052FF]/20 transition-all overflow-hidden">
                  <div className="w-14 h-14 flex items-center justify-center text-neutral-400 shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Westfield Plaza / Amazon Fleet"
                    className="w-full h-14 pr-5 bg-transparent text-white placeholder:text-neutral-500 text-sm font-display outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-display uppercase tracking-wider text-neutral-300 font-semibold">
                  Partnership Scope
                </label>
                <div className="flex items-center rounded-2xl bg-[#14141C] border border-white/12 focus-within:border-[#0052FF] focus-within:ring-4 focus-within:ring-[#0052FF]/20 transition-all overflow-hidden">
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full h-14 px-5 bg-transparent text-white text-sm font-display outline-none cursor-pointer"
                  >
                    <option value="host_station" className="bg-[#14141C] text-white">Host an Evora Hub (Property)</option>
                    <option value="fleet_charging" className="bg-[#14141C] text-white">Fleet & Logistics Solutions</option>
                    <option value="station_support" className="bg-[#14141C] text-white">Station Feedback & Grid Support</option>
                    <option value="press" className="bg-[#14141C] text-white">Press & Media Relations</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Row 3: Message */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-display uppercase tracking-wider text-neutral-300 font-semibold">
                Location Details & Specs
              </label>
              <div className="flex items-start rounded-2xl bg-white/[0.05] border border-white/12 focus-within:border-[#0052FF] focus-within:ring-4 focus-within:ring-[#0052FF]/20 transition-all overflow-hidden p-2">
                <div className="w-10 h-10 flex items-center justify-center text-neutral-400 shrink-0 mt-1">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share details regarding your property address, available parking bays, electrical service capacity, or deployment timeline..."
                  className="w-full p-2.5 bg-transparent text-white placeholder:text-neutral-500 text-sm font-display outline-none resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full h-14 rounded-2xl bg-[#0052FF] hover:bg-[#0041CC] text-white font-display font-bold text-sm uppercase tracking-widest transition-all shadow-[0_8px_30px_rgba(0,82,255,0.45)] hover:shadow-[0_12px_40px_rgba(0,82,255,0.65)] flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.98]"
            >
              <Send className="w-4 h-4" /> Submit Partnership Proposal
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
