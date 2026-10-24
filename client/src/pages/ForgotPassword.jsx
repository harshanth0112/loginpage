import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import AuthLayout from "../components/AuthLayout";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [serverError, setServerError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [demoHint, setDemoHint] = useState("");
  const [loading, setLoading] = useState(false);

  const handleBlur = () => {
    if (!email.trim()) {
      setError("Work email is required.");
    } else if (!emailRegex.test(email)) {
      setError("Enter a valid email address.");
    } else {
      setError("");
    }
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setError("");
    setServerError("");

    if (!email.trim()) {
      setError("Work email is required.");
      return;
    }
    if (!emailRegex.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post("http://localhost:5000/api/forgot-password", { email });
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
      headline="Cryptographic credential recovery and access restoration."
      subtext="Automated, time-bounded identity verification tokens ensure secure account recovery without exposing institutional master secrets."
      stats={["TOKEN LIFESPAN: 15 MIN", "Asymmetric Auth", "Zero Knowledge"]}
    >
      <div className="mb-4 sm:mb-5">
        <h1 className="font-editorial text-[26px] sm:text-[28px] leading-tight text-[#0F172A] tracking-tight short-compact-text">
          Recover credentials
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#475569] line-clamp-2 short-hide-subtext">
          Enter your verified work email address to receive recovery instructions.
        </p>
      </div>

      {submitted ? (
        <div className="space-y-4">
          <div
            role="status"
            aria-live="polite"
            className="border-l-2 border-[#059669] bg-[#ECFDF5] px-3.5 py-3 text-xs text-[#065F46] leading-relaxed"
          >
            If an operational account exists for <strong className="font-semibold text-[#0F172A]">{email}</strong>, a recovery link has been dispatched.
          </div>

          {demoHint && (
            <div className="p-3 border border-[#ECE8DF] bg-white text-xs text-[#475569] space-y-1">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                Local Environment Notice
              </span>
              <p className="font-mono-code text-[#C2410C] text-[11px]">{demoHint}</p>
            </div>
          )}

          <p className="text-xs text-[#64748B] leading-relaxed">
            Tokens expire after 15 minutes. Check your enterprise inbox or quarantine filter if the token is not received promptly.
          </p>

          <div className="pt-2">
            <Link
              to="/"
              className="w-full min-h-[44px] h-11 sm:h-12 short-compact-button rounded-[6px] bg-[#0F172A] text-white text-sm font-semibold tracking-wide flex items-center justify-center transition-colors duration-150 hover:bg-[#1E293B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F172A]/30 cursor-pointer"
            >
              Return to Sign In
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-3 sm:space-y-4 short-compact-space">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="email"
                className="block text-[11px] font-bold uppercase tracking-wider text-[#334155]"
              >
                Work Email
              </label>
              {error && (
                <span id="email-error" className="text-xs text-[#991B1B] font-medium" role="alert">
                  {error}
                </span>
              )}
            </div>
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
                setServerError("");
              }}
              onBlur={handleBlur}
              placeholder="name@organization.com"
              aria-invalid={error ? "true" : undefined}
              aria-describedby={error ? "email-error" : undefined}
              className={`w-full h-11 sm:h-12 short-compact-input bg-white px-3 text-base sm:text-sm text-[#0F172A] rounded-[4px] border transition-colors duration-150 placeholder:text-[#94A3B8] outline-none focus-visible:outline-none ${
                error
                  ? "border-[#B91C1C] focus-visible:border-[#B91C1C] focus-visible:ring-2 focus-visible:ring-[#B91C1C]/20"
                  : "border-[#E2DED5] focus-visible:border-[#C2410C] focus-visible:ring-2 focus-visible:ring-[#C2410C]/20"
              }`}
            />
          </div>

          {/* Reserved server error banner */}
          <div className="min-h-[26px] flex items-center">
            {serverError && (
              <div
                role="alert"
                aria-live="assertive"
                className="w-full border-l-2 border-[#B91C1C] bg-[#FEF2F2] px-2.5 py-1 text-xs text-[#991B1B] break-words flex items-center justify-between"
              >
                <span className="truncate">{serverError}</span>
                <button
                  type="button"
                  onClick={() => setServerError("")}
                  className="ml-2 text-[#991B1B] font-bold text-xs hover:opacity-80 cursor-pointer"
                  aria-label="Dismiss alert"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[44px] h-11 sm:h-12 short-compact-button rounded-[6px] bg-[#C2410C] text-white text-sm font-semibold tracking-wide flex items-center justify-center transition-all duration-150 active:scale-[0.99] sm:hover:bg-[#9A3412] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2410C]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8F6F0] disabled:opacity-75 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 28 28" fill="none" aria-hidden="true" className="shrink-0 animate-spin">
                  <rect x="2" y="2" width="11" height="11" stroke="#FFFFFF" strokeWidth="2" />
                  <rect x="15" y="15" width="11" height="11" stroke="#FFFFFF" strokeWidth="2" />
                  <line x1="13" y1="2" x2="26" y2="15" stroke="#FFFFFF" strokeWidth="1.8" className="live-dash-anim" />
                  <circle cx="8" cy="20" r="3" stroke="#FFFFFF" strokeWidth="1.8" />
                </svg>
                <span>Dispatching Token...</span>
              </span>
            ) : (
              "Request Recovery Link"
            )}
          </button>
        </form>
      )}

      {/* Back to sign in link */}
      <div className="mt-4 pt-3 border-t border-[#E2DED5] text-center text-xs text-[#64748B]">
        <span>Remember your operational password? </span>
        <Link
          to="/"
          className="text-[#0F172A] font-semibold underline underline-offset-2 hover:text-[#C2410C] transition-colors duration-150"
        >
          Back to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
