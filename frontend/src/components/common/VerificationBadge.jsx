import { ShieldCheck, ShieldAlert, ShieldQuestion } from "lucide-react";

const VARIANTS = {
  available: {
    icon: ShieldCheck,
    text: "text-verified",
    bg: "bg-verified-bg",
    ring: "text-verified",
  },
  caution: {
    icon: ShieldAlert,
    text: "text-caution",
    bg: "bg-caution-bg",
    ring: "text-caution",
  },
  unverified: {
    icon: ShieldQuestion,
    text: "text-slate",
    bg: "bg-paper-2",
    ring: "text-slate",
  },
};

/**
 * The brass-seal verification stamp used throughout the app.
 * `level`: "available" | "caution" | "unverified"
 */
export default function VerificationBadge({ level = "available", label, size = "md" }) {
  const v = VARIANTS[level] ?? VARIANTS.unverified;
  const Icon = v.icon;
  const dims = size === "sm" ? "h-6 w-6" : "h-8 w-8";
  const iconSize = size === "sm" ? 12 : 15;

  return (
    <div className={`inline-flex items-center gap-2.5 rounded-lg ${v.bg} px-3 py-2`}>
      <span className={`seal-ring ${v.ring} flex ${dims} shrink-0 items-center justify-center`}>
        <Icon size={iconSize} strokeWidth={2} />
      </span>
      <span className={`text-sm font-medium ${v.text}`}>{label}</span>
    </div>
  );
}
