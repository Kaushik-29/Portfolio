import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { FaGraduationCap, FaSchool, FaUniversity } from "react-icons/fa";
import type { IconType } from "react-icons";
import {
  about,
  education,
  sectionHeadings,
  skills,
  type EducationItem,
  type SkillName,
} from "@/content/portfolio";
import { skillIcons } from "@/content/icons";
import { VOID_ABOUT_PHOTO } from "./assets";
import { EducationArt } from "./EducationArt";
import {
  InkFramedImage,
  InkRibbons,
  Reveal,
  Tendrils,
  TimelineNode,
  TimelineRail,
  VoidSectionHeading,
  inkBleedHandler,
  usePauseOffscreen,
} from "./VoidPrimitives";

/* ───────────────────────────── About ───────────────────────────── */

function Counter({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(value);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 1400);
      setN(value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);
  return <span ref={ref}>{n.toFixed(decimals)}</span>;
}

export function VoidAbout() {
  return (
    <section
      id="void-about"
      data-glitch-reveal
      className="relative px-5 py-24 sm:px-8 md:py-32 lg:px-12"
    >
      <div className="mx-auto max-w-[1280px]">
        <VoidSectionHeading index="01" {...sectionHeadings.about} />
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <Reveal className="relative mx-auto w-full max-w-[420px]">
            {/* Ink formation behind the photo */}
            <svg
              viewBox="0 0 400 520"
              aria-hidden
              className="absolute -bottom-8 -left-8 h-[calc(100%+1rem)] w-[calc(100%+1rem)] opacity-90"
            >
              <path
                d="M40 60 C 120 0, 300 10, 360 70 S 420 260, 380 380 S 250 540, 120 500 S -20 360, 10 220 S -20 110, 40 60 Z"
                fill="#080909"
                className="void-float"
              />
            </svg>
            <InkFramedImage className="bg-transparent">
              <picture>
                <source srcSet={VOID_ABOUT_PHOTO.src} type="image/webp" />
                <img
                  src={VOID_ABOUT_PHOTO.fallback}
                  alt={about.imageAlt}
                  width={VOID_ABOUT_PHOTO.width}
                  height={VOID_ABOUT_PHOTO.height}
                  loading="lazy"
                  decoding="async"
                  className="block h-auto w-full grayscale"
                />
              </picture>
            </InkFramedImage>
            <Tendrils className="pointer-events-none absolute -bottom-16 -right-14 h-40 w-40 rotate-90" />
          </Reveal>

          <Reveal delay={0.1}>
            <h3 className="font-void-display text-4xl leading-tight text-void-ink md:text-5xl">
              {about.heading}
            </h3>
            {about.paragraphs.map((p) => (
              <p
                key={p.slice(0, 16)}
                className="mt-5 text-[1.08rem] leading-[1.75] text-void-ink md:text-[1.15rem]"
              >
                {p}
              </p>
            ))}
            <ul className="mt-8 flex flex-wrap gap-2.5">
              {about.badges.map((b) => (
                <li
                  key={b}
                  className="border border-void-ink px-3.5 py-1.5 font-void-ui text-[11px] font-medium uppercase tracking-[0.18em] text-void-ink void-ink-fill"
                >
                  {b}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <dl className="mt-20 grid grid-cols-2 border-y border-void-ink md:grid-cols-4">
          {about.stats.map((s, i) => (
            <Reveal
              key={s.label}
              delay={i * 0.08}
              className={`flex flex-col px-4 py-8 text-center md:py-10 ${i % 2 === 1 ? "border-l border-void-ink" : ""} ${i >= 2 ? "border-t border-void-ink md:border-t-0" : ""} ${i === 2 ? "md:border-l" : ""}`}
            >
              <dt className="order-2 mt-2 font-void-ui text-[11px] font-medium uppercase tracking-[0.2em] text-void-ink">
                {s.label}
              </dt>
              <dd className="order-1 font-void-display text-5xl text-void-ink md:text-6xl">
                <Counter value={s.value} decimals={s.decimals ?? 0} />
                {!s.decimals && <span>+</span>}
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ─────────────────────────── Education ─────────────────────────── */

const eduIcons: Record<EducationItem["key"], IconType> = {
  university: FaUniversity,
  college: FaGraduationCap,
  school: FaSchool,
};

function EduLogo({ item }: { item: EducationItem }) {
  const [failed, setFailed] = useState(false);
  const Icon = eduIcons[item.key];
  return (
    <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden border border-void-ink bg-void-ivory md:h-20 md:w-20">
      {failed ? (
        <Icon className="text-2xl text-void-ink" aria-hidden />
      ) : (
        <img
          src={item.logoUrl}
          alt={item.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain p-2 grayscale contrast-125"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

export function VoidEducation() {
  const listRef = useRef<HTMLOListElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  usePauseOffscreen(sectionRef);

  return (
    <section
      ref={sectionRef}
      id="void-education"
      data-glitch-reveal
      className="relative overflow-clip px-5 py-24 sm:px-8 md:py-32 lg:px-12 lg:py-16"
    >
      <div className="relative mx-auto grid max-w-[1280px] grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:grid-rows-[auto_auto] lg:gap-x-14 lg:gap-y-0">
        {/* Phones & tablets: the scene as a banner above the timeline */}
        <EducationArt className="void-edu-art -mx-5 aspect-[1433/1058] sm:-mx-8 lg:hidden" />

        {/* Desktop: heading + whole illustration on the left, timeline on the right.
            Phones/tablets keep their order: banner, heading, timeline. */}
        <div className="-mb-10 lg:col-start-1 lg:row-start-1 lg:mb-0 lg:self-end lg:[&>*]:!mb-6">
          <VoidSectionHeading index="02" {...sectionHeadings.education} />
        </div>
        <EducationArt className="void-edu-art hidden aspect-[1433/1058] w-full lg:col-start-1 lg:row-start-2 lg:block lg:self-start" />

        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
          <ol ref={listRef} className="relative pl-10 md:pl-16">
            <TimelineRail target={listRef} className="left-[10px] md:left-[18px]" />
            {education.map((it, i) => (
              <li key={it.name} className="relative pb-14 last:pb-0 lg:pb-5">
                <TimelineNode className="-left-10 top-6 h-6 w-6 md:-left-16 md:h-10 md:w-10" />
                <Reveal
                  delay={i * 0.1}
                  initial={{ opacity: 0, x: 56, y: 0 }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  onPointerMove={inkBleedHandler}
                  className="void-bleed flex flex-col gap-5 border border-void-ink bg-void-ivory p-5 transition-shadow duration-500 hover:shadow-[10px_10px_0_#080909] sm:flex-row sm:items-center md:p-7 lg:px-6 lg:py-5"
                >
                  <EduLogo item={it} />
                  <div className="min-w-0">
                    <p className="font-void-ui text-[11px] font-medium uppercase tracking-[0.3em] text-void-ink">
                      {it.years}
                    </p>
                    <h3 className="mt-1.5 font-void-display text-2xl leading-snug text-void-ink md:text-[1.9rem]">
                      {it.name}
                    </h3>
                    <p className="mt-1.5 text-[1.02rem] text-void-ink">{it.degree}</p>
                    <p className="mt-3 inline-block bg-void-ink px-2.5 py-1 font-void-ui text-[12px] font-semibold tracking-wide text-void-ivory">
                      {it.score}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────── Skills ──────────────────────────── */

/**
 * Presentation-only grouping of the existing skill list (no skills added or
 * removed). Group labels follow the Skills reference layout.
 */
const skillGroups: { title: string; items: SkillName[] }[] = [
  { title: "Languages", items: ["Python", "Java", "C++", "JavaScript", "TypeScript"] },
  { title: "Frameworks", items: ["React", "FastAPI", "Node.js", "Flask"] },
  { title: "AI / ML", items: ["TensorFlow", "OpenCV"] },
  { title: "Data & Tools", items: ["MySQL", "MongoDB"] },
  { title: "Cloud & DevOps", items: ["AWS", "Docker", "Git"] },
];

// Guard: every existing skill must appear exactly once.
if (import.meta.env.DEV) {
  const grouped = skillGroups.flatMap((g) => g.items);
  const missing = skills.filter((s) => !grouped.includes(s));
  if (missing.length || grouped.length !== skills.length)
    console.warn("[Void] Skill groups out of sync with content:", missing);
}

export function VoidSkills() {
  const sectionRef = useRef<HTMLElement>(null);
  usePauseOffscreen(sectionRef);
  const last = skillGroups.length - 1;
  return (
    <section
      ref={sectionRef}
      id="void-skills"
      className="relative overflow-hidden px-5 py-24 sm:px-8 md:py-32 lg:px-12"
    >
      <InkRibbons className="pointer-events-none absolute -right-28 -top-20 w-[300px] -scale-x-100 rotate-[8deg] opacity-60 md:-right-24 md:top-6 md:w-[480px] md:opacity-90 lg:-right-10" />
      <InkRibbons className="pointer-events-none absolute -bottom-6 -left-12 hidden w-[480px] rotate-[-4deg] opacity-90 lg:block" />

      <div className="relative mx-auto max-w-[1180px]">
        <Reveal className="mb-12 md:mb-16">
          <p className="flex items-center gap-3 font-void-ui text-[11px] font-medium uppercase tracking-[0.4em] text-void-ink">
            <span aria-hidden className="text-void-ash">
              03
            </span>
            <span aria-hidden className="h-px w-10 bg-void-ink" />
            {sectionHeadings.skills.eyebrow}
          </p>
          <h2 className="mt-4 font-void-display text-[2.8rem] italic leading-[1.02] text-void-ink sm:text-6xl lg:text-7xl">
            {sectionHeadings.skills.title}
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2">
          {skillGroups.map((g, gi) => (
            <Reveal
              key={g.title}
              delay={gi * 0.07}
              className={gi === last ? "md:col-span-2 md:mx-auto md:w-[calc(50%-1rem)]" : undefined}
            >
              <div
                onPointerMove={inkBleedHandler}
                className="void-bleed relative h-full rounded-[16px] border-[1.5px] border-void-ink/80 bg-void-ivory px-3 pb-6 pt-8 shadow-[0_10px_30px_-18px_rgba(8,9,9,0.45)] transition-[border-color,box-shadow,transform] duration-500 hover:-translate-y-1 hover:border-void-ink hover:shadow-[0_22px_40px_-20px_rgba(8,9,9,0.55)] sm:px-5"
              >
                <h3 className="absolute -top-3 left-5 bg-void-ivory px-2 font-void-ui text-[13px] font-semibold text-void-ink">
                  {g.title}
                </h3>
                <ul className="flex flex-wrap justify-center gap-x-1 gap-y-5 sm:gap-x-2 lg:gap-x-3">
                  {g.items.map((name) => {
                    const Icon = skillIcons[name];
                    return (
                      <li
                        key={name}
                        className="group flex w-[78px] flex-col items-center gap-2.5 text-center sm:w-[84px] lg:w-[92px]"
                      >
                        <span className="relative grid h-12 w-12 place-items-center">
                          <span
                            aria-hidden
                            className="absolute inset-0 scale-0 rounded-full bg-void-ink transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-100"
                          />
                          <Icon
                            aria-hidden
                            className="relative text-[28px] text-void-ink transition-[color,transform] duration-300 group-hover:-translate-y-0.5 group-hover:text-void-ivory"
                          />
                        </span>
                        <span className="font-void-ui text-[12px] font-medium text-void-ink sm:text-[13px]">
                          {name}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
