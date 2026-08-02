import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Code2,
  Cloud,
  Database,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

/* ─────────────────────────────────────────────
   Data
───────────────────────────────────────────── */
interface Exp {
  Icon: LucideIcon;
  title: string;
  org: string;
  duration: string;
  desc: string;
  skills: string[];
  accent: string;
  accentBg: string;
  tag: string;
  certUrl: string;
}

const experiences: Exp[] = [
  {
    Icon: Brain,
    title: "AI-ML Virtual Intern",
    org: "Google for Developers × EduSkills",
    duration: "Apr 2024 – Jun 2024",
    tag: "ARTIFICIAL INTELLIGENCE",
    desc: "Completed a 10-week AI & Machine Learning virtual internship focused on supervised learning, data preprocessing, model evaluation, and real-world AI workflows using Google's tools and frameworks.",
    skills: ["Python", "Machine Learning", "Scikit-Learn", "Data Analysis", "Neural Networks"],
    accent: "#60A5FA",
    accentBg: "rgba(96,165,250,0.12)",
    certUrl: "https://drive.google.com/file/d/1cNteqadIRcs9CGnGDjxDf_F9Ez7S5y49/view?usp=sharing",
  },
  {
    Icon: Code2,
    title: "Python Full Stack Virtual Intern",
    org: "EduSkills",
    duration: "Oct 2024 – Dec 2024",
    tag: "FULL STACK DEVELOPMENT",
    desc: "Developed full-stack web applications using Python, Flask, SQL, REST APIs, backend development, authentication, and deployment while gaining practical industry experience.",
    skills: ["Python", "Flask", "SQL", "REST API", "Authentication", "Deployment"],
    accent: "#34D399",
    accentBg: "rgba(52,211,153,0.12)",
    certUrl: "https://drive.google.com/file/d/1CmSo24bCa2vjT9RKvjE6Nefg2LBT_9WN/view?usp=sharing",
  },
  {
    Icon: Cloud,
    title: "Cloud Virtual Intern",
    org: "AWS Academy",
    duration: "Jan 2025 – Mar 2025",
    tag: "CLOUD COMPUTING",
    desc: "Learned cloud computing fundamentals including compute, storage, networking, virtualization, and deployment using AWS cloud services and best practices for scalable infrastructure.",
    skills: ["AWS", "EC2", "S3", "Cloud Computing", "Networking", "Virtualization"],
    accent: "#FBBF24",
    accentBg: "rgba(251,191,36,0.12)",
    certUrl: "https://drive.google.com/file/d/1rYsOaatZsKSDM7oXLm4A4IpWqSYq4Mfg/view?usp=sharing",
  },
  {
    Icon: Database,
    title: "Data Science Master Virtual Intern",
    org: "Altair",
    duration: "Apr 2025 – Jun 2025",
    tag: "DATA SCIENCE",
    desc: "Applied data science techniques including statistical analysis, visualization, feature engineering, and machine learning to solve real-world analytical problems using Altair's platform.",
    skills: ["Data Science", "Python", "Data Visualization", "Feature Engineering", "Machine Learning"],
    accent: "#C084FC",
    accentBg: "rgba(192,132,252,0.12)",
    certUrl: "https://drive.google.com/file/d/1fmIbt9WgyOFedERN6E33pA1m-m0f7hga/view?usp=sharing",
  },
  {
    Icon: ShieldCheck,
    title: "Network Security Associate",
    org: "Fortinet",
    duration: "Jul 2025 – Sep 2025",
    tag: "CYBERSECURITY",
    desc: "Explored modern cybersecurity concepts including network security, firewalls, threat detection, secure communication, and enterprise security best practices using Fortinet's solutions.",
    skills: ["Cyber Security", "Networking", "Firewalls", "Threat Detection", "Enterprise Security"],
    accent: "#F87171",
    accentBg: "rgba(248,113,113,0.12)",
    certUrl: "https://drive.google.com/file/d/1XsM7bafnlp8-XCqM9YrT4VdZu3KJ2Zpc/view?usp=sharing",
  },
];

