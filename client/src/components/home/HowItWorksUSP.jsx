import React from 'react';
import { Truck, Sparkles, RefreshCw, ShieldCheck } from 'lucide-react';

export default function HowItWorksUSP() {
  const steps = [
    {
      num: '01',
      icon: Truck,
      title: 'Worldwide Shipping & Delivery',
      desc: 'Fast, reliable courier delivery right to your doorstep. Track your outfit and receive it sanitized and event-ready.'
    },
    {
      num: '02',
      icon: Sparkles,
      title: 'Sustainable Circular Fashion',
      desc: 'Every piece is shared through our circular luxury model. Wear designer couture with purpose and zero closet waste.'
    },
    {
      num: '03',
      icon: RefreshCw,
      title: 'Hassle-Free Return & Care',
      desc: 'No need to dry-clean before returning. Our courier picks up the outfit from your home when your rental window ends.'
    },
    {
      num: '04',
      icon: ShieldCheck,
      title: 'Secure Checkout & Deposit',
      desc: 'Encrypted payment with 100% refundable security deposit credited back swiftly following return inspection.'
    }
  ];

  return (
    <section className="py-20 bg-cream/40 border-y border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-ash">
            The FLOSET Guarantee
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-noir tracking-tight mt-1">
            Shop With Confidence
          </h2>
          <p className="text-xs sm:text-sm text-ash mt-2 font-light">
            Engineered from the ground up to deliver a seamless luxury rental experience from checkout to return.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.num}
                className="bg-white p-7 rounded-2xl border border-black/5 shadow-sm hover:shadow-framer-md transition-all duration-300 relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-cream flex items-center justify-center text-noir">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-display text-xl font-black text-noir/20">
                      {s.num}
                    </span>
                  </div>

                  <h3 className="font-display text-base font-bold text-noir mb-2">
                    {s.title}
                  </h3>
                  <p className="text-xs text-ash leading-relaxed font-light">
                    {s.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
