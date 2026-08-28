import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Columns2, Rows2, Minimize2, PanelLeftClose, PanelRightClose } from "lucide-react";

const MIN_PANE_PERCENT = 20;
const MAX_PANE_PERCENT = 80;

/**
 * Generic split-screen layout: two panes divided by a draggable resizer.
 *
 * Features:
 * - Drag (mouse/touch) or arrow-key resize of the divider
 * - Toggle between side-by-side and stacked orientation
 * - Collapse either pane to give the other the full view, or restore
 * - Ratio + orientation persisted to localStorage per `storageKey`, so a
 *   user's preferred layout survives navigation/reload.
 *
 * Usage:
 *   <SplitScreen
 *     storageKey="document-research"
 *     leftTitle="Source document"
 *     rightTitle="Research assistant"
 *     left={<DocumentViewer ... />}
 *     right={<AIChatPanel ... />}
 *   />
 */
export default function SplitScreen({
  left,
  right,
  leftTitle = "Left panel",
  rightTitle = "Right panel",
  storageKey = "split-screen",
  defaultRatio = 50,
  defaultOrientation = "horizontal", // "horizontal" = side-by-side, "vertical" = stacked
}) {
  const containerRef = useRef(null);
  const draggingRef = useRef(false);

  const [ratio, setRatio] = useState(() => {
    if (typeof window === "undefined") return defaultRatio;
    const stored = Number(window.localStorage.getItem(`${storageKey}:ratio`));
    return Number.isFinite(stored) && stored >= MIN_PANE_PERCENT && stored <= MAX_PANE_PERCENT
      ? stored
      : defaultRatio;
  });

  const [orientation, setOrientation] = useState(() => {
    if (typeof window === "undefined") return defaultOrientation;
    return window.localStorage.getItem(`${storageKey}:orientation`) || defaultOrientation;
  });

  // "left" | "right" | null — which pane (if any) is collapsed to nothing,
  // giving the other pane the full area.
  const [collapsed, setCollapsed] = useState(null);
  const isStacked = orientation === "vertical";

  useEffect(() => {
    window.localStorage.setItem(`${storageKey}:ratio`, String(ratio));
  }, [ratio, storageKey]);

  useEffect(() => {
    window.localStorage.setItem(`${storageKey}:orientation`, orientation);
  }, [orientation, storageKey]);

  const clampRatio = (value) => Math.min(MAX_PANE_PERCENT, Math.max(MIN_PANE_PERCENT, value));

  const updateRatioFromPointer = useCallback(
    (clientX, clientY) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const percent = isStacked
        ? ((clientY - rect.top) / rect.height) * 100
        : ((clientX - rect.left) / rect.width) * 100;
      setRatio(clampRatio(percent));
    },
    [isStacked]
  );

  const handlePointerMove = useCallback(
    (e) => {
      if (!draggingRef.current) return;
      const point = e.touches ? e.touches[0] : e;
      updateRatioFromPointer(point.clientX, point.clientY);
    },
    [updateRatioFromPointer]
  );

  const stopDragging = useCallback(() => {
    draggingRef.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", stopDragging);
    window.addEventListener("touchmove", handlePointerMove, { passive: false });
    window.addEventListener("touchend", stopDragging);
    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", stopDragging);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", stopDragging);
    };
  }, [handlePointerMove, stopDragging]);

  const startDragging = (e) => {
    if (collapsed) return;
    draggingRef.current = true;
    document.body.style.cursor = isStacked ? "row-resize" : "col-resize";
    document.body.style.userSelect = "none";
    e.preventDefault();
  };

  const handleDividerKeyDown = (e) => {
    const step = e.shiftKey ? 10 : 2;
    if ((!isStacked && e.key === "ArrowLeft") || (isStacked && e.key === "ArrowUp")) {
      setRatio((r) => clampRatio(r - step));
    } else if ((!isStacked && e.key === "ArrowRight") || (isStacked && e.key === "ArrowDown")) {
      setRatio((r) => clampRatio(r + step));
    } else if (e.key === "Home") {
      setRatio(MIN_PANE_PERCENT);
    } else if (e.key === "End") {
      setRatio(MAX_PANE_PERCENT);
    } else if (e.key === "Enter") {
      setRatio(defaultRatio);
    }
  };

  const toggleCollapse = (side) => {
    setCollapsed((current) => (current === side ? null : side));
  };

  const paneStyle = useMemo(() => {
    if (collapsed === "left") return { left: { flexBasis: "0%", overflow: "hidden" }, right: { flexBasis: "100%" } };
    if (collapsed === "right") return { left: { flexBasis: "100%" }, right: { flexBasis: "0%", overflow: "hidden" } };
    return { left: { flexBasis: `${ratio}%` }, right: { flexBasis: `${100 - ratio}%` } };
  }, [collapsed, ratio]);

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-end gap-1.5 px-0.5">
        <button
          type="button"
          onClick={() => toggleCollapse("right")}
          aria-pressed={collapsed === "right"}
          title={collapsed === "right" ? `Show ${rightTitle}` : `Focus ${leftTitle}`}
          className={`flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-[11.5px] font-medium transition-colors ${
            collapsed === "right" ? "bg-ink text-text-onink" : "bg-paper-3 text-slate hover:text-ink"
          }`}
        >
          <PanelRightClose size={13} />
          Focus {leftTitle}
        </button>
        <button
          type="button"
          onClick={() => toggleCollapse("left")}
          aria-pressed={collapsed === "left"}
          title={collapsed === "left" ? `Show ${leftTitle}` : `Focus ${rightTitle}`}
          className={`flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-[11.5px] font-medium transition-colors ${
            collapsed === "left" ? "bg-ink text-text-onink" : "bg-paper-3 text-slate hover:text-ink"
          }`}
        >
          <PanelLeftClose size={13} />
          Focus {rightTitle}
        </button>
        {collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(null)}
            title="Restore split view"
            className="flex items-center gap-1.5 rounded-md border border-line bg-paper-3 px-2.5 py-1.5 text-[11.5px] font-medium text-slate transition-colors hover:text-ink"
          >
            <Minimize2 size={13} />
            Restore split
          </button>
        )}
        <button
          type="button"
          onClick={() => setOrientation((o) => (o === "horizontal" ? "vertical" : "horizontal"))}
          title={isStacked ? "Switch to side-by-side" : "Switch to stacked"}
          className="flex items-center gap-1.5 rounded-md border border-line bg-paper-3 px-2.5 py-1.5 text-[11.5px] font-medium text-slate transition-colors hover:text-ink"
        >
          {isStacked ? <Columns2 size={13} /> : <Rows2 size={13} />}
          {isStacked ? "Side by side" : "Stacked"}
        </button>
      </div>

      <div
        ref={containerRef}
        className={`relative flex min-h-0 flex-1 ${isStacked ? "flex-col" : "flex-row"}`}
      >
        <div
          className="min-h-0 min-w-0 transition-[flex-basis] duration-150 ease-out"
          style={{ ...paneStyle.left, flexGrow: 0, flexShrink: 0 }}
        >
          {collapsed !== "left" && <div className="h-full w-full">{left}</div>}
        </div>

        {!collapsed && (
          <div
            role="separator"
            aria-orientation={isStacked ? "horizontal" : "vertical"}
            aria-label="Resize panels"
            aria-valuenow={Math.round(ratio)}
            aria-valuemin={MIN_PANE_PERCENT}
            aria-valuemax={MAX_PANE_PERCENT}
            tabIndex={0}
            onMouseDown={startDragging}
            onTouchStart={startDragging}
            onKeyDown={handleDividerKeyDown}
            onDoubleClick={() => setRatio(defaultRatio)}
            title="Drag to resize · double-click to reset"
            className={`group relative shrink-0 touch-none ${
              isStacked ? "h-2 w-full cursor-row-resize" : "h-full w-2 cursor-col-resize"
            } flex items-center justify-center focus:outline-none`}
          >
            <div
              className={`rounded-full bg-line transition-colors group-hover:bg-brass group-focus-visible:bg-brass ${
                isStacked ? "h-1 w-10" : "h-10 w-1"
              }`}
            />
          </div>
        )}

        <div
          className="min-h-0 min-w-0 transition-[flex-basis] duration-150 ease-out"
          style={{ ...paneStyle.right, flexGrow: 0, flexShrink: 0 }}
        >
          {collapsed !== "right" && <div className="h-full w-full">{right}</div>}
        </div>
      </div>
    </div>
  );
}
