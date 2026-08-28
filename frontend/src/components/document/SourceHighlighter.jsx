/**
 * Wraps a paragraph of document text and visually marks it when it
 * matches the paragraph currently referenced by the AI panel.
 *
 * This is intentionally a thin, presentational component: Step 3
 * will drive `isHighlighted` from real highlight offsets returned by
 * the retrieval pipeline instead of a static paragraph id.
 */
export default function SourceHighlighter({ paragraph, isHighlighted, innerRef }) {
  return (
    <p
      ref={innerRef}
      id={`para-${paragraph.id}`}
      className={`rounded-md px-3 py-2 text-[14.5px] leading-relaxed transition-colors duration-500 ${
        isHighlighted
          ? "bg-brass-light/40 ring-1 ring-inset ring-brass"
          : "text-text-dark"
      }`}
    >
      {isHighlighted && (
        <span className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wide text-brass-dark">
          Retrieved Evidence
        </span>
      )}
      {paragraph.text}
    </p>
  );
}
