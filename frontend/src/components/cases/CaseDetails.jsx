import { X, Info } from "lucide-react";

export default function CaseDetails({ caseItem, relationshipType, onClose }) {
  if (!caseItem) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-xl border border-line bg-paper-3 p-8 text-center shadow-panel">
        <Info size={20} className="text-slate-light" />
        <p className="mt-2 text-[13px] text-slate">Select a case node in the graph to view its details here.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-line bg-paper-3 shadow-panel">
      <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <p className="font-display text-[15px] font-medium leading-snug text-ink">{caseItem.name}</p>
          <p className="mt-1 text-[12px] text-slate">{caseItem.court}</p>
        </div>
        <button onClick={onClose} aria-label="Close case details" className="rounded-md p-1 text-slate hover:bg-paper-2">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        {relationshipType && (
          <div className="rounded-md bg-caution-bg px-3 py-2.5 text-[12px] text-caution">
            Potential Relationship – Verify Source
            <p className="mt-0.5 font-medium">Relationship to current case: {relationshipType}</p>
          </div>
        )}

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate">Judgment Date</p>
          <p className="mt-1 text-[13.5px] text-ink">{caseItem.judgmentDate}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate">Case Duration</p>
          <p className="mt-1 text-[13.5px] text-ink">{caseItem.duration}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate">Legal Issue</p>
          <p className="mt-1 text-[13.5px] text-ink">{caseItem.legalIssue}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate">Summary</p>
          <p className="mt-1 text-[13.5px] leading-relaxed text-ink">{caseItem.summary}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {caseItem.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-paper-2 px-2.5 py-1 text-[11px] text-slate">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
