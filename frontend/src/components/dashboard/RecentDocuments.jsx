import { FileText, Link as LinkIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ROUTES } from "../../utils/constants";

const STATUS_STYLE = {
  Processed: "bg-verified-bg text-verified",
  Processing: "bg-caution-bg text-caution",
};

export default function RecentDocuments({ documents = [], loading = false }) {
  return (
    <div className="rounded-xl border border-line bg-paper-3 shadow-panel">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <h3 className="font-display text-base font-medium text-ink">Recent Documents</h3>
        <Link to={ROUTES.RESEARCH} className="flex items-center gap-1 text-[12.5px] font-medium text-brass-dark hover:underline">
          View all <LinkIcon size={12} />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3 p-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-11 animate-pulse rounded-md bg-paper-2" />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="text-[13px] text-slate">No documents yet — upload one to get started.</p>
          <Link
            to={ROUTES.RESEARCH}
            className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-brass-dark hover:underline"
          >
            Upload a document
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {documents.map((doc, i) => (
            <motion.li
              key={doc.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
              className="flex items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-paper-2"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-paper-2 text-slate">
                <FileText size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-medium text-ink">{doc.name}</p>
                <p className="text-[12px] text-slate">{doc.court} · {doc.uploadDate}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${STATUS_STYLE[doc.status] ?? "bg-paper-2 text-slate"}`}>
                {doc.status}
              </span>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
