import React from "react";

export default function AuthLayout({ headline, subtext, stats = [], children }) {
  return (
    <div className="h-dvh overflow-hidden grid grid-cols-1 lg:grid-cols-[60fr_40fr] xl:grid-cols-[minmax(0,65fr)_minmax(340px,35fr)] w-full bg-[#F8F6F0] text-[#0F172A]">
      {/* Left panel: 60% on lg, 65% on xl. Hidden below lg */}
      <section
        aria-label="Brand Overview"
        className="hidden lg:flex h-dvh bg-[#0F1A2B] text-[#F8F6F0] flex-col justify-between p-8 xl:p-14 relative select-none overflow-hidden shrink-0"
      >
        {/* Photo/video with object-cover and dark gradient overlay */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover scale-105"
          >
            <source src="/background.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/60" />
        </div>

        {/* Brand mark at top */}
        <div className="relative z-10 flex items-center gap-2.5">
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none" aria-hidden="true" className="shrink-0">
            <rect x="2" y="2" width="11" height="11" stroke="#F8F6F0" strokeWidth="1.6" />
            <rect x="15" y="15" width="11" height="11" stroke="#C2410C" strokeWidth="1.6" />
            <line x1="13" y1="2" x2="26" y2="15" stroke="#C2410C" strokeWidth="1.4" className="live-dash-anim" />
            <circle cx="8" cy="20" r="3" stroke="#F8F6F0" strokeWidth="1.4" />
          </svg>
          <span className="text-sm font-semibold tracking-widest uppercase text-[#F8F6F0]">
            Nimbus
          </span>
        </div>

        {/* Center content: Headline and supporting line */}
        <div className="relative z-10 max-w-xl space-y-4">
          <div className="short-hide inline-flex items-center gap-2 px-2.5 py-1 rounded-[3px] border border-white/20 bg-black/40 text-[11px] font-mono-code text-[#E2E8F0]">
            <span className="relative flex h-2 w-2">
              <span className="live-pulse-ring absolute inline-flex h-full w-full rounded-full bg-[#C2410C]"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C2410C]"></span>
            </span>
            <span>LIVE CONSENSUS ACTIVE</span>
          </div>

          <h2 className="font-editorial text-[clamp(2.25rem,3.4vw,3.75rem)] leading-[1.08] text-[#F8F6F0] max-w-[20ch] short-compact-text">
            {headline}
          </h2>
          {subtext && (
            <p className="short-hide text-sm sm:text-base leading-relaxed text-[#CBD5E1] max-w-[52ch]">
              {subtext}
            </p>
          )}
        </div>

        {/* Footer stats row aligned with headline's left padding */}
        <div className="relative z-10 flex items-center justify-between text-xs text-[#CBD5E1] pt-4 border-t border-white/15">
          {stats.length > 0 ? (
            stats.map((stat, idx) => (
              <span key={idx} className={idx === 0 ? "font-mono-code" : ""}>
                {stat}
              </span>
            ))
          ) : (
            <>
              <span className="font-mono-code">EST. 2024</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                System: Nominal
              </span>
              <span>v2.18.0</span>
            </>
          )}
        </div>
      </section>

      {/* Right panel: bg paper, flex flex-col, overflow-y-auto only on this column */}
      <main className="w-full h-dvh bg-[#F8F6F0] flex flex-col justify-between px-5 sm:px-8 lg:px-6 xl:px-10 py-4 sm:py-6 lg:py-6 overflow-y-auto pt-[max(1rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {/* Compact brand header for mobile below lg */}
        <div className="lg:hidden flex items-center gap-2 mb-2 shrink-0">
          <svg width="22" height="22" viewBox="0 0 28 28" fill="none" aria-hidden="true" className="shrink-0">
            <rect x="2" y="2" width="11" height="11" stroke="#0F172A" strokeWidth="1.6" />
            <rect x="15" y="15" width="11" height="11" stroke="#C2410C" strokeWidth="1.6" />
          </svg>
          <span className="text-xs font-bold tracking-widest uppercase text-[#0F172A]">
            Nimbus
          </span>
        </div>

        {/* Vertically centered form container capped at max-w-[400px] */}
        <div className="w-full max-w-[400px] mx-auto my-auto py-1">
          {/* Logo lockup at top of right panel on desktop */}
          <div className="hidden lg:flex items-center gap-2.5 mb-3.5">
            <svg width="26" height="26" viewBox="0 0 28 28" fill="none" aria-hidden="true" className="shrink-0">
              <rect x="2" y="2" width="11" height="11" stroke="#0F172A" strokeWidth="1.6" />
              <rect x="15" y="15" width="11" height="11" stroke="#C2410C" strokeWidth="1.6" />
              <line x1="13" y1="2" x2="26" y2="15" stroke="#C2410C" strokeWidth="1.4" className="live-dash-anim" />
              <circle cx="8" cy="20" r="3" stroke="#0F172A" strokeWidth="1.4" />
            </svg>
            <span className="text-xs font-mono-code uppercase tracking-wider text-[#64748B]">
              Institutional Treasury Console
            </span>
          </div>

          {children}
        </div>

        {/* Copyright line at bottom (mt-auto) */}
        <div className="mt-auto pt-2.5 border-t border-[#E2DED5] text-center text-[11px] text-[#64748B] shrink-0">
          <span>&copy; {new Date().getFullYear()} Nimbus Systems Inc. All rights reserved.</span>
        </div>
      </main>
    </div>
  );
}
