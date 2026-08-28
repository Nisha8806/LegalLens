import { useState } from "react";
import { Plus, FileDown, Save, BadgeCheck, X } from "lucide-react";
import { sampleCases } from "../../data/sampleCases";
import { sampleCitations } from "../../data/sampleResearchData";
import { saveResearchBrief } from "../../services/api";

const EMPTY_POINT = "";

export default function ResearchBriefEditor() {
  const [legalQuestion, setLegalQuestion] = useState(
    "Does the force-majeure clause excuse a delivery delay absent a documented mitigation effort?"
  );
  const [keyPoints, setKeyPoints] = useState([
    "Court requires an affirmative showing of mitigation before force majeure succeeds.",
    "Liability-cap interpretation remains split between first-instance and appellate authority.",
  ]);
  const [selectedCases, setSelectedCases] = useState([sampleCases[0], sampleCases[3]]);
  const [evidence, setEvidence] = useState([
    "\"The petitioner submitted that the respondent had failed to fulfil the obligations specified under the agreement...\"",
  ]);
  const [citations] = useState(sampleCitations);
  const [aiNotes] = useState(
    "AI Research Suggestion – Verify with Source: consider addressing the liability-cap split directly, since Harrow Textiles offers persuasive authority for a broader reading."
  );
  const [saveState, setSaveState] = useState("idle");

  const addPoint = () => setKeyPoints((p) => [...p, EMPTY_POINT]);
  const updatePoint = (i, val) => setKeyPoints((p) => p.map((pt, idx) => (idx === i ? val : pt)));
  const removePoint = (i) => setKeyPoints((p) => p.filter((_, idx) => idx !== i));

  const addCase = () => {
    const unused = sampleCases.find((c) => !selectedCases.some((s) => s.id === c.id));
    if (unused) setSelectedCases((s) => [...s, unused]);
  };
  const removeCase = (id) => setSelectedCases((s) => s.filter((c) => c.id !== id));

  const addEvidence = () => setEvidence((e) => [...e, "New evidence excerpt — click to edit."]);
  const removeEvidence = (i) => setEvidence((e) => e.filter((_, idx) => idx !== i));

  const handleGenerate = async () => {
    setSaveState("saving");
    await saveResearchBrief({ legalQuestion, keyPoints, selectedCases, evidence, citations, aiNotes });
    setSaveState("saved");
    window.setTimeout(() => setSaveState("idle"), 2200);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-paper-3 p-5 shadow-panel">
        <div className="flex items-center gap-2">
          <BadgeCheck size={16} className="text-verified" />
          <p className="text-[13px] font-medium text-ink">Lawyer-Reviewed Research Brief</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleGenerate}
            className="flex items-center gap-2 rounded-md bg-ink px-4 py-2.5 text-[13px] font-semibold text-text-onink transition-colors hover:bg-ink-2"
          >
            <Save size={14} />
            {saveState === "saving" ? "Generating…" : saveState === "saved" ? "Saved ✓" : "Generate Research Brief"}
          </button>
          <button className="flex items-center gap-2 rounded-md border border-line bg-paper-2 px-4 py-2.5 text-[13px] font-semibold text-ink transition-colors hover:border-brass">
            <FileDown size={14} />
            Export
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-line bg-paper-3 p-5 shadow-panel">
        <label className="text-[11px] font-semibold uppercase tracking-wide text-slate">Legal Question</label>
        <textarea
          value={legalQuestion}
          onChange={(e) => setLegalQuestion(e.target.value)}
          rows={2}
          className="mt-2 w-full resize-none rounded-md border border-line bg-paper-2 px-3.5 py-2.5 text-[13.5px] text-ink focus:outline-none"
        />
      </div>

      <div className="rounded-xl border border-line bg-paper-3 p-5 shadow-panel">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate">Key Points</label>
          <button onClick={addPoint} className="flex items-center gap-1 text-[12px] font-medium text-brass-dark hover:underline">
            <Plus size={13} /> Add Point
          </button>
        </div>
        <ul className="mt-3 space-y-2">
          {keyPoints.map((point, i) => (
            <li key={i} className="flex items-center gap-2">
              <input
                value={point}
                onChange={(e) => updatePoint(i, e.target.value)}
                className="flex-1 rounded-md border border-line bg-paper-2 px-3 py-2 text-[13px] text-ink focus:outline-none"
              />
              <button onClick={() => removePoint(i)} aria-label="Remove point" className="rounded-md p-1.5 text-slate hover:bg-paper-2">
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="rounded-xl border border-line bg-paper-3 p-5 shadow-panel">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate">Selected Cases</label>
            <button onClick={addCase} className="flex items-center gap-1 text-[12px] font-medium text-brass-dark hover:underline">
              <Plus size={13} /> Add Case
            </button>
          </div>
          <ul className="mt-3 space-y-2">
            {selectedCases.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-2 rounded-md bg-paper-2 px-3 py-2.5">
                <div>
                  <p className="text-[12.5px] font-medium text-ink">{c.name}</p>
                  <p className="text-[11px] text-slate">{c.court}</p>
                </div>
                <button onClick={() => removeCase(c.id)} aria-label="Remove case" className="shrink-0 rounded-md p-1 text-slate hover:bg-paper-3">
                  <X size={13} />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-line bg-paper-3 p-5 shadow-panel">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate">Supporting Evidence</label>
            <button onClick={addEvidence} className="flex items-center gap-1 text-[12px] font-medium text-brass-dark hover:underline">
              <Plus size={13} /> Add Evidence
            </button>
          </div>
          <ul className="mt-3 space-y-2">
            {evidence.map((ev, i) => (
              <li key={i} className="flex items-start justify-between gap-2 rounded-md bg-paper-2 px-3 py-2.5">
                <p className="font-mono text-[11.5px] leading-relaxed text-slate">{ev}</p>
                <button onClick={() => removeEvidence(i)} aria-label="Remove evidence" className="shrink-0 rounded-md p-1 text-slate hover:bg-paper-3">
                  <X size={13} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-line bg-paper-3 p-5 shadow-panel">
        <label className="text-[11px] font-semibold uppercase tracking-wide text-slate">Source Citations</label>
        <ul className="mt-3 space-y-2">
          {citations.map((c) => (
            <li key={c.id} className="flex items-center gap-3 rounded-md bg-paper-2 px-3 py-2.5 text-[12.5px]">
              <span className="font-medium text-ink">{c.caseName}</span>
              <span className="text-slate">{c.court}</span>
              <span className="ml-auto font-mono text-slate-light">p. {c.page} {c.section}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-caution/40 bg-caution-bg p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-caution">AI Notes</p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-caution">{aiNotes}</p>
      </div>
    </div>
  );
}
