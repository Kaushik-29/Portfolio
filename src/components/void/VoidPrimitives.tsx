import {
  motion,
  useInView,
  useScroll,
  useSpring,
  useTransform,
  type HTMLMotionProps,
} from "framer-motion";
import { useEffect, useRef, type ReactNode, type RefObject } from "react";

/** Fade-and-rise section reveal. MotionConfig(reducedMotion="user") disables the motion. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  ...rest
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
} & HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Hand-drawn ink stroke used under headings. */
export function InkStroke({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 18" className={className} aria-hidden preserveAspectRatio="none">
      <path
        d="M2 11 C 30 4, 60 14, 95 8 S 160 3, 200 9 S 232 12, 238 6 L 236 10 C 210 16, 170 12, 130 14 S 50 17, 4 14 Z"
        fill="#080909"
      />
    </svg>
  );
}

export function VoidSectionHeading({
  eyebrow,
  title,
  index,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  index: string;
  align?: "left" | "center";
}) {
  const center = align === "center";
  return (
    <Reveal className={`mb-12 md:mb-16 ${center ? "text-center" : ""}`}>
      <p
        className={`flex items-center gap-3 font-void-ui text-[11px] font-medium uppercase tracking-[0.4em] text-void-ink ${center ? "justify-center" : ""}`}
      >
        <span aria-hidden className="text-void-ash">
          {index}
        </span>
        <span aria-hidden className="h-px w-10 bg-void-ink" />
        {eyebrow}
      </p>
      <h2 className="mt-4 font-void-display text-[2.6rem] leading-[1.02] text-void-ink sm:text-6xl lg:text-7xl">
        {title}
      </h2>
      <InkStroke className={`mt-3 h-3 w-40 md:w-52 ${center ? "mx-auto" : ""}`} />
    </Reveal>
  );
}

/** Circular Void energy — concentric broken rings, slowly rotating. */
export function VoidEnergy({ className = "", size = 420 }: { className?: string; size?: number }) {
  return (
    <svg viewBox="0 0 400 400" width={size} height={size} className={className} aria-hidden>
      <defs>
        <radialGradient id="void-energy-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#080909" />
          <stop offset="55%" stopColor="#080909" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#080909" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g className="void-spin">
        <circle
          cx="200"
          cy="200"
          r="186"
          fill="none"
          stroke="#080909"
          strokeWidth="1"
          strokeDasharray="2 10"
        />
        <circle
          cx="200"
          cy="200"
          r="160"
          fill="none"
          stroke="#77756F"
          strokeWidth="1.5"
          strokeDasharray="80 30 12 30"
        />
      </g>
      <g className="void-spin-rev">
        <circle
          cx="200"
          cy="200"
          r="132"
          fill="none"
          stroke="#080909"
          strokeWidth="3"
          strokeDasharray="140 60 20 40"
          strokeLinecap="round"
        />
        <circle cx="200" cy="200" r="112" fill="none" stroke="#C9C3B8" strokeWidth="1" />
      </g>
      <circle cx="200" cy="200" r="92" fill="url(#void-energy-core)" />
      <circle cx="200" cy="200" r="46" fill="#080909" />
    </svg>
  );
}

