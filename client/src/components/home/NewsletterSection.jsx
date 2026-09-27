import React, { useState } from 'react';
import { Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubmitted(true);
  };

  return (
    <section className="py-20 bg-white border-t border-black/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream text-ash text-xs font-semibold uppercase tracking-widest mb-4">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Exclusive Access</span>
        </div>

        <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-noir tracking-tight mb-4">
          Join Our Newsletter
        </h2>

        <p className="text-ash text-sm sm:text-base max-w-lg mx-auto mb-8 font-light leading-relaxed">
          Be the first to discover new arrivals, exclusive seasonal drops, designer spotlight features, and occasion styling inspiration delivered directly to your inbox.
        </p>

        {submitted ? (
          <div className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Thank you for subscribing! Welcome to the FLOSET circle.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto flex items-center gap-2">
            <div className="relative flex-grow">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address..."
                required
                className="w-full px-5 py-3.5 rounded-full bg-cream/70 border border-black/10 focus:border-noir focus:bg-white text-noir text-xs outline-none transition-all placeholder:text-ash/60"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 bg-noir hover:bg-obsidian text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-sm hover:scale-105 active:scale-95 flex items-center gap-1.5 shrink-0"
            >
              <span>Subscribe</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        <p className="text-[11px] text-ash/70 mt-4">
          No spam, ever. Unsubscribe at any time with one click.
        </p>
      </div>
    </section>
  );
}
