import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import profile from "@/assets/about.jpeg";
import { SectionHeading } from "./SectionHeading";

const stats = [
  { label: "Projects Completed", value: 15 },
  { label: "Certifications Earned", value: 12 },
  { label: "Hackathons Participated", value: 8 },
  { label: "CGPA", value: 8.94, decimals: 2 },
];

function Counter({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const dur = 1400;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);
  return <span ref={ref}>{n.toFixed(decimals)}</span>;
}

const badges = [
  "AI & ML Enthusiast",
  "Full Stack Developer",
  "Research-Oriented Engineer",
  "Hackathon Participant",
  "Problem Solver",
];

export function About() {
  return (
    <section id="about" className="section-pad relative">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading eyebrow="Who I Am" title="About Me" />
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative mx-auto w-full max-w-md"
          >
            <div className="absolute -left-4 -top-4 h-full w-full border border-gold/60" />
            <img
              src={profile}
              alt="Kaushik working"
              loading="lazy"
              width={512}
              height={640}
              className="relative h-auto w-full object-contain grayscale-[15%]"
              style={{
                boxShadow: "0 30px 80px -30px rgba(0,0,0,0.7), 0 0 0 1px rgba(212,175,55,0.4)",
              }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h3 className="font-brush gold-gradient-text mb-4 text-4xl md:text-5xl">
              Crafting intelligent products.
            </h3>
            <p className="text-base leading-relaxed text-cream/85 md:text-lg">
              I'm an undergraduate Computer Science engineer specializing in Artificial
              Intelligence and Machine Learning. I love bridging the gap between deep research
              and production-grade software — building scalable full-stack systems, training
              models, and shipping AI-powered features that solve real problems.
            </p>
            <p className="mt-4 text-base leading-relaxed text-cream/75">
              From hackathon prototypes to research-grade projects, I focus on clean
              architecture, thoughtful UX, and engineering rigor — the kind of work recruiters
              and product teams can trust on day one.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {badges.map((b) => (
                <span
                  key={b}
                  className="border border-gold/50 bg-deep-red-3/40 px-3 py-1 text-xs font-medium uppercase tracking-wider text-gold"
                >
                  {b}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="mt-20 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="border border-gold/30 bg-deep-red-3/50 p-6 text-center transition-all hover:border-gold hover:shadow-[0_0_30px_-5px_rgba(212,175,55,0.4)]"
            >
              <div className="font-brush gold-gradient-text text-5xl md:text-6xl">
                <Counter value={s.value} decimals={s.decimals ?? 0} />
                {!s.decimals && <span>+</span>}
              </div>
              <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-cream/80">
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}