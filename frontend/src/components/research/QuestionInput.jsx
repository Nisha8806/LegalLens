import { useState } from "react";
import { Mic, SendHorizontal, Loader2 } from "lucide-react";

export default function QuestionInput({ onSubmit, isLoading, suggestions = [] }) {
  const [value, setValue] = useState("");
  const [listening, setListening] = useState(false);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
    setValue("");
  };

  const handleMic = () => {
    // Voice research is wired up in a later step; the control exists
    // now so the layout and interaction affordance are already real.
    setListening((v) => !v);
    window.setTimeout(() => setListening(false), 1600);
  };

  return (
    <div className="rounded-xl border border-ink-3 bg-ink-2 p-3">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        rows={2}
        placeholder="Ask about this document or related legal cases…"
        className="w-full resize-none bg-transparent text-[13.5px] text-text-onink placeholder:text-text-onink-muted focus:outline-none"
      />
      <div className="mt-2 flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {suggestions.slice(0, 2).map((s) => (
            <button
              key={s}
              onClick={() => setValue(s)}
              className="rounded-full border border-ink-4 px-2.5 py-1 text-[11px] text-text-onink-muted transition-colors hover:border-brass hover:text-text-onink"
            >
              {s.length > 42 ? `${s.slice(0, 42)}…` : s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleMic}
            aria-label="Ask by voice"
            aria-pressed={listening}
            className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
              listening ? "bg-alert text-white" : "bg-ink-3 text-text-onink-muted hover:text-text-onink"
            }`}
          >
            <Mic size={15} />
          </button>
          <button
            onClick={submit}
            disabled={isLoading || !value.trim()}
            aria-label="Send question"
            className="flex h-8 w-8 items-center justify-center rounded-md bg-brass text-ink transition-colors hover:bg-brass-light disabled:opacity-40"
          >
            {isLoading ? <Loader2 size={15} className="animate-spin" /> : <SendHorizontal size={15} />}
          </button>
        </div>
      </div>
    </div>
  );
}
