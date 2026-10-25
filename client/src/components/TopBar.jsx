import React, { useState, useEffect, useRef } from "react";

export default function TopBar({
  user,
  initials,
  searchQuery,
  setSearchQuery,
  onExportCSV,
  onLogout,
  activeNavTitle,
}) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const searchInputRef = useRef(null);
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  // "/" keyboard shortcut to focus search input
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is already typing in an input or textarea
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close menus on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setNotifOpen(false);
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const notifications = [
    {
      id: "n1",
      title: "Batch 8821 Cutoff Alert",
      desc: "Fedwire funds settlement window closes in 24m.",
      time: "16:06 EST",
      unread: true,
    },
    {
      id: "n2",
      title: "Reconciliation Matched",
      desc: "JPMorgan Master Vault variance settled at $0.00.",
      time: "15:42 EST",
      unread: true,
    },
    {
      id: "n3",
      title: "Mutual TLS Rotation",
      desc: "Node client certificate renews automatically in 14 days.",
      time: "12:00 EST",
      unread: true,
    },
  ];

  return (
    <header className="hidden md:flex h-12 lg:h-13 border-b border-[#E2DED5] bg-[#F8F6F0] px-4 xl:px-6 items-center justify-between shrink-0 select-none">
      {/* Dynamic Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-[#64748B]">
        <span>Console</span>
        <span aria-hidden="true">/</span>
        <span>Production</span>
        <span aria-hidden="true">/</span>
        <span className="text-[#0F172A] font-semibold">{activeNavTitle}</span>
      </div>

      {/* Right Controls: Search with '/' hint, Notification Bell, Export CSV, User Dropdown */}
      <div className="flex items-center gap-2.5 lg:gap-3">
        {/* Search Input with "/" shortcut hint */}
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search console..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-44 lg:w-60 h-8 text-xs bg-white border border-[#E2DED5] rounded-[6px] pl-7 pr-7 text-[#0F172A] placeholder:text-[#94A3B8] outline-none transition-all focus:border-[#C2410C] focus:ring-1 focus:ring-[#C2410C]/20"
          />
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="absolute left-2.5 top-2.5 text-[#94A3B8] pointer-events-none"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          {/* Keyboard shortcut hint */}
          <kbd className="absolute right-2 top-1.5 h-5 px-1.5 rounded-[3px] bg-[#F1F5F9] border border-[#CBD5E1] text-[10px] font-mono text-[#64748B] flex items-center justify-center pointer-events-none">
            /
          </kbd>
        </div>

        {/* Notification Bell with Accent Dot + Dropdown of 3 static alerts */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => {
              setNotifOpen(!notifOpen);
              setUnreadCount(0);
            }}
            aria-label="Notifications"
            aria-expanded={notifOpen}
            className="h-8 w-8 rounded-[6px] border border-[#E2DED5] bg-white text-[#475569] hover:text-[#0F172A] hover:bg-[#FAF8F5] transition-colors flex items-center justify-center relative cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2410C]"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {/* Small accent dot */}
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#C2410C] ring-2 ring-white" />
            )}
          </button>

          {notifOpen && (
            <div
              role="region"
              aria-label="System notifications"
              className="absolute right-0 top-full mt-1.5 w-76 bg-white rounded-[8px] border border-[#E2DED5] shadow-xl py-2 z-50 text-xs"
            >
              <div className="px-3.5 py-1.5 border-b border-[#ECE8DF] flex items-center justify-between">
                <span className="font-bold text-[#0F172A]">Notifications</span>
                <span className="text-[10px] font-mono text-[#64748B]">3 alerts</span>
              </div>
              <div className="divide-y divide-[#ECE8DF] max-h-64 overflow-y-auto custom-scrollbar">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 hover:bg-[#FAF8F5] transition-colors">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-semibold text-[#0F172A]">{n.title}</span>
                      <span className="text-[10px] font-mono text-[#94A3B8]">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-[#64748B] leading-snug">{n.desc}</p>
                  </div>
                ))}
              </div>
              <div className="px-3 py-1.5 border-t border-[#ECE8DF] bg-[#FAF8F5] text-center">
                <span className="text-[10px] text-[#64748B] font-mono">
                  Consensus alerts &bull; Instant push active
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Export CSV Button (Browser Blob download) */}
        <button
          type="button"
          onClick={onExportCSV}
          className="h-8 px-3 rounded-[6px] border border-[#0F172A] text-xs font-semibold text-[#0F172A] bg-transparent hover:bg-[#0F172A] hover:text-white transition-colors duration-150 flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F172A]"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span className="hidden sm:inline">Export CSV</span>
        </button>

        {/* User Menu Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            aria-expanded={userDropdownOpen}
            aria-haspopup="true"
            className="h-8 flex items-center gap-2 pl-1 pr-2 rounded-[6px] hover:bg-[#EAE6DD] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2410C] cursor-pointer"
          >
            <span className="h-6 w-6 rounded-full bg-[#0F1A2B] text-white text-[10px] font-bold flex items-center justify-center">
              {initials}
            </span>
            <span className="text-xs font-semibold text-[#0F172A] hidden lg:inline max-w-[110px] truncate">
              {user?.name || "Operator"}
            </span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-[#64748B]"
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {userDropdownOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-[8px] border border-[#E2DED5] shadow-xl py-1.5 z-50 text-xs select-none"
            >
              <div className="px-3 py-2 border-b border-[#ECE8DF]">
                <p className="font-semibold text-[#0F172A] truncate">{user?.name}</p>
                <p className="text-[10px] text-[#64748B] truncate">{user?.email}</p>
                <span className="inline-block mt-1 text-[9px] font-mono font-medium text-[#C2410C] bg-[#FFF7ED] px-1.5 py-0.5 rounded">
                  Treasury Analyst
                </span>
              </div>
              <button
                role="menuitem"
                type="button"
                onClick={onLogout}
                className="w-full text-left px-3 py-2 text-[#991B1B] hover:bg-[#FEF2F2] font-semibold transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>Sign out</span>
                <span className="text-[10px] font-mono">&rarr;</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
