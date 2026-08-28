import { useMemo, useState } from "react";
import AppShell from "../components/layout/AppShell";
import CaseCard from "../components/cases/CaseCard";
import CaseGraph from "../components/cases/CaseGraph";
import CaseDetails from "../components/cases/CaseDetails";
import CaseTimeline from "../components/cases/CaseTimeline";
import DemoDataLabel from "../components/common/DemoDataLabel";
import { sampleCases, caseRelationships, getCaseById } from "../data/sampleCases";
import { caseTimeline, relatedTimeline } from "../data/sampleResearchData";
import { Network } from "lucide-react";

const CURRENT_CASE = sampleCases[0];

export default function CaseExplorerPage() {
  const [selectedId, setSelectedId] = useState(null);

  const relatedCases = useMemo(
    () => caseRelationships.map((r) => getCaseById(r.target)),
    []
  );

  const selectedCase = selectedId ? getCaseById(selectedId) : null;
  const selectedRelationship = selectedId
    ? caseRelationships.find((r) => r.target === selectedId)?.type
    : null;

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-[1.9rem] font-medium tracking-tight text-ink">Case Explorer</h1>
            <p className="mt-1.5 text-[14px] text-slate">Explore precedent relationships for the current case.</p>
          </div>
          <DemoDataLabel />
        </div>

        {/* Case overview */}
        <div className="mt-8 rounded-xl border border-line bg-paper-3 p-6 shadow-panel">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate">Current Case</p>
          <h2 className="mt-1.5 font-display text-[1.4rem] font-medium text-ink">{CURRENT_CASE.name}</h2>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-[13px] text-slate">
            <span><span className="text-ink">{CURRENT_CASE.court}</span></span>
            <span>Judgment: {CURRENT_CASE.judgmentDate}</span>
            <span>Issue: {CURRENT_CASE.legalIssue}</span>
          </div>
          <p className="mt-3 max-w-3xl text-[13.5px] leading-relaxed text-ink">{CURRENT_CASE.summary}</p>
        </div>

        {/* Related cases */}
        <div className="mt-6">
          <h3 className="font-display text-base font-medium text-ink">Related Cases</h3>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {relatedCases.map((c) => {
              const rel = caseRelationships.find((r) => r.target === c.id)?.type;
              return (
                <CaseCard
                  key={c.id}
                  caseItem={c}
                  relationshipType={rel}
                  active={selectedId === c.id}
                  onClick={() => setSelectedId(c.id)}
                />
              );
            })}
          </div>
        </div>

        {/* Precedent graph */}
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-xl border border-line bg-paper-3 p-5 shadow-panel">
            <div className="flex items-center gap-2">
              <Network size={15} className="text-brass-dark" />
              <h3 className="font-display text-base font-medium text-ink">Visual Precedent Graph</h3>
            </div>
            <p className="mt-1 text-[12px] text-slate">Click a node to view its relationship to the current case.</p>
            <div className="mt-4">
              <CaseGraph
                currentCase={CURRENT_CASE}
                relatedCases={relatedCases}
                relationships={caseRelationships}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            </div>
          </div>

          <div className="h-[360px] lg:h-auto">
            <CaseDetails
              caseItem={selectedCase}
              relationshipType={selectedRelationship}
              onClose={() => setSelectedId(null)}
            />
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-6">
          <CaseTimeline events={caseTimeline} relatedEvents={relatedTimeline} />
        </div>
      </div>
    </AppShell>
  );
}
