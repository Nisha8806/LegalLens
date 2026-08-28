import AppShell from "../components/layout/AppShell";
import ArgumentComparison from "../components/arguments/ArgumentComparison";
import DemoDataLabel from "../components/common/DemoDataLabel";
import { argumentAnalysis } from "../data/sampleResearchData";

export default function ArgumentAnalysisPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-6 py-8 lg:px-10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-[1.9rem] font-medium tracking-tight text-ink">Argument Analysis</h1>
            <p className="mt-1.5 text-[14px] text-slate">Compare petitioner and respondent positions side by side.</p>
          </div>
          <DemoDataLabel />
        </div>

        <div className="mt-8">
          <ArgumentComparison data={argumentAnalysis} />
        </div>
      </div>
    </AppShell>
  );
}
