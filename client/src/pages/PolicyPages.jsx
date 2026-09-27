import React from 'react';
import { ArrowLeft, ShieldCheck, RefreshCw, Truck, FileText } from 'lucide-react';

export default function PolicyPages({ policyType, onNavigate }) {
  const policies = {
    'return-and-refund': {
      title: 'Return & Refund Policy',
      subtitle: 'Understand return windows, item condition requirements, deposit refunds, and hygiene assurance.',
      effectiveDate: 'June 25, 2026',
      icon: RefreshCw,
      sections: [
        {
          title: '1. Overview',
          content: 'We want you to feel completely confident when renting occasion wear, designer lehengas, evening gowns, tuxedos, and sherwanis with FLOSET. This Return & Refund Policy explains how rental returns, hygiene standards, and security deposits are handled.'
        },
        {
          title: '2. Return Window & Courier Pickup',
          content: 'Rental duration begins at the chosen delivery time slot and concludes at the end of your rental period (3 hours, 1 day, 3 days, 5 days, or 7 days). Our reverse logistics courier arrives at your delivery address to collect the garment at the conclusion of your booked rental window. Late returns beyond 3 hours may incur standard additional-day rental fees.'
        },
        {
          title: '3. Garment Condition & Minor Wear',
          content: 'We understand that normal celebrations involve minor wear and tear (such as loose threads or minor wrinkles). FLOSET covers normal wear as part of our rental service. Significant damages (burns, unrepairable tears, missing accessories, heavy wine or food stains requiring complete fabric replacement) will be assessed fairly and deducted from the refundable security deposit.'
        },
        {
          title: '4. Refundable Security Deposit',
          content: 'Each rental includes a security deposit held during your rental window. Following a standard 10-minute post-return physical inspection at our Mumbai sanitation vault, 100% of your deposit is credited directly back to your original payment method within 12–24 business hours.'
        },
        {
          title: '5. Cancellations & Pre-Dispatch Changes',
          content: 'Bookings cancelled at least 48 hours prior to the scheduled delivery date are entitled to a 100% full refund with zero cancellation penalties. For emergency date reschedules, our support team can adjust your dates subject to outfit calendar availability.'
        }
      ]
    },
    'shipping': {
      title: 'Shipping & Delivery Policy',
      subtitle: 'How orders are processed, delivered in protective wardrobe bags, and picked up post-event.',
      effectiveDate: 'June 25, 2026',
      icon: Truck,
      sections: [
        {
          title: '1. Overview & Service Coverage',
          content: 'FLOSET provides prompt white-glove doorstep delivery and reverse courier pickup across Mumbai, Navi Mumbai, and Thane. All outfits arrive in bespoke breathable garment bags with branded hangers.'
        },
        {
          title: '2. Delivery Timelines',
          content: 'To provide peace of mind, your rental outfit is scheduled to arrive at least 3 to 12 hours prior to your selected start time, ensuring you have ample time to prepare for your event.'
        },
        {
          title: '3. Reverse Pickup & Returns',
          content: 'When your rental concludes, place the outfit and all included accessories back into the provided FLOSET garment bag. Our verified courier will arrive with a pre-printed barcode label to collect the parcel from your address.'
        },
        {
          title: '4. Address Accuracy',
          content: 'Please ensure your contact phone number and full delivery address are correct at checkout. Our delivery concierge will send a WhatsApp or SMS notification prior to arrival.'
        }
      ]
    },
    'privacy': {
      title: 'Privacy Policy',
      subtitle: 'How FLOSET protects and manages your personal, identity, and payment information.',
      effectiveDate: 'June 25, 2026',
      icon: ShieldCheck,
      sections: [
        {
          title: '1. Information We Collect',
          content: 'We collect information necessary to fulfill your fashion rental orders, including your name, contact phone number, email address, delivery addresses, and sizing measurements.'
        },
        {
          title: '2. Host Privacy & Identity Concealment',
          content: 'FLOSET is committed to protecting the privacy of both renters and wardrobe hosts. Host identities, private addresses, and individual earnings are strictly shielded on the public catalogue. Renters interact exclusively with the FLOSET brand.'
        },
        {
          title: '3. Payment Data & Security',
          content: 'All financial transactions and refundable security deposits are processed via encrypted, RBI-compliant payment gateways. FLOSET does not store complete credit/debit card numbers or bank passwords.'
        }
      ]
    },
    'terms': {
      title: 'Terms of Service',
      subtitle: 'User agreements, rental obligations, and marketplace community rules.',
      effectiveDate: 'June 25, 2026',
      icon: FileText,
      sections: [
        {
          title: '1. Acceptance of Terms',
          content: 'By accessing or renting garments through FLOSET, you agree to comply with our rental agreement, care instructions, and return guidelines.'
        },
        {
          title: '2. Care of Rented Garments',
          content: 'Renters agree to handle garments with reasonable care and refrain from self-cleaning or washing delicate silks, velvets, and zardozi embroideries. FLOSET manages all professional dry-cleaning and sanitation.'
        },
        {
          title: '3. Host Listing Agreement',
          content: 'Hosts listing their designer outfits warrant that the pieces are authentic and accurately described. FLOSET manages logistics, curation, cleaning, customer support, and timely host payouts.'
        }
      ]
    }
  };

  const active = policies[policyType] || policies['return-and-refund'];
  const Icon = active.icon;

  return (
    <div className="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-2 text-xs font-bold text-ash hover:text-noir transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="border-b border-black/10 pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream text-ash text-xs font-semibold uppercase tracking-widest mb-3">
            <Icon className="w-3.5 h-3.5 text-noir" />
            <span>Legal Documentation</span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-noir tracking-tight">
            {active.title}
          </h1>
          <p className="text-ash text-sm sm:text-base mt-2 font-light leading-relaxed">
            {active.subtitle}
          </p>
          <p className="text-[11px] text-ash/80 mt-3">
            Effective Date: {active.effectiveDate}
          </p>
        </div>

        <div className="space-y-8 text-xs sm:text-sm text-noir/80 leading-relaxed font-light">
          {active.sections.map((sec, idx) => (
            <div key={idx} className="space-y-2">
              <h2 className="font-display text-lg sm:text-xl font-bold text-noir">
                {sec.title}
              </h2>
              <p className="text-ash leading-relaxed">
                {sec.content}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-black/10 flex items-center justify-between text-xs text-ash">
          <span>Need assistance? Contact concierge@floset.com</span>
          <button
            onClick={() => onNavigate('contact')}
            className="font-bold text-noir underline underline-offset-4 hover:text-ash"
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}
