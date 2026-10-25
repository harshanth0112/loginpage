import React, { useState } from "react";

export default function Sidebar({
  activeNav,
  setActiveNav,
  sidebarCollapsed,
  setSidebarCollapsed,
  navItems,
  user,
  initials,
  onQuickAction,
}) {
  const [pinnedOpen, setPinnedOpen] = useState(true);

  return (
    <aside
      aria-label="Sidebar navigation"
      className={`hidden md:flex shrink-0 bg-[#0F1A2B] text-[#F8F6F0] flex-col justify-between p-3.5 border-r border-[#1E293B] transition-all duration-200 select-none ${
        sidebarCollapsed ? "w-[72px]" : "w-60"
      }`}
    >
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Logo header + collapse toggle button */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1E293B] min-h-[40px] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <svg
              width="24"
              height="24"
              viewBox="0 0 28 28"
              fill="none"
              aria-hidden="true"
              className="shrink-0"
            >
              <rect x="2" y="2" width="11" height="11" stroke="#F8F6F0" strokeWidth="1.6" />
              <rect x="15" y="15" width="11" height="11" stroke="#C2410C" strokeWidth="1.6" />
            </svg>
            {!sidebarCollapsed && (
              <span className="text-xs font-bold tracking-widest uppercase text-white truncate font-mono">
                Nimbus
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="min-h-[28px] min-w-[28px] flex items-center justify-center rounded text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C2410C] cursor-pointer"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className={`transition-transform duration-200 ${sidebarCollapsed ? "rotate-180" : ""}`}
              aria-hidden="true"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="mt-3 space-y-1 shrink-0">
          {!sidebarCollapsed && (
            <span className="block text-[10px] font-bold uppercase tracking-wider text-[#64748B] px-3 mb-1.5 font-mono">
              Treasury Console
            </span>
          )}
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveNav(item.id)}
                title={sidebarCollapsed ? item.label : undefined}
                className={`w-full min-h-[38px] px-3 py-2 rounded-[6px] text-xs font-medium flex items-center transition-all cursor-pointer relative group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2410C] ${
                  sidebarCollapsed ? "justify-center" : "justify-between"
                } ${
                  isActive
                    ? "bg-[#1E293B] text-white font-semibold"
                    : "text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/50"
                }`}
              >
                {/* 3px accent left bar when active */}
                {isActive && (
                  <span
                    className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#C2410C] rounded-r"
                    aria-hidden="true"
                  />
                )}

                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={isActive ? "text-[#C2410C]" : "text-[#94A3B8] group-hover:text-white"}>
                    {item.icon}
                  </span>
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!sidebarCollapsed && isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C2410C]" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Actions / System Health Section */}
        {!sidebarCollapsed ? (
          <div className="mt-4 pt-3 border-t border-[#1E293B] shrink-0">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] font-mono">
                Quick Actions
              </span>
              <button
                type="button"
                onClick={() => setPinnedOpen(!pinnedOpen)}
                className="text-[#94A3B8] hover:text-white text-[10px]"
                aria-label={pinnedOpen ? "Hide quick actions" : "Show quick actions"}
              >
                {pinnedOpen ? "−" : "+"}
              </button>
            </div>

            {pinnedOpen && (
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => onQuickAction("new_batch")}
                  className="w-full text-left px-3 py-1.5 rounded-[4px] text-[11px] text-[#CBD5E1] hover:text-white hover:bg-[#1E293B] transition-colors flex items-center justify-between group"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-[#C2410C] font-bold">+</span>
                    <span>New Batch</span>
                  </span>
                  <span className="text-[10px] text-[#64748B] font-mono group-hover:text-[#94A3B8]">
                    RTGS
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onQuickAction("run_recon")}
                  className="w-full text-left px-3 py-1.5 rounded-[4px] text-[11px] text-[#CBD5E1] hover:text-white hover:bg-[#1E293B] transition-colors flex items-center justify-between group"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-[#10B981] font-bold">↻</span>
                    <span>Reconciliation</span>
                  </span>
                  <span className="text-[10px] text-[#64748B] font-mono group-hover:text-[#94A3B8]">
                    T+0
                  </span>
                </button>
              </div>
            )}

            {/* System Status Block with API Latency & Green Dot */}
            <div className="mt-3 px-3 py-2 rounded-[6px] bg-[#142032] border border-[#1E293B]/80 text-[10px] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8] font-mono uppercase">API Latency</span>
                <span className="text-[#10B981] font-mono font-semibold">12ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8] font-mono uppercase">Uptime</span>
                <span className="flex items-center gap-1.5 text-slate-300 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                  99.998%
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Collapsed mode system dot */
          <div className="mt-4 pt-3 border-t border-[#1E293B] flex flex-col items-center gap-2 shrink-0">
            <div
              title="System Status: Operational • 12ms latency"
              className="w-8 h-8 rounded-full bg-[#142032] border border-[#1E293B] flex items-center justify-center cursor-help"
            >
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Section: User Mini-Profile & Node Info */}
      <div className="pt-3 border-t border-[#1E293B] shrink-0 space-y-2">
        {!sidebarCollapsed ? (
          <>
            {/* User Mini-Profile */}
            <div className="flex items-center gap-2.5 px-1 py-1">
              <span className="h-8 w-8 rounded-[6px] bg-[#1E293B] border border-[#334155] text-xs font-bold text-[#F8F6F0] flex items-center justify-center shrink-0">
                {initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {user?.name || "Operator"}
                </p>
                <p className="text-[10px] text-[#94A3B8] font-medium truncate">
                  Treasury Analyst
                </p>
              </div>
            </div>

            {/* Node & TLS Info */}
            <div className="text-[10px] text-[#64748B] font-mono px-1">
              <p className="text-slate-400">NODE: us-east-prod-1</p>
              <p className="text-[9.5px]">TLS 1.3 Strict Mutual Auth</p>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1.5" title={`${user?.name || "Operator"} • Treasury Analyst • NODE: us-east-prod-1`}>
            <span className="h-8 w-8 rounded-[6px] bg-[#1E293B] border border-[#334155] text-xs font-bold text-[#F8F6F0] flex items-center justify-center">
              {initials}
            </span>
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
          </div>
        )}
      </div>
    </aside>
  );
}
