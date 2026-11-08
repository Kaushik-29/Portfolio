import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight, ExternalLink, ImageOff } from "lucide-react";
import { FaAws, FaGithub, FaMicrosoft } from "react-icons/fa";
import { SiCisco, SiCoursera, SiSalesforce, SiSap, SiUdemy } from "react-icons/si";
import mathworksLogo from "@/assets/void/logos/mathworks.webp";
import nptelLogo from "@/assets/void/logos/nptel.webp";
import type { IconType } from "react-icons";
import {
  type CertLogoKey,
  certifications,
  experiences,
  projects,
  projectsMore,
  sectionHeadings,
  type ProjectItem,
} from "@/content/portfolio";
import { CERTIFICATE_IMAGES, PROJECT_SCREENSHOTS } from "./assets";
import {
  InkStroke,
  Reveal,
  TimelineNode,
  TimelineRail,
  VoidSectionHeading,
} from "./VoidPrimitives";

/* ──────────────────────────── Projects ─────────────────────────── */

function Screenshot({ project }: { project: ProjectItem }) {
  const shot = PROJECT_SCREENSHOTS[project.key];
  const ref = useRef<HTMLElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.25 });
  const ease = [0.7, 0, 0.2, 1] as const;
  return (
    <figure
      ref={ref}
      className="group/shot relative border-[1.5px] border-void-ink bg-void-ink shadow-[12px_12px_0_#080909] transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[18px_18px_0_#080909]"
    >
      <div
        className="flex h-7 items-center gap-1.5 border-b border-void-ink bg-void-ivory px-3"
        aria-hidden
      >
        <span className="h-2.5 w-2.5 rounded-full border border-void-ink transition-colors duration-300 group-hover/shot:bg-void-ink" />
        <span className="h-2.5 w-2.5 rounded-full border border-void-ink" />
        <span className="h-2.5 w-2.5 rounded-full bg-void-ink" />
        {project.live && (
          <span className="ml-3 truncate font-void-ui text-[10px] tracking-wide text-void-ink">
            {project.live.replace(/^https?:\/\//, "").replace(/\/$/, "")}
          </span>
        )}
      </div>
      <div className="relative overflow-hidden">
        {/* Image is unveiled behind a ragged ink wipe; original colours are untouched. */}
        <motion.div
          initial={{ clipPath: "inset(0% 100% 0% 0%)" }}
          animate={{ clipPath: seen ? "inset(0% 0% 0% 0%)" : "inset(0% 100% 0% 0%)" }}
          transition={{ duration: 1.1, delay: 0.25, ease }}
        >
          {shot ? (
            <img
              src={shot.src}
              alt={`${project.title} — screenshot of the live demo`}
              width={shot.width}
              height={shot.height}
              loading="lazy"
              decoding="async"
              className="block aspect-video h-auto w-full object-cover object-top transition-transform duration-[1200ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover/shot:scale-[1.045]"
            />
          ) : (
            <div
              role="img"
              aria-label={`${project.title} — screenshot placeholder`}
              className="relative grid aspect-video w-full place-items-center bg-void-ivory text-center"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(135deg, rgba(8,9,9,0.08) 0 2px, transparent 2px 14px)",
              }}
            >
              <div className="border border-dashed border-void-ink bg-void-ivory px-5 py-4">
                <ImageOff className="mx-auto h-6 w-6 text-void-ink" aria-hidden />
                <p className="mt-2 font-void-ui text-[11px] font-semibold uppercase tracking-[0.25em] text-void-ink">
                  Placeholder
                </p>
                <p className="mt-1 font-void-ui text-[12px] text-void-ink">
                  Screenshot coming soon
                </p>
              </div>
            </div>
          )}
        </motion.div>
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-[120%] bg-void-ink"
          style={{
            clipPath:
              "polygon(0 0, 88% 0, 92% 10%, 88% 22%, 94% 35%, 89% 50%, 95% 63%, 90% 77%, 96% 90%, 91% 100%, 0 100%)",
          }}
          initial={{ x: "-100%" }}
          animate={{ x: seen ? "100%" : "-100%" }}
          transition={{ duration: 1.35, ease }}
        />
      </div>
    </figure>
  );
}

