import React from 'react';

/**
 * Shared shell for Admin / Host dashboards — consistent spacing and typography.
 */
export default function DashboardShell({ badge, badgeIcon: BadgeIcon, title, subtitle, actions, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cream/80 via-white to-sand/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 lg:mb-10">
          <div className="space-y-2 max-w-2xl">
            {badge && (
              <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-noir/70">
                {BadgeIcon && <BadgeIcon className="w-3.5 h-3.5" />}
                <span>{badge}</span>
              </div>
            )}
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-noir tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-ash leading-relaxed">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
        </header>
        {children}
      </div>
    </div>
  );
}

export function DashboardStat({ label, value, hint, icon: Icon, accent = 'default' }) {
  const accents = {
    default: 'text-noir',
    success: 'text-emerald-700',
    warning: 'text-amber-700'
  };
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-framer-sm">
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-ash">{label}</span>
        {Icon && <Icon className={`w-4 h-4 ${accents[accent] || accents.default} opacity-80`} />}
      </div>
      <p className="font-display text-2xl sm:text-3xl font-extrabold text-noir tabular-nums">{value}</p>
      {hint && <p className={`text-[11px] mt-1.5 font-medium ${accents[accent] || 'text-ash'}`}>{hint}</p>}
    </div>
  );
}

export function DashboardPanel({ title, description, children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-black/[0.06] bg-white shadow-framer-sm overflow-hidden ${className}`}>
      {(title || description) && (
        <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-black/[0.05]">
          {title && <h2 className="font-display text-base sm:text-lg font-bold text-noir">{title}</h2>}
          {description && <p className="text-xs text-ash mt-1">{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}
