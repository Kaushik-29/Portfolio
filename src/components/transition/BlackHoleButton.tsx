import { useId } from "react";
import { usePortfolioTransition } from "./TransitionCoordinator";

/**
 * Small circular black hole that toggles the Void theme.
 * No visible text inside; label + tooltip are provided for accessibility.
 */
export function BlackHoleButton({ className = "" }: { className?: string }) {
  const { mode, busy, toggle } = usePortfolioTransition();
  const tipId = useId();
  return (
    <span className={`bh-wrap ${className}`}>
      <button
        type="button"
        data-blackhole
        className="bh-btn"
        aria-label="Toggle Void Theme"
        aria-describedby={tipId}
        aria-pressed={mode === "void"}
        disabled={busy}
        onClick={(e) => toggle(e.currentTarget)}
      >
        <span className="bh-lens" aria-hidden />
        <span className="bh-ring" aria-hidden />
        <span className="bh-orbit o1" aria-hidden />
        <span className="bh-orbit o2" aria-hidden />
        <span className="bh-orbit o3" aria-hidden />
        <span className="bh-core" aria-hidden />
      </button>
      <span id={tipId} role="tooltip" className="bh-tip">
        Toggle Void Theme
      </span>
    </span>
  );
}
