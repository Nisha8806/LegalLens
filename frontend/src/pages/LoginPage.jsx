import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../utils/constants";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from ?? ROUTES.DASHBOARD;

  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
    setFormError("");
  }

  function validate() {
    const next = {};
    if (!form.email.trim()) next.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email address.";
    if (!form.password) next.password = "Password is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setFormError("");
    try {
      await login(form);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setFormError(err.message || "Unable to sign in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in to LegalLens"
      subtitle="Access your research workspace, saved briefs and document library."
      footer={
        <>
          Don't have an account?{" "}
          <Link to={ROUTES.SIGNUP} className="font-semibold text-ink hover:text-brass-dark">
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4.5">
        <AnimatePresence>
          {formError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-start gap-2 overflow-hidden rounded-md bg-alert-bg px-3.5 py-2.5 text-[13px] text-alert"
            >
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>{formError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-[12.5px] font-medium text-ink">
            Email address
          </label>
          <div className="relative">
            <Mail size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-light" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="you@lawfirm.com"
              className={`w-full rounded-md border bg-paper-3 py-2.5 pl-10 pr-3.5 text-[13.5px] text-ink placeholder:text-slate-light transition-colors focus:outline-none focus:ring-2 focus:ring-brass/40 ${
                errors.email ? "border-alert" : "border-line focus:border-brass"
              }`}
            />
          </div>
          {errors.email && <p className="mt-1.5 text-[12px] text-alert">{errors.email}</p>}
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="block text-[12.5px] font-medium text-ink">
              Password
            </label>
            <Link to="#" className="text-[12px] font-medium text-brass-dark hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-light" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              placeholder="••••••••"
              className={`w-full rounded-md border bg-paper-3 py-2.5 pl-10 pr-10 text-[13.5px] text-ink placeholder:text-slate-light transition-colors focus:outline-none focus:ring-2 focus:ring-brass/40 ${
                errors.password ? "border-alert" : "border-line focus:border-brass"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-light hover:text-ink"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password && <p className="mt-1.5 text-[12px] text-alert">{errors.password}</p>}
        </div>

        <label className="flex select-none items-center gap-2 text-[13px] text-slate">
          <input
            type="checkbox"
            checked={form.remember}
            onChange={(e) => update("remember", e.target.checked)}
            className="h-3.5 w-3.5 rounded border-line text-ink accent-ink"
          />
          Remember me on this device
        </label>

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-ink py-3 text-[13.5px] font-semibold text-text-onink transition-colors hover:bg-ink-2 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? (
            <>
              <Loader2 size={15} className="animate-spin" /> Signing in…
            </>
          ) : (
            <>
              Sign in <ArrowRight size={15} />
            </>
          )}
        </motion.button>
      </form>

      <div className="mt-6 rounded-md border border-line bg-paper-2 px-3.5 py-3 text-[12px] leading-relaxed text-slate">
        New to LegalLens? Create an account and it'll sign you in immediately — no email
        verification needed in this demo build.
      </div>
    </AuthLayout>
  );
}
