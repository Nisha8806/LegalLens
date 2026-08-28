import { useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { FileText, FileType, ScrollText } from "lucide-react";
import DocumentToolbar from "./DocumentToolbar";
import SourceHighlighter from "./SourceHighlighter";
import { sampleDocumentBody } from "../../data/sampleDocuments";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

/**
 * Reusable document surface for both the demo document and any
 * locally-uploaded PDF/TXT file.
 *
 * Backend contract for Step 3: this component is already shaped to
 * receive `sourceReference = { paragraphId, page }` from the AI
 * panel and will scroll to / highlight that location. Real PDFs will
 * eventually receive `highlightedText` + bounding boxes instead of a
 * paragraph id — the prop is reserved below.
 */
export default function DocumentViewer({ uploadedFile, sourceReference }) {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [txtContent, setTxtContent] = useState("");
  const paragraphRefs = useRef({});
  const scrollContainerRef = useRef(null);

  const isPdf = uploadedFile?.type === "application/pdf";
  const isTxt = uploadedFile?.type === "text/plain";
  const isDemo = !uploadedFile;

  const demoDoc = sampleDocumentBody;
  const pageCount = isPdf ? numPages ?? 1 : isDemo ? demoDoc.pageCount : 1;

  useEffect(() => {
    setCurrentPage(1);
    setNumPages(null);
    setZoom(1);
    if (isTxt) {
      const reader = new FileReader();
      reader.onload = () => setTxtContent(String(reader.result ?? ""));
      reader.readAsText(uploadedFile);
    } else {
      setTxtContent("");
    }
  }, [uploadedFile, isTxt]);

  // Respond to "Verify Source": jump to the referenced page and
  // scroll the referenced paragraph into view (demo document only).
  useEffect(() => {
    if (!sourceReference || !isDemo) return;
    if (sourceReference.page) setCurrentPage(sourceReference.page);
    const el = paragraphRefs.current[sourceReference.paragraphId];
    if (el) {
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  }, [sourceReference, isDemo]);

  const visibleParagraphs = useMemo(() => {
    if (!isDemo) return [];
    return demoDoc.paragraphs.filter((p) => p.page === currentPage);
  }, [isDemo, demoDoc, currentPage]);

  const fileLabel = uploadedFile ? uploadedFile.name : `${demoDoc.title} — Judgment.pdf`;
  const fileMeta = uploadedFile
    ? `${(uploadedFile.size / 1024).toFixed(0)} KB · Uploaded locally`
    : `${demoDoc.court} · ${demoDoc.judgmentDate}`;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-line bg-paper-3 shadow-panel">
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-paper-2 text-slate">
          {isTxt ? <FileType size={16} /> : <FileText size={16} />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-medium text-ink">{fileLabel}</p>
          <p className="truncate text-[11.5px] text-slate">{fileMeta}</p>
        </div>
        {isDemo && (
          <span className="shrink-0 rounded-full bg-paper-2 px-2.5 py-1 text-[10.5px] font-medium text-slate">
            Sample Document
          </span>
        )}
      </div>

      {(isPdf || isDemo) && (
        <DocumentToolbar
          currentPage={currentPage}
          pageCount={pageCount}
          onPrevPage={() => setCurrentPage((p) => Math.max(1, p - 1))}
          onNextPage={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
          zoom={zoom}
          onZoomIn={() => setZoom((z) => Math.min(2, +(z + 0.1).toFixed(2)))}
          onZoomOut={() => setZoom((z) => Math.max(0.6, +(z - 0.1).toFixed(2)))}
        />
      )}

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto paper-texture bg-paper-2/40 p-5">
        {isPdf && (
          <div className="flex justify-center">
            <Document
              file={uploadedFile}
              onLoadSuccess={({ numPages: n }) => setNumPages(n)}
              loading={<p className="py-10 text-sm text-slate">Loading PDF…</p>}
              error={<p className="py-10 text-sm text-alert">Couldn't render this PDF.</p>}
            >
              <Page pageNumber={currentPage} scale={zoom} className="shadow-panel" />
            </Document>
          </div>
        )}

        {isTxt && (
          <div className="mx-auto max-w-2xl rounded-lg bg-paper-3 p-6 shadow-panel">
            <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate">
              <ScrollText size={13} /> Plain Text Document
            </div>
            <pre className="whitespace-pre-wrap font-body text-[13.5px] leading-relaxed text-text-dark">
              {txtContent || "Reading file…"}
            </pre>
          </div>
        )}

        {isDemo && (
          <div className="mx-auto max-w-2xl space-y-3 rounded-lg bg-paper-3 p-6 shadow-panel">
            <div className="mb-1 border-b border-line pb-3">
              <p className="font-display text-base font-medium text-ink">{demoDoc.title}</p>
              <p className="text-[12px] text-slate">{demoDoc.court} · {demoDoc.judgmentDate}</p>
            </div>
            {visibleParagraphs.map((paragraph) => (
              <SourceHighlighter
                key={paragraph.id}
                paragraph={paragraph}
                isHighlighted={sourceReference?.paragraphId === paragraph.id}
                innerRef={(el) => (paragraphRefs.current[paragraph.id] = el)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
