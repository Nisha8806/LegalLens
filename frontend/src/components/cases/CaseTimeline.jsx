export default function CaseTimeline({ events, relatedEvents }) {
  return (
    <div className="rounded-xl border border-line bg-paper-3 p-5 shadow-panel">
      <h3 className="font-display text-base font-medium text-ink">Case Timeline</h3>

      <ol className="relative mt-5 ml-2 space-y-6 border-l border-line pl-6">
        {events.map((event, i) => (
          <li key={i} className="relative">
            <span className="absolute -left-[29px] top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-brass bg-paper-3" />
            <p className="text-[11.5px] font-semibold tracking-wide text-brass-dark">{event.year}</p>
            <p className="mt-0.5 text-[13.5px] font-medium text-ink">{event.label}</p>
            <p className="mt-0.5 text-[12.5px] text-slate">{event.description}</p>
          </li>
        ))}
      </ol>

      <div className="mt-6 border-t border-line pt-5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate">Related Case Timeline</p>
        <ul className="mt-3 space-y-2.5">
          {relatedEvents.map((event, i) => (
            <li key={i} className="flex items-center gap-3 text-[12.5px]">
              <span className="w-10 shrink-0 font-mono text-slate-light">{event.year}</span>
              <span className="flex-1 text-ink">{event.caseName}</span>
              <span className="shrink-0 text-slate">{event.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
