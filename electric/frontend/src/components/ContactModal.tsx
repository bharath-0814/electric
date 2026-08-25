import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { X, Send, CheckCircle2 } from 'lucide-react';

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
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div
        className="relative w-full max-w-lg rounded-3xl bg-[#0A0A0A] border border-white/12 p-8 text-white shadow-2xl flex flex-col gap-6"
        style={{ animation: 'fadeUp 0.3s ease-out' }}
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-display font-bold uppercase tracking-widest text-[#0052FF]">
              Evora Energy Partners
            </span>
            <h3 className="font-display font-bold text-2xl text-white mt-0.5">
              Host a High-Power Station
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Bring ultra-fast 150-350kW liquid-cooled charging to your property, fleet, or commercial hub.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="w-14 h-14 text-emerald-400 mb-3 animate-bounce" />
            <h4 className="font-display font-bold text-lg text-white">Thank You!</h4>
            <p className="text-xs text-neutral-400 max-w-xs mt-1">
              Your inquiry has been submitted. Our commercial deployment team will reach out shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-display uppercase tracking-wider text-neutral-400">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-xs font-display text-white outline-none focus:border-[#0052FF]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-display uppercase tracking-wider text-neutral-400">
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@company.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-xs font-display text-white outline-none focus:border-[#0052FF]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-display uppercase tracking-wider text-neutral-400">
                  Organization / Property
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Retail Mall / Fleet"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-xs font-display text-white outline-none focus:border-[#0052FF]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-display uppercase tracking-wider text-neutral-400">
                  Inquiry Topic
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-xs font-display text-white outline-none focus:border-[#0052FF]"
                >
                  <option value="host_station">Host an Evora Hub (Property)</option>
                  <option value="fleet_charging">Fleet Solutions</option>
                  <option value="station_support">Station Feedback & Support</option>
                  <option value="press">Press & Media</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-display uppercase tracking-wider text-neutral-400">
                Message / Property Details
              </label>
              <textarea
                rows={3}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us about your location, estimated parking bays, or electrical capacity..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-xs font-display text-white outline-none focus:border-[#0052FF] resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3.5 rounded-xl bg-[#0052FF] hover:bg-[#0041CC] text-white font-display font-bold text-xs uppercase tracking-widest transition-all shadow-[0_4px_20px_rgba(0,82,255,0.4)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> Submit Partnership Request
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
