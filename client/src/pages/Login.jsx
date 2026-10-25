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

  // Demo credentials state
  const isDev = import.meta.env.DEV;
  const [showDemoToggle, setShowDemoToggle] = useState(false);
  const [copied, setCopied] = useState(false);

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

  // Check on mount and delayed mount for browser autofilled values (Bug Fix 1)
  useEffect(() => {
    const syncAutofill = () => {
      const emailVal = emailInputRef.current?.value;
      const passVal = passwordInputRef.current?.value;

      if (emailVal && emailVal.trim()) {
        setForm((prev) => ({ ...prev, email: emailVal }));
        if (emailRegex.test(emailVal.trim())) {
          setErrors((prev) => ({ ...prev, email: "" }));
        }
      }
      if (passVal) {
        setForm((prev) => ({ ...prev, password: passVal }));
        if (passVal.length >= 6) {
          setErrors((prev) => ({ ...prev, password: "" }));
        }
      }
    };

    syncAutofill();
    const t1 = setTimeout(syncAutofill, 100);
    const t2 = setTimeout(syncAutofill, 400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
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

  // Clear errors immediately when field becomes valid
  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "email") {
      if (value.trim() && emailRegex.test(value.trim())) {
        setErrors((prev) => ({ ...prev, email: "" }));
      }
    } else if (name === "password") {
      if (value.length >= 6) {
        setErrors((prev) => ({ ...prev, password: "" }));
      }
    }
    setServerError("");
  };

  const handleChange = (e) => {
    handleInput(e);
  };

  // Inline validation on blur only
  const handleBlur = (field) => {
    const nextErrors = { ...errors };
    if (field === "email") {
      const val = emailInputRef.current?.value ?? form.email;
      if (!val || !val.trim()) {
        nextErrors.email = "Email is required.";
      } else if (!emailRegex.test(val.trim())) {
        nextErrors.email = "Enter a valid email.";
      } else {
        delete nextErrors.email;
      }
    } else if (field === "password") {
      const val = passwordInputRef.current?.value ?? form.password;
      if (!val) {
        nextErrors.password = "Password is required.";
      } else if (val.length < 6) {
        nextErrors.password = "Min. 6 characters.";
      } else {
        delete nextErrors.password;
      }
    }
    setErrors(nextErrors);
  };

  const validate = (emailVal, passwordVal) => {
    const nextErrors = {};
    const eVal = emailVal !== undefined ? emailVal.trim() : form.email.trim();
    const pVal = passwordVal !== undefined ? passwordVal : form.password;

    if (!eVal) {
      nextErrors.email = "Email is required.";
    } else if (!emailRegex.test(eVal)) {
      nextErrors.email = "Enter a valid email.";
    }

    if (!pVal) {
      nextErrors.password = "Password is required.";
    } else if (pVal.length < 6) {
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

    // Read directly from DOM / FormData on submit to handle autofill values (Bug Fix 1)
    const formData = new FormData(ev.currentTarget);
    const emailVal = (
      formData.get("email") ??
      emailInputRef.current?.value ??
      form.email ??
      ""
    ).toString();
    const passwordVal = (
      formData.get("password") ??
      passwordInputRef.current?.value ??
      form.password ??
      ""
    ).toString();

    // Keep form state in sync
    setForm({ email: emailVal, password: passwordVal });

    const validationErrors = validate(emailVal, passwordVal);
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
      const { data } = await axios.post(`${API_BASE}/api/login`, {
        email: emailVal,
        password: passwordVal,
      });
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
      setServerError(
        err.response?.data?.message || `${provider} popup was closed or authentication failed.`
      );
    } finally {
      setOauthLoading(null);
    }
  };

  const handleCopyCredentials = () => {
    const credText = "demo@nimbus.com / Nimbus@123";
    if (navigator.clipboard) {
      navigator.clipboard.writeText(credText);
    }
    setForm({ email: "demo@nimbus.com", password: "Nimbus@123" });
    if (emailInputRef.current) emailInputRef.current.value = "demo@nimbus.com";
    if (passwordInputRef.current) passwordInputRef.current.value = "Nimbus@123";
    setErrors({});
    setServerError("");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={`w-full transition-opacity duration-150 ${isFading ? "opacity-0" : "opacity-100"}`}>
      <AuthLayout
        eyebrow="TRUSTED. SECURE. INTELLIGENT."
        headline={{ line1: "Secure access to your", line2: "treasury operations." }}
        paragraph="A unified platform to manage, monitor and optimize your institutional treasury operations with confidence."
        footerItems={["EST. 2024", "Consensus Active", "v2.18.0"]}
      >
        {/* Card Header: Welcome back + one-line subtitle */}
        <div className="mb-5 sm:mb-6">
          <h1 className="font-editorial text-[30px] sm:text-[32px] leading-tight text-[#0F172A] tracking-tight short-compact-text">
            Welcome back
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#64748B] short-hide-subtext truncate">
            Sign in to your Institutional Treasury Console
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4 short-compact-space">
          {/* WORK EMAIL input with mail icon on left */}
          <div>
            <label
              htmlFor="email"
              className="block text-[11px] font-bold uppercase tracking-wider text-[#334155] mb-1.5"
            >
              Work Email
            </label>
            <div
              className={`relative flex items-center h-12 short-compact-input bg-white rounded-lg border transition-all duration-150 ${
                errors.email
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
                tabIndex={1}
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={handleChange}
                onInput={handleInput}
                onBlur={() => handleBlur("email")}
                placeholder="name@organization.com"
                aria-invalid={errors.email ? "true" : undefined}
                aria-describedby={errors.email ? "email-error" : undefined}
                className="w-full h-full bg-transparent pl-11 pr-3 text-sm text-[#0F172A] rounded-lg placeholder:text-[#94A3B8] outline-none"
              />
            </div>
            {/* Error message BELOW the input */}
            {errors.email && (
              <p id="email-error" className="mt-1 text-xs text-[#991B1B] font-medium" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          {/* PASSWORD input with lock icon on left and Show toggle on right */}
          <div>
            <label
              htmlFor="password"
              className="block text-[11px] font-bold uppercase tracking-wider text-[#334155] mb-1.5"
            >
              Password
            </label>
            <div
              className={`relative flex items-center h-12 short-compact-input bg-white rounded-lg border transition-all duration-150 ${
                errors.password
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
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
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
                onInput={handleInput}
                onBlur={() => handleBlur("password")}
                placeholder="••••••••••••"
                aria-invalid={errors.password ? "true" : undefined}
                aria-describedby={errors.password ? "password-error" : undefined}
                className="w-full h-full bg-transparent pl-11 pr-16 text-sm text-[#0F172A] rounded-lg placeholder:text-[#94A3B8] outline-none"
              />
              <button
                tabIndex={3}
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 text-xs font-semibold text-[#475569] hover:text-[#C2410C] focus-visible:text-[#C2410C] transition-colors p-1 rounded outline-none"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {/* Error message BELOW the input */}
            {errors.password && (
              <p id="password-error" className="mt-1 text-xs text-[#991B1B] font-medium" role="alert">
                {errors.password}
              </p>
            )}

            {/* Forgot password right-aligned under the password */}
            <div className="flex justify-end pt-1.5">
              <Link
                tabIndex={4}
                to="/forgot-password"
                className="text-xs text-[#C2410C] hover:text-[#9A3412] underline underline-offset-2 transition-colors font-medium outline-none focus-visible:ring-1 focus-visible:ring-[#C2410C] rounded"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {/* Server error banner - collapsed when no error (Bug Fix 2) */}
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

          {/* Full-width rust button "Sign in →" (48px tall, arrow icon) */}
          <button
            tabIndex={5}
            type="submit"
            disabled={loading || !!oauthLoading}
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
                <span>Authenticating...</span>
              </span>
            ) : (
              <>
                <span>Sign in</span>
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

          {/* "OR" divider */}
          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-[#E2DED5]"></div>
            </div>
            <div className="relative flex justify-center text-[11px]">
              <span className="bg-white px-3 font-bold uppercase tracking-wider text-[#64748B]">
                or
              </span>
            </div>
          </div>

          {/* Two equal buttons: Continue with Google & Continue with GitHub */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              tabIndex={6}
              type="button"
              disabled={loading || !!oauthLoading}
              onClick={() => handleOAuth("Google")}
              aria-label="Continue with Google"
              className="w-full h-11 short-compact-button rounded-lg border border-[#CBD5E1] bg-white px-2.5 py-1 text-xs font-semibold text-[#0F172A] hover:border-[#0F172A] hover:bg-[#FAF8F5] transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F172A]/20 disabled:opacity-60"
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
                  <span>
                    <span className="oauth-btn-long">Continue with </span>Google
                  </span>
                </>
              )}
            </button>

            <button
              tabIndex={7}
              type="button"
              disabled={loading || !!oauthLoading}
              onClick={() => handleOAuth("GitHub")}
              aria-label="Continue with GitHub"
              className="w-full h-11 short-compact-button rounded-lg border border-[#CBD5E1] bg-white px-2.5 py-1 text-xs font-semibold text-[#0F172A] hover:border-[#0F172A] hover:bg-[#FAF8F5] transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F172A]/20 disabled:opacity-60"
            >
              {oauthLoading === "GitHub" ? (
                <span className="text-xs">Connecting...</span>
              ) : (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                    className="shrink-0 text-[#0F172A]"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    />
                  </svg>
                  <span>
                    <span className="oauth-btn-long">Continue with </span>GitHub
                  </span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Need an institutional account? Create account */}
        <div className="mt-4 pt-3.5 border-t border-[#0F172A]/8 text-center text-xs text-[#64748B]">
          <div className="flex items-center justify-center gap-1.5">
            <span>Need an institutional account?</span>
            <Link
              tabIndex={8}
              to="/register"
              className="font-bold text-[#0F172A] underline underline-offset-2 hover:text-[#C2410C] focus-visible:text-[#C2410C] transition-colors outline-none focus-visible:ring-1 focus-visible:ring-[#C2410C] rounded"
            >
              Create account
            </Link>
          </div>
        </div>

        {/* Demo Credentials Strip (Requirement 14): inside card at bottom, monospace values with copy button */}
        {(isDev || showDemoToggle) ? (
          <div className="mt-3.5 p-2 rounded-lg bg-[#F8F6F0] border border-[#E2DED5] flex items-center justify-between text-[11px] text-[#475569]">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="font-semibold text-[#0F172A] uppercase text-[10px] tracking-wider shrink-0">
                Demo
              </span>
              <span className="font-mono text-[#0F172A] truncate">
                demo@nimbus.com &middot; Nimbus@123
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyCredentials}
              className="ml-2 px-2 py-1 rounded bg-white border border-[#CBD5E1] hover:border-[#C2410C] text-[11px] font-medium text-[#0F172A] hover:text-[#C2410C] flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
              title="Copy and fill demo credentials"
            >
              {copied ? (
                <>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#059669"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-[#059669] font-semibold">Copied</span>
                </>
              ) : (
                <>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                  <span>Auto-fill</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="mt-2 text-center">
            <button
              type="button"
              onClick={() => setShowDemoToggle(true)}
              className="text-[11px] text-[#64748B] hover:text-[#C2410C] underline underline-offset-2 cursor-pointer transition-colors"
            >
              Show demo credentials
            </button>
          </div>
        )}
      </AuthLayout>
    </div>
  );
}
