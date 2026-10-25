import React, { useState } from "react";

const INITIAL_TRANSACTIONS = [
  {
    ref: "TX-90214",
    initials: "JP",
    counterparty: "JPMorgan Chase Institutional",
    type: "Fedwire Outbound",
    amount: "$1,450,000.00",
    status: "Settled",
    timestamp: "15:42 EST",
    avatarBg: "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]",
  },
  {
    ref: "TX-90213",
    initials: "BN",
    counterparty: "BNY Mellon Custody",
    type: "DvP Settlement",
    amount: "$820,400.00",
    status: "Settled",
    timestamp: "14:18 EST",
    avatarBg: "bg-[#F5F3FF] text-[#6D28D9] border-[#DDD6FE]",
  },
  {
    ref: "TX-90212",
    initials: "EC",
    counterparty: "Euroclear Brussels",
    type: "Cross-Border FX",
    amount: "€640,000.00",
    status: "Processing",
    timestamp: "12:05 EST",
    avatarBg: "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]",
  },
  {
    ref: "TX-90211",
    initials: "SV",
    counterparty: "Silicon Valley Treasury",
    type: "ACH Credit",
    amount: "$94,320.50",
    status: "Settled",
    timestamp: "09:22 EST",
    avatarBg: "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]",
  },
  {
    ref: "TX-90210",
    initials: "SS",
    counterparty: "State Street Global",
    type: "Tri-party Repo",
    amount: "$3,100,000.00",
    status: "Settled",
    timestamp: "Yesterday",
    avatarBg: "bg-[#F8FAFC] text-[#334155] border-[#E2E8F0]",
  },
];

