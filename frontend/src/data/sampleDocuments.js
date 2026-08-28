// Demo documents shown on the dashboard and used as the default
// document in the Research page before a lawyer uploads their own file.

export const sampleDocuments = [
  {
    id: "doc-001",
    name: "Meridian Traders v. Northfield Logistics — Judgment.pdf",
    court: "High Court of Commercial Appeals",
    uploadDate: "2026-08-21",
    status: "Processed",
  },
  {
    id: "doc-002",
    name: "Alden Freight Co. v. Bristow Holdings — Judgment.pdf",
    court: "Court of First Instance, Commercial Division",
    uploadDate: "2026-08-19",
    status: "Processed",
  },
  {
    id: "doc-003",
    name: "Whitmore Supply v. Castellan Freight — Notes.txt",
    court: "High Court of Commercial Appeals",
    uploadDate: "2026-08-15",
    status: "Processing",
  },
  {
    id: "doc-004",
    name: "Prescott Manufacturing v. Delmar Shipping — Judgment.pdf",
    court: "Court of First Instance, Commercial Division",
    uploadDate: "2026-08-11",
    status: "Processed",
  },
];

// Default demo document body shown in the Document Viewer's left
// panel until the lawyer uploads a real PDF/TXT file. Written as
// paragraph objects so the viewer can address / highlight a single
// paragraph by id — the same shape a future backend would send.
export const sampleDocumentBody = {
  id: "doc-001",
  title: "Meridian Traders v. Northfield Logistics",
  court: "High Court of Commercial Appeals",
  judgmentDate: "18 April 2023",
  pageCount: 4,
  paragraphs: [
    {
      id: "p1",
      page: 1,
      text:
        "This matter comes before the Court on appeal from the judgment of the Commercial Division, in which the petitioner, Meridian Traders, alleged that the respondent, Northfield Logistics, failed to deliver the contracted goods within the window specified under Clause 4.2 of the Supply Agreement dated 3 January 2019.",
    },
    {
      id: "p2",
      page: 1,
      text:
        "The petitioner submitted that the respondent had failed to fulfil the obligations specified under the agreement, resulting in a fourteen-day delay that caused measurable downstream loss to the petitioner's distribution schedule.",
    },
    {
      id: "p3",
      page: 2,
      text:
        "The respondent contended that the delay fell within the scope of the force-majeure provision at Clause 9.1, citing port congestion arising from an unforeseeable regulatory closure that was outside its reasonable control.",
    },
    {
      id: "p4",
      page: 2,
      text:
        "The Court below found that the respondent had not adequately documented efforts to mitigate the delay, and that reliance on Clause 9.1 alone, absent a showing of reasonable mitigation, was insufficient to excuse performance.",
    },
    {
      id: "p5",
      page: 3,
      text:
        "On appeal, this Court considered whether the standard applied below — requiring an affirmative showing of mitigation before a force-majeure defence may succeed — was consistent with prior authority in this jurisdiction.",
    },
    {
      id: "p6",
      page: 3,
      text:
        "The Court holds that a party invoking force majeure bears the burden of demonstrating that it took commercially reasonable steps to mitigate the resulting loss, consistent with the reasoning in Whitmore Supply v. Castellan Freight (2022).",
    },
    {
      id: "p7",
      page: 4,
      text:
        "For the foregoing reasons, the appeal is dismissed and the judgment of the Commercial Division is affirmed. Costs are awarded to the respondent-appellee.",
    },
  ],
};
