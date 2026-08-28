import { MessageSquareText } from "lucide-react";

export default function RecentQueries({ queries = [] }) {
  return (
    <div className="rounded-xl border border-line bg-paper-3 shadow-panel">
      <div className="border-b border-line px-5 py-4">
        <h3 className="font-display text-base font-medium text-ink">Recent Queries</h3>
      </div>
      <ul className="divide-y divide-line">
        {queries.map((q) => (
          <li key={q.id} className="flex items-start gap-3 px-5 py-3.5">
            <MessageSquareText size={15} className="mt-0.5 shrink-0 text-slate-light" />
            <div className="min-w-0">
              <p className="text-[13.5px] leading-snug text-ink">{q.text}</p>
              <p className="mt-1 text-[11.5px] text-slate-light">{q.timeAgo}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
