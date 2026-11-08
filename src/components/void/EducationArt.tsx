import { useEffect, useId, useRef } from "react";
import { VOID_EDUCATION_ART } from "./assets";

/**
 * Education artwork with living ink tendrils.
 *
 * The painted tendrils are part of the image, so a second copy of the image is
 * drawn on top through an SVG displacement filter whose noise field drifts
 * slowly (one rAF loop, attribute writes only — no React re-renders). That copy
 * is masked to the sky and tendril areas, so the figure and the rocks stay
 * perfectly still while the ink around them flows.
 *
 * The flow runs only while the artwork is on screen, the tab is visible and
 * motion is allowed (~30 fps; the noise field is small on phones). Otherwise the
 * still image shows.
 */

/** Where the ink may flow (1 = flowing). The figure (left-centre) and the rock
 *  shelf (bottom-left) are left out so they never warp. */
const FLOW_MASK = [
  // left tendrils, above the cape
  "radial-gradient(ellipse 20% 34% at 9% 26%, #000 55%, transparent 100%)",
  // black hole halo and the tendrils sweeping across the top
  "radial-gradient(ellipse 36% 26% at 44% 16%, #000 50%, transparent 100%)",
  // top-right and right-edge tendrils
  "radial-gradient(ellipse 26% 30% at 92% 14%, #000 55%, transparent 100%)",
  // tendrils trailing off the right of the cape
  "radial-gradient(ellipse 14% 26% at 44% 52%, #000 50%, transparent 100%)",
  // bottom-right tendrils over the far ridge
  "radial-gradient(ellipse 30% 18% at 88% 88%, #000 55%, transparent 100%)",
  // left-low tendrils beside the cape hem
  "radial-gradient(ellipse 14% 12% at 6% 76%, #000 50%, transparent 100%)",
].join(", ");

export function EducationArt({ className = "" }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  const filterId = `void-edu-flow-${id}`;
  const hostRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef<SVGFEOffsetElement>(null);
  const dispRef = useRef<SVGFEDisplacementMapElement>(null);
  const flowRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const offset = offsetRef.current;
    const disp = dispRef.current;
    const flow = flowRef.current;
    if (!host || !offset || !disp || !flow) return;

    const allowed = window.matchMedia("(prefers-reduced-motion: no-preference)");
    let raf = 0;
    let visible = false;
    const t0 = performance.now();
    let last = 0;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (now - last < 33) return; // ~30 fps is plenty for slow ink, and halves the filter cost
      last = now;
      const t = (now - t0) / 1000;
      // Two incommensurate drifts so the motion never visibly repeats.
      const dx = 26 * Math.sin(t * 0.21) + 14 * Math.sin(t * 0.53 + 1.7);
      const dy = 22 * Math.cos(t * 0.17) + 12 * Math.sin(t * 0.41 + 0.6);
      offset.setAttribute("dx", dx.toFixed(2));
      offset.setAttribute("dy", dy.toFixed(2));
      disp.setAttribute("scale", (16 + 5 * Math.sin(t * 0.33)).toFixed(2));
    };

    const sync = () => {
      const run = visible && allowed.matches && !document.hidden;
      flow.style.display = allowed.matches ? "" : "none";
      if (run && !raf) {
        raf = requestAnimationFrame(frame);
      } else if (!run && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        sync();
      },
      { rootMargin: "100px 0px" },
    );
    io.observe(host);
    allowed.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    sync();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      allowed.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return (
    <div ref={hostRef} data-glitch-auto className={`relative overflow-hidden ${className}`}>
      <svg width="0" height="0" className="absolute" aria-hidden focusable="false">
        <filter
          id={filterId}
          x="-6%"
          y="-6%"
          width="112%"
          height="112%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.006 0.011"
            numOctaves="2"
            seed="7"
            result="noise"
          />
          <feOffset ref={offsetRef} in="noise" dx="0" dy="0" result="drift" />
          <feDisplacementMap
            ref={dispRef}
            in="SourceGraphic"
            in2="drift"
            scale="16"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
      <img
        src={VOID_EDUCATION_ART.src}
        srcSet={`${VOID_EDUCATION_ART.small} 860w, ${VOID_EDUCATION_ART.src} 1433w`}
        sizes="(max-width: 1023px) 100vw, 80vw"
        alt={VOID_EDUCATION_ART.alt}
        width={VOID_EDUCATION_ART.width}
        height={VOID_EDUCATION_ART.height}
        loading="lazy"
        decoding="async"
        className="void-glitch-src block h-full w-full object-contain object-left"
      />
      {/* Flowing copy: same image, warped, masked to the ink areas only */}
      <img
        ref={flowRef}
        src={VOID_EDUCATION_ART.src}
        srcSet={`${VOID_EDUCATION_ART.small} 860w, ${VOID_EDUCATION_ART.src} 1433w`}
        sizes="(max-width: 1023px) 100vw, 80vw"
        alt=""
        aria-hidden
        loading="lazy"
        decoding="async"
        className="pointer-events-none absolute inset-0 h-full w-full object-contain object-left"
        style={{
          filter: `url(#${filterId})`,
          WebkitMaskImage: FLOW_MASK,
          maskImage: FLOW_MASK,
        }}
      />
    </div>
  );
}
