export default function SectionLabel({ icon: Icon, children, tone = "default" }) {
  const toneClass =
    tone === "ink"
      ? "text-text-onink-muted"
      : "text-slate";
  return (
    <div className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.09em] ${toneClass}`}>
      {Icon && <Icon size={13} />}
      {children}
    </div>
  );
}
