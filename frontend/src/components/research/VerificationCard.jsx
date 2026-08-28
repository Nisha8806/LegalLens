import { AlertTriangle, ScanSearch } from "lucide-react";
import VerificationBadge from "../common/VerificationBadge";

export default function VerificationCard({ status, onVerify }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-brass/40 bg-ink-2 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <AlertTriangle size={14} className="shrink-0 text-caution" />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-text-onink-muted">
            ⚠ Verification Recommended
          </p>
          <div className="mt-1.5">
            <VerificationBadge level="available" label={status} size="sm" />
          </div>
        </div>
      </div>
      <button
        onClick={onVerify}
        className="flex shrink-0 items-center justify-center gap-2 rounded-md bg-brass px-4 py-2.5 text-[13px] font-semibold text-ink transition-colors hover:bg-brass-light"
      >
        <ScanSearch size={15} />
        Verify Source
      </button>
    </div>
  );
}
