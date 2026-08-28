import AppShell from "../components/layout/AppShell";
import ResearchBriefEditor from "../components/researchBrief/ResearchBriefEditor";
import DemoDataLabel from "../components/common/DemoDataLabel";

export default function ResearchBriefPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-6 py-8 lg:px-10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-[1.9rem] font-medium tracking-tight text-ink">Research Brief</h1>
            <p className="mt-1.5 text-[14px] text-slate">Organize your research into a lawyer-reviewed brief.</p>
          </div>
          <DemoDataLabel />
        </div>

        <div className="mt-8">
          <ResearchBriefEditor />
        </div>
      </div>
    </AppShell>
  );
}
