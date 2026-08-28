// Demo content for the AI Research Assistant, Argument Analysis,
// Conflict Detector, Case Timeline and Research Brief pages.
// In Step 3 these responses come from the RAG pipeline; the shape
// (answer / evidence / interpretation / citation / verification)
// is fixed now so the UI never has to change.

export const sampleQueries = [
  "What was the petitioner's main argument regarding delivery delay?",
  "How has this court treated force-majeure defences on similar facts?",
  "Are there conflicting judgments on liability-cap interpretation?",
  "What mitigation standard applies before force majeure succeeds?",
];

export const sampleAiResponse = {
  question:
    "What was the petitioner's main argument regarding the delivery delay?",
  answer:
    "The petitioner argued that the contractual agreement had been violated and sought compensation for losses caused by the fourteen-day delivery delay.",
  evidence:
    "\"The petitioner submitted that the respondent had failed to fulfil the obligations specified under the agreement, resulting in a fourteen-day delay that caused measurable downstream loss to the petitioner's distribution schedule.\"",
  interpretation:
    "Based on the retrieved evidence, the primary argument appears to focus on breach of contractual delivery obligations under Clause 4.2, with the resulting loss framed as a direct and foreseeable consequence of that breach.",
  citation: {
    caseName: "Meridian Traders v. Northfield Logistics",
    court: "High Court of Commercial Appeals",
    judgmentDate: "18 April 2023",
    page: 1,
    section: "¶2",
    paragraphId: "p2",
  },
  verification: {
    status: "Source Available – Verification Recommended",
    level: "available",
  },
};

export const argumentAnalysis = {
  legalIssue: "Whether the delivery delay constitutes material breach excused by force majeure",
  petitioner: {
    label: "Meridian Traders (Petitioner)",
    mainArgument:
      "The fourteen-day delay breached Clause 4.2 of the Supply Agreement and caused direct, quantifiable loss to the petitioner's distribution schedule.",
    evidence: [
      "Delivery logs showing a fourteen-day gap against the contracted window.",
      "Internal correspondence flagging the missed distribution deadline.",
    ],
    relatedCases: ["Prescott Manufacturing v. Delmar Shipping", "Kingsley Retail Group v. Amberline Transport"],
    provisions: ["Supply Agreement, Clause 4.2 (Delivery Window)"],
    counterarguments: [
      "Respondent may argue the delay was foreseeable and priced into the contract's buffer terms.",
    ],
  },
  respondent: {
    label: "Northfield Logistics (Respondent)",
    mainArgument:
      "The delay falls within the force-majeure provision at Clause 9.1 due to unforeseeable port congestion outside the respondent's control.",
    evidence: [
      "Port authority notice of an emergency regulatory closure.",
      "Shipping manifests showing the closure's effect on transit time.",
    ],
    relatedCases: ["Whitmore Supply v. Castellan Freight"],
    provisions: ["Supply Agreement, Clause 9.1 (Force Majeure)"],
    counterarguments: [
      "Petitioner may argue the respondent failed to show reasonable mitigation once the closure began.",
    ],
  },
  courtAnalysis:
    "The lower court found the force-majeure defence unsupported absent a documented mitigation effort — a standard this Court affirmed on appeal, drawing on the reasoning in Whitmore Supply v. Castellan Freight.",
};

export const conflictData = {
  legalIssue: "Interpretation of contractual liability-cap clauses",
  caseA: {
    name: "Alden Freight Co. v. Bristow Holdings",
    court: "Court of First Instance, Commercial Division",
    judgmentDate: "2 November 2021",
    interpretation:
      "Read the liability-cap clause narrowly, holding it did not extend to indirect losses arising from a shipment delay.",
    evidence:
      "\"The limitation of liability in Clause 7.3 applies only to direct losses arising from a breach of the delivery schedule, and does not extend to consequential or indirect losses.\"",
  },
  caseB: {
    name: "Harrow Textiles v. Union Freight Group",
    court: "Court of Appeals, Third Circuit (Commercial)",
    judgmentDate: "27 June 2020",
    interpretation:
      "Read a materially similar liability-cap clause broadly, extending its protection to indirect losses.",
    evidence:
      "\"Clause 6.4's limitation of liability is not restricted by its terms to direct loss, and this Court declines to read such a restriction into language the parties chose not to include.\"",
  },
  differenceFactors: [
    "Different courts — first instance vs. appellate — reaching opposite readings of similarly worded clauses.",
    "Different judgment dates, with Harrow Textiles preceding Alden Freight by roughly sixteen months.",
    "Different underlying facts: Harrow Textiles involved a manufacturing contract; Alden Freight involved freight forwarding.",
  ],
};

export const caseTimeline = [
  { year: "2019", label: "Case Filed", description: "Meridian Traders files suit alleging breach of Clause 4.2." },
  { year: "2019", label: "Initial Hearing", description: "Commercial Division sets scheduling order and discovery timeline." },
  { year: "2020", label: "Lower Court Judgment", description: "Commercial Division finds force-majeure defence unsupported." },
  { year: "2021", label: "Appeal Filed", description: "Northfield Logistics appeals to the High Court of Commercial Appeals." },
  { year: "2023", label: "Higher Court Judgment", description: "Appeal dismissed; lower court judgment affirmed." },
];

export const relatedTimeline = [
  { year: "2018", caseName: "Prescott Manufacturing v. Delmar Shipping", label: "Judgment issued" },
  { year: "2020", caseName: "Harrow Textiles v. Union Freight Group", label: "Appellate judgment issued" },
  { year: "2022", caseName: "Whitmore Supply v. Castellan Freight", label: "Judgment issued" },
  { year: "2024", caseName: "Kingsley Retail Group v. Amberline Transport", label: "Judgment issued" },
];

export const sampleCitations = [
  {
    id: "cite-1",
    caseName: "Meridian Traders v. Northfield Logistics",
    court: "High Court of Commercial Appeals",
    page: 1,
    section: "¶2",
  },
  {
    id: "cite-2",
    caseName: "Whitmore Supply v. Castellan Freight",
    court: "High Court of Commercial Appeals",
    page: 3,
    section: "¶6",
  },
];

export const recentQueries = [
  { id: "q1", text: "What mitigation standard applies before force majeure succeeds?", timeAgo: "2 hours ago" },
  { id: "q2", text: "Summarize the respondent's position on Clause 9.1.", timeAgo: "Yesterday" },
  { id: "q3", text: "Find cases similar to Meridian Traders v. Northfield Logistics.", timeAgo: "2 days ago" },
  { id: "q4", text: "Are there conflicting rulings on liability-cap interpretation?", timeAgo: "3 days ago" },
];

export const dashboardStats = [
  { label: "Documents Analyzed", value: "128", delta: "+12 this week" },
  { label: "Research Queries", value: "342", delta: "+48 this week" },
  { label: "Related Cases", value: "976", delta: "+63 this week" },
  { label: "Verified Sources", value: "294", delta: "+19 this week" },
];
