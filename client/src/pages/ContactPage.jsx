import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: 'Fitting Inquiry', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 5000);
    setForm({ name: '', email: '', subject: 'Fitting Inquiry', message: '' });
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-ash">
          Concierge Support
        </span>
        <h1 className="font-display text-4xl font-extrabold text-noir tracking-tight">
          Get in Touch
        </h1>
        <p className="text-xs sm:text-sm text-ash leading-relaxed">
          Need sizing advice, customized multi-day rental arrangements for destination weddings, or assistance with host payouts? Our Mumbai concierge team is here for you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Contact Information */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-cream/40 border border-black/5 space-y-4">
            <h3 className="font-display text-lg font-bold text-noir">Styling Vault & Concierge</h3>

            <div className="space-y-3 text-xs text-noir/80">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-noir mt-0.5" />
                <div>
                  <strong>FloSet Concierge Hub</strong>
                  <p className="text-ash text-[11px]">Level 4, Linking Road, Bandra West, Mumbai, Maharashtra 400050</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-noir" />
                <div>
                  <strong>Phone / WhatsApp Concierge:</strong>
                  <p className="text-ash text-[11px]">+91 90224 47764 (9:00 AM – 9:00 PM IST)</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-noir" />
                <div>
                  <strong>Direct Email:</strong>
                  <p className="text-ash text-[11px]">concierge@floset.com</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-noir text-white space-y-2">
            <h4 className="font-display text-base font-bold text-emerald-300">Boutique & Host Partnerships</h4>
            <p className="text-xs text-white/70 leading-relaxed">
              Are you an established fashion designer or boutique with 10+ evening wear pieces? Contact our curation head at <span className="underline">curation@floset.com</span> for bulk inventory onboarding.
            </p>
          </div>
        </div>

        {/* Message Form */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/10 shadow-sm">
          {sent ? (
            <div className="py-16 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-noir text-base">Message Received!</h4>
              <p className="text-xs text-ash">
                Our concierge will get back to you within 2 business hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-noir uppercase tracking-wider text-[11px] mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="Rohan Mehta"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full p-2.5 bg-cream/40 border border-black/15 rounded-xl text-noir focus:outline-none focus:border-noir"
                />
              </div>

              <div>
                <label className="block font-bold text-noir uppercase tracking-wider text-[11px] mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="rohan@gmail.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full p-2.5 bg-cream/40 border border-black/15 rounded-xl text-noir focus:outline-none focus:border-noir"
                />
              </div>

              <div>
                <label className="block font-bold text-noir uppercase tracking-wider text-[11px] mb-1">Subject</label>
                <select
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full p-2.5 bg-cream/40 border border-black/15 rounded-xl text-noir focus:outline-none focus:border-noir cursor-pointer"
                >
                  <option value="Fitting Inquiry">Fitting & Measurement Inquiry</option>
                  <option value="Destination Wedding">Multi-Day Destination Wedding Rental</option>
                  <option value="Host Question">Host Listing Question</option>
                  <option value="Deposit Refund">Security Deposit Assistance</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-noir uppercase tracking-wider text-[11px] mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  placeholder="How can we assist you with your upcoming event?"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full p-2.5 bg-cream/40 border border-black/15 rounded-xl text-noir focus:outline-none focus:border-noir"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-noir text-white font-bold uppercase tracking-wider rounded-xl hover:bg-obsidian transition-colors shadow-sm"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
