import { FlaskConical } from "lucide-react";
import { DEMO_DATA_LABEL } from "../../utils/constants";

export default function DemoDataLabel({ className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-line bg-paper-2 px-2.5 py-1 text-[11px] font-medium tracking-wide text-slate ${className}`}
    >
      <FlaskConical size={12} className="text-brass-dark" />
      {DEMO_DATA_LABEL}
    </span>
  );
}