/** Layered flowing ink waves used at section edges. */
export function InkWaves({ className = "", flip = false }: { className?: string; flip?: boolean }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 overflow-hidden ${className}`}
      style={flip ? { transform: "scaleY(-1)" } : undefined}
    >
      <svg
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-[106%] -left-[3%]"
      >
        <g className="void-wave-alt">
          <path
            d="M0 210 C 180 150, 330 250, 520 200 S 860 120, 1040 190 S 1320 260, 1440 180 L 1440 320 L 0 320 Z"
            fill="#77756F"
            opacity="0.35"
          />
        </g>
        <g className="void-wave">
          <path
            d="M0 250 C 160 200, 300 280, 470 240 S 760 170, 960 230 S 1260 300, 1440 220 L 1440 320 L 0 320 Z"
            fill="#080909"
            opacity="0.85"
          />
          <path
            d="M0 280 C 220 250, 380 310, 620 275 S 1000 240, 1180 285 S 1380 300, 1440 270 L 1440 320 L 0 320 Z"
            fill="#080909"
          />
        </g>
        <g fill="none" stroke="#EAE6DC" strokeLinecap="round" opacity="0.5">
          <path
            className="void-tendril"
            d="M40 286 C 260 250, 420 300, 640 268 S 1040 236, 1400 262"
            strokeWidth="1.2"
          />
          <path
            className="void-tendril"
            style={{ animationDelay: "-6s" }}
            d="M120 300 C 340 280, 560 312, 780 290 S 1180 270, 1420 296"
            strokeWidth="0.8"
          />
        </g>
      </svg>
    </div>
  );
}

/** Smoke-like tendrils for corners and edges. */
export function Tendrils({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      aria-hidden
      data-corruptible
      fill="none"
      strokeLinecap="round"
    >
      <path
        className="void-tendril"
        d="M380 20 C 300 60, 340 140, 260 170 S 160 160, 120 240 S 60 360, 10 390"
        stroke="#080909"
        strokeWidth="2.2"
      />
      <path
        className="void-tendril"
        style={{ animationDelay: "-4s" }}
        d="M390 80 C 320 110, 330 190, 270 220 S 190 230, 150 300"
        stroke="#080909"
        strokeWidth="1.2"
        opacity="0.7"
      />
      <path
        className="void-tendril"
        style={{ animationDelay: "-9s" }}
        d="M360 0 C 330 70, 250 70, 230 130 S 230 220, 170 250"
        stroke="#77756F"
        strokeWidth="1"
      />
    </svg>
  );
}

export function Monogram({ text }: { text: string }) {
  return (
    <span
      aria-hidden
      className="grid h-full w-full place-items-center font-void-display text-xl text-void-ink"
    >
      {text}
    </span>
  );
}

/* ═══════════════════ Living Void — shared building blocks ═══════════════════ */

/** Marks an element `data-paused` while it is off-screen so its CSS animations idle. */
export function usePauseOffscreen<T extends Element>(ref: RefObject<T | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.removeAttribute("data-paused");
        else el.setAttribute("data-paused", "");
      },
      { rootMargin: "120px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
}

/** Pointer handler that feeds the `.void-bleed` cursor position (no React state). */
export function inkBleedHandler(e: React.PointerEvent<HTMLElement>) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--bx", `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
  el.style.setProperty("--by", `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
}

/** Flowing brush-stroke ink ribbons. */
export function InkRibbons({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 520 260" aria-hidden data-corruptible className={className} fill="#080909">
      <g className="void-wave">
        <path d="M0 150 C 90 90, 170 210, 270 150 S 430 60, 520 110 L 520 132 C 440 92, 360 170, 270 182 S 100 150, 0 196 Z" />
        <path
          opacity="0.75"
          d="M20 200 C 120 160, 200 240, 300 196 S 450 140, 520 170 L 520 180 C 450 160, 380 222, 300 222 S 130 200, 20 214 Z"
        />
      </g>
      <g className="void-wave-alt" opacity="0.55">
        <path d="M40 112 C 140 60, 220 150, 320 104 S 470 40, 520 64 L 520 72 C 470 56, 400 120, 320 128 S 150 96, 40 124 Z" />
      </g>
      <g fill="none" stroke="#080909" strokeLinecap="round">
        <path
          className="void-tendril"
          d="M10 236 C 140 200, 240 250, 360 214 S 480 186, 516 196"
          strokeWidth="1.4"
        />
        <path
          className="void-tendril"
          style={{ animationDelay: "-7s" }}
          d="M60 84 C 160 40, 260 110, 380 70 S 480 30, 516 40"
          strokeWidth="1"
        />
      </g>
    </svg>
  );
}

/**
 * Timeline rail: a faint guide line, an ink line that draws with scroll, and an
 * ink drop riding the tip. Position it with `className` (e.g. "left-[11px]").
 */
export function TimelineRail({
  target,
  className = "",
}: {
  target: RefObject<HTMLElement | null>;
  className?: string;
}) {
  const { scrollYProgress } = useScroll({ target, offset: ["start 75%", "end 55%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 110, damping: 28, restDelta: 0.001 });
  const top = useTransform(progress, (v) => `${(v * 100).toFixed(2)}%`);
  const dropOpacity = useTransform(progress, [0, 0.02, 0.98, 1], [0, 1, 1, 0]);
  return (
    <div aria-hidden className={`pointer-events-none absolute bottom-2 top-2 w-[3px] ${className}`}>
      <span className="absolute inset-y-0 left-[1px] w-px bg-void-ash/50" />
      <motion.span
        style={{ scaleY: progress }}
        className="absolute inset-0 origin-top rounded-full bg-void-ink"
      />
      <motion.span
        style={{ top, opacity: dropOpacity }}
        className="absolute left-1/2 h-4 w-3 -translate-x-1/2 -translate-y-1/2 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-void-ink shadow-[0_0_0_4px_rgba(234,230,220,0.9),0_0_14px_4px_rgba(8,9,9,0.35)]"
      />
    </div>
  );
}

/** Timeline node that fills with ink (and ripples once) when the scroll passes it. */
export function TimelineNode({
  shape = "circle",
  className = "",
}: {
  shape?: "circle" | "diamond";
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const active = useInView(ref, { margin: "0px 0px -42% 0px" });
  const round = shape === "circle" ? "rounded-full" : "rotate-45";
  return (
    <span ref={ref} aria-hidden className={`absolute grid place-items-center ${className}`}>
      <motion.span
        className={`absolute inset-0 border-2 border-void-ink ${round}`}
        animate={{ scale: active ? [1, 1.9] : 1, opacity: active ? [0.6, 0] : 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      />
      <span className={`absolute inset-0 border-2 border-void-ink bg-void-ivory ${round}`} />
      <motion.span
        className={`relative h-[55%] w-[55%] bg-void-ink ${round}`}
        animate={{ scale: active ? 1 : 0.25, opacity: active ? 1 : 0.35 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
      />
    </span>
  );
}

/* ── Irregular ink frame ─────────────────────────────────────────────────── */

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Rough, brush-edged rectangle in a 100x100 box (deterministic). */
function roughRect(seed: number, inset: number, amp: number) {
  const r = seeded(seed);
  const pts: [number, number][] = [];
  const a = inset;
  const b = 100 - inset;
  const steps = 9;
  const j = () => (r() - 0.5) * 2 * amp;
  for (let i = 0; i < steps; i++) pts.push([a + ((b - a) * i) / steps, a + j()]);
  for (let i = 0; i < steps; i++) pts.push([b + j(), a + ((b - a) * i) / steps]);
  for (let i = 0; i < steps; i++) pts.push([b - ((b - a) * i) / steps, b + j()]);
  for (let i = 0; i < steps; i++) pts.push([a + j(), b - ((b - a) * i) / steps]);
  // Catmull-Rom -> cubic Bezier so the edge reads as a brush, not a zigzag.
  const n = pts.length;
  const f = (v: number) => v.toFixed(2);
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return `${d} Z`;
}

const MASK_PATH = roughRect(3, 2.4, 1.3);
const FRAME_PATH_A = roughRect(5, 1.2, 1.1);
const FRAME_PATH_B = roughRect(8, 3.8, 0.8);
const MASK_URI = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="${MASK_PATH}" fill="#fff"/></svg>`,
)}")`;

