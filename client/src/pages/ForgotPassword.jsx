import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import AuthLayout from "../components/AuthLayout";
import API_BASE from "../utils/api";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RECOVERY_FEATURES = [
  {
    title: "Asymmetric Auth",
    desc: "Time-bounded verification tokens",
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
        <circle cx="7.5" cy="15.5" r="4.5" />
        <path d="m21 3-9.5 9.5" />
        <path d="m15.5 7.5 3 3" />
        <path d="m14 11 2 2" />
      </svg>
    ),
  },
  {
    title: "Zero Knowledge",
    desc: "Master secrets never leave hardware",
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
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    title: "Consensus Audit",
    desc: "Dispatched recovery events verified",
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
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
];

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [serverError, setServerError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [demoHint, setDemoHint] = useState("");
  const [loading, setLoading] = useState(false);

  const emailInputRef = useRef(null);

  // Check on mount for browser autofilled values (Bug Fix 1)
  useEffect(() => {
    const syncAutofill = () => {
      const val = emailInputRef.current?.value;
      if (val && val.trim()) {
        setEmail(val);
        if (emailRegex.test(val.trim())) {
          setError("");
        }
      }
    };
    syncAutofill();
    const t = setTimeout(syncAutofill, 200);
    return () => clearTimeout(t);
  }, []);

  const handleInput = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (val.trim() && emailRegex.test(val.trim())) {
      setError("");
    }
    setServerError("");
  };

  const handleBlur = () => {
    const val = emailInputRef.current?.value ?? email;
    if (!val || !val.trim()) {
      setError("Work email is required.");
    } else if (!emailRegex.test(val.trim())) {
      setError("Enter a valid email address.");
    } else {
      setError("");
    }
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();

    // Read directly from DOM / FormData on submit to handle autofill (Bug Fix 1)
    const formData = new FormData(ev.currentTarget);
    const submittedEmail = (formData.get("email") ?? emailInputRef.current?.value ?? email ?? "")
      .toString()
      .trim();

    setEmail(submittedEmail);
    setError("");
    setServerError("");

    if (!submittedEmail) {
      setError("Work email is required.");
      emailInputRef.current?.focus();
      return;
    }
    if (!emailRegex.test(submittedEmail)) {
      setError("Enter a valid email address.");
      emailInputRef.current?.focus();
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE}/api/forgot-password`, { email: submittedEmail });
      setSubmitted(true);
      if (data.demoHint) {
        setDemoHint(data.demoHint);
      }
    } catch (err) {
      setServerError(err.response?.data?.message || "Unable to contact reset service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="ZERO-KNOWLEDGE RECOVERY"
      headline={{ line1: "Cryptographic credential", line2: "recovery." }}
      paragraph="Automated, time-bounded identity verification tokens ensure secure account recovery without exposing institutional master secrets."
      features={RECOVERY_FEATURES}
      footerItems={["TOKEN LIFESPAN: 15 MIN", "Asymmetric Auth", "Zero Knowledge"]}
    >
      {/* Card Header */}
      <div className="mb-5 sm:mb-6">
        <h1 className="font-editorial text-[30px] sm:text-[32px] leading-tight text-[#0F172A] tracking-tight short-compact-text">
          Recover credentials
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#64748B] short-hide-subtext truncate">
          Enter your verified work email address to receive recovery instructions.
        </p>
      </div>

      {submitted ? (
        <div className="space-y-4">
          <div
            role="status"
            aria-live="polite"
            className="border-l-2 border-[#059669] bg-[#ECFDF5] px-3.5 py-3 text-xs text-[#065F46] leading-relaxed rounded-r"
          >
            If an operational account exists for <strong className="font-semibold text-[#0F172A]">{email}</strong>, a recovery link has been dispatched.
          </div>

          {demoHint && (
            <div className="p-3 border border-[#ECE8DF] bg-[#FAF8F5] text-xs text-[#475569] space-y-1 rounded-lg">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                Local Environment Notice
              </span>
              <p className="font-mono text-[#C2410C] text-[11px]">{demoHint}</p>
            </div>
          )}

          <p className="text-xs text-[#64748B] leading-relaxed">
            Tokens expire after 15 minutes. Check your enterprise inbox or quarantine filter if the token is not received promptly.
          </p>

          <div className="pt-2">
            <Link
              to="/"
              className="w-full h-12 short-compact-button rounded-lg bg-[#0F172A] text-white text-sm font-semibold tracking-wide flex items-center justify-center gap-2 transition-colors hover:bg-[#1E293B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F172A]/30 cursor-pointer shadow-sm"
            >
              <span>Return to Sign In</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4 short-compact-space">
          {/* Work Email input */}
          <div>
            <label
              htmlFor="email"
              className="block text-[11px] font-bold uppercase tracking-wider text-[#334155] mb-1.5"
            >
              Work Email
            </label>
            <div
              className={`relative flex items-center h-12 short-compact-input bg-white rounded-lg border transition-all duration-150 ${
                error
                  ? "border-[#B91C1C] ring-2 ring-[#B91C1C]/15"
                  : "border-[#CBD5E1] focus-within:border-[#C2410C] focus-within:ring-2 focus-within:ring-[#C2410C]/20"
              }`}
            >
              <span className="absolute left-3.5 text-[#64748B] pointer-events-none" aria-hidden="true">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </span>
              <input
                ref={emailInputRef}
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={email}
                onChange={handleInput}
                onInput={handleInput}
                onBlur={handleBlur}
                placeholder="name@organization.com"
                aria-invalid={error ? "true" : undefined}
                aria-describedby={error ? "email-error" : undefined}
                className="w-full h-full bg-transparent pl-11 pr-3 text-sm text-[#0F172A] rounded-lg placeholder:text-[#94A3B8] outline-none"
              />
            </div>
            {error && (
              <p id="email-error" className="mt-1 text-xs text-[#991B1B] font-medium" role="alert">
                {error}
              </p>
            )}
          </div>

          {/* Server error banner - collapsed when empty (Bug Fix 2) */}
          {serverError && (
            <div
              role="alert"
              aria-live="assertive"
              className="w-full border-l-2 border-[#B91C1C] bg-[#FEF2F2] px-3 py-2 text-xs text-[#991B1B] rounded-r flex items-center justify-between transition-all duration-200"
            >
              <span className="truncate pr-2">{serverError}</span>
              <button
                type="button"
                onClick={() => setServerError("")}
                className="text-[#991B1B] font-bold text-xs hover:opacity-80 cursor-pointer"
                aria-label="Dismiss alert"
              >
                ✕
              </button>
            </div>
          )}

          {/* Full-width rust button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 short-compact-button rounded-lg bg-[#C2410C] hover:bg-[#9A3412] text-white text-sm font-semibold tracking-wide flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2410C]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-75 cursor-pointer disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 28 28"
                  fill="none"
                  aria-hidden="true"
                  className="shrink-0 animate-spin"
                >
                  <rect x="2" y="2" width="11" height="11" stroke="#FFFFFF" strokeWidth="2" />
                  <rect x="15" y="15" width="11" height="11" stroke="#FFFFFF" strokeWidth="2" />
                </svg>
                <span>Dispatching Token...</span>
              </span>
            ) : (
              <>
                <span>Request Recovery Link</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </>
            )}
          </button>
        </form>
      )}

      {/* Back to sign in link */}
      <div className="mt-4 pt-3.5 border-t border-[#0F172A]/8 text-center text-xs text-[#64748B]">
        <span>Remember your operational password? </span>
        <Link
          to="/"
          className="text-[#0F172A] font-semibold underline underline-offset-2 hover:text-[#C2410C] transition-colors"
        >
          Back to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