export function VoidProjects() {
  return (
    <section
      id="void-projects"
      data-glitch-reveal
      className="relative px-5 py-24 sm:px-8 md:py-32 lg:px-12"
    >
      <div className="mx-auto max-w-[1280px]">
        <VoidSectionHeading index="04" {...sectionHeadings.projects} />
        <div className="space-y-24 md:space-y-32">
          {projects.map((p, i) => {
            const flip = i % 2 === 1;
            return (
              <article
                key={p.key}
                className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14"
                aria-labelledby={`void-project-${p.key}`}
              >
                <Reveal className={`lg:col-span-7 ${flip ? "lg:order-2" : ""}`}>
                  <Screenshot project={p} />
                </Reveal>
                <Reveal delay={0.1} className={`lg:col-span-5 ${flip ? "lg:order-1" : ""}`}>
                  <p
                    className="font-void-display text-6xl leading-none text-void-ash md:text-7xl"
                    aria-hidden
                  >
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-4 font-void-ui text-[11px] font-semibold uppercase tracking-[0.3em] text-void-ink">
                    {p.subtitle}
                  </p>
                  <h3
                    id={`void-project-${p.key}`}
                    className="mt-2 font-void-display text-4xl leading-tight text-void-ink md:text-5xl"
                  >
                    {p.title}
                  </h3>
                  <p className="mt-4 text-[1.05rem] leading-[1.75] text-void-ink">{p.desc}</p>
                  <ul className="mt-6 flex flex-wrap gap-2" aria-label="Technology stack">
                    {p.stack.map((t) => (
                      <li
                        key={t}
                        className="border border-void-ink/60 px-2.5 py-1 font-void-ui text-[11px] font-medium uppercase tracking-[0.12em] text-void-ink"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                    <a
                      href={p.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center gap-2 border-[1.5px] border-void-ink px-5 py-2.5 font-void-ui text-[14px] font-medium text-void-ink void-ink-fill"
                    >
                      <FaGithub aria-hidden /> GitHub
                    </a>
                    {p.live && (
                      <a
                        href={p.live}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="void-brush inline-flex min-h-11 items-center gap-2 px-5 py-2.5 font-void-ui text-[14px] font-medium text-void-ivory"
                      >
                        Live Demo <ArrowUpRight className="h-4 w-4" aria-hidden />
                      </a>
                    )}
                  </div>
                </Reveal>
              </article>
            );
          })}
        </div>

        <Reveal className="mt-24 flex flex-col items-center gap-5 text-center">
          <p className="max-w-md text-[1.02rem] leading-relaxed text-void-ink">
            {projectsMore.text}
          </p>
          <a
            href={projectsMore.href}
            target="_blank"
            rel="noopener noreferrer"
            className="void-link-underline inline-flex min-h-11 items-center gap-2 font-void-ui text-[15px] font-semibold text-void-ink"
          >
            <FaGithub aria-hidden /> {projectsMore.label}{" "}
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </a>
        </Reveal>
      </div>
    </section>
  );
}

/* ───────────────────────── Certifications ──────────────────────── */

/**
 * Monochrome issuer logos. Icon components come from react-icons; MathWorks
 * and NPTEL aren't in react-icons, so their official logos were downloaded
 * and converted to the Void palette (src/assets/void/logos).
 */
const issuerLogos: Record<CertLogoKey, IconType | string> = {
  Udemy: SiUdemy,
  Coursera: SiCoursera,
  NPTEL: nptelLogo,
  MathWorks: mathworksLogo,
  Microsoft: FaMicrosoft,
  Cisco: SiCisco,
  Salesforce: SiSalesforce,
  SAP: SiSap,
  AWS: FaAws,
};

function IssuerLogo({ logoKey }: { logoKey: CertLogoKey }) {
  const Logo = issuerLogos[logoKey];
  const motion = "transition-transform duration-500 group-hover:scale-110";
  if (typeof Logo === "string") {
    return (
      <img
        src={Logo}
        alt=""
        aria-hidden
        loading="lazy"
        decoding="async"
        className={`h-14 w-auto object-contain ${motion}`}
      />
    );
  }
  return <Logo aria-hidden className={`text-[3.25rem] text-void-ink ${motion}`} />;
}

export function VoidCertifications() {
  return (
    <section id="void-certifications" className="relative px-5 py-24 sm:px-8 md:py-32 lg:px-12">
      <div className="relative mx-auto max-w-[1280px]">
        <VoidSectionHeading index="05" {...sectionHeadings.certifications} />
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {certifications.map((c, i) => {
            const img = CERTIFICATE_IMAGES[c.title];
            return (
              <li key={c.title}>
                <Reveal delay={(i % 3) * 0.08} y={26} className="h-full">
                  <div className="group flex h-full flex-col border border-void-ink bg-void-ivory p-6 transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-1.5 hover:shadow-[10px_10px_0_#080909] md:p-7">
                    {img ? (
                      <img
                        src={img}
                        alt={`${c.title} certificate`}
                        loading="lazy"
                        className="aspect-[4/3] w-full object-cover"
                      />
                    ) : (
                      <div
                        role="img"
                        aria-label={`${c.issuerFull} logo`}
                        className="relative grid h-28 place-items-center overflow-hidden border border-dashed border-void-ash bg-void-stone/30 transition-colors duration-500 group-hover:border-solid group-hover:border-void-ink group-hover:bg-void-stone/60"
                      >
                        <IssuerLogo logoKey={c.logoKey} />
                      </div>
                    )}
                    <div className="mt-5 flex items-center justify-between gap-3 font-void-ui text-[11px] uppercase tracking-[0.2em] text-void-ink">
                      <span className="font-semibold">
                        <span aria-hidden className="mr-2 text-void-ash">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {c.issuer}
                      </span>
                      <span className="text-right">{c.date}</span>
                    </div>
                    <h3 className="relative mt-3 font-void-display text-[1.45rem] leading-snug text-void-ink">
                      {c.title}
                      <InkStroke className="absolute -bottom-2 left-0 h-1.5 w-24 origin-left scale-x-0 transition-transform duration-700 ease-[cubic-bezier(0.7,0,0.2,1)] group-hover:scale-x-100" />
                    </h3>
                    <p className="mt-1 font-void-ui text-[13px] text-void-ink/80">{c.issuerFull}</p>
                    <p className="mt-3 text-[0.98rem] leading-relaxed text-void-ink">{c.desc}</p>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ─────────────────────────── Experience ────────────────────────── */

export function VoidExperience() {
  const listRef = useRef<HTMLOListElement>(null);
  return (
    <section
      id="void-experience"
      data-glitch-reveal
      className="relative px-5 py-24 sm:px-8 md:py-32 lg:px-12"
    >
      <div className="mx-auto max-w-[1280px]">
        <VoidSectionHeading index="06" {...sectionHeadings.experience} />
        <ol ref={listRef} className="relative">
          <TimelineRail target={listRef} className="left-[6px] md:left-1/2 md:-ml-[1px]" />
          {experiences.map((e, i) => {
            const right = i % 2 === 1;
            return (
              <li
                key={e.title}
                className="relative pb-14 pl-10 last:pb-0 md:grid md:grid-cols-2 md:gap-16 md:pl-0"
              >
                <TimelineNode
                  shape="diamond"
                  className="left-0 top-2 h-[15px] w-[15px] md:left-1/2 md:-ml-[7px]"
                />
                <Reveal
                  initial={{ opacity: 0, x: right ? 56 : -56, y: 0 }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  className={`${right ? "md:col-start-2" : "md:col-start-1 md:text-right"}`}
                >
                  <p className="font-void-ui text-[11px] font-semibold uppercase tracking-[0.3em] text-void-ink">
                    {e.duration}
                  </p>
                  <p className="mt-1 font-void-ui text-[11px] uppercase tracking-[0.3em] text-void-ash">
                    {e.tag}
                  </p>
                  <h3 className="mt-3 font-void-display text-3xl leading-tight text-void-ink">
                    {e.title}
                  </h3>
                  <p className="mt-1 font-void-ui text-[14px] font-medium text-void-ink">{e.org}</p>
                  <p className="mt-4 text-[1.02rem] leading-[1.75] text-void-ink">{e.desc}</p>
                  <ul
                    className={`mt-5 flex flex-wrap gap-2 ${right ? "" : "md:justify-end"}`}
                    aria-label="Skills"
                  >
                    {e.skills.map((s) => (
                      <li
                        key={s}
                        className="bg-void-stone/60 px-2.5 py-1 font-void-ui text-[11px] font-medium text-void-ink"
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={e.certUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="void-link-underline mt-5 inline-flex min-h-11 items-center gap-2 font-void-ui text-[13px] font-semibold uppercase tracking-[0.15em] text-void-ink"
                  >
                    View Certificate <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </a>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
