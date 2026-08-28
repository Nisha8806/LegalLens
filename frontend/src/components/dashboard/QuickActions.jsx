import { Link } from "react-router-dom";
import { UploadCloud, FileSearch, Network, NotebookPen } from "lucide-react";
import { ROUTES } from "../../utils/constants";

const ACTIONS = [
  { label: "Upload New Document", icon: UploadCloud, to: ROUTES.RESEARCH },
  { label: "Start Research", icon: FileSearch, to: ROUTES.RESEARCH },
  { label: "Explore Cases", icon: Network, to: ROUTES.CASE_EXPLORER },
  { label: "Create Research Brief", icon: NotebookPen, to: ROUTES.BRIEF },
];

export default function QuickActions() {
  return (
    <div className="rounded-xl border border-line bg-paper-3 p-5 shadow-panel">
      <h3 className="font-display text-base font-medium text-ink">Quick Actions</h3>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {ACTIONS.map((action) => (
          <Link
            key={action.label}
            to={action.to}
            className="group flex flex-col gap-3 rounded-lg border border-line bg-paper-2 p-3.5 transition-colors hover:border-brass hover:bg-paper-3"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-paper-3 text-ink group-hover:text-brass-dark">
              <action.icon size={16} />
            </span>
            <span className="text-[13px] font-medium leading-snug text-ink">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
