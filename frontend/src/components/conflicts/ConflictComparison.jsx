import { ShieldAlert, ScanSearch } from "lucide-react";

function CaseColumn({ label, caseData }) {
  return (
    <div className="rounded-xl border border-line bg-paper-3 shadow-panel">
      <div className="border-b border-line px-5 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate">{label}</p>
        <h3 className="mt-1 font-display text-[15px] font-medium text-ink">{caseData.name}</h3>
        <p className="mt-0.5 text-[12px] text-slate">{caseData.court} · {caseData.judgmentDate}</p>
      </div>
      <div className="space-y-4 px-5 py-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate">Key Interpretation</p>
          <p className="mt-1 text-[13.5px] leading-relaxed text-ink">{caseData.interpretation}</p>
        </div>
        <div className="rounded-md bg-paper-2 px-3 py-2.5">
          <p className="text-[10.5px] font-semibold uppercase tracking-wide text-slate">Retrieved Evidence</p>
          <blockquote className="mt-1.5 border-l-2 border-brass pl-2.5 font-mono text-[11.5px] leading-relaxed text-slate">
            {caseData.evidence}
          </blockquote>
        </div>
      </div>
    </div>
  );
}

export default function ConflictComparison({ data }) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-line bg-paper-3 p-5 shadow-panel">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate">Legal Issue</p>
        <p className="mt-1 text-[14.5px] font-medium text-ink">{data.legalIssue}</p>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1fr_auto_1fr]">
        <CaseColumn label="Case A" caseData={data.caseA} />
        <div className="hidden items-center justify-center py-10 lg:flex">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-paper-2 font-display text-[13px] font-medium text-slate">
            VS
          </span>
        </div>
        <CaseColumn label="Case B" caseData={data.caseB} />
      </div>

      <div className="rounded-xl border border-alert/40 bg-alert-bg p-5">
        <div className="flex items-center gap-2">
          <ShieldAlert size={16} className="text-alert" />
          <h3 className="font-display text-[15px] font-medium text-alert">Potential Difference Detected</h3>
        </div>
        <ul className="mt-3 space-y-1.5">
          {data.differenceFactors.map((factor, i) => (
            <li key={i} className="text-[13px] leading-relaxed text-alert">· {factor}</li>
          ))}
        </ul>
        <div className="mt-4 flex flex-col gap-3 border-t border-alert/25 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12.5px] font-medium text-alert">
            Potential Difference – Source Verification Recommended
          </p>
          <button className="flex shrink-0 items-center justify-center gap-2 rounded-md bg-ink px-4 py-2.5 text-[13px] font-semibold text-text-onink transition-colors hover:bg-ink-2">
            <ScanSearch size={15} />
            Verify Both Sources
          </button>
        </div>
      </div>
    </div>
  );
}
