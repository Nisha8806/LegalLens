import { Link } from "react-router-dom";
import {
  ArrowRight,
  UploadCloud,
  Search,
  ShieldCheck,
  Network,
  Swords,
  History,
  ShieldAlert,
  BookMarked,
  Mic,
  FileText,
  Bot,
  GitBranch,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import { ROUTES } from "../utils/constants";

const FEATURES = [
  { icon: Search, title: "Smart Legal Research", desc: "Search legal information using natural language." },
  { icon: ShieldCheck, title: "Evidence Verification", desc: "Verify AI responses using original legal documents." },
  { icon: Network, title: "Visual Precedent Graph", desc: "Understand relationships between related cases." },
  { icon: Swords, title: "Argument Analysis", desc: "Compare arguments from different sides." },
  { icon: History, title: "Case Timeline", desc: "Understand important events and judgments over time." },
  { icon: ShieldAlert, title: "Conflict Detection", desc: "Identify potential differences between related judgments." },
  { icon: BookMarked, title: "Citation Builder", desc: "Organize evidence and source references." },
  { icon: Mic, title: "Voice Research", desc: "Ask legal questions using voice." },
];

const PIPELINE = [
  { label: "Legal Documents", icon: FileText },
  { label: "AI Analysis", icon: Bot },
  { label: "Evidence", icon: ShieldCheck },
  { label: "Case Relationships", icon: GitBranch },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute inset-0 paper-texture opacity-60" />
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-14 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-paper-3 px-3 py-1.5 text-[12px] font-medium text-slate">
              <span className="h-1.5 w-1.5 rounded-full bg-verified" />
              For legal professionals and research teams
            </span>
            <h1 className="mt-6 font-display text-[2.6rem] font-medium leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.3rem]">
              Legal research,<br />reimagined with AI.
            </h1>
            <p className="mt-5 max-w-xl text-[15.5px] leading-relaxed text-slate">
              Analyze legal documents, discover relevant precedents, compare arguments, and verify
              every insight with original source evidence.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={ROUTES.RESEARCH}
                className="flex items-center gap-2 rounded-md bg-ink px-5 py-3 text-[13.5px] font-semibold text-text-onink transition-colors hover:bg-ink-2"
              >
                Start Research <ArrowRight size={15} />
              </Link>
              <Link
                to={ROUTES.RESEARCH}
                className="flex items-center gap-2 rounded-md border border-line bg-paper-3 px-5 py-3 text-[13.5px] font-semibold text-ink transition-colors hover:border-brass"
              >
                <UploadCloud size={15} /> Upload Document
              </Link>
            </div>
            <p className="mt-6 text-[12px] text-slate-light">
              "Every AI answer should be easy to verify using the original legal source."
            </p>
          </div>

          {/* Pipeline illustration */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-sm rounded-2xl border border-line bg-paper-3 p-6 shadow-panel-lg">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate">How LegalLens reasons</p>
              <div className="mt-5 space-y-0">
                {PIPELINE.map((step, i) => (
                  <div key={step.label}>
                    <div className="flex items-center gap-3.5 rounded-lg border border-line bg-paper-2 px-4 py-3.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-ink text-brass-light">
                        <step.icon size={16} />
                      </span>
                      <span className="text-[13.5px] font-medium text-ink">{step.label}</span>
                    </div>
                    {i < PIPELINE.length - 1 && (
                      <div className="ml-[35px] h-6 w-px bg-line" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="max-w-2xl">
          <p className="text-[12px] font-semibold uppercase tracking-[0.09em] text-brass-dark">Platform</p>
          <h2 className="mt-2 font-display text-[1.9rem] font-medium tracking-tight text-ink">
            Built for how lawyers actually verify a claim.
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-line bg-paper-3 p-5 transition-colors hover:border-brass-light"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-paper-2 text-brass-dark">
                <f.icon size={17} />
              </span>
              <h3 className="mt-4 text-[14px] font-semibold text-ink">{f.title}</h3>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-line bg-ink">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 py-16 sm:flex-row sm:items-center lg:px-10">
          <div>
            <h2 className="font-display text-[1.8rem] font-medium tracking-tight text-text-onink">
              Start Your Legal Research
            </h2>
            <p className="mt-2 max-w-md text-[13.5px] text-text-onink-muted">
              Upload a judgment, ask a question, and verify the answer against the original source —
              in one workspace.
            </p>
          </div>
          <Link
            to={ROUTES.RESEARCH}
            className="flex shrink-0 items-center gap-2 rounded-md bg-brass px-6 py-3.5 text-[13.5px] font-semibold text-ink transition-colors hover:bg-brass-light"
          >
            Start Research <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-ink-3 bg-ink px-6 py-6 text-center text-[11.5px] text-text-onink-muted lg:px-10">
        LegalLens — Smarter Legal Research. Evidence You Can Verify.
      </footer>
    </div>
  );
}
