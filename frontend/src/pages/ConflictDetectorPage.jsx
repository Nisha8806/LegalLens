import AppShell from "../components/layout/AppShell";
import ConflictComparison from "../components/conflicts/ConflictComparison";
import DemoDataLabel from "../components/common/DemoDataLabel";
import { conflictData } from "../data/sampleResearchData";

export default function ConflictDetectorPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-6 py-8 lg:px-10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-[1.9rem] font-medium tracking-tight text-ink">Conflict Detector</h1>
            <p className="mt-1.5 text-[14px] text-slate">
              Compare potentially conflicting judgments on the same legal issue.
            </p>
          </div>
          <DemoDataLabel />
        </div>

        <div className="mt-8">
          <ConflictComparison data={conflictData} />
        </div>
      </div>
    </AppShell>
  );
}
