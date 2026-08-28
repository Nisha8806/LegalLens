import { BookMarked } from "lucide-react";
import SectionLabel from "../common/SectionLabel";

export default function CitationCard({ citation }) {
  const rows = [
    ["Case Name", citation.caseName],
    ["Court", citation.court],
    ["Judgment Date", citation.judgmentDate],
    ["Page", citation.page],
    ["Paragraph / Section", citation.section],
  ];

  return (
    <div className="rounded-lg border border-ink-3 bg-ink-2 p-4">
      <SectionLabel icon={BookMarked} tone="ink">
        📚 Source Citation
      </SectionLabel>
      <dl className="mt-2.5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-[11.5px] text-text-onink-muted">{label}</dt>
            <dd className="text-[12.5px] font-medium text-text-onink">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
