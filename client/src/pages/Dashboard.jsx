import { useState, useEffect, useRef } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [activeNav, setActiveNav] = useState("overview"); // overview, settlements, reconciliations, audit, keys
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [copiedRef, setCopiedRef] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [merkleInput, setMerkleInput] = useState("");
  const [merkleResult, setMerkleResult] = useState(null);
  const [searchOpenMobile, setSearchOpenMobile] = useState(false);

  const hamburgerRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close dropdown on route change
  useEffect(() => {
    setUserDropdownOpen(false);
    setDrawerOpen(false);
  }, [location.pathname]);

  // Skeleton loading state on view switch
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [activeNav]);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setUserDropdownOpen(false);
        if (drawerOpen) {
          setDrawerOpen(false);
          hamburgerRef.current?.focus();
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [drawerOpen]);

  if (!token) return <Navigate to="/" replace />;

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const navItems = [
    {
      id: "overview",
      label: "Ledger Accounts",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="shrink-0">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
    },
    {
      id: "settlements",
      label: "Settlement Batches",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="shrink-0">
          <line x1="12" y1="2" x2="12" y2="6" />
          <line x1="12" y1="18" x2="12" y2="22" />
          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
          <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
          <line x1="2" y1="12" x2="6" y2="12" />
          <line x1="18" y1="12" x2="22" y2="12" />
          <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
          <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
        </svg>
      ),
    },
    {
      id: "reconciliations",
      label: "Reconciliation",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="shrink-0">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
    },
    {
      id: "audit",
      label: "Audit Trail",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="shrink-0">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
    },
    {
      id: "keys",
      label: "API & Security",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="shrink-0">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
    },
  ];

  // 1. Overview Recent Activity Data (5 items)
  const recentTransactions = [
    { ref: "TX-90214", counterparty: "JPMorgan Chase Institutional", type: "Fedwire Outbound", amount: "$1,450,000.00", status: "Settled", timestamp: "15:42 EST" },
    { ref: "TX-90213", counterparty: "BNY Mellon Custody", type: "DvP Settlement", amount: "$820,400.00", status: "Settled", timestamp: "14:18 EST" },
    { ref: "TX-90212", counterparty: "Euroclear Brussels", type: "Cross-Border FX", amount: "€640,000.00", status: "Processing", timestamp: "12:05 EST" },
    { ref: "TX-90211", counterparty: "Silicon Valley Treasury", type: "ACH Credit", amount: "$94,320.50", status: "Settled", timestamp: "09:22 EST" },
    { ref: "TX-90210", counterparty: "State Street Global", type: "Tri-party Repo", amount: "$3,100,000.00", status: "Settled", timestamp: "Yesterday" },
  ];

  // 2. Settlement Batches Data
  const settlementBatches = [
    { id: "BATCH-8821", rail: "Fedwire Funds", items: 42, total: "$4,250,000.00", cutoff: "16:30 EST", status: "Queued" },
    { id: "BATCH-8820", rail: "SEPA Instant", items: 118, total: "€2,890,400.00", cutoff: "Instant", status: "In Clearing" },
    { id: "BATCH-8819", rail: "ACH Same-Day", items: 65, total: "$1,280,000.00", cutoff: "14:00 EST", status: "Settled" },
    { id: "BATCH-8818", rail: "CHIPS Net", items: 31, total: "$3,100,000.00", cutoff: "12:00 EST", status: "Settled" },
  ];

  // 3. Reconciliation Data
  const reconciliationAccounts = [
    { entity: "JPMorgan Chase Master Vault", internal: "$28,450,000.00", external: "$28,450,000.00", delta: "$0.00", status: "Matched" },
    { entity: "BNY Mellon Tri-Party Custody", internal: "$14,390,000.00", external: "$14,390,000.00", delta: "$0.00", status: "Matched" },
    { entity: "Euroclear Brussels Pool", internal: "€8,120,500.00", external: "€8,120,500.00", delta: "€0.00", status: "Matched" },
    { entity: "Federal Reserve Operational", internal: "$5,000,000.00", external: "$5,000,000.00", delta: "$0.00", status: "Matched" },
  ];

  // 4. Audit Trail Data
  const auditLogs = [
    { event: "BATCH_RELEASE_CONFIRMED", actor: "alex.vance@fund.com", ip: "198.51.100.24", hash: "0x7a3e81f...9c21", time: "15:42 EST" },
    { event: "POLICY_THRESHOLD_VERIFIED", actor: "Consensus Engine", ip: "Node-US-East-1", hash: "0x4b11f0a...e892", time: "14:18 EST" },
    { event: "MTLS_CERT_ROTATED", actor: "SecOps Officer", ip: "198.51.100.82", hash: "0x91d0e4c...32aa", time: "12:00 EST" },
    { event: "RECONCILIATION_CYCLE_CLOSED", actor: "Auto-Reconcile", ip: "internal-bus", hash: "0x2e8f10b...710c", time: "09:22 EST" },
  ];

  // 5. API Keys Data
  const apiKeys = [
    { name: "Live Production Clearance", key: "nimbus_live_sec_8921a4f0281c49a1", created: "Oct 1, 2024", access: "Full Settlement", status: "Active" },
    { name: "Sandbox Staging Simulator", key: "nimbus_test_sec_1042c981a8bc99bf", created: "Sep 15, 2024", access: "Read & Simulate", status: "Active" },
  ];

  const copyReference = (ref) => {
    navigator.clipboard?.writeText(ref);
    setCopiedRef(ref);
    setTimeout(() => setCopiedRef(""), 2000);
  };

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Reference,Counterparty,Type,Amount,Status,Timestamp\n" +
      recentTransactions
        .map((t) => `"${t.ref}","${t.counterparty}","${t.type}","${t.amount}","${t.status}","${t.timestamp}"`)
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `nimbus_${activeNav}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleVerifyMerkle = (e) => {
    e.preventDefault();
    if (!merkleInput.trim()) return;
    setMerkleResult({
      valid: true,
      root: "0x8f2a1b94e028b41cd88194",
      block: "1,492,082",
      leaf: merkleInput.trim(),
    });
  };

  const initials = (user?.name || "User")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const filteredTransactions = recentTransactions.filter(
    (tx) =>
      tx.ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.counterparty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-dvh flex overflow-hidden w-full bg-[#F8F6F0] text-[#0F172A] font-sans">
      {/* Mobile Top Header (< md): 56px */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-[#0F1A2B] text-[#F8F6F0] border-b border-[#1E293B] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <rect x="2" y="2" width="11" height="11" stroke="#F8F6F0" strokeWidth="1.6" />
            <rect x="15" y="15" width="11" height="11" stroke="#C2410C" strokeWidth="1.6" />
          </svg>
          <span className="text-xs font-bold tracking-widest uppercase text-[#F8F6F0]">
            Nimbus
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSearchOpenMobile(!searchOpenMobile)}
            aria-label="Toggle search input"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#CBD5E1] hover:text-white rounded-[4px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2410C]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            aria-label="Export CSV"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#CBD5E1] hover:text-white rounded-[4px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2410C]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="User profile and drawer"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2410C]"
          >
            <span className="h-7 w-7 rounded-full bg-[#1E293B] border border-[#334155] text-[11px] font-bold text-[#F8F6F0] flex items-center justify-center">
              {initials}
            </span>
          </button>

          <button
            ref={hamburgerRef}
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-expanded={drawerOpen}
            aria-label="Open navigation menu"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#F8F6F0] rounded-[4px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2410C]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Slide-in Drawer */}
      {drawerOpen && (
        <div
          role="presentation"
          onClick={() => {
            setDrawerOpen(false);
            hamburgerRef.current?.focus();
          }}
          className="md:hidden fixed inset-0 z-50 bg-[#0F172A]/70 backdrop-blur-xs transition-opacity duration-150"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation drawer"
            onClick={(e) => e.stopPropagation()}
            className="w-4/5 max-w-xs h-full bg-[#0F1A2B] text-[#F8F6F0] flex flex-col justify-between p-5 shadow-2xl pb-[max(1.25rem,env(safe-area-inset-bottom))]"
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-[#1E293B]">
                <div className="flex items-center gap-2.5">
                  <span className="h-9 w-9 rounded-full bg-[#1E293B] border border-[#334155] text-xs font-bold text-[#F8F6F0] flex items-center justify-center">
                    {initials}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                    <p className="text-[11px] text-[#94A3B8] truncate">{user?.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    hamburgerRef.current?.focus();
                  }}
                  aria-label="Close menu"
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#94A3B8] hover:text-white"
                >
                  ✕
                </button>
              </div>

              <nav className="space-y-1">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[#64748B] px-2 mb-2">
                  Console Views
                </span>
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveNav(item.id);
                      setDrawerOpen(false);
                    }}
                    className={`w-full min-h-[44px] px-3 py-2 rounded-[4px] text-xs font-medium flex items-center gap-2.5 transition-colors ${
                      activeNav === item.id
                        ? "bg-[#1E293B] text-white"
                        : "text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/40"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="pt-4 border-t border-[#1E293B] space-y-3">
              <button
                type="button"
                onClick={logout}
                className="w-full min-h-[44px] rounded-[6px] border border-[#334155] bg-[#1E293B] text-xs font-semibold text-white flex items-center justify-center hover:bg-[#334155]"
              >
                Sign out
              </button>
              <div className="text-[10px] font-mono-code text-[#64748B] text-center">
                NODE: us-east-prod-1 &bull; TLS 1.3
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Fixed Left Sidebar (>= md): 240px collapsible to 72px */}
      <aside
        className={`hidden md:flex shrink-0 bg-[#0F1A2B] text-[#F8F6F0] flex-col justify-between p-4 border-r border-[#1E293B] transition-all duration-200 ${
          sidebarCollapsed ? "w-[72px]" : "w-60"
        }`}
      >
        <div>
          {/* Logo header + collapse toggle button */}
          <div className="flex items-center justify-between pb-4 border-b border-[#1E293B] min-h-[44px]">
            <div className="flex items-center gap-2.5 min-w-0">
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none" aria-hidden="true" className="shrink-0">
                <rect x="2" y="2" width="11" height="11" stroke="#F8F6F0" strokeWidth="1.6" />
                <rect x="15" y="15" width="11" height="11" stroke="#C2410C" strokeWidth="1.6" />
              </svg>
              {!sidebarCollapsed && (
                <span className="text-xs font-bold tracking-widest uppercase text-white truncate">
                  Nimbus
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="min-h-[32px] min-w-[32px] flex items-center justify-center rounded text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C2410C]"
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
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-4 space-y-1">
            {!sidebarCollapsed && (
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#64748B] px-3 mb-2">
                Treasury Console
              </span>
            )}
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveNav(item.id)}
                title={sidebarCollapsed ? item.label : undefined}
                className={`w-full min-h-[40px] px-3 py-2 rounded-[4px] text-xs font-medium flex items-center transition-colors cursor-pointer short-sidebar-item focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2410C] ${
                  sidebarCollapsed ? "justify-center" : "justify-between"
                } ${
                  activeNav === item.id
                    ? "bg-[#1E293B] text-white"
                    : "text-[#94A3B8] sm:hover:text-white sm:hover:bg-[#1E293B]/40"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </div>
                {!sidebarCollapsed && activeNav === item.id && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C2410C]" aria-hidden="true" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom environment badge */}
        <div className="pt-3 border-t border-[#1E293B] text-[11px] text-[#64748B] space-y-0.5">
          {!sidebarCollapsed ? (
            <>
              <p className="font-mono-code text-slate-400">NODE: us-east-prod-1</p>
              <p className="text-[10px]">TLS 1.3 Strict Mutual Auth</p>
            </>
          ) : (
            <div className="flex justify-center" title="NODE: us-east-prod-1 • TLS 1.3">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 h-dvh overflow-hidden pt-14 md:pt-0">
        {/* Desktop Top Bar (>= md) */}
        <header className="hidden md:flex h-13 border-b border-[#E2DED5] bg-[#F8F6F0] px-4 xl:px-6 items-center justify-between shrink-0">
          {/* Dynamic Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-mono-code text-[#64748B]">
            <span>Console</span>
            <span>/</span>
            <span>Production</span>
            <span>/</span>
            <span className="text-[#0F172A] font-semibold">
              {navItems.find((n) => n.id === activeNav)?.label || "Ledger Accounts"}
            </span>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search console..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-40 lg:w-56 h-8 text-xs bg-white border border-[#E2DED5] rounded-[4px] pl-7 pr-2 text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus-visible:border-[#C2410C] focus-visible:ring-1 focus-visible:ring-[#C2410C]/20"
              />
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-2 top-2 text-[#94A3B8]" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>

            <button
              type="button"
              onClick={handleExportCSV}
              className="min-h-[32px] h-8 px-3 rounded-[4px] border border-[#0F172A] text-[11px] font-semibold text-[#0F172A] bg-transparent sm:hover:bg-[#0F172A] sm:hover:text-white transition-colors duration-150 flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F172A]"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Export CSV</span>
            </button>

            {/* User Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                aria-expanded={userDropdownOpen}
                aria-haspopup="true"
                className="min-h-[32px] flex items-center gap-2 pl-1 pr-2 py-0.5 rounded-[4px] hover:bg-[#EAE6DD] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2410C]"
              >
                <span className="h-7 w-7 rounded-full bg-[#0F1A2B] text-white text-[11px] font-bold flex items-center justify-center">
                  {initials}
                </span>
                <span className="text-xs font-semibold text-[#0F172A] hidden lg:inline max-w-[110px] truncate">
                  {user?.name || "Operator"}
                </span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#64748B]">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {userDropdownOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-2 w-52 bg-white rounded-[4px] border border-[#E2DED5] shadow-xl py-1.5 z-50 text-xs select-none"
                >
                  <div className="px-3 py-1.5 border-b border-[#ECE8DF]">
                    <p className="font-semibold text-[#0F172A] truncate">{user?.name}</p>
                    <p className="text-[11px] text-[#64748B] truncate">{user?.email}</p>
                  </div>
                  <button
                    role="menuitem"
                    type="button"
                    onClick={logout}
                    className="w-full text-left px-3 py-2 text-[#991B1B] hover:bg-[#FEF2F2] font-semibold transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>Sign out</span>
                    <span className="text-[10px] font-mono-code">&rarr;</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Main Canvas: Flex Column fitting in viewport */}
        <main className="flex-1 min-h-0 flex flex-col justify-between p-4 xl:p-6 lg:overflow-hidden overflow-y-auto pb-[max(4.5rem,env(safe-area-inset-bottom))] lg:pb-6 gap-3 xl:gap-4 max-h-[700px]:gap-2.5 max-h-[700px]:p-3">
          {/* =========================================================================
              VIEW 1: LEDGER ACCOUNTS (OVERVIEW)
             ========================================================================= */}
          {activeNav === "overview" && (
            <>
              {/* Header row: Greeting + subtitle with Live Synced badge safely aligned on left */}
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 shrink-0">
                <div>
                  <h1 className="font-editorial text-2xl lg:text-[28px] leading-tight text-[#0F172A] tracking-tight short-greeting-text">
                    Good afternoon, {user?.name || "Operator"}.
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[3px] bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] text-[10px] font-mono-code font-bold tracking-wider shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                      LIVE SYNCED
                    </span>
                    <p className="text-xs text-[#64748B] truncate">
                      Reconciliation complete for all multi-currency clearing accounts as of 16:00 EST.
                    </p>
                  </div>
                </div>
              </div>

              {/* 4 Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3 xl:gap-4 shrink-0">
                <div className="bg-white border border-[#E2DED5] p-3.5 xl:p-4 short-card-padding rounded-[4px] flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Net Volume</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">+4.2%</span>
                  </div>
                  <div className="my-1 font-editorial text-xl lg:text-2xl text-[#0F172A] leading-tight">$42.84M</div>
                  <span className="short-hide-footnote text-[11px] text-[#64748B] truncate">14-day rolling settlement</span>
                </div>

                <div className="bg-white border border-[#E2DED5] p-3.5 xl:p-4 short-card-padding rounded-[4px] flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Pending</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#F1F5F9] text-[#475569]">3 batches</span>
                  </div>
                  <div className="my-1 font-editorial text-xl lg:text-2xl text-[#0F172A] leading-tight">$1.28M</div>
                  <span className="short-hide-footnote text-[11px] text-[#64748B] truncate">Next cutoff at 16:30</span>
                </div>

                <div className="bg-white border border-[#E2DED5] p-3.5 xl:p-4 short-card-padding rounded-[4px] flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">STP Rate</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#F1F5F9] text-[#475569]">0.00% fail</span>
                  </div>
                  <div className="my-1 font-editorial text-xl lg:text-2xl text-[#0F172A] leading-tight">100%</div>
                  <span className="short-hide-footnote text-[11px] text-[#64748B] truncate">Straight-through pass</span>
                </div>

                <div className="bg-white border border-[#E2DED5] p-3.5 xl:p-4 short-card-padding rounded-[4px] flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Tier 1 Ratio</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#F1F5F9] text-[#475569]">+0.8%</span>
                  </div>
                  <div className="my-1 font-editorial text-xl lg:text-2xl text-[#0F172A] leading-tight">104.2%</div>
                  <span className="short-hide-footnote text-[11px] text-[#64748B] truncate">Basel III compliant</span>
                </div>
              </div>

              {/* Grid Row: Chart (2fr) + Recent Activity (1fr) */}
              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-3 xl:gap-4 flex-1 min-h-0">
                {/* 1. Fluid Non-Clipping Vector Chart Card */}
                <section aria-label="Volume settlement chart" className="h-full min-h-0 bg-white border border-[#E2DED5] p-3.5 xl:p-4 short-card-padding rounded-[4px] flex flex-col justify-between overflow-hidden">
                  <div className="flex items-center justify-between border-b border-[#ECE8DF] pb-2 shrink-0">
                    <div>
                      <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wide">Rolling Net Liquidity Volume</h2>
                      <p className="text-[10px] text-[#64748B]">14 business-day clearing settlement</p>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-editorial text-lg sm:text-xl text-[#0F172A] font-bold">$42.84M</span>
                      <span className="text-[10px] font-semibold text-[#065F46] bg-[#ECFDF5] px-1.5 py-0.5 rounded">+4.2%</span>
                    </div>
                  </div>

                  {/* SVG Canvas with fixed viewBox (0 0 600 240) and inner padding */}
                  <div className="w-full flex-1 min-h-0 h-[clamp(200px,32vh,340px)] short-chart-height py-1">
                    <svg
                      viewBox="0 0 600 240"
                      width="100%"
                      height="100%"
                      preserveAspectRatio="xMidYMid meet"
                      overflow="visible"
                      className="w-full h-full stroke-current text-[#0F1A2B]"
                      fill="none"
                    >
                      {/* Grid lines with 16px left/right margins and 12px top margin */}
                      <line x1="16" y1="30" x2="584" y2="30" stroke="#ECE8DF" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="16" y1="85" x2="584" y2="85" stroke="#ECE8DF" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="16" y1="140" x2="584" y2="140" stroke="#ECE8DF" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="16" y1="195" x2="584" y2="195" stroke="#E2DED5" strokeWidth="1" />

                      {/* Filled Polygon area underneath */}
                      <polygon
                        points="16,175 68,160 120,145 172,155 224,120 276,132 328,98 380,105 432,85 484,92 536,70 584,38 584,195 16,195"
                        fill="#F8F6F0"
                      />

                      {/* Main Trend Line with constant 2px stroke and non-scaling-stroke */}
                      <polyline
                        points="16,175 68,160 120,145 172,155 224,120 276,132 328,98 380,105 432,85 484,92 536,70 584,38"
                        stroke="#0F1A2B"
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Last point marker at X=584, Y=38 with 16px safe inner margin */}
                      <g transform="translate(584, 38)">
                        <circle cx="0" cy="0" r="8" fill="#C2410C" className="live-pulse-ring" />
                        <circle cx="0" cy="0" r="4" fill="#C2410C" stroke="#FFFFFF" strokeWidth="2" />
                      </g>
                    </svg>
                  </div>

                  {/* X-axis labels with 12px inner padding and right-aligned last item */}
                  <div className="px-3 pt-2 pb-0.5 border-t border-[#ECE8DF] flex justify-between items-center text-[10px] text-[#64748B] font-mono-code shrink-0">
                    <span>Oct 10</span>
                    <span>Oct 14</span>
                    <span>Oct 18</span>
                    <span className="text-right font-semibold text-[#0F172A]">Today (Live)</span>
                  </div>
                </section>

                {/* 2. Recent Activity Card without Top Gap and with Bottom Scroll Fade */}
                <section aria-label="Recent activity log" className="h-full min-h-0 bg-white border border-[#E2DED5] rounded-[4px] flex flex-col overflow-hidden">
                  {/* Fixed Header */}
                  <div className="px-4 py-3 border-b border-[#ECE8DF] flex items-center justify-between shrink-0">
                    <h2 className="text-xs font-bold uppercase tracking-wide text-[#0F172A]">Recent Activity</h2>
                    <span className="text-[11px] font-mono-code text-[#64748B]">{filteredTransactions.length} events</span>
                  </div>

                  {/* List starts immediately under header at scrollTop 0 */}
                  <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar relative divide-y divide-[#ECE8DF]">
                    {filteredTransactions.length === 0 ? (
                      <div className="p-8 text-center flex flex-col items-center justify-center gap-1.5 text-xs text-[#64748B]">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#94A3B8]" aria-hidden="true">
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <p className="font-semibold text-[#0F172A]">No transactions found</p>
                        <p className="text-[11px] text-[#64748B]">{searchQuery ? `No records match "${searchQuery}".` : "No transaction activity recorded."}</p>
                      </div>
                    ) : (
                      filteredTransactions.map((tx) => (
                        <div
                          key={tx.ref}
                          onClick={() => copyReference(tx.ref)}
                          className="min-h-[64px] px-4 py-3 short-activity-row hover:bg-[#FAF8F5] transition-colors cursor-pointer flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-[#0F172A] truncate leading-tight">{tx.counterparty}</p>
                            <p className="short-hide-footnote text-[10px] text-[#64748B] truncate mt-0.5">
                              <span className="font-mono-code">{tx.ref}</span> &bull; {tx.timestamp}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-mono-code text-xs font-semibold text-[#0F172A] leading-tight">{tx.amount}</p>
                            <span className={`text-[9px] font-semibold inline-block px-1.5 py-0.2 rounded mt-0.5 ${tx.status === "Settled" ? "text-[#059669] bg-[#ECFDF5]" : "text-[#D97706] bg-[#FEF3C7]"}`}>
                              {tx.status}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                    {/* Subtle bottom fade so users visually recognize scrollable overflow */}
                    <div className="pointer-events-none sticky bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent opacity-80" aria-hidden="true" />
                  </div>

                  {/* Fixed Footer */}
                  <div className="px-4 py-2 border-t border-[#ECE8DF] bg-[#FAF8F5] flex items-center justify-between text-[11px] text-[#64748B] shrink-0">
                    <span>{filteredTransactions.length} events logged</span>
                    <span className="font-mono-code">{copiedRef ? `Copied ${copiedRef}` : "Click row to copy ID"}</span>
                  </div>
                </section>
              </div>
            </>
          )}

          {/* =========================================================================
              VIEW 2: SETTLEMENT BATCHES
             ========================================================================= */}
          {activeNav === "settlements" && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 shrink-0">
                <div>
                  <h1 className="font-editorial text-2xl lg:text-[28px] leading-tight text-[#0F172A] tracking-tight short-greeting-text">
                    Settlement Batches & Clearing Windows
                  </h1>
                  <p className="text-xs text-[#64748B] line-clamp-1">Automated Fedwire, CHIPS, and SEPA batch aggregation pipeline.</p>
                </div>
                <button type="button" onClick={() => alert("Batch aggregation triggered.")} className="px-3 py-1 rounded bg-[#0F1A2B] text-white text-xs font-semibold hover:bg-[#1E293B] transition-colors">
                  Force Aggregation
                </button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3 xl:gap-4 shrink-0">
                <div className="bg-white border border-[#E2DED5] p-3.5 xl:p-4 short-card-padding rounded-[4px]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">Next Window</span>
                  <div className="my-1 font-editorial text-xl text-[#0F172A]">16:30 EST</div>
                  <span className="text-[10px] text-[#C2410C] font-semibold">Cutoff in 24m</span>
                </div>
                <div className="bg-white border border-[#E2DED5] p-3.5 xl:p-4 short-card-padding rounded-[4px]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">Active Batches</span>
                  <div className="my-1 font-editorial text-xl text-[#0F172A]">{settlementBatches.length} Queued</div>
                  <span className="text-[10px] text-[#059669] font-semibold">$11.52M Total</span>
                </div>
                <div className="bg-white border border-[#E2DED5] p-3.5 xl:p-4 short-card-padding rounded-[4px]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">Clearing Rail</span>
                  <div className="my-1 font-editorial text-xl text-[#0F172A]">Direct RTGS</div>
                  <span className="text-[10px] text-[#64748B]">Zero Intermediary</span>
                </div>
                <div className="bg-white border border-[#E2DED5] p-3.5 xl:p-4 short-card-padding rounded-[4px]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">Failure Rate</span>
                  <div className="my-1 font-editorial text-xl text-[#0F172A]">0.00%</div>
                  <span className="text-[10px] text-[#059669] font-semibold">100% STP Success</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-3 xl:gap-4 flex-1 min-h-0">
                <section className="h-full min-h-0 bg-white border border-[#E2DED5] rounded-[4px] flex flex-col justify-between overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#ECE8DF] flex items-center justify-between shrink-0">
                    <h2 className="text-xs font-bold uppercase tracking-wide text-[#0F172A]">Active Batch Queue</h2>
                    <span className="text-[10px] font-mono-code text-[#64748B]">Real-time aggregation</span>
                  </div>
                  <div className="divide-y divide-[#ECE8DF] overflow-y-auto custom-scrollbar flex-1 min-h-0">
                    {settlementBatches.map((b) => (
                      <div key={b.id} className="min-h-[64px] px-4 py-3 short-activity-row hover:bg-[#FAF8F5] transition-colors flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono-code text-xs font-bold text-[#0F172A]">{b.id}</span>
                            <span className="text-[10px] bg-[#F1F5F9] text-[#475569] px-1.5 py-0.5 rounded font-medium">{b.rail}</span>
                          </div>
                          <p className="short-hide-footnote text-[10px] text-[#64748B] mt-0.5">{b.items} Transactions &bull; Cutoff: {b.cutoff}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono-code text-xs font-bold text-[#0F172A]">{b.total}</p>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded inline-block mt-0.5 ${b.status === "Settled" ? "bg-[#ECFDF5] text-[#065F46]" : "bg-[#FFFBEB] text-[#92400E]"}`}>{b.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-[#ECE8DF] bg-[#FAF8F5] text-[10px] text-[#64748B] flex justify-between shrink-0">
                    <span>Protocol: ISO-20022 Direct Clearing</span>
                    <span>Consensus Node: us-east-prod-1</span>
                  </div>
                </section>

                <section className="h-full min-h-0 bg-white border border-[#E2DED5] p-4 short-card-padding rounded-[4px] flex flex-col justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-wide text-[#0F172A] border-b border-[#ECE8DF] pb-2">Rails Health</h2>
                  <div className="space-y-3 my-auto">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#334155] font-medium">Fedwire RTGS</span>
                      <span className="text-[10px] font-mono-code text-[#059669]">12ms &bull; Operational</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#334155] font-medium">SEPA Instant</span>
                      <span className="text-[10px] font-mono-code text-[#059669]">28ms &bull; Operational</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#334155] font-medium">CHIPS Net</span>
                      <span className="text-[10px] font-mono-code text-[#059669]">8ms &bull; Operational</span>
                    </div>
                  </div>
                  <button type="button" onClick={handleExportCSV} className="w-full py-2 border border-[#0F172A] text-xs font-semibold text-[#0F172A] rounded hover:bg-[#0F172A] hover:text-white transition-colors">Download Manifest (CSV)</button>
                </section>
              </div>
            </>
          )}

          {/* =========================================================================
              VIEW 3: RECONCILIATION
             ========================================================================= */}
          {activeNav === "reconciliations" && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 shrink-0">
                <div>
                  <h1 className="font-editorial text-2xl lg:text-[28px] leading-tight text-[#0F172A] tracking-tight short-greeting-text">
                    Multi-Institution Variance & Reconciliation
                  </h1>
                  <p className="text-xs text-[#64748B] line-clamp-1">Continuous 3-way balance matching between internal ledger and custodians.</p>
                </div>
                <div className="text-xs font-mono-code text-[#059669] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                  <span>3-Way Reconciled</span>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3 xl:gap-4 shrink-0">
                <div className="bg-white border border-[#E2DED5] p-3.5 xl:p-4 short-card-padding rounded-[4px]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">Net Variance</span>
                  <div className="my-1 font-editorial text-xl text-[#059669]">$0.00</div>
                  <span className="text-[10px] text-[#64748B]">100% Balanced</span>
                </div>
                <div className="bg-white border border-[#E2DED5] p-3.5 xl:p-4 short-card-padding rounded-[4px]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">Unreconciled</span>
                  <div className="my-1 font-editorial text-xl text-[#0F172A]">0 Flags</div>
                  <span className="text-[10px] text-[#059669]">Clean Audit Trail</span>
                </div>
                <div className="bg-white border border-[#E2DED5] p-3.5 xl:p-4 short-card-padding rounded-[4px]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">ML Confidence</span>
                  <div className="my-1 font-editorial text-xl text-[#0F172A]">99.98%</div>
                  <span className="text-[10px] text-[#64748B]">Deterministic match</span>
                </div>
                <div className="bg-white border border-[#E2DED5] p-3.5 xl:p-4 short-card-padding rounded-[4px]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">Cycle Window</span>
                  <div className="my-1 font-editorial text-xl text-[#0F172A]">T+0 Real-Time</div>
                  <span className="text-[10px] text-[#64748B]">Continuous loop</span>
                </div>
              </div>

              <section className="h-full min-h-0 bg-white border border-[#E2DED5] rounded-[4px] flex-1 flex flex-col justify-between overflow-hidden">
                <div className="px-4 py-3 border-b border-[#ECE8DF] flex items-center justify-between shrink-0">
                  <h2 className="text-xs font-bold uppercase tracking-wide text-[#0F172A]">Custodian 3-Way Reconciliation Balance</h2>
                  <button type="button" onClick={() => alert("Deep reconciliation cycle completed successfully.")} className="text-xs font-semibold text-[#C2410C] hover:underline">Re-run Reconciliation</button>
                </div>
                <div className="divide-y divide-[#ECE8DF] overflow-y-auto custom-scrollbar flex-1 min-h-0">
                  {reconciliationAccounts.map((acc) => (
                    <div key={acc.entity} className="min-h-[64px] px-4 py-3 short-activity-row hover:bg-[#FAF8F5] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-[#0F172A]">{acc.entity}</p>
                        <p className="short-hide-footnote text-[10px] text-[#64748B]">Internal: {acc.internal} &bull; Custodian: {acc.external}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono-code text-xs text-[#64748B]">Delta: {acc.delta}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">{acc.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-[#ECE8DF] bg-[#FAF8F5] text-[10px] text-[#64748B] flex justify-between shrink-0">
                  <span>Variance Tolerance: &plusmn;$0.01 max threshold</span>
                  <span>All 4 accounts reconciled as of 16:00 EST</span>
                </div>
              </section>
            </>
          )}

          {/* =========================================================================
              VIEW 4: AUDIT TRAIL
             ========================================================================= */}
          {activeNav === "audit" && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 shrink-0">
                <div>
                  <h1 className="font-editorial text-2xl lg:text-[28px] leading-tight text-[#0F172A] tracking-tight short-greeting-text">
                    Cryptographic Audit Trail & Verifiable Logs
                  </h1>
                  <p className="text-xs text-[#64748B] line-clamp-1">Cryptographically signed Merkle-tree transaction hashes for compliance verification.</p>
                </div>
                <span className="text-xs font-mono-code text-[#475569]">FIPS 140-3 HSM Root</span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3 xl:gap-4 shrink-0">
                <div className="bg-white border border-[#E2DED5] p-3.5 xl:p-4 short-card-padding rounded-[4px]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">Merkle Root</span>
                  <div className="my-1 font-mono-code text-sm font-bold text-[#0F172A] truncate">0x8f2a...b41</div>
                  <span className="text-[10px] text-[#64748B]">Block #1,492,082</span>
                </div>
                <div className="bg-white border border-[#E2DED5] p-3.5 xl:p-4 short-card-padding rounded-[4px]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">Signed Records</span>
                  <div className="my-1 font-editorial text-xl text-[#0F172A]">184,920</div>
                  <span className="text-[10px] text-[#059669]">Tamper-Proof</span>
                </div>
                <div className="bg-white border border-[#E2DED5] p-3.5 xl:p-4 short-card-padding rounded-[4px]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">Audit Target</span>
                  <div className="my-1 font-editorial text-xl text-[#0F172A]">SOC-2 Type II</div>
                  <span className="text-[10px] text-[#64748B]">ISO-27001 Valid</span>
                </div>
                <div className="bg-white border border-[#E2DED5] p-3.5 xl:p-4 short-card-padding rounded-[4px]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">Key Storage</span>
                  <div className="my-1 font-editorial text-xl text-[#0F172A]">HSM Hardware</div>
                  <span className="text-[10px] text-[#059669]">Strict Isolation</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-3 xl:gap-4 flex-1 min-h-0">
                <section className="h-full min-h-0 bg-white border border-[#E2DED5] rounded-[4px] flex flex-col justify-between overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#ECE8DF] flex items-center justify-between shrink-0">
                    <h2 className="text-xs font-bold uppercase tracking-wide text-[#0F172A]">Immutable Signed Audit Log</h2>
                    <span className="text-[10px] font-mono-code text-[#64748B]">SHA-256 Asymmetric</span>
                  </div>
                  <div className="divide-y divide-[#ECE8DF] overflow-y-auto custom-scrollbar flex-1 min-h-0">
                    {auditLogs.map((log) => (
                      <div key={log.hash} className="min-h-[64px] px-4 py-3 short-activity-row hover:bg-[#FAF8F5] flex items-center justify-between text-xs">
                        <div>
                          <p className="font-mono-code font-bold text-[#0F172A]">{log.event}</p>
                          <p className="short-hide-footnote text-[10px] text-[#64748B] mt-0.5">Actor: {log.actor} &bull; Node: {log.ip}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono-code text-[11px] text-[#C2410C]">{log.hash}</p>
                          <span className="text-[10px] text-[#64748B]">{log.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-[#ECE8DF] bg-[#FAF8F5] text-[10px] text-[#64748B] shrink-0">
                    All events signed by internal consensus key &bull; Zero mutable writes
                  </div>
                </section>

                <section className="h-full min-h-0 bg-white border border-[#E2DED5] p-4 short-card-padding rounded-[4px] flex flex-col justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-wide text-[#0F172A] border-b border-[#ECE8DF] pb-2">Verify Merkle Proof</h2>
                  <form onSubmit={handleVerifyMerkle} className="space-y-2 my-auto">
                    <label className="text-[10px] font-bold text-[#334155] uppercase block">Transaction Hash</label>
                    <input
                      type="text"
                      placeholder="Paste 0x... hash"
                      value={merkleInput}
                      onChange={(e) => setMerkleInput(e.target.value)}
                      className="w-full text-xs h-8 px-2 border border-[#E2DED5] rounded font-mono-code outline-none focus:border-[#C2410C]"
                    />
                    <button type="submit" className="w-full py-1.5 bg-[#C2410C] text-white text-xs font-semibold rounded hover:bg-[#9A3412] transition-colors">Verify Proof</button>
                    {merkleResult && (
                      <div className="p-2 bg-[#ECFDF5] border border-[#A7F3D0] rounded text-[10px] text-[#065F46] font-mono-code">
                        &check; Verified against Block #{merkleResult.block}
                      </div>
                    )}
                  </form>
                  <p className="text-[10px] text-[#94A3B8] text-center">Cryptographic verification guarantees zero ledger tampering.</p>
                </section>
              </div>
            </>
          )}

          {/* =========================================================================
              VIEW 5: API & SECURITY
             ========================================================================= */}
          {activeNav === "keys" && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 shrink-0">
                <div>
                  <h1 className="font-editorial text-2xl lg:text-[28px] leading-tight text-[#0F172A] tracking-tight short-greeting-text">
                    API Keys, Mutual TLS & Security Credentials
                  </h1>
                  <p className="text-xs text-[#64748B] line-clamp-1">Manage programmatic access tokens, mTLS certificates, and institutional webhooks.</p>
                </div>
                <button type="button" onClick={() => alert("New API Key created.")} className="px-3 py-1 bg-[#C2410C] text-white text-xs font-semibold rounded hover:bg-[#9A3412]">
                  Generate Key
                </button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3 xl:gap-4 shrink-0">
                <div className="bg-white border border-[#E2DED5] p-3.5 xl:p-4 short-card-padding rounded-[4px]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">Active Keys</span>
                  <div className="my-1 font-editorial text-xl text-[#0F172A]">2 Secrets</div>
                  <span className="text-[10px] text-[#059669]">1 Prod, 1 Sandbox</span>
                </div>
                <div className="bg-white border border-[#E2DED5] p-3.5 xl:p-4 short-card-padding rounded-[4px]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">mTLS Status</span>
                  <div className="my-1 font-editorial text-xl text-[#0F172A]">Strict Mutual</div>
                  <span className="text-[10px] text-[#059669]">Zero Trust Policy</span>
                </div>
                <div className="bg-white border border-[#E2DED5] p-3.5 xl:p-4 short-card-padding rounded-[4px]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">Webhook SLA</span>
                  <div className="my-1 font-editorial text-xl text-[#0F172A]">99.99%</div>
                  <span className="text-[10px] text-[#64748B]">3 Endpoints Live</span>
                </div>
                <div className="bg-white border border-[#E2DED5] p-3.5 xl:p-4 short-card-padding rounded-[4px]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">Key Rotation</span>
                  <div className="my-1 font-editorial text-xl text-[#0F172A]">In 14 Days</div>
                  <span className="text-[10px] text-[#64748B]">Automated cycle</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-3 xl:gap-4 flex-1 min-h-0">
                <section className="h-full min-h-0 bg-white border border-[#E2DED5] rounded-[4px] flex flex-col justify-between overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#ECE8DF] flex items-center justify-between shrink-0">
                    <h2 className="text-xs font-bold uppercase tracking-wide text-[#0F172A]">Configured API Credentials</h2>
                    <span className="text-[10px] text-[#64748B]">Keep keys confidential</span>
                  </div>
                  <div className="divide-y divide-[#ECE8DF] overflow-y-auto custom-scrollbar flex-1 min-h-0">
                    {apiKeys.map((k) => (
                      <div key={k.key} className="min-h-[64px] px-4 py-3 short-activity-row hover:bg-[#FAF8F5] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold text-[#0F172A]">{k.name}</p>
                          <p className="short-hide-footnote text-[10px] font-mono-code text-[#64748B] mt-0.5">{k.key.slice(0, 18)}••••••••{k.key.slice(-4)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#475569] font-medium">{k.access}</span>
                          <button type="button" onClick={() => copyReference(k.key)} className="px-2 py-1 text-xs border border-[#E2DED5] rounded hover:border-[#0F172A]">{copiedRef === k.key ? "Copied" : "Copy"}</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-[#ECE8DF] bg-[#FAF8F5] text-[10px] text-[#64748B] shrink-0">
                    Webhook: https://treasury.fund.com/api/v1/nimbus-events &bull; Active
                  </div>
                </section>

                <section className="h-full min-h-0 bg-white border border-[#E2DED5] p-4 short-card-padding rounded-[4px] flex flex-col justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-wide text-[#0F172A] border-b border-[#ECE8DF] pb-2">mTLS Certificate</h2>
                  <div className="space-y-2 text-xs my-auto">
                    <p className="text-[#334155]"><span className="text-[#64748B] block text-[10px] uppercase">Common Name</span>CN=nimbus-client-prod-01</p>
                    <p className="text-[#334155]"><span className="text-[#64748B] block text-[10px] uppercase">Expiration</span>Nov 14, 2026 (Valid)</p>
                    <p className="text-[#334155]"><span className="text-[#64748B] block text-[10px] uppercase">Fingerprint</span>SHA256: 8f:2a:10:bc:94:e0</p>
                  </div>
                  <button type="button" onClick={() => alert("Client certificate bundle downloaded.")} className="w-full py-1.5 border border-[#0F172A] text-xs font-semibold rounded hover:bg-[#0F172A] hover:text-white transition-colors">Download Certificate Bundle</button>
                </section>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Mobile Sticky Bottom Tab Bar */}
      <nav aria-label="Mobile Bottom Navigation" className="md:hidden fixed bottom-0 left-0 right-0 h-13 bg-[#0F1A2B] text-[#F8F6F0] border-t border-[#1E293B] flex items-center justify-around z-30 pb-[env(safe-area-inset-bottom)]">
        <button
          type="button"
          onClick={() => setActiveNav("overview")}
          className={`flex-1 min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
            activeNav === "overview" ? "text-[#C2410C]" : "text-[#94A3B8]"
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          <span>Ledger</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveNav("settlements")}
          className={`flex-1 min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
            activeNav === "settlements" ? "text-[#C2410C]" : "text-[#94A3B8]"
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <line x1="12" y1="2" x2="12" y2="6" />
            <line x1="12" y1="18" x2="12" y2="22" />
            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
          </svg>
          <span>Batches</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveNav("reconciliations")}
          className={`flex-1 min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
            activeNav === "reconciliations" ? "text-[#C2410C]" : "text-[#94A3B8]"
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          <span>Reconcile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveNav("audit")}
          className={`flex-1 min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
            activeNav === "audit" ? "text-[#C2410C]" : "text-[#94A3B8]"
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <span>Audit</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveNav("keys")}
          className={`flex-1 min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
            activeNav === "keys" ? "text-[#C2410C]" : "text-[#94A3B8]"
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>Security</span>
        </button>
      </nav>
    </div>
  );
}