/** Photo masked by a ragged ink edge, with a brush frame that draws itself in view. */
export function InkFramedImage({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const draw = {
    initial: { pathLength: 0, opacity: 0 },
    whileInView: { pathLength: 1, opacity: 1 },
    viewport: { once: true, margin: "-80px" },
  };
  return (
    <div className={`relative ${className}`}>
      <div
        className="relative"
        style={{
          WebkitMaskImage: MASK_URI,
          maskImage: MASK_URI,
          WebkitMaskSize: "100% 100%",
          maskSize: "100% 100%",
        }}
      >
        {children}
      </div>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
        className="pointer-events-none absolute -inset-3 h-[calc(100%+1.5rem)] w-[calc(100%+1.5rem)] overflow-visible"
        fill="none"
        stroke="#080909"
        strokeLinejoin="round"
      >
        <motion.path
          d={FRAME_PATH_A}
          strokeWidth={4.5}
          vectorEffect="non-scaling-stroke"
          {...draw}
          transition={{ duration: 2.2, ease: [0.65, 0, 0.35, 1] }}
        />
        <motion.path
          d={FRAME_PATH_B}
          strokeWidth={1.4}
          vectorEffect="non-scaling-stroke"
          {...draw}
          transition={{ duration: 2.6, delay: 0.3, ease: [0.65, 0, 0.35, 1] }}
        />
      </svg>
      {/* Ink splatter at two corners */}
      <svg
        viewBox="0 0 100 100"
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24"
        fill="#080909"
      >
        <circle cx="30" cy="70" r="6" />
        <circle cx="48" cy="52" r="3" />
        <circle cx="62" cy="38" r="1.8" />
        <circle cx="70" cy="62" r="2.4" />
        <ellipse cx="22" cy="48" rx="4" ry="1.6" transform="rotate(-35 22 48)" />
      </svg>
      <svg
        viewBox="0 0 100 100"
        aria-hidden
        className="pointer-events-none absolute -bottom-7 -left-7 h-20 w-20"
        fill="#080909"
      >
        <circle cx="64" cy="34" r="5" />
        <circle cx="44" cy="50" r="2.4" />
        <circle cx="30" cy="66" r="1.6" />
        <ellipse cx="74" cy="56" rx="3.6" ry="1.4" transform="rotate(25 74 56)" />
      </svg>
    </div>
  );
}
