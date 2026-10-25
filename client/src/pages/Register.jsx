import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthLayout from "../components/AuthLayout";
import API_BASE from "../utils/api";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const REGISTER_FEATURES = [
  {
    title: "FIPS 140-3 Compliant",
    desc: "Hardware-level security modules",
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
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
  {
    title: "Multi-Tenant Isolation",
    desc: "Dedicated cryptographic boundaries",
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
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    title: "Instant Settlement",
    desc: "Programmatic clearing & liquidity",
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
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
];

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [agreed, setAgreed] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(null);

  const nameInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const navigate = useNavigate();

  // Check on mount for browser autofilled values (Bug Fix 1)
  useEffect(() => {
    const syncAutofill = () => {
      const nameVal = nameInputRef.current?.value;
      const emailVal = emailInputRef.current?.value;
      const passVal = passwordInputRef.current?.value;

      if (nameVal && nameVal.trim()) {
        setForm((prev) => ({ ...prev, name: nameVal }));
        setErrors((prev) => ({ ...prev, name: "" }));
      }
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

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score++;
    if (/[0-9]/.test(pass) && /[a-zA-Z]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass) || pass.length >= 10) score++;
    return score; // 0, 1, 2, 3
  };

  const strength = getPasswordStrength(form.password);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "name" && value.trim()) {
      setErrors((prev) => ({ ...prev, name: "" }));
    } else if (name === "email" && emailRegex.test(value.trim())) {
      setErrors((prev) => ({ ...prev, email: "" }));
    } else if (name === "password" && value.length >= 6) {
      setErrors((prev) => ({ ...prev, password: "" }));
    }
    setServerError("");
  };

  const handleChange = (e) => {
    handleInput(e);
  };

  const handleBlur = (field) => {
    const nextErrors = { ...errors };
    if (field === "name") {
      const val = nameInputRef.current?.value ?? form.name;
      if (!val || !val.trim()) {
        nextErrors.name = "Name is required.";
      } else {
        delete nextErrors.name;
      }
    } else if (field === "email") {
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
        nextErrors.password = "Password required.";
      } else if (val.length < 6) {
        nextErrors.password = "Min. 6 characters.";
      } else {
        delete nextErrors.password;
      }
    }
    setErrors(nextErrors);
  };

  const validate = (nameVal, emailVal, passwordVal) => {
    const nextErrors = {};
    const nVal = nameVal !== undefined ? nameVal.trim() : form.name.trim();
    const eVal = emailVal !== undefined ? emailVal.trim() : form.email.trim();
    const pVal = passwordVal !== undefined ? passwordVal : form.password;

    if (!nVal) nextErrors.name = "Name is required.";
    if (!eVal) {
      nextErrors.email = "Email is required.";
    } else if (!emailRegex.test(eVal)) {
      nextErrors.email = "Enter a valid email.";
    }
    if (!pVal) {
      nextErrors.password = "Password required.";
    } else if (pVal.length < 6) {
      nextErrors.password = "Min. 6 characters.";
    }
    if (!agreed) {
      nextErrors.terms = "You must agree to terms.";
    }
    return nextErrors;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();

    // Read directly from DOM / FormData on submit to handle autofill values (Bug Fix 1)
    const formData = new FormData(ev.currentTarget);
    const nameVal = (formData.get("name") ?? nameInputRef.current?.value ?? form.name ?? "").toString().trim();
    const emailVal = (formData.get("email") ?? emailInputRef.current?.value ?? form.email ?? "").toString().trim();
    const passwordVal = (formData.get("password") ?? passwordInputRef.current?.value ?? form.password ?? "").toString();

    setForm({ name: nameVal, email: emailVal, password: passwordVal });

    const validationErrors = validate(nameVal, emailVal, passwordVal);
    setErrors(validationErrors);

    if (validationErrors.name) {
      nameInputRef.current?.focus();
      return;
    }
    if (validationErrors.email) {
      emailInputRef.current?.focus();
      return;
    }
    if (validationErrors.password) {
      passwordInputRef.current?.focus();
      return;
    }
    if (validationErrors.terms) return;

    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE}/api/register`, {
        name: nameVal,
        email: emailVal,
        password: passwordVal,
      });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err) {
      setServerError(err.response?.data?.message || "Registration service unavailable. Check connection.");
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

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err) {
      setServerError(err.response?.data?.message || `Failed to authenticate with ${provider}.`);
    } finally {
      setOauthLoading(null);
    }
  };

  return (
    <AuthLayout
      eyebrow="INSTITUTIONAL ONBOARDING"
      headline={{ line1: "Open your Nimbus", line2: "operations account." }}
      paragraph="Direct clearing integration, cryptographic credential authorization, and multi-tenant isolation out of the box."
      features={REGISTER_FEATURES}
      footerItems={["FIPS 140-3 COMPLIANT", "Multi-Tenant Isolation", "SOC-2 Certified"]}
    >
      {/* Card Header */}
      <div className="mb-4 sm:mb-5">
        <h1 className="font-editorial text-[28px] sm:text-[32px] leading-tight text-[#0F172A] tracking-tight short-compact-text">
          Open your account
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#64748B] short-hide-subtext truncate">
          Establish your institutional operations seat.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-3.5 short-compact-space">
        {/* Full Name & Work Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 short-compact-gap">
          {/* Full Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-[11px] font-bold uppercase tracking-wider text-[#334155] mb-1"
            >
              Full Name
            </label>
            <div
              className={`relative flex items-center h-12 short-compact-input bg-white rounded-lg border transition-all duration-150 ${
                errors.name
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
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <input
                ref={nameInputRef}
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={form.name}
                onChange={handleChange}
                onInput={handleInput}
                onBlur={() => handleBlur("name")}
                placeholder="Jane Doe"
                aria-invalid={errors.name ? "true" : undefined}
                aria-describedby={errors.name ? "name-error" : undefined}
                className="w-full h-full bg-transparent pl-11 pr-3 text-sm text-[#0F172A] rounded-lg placeholder:text-[#94A3B8] outline-none"
              />
            </div>
            {errors.name && (
              <p id="name-error" role="alert" className="mt-1 text-xs text-[#991B1B] font-medium">
                {errors.name}
              </p>
            )}
          </div>

          {/* Work Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-[11px] font-bold uppercase tracking-wider text-[#334155] mb-1"
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
                placeholder="jane@fund.com"
                aria-invalid={errors.email ? "true" : undefined}
                aria-describedby={errors.email ? "email-error" : undefined}
                className="w-full h-full bg-transparent pl-11 pr-3 text-sm text-[#0F172A] rounded-lg placeholder:text-[#94A3B8] outline-none"
              />
            </div>
            {errors.email && (
              <p id="email-error" role="alert" className="mt-1 text-xs text-[#991B1B] font-medium">
                {errors.email}
              </p>
            )}
          </div>
        </div>

        {/* Password field with show/hide toggle */}
        <div>
          <label
            htmlFor="password"
            className="block text-[11px] font-bold uppercase tracking-wider text-[#334155] mb-1"
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
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={form.password}
              onChange={handleChange}
              onInput={handleInput}
              onBlur={() => handleBlur("password")}
              placeholder="••••••••••••"
              aria-invalid={errors.password ? "true" : undefined}
              aria-describedby={errors.password ? "password-error password-helper" : "password-helper"}
              className="w-full h-full bg-transparent pl-11 pr-16 text-sm text-[#0F172A] rounded-lg placeholder:text-[#94A3B8] outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 text-xs font-semibold text-[#475569] hover:text-[#C2410C] focus-visible:text-[#C2410C] transition-colors p-1 rounded outline-none"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {/* Password strength meter */}
          <div
            role="progressbar"
            aria-valuenow={strength}
            aria-valuemin={0}
            aria-valuemax={3}
            aria-label="Password strength"
            className="mt-1.5 flex gap-1 h-1 w-full bg-[#E2DED5] rounded-full overflow-hidden"
          >
            <div
              className={`h-full transition-all duration-200 ${
                strength === 0
                  ? "w-0"
                  : strength === 1
                  ? "w-1/3 bg-[#EF4444]"
                  : strength === 2
                  ? "w-2/3 bg-[#F59E0B]"
                  : "w-full bg-[#10B981]"
              }`}
            />
          </div>

          {errors.password ? (
            <p id="password-error" role="alert" className="mt-1 text-xs text-[#991B1B] font-medium">
              {errors.password}
            </p>
          ) : (
            <p id="password-helper" className="text-[10px] text-[#64748B] mt-1">
              Min. 6 characters with letters and numbers.
            </p>
          )}
        </div>

        {/* Terms checkbox */}
        <div className="pt-0.5">
          <label htmlFor="terms-agreement" className="flex items-center gap-2 text-xs text-[#475569] cursor-pointer select-none">
            <input
              id="terms-agreement"
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              aria-invalid={errors.terms ? "true" : undefined}
              aria-describedby={errors.terms ? "terms-error" : undefined}
              className="h-4 w-4 rounded border-[#CBD5E1] text-[#C2410C] focus:ring-[#C2410C] cursor-pointer"
            />
            <span>I agree to the Terms and Privacy Policy</span>
          </label>
          {errors.terms && (
            <p id="terms-error" role="alert" className="text-[10px] text-[#991B1B] mt-1 font-medium">
              {errors.terms}
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

        {/* Create account button */}
        <button
          type="submit"
          disabled={loading || !!oauthLoading}
          className="w-full h-12 short-compact-button rounded-lg bg-[#C2410C] hover:bg-[#9A3412] text-white text-sm font-semibold tracking-wide flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2410C]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed shadow-sm"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 28 28" fill="none" aria-hidden="true" className="shrink-0 animate-spin">
                <rect x="2" y="2" width="11" height="11" stroke="#FFFFFF" strokeWidth="2" />
                <rect x="15" y="15" width="11" height="11" stroke="#FFFFFF" strokeWidth="2" />
              </svg>
              <span>Creating Account...</span>
            </span>
          ) : (
            <>
              <span>Create account</span>
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

        {/* Thin "or" divider */}
        <div className="relative py-0.5">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-[#E2DED5]"></div>
          </div>
          <div className="relative flex justify-center text-[10px]">
            <span className="bg-white px-3 font-bold uppercase tracking-wider text-[#64748B]">
              or
            </span>
          </div>
        </div>

        {/* Social OAuth buttons side by side */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            disabled={loading || !!oauthLoading}
            onClick={() => handleOAuth("Google")}
            aria-label="Register with Google"
            className="w-full h-11 short-compact-button rounded-lg border border-[#CBD5E1] bg-white px-2 py-1 text-xs font-semibold text-[#0F172A] hover:border-[#0F172A] hover:bg-[#FAF8F5] transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F172A]/20 disabled:opacity-60"
          >
            {oauthLoading === "Google" ? (
              <span className="text-xs">Connecting...</span>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>
                  <span className="oauth-btn-long">Continue with </span>Google
                </span>
              </>
            )}
          </button>

          <button
            type="button"
            disabled={loading || !!oauthLoading}
            onClick={() => handleOAuth("GitHub")}
            aria-label="Register with GitHub"
            className="w-full h-11 short-compact-button rounded-lg border border-[#CBD5E1] bg-white px-2 py-1 text-xs font-semibold text-[#0F172A] hover:border-[#0F172A] hover:bg-[#FAF8F5] transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F172A]/20 disabled:opacity-60"
          >
            {oauthLoading === "GitHub" ? (
              <span className="text-xs">Connecting...</span>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="shrink-0 text-[#0F172A]">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>
                  <span className="oauth-btn-long">Continue with </span>GitHub
                </span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Sign in link */}
      <div className="mt-4 pt-3.5 border-t border-[#0F172A]/8 text-center text-xs text-[#64748B]">
        <span>Already registered? </span>
        <Link
          to="/"
          className="text-[#0F172A] font-semibold underline underline-offset-2 hover:text-[#C2410C] transition-colors"
        >
          Sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
