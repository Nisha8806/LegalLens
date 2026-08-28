import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Scale, ShieldCheck, Network, FileSearch } from "lucide-react";
import { ROUTES } from "../../utils/constants";

const HIGHLIGHTS = [
  { icon: ShieldCheck, text: "Every AI answer links back to a verifiable source." },
  { icon: Network, text: "Explore precedent relationships across the bench." },
  { icon: FileSearch, text: "Search thousands of judgments in natural language." },
];

export default function AuthLayout({ eyebrow, title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-paper lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink px-12 py-10 text-text-onink lg:flex">
        <div className="pointer-events-none absolute inset-0 paper-texture opacity-[0.06]" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brass/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-brass/10 blur-3xl" />

        <Link to={ROUTES.HOME} className="relative z-10 flex items-center gap-2.5">
          <span className="seal-ring flex h-9 w-9 items-center justify-center text-brass-light">
            <Scale size={18} strokeWidth={2} />
          </span>
          <span className="font-display text-xl font-medium tracking-tight">LegalLens</span>
        </Link>

        <div className="relative z-10 max-w-md">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-display text-[2.1rem] font-medium leading-[1.15] tracking-tight"
          >
            Legal research, reimagined with AI.
          </motion.p>
          <p className="mt-3 text-[14px] leading-relaxed text-text-onink-muted">
            A single workspace for document research, case exploration and evidence-verified
            answers — built for lawyers who need to show their work.
          </p>

          <ul className="mt-8 space-y-4">
            {HIGHLIGHTS.map((h, i) => (
              <motion.li
                key={h.text}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.1 }}
                className="flex items-start gap-3"
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-ink-3 text-brass-light">
                  <h.icon size={14} />
                </span>
                <span className="text-[13px] leading-relaxed text-text-onink-muted">{h.text}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-[11.5px] text-text-onink-muted/80">
          LegalLens — Smarter Legal Research. Evidence You Can Verify.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <Link to={ROUTES.HOME} className="mb-8 flex items-center gap-2.5 lg:hidden">
          <span className="seal-ring flex h-8 w-8 items-center justify-center text-ink">
            <Scale size={16} strokeWidth={2} />
          </span>
          <span className="font-display text-lg font-medium tracking-tight text-ink">LegalLens</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mx-auto w-full max-w-sm"
        >
          {eyebrow && (
            <p className="text-[12px] font-semibold uppercase tracking-[0.09em] text-brass-dark">{eyebrow}</p>
          )}
          <h1 className="mt-2 font-display text-[1.75rem] font-medium tracking-tight text-ink">{title}</h1>
          {subtitle && <p className="mt-1.5 text-[13.5px] text-slate">{subtitle}</p>}

          <div className="mt-8">{children}</div>

          {footer && <div className="mt-7 text-center text-[13px] text-slate">{footer}</div>}
        </motion.div>
      </div>
    </div>
  );
}
