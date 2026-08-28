// Fictional / generic demo cases. Names are invented for prototype
// purposes only and do not represent real judgments.
// Step 2 replaces this module's export with a live API response of
// the same shape, so components never need to change.

export const sampleCases = [
  {
    id: "case-001",
    name: "Meridian Traders v. Northfield Logistics",
    court: "High Court of Commercial Appeals",
    year: 2023,
    judgmentDate: "2023-04-18",
    legalIssue: "Breach of contractual delivery obligations",
    summary:
      "The petitioner alleged that the respondent failed to deliver goods within the contractually specified window, causing downstream financial loss. The court examined whether a force-majeure clause excused the delay.",
    duration: "2019 – 2023",
    tags: ["Contract Law", "Commercial", "Force Majeure"],
  },
  {
    id: "case-002",
    name: "Alden Freight Co. v. Bristow Holdings",
    court: "Court of First Instance, Commercial Division",
    year: 2021,
    judgmentDate: "2021-11-02",
    legalIssue: "Interpretation of contractual liability caps",
    summary:
      "A dispute over whether a liability-limitation clause applied to indirect losses arising from a shipment delay. The lower court read the clause narrowly.",
    duration: "2020 – 2021",
    tags: ["Contract Law", "Liability", "Commercial"],
  },
  {
    id: "case-003",
    name: "Harrow Textiles v. Union Freight Group",
    court: "Court of Appeals, Third Circuit (Commercial)",
    year: 2020,
    judgmentDate: "2020-06-27",
    legalIssue: "Interpretation of contractual liability caps",
    summary:
      "On similar facts to Alden Freight, the appellate court read the same style of liability-cap clause broadly, extending it to indirect losses — a notable point of divergence from later rulings.",
    duration: "2018 – 2020",
    tags: ["Contract Law", "Liability", "Appeal"],
  },
  {
    id: "case-004",
    name: "Whitmore Supply v. Castellan Freight",
    court: "High Court of Commercial Appeals",
    year: 2022,
    judgmentDate: "2022-09-14",
    legalIssue: "Force majeure and reasonable mitigation",
    summary:
      "The court considered whether a party invoking force majeure had taken reasonable steps to mitigate resulting losses, and found the mitigation record insufficient.",
    duration: "2021 – 2022",
    tags: ["Contract Law", "Force Majeure", "Mitigation"],
  },
  {
    id: "case-005",
    name: "Prescott Manufacturing v. Delmar Shipping",
    court: "Court of First Instance, Commercial Division",
    year: 2019,
    judgmentDate: "2019-03-05",
    legalIssue: "Breach of contractual delivery obligations",
    summary:
      "An early precedent on delivery-window breaches, holding that a two-week delay without notice constituted material breach absent an express force-majeure carve-out.",
    duration: "2018 – 2019",
    tags: ["Contract Law", "Commercial"],
  },
  {
    id: "case-006",
    name: "Kingsley Retail Group v. Amberline Transport",
    court: "High Court of Commercial Appeals",
    year: 2024,
    judgmentDate: "2024-02-09",
    legalIssue: "Damages calculation for late delivery",
    summary:
      "The court set out a method for calculating consequential damages in late-delivery disputes, distinguishing recoverable loss from speculative loss.",
    duration: "2022 – 2024",
    tags: ["Contract Law", "Damages", "Commercial"],
  },
];

// Relationship graph edges relative to the "current case" shown in
// Case Explorer (case-001). Each edge carries an AI-derived
// relationship label that the UI must present as provisional.
export const caseRelationships = [
  { source: "case-001", target: "case-002", type: "Follows" },
  { source: "case-001", target: "case-003", type: "Potential Conflict" },
  { source: "case-001", target: "case-004", type: "Cites" },
  { source: "case-001", target: "case-005", type: "Similar To" },
  { source: "case-002", target: "case-003", type: "Distinguishes" },
  { source: "case-001", target: "case-006", type: "Supports" },
];

export const getCaseById = (id) => sampleCases.find((c) => c.id === id);