export default function ActivityList({
  searchQuery = "",
  isLoading = false,
  onViewAll,
}) {
  const [filter, setFilter] = useState("All"); // All, Settled, Processing
  const [copiedId, setCopiedId] = useState("");

  const handleCopy = (ref) => {
    navigator.clipboard?.writeText(ref);
    setCopiedId(ref);
    setTimeout(() => {
      setCopiedId("");
    }, 1500);
  };

  const filtered = INITIAL_TRANSACTIONS.filter((tx) => {
    const matchesFilter = filter === "All" || tx.status === filter;
    const matchesSearch =
      tx.ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.counterparty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (isLoading) {
    return (
      <section className="h-full min-h-0 bg-white border border-[#E2DED5] rounded-[10px] flex flex-col overflow-hidden animate-pulse shadow-sm">
        <div className="px-4 py-3 border-b border-[#ECE8DF] flex items-center justify-between">
          <div className="h-3 w-28 bg-[#E2DED5] rounded" />
          <div className="h-3 w-16 bg-[#ECE8DF] rounded" />
        </div>
        <div className="p-3 space-y-3 flex-1">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="flex items-center gap-3">
              <div className="h-9 w-9 bg-[#E2DED5] rounded-[8px]" />
              <div className="flex-1 space-y-1">
                <div className="h-3 w-36 bg-[#E2DED5] rounded" />
                <div className="h-2 w-20 bg-[#ECE8DF] rounded" />
              </div>
              <div className="h-4 w-16 bg-[#E2DED5] rounded" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="Recent activity log"
      className="h-full min-h-0 bg-white border border-[#E2DED5] rounded-[10px] flex flex-col overflow-hidden shadow-[0_1px_3px_rgba(15,23,42,0.04)] relative"
    >
      {/* Header with Title & Filter Chips */}
      <div className="px-3.5 py-2.5 border-b border-[#ECE8DF] flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wide text-[#0F172A]">
            Recent Activity
          </h2>
          {/* Count */}
          <span className="text-[10px] font-mono-code text-[#64748B]">
            ({filtered.length} events)
          </span>
        </div>

        {/* Filter Chips: All, Settled, Processing */}
        <div
          role="radiogroup"
          aria-label="Filter activity status"
          className="inline-flex items-center p-0.5 rounded-[4px] bg-[#F1F5F9] border border-[#E2E8F0]"
        >
          {["All", "Settled", "Processing"].map((f) => (
            <button
              key={f}
              type="button"
              role="radio"
              aria-checked={filter === f}
              onClick={() => setFilter(f)}
              className={`px-1.5 py-0.5 text-[10px] font-mono-code font-bold rounded-[3px] transition-all cursor-pointer ${
                filter === f
                  ? "bg-white text-[#0F172A] shadow-xs"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Internal Scrollable Activity List (only this scrolls internally) */}
      <div
        tabIndex={0}
        aria-label="Transaction events list"
        className="flex-1 min-h-0 overflow-y-auto custom-scrollbar relative divide-y divide-[#ECE8DF] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[#C2410C]"
      >
        {filtered.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center gap-1.5 text-xs text-[#64748B]">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-[#94A3B8]"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <p className="font-semibold text-[#0F172A]">No activity found</p>
            <p className="text-[11px] text-[#64748B]">
              {searchQuery ? `No records match "${searchQuery}".` : "No matching transactions."}
            </p>
          </div>
        ) : (
          filtered.map((tx) => (
            <button
              key={tx.ref}
              type="button"
              onClick={() => handleCopy(tx.ref)}
              className="w-full text-left min-h-[56px] xl:min-h-[60px] px-3.5 py-2.5 short-activity-row transition-colors cursor-pointer flex items-center justify-between gap-3 group relative hover:bg-[#F6F4EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#C2410C]"
            >
              {/* Left 2px accent bar on hover */}
              <div
                className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#C2410C] opacity-0 group-hover:opacity-100 transition-opacity"
                aria-hidden="true"
              />

              {/* Institution Avatar + Details */}
              <div className="flex items-center gap-3 min-w-0">
                {/* 36px rounded square avatar with initials */}
                <div
                  className={`w-9 h-9 rounded-[8px] border flex items-center justify-center font-bold text-xs shrink-0 select-none ${tx.avatarBg}`}
                  aria-hidden="true"
                >
                  {tx.initials}
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#0F172A] truncate leading-tight">
                    {tx.counterparty}
                  </p>
                  <p className="text-[10px] text-[#64748B] truncate mt-0.5 short-hide-footnote">
                    <span className="font-mono-code font-medium">{tx.ref}</span> &bull; {tx.timestamp}
                  </p>
                </div>
              </div>

              {/* Amount and Status */}
              <div className="text-right shrink-0 flex flex-col items-end">
                <p className="font-mono-code text-xs font-semibold text-[#0F172A] leading-tight">
                  {tx.amount}
                </p>
                <span
                  className={`text-[9px] font-semibold inline-flex items-center px-1.5 py-0.5 rounded-[3px] border mt-0.5 ${
                    tx.status === "Settled"
                      ? "text-[#059669] bg-[#ECFDF5] border-[#A7F3D0]"
                      : tx.status === "Processing"
                      ? "text-[#B45309] bg-[#FFFBEB] border-[#FDE68A]"
                      : "text-[#DC2626] bg-[#FEF2F2] border-[#FECACA]"
                  }`}
                >
                  {tx.status}
                </span>
              </div>
            </button>
          ))
        )}

        {/* Bottom subtle scroll fade */}
        <div
          className="pointer-events-none sticky bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent opacity-75"
          aria-hidden="true"
        />
      </div>

      {/* Fixed Footer: View all activity link */}
      <div className="px-3.5 py-2 border-t border-[#ECE8DF] bg-[#FAF8F5] flex items-center justify-between text-[11px] text-[#64748B] shrink-0">
        <span className="font-mono-code text-[10px]">
          {filtered.length} of {INITIAL_TRANSACTIONS.length} events
        </span>
        <button
          type="button"
          onClick={onViewAll}
          className="text-[#C2410C] font-semibold text-[11px] hover:underline flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C2410C]"
        >
          <span>View all activity</span>
          <span aria-hidden="true">&rarr;</span>
        </button>
      </div>

      {/* Floating Copied Toast (1.5s duration) with aria-live */}
      <div
        aria-live="polite"
        className={`absolute bottom-11 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-[#0F1A2B] text-white text-[11px] font-mono-code rounded shadow-lg transition-all duration-200 pointer-events-none z-20 flex items-center gap-1.5 ${
          copiedId ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
        <span>Copied {copiedId}</span>
      </div>
    </section>
  );
}
export { INITIAL_TRANSACTIONS };
