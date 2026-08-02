import { motion } from "framer-motion";
import { Github, ArrowUpRight, Dumbbell, ShieldCheck, TrendingUp } from "lucide-react";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";
import { SectionHeading } from "./SectionHeading";
import type { LucideIcon } from "lucide-react";
import flexIcon from "@/assets/flex.ico";
import alleivoIcon from "@/assets/alleivo.ico";
import agriIcon from "@/assets/agri.ico";

interface Project {
  title: string;
  subtitle: string;
  desc: string;
  stack: string[];
  gradient: string;
  Icon: LucideIcon;
  customIconUrl?: string;
  iconColor: string;
  glowColor: string;
  github: string;
  live?: string;
}

const projects: Project[] = [
  {
    title: "Flex-Flow-Fusion",
    subtitle: "AI • Computer Vision • Full Stack",
    desc: "AI-powered fitness platform that performs real-time posture analysis using computer vision, delivers instant exercise feedback, and tracks workout progress through an interactive full-stack web application.",
    stack: ["React", "TypeScript", "Tailwind CSS", "TensorFlow.js", "MoveNet", "FastAPI", "MongoDB"],
    gradient: "linear-gradient(135deg, #0f1f3d 0%, #1a3a6b 40%, #0d2a4a 70%, #0a1628 100%)",
    Icon: Dumbbell,
    customIconUrl: flexIcon,
    iconColor: "#60A5FA",
    glowColor: "rgba(96,165,250,0.35)",
    github: "https://github.com/Kaushik-29/flex-flow-fusion",
    live: "https://flexflowfusion.netlify.app/",
  },
  {
    title: "Alleivo",
    subtitle: "AI • FinTech • Full Stack",
    desc: "Intelligent insurance management platform for gig delivery partners that predicts income disruptions, automates eligibility verification, and enables data-driven policy recommendations through AI-powered risk assessment.",
    stack: ["React", "FastAPI", "PostgreSQL", "Redis", "Celery", "XGBoost", "Tailwind CSS"],
    gradient: "linear-gradient(135deg, #1a0a2e 0%, #3d1a6e 40%, #2a0f52 70%, #120720 100%)",
    Icon: ShieldCheck,
    customIconUrl: alleivoIcon,
    iconColor: "#C084FC",
    glowColor: "rgba(192,132,252,0.35)",
    github: "https://github.com/Kaushik-29/Allievo",
    live: "https://allievo.netlify.app/",
  },
  {
    title: "CommodityIQ",
    subtitle: "Machine Learning • Data Science",
    desc: "AI-driven forecasting platform that predicts agricultural commodity prices using historical market trends and weather data, helping farmers and traders make informed selling and procurement decisions.",
    stack: ["Python", "LSTM", "XGBoost", "Scikit-learn", "Pandas", "Flask", "Matplotlib"],
    gradient: "linear-gradient(135deg, #0d2218 0%, #1a4a2a 40%, #0f3320 70%, #071610 100%)",
    Icon: TrendingUp,
    customIconUrl: agriIcon,
    iconColor: "#34D399",
    glowColor: "rgba(52,211,153,0.35)",
    github: "https://github.com/Kaushik-29/Agri-Commodity-Price-Predictor",
  },
];

export function Projects() {
  return (
    <section id="projects" className="section-pad relative">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading eyebrow="Selected Work" title="Featured Projects" />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => {
            const Icon = p.Icon;
            return (
              <motion.article
                key={p.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                whileHover={{ y: -8 }}
                className="group flex flex-col border border-gold/30 bg-deep-red-3/60 transition-all hover:border-gold hover:shadow-[0_30px_80px_-30px_rgba(212,175,55,0.45)]"
              >
                {/* Banner — gradient + floating icon */}
                <div
                  className="relative aspect-[16/10] overflow-hidden flex items-center justify-center"
                  style={{ background: p.gradient }}
                >
                  {/* Subtle grid pattern */}
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
                      backgroundSize: "32px 32px",
                    }}
                  />
                  {/* Radial glow */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `radial-gradient(ellipse at 50% 60%, ${p.glowColor} 0%, transparent 65%)`,
                    }}
                  />
                  {/* Icon or Custom Image */}
                  <motion.div
                    className="relative z-10 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl"
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      border: `1px solid ${p.iconColor}30`,
                      boxShadow: `0 0 40px ${p.glowColor}`,
                      backdropFilter: "blur(12px)",
                    }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    {p.customIconUrl ? (
                      <img
                        src={p.customIconUrl}
                        alt={`${p.title} logo`}
                        className="h-12 w-12 object-contain drop-shadow-md"
                      />
                    ) : (
                      <Icon size={36} style={{ color: p.iconColor }} strokeWidth={1.5} />
                    )}
                  </motion.div>
                  {/* Bottom fade */}
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-deep-red-3/80 to-transparent" />
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
                    {p.subtitle}
                  </p>
                  <h3 className="mt-2 text-xl font-bold text-cream leading-snug">{p.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-cream/75">{p.desc}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {p.stack.map((t) => (
                      <span
                        key={t}
                        className="border border-gold/40 bg-deep-red-2/60 px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-cream/90"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="mt-6 flex gap-3">
                    <a
                      href={p.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-1 items-center justify-center gap-2 border border-gold px-4 py-2 text-xs font-bold uppercase tracking-widest text-gold transition-all hover:bg-gold hover:text-deep-red-3"
                    >
                      <FaGithub /> GitHub
                    </a>
                    {p.live && (
                      <a
                        href={p.live}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-1 items-center justify-center gap-2 bg-gold px-4 py-2 text-xs font-bold uppercase tracking-widest text-deep-red-3 transition-all hover:scale-[1.03]"
                      >
                        <FaExternalLinkAlt /> Live
                      </a>
                    )}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* ── View All Projects CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="mt-16 flex flex-col items-center gap-5"
        >
          <p className="max-w-md text-center text-sm leading-relaxed text-cream/40">
            Explore more AI, Full Stack, Machine Learning, Cloud, and Open Source projects
            on my GitHub profile.
          </p>

          <motion.a
            href="https://github.com/Kaushik-29"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View all projects on GitHub"
            whileHover={{ y: -4, scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="group relative flex w-[90%] max-w-[340px] cursor-pointer items-center justify-center gap-3 overflow-hidden border border-gold/40 bg-deep-red-3/50 px-8 py-4 text-sm font-bold uppercase tracking-widest text-cream backdrop-blur-sm transition-all duration-400 hover:border-gold hover:shadow-[0_16px_48px_-12px_rgba(212,175,55,0.40)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold sm:w-auto"
            style={{ borderRadius: 18 }}
          >
            <motion.span
              initial={{ x: "-120%" }}
              whileHover={{ x: "120%" }}
              transition={{ duration: 0.75, ease: "easeInOut" }}
              className="pointer-events-none absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-gold/10 to-transparent"
            />
            <span
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-400 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 120%, rgba(212,175,55,0.12) 0%, transparent 70%)",
              }}
            />
            <motion.span
              className="shrink-0 text-gold"
              whileHover={{ rotate: 5 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <Github size={18} strokeWidth={2} />
            </motion.span>
            <span className="text-cream transition-colors duration-300 group-hover:text-gold">
              View All Projects on GitHub
            </span>
            <motion.span
              className="shrink-0 text-gold/70 transition-colors duration-300 group-hover:text-gold"
              whileHover={{ x: 3 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
            >
              <ArrowUpRight size={16} strokeWidth={2.5} />
            </motion.span>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
