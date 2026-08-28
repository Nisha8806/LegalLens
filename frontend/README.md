# LegalLens — Step 1: Frontend Foundation

AI-powered legal research assistant. This is **Step 1 of 4**: a complete,
professional, working React frontend — navigation, layouts, local document
upload/preview, and full demo-data UI for every future AI feature. No
backend, database, or LLM is connected yet.

> "Every AI answer should be easy to verify using the original legal source."

---

## Tech stack

- React 19 + Vite
- Tailwind CSS v4
- React Router
- Lucide React (icons)
- react-dropzone (file upload)
- react-pdf (PDF preview, pdf.js under the hood)
- framer-motion, recharts (installed, available for later steps)

## Getting started

```bash
cd legal-lens
npm install
npm run dev
```

Open the printed local URL (typically `http://localhost:5173`).

Other commands:

```bash
npm run build     # production build to dist/
npm run preview   # serve the production build locally
npm run lint      # oxlint
```

**Note:** PDF preview loads its worker script from a CDN
(`unpkg.com/pdfjs-dist`) at runtime, so an internet connection is needed
the first time a PDF is opened in the browser.

---

## Pages

| Route | Page | What it shows |
|---|---|---|
| `/` | Landing Page | Hero, feature grid, CTA |
| `/dashboard` | Dashboard | Stats, recent documents, quick actions, recent queries |
| `/research` | Document Research | **Core page.** Split screen: document viewer + "Ask LegalLens" AI assistant |
| `/cases` | Case Explorer | Case overview, related cases, visual precedent graph, case timeline |
| `/arguments` | Argument Analysis | Petitioner vs. respondent argument comparison |
| `/conflicts` | Conflict Detector | Side-by-side comparison of potentially conflicting judgments |
| `/brief` | Research Brief | Editable lawyer-reviewed research brief workspace |
| `/settings` | Settings | Placeholder, arrives with backend in Step 2 |

All routes are reachable from the landing navbar and the app sidebar, and
render without errors.

## What's functional right now

- Full navigation (navbar, sidebar, mobile menu) between all 8 pages
- Local PDF and TXT upload via drag-and-drop or file picker (`react-dropzone`)
- PDF preview with page navigation and zoom (`react-pdf`)
- Plain-text document viewer for `.txt` uploads
- A demo judgment document with paragraph-level highlighting, used when
  no file has been uploaded
- "Ask LegalLens" chat: submitting a question returns a structured demo
  response with **AI Answer → Retrieved Evidence → AI Interpretation →
  Source Citation → Verification Status**, clearly visually separated
- **Verify Source** button: scrolls the document viewer to the cited
  page/paragraph and highlights it — a real, working interaction on demo data
- Visual precedent graph (custom SVG) with clickable nodes that open a
  case-details panel
- Case timeline and a related-case timeline
- Research Brief editor: add/remove key points, cases, and evidence, then
  "Generate Research Brief" (saves to the mock API layer and confirms)
- Responsive layout down to mobile widths

## Architecture notes for Steps 2–4

Everything that will eventually talk to a backend is isolated so later
steps can extend it without rewriting the UI:

- **`src/services/api.js`** — every "network" call in the app goes through
  this file. Each function currently resolves demo data with an artificial
  delay so components already call an async, network-shaped API. Step 2
  only needs to change the bodies of these functions (e.g. add
  `fetch(\`${API_BASE_URL}/...\`)`) — no component needs to change.
- **`src/data/`** — all demo/sample data (`sampleCases.js`,
  `sampleDocuments.js`, `sampleResearchData.js`) is separate from both
  components and the service layer, so it's a drop-in replacement target.
- **Consistent IDs** — cases (`case-001`…), documents (`doc-001`…), and
  citation/paragraph references are already ID-based, matching how a real
  backend would key records.
- **`DocumentViewer`** already accepts a `sourceReference` prop shaped as
  `{ paragraphId, page }`. Step 3's RAG pipeline can drive this directly
  from real retrieval results instead of the demo click handler.
- No backend URLs are hardcoded inside any component — see
  `services/api.js`.

### Planned for later steps

- **Step 2:** Backend + document processing + PostgreSQL + REST/GraphQL API
- **Step 3:** Embeddings + vector database + semantic search + RAG + LLM +
  real source highlighting
- **Step 4:** Knowledge graph, argument/timeline extraction, conflict
  detection, citation/research-brief generation, voice input

## Project structure

```
src/
  components/
    layout/        Navbar, Sidebar, AppShell
    dashboard/      StatsCard, RecentDocuments, QuickActions, RecentQueries
    document/       DocumentUploader, DocumentViewer, DocumentToolbar, SourceHighlighter
    research/       AIChatPanel, QuestionInput, EvidenceCard, InterpretationCard, CitationCard, VerificationCard
    cases/          CaseCard, CaseGraph, CaseDetails, CaseTimeline
    arguments/      ArgumentComparison
    conflicts/      ConflictComparison
    researchBrief/  ResearchBriefEditor
    common/         DemoDataLabel, VerificationBadge, SectionLabel
  pages/            LandingPage, DashboardPage, DocumentResearchPage,
                     CaseExplorerPage, ArgumentAnalysisPage,
                     ConflictDetectorPage, ResearchBriefPage, SettingsPage, NotFoundPage
  data/             sampleCases.js, sampleDocuments.js, sampleResearchData.js
  services/         api.js
  utils/            constants.js
  App.jsx
  main.jsx
```

## Design

The visual identity — "Ink & Brass" — reflects the app's core promise of
separating AI output from verifiable source material: a dark "ink" surface
for the AI research assistant, a light "paper" surface for original
documents and evidence, and a muted brass accent used for the verification
seal motif throughout. Typography pairs Fraunces (display serif) with
Public Sans (body) and IBM Plex Mono (citations, case references).

## Status

Step 1 is complete: `npm install` and `npm run dev` both work, `npm run
build` produces a clean production bundle, and every page, route, and
listed interaction is functional against demo data. No Step 2/3/4 work
(backend, database, LLM, real RAG) has been started, per the brief.
