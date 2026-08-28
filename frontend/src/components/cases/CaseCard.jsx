import { Scale } from "lucide-react";
import { RELATIONSHIP_TYPES } from "../../utils/constants";

const RELATIONSHIP_STYLE = {
  [RELATIONSHIP_TYPES.CITES]: "bg-paper-2 text-slate",
  [RELATIONSHIP_TYPES.FOLLOWS]: "bg-verified-bg text-verified",
  [RELATIONSHIP_TYPES.SUPPORTS]: "bg-verified-bg text-verified",
  [RELATIONSHIP_TYPES.SIMILAR]: "bg-paper-2 text-slate",
  [RELATIONSHIP_TYPES.DISTINGUISHES]: "bg-caution-bg text-caution",
  [RELATIONSHIP_TYPES.CONFLICT]: "bg-alert-bg text-alert",
};

export default function CaseCard({ caseItem, relationshipType, onClick, active }) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-lg border p-4 text-left transition-colors ${
        active ? "border-brass bg-paper-2" : "border-line bg-paper-3 hover:border-brass-light"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-paper-2 text-slate">
            <Scale size={13} />
          </span>
          <div>
            <p className="text-[13.5px] font-medium leading-snug text-ink">{caseItem.name}</p>
            <p className="mt-0.5 text-[12px] text-slate">{caseItem.court} · {caseItem.year}</p>
          </div>
        </div>
        {relationshipType && (
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-medium ${RELATIONSHIP_STYLE[relationshipType] ?? "bg-paper-2 text-slate"}`}>
            {relationshipType}
          </span>
        )}
      </div>
    </button>
  );
}
