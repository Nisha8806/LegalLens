import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

export default function DocumentToolbar({
  currentPage,
  pageCount,
  onPrevPage,
  onNextPage,
  zoom,
  onZoomIn,
  onZoomOut,
}) {
  return (
    <div className="flex items-center justify-between border-b border-line bg-paper-2 px-4 py-2">
      <div className="flex items-center gap-1">
        <button
          onClick={onPrevPage}
          disabled={currentPage <= 1}
          aria-label="Previous page"
          className="rounded-md p-1.5 text-slate hover:bg-paper-3 hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="min-w-[70px] text-center text-[12.5px] font-medium text-ink">
          Page {currentPage} of {pageCount}
        </span>
        <button
          onClick={onNextPage}
          disabled={currentPage >= pageCount}
          aria-label="Next page"
          className="rounded-md p-1.5 text-slate hover:bg-paper-3 hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onZoomOut}
          aria-label="Zoom out"
          className="rounded-md p-1.5 text-slate hover:bg-paper-3 hover:text-ink"
        >
          <ZoomOut size={15} />
        </button>
        <span className="min-w-[42px] text-center text-[12px] text-slate">{Math.round(zoom * 100)}%</span>
        <button
          onClick={onZoomIn}
          aria-label="Zoom in"
          className="rounded-md p-1.5 text-slate hover:bg-paper-3 hover:text-ink"
        >
          <ZoomIn size={15} />
        </button>
      </div>
    </div>
  );
}
