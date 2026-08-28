import { useState } from "react";
import AppShell from "../components/layout/AppShell";
import DocumentUploader from "../components/document/DocumentUploader";
import DocumentViewer from "../components/document/DocumentViewer";
import AIChatPanel from "../components/research/AIChatPanel";
import DemoDataLabel from "../components/common/DemoDataLabel";
import SplitScreen from "../components/layout/SplitScreen";

export default function DocumentResearchPage() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [sourceReference, setSourceReference] = useState(null);

  const handleVerifySource = (citation) => {
    // Demo interaction: jump the document viewer to the page/paragraph
    // the AI cited. Step 3 will drive this from real highlight offsets.
    setSourceReference({ paragraphId: citation.paragraphId, page: citation.page });
  };

  return (
    <AppShell>
      <div className="flex h-[calc(100vh)] flex-col lg:h-screen">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-paper-3 px-6 py-4 lg:px-8">
          <div>
            <h1 className="font-display text-[1.3rem] font-medium tracking-tight text-ink">
              Document Research
            </h1>
            <p className="text-[12.5px] text-slate">
              Compare the original source against LegalLens's research assistant.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <DemoDataLabel />
            <DocumentUploader compact onFileAccepted={(f) => { setUploadedFile(f); setSourceReference(null); }} />
          </div>
        </div>

        {!uploadedFile && (
          <div className="border-b border-line bg-paper-2 px-6 py-4 lg:px-8">
            <DocumentUploader onFileAccepted={(f) => { setUploadedFile(f); setSourceReference(null); }} />
          </div>
        )}

        {/* Split-screen on large viewports: draggable divider, orientation
            toggle, and per-pane focus/restore. Stacks vertically below
            the lg breakpoint, where a fixed split doesn't make sense. */}
        <div className="flex-1 overflow-hidden p-4 lg:p-6">
          <div className="hidden h-full lg:block">
            <SplitScreen
              storageKey="document-research"
              leftTitle="Document"
              rightTitle="Assistant"
              left={<DocumentViewer uploadedFile={uploadedFile} sourceReference={sourceReference} />}
              right={<AIChatPanel onVerifySource={handleVerifySource} />}
            />
          </div>
          <div className="flex h-full flex-col gap-4 lg:hidden">
            <div className="min-h-[420px]">
              <DocumentViewer uploadedFile={uploadedFile} sourceReference={sourceReference} />
            </div>
            <div className="min-h-[520px]">
              <AIChatPanel onVerifySource={handleVerifySource} />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
