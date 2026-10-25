import React, { useState, useEffect } from "react";

const DEFAULT_FEATURES = [
  {
    title: "Enterprise Security",
    desc: "Your data, always protected",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: "Real-time Insights",
    desc: "Make informed decisions faster",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    title: "Collaborative Workflow",
    desc: "Built for institutional teams",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

const CURRENT_YEAR = new Date().getFullYear();

export default function AuthLayout({
  eyebrow = "TRUSTED. SECURE. INTELLIGENT.",
  headline = { line1: "Secure access to your", line2: "treasury operations." },
  paragraph = "A unified platform to manage, monitor and optimize your institutional treasury operations with confidence.",
  subtext,
  features = DEFAULT_FEATURES,
  stats,
  footerItems = ["EST. 2024", "Consensus Active", "v2.18.0"],
  children,
}) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  const resolvedParagraph = paragraph || subtext;
  const resolvedFooter = stats && stats.length > 0 ? stats : footerItems;

  return (
    <div className="h-dvh overflow-hidden grid grid-cols-1 lg:grid-cols-[60fr_40fr] xl:grid-cols-[65fr_35fr] w-full bg-[#FAFAF8] text-[#0F172A]">
      {/* LEFT PANEL: Video as background across the entire panel, no solid color background */}
      <section
        aria-label="Brand Overview"
        className="hidden lg:flex h-dvh bg-[#0F1A2B] text-[#F8F6F0] flex-col justify-between p-8 xl:p-14 relative select-none overflow-hidden shrink-0 border-r border-black/20"
      >
        {/* Background video + cinematic contrast scrim */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {/* Only render video on desktop */}
          {isDesktop && (
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover object-[70%_center] scale-105"
            >
              <source src="/background.mp4" type="video/mp4" />
            </video>
          )}

          {/* Subtle scrim with backdrop treatment to let the video shine through brightly and clearly */}
          <div className="absolute inset-0 bg-black/15" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

          {/* Subtle rust wave SVG at bottom-left */}
          <svg
            className="pointer-events-none absolute bottom-0 left-0 w-[440px] h-[220px] text-[#C2410C] opacity-30 select-none"
            viewBox="0 0 500 250"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M-50 250 C 100 230, 160 160, 260 190 C 360 220, 420 170, 520 180 L 520 250 Z"
              fill="currentColor"
              fillOpacity="0.1"
            />
            <path
              d="M-50 250 C 80 200, 180 120, 300 160 C 400 195, 460 140, 520 150"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeOpacity="0.5"
            />
            <path
              d="M-50 250 C 120 220, 200 140, 320 170 C 420 200, 480 160, 520 170"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="4 4"
              strokeOpacity="0.4"
            />
            <path
              d="M-50 250 C 50 180, 150 90, 270 130 C 370 165, 450 110, 520 120"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeOpacity="0.35"
            />
          </svg>
        </div>

        {/* Top: Logo mark + NIMBUS wordmark, 1px vertical divider, and two-line monospace label */}
        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              aria-hidden="true"
              className="shrink-0"
            >
              <rect x="2" y="2" width="11" height="11" stroke="#F8F6F0" strokeWidth="1.6" />
              <rect x="15" y="15" width="11" height="11" stroke="#FB923C" strokeWidth="1.6" />
              <line
                x1="13"
                y1="2"
                x2="26"
                y2="15"
                stroke="#FB923C"
                strokeWidth="1.4"
                className="live-dash-anim"
              />
              <circle cx="8" cy="20" r="3" stroke="#F8F6F0" strokeWidth="1.4" />
            </svg>
            <span className="text-sm font-bold tracking-[0.2em] uppercase text-[#F8F6F0]">
              NIMBUS
            </span>
          </div>
          <div className="h-6 w-px bg-white/20" aria-hidden="true" />
          <div className="font-mono text-[11px] leading-[1.2] tracking-widest text-[#94A3B8] uppercase select-none">
            <div>INSTITUTIONAL</div>
            <div>TREASURY CONSOLE</div>
          </div>
        </div>

        {/* Upper-middle content container: Eyebrow + Headline + Paragraph + Features */}
        <div className="relative z-10 max-w-xl mt-6 xl:mt-10 mb-auto space-y-4 xl:space-y-6 [text-shadow:_0_1px_8px_rgba(0,0,0,0.6)]">
          {/* Eyebrow in accent color */}
          {eyebrow && (
            <div className="text-[12px] font-semibold tracking-[0.2em] text-[#FB923C] uppercase font-mono">
              {eyebrow}
            </div>
          )}

          {/* Headline in serif, clamp(2.5rem, 3.8vw, 4.25rem), max-w-[16ch] */}
          <h2 className="font-editorial text-[clamp(2.5rem,3.8vw,4.25rem)] leading-[1.05] tracking-tight max-w-[16ch]">
            {typeof headline === "object" && headline !== null && "line1" in headline ? (
              <>
                <span className="block text-[#F8F6F0]">{headline.line1}</span>
                <span className="block text-[#FB923C]">{headline.line2}</span>
              </>
            ) : (
              <span className="text-[#F8F6F0]">{headline}</span>
            )}
          </h2>

          {/* Paragraph (17px, max-w-[46ch]) */}
          {resolvedParagraph && (
            <p className="short-hide text-[17px] leading-relaxed text-[#CBD5E1] max-w-[46ch]">
              {resolvedParagraph}
            </p>
          )}

          {/* Three feature rows (gap 16px) */}
          {features && features.length > 0 && (
            <div className="pt-2 flex flex-col gap-3.5 xl:gap-4">
              {features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-11 h-11 short-tile-sm rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center shrink-0 text-[#FB923C]">
                    {feat.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-editorial font-bold text-[#F8F6F0] text-[15px] sm:text-base leading-snug">
                      {feat.title}
                    </h3>
                    <p className="short-hide-desc text-xs sm:text-sm text-[#94A3B8] truncate">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer row at the bottom: EST. 2024 | Consensus Active | v2.18.0 */}
        <div className="relative z-10 flex items-center gap-3 text-xs text-[#94A3B8] font-mono pt-4 border-t border-white/15 shrink-0">
          {resolvedFooter.map((item, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="w-px h-3 bg-white/20" aria-hidden="true" />}
              <span
                className={
                  item === "Consensus Active"
                    ? "inline-flex items-center gap-1.5 text-[#F8F6F0] font-medium"
                    : ""
                }
              >
                {item === "Consensus Active" && (
                  <span className="relative flex h-2 w-2">
                    <span className="live-pulse-ring absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
                  </span>
                )}
                {item}
              </span>
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* RIGHT PANEL: bg off-white (#FAFAF8), flex col, centered card */}
      <main className="w-full h-dvh bg-[#FAFAF8] flex flex-col justify-between items-center px-4 sm:px-6 lg:px-8 py-4 sm:py-6 overflow-y-auto pt-[max(1rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {/* Compact brand header for mobile below lg */}
        <div className="lg:hidden flex items-center gap-3 mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <svg
              width="24"
              height="24"
              viewBox="0 0 28 28"
              fill="none"
              aria-hidden="true"
              className="shrink-0"
            >
              <rect x="2" y="2" width="11" height="11" stroke="#0F172A" strokeWidth="1.6" />
              <rect x="15" y="15" width="11" height="11" stroke="#C2410C" strokeWidth="1.6" />
            </svg>
            <span className="text-xs font-bold tracking-widest uppercase text-[#0F172A]">
              Nimbus
            </span>
          </div>
          <div className="h-4 w-px bg-[#0F172A]/20" aria-hidden="true" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#64748B]">
            Institutional Treasury Console
          </span>
        </div>

        {/* White Card: rounded-2xl, 1px border (slate 10%), soft shadow, p-8, max-w-[460px] */}
        <div className="w-full max-w-[460px] my-auto mx-auto bg-white rounded-2xl border border-[#0F172A]/10 shadow-[0_10px_40px_rgba(15,26,43,0.08)] p-6 sm:p-8 short-card-compact @container flex flex-col transition-all duration-150">
          {children}
        </div>

        {/* Copyright line centered below the card */}
        <div className="text-center text-[11px] text-[#64748B] mt-auto pt-3 shrink-0 select-none">
          &copy; {CURRENT_YEAR} Nimbus Systems Inc. All rights reserved.
        </div>
      </main>
    </div>
  );
}
