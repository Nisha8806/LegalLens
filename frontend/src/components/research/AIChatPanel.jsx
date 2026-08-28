import { useState } from "react";
import { Bot } from "lucide-react";
import QuestionInput from "./QuestionInput";
import EvidenceCard from "./EvidenceCard";
import InterpretationCard from "./InterpretationCard";
import CitationCard from "./CitationCard";
import VerificationCard from "./VerificationCard";
import { askQuestion } from "../../services/api";
import { sampleAiResponse, sampleQueries } from "../../data/sampleResearchData";

export default function AIChatPanel({ onVerifySource }) {
  const [exchanges, setExchanges] = useState([sampleAiResponse]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAsk = async (question) => {
    setIsLoading(true);
    try {
      const response = await askQuestion(question);
      setExchanges((prev) => [{ ...response, question }, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-ink-3 bg-ink shadow-panel-lg">
      <div className="border-b border-ink-3 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-ink-3 text-brass-light">
            <Bot size={16} />
          </span>
          <div>
            <h2 className="font-display text-base font-medium text-text-onink">Ask LegalLens</h2>
            <p className="text-[11.5px] text-text-onink-muted">
              Ask questions about this document or related legal cases.
            </p>
          </div>
        </div>
      </div>

      <div className="dark-scroll flex-1 space-y-5 overflow-y-auto px-5 py-5">
        {exchanges.map((ex, i) => (
          <div key={i} className="space-y-3">
            {ex.question && (
              <div className="ml-auto max-w-[85%] rounded-lg rounded-tr-sm bg-ink-3 px-3.5 py-2.5">
                <p className="text-[13px] text-text-onink">{ex.question}</p>
              </div>
            )}

            <div className="rounded-lg border border-ink-4 bg-ink-3/60 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-brass-light">AI Answer</p>
              <p className="mt-1.5 text-[14px] leading-relaxed text-text-onink">{ex.answer}</p>
            </div>

            <EvidenceCard text={ex.evidence} />
            <InterpretationCard text={ex.interpretation} />
            <CitationCard citation={ex.citation} />
            <VerificationCard
              status={ex.verification.status}
              onVerify={() => onVerifySource?.(ex.citation)}
            />
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-[12.5px] text-text-onink-muted">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brass" />
            LegalLens is researching…
          </div>
        )}
      </div>

      <div className="border-t border-ink-3 p-4">
        <QuestionInput onSubmit={handleAsk} isLoading={isLoading} suggestions={sampleQueries} />
      </div>
    </div>
  );
}
