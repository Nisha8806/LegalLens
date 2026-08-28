import { Sparkles } from "lucide-react";
import SectionLabel from "../common/SectionLabel";

export default function InterpretationCard({ text }) {
  return (
    <div className="rounded-lg border border-ink-3 bg-ink-2 p-4">
      <SectionLabel icon={Sparkles} tone="ink">
        🤖 AI Interpretation
      </SectionLabel>
      <p className="mt-2.5 text-[13.5px] leading-relaxed text-text-onink">{text}</p>
    </div>
  );
}
