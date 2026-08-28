import { Gavel, ScrollText } from "lucide-react";

function SideColumn({ side, accent }) {
  return (
    <div className="rounded-xl border border-line bg-paper-3 shadow-panel">
      <div className={`border-b border-line px-5 py-4 ${accent === "brass" ? "bg-paper-2" : "bg-ink"}`}>
        <h3 className={`font-display text-[15px] font-medium ${accent === "brass" ? "text-ink" : "text-text-onink"}`}>
          {side.label}
        </h3>
      </div>
      <div className="space-y-4 px-5 py-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate">Main Argument</p>
          <p className="mt-1 text-[13.5px] leading-relaxed text-ink">{side.mainArgument}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate">Supporting Evidence</p>
          <ul className="mt-1.5 space-y-1">
            {side.evidence.map((item, i) => (
              <li key={i} className="text-[12.5px] leading-relaxed text-ink">· {item}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate">Related Cases</p>
          <ul className="mt-1.5 space-y-1">
            {side.relatedCases.map((c) => (
              <li key={c} className="text-[12.5px] text-brass-dark">{c}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate">Relevant Provisions</p>
          <ul className="mt-1.5 space-y-1">
            {side.provisions.map((p) => (
              <li key={p} className="text-[12.5px] font-mono text-slate">{p}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-md bg-caution-bg px-3 py-2.5">
          <p className="text-[10.5px] font-semibold uppercase tracking-wide text-caution">
            AI Research Suggestion – Verify with Source
          </p>
          <ul className="mt-1 space-y-1">
            {side.counterarguments.map((c, i) => (
              <li key={i} className="text-[12px] text-caution">{c}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function ArgumentComparison({ data }) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-line bg-paper-3 p-5 shadow-panel">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate">Legal Issue</p>
        <p className="mt-1 text-[14.5px] font-medium text-ink">{data.legalIssue}</p>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1fr_auto_1fr]">
        <SideColumn side={data.petitioner} accent="brass" />
        <div className="hidden items-center justify-center py-10 lg:flex">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-paper-2 font-display text-[13px] font-medium text-slate">
            VS
          </span>
        </div>
        <SideColumn side={data.respondent} accent="ink" />
      </div>

      <div className="rounded-xl border border-line bg-paper-3 p-5 shadow-panel">
        <div className="flex items-center gap-2">
          <Gavel size={15} className="text-brass-dark" />
          <h3 className="font-display text-[15px] font-medium text-ink">Court's Analysis</h3>
        </div>
        <p className="mt-2.5 flex items-start gap-2 text-[13.5px] leading-relaxed text-ink">
          <ScrollText size={14} className="mt-1 shrink-0 text-slate-light" />
          {data.courtAnalysis}
        </p>
      </div>
    </div>
  );
}
