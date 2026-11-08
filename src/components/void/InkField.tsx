import { useEffect, useRef } from "react";
import { InkEngine } from "./inkEngine";

/**
 * The living Void ink environment (see inkEngine.ts).
 *
 * - back canvas sits behind all content: floating particles + liquid ribbons/smoke
 * - front canvas sits above content but only draws faint cursor droplets/ripples
 *   (and ivory ink over dark regions such as the footer), so text, buttons,
 *   photos and screenshots are never covered.
 *
 * The engine runs only while the Void layer is active; it is torn down (loop,
 * listeners, observers) when the layer is hidden or unmounted.
 */
export function InkField({ active }: { active: boolean }) {
  const backRef = useRef<HTMLCanvasElement>(null);
  const frontRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const back = backRef.current;
    const front = frontRef.current;
    const root = back?.closest<HTMLElement>(".void-root");
    if (!active || !back || !front || !root) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let engine: InkEngine;
    try {
      engine = new InkEngine(back, front, root, { reducedMotion });
    } catch {
      return; // no 2D canvas — the page still works without the ink layer
    }
    engine.start();

    // Page height changes (reveals, images loading) move the dark regions.
    const ro = new ResizeObserver(() => engine.refreshRegions());
    ro.observe(root);

    return () => {
      ro.disconnect();
      engine.destroy();
    };
  }, [active]);

  return (
    <>
      <canvas
        ref={backRef}
        aria-hidden
        data-no-suction
        className="pointer-events-none fixed inset-0 z-[2] h-full w-full"
      />
      <canvas
        ref={frontRef}
        aria-hidden
        data-no-suction
        className="pointer-events-none fixed inset-0 z-[4] h-full w-full"
      />
    </>
  );
}
