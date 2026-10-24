import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthLayout from "../components/AuthLayout";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
    setServerError("");
  };

  const handleBlur = (field) => {
    const nextErrors = { ...errors };
    if (field === "name") {
      if (!form.name.trim()) {
        nextErrors.name = "Name is required.";
      } else {
        delete nextErrors.name;
      }
    } else if (field === "email") {
      if (!form.email.trim()) {
        nextErrors.email = "Email is required.";
      } else if (!emailRegex.test(form.email)) {
        nextErrors.email = "Enter a valid email.";
      } else {
        delete nextErrors.email;
      }
    } else if (field === "password") {
      if (!form.password) {
        nextErrors.password = "Password required.";
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
    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!emailRegex.test(form.email)) {
      nextErrors.email = "Enter a valid email.";
    }
    if (!form.password) {
      nextErrors.password = "Password required.";
    } else if (form.password.length < 6) {
      nextErrors.password = "Min. 6 characters.";
    }
    if (!agreed) {
      nextErrors.terms = "You must agree to terms.";
    }
    return nextErrors;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const validationErrors = validate();
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
      const { data } = await axios.post("http://localhost:5000/api/register", {
        name: form.name,
        email: form.email,
        password: form.password,
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

      const { data } = await axios.post("http://localhost:5000/api/oauth", {
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
      headline="Open your Nimbus operations account."
      subtext="Direct clearing integration, cryptographic credential authorization, and multi-tenant isolation out of the box."
      stats={["FIPS 140-3 COMPLIANT", "Multi-Tenant Isolation", "SOC-2 Certified"]}
    >
      <div className="mb-2.5 sm:mb-3">
        <h1 className="font-editorial text-[24px] sm:text-[28px] leading-tight text-[#0F172A] tracking-tight short-compact-text">
          Open your account
        </h1>
        <p className="mt-0.5 text-xs text-[#475569] line-clamp-1 short-hide-subtext">
          Establish your institutional operations seat.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-2 short-compact-space">
        {/* Full Name & Work Email: 2 columns on wide screens / 1 column on narrow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2">
          {/* Full Name */}
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <label
                htmlFor="name"
                className="block text-[11px] font-bold uppercase tracking-wider text-[#334155]"
              >
                Full Name
              </label>
              {errors.name && (
                <span id="name-error" role="alert" className="text-[10px] text-[#991B1B] font-medium">
                  {errors.name}
                </span>
              )}
            </div>
            <input
              ref={nameInputRef}
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={form.name}
              onChange={handleChange}
              onBlur={() => handleBlur("name")}
              placeholder="Jane Doe"
              aria-invalid={errors.name ? "true" : undefined}
              aria-describedby={errors.name ? "name-error" : undefined}
              className={`w-full h-10 sm:h-11 short-compact-input bg-white px-2.5 text-base sm:text-xs text-[#0F172A] rounded-[4px] border transition-colors duration-150 placeholder:text-[#94A3B8] outline-none focus-visible:outline-none ${
                errors.name
                  ? "border-[#B91C1C] focus-visible:border-[#B91C1C] focus-visible:ring-1 focus-visible:ring-[#B91C1C]/20"
                  : "border-[#E2DED5] focus-visible:border-[#C2410C] focus-visible:ring-1 focus-visible:ring-[#C2410C]/20"
              }`}
            />
          </div>

          {/* Work Email */}
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <label
                htmlFor="email"
                className="block text-[11px] font-bold uppercase tracking-wider text-[#334155]"
              >
                Work Email
              </label>
              {errors.email && (
                <span id="email-error" role="alert" className="text-[10px] text-[#991B1B] font-medium">
                  {errors.email}
                </span>
              )}
            </div>
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
              onBlur={() => handleBlur("email")}
              placeholder="jane@fund.com"
              aria-invalid={errors.email ? "true" : undefined}
              aria-describedby={errors.email ? "email-error" : undefined}
              className={`w-full h-10 sm:h-11 short-compact-input bg-white px-2.5 text-base sm:text-xs text-[#0F172A] rounded-[4px] border transition-colors duration-150 placeholder:text-[#94A3B8] outline-none focus-visible:outline-none ${
                errors.email
                  ? "border-[#B91C1C] focus-visible:border-[#B91C1C] focus-visible:ring-1 focus-visible:ring-[#B91C1C]/20"
                  : "border-[#E2DED5] focus-visible:border-[#C2410C] focus-visible:ring-1 focus-visible:ring-[#C2410C]/20"
              }`}
            />
          </div>
        </div>

        {/* Password field with show/hide toggle */}
        <div>
          <div className="flex items-center justify-between mb-0.5">
            <label
              htmlFor="password"
              className="block text-[11px] font-bold uppercase tracking-wider text-[#334155]"
            >
              Password
            </label>
            {errors.password && (
              <span id="password-error" role="alert" className="text-[10px] text-[#991B1B] font-medium">
                {errors.password}
              </span>
            )}
          </div>
          <div className="relative">
            <input
              ref={passwordInputRef}
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={form.password}
              onChange={handleChange}
              onBlur={() => handleBlur("password")}
              placeholder="••••••••••••"
              aria-invalid={errors.password ? "true" : undefined}
              aria-describedby={errors.password ? "password-error password-helper" : "password-helper"}
              className={`w-full h-10 sm:h-11 short-compact-input bg-white pl-2.5 pr-11 text-base sm:text-xs text-[#0F172A] rounded-[4px] border transition-colors duration-150 placeholder:text-[#94A3B8] outline-none focus-visible:outline-none ${
                errors.password
                  ? "border-[#B91C1C] focus-visible:border-[#B91C1C] focus-visible:ring-1 focus-visible:ring-[#B91C1C]/20"
                  : "border-[#E2DED5] focus-visible:border-[#C2410C] focus-visible:ring-1 focus-visible:ring-[#C2410C]/20"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="min-h-[40px] min-w-[40px] absolute inset-y-0 right-0 flex items-center justify-center text-[11px] font-semibold text-[#475569] sm:hover:text-[#C2410C] focus-visible:text-[#C2410C] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C2410C]"
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
            className="mt-1 flex gap-1 h-1 w-full bg-[#E2DED5] rounded-full overflow-hidden"
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

          <p id="password-helper" className="text-[10px] text-[#64748B] mt-0.5">
            Min. 6 characters with letters and numbers.
          </p>
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
              className="h-3.5 w-3.5 rounded border-[#E2DED5] text-[#C2410C] focus:ring-[#C2410C] cursor-pointer"
            />
            <span>I agree to the Terms and Privacy Policy</span>
          </label>
          {errors.terms && (
            <p id="terms-error" role="alert" className="text-[10px] text-[#991B1B] mt-0.5 font-medium">
              {errors.terms}
            </p>
          )}
        </div>

        {/* Reserved server error banner */}
        <div className="min-h-[22px] flex items-center">
          {serverError && (
            <div
              role="alert"
              aria-live="assertive"
              className="w-full border-l-2 border-[#B91C1C] bg-[#FEF2F2] px-2 py-0.5 text-xs text-[#991B1B] flex items-center justify-between"
            >
              <span className="truncate">{serverError}</span>
              <button
                type="button"
                onClick={() => setServerError("")}
                className="ml-2 text-[#991B1B] font-bold text-xs"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Create account button */}
        <button
          type="submit"
          disabled={loading || !!oauthLoading}
          className="w-full min-h-[42px] h-11 short-compact-button rounded-[6px] bg-[#C2410C] text-white text-xs sm:text-sm font-semibold tracking-wide flex items-center justify-center transition-all duration-150 active:scale-[0.99] sm:hover:bg-[#9A3412] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2410C]/40 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 28 28" fill="none" aria-hidden="true" className="shrink-0 animate-spin">
                <rect x="2" y="2" width="11" height="11" stroke="#FFFFFF" strokeWidth="2" />
                <rect x="15" y="15" width="11" height="11" stroke="#FFFFFF" strokeWidth="2" />
              </svg>
              <span>Creating Account...</span>
            </span>
          ) : (
            "Create account"
          )}
        </button>

        {/* Thin "or" divider */}
        <div className="relative py-0.5">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-[#E2DED5]"></div>
          </div>
          <div className="relative flex justify-center text-[10px]">
            <span className="bg-[#F8F6F0] px-2 font-bold uppercase tracking-wider text-[#64748B]">
              or
            </span>
          </div>
        </div>

        {/* Social OAuth buttons side by side (Rule 8: Never stacked) */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={loading || !!oauthLoading}
            onClick={() => handleOAuth("Google")}
            aria-label="Register with Google"
            className="w-full min-h-[40px] h-10 short-compact-button rounded-[6px] border border-[#E2DED5] bg-white px-2 py-1 text-xs font-semibold text-[#0F172A] sm:hover:border-[#0F172A] sm:hover:bg-[#FAF8F5] transition-colors duration-150 flex items-center justify-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F172A]/20 disabled:opacity-60"
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
                <span className="hidden min-[360px]:inline">Google</span>
              </>
            )}
          </button>

          <button
            type="button"
            disabled={loading || !!oauthLoading}
            onClick={() => handleOAuth("GitHub")}
            aria-label="Register with GitHub"
            className="w-full min-h-[40px] h-10 short-compact-button rounded-[6px] border border-[#E2DED5] bg-white px-2 py-1 text-xs font-semibold text-[#0F172A] sm:hover:border-[#0F172A] sm:hover:bg-[#FAF8F5] transition-colors duration-150 flex items-center justify-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F172A]/20 disabled:opacity-60"
          >
            {oauthLoading === "GitHub" ? (
              <span className="text-xs">Connecting...</span>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="shrink-0 text-[#0F172A]">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span className="hidden min-[360px]:inline">GitHub</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Sign in link */}
      <div className="mt-2.5 pt-2 border-t border-[#E2DED5] text-center text-xs text-[#64748B]">
        <span>Already registered? </span>
        <Link
          to="/"
          className="text-[#0F172A] font-semibold underline underline-offset-2 hover:text-[#C2410C] transition-colors duration-150"
        >
          Sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