/* ─────────────────────────────────────────────
   Paper Clip SVG (dark-theme tinted)
───────────────────────────────────────────── */
function PaperClip({ color }: { color: string }) {
  return (
    <svg
      width="26"
      height="52"
      viewBox="0 0 28 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14 4C8.48 4 4 8.48 4 14V38C4 46.84 11.16 54 20 54C28.84 54 36 46.84 36 38V16"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />
      <path
        d="M14 4C19.52 4 24 8.48 24 14V36C24 41.52 19.52 46 14 46C8.48 46 4 41.52 4 36V16"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.45"
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Notebook Holes (dark-themed)
───────────────────────────────────────────── */
function NotebookHoles() {
  return (
    <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-around py-8 px-3 pointer-events-none z-10">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="w-[14px] h-[14px] rounded-full"
          style={{
            background: "radial-gradient(circle at 38% 35%, #e8e6e0, #d4d2cc)",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.22), inset 0 -1px 2px rgba(255,255,255,0.5), 0 1px 2px rgba(255,255,255,0.4)",
            border: "1px solid rgba(0,0,0,0.12)",
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Folded Corner (dark-themed)
───────────────────────────────────────────── */
function FoldedCorner({ accent }: { accent: string }) {
  return (
    <div
      className="absolute bottom-0 right-0 pointer-events-none z-20"
      style={{ width: 36, height: 36 }}
    >
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <path d="M0 36 L36 0 L36 36 Z" fill="url(#foldIvory)" />
        <path d="M0 36 L36 0" stroke="rgba(0,0,0,0.08)" strokeWidth="0.8" />
        <defs>
          <linearGradient id="foldIvory" x1="0" y1="36" x2="36" y2="0">
            <stop offset="0%" stopColor="#E5E3DC" />
            <stop offset="100%" stopColor="#EDECE8" />
          </linearGradient>
        </defs>
      </svg>
      <div
        className="absolute inset-0 flex items-end justify-end pb-1 pr-1"
        style={{ fontSize: 8, color: accent, opacity: 0.55 }}
      >
        ↗
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Card Face — dark notebook style
───────────────────────────────────────────── */
function CardFace({ exp }: { exp: Exp }) {
  const { Icon, title, org, duration, desc, skills, accent, accentBg, tag, certUrl } = exp;

  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden select-none"
      style={{
        borderRadius: 28,
        // Premium ivory — pure white-ivory, zero brown
        background:
          "linear-gradient(150deg, #FAFAF8 0%, #F7F6F2 45%, #F9F8F5 100%)",
        border: "1.5px solid rgba(0,0,0,0.07)",
        boxShadow: `0 32px 80px -12px rgba(0,0,0,0.45), 0 16px 40px -8px rgba(0,0,0,0.22), 0 4px 12px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,1), 0 0 0 1px ${accent}18`,
      }}
    >
      {/* Accent gradient top bar */}
      <div
        className="absolute inset-x-0 top-0 h-[2.5px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent}90, ${accent}, ${accent}90, transparent)`,
          borderRadius: "28px 28px 0 0",
        }}
      />

      {/* Soft ivory glow at top */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 opacity-60"
        style={{
          background: `radial-gradient(ellipse at 50% -5%, ${accent}12 0%, transparent 70%)`,
        }}
      />

      {/* Subtle paper texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          borderRadius: 28,
        }}
      />

      {/* Horizontal ruled lines — very light grey, clean */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `repeating-linear-gradient(transparent, transparent 27px, #9CA3AF 27px, #9CA3AF 28px)`,
          backgroundPositionY: "64px",
          borderRadius: 28,
        }}
      />

      {/* Left margin line — soft blue-grey, no brown */}
      <div
        className="pointer-events-none absolute top-0 bottom-0"
        style={{ left: 54, width: 1, background: "rgba(239,68,68,0.18)" }}
      />

      {/* Notebook holes */}
      <NotebookHoles />

      {/* Content – pad left to clear holes + margin line */}
      <div className="flex flex-1 flex-col gap-3 sm:gap-4 pl-[3.5rem] sm:pl-[3.75rem] pr-4 sm:pr-7 pt-5 sm:pt-7 pb-5 sm:pb-6 relative z-10 overflow-y-auto sm:overflow-visible">
        {/* Row 1: Icon + Tag + Duration + Clip */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center"
              style={{
                borderRadius: 14,
                background: accentBg,
                border: `1px solid ${accent}30`,
                boxShadow: `0 4px 16px ${accent}15`,
              }}
            >
              <Icon size={22} style={{ color: accent }} strokeWidth={1.8} />
            </div>
            <div>
              <p
                className="text-[10px] font-bold tracking-[0.22em] uppercase"
                style={{ color: accent, fontFamily: "'Poppins', sans-serif" }}
              >
                {tag}
              </p>
              <p
                className="text-[11px] mt-0.5"
                style={{ color: "#64748B", fontFamily: "'Poppins', sans-serif" }}
              >
                {duration}
              </p>
            </div>
          </div>

          {/* Animated paper clip */}
          <motion.div
            className="shrink-0 -mt-4 -mr-2"
            whileHover={{ rotate: 6, y: -3 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
          >
            <PaperClip color={accent} />
          </motion.div>
        </div>

        {/* Row 2: Title + Org */}
        <div className="mt-1">
          <h3
            className="text-xl leading-tight"
            style={{
              color: "#0F172A",
              fontFamily: "'DM Serif Display', 'Cormorant Garamond', Georgia, serif",
              fontWeight: 400,
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </h3>
          <p
            className="mt-1 text-sm font-medium"
            style={{
              color: "#475569",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {org}
          </p>
        </div>

        {/* Accent divider */}
        <div
          className="w-16 h-px"
          style={{
            background: `linear-gradient(90deg, ${accent}70, transparent)`,
          }}
        />

        {/* Row 3: Description */}
        <p
          className="text-sm leading-[1.75] line-clamp-3"
          style={{
            color: "#334155",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {desc}
        </p>

        {/* Row 4: Skill chips + Certificate link */}
        <div className="mt-auto flex items-end justify-between gap-3 flex-wrap">
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill) => (
              <span
                key={skill}
                className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                style={{
                  background: accentBg,
                  color: accent,
                  border: `1px solid ${accent}20`,
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                {skill}
              </span>
            ))}
          </div>

          <a
            href={certUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 shrink-0 text-[11px] font-semibold group transition-all duration-200 hover:gap-2.5"
            style={{
              color: accent,
              fontFamily: "'Poppins', sans-serif",
              textDecoration: "none",
            }}
          >
            View Certificate
            <ExternalLink
              size={11}
              className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </a>
        </div>
      </div>

      {/* Bottom shimmer edge */}
      <div
        className="absolute inset-x-0 bottom-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent}40, transparent)`,
        }}
      />

      {/* Folded corner */}
      <FoldedCorner accent={accent} />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Stack pages behind the card (dark-themed)
───────────────────────────────────────────── */
function StackPage({
  rotate,
  x,
  y,
  opacity,
  zIndex,
  accent,
}: {
  rotate: number;
  x: number;
  y: number;
  opacity: number;
  zIndex: number;
  accent: string;
}) {
  return (
    <div
      className="absolute inset-0 rounded-[28px] pointer-events-none"
      style={{
        transform: `rotate(${rotate}deg) translate(${x}px, ${y}px)`,
        background:
          "linear-gradient(150deg, #F5F4F0 0%, #F0EEE9 100%)",
        border: "1px solid rgba(0,0,0,0.06)",
        opacity,
        zIndex,
        boxShadow: "0 8px 24px -4px rgba(0,0,0,0.18)",
      }}
    />
  );
}

/* ─────────────────────────────────────────────
   Main Section
───────────────────────────────────────────── */
export function Experience() {
  const total = experiences.length;
  const [frontIdx, setFrontIdx] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("left");
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentExp = experiences[frontIdx];

  const goNext = useCallback(() => {
    if (isAnimating) return;
    setDirection("left");
    setIsAnimating(true);
    exitTimerRef.current = setTimeout(() => {
      setFrontIdx((p) => (p + 1) % total);
      setIsAnimating(false);
    }, 340);
  }, [isAnimating, total]);

  const goPrev = useCallback(() => {
    if (isAnimating) return;
    setDirection("right");
    setIsAnimating(true);
    exitTimerRef.current = setTimeout(() => {
      setFrontIdx((p) => (p - 1 + total) % total);
      setIsAnimating(false);
    }, 340);
  }, [isAnimating, total]);

  const goTo = useCallback(
    (idx: number) => {
      if (isAnimating || idx === frontIdx) return;
      setDirection(idx > frontIdx ? "left" : "right");
      setIsAnimating(true);
      exitTimerRef.current = setTimeout(() => {
        setFrontIdx(idx);
        setIsAnimating(false);
      }, 340);
    },
    [frontIdx, isAnimating]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev]);

  useEffect(
    () => () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    },
    []
  );

  return (
    <section id="experience" className="section-pad relative overflow-hidden">
      {/* Ambient background — matches site-wide dark theme */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at 25% 50%, rgba(215,38,56,0.07) 0%, transparent 55%), radial-gradient(ellipse at 75% 50%, rgba(212,175,55,0.05) 0%, transparent 55%)",
        }}
      />

      <div className="mx-auto max-w-[1100px] px-6">
        {/* ── Section heading — reuses existing site heading style ── */}
        <SectionHeading eyebrow="Journey" title="Experience" />

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="mx-auto mb-16 max-w-xl text-center text-sm leading-relaxed text-cream/55 md:text-base"
        >
          A curated chronicle of professional learning — spanning AI, Full Stack,
          Cloud, Data Science, and Cybersecurity.
        </motion.p>

        {/* ── Stack + Nav ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-10"
        >
          {/* Card stack container */}
          <div className="relative w-full max-w-[660px] h-[500px] min-[380px]:h-[460px] sm:h-[430px]">
            {/* 3 offset background pages for depth */}
            <StackPage rotate={3.8}  x={12} y={16} opacity={0.45} zIndex={1} accent={currentExp.accent} />
            <StackPage rotate={-2.8} x={8}  y={10} opacity={0.65} zIndex={2} accent={currentExp.accent} />
            <StackPage rotate={1.4}  x={4}  y={5}  opacity={0.85} zIndex={3} accent={currentExp.accent} />

            {/* Active card with page-flip animation */}
            <AnimatePresence mode="wait">
              <motion.div
                key={frontIdx}
                className="absolute inset-0"
                style={{ zIndex: 10 }}
                initial={{
                  opacity: 0,
                  x: direction === "left" ? 70 : -70,
                  rotate: direction === "left" ? 2.5 : -2.5,
                  scale: 0.96,
                }}
                animate={{ opacity: 1, x: 0, rotate: 0, scale: 1 }}
                exit={{
                  opacity: 0,
                  x: direction === "left" ? -70 : 70,
                  rotate: direction === "left" ? -2.5 : 2.5,
                  scale: 0.96,
                }}
                transition={{ duration: 0.34, ease: [0.4, 0, 0.2, 1] }}
                whileHover={{
                  y: -8,
                  rotate: 0.6,
                  transition: { duration: 0.3, ease: "easeOut" },
                }}
                drag="x"
                dragConstraints={{ left: -100, right: 100 }}
                dragElastic={0.12}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -80 || info.velocity.x < -350) goNext();
                  else if (info.offset.x > 80 || info.velocity.x > 350) goPrev();
                }}
                whileDrag={{ cursor: "grabbing", rotate: 1.5 }}
              >
                <CardFace exp={currentExp} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Navigation ── */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-5">
              {/* Prev */}
              <motion.button
                onClick={goPrev}
                disabled={isAnimating}
                aria-label="Previous experience"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.92 }}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/30 bg-deep-red-3/50 text-cream/60 transition-all duration-200 hover:border-gold hover:text-gold hover:shadow-[0_0_20px_rgba(212,175,55,0.25)] disabled:opacity-30"
                style={{ cursor: "pointer" }}
              >
                <ChevronLeft size={20} />
              </motion.button>

              {/* Animated dots */}
              <div className="flex items-center gap-2.5">
                {experiences.map((_, i) => (
                  <motion.button
                    key={i}
                    onClick={() => goTo(i)}
                    aria-label={`Go to experience ${i + 1}`}
                    animate={{
                      width: i === frontIdx ? 28 : 8,
                      opacity: i === frontIdx ? 1 : 0.3,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="h-2 rounded-full"
                    style={{
                      background:
                        i === frontIdx ? currentExp.accent : "rgba(212,175,55,0.6)",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                    }}
                  />
                ))}
              </div>

              {/* Next */}
              <motion.button
                onClick={goNext}
                disabled={isAnimating}
                aria-label="Next experience"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.92 }}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/30 bg-deep-red-3/50 text-cream/60 transition-all duration-200 hover:border-gold hover:text-gold hover:shadow-[0_0_20px_rgba(212,175,55,0.25)] disabled:opacity-30"
                style={{ cursor: "pointer" }}
              >
                <ChevronRight size={20} />
              </motion.button>
            </div>

            {/* Counter */}
            <p className="text-xs text-cream/30 tracking-widest uppercase">
              {String(frontIdx + 1).padStart(2, "0")} /{" "}
              {String(total).padStart(2, "0")}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}