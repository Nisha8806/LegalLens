import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, Building2, ArrowRight, AlertCircle, Loader2, Check } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../utils/constants";

const PASSWORD_RULES = [
  { test: (p) => p.length >= 8, label: "At least 8 characters" },
  { test: (p) => /[A-Z]/.test(p), label: "One uppercase letter" },
  { test: (p) => /[0-9]/.test(p), label: "One number" },
];

export default function SignupPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", firm: "", email: "", password: "", confirm: "" });
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
    if (!form.name.trim()) next.name = "Full name is required.";
    if (!form.email.trim()) next.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email address.";
    if (!PASSWORD_RULES.every((r) => r.test(form.password))) next.password = "Password doesn't meet the requirements.";
    if (form.confirm !== form.password) next.confirm = "Passwords do not match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setFormError("");
    try {
      await register(form);
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
      setFormError(err.message || "Unable to create your account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Create your workspace"
      title="Sign up for LegalLens"
      subtitle="Set up your firm's research workspace in under a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link to={ROUTES.LOGIN} className="font-semibold text-ink hover:text-brass-dark">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-[12.5px] font-medium text-ink">
              Full name
            </label>
            <div className="relative">
              <User size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-light" />
              <input
                id="name"
                autoComplete="name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="A. Okafor"
                className={`w-full rounded-md border bg-paper-3 py-2.5 pl-10 pr-3 text-[13.5px] text-ink placeholder:text-slate-light transition-colors focus:outline-none focus:ring-2 focus:ring-brass/40 ${
                  errors.name ? "border-alert" : "border-line focus:border-brass"
                }`}
              />
            </div>
            {errors.name && <p className="mt-1.5 text-[12px] text-alert">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="firm" className="mb-1.5 block text-[12.5px] font-medium text-ink">
              Firm <span className="text-slate-light">(optional)</span>
            </label>
            <div className="relative">
              <Building2 size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-light" />
              <input
                id="firm"
                autoComplete="organization"
                value={form.firm}
                onChange={(e) => update("firm", e.target.value)}
                placeholder="Commercial Practice"
                className="w-full rounded-md border border-line bg-paper-3 py-2.5 pl-10 pr-3 text-[13.5px] text-ink placeholder:text-slate-light transition-colors focus:border-brass focus:outline-none focus:ring-2 focus:ring-brass/40"
              />
            </div>
          </div>
        </div>

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
          <label htmlFor="password" className="mb-1.5 block text-[12.5px] font-medium text-ink">
            Password
          </label>
          <div className="relative">
            <Lock size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-light" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
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
          {form.password && (
            <ul className="mt-2 space-y-1">
              {PASSWORD_RULES.map((rule) => {
                const met = rule.test(form.password);
                return (
                  <li key={rule.label} className={`flex items-center gap-1.5 text-[11.5px] ${met ? "text-verified" : "text-slate-light"}`}>
                    <Check size={12} className={met ? "opacity-100" : "opacity-30"} />
                    {rule.label}
                  </li>
                );
              })}
            </ul>
          )}
          {errors.password && <p className="mt-1.5 text-[12px] text-alert">{errors.password}</p>}
        </div>

        <div>
          <label htmlFor="confirm" className="mb-1.5 block text-[12.5px] font-medium text-ink">
            Confirm password
          </label>
          <div className="relative">
            <Lock size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-light" />
            <input
              id="confirm"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={form.confirm}
              onChange={(e) => update("confirm", e.target.value)}
              placeholder="••••••••"
              className={`w-full rounded-md border bg-paper-3 py-2.5 pl-10 pr-3.5 text-[13.5px] text-ink placeholder:text-slate-light transition-colors focus:outline-none focus:ring-2 focus:ring-brass/40 ${
                errors.confirm ? "border-alert" : "border-line focus:border-brass"
              }`}
            />
          </div>
          {errors.confirm && <p className="mt-1.5 text-[12px] text-alert">{errors.confirm}</p>}
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-ink py-3 text-[13.5px] font-semibold text-text-onink transition-colors hover:bg-ink-2 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? (
            <>
              <Loader2 size={15} className="animate-spin" /> Creating account…
            </>
          ) : (
            <>
              Create account <ArrowRight size={15} />
            </>
          )}
        </motion.button>

        <p className="text-center text-[11.5px] leading-relaxed text-slate-light">
          By signing up you agree to LegalLens's Terms of Service and Privacy Policy.
        </p>
      </form>
    </AuthLayout>
  );
}
