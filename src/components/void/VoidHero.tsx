import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowDownToLine, ArrowUpRight, Mail } from "lucide-react";
import { about, profile } from "@/content/portfolio";
import { useTypewriter } from "@/hooks/use-typewriter";
import { VOID_CHARACTER } from "./assets";
import { InkRibbons, InkWaves, Tendrils, usePauseOffscreen } from "./VoidPrimitives";

const heroStats = [about.stats[3], about.stats[0], about.stats[1]];

function formatStat(s: { value: number; decimals?: number }) {
  return s.decimals ? s.value.toFixed(s.decimals) : `${s.value}+`;
}

/**
 * Writes --mx / --my (cursor, -1..1) and --sy (scroll progress 0..1) on the
 * section so CSS can drive parallax without React re-renders.
 */
function useMotionVars(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let mx = 0;
    let my = 0;
    const flush = () => {
      raf = 0;
      const sy = Math.min(1, Math.max(0, window.scrollY / (el.offsetHeight || 1)));
      el.style.setProperty("--mx", mx.toFixed(3));
      el.style.setProperty("--my", my.toFixed(3));
      el.style.setProperty("--sy", sy.toFixed(3));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(flush);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mx = (e.clientX / window.innerWidth) * 2 - 1;
      my = (e.clientY / window.innerHeight) * 2 - 1;
      schedule();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true });
    schedule();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", schedule);
    };
  }, [ref]);
}

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export function VoidHero() {
  const ref = useRef<HTMLElement>(null);
  useMotionVars(ref);
  usePauseOffscreen(ref);
  const typed = useTypewriter(profile.typewriterWords);

  return (
    <section
      ref={ref}
      id="void-home"
      aria-label="Introduction"
      className="relative flex min-h-[100svh] flex-col overflow-hidden md:block"
      style={{ ["--mx" as string]: 0, ["--my" as string]: 0, ["--sy" as string]: 0 }}
    >
      {/* ── Character ─────────────────────────────────────────────── */}
      <div className="void-hero-mask relative h-[46svh] min-h-[300px] w-full md:absolute md:inset-y-0 md:right-0 md:h-auto md:w-[80%] lg:w-[64%] xl:w-[62%]">
        <div
          className="absolute inset-[-3%] will-change-transform"
          style={{
            transform:
              "translate3d(calc(var(--mx) * -14px), calc(var(--my) * -10px + var(--sy) * 70px), 0) scale(calc(1 + var(--sy) * 0.06))",
          }}
        >
          <motion.div
            className="void-breathe relative h-full w-full"
            data-glitch-auto
            data-glitch-safe="0.45"
            initial={{ clipPath: "inset(0% 0% 0% 100%)", opacity: 0.4 }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)", opacity: 1 }}
            transition={{ duration: 1.6, delay: 0.1, ease: [0.7, 0, 0.2, 1] }}
          >
            <img
              src={VOID_CHARACTER.src}
              alt={VOID_CHARACTER.alt}
              width={VOID_CHARACTER.width}
              height={VOID_CHARACTER.height}
              fetchPriority="high"
              decoding="async"
              className="void-glitch-src h-full w-full object-cover object-[42%_18%] md:object-[30%_22%]"
            />
          </motion.div>
        </div>

        {/* Smoke plumes rolling off the cloak (transform/opacity only) */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <span className="void-smoke bottom-[-12%] right-[-8%] h-[60%] w-[70%]" />
          <span
            className="void-smoke alt bottom-[4%] left-[18%] hidden h-[42%] w-[48%] md:block"
            style={{ animationDelay: "-6s" }}
          />
          <span
            className="void-smoke right-[2%] top-[30%] hidden h-[36%] w-[30%] opacity-70 md:block"
            style={{ animationDelay: "-11s" }}
          />
        </div>
      </div>

      <Tendrils className="pointer-events-none absolute right-0 top-10 hidden h-[60vh] w-[34vw] opacity-60 lg:block" />
      <InkRibbons className="pointer-events-none absolute bottom-[10%] right-[-6%] hidden w-[46vw] max-w-[760px] -scale-x-100 opacity-90 md:block" />
      <InkRibbons className="pointer-events-none absolute bottom-[4%] left-[44%] hidden w-[24vw] max-w-[400px] rotate-[-6deg] opacity-60 xl:block" />
      {/* Ivory mist that dissolves the artwork's left edge into the page */}
      <span
        aria-hidden
        className="void-mist left-[22%] top-[18%] hidden h-[70%] w-[22%] lg:block xl:left-[26%]"
      />

      {/* Ivory veil so text stays readable over the artwork on tablet */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 hidden w-[72%] md:block lg:w-[56%] xl:hidden"
        style={{
          background:
            "linear-gradient(90deg, #EAE6DC 0%, rgba(234,230,220,0.92) 50%, rgba(234,230,220,0) 100%)",
        }}
      />

      {/* ── Introduction ─────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 pb-28 sm:px-8 md:flex md:min-h-[100svh] md:items-center md:pb-24 md:pt-24 lg:px-12">
        <div className="-mt-10 max-w-[34rem] md:mt-0 md:max-w-[26rem] lg:max-w-[30rem] xl:max-w-[36rem]">
          <motion.p
            {...rise(0.15)}
            className="font-void-ui text-[12px] font-medium uppercase tracking-[0.45em] text-void-ink"
          >
            Hi, I am
          </motion.p>
          <motion.h1
            {...rise(0.25)}
            data-glitch-text
            className="mt-4 font-void-display text-[3.1rem] leading-[0.95] text-void-ink sm:text-7xl lg:text-[5.4rem] xl:text-[6.2rem]"
          >
            {profile.nameLines[0]}
            <br />
            {profile.nameLines[1]}
          </motion.h1>
          <motion.div
            {...rise(0.4)}
            className="mt-6 font-void-ui text-[12px] font-medium uppercase leading-relaxed tracking-[0.28em] text-void-ink sm:text-[13px]"
          >
            <p>
              {profile.degree}
              <span aria-hidden className="mx-3">
                |
              </span>
              <span className="whitespace-normal">{profile.institution}</span>
            </p>
            <p className="mt-1 text-void-ink/80">{profile.graduation}</p>
          </motion.div>
          <motion.p
            {...rise(0.5)}
            className="mt-6 text-[1.1rem] leading-relaxed text-void-ink sm:text-[1.2rem]"
          >
            {profile.tagline}
          </motion.p>
          <motion.p
            {...rise(0.6)}
            className="mt-4 min-h-[1.75em] text-[1.1rem] italic text-void-ink sm:text-[1.2rem]"
          >
            <span>I&apos;m </span>
            <span>{typed}</span>
            <span
              aria-hidden
              className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[3px] animate-pulse bg-void-ink"
            />
            <span className="sr-only">{profile.typewriterWords.join(", ")}</span>
          </motion.p>

          <motion.div {...rise(0.7)} className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-5">
            <a
              href="#void-projects"
              className="void-brush inline-flex min-h-11 items-center gap-2 px-6 py-3 font-void-ui text-[15px] font-medium text-void-ivory"
            >
              View Projects <ArrowUpRight className="h-4 w-4" aria-hidden />
            </a>
            <a
              href="#void-contact"
              className="void-ink-fill inline-flex min-h-11 items-center gap-2 border-[1.5px] border-void-ink px-6 py-3 font-void-ui text-[15px] font-medium text-void-ink"
            >
              Get In Touch <Mail className="h-4 w-4" aria-hidden />
            </a>
            <a
              href={profile.resume.href}
              download={profile.resume.fileName}
              className="void-link-underline inline-flex min-h-11 items-center gap-2 font-void-ui text-[14px] font-medium text-void-ink"
            >
              <ArrowDownToLine className="h-4 w-4" aria-hidden /> Download Resume
            </a>
          </motion.div>

          <motion.dl
            {...rise(0.85)}
            className="mt-12 grid max-w-md grid-cols-3 divide-x divide-void-ink/40"
          >
            {heroStats.map((s) => (
              <div key={s.label} className="flex flex-col px-3 first:pl-0 sm:px-5">
                <dt className="order-2 mt-1 font-void-ui text-[10px] uppercase leading-snug tracking-[0.14em] text-void-ink sm:text-[11px]">
                  {s.label}
                </dt>
                <dd className="order-1 font-void-ui text-2xl font-medium text-void-ink sm:text-[1.7rem]">
                  {formatStat(s)}
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>
      </div>

      {/* ── Ink waves & scroll cue ───────────────────────────────── */}
      <InkWaves className="bottom-0 h-[16vh] min-h-[90px] md:h-[22vh]" />
      <a
        href="#void-about"
        aria-label="Scroll to About"
        className="absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-void-ivory md:flex"
      >
        <span className="font-void-ui text-[11px] tracking-[0.45em]">SCROLL</span>
        <span aria-hidden className="void-scroll-cue block h-10 w-px bg-void-ivory" />
      </a>
    </section>
  );
}
