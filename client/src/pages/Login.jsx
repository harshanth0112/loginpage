import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthLayout from "../components/AuthLayout";
import API_BASE from "../utils/api";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(null);
  const [isFading, setIsFading] = useState(false);

  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const navigate = useNavigate();

  // Autofocus email on desktop non-touch devices only
  useEffect(() => {
    const isDesktop = window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches;
    if (isDesktop && emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);

  // Escape key clears server error banner
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setServerError("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
    setServerError("");
  };

  // Inline validation on blur
  const handleBlur = (field) => {
    const nextErrors = { ...errors };
    if (field === "email") {
      if (!form.email.trim()) {
        nextErrors.email = "Email is required.";
      } else if (!emailRegex.test(form.email.trim())) {
        nextErrors.email = "Enter a valid email.";
      } else {
        delete nextErrors.email;
      }
    } else if (field === "password") {
      if (!form.password) {
        nextErrors.password = "Password is required.";
      } else if (form.password.length < 6) {
        nextErrors.password = "Min. 6 characters.";
      } else {
        delete nextErrors.password;
      }
    }
    setErrors(nextErrors);
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!emailRegex.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email.";
    }

    if (!form.password) {
      nextErrors.password = "Password is required.";
    } else if (form.password.length < 6) {
      nextErrors.password = "Min. 6 characters.";
    }
    return nextErrors;
  };

  const completeLogin = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setIsFading(true);
    setTimeout(() => {
      navigate("/dashboard");
    }, 150);
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (validationErrors.email) {
      emailInputRef.current?.focus();
      return;
    }
    if (validationErrors.password) {
      passwordInputRef.current?.focus();
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE}/api/login`, form);
      completeLogin(data);
    } catch (err) {
      setServerError(err.response?.data?.message || "Authentication failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    setServerError("");
    setOauthLoading(provider);
    try {
      const mockProfiles = {
        Google: { name: "Alexander Vance", email: "alex.vance@institutional-fund.com" },
        GitHub: { name: "Dev Operator", email: "dev-operator@github.nimbus.com" },
      };
      const profile = mockProfiles[provider] || {
        name: `${provider} User`,
        email: `${provider.toLowerCase()}@nimbus.com`,
      };

      const { data } = await axios.post(`${API_BASE}/api/oauth`, {
        provider,
        name: profile.name,
        email: profile.email,
      });

      completeLogin(data);
    } catch (err) {
      setServerError(err.response?.data?.message || `${provider} popup was closed or authentication failed.`);
    } finally {
      setOauthLoading(null);
    }
  };

  return (
    <div className={`transition-opacity duration-150 ${isFading ? "opacity-0" : "opacity-100"}`}>
      <AuthLayout
        headline="Secure access to your treasury operations."
        subtext="Deterministic ledger infrastructure and programmatic settlement for enterprise balance sheets."
        stats={["EST. 2024", "Consensus Active", "v2.18.0"]}
      >
        <div className="mb-3.5 sm:mb-4">
          <h1 className="font-editorial text-[26px] sm:text-[28px] leading-tight text-[#0F172A] tracking-tight short-compact-text">
            Sign in to your account
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#475569] line-clamp-1 short-hide-subtext">
            Enter your credentials to access operations.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-2.5 sm:space-y-3.5 short-compact-space">
          {/* Email field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="email"
                className="block text-[11px] font-bold uppercase tracking-wider text-[#334155]"
              >
                Work Email
              </label>
              {errors.email && (
                <span id="email-error" className="text-xs text-[#991B1B] font-medium" role="alert">
                  {errors.email}
                </span>
              )}
            </div>
            <input
              ref={emailInputRef}
              tabIndex={1}
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={handleChange}
              onBlur={() => handleBlur("email")}
              placeholder="name@organization.com"
              aria-invalid={errors.email ? "true" : undefined}
              aria-describedby={errors.email ? "email-error" : undefined}
              className={`w-full h-11 sm:h-12 short-compact-input bg-white px-3 text-base sm:text-sm text-[#0F172A] rounded-[4px] border transition-colors duration-150 placeholder:text-[#94A3B8] outline-none focus-visible:outline-none ${
                errors.email
                  ? "border-[#B91C1C] focus-visible:border-[#B91C1C] focus-visible:ring-2 focus-visible:ring-[#B91C1C]/20"
                  : "border-[#E2DED5] focus-visible:border-[#C2410C] focus-visible:ring-2 focus-visible:ring-[#C2410C]/20"
              }`}
            />
          </div>

          {/* Password field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="password"
                className="block text-[11px] font-bold uppercase tracking-wider text-[#334155]"
              >
                Password
              </label>
              {errors.password && (
                <span id="password-error" className="text-xs text-[#991B1B] font-medium" role="alert">
                  {errors.password}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                ref={passwordInputRef}
                tabIndex={2}
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                enterKeyHint="go"
                required
                value={form.password}
                onChange={handleChange}
                onBlur={() => handleBlur("password")}
                placeholder="••••••••••••"
                aria-invalid={errors.password ? "true" : undefined}
                aria-describedby={errors.password ? "password-error" : undefined}
                className={`w-full h-11 sm:h-12 short-compact-input bg-white pl-3 pr-12 text-base sm:text-sm text-[#0F172A] rounded-[4px] border transition-colors duration-150 placeholder:text-[#94A3B8] outline-none focus-visible:outline-none ${
                  errors.password
                    ? "border-[#B91C1C] focus-visible:border-[#B91C1C] focus-visible:ring-2 focus-visible:ring-[#B91C1C]/20"
                    : "border-[#E2DED5] focus-visible:border-[#C2410C] focus-visible:ring-2 focus-visible:ring-[#C2410C]/20"
                }`}
              />
              <button
                tabIndex={3}
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="min-h-[44px] min-w-[44px] absolute inset-y-0 right-0 flex items-center justify-center text-xs font-semibold text-[#475569] sm:hover:text-[#C2410C] focus-visible:text-[#C2410C] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2410C]/30"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {/* Forgot password link below field */}
            <div className="flex justify-end pt-1">
              <Link
                tabIndex={4}
                to="/forgot-password"
                className="min-h-[32px] inline-flex items-center text-xs text-[#475569] sm:hover:text-[#C2410C] focus-visible:text-[#C2410C] underline underline-offset-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2410C]/30"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {/* Reserved server error banner above Continue button to prevent layout shifts */}
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

          {/* Continue Submit Button */}
          <button
            tabIndex={5}
            type="submit"
            disabled={loading || !!oauthLoading}
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
                <span>Authenticating...</span>
              </span>
            ) : (
              "Sign in"
            )}
          </button>

          {/* Thin "or" divider */}
          <div className="relative py-0.5">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-[#E2DED5]"></div>
            </div>
            <div className="relative flex justify-center text-[11px]">
              <span className="bg-[#F8F6F0] px-2 font-bold uppercase tracking-wider text-[#64748B]">
                or
              </span>
            </div>
          </div>

          {/* Equal-width social OAuth buttons row (Google | GitHub) */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              tabIndex={6}
              type="button"
              disabled={loading || !!oauthLoading}
              onClick={() => handleOAuth("Google")}
              aria-label="Continue with Google"
              className="w-full min-h-[42px] h-11 sm:h-12 short-compact-button rounded-[6px] border border-[#E2DED5] bg-white px-2.5 py-1 text-xs font-semibold text-[#0F172A] sm:hover:border-[#0F172A] sm:hover:bg-[#FAF8F5] transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F172A]/20 disabled:opacity-60"
            >
              {oauthLoading === "Google" ? (
                <span className="text-xs">Connecting...</span>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span className="hidden min-[360px]:inline">Google</span>
                </>
              )}
            </button>

            <button
              tabIndex={7}
              type="button"
              disabled={loading || !!oauthLoading}
              onClick={() => handleOAuth("GitHub")}
              aria-label="Continue with GitHub"
              className="w-full min-h-[42px] h-11 sm:h-12 short-compact-button rounded-[6px] border border-[#E2DED5] bg-white px-2.5 py-1 text-xs font-semibold text-[#0F172A] sm:hover:border-[#0F172A] sm:hover:bg-[#FAF8F5] transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F172A]/20 disabled:opacity-60"
            >
              {oauthLoading === "GitHub" ? (
                <span className="text-xs">Connecting...</span>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="shrink-0 text-[#0F172A]">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  <span className="hidden min-[360px]:inline">GitHub</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Create account link */}
        <div className="mt-3 pt-2.5 border-t border-[#E2DED5] text-center text-xs text-[#475569]">
          <div className="min-h-[32px] flex items-center justify-center gap-1.5">
            <span>Need an institutional account?</span>
            <Link
              tabIndex={8}
              to="/register"
              className="font-bold text-[#0F172A] underline underline-offset-2 sm:hover:text-[#C2410C] focus-visible:text-[#C2410C] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2410C]/30"
            >
              Create account
            </Link>
          </div>

          {/* Demo Account Credentials */}
          <div className="mt-2 pt-2 border-t border-[#E2DED5]/60 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-[#64748B]">
            <span className="font-semibold text-[#334155]">Demo Credentials:</span>
            <button
              type="button"
              onClick={() => {
                setForm({ email: "demo@nimbus.com", password: "Nimbus@123" });
                setErrors({});
                setServerError("");
              }}
              title="Click to auto-fill demo credentials"
              className="font-mono-code text-[#C2410C] hover:underline cursor-pointer bg-white px-2 py-0.5 rounded border border-[#E2DED5] transition-colors hover:border-[#C2410C]"
            >
              demo@nimbus.com &bull; Nimbus@123 <span className="text-[10px] text-[#64748B] font-sans">(click to fill)</span>
            </button>
          </div>
        </div>
      </AuthLayout>
    </div>
  );
}
