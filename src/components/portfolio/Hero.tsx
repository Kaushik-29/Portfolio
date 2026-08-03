import { motion } from "framer-motion";
import { Typewriter } from "./Typewriter";
import { GoldParticles } from "./GoldParticles";
import { HeroProfile } from "./HeroProfile";


export function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden pt-28 pb-16"
    >
      {/* Deep layered background gradient mapping to active theme */}
      <div
        className="absolute inset-0 -z-50 transition-all duration-500"
        style={{
          background: `linear-gradient(140deg, var(--theme-bg-top) 0%, rgba(10, 0, 0, 0.98) 50%, var(--theme-bg-bottom) 100%)`,
        }}
      />
      <GoldParticles count={40} />
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-16 px-6 lg:grid-cols-2">
        {/* Left column - unified visual weight with decorative details */}
        <div className="relative pl-6 md:pl-8">
          {/* Futuristic vertical line decorative element to balance the visual weight */}
          <div className="absolute left-0 top-2 bottom-2 w-[2px] bg-gradient-to-b from-gold via-gold-soft/40 to-transparent">
            {/* Top Glowing Anchor Dot */}
            <div className="absolute -top-1 -left-[3px] h-[8px] w-[8px] rounded-full bg-gold shadow-[0_0_8px_#FFD700]" />
            {/* Mid Pulse Node */}
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[40%] -left-[3px] h-[8px] w-[8px] rounded-full bg-[#D72638] shadow-[0_0_8px_#D72638]"
            />
          </div>

          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-brush text-4xl text-cream md:text-5xl"
          >
            Hi,
          </motion.p>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-brush text-4xl text-cream md:text-5xl"
          >
            I am
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="font-brush gold-gradient-text mt-2 text-5xl sm:text-6xl leading-[1.05] md:text-8xl"
          >
            Kaushik Kumar
            <br />
            Reddy S
          </motion.h1>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "180px" }}
            transition={{ duration: 1.2, delay: 0.9 }}
            className="mt-4 h-[3px] bg-gradient-to-r from-gold via-gold-soft to-transparent"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="mt-6 space-y-1"
          >
            <p className="text-base font-semibold text-cream md:text-lg">
              B.Tech CSE (AI &amp; ML)
            </p>
            <p className="text-sm text-cream/80 md:text-base">
              SRM Institute of Science and Technology
            </p>
            <p className="text-sm text-gold">Expected Graduation: 2027</p>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mt-6 max-w-xl text-base leading-relaxed text-cream/85 md:text-lg"
          >
            Full Stack Engineer passionate about AI, Machine Learning, scalable systems, and
            impactful products.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="mt-8 flex flex-wrap items-center gap-2 sm:gap-2.5 text-xl font-semibold md:text-2xl"
          >
            <span className="text-cream/80">I'm</span>
            <Typewriter
              words={[
                "an Aspiring AI Engineer",
                "a Full Stack Developer",
                "an AI Product Builder",
                "a Machine Learning Enthusiast",
                "a Problem Solver",
              ]}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.6 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            {/* Download Resume Button (Primary CTA) */}
            <motion.a
              href="/Kaushik_Kumar_Reddy_Resume.pdf"
              download="Kaushik_Kumar_Reddy_Resume.pdf"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 25px rgba(255, 215, 0, 0.65)",
              }}
              whileTap={{ scale: 0.98 }}
              className="relative overflow-hidden bg-gradient-to-r from-gold via-gold-soft to-gold px-8 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-widest text-[#120608] shadow-lg flex items-center gap-2 border border-gold/40 group cursor-pointer"
            >
              {/* Shimmer sweep animation */}
              <motion.span
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none"
              />
              <svg className="w-4 h-4 text-[#120608] group-hover:translate-y-[1px] transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              <span>Download Resume</span>
            </motion.a>

            {/* View Projects Button (Secondary CTA) */}
            <motion.a
              href="#projects"
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(255, 215, 0, 0.08)",
                boxShadow: "0 0 20px rgba(255, 215, 0, 0.25)",
                borderColor: "#ffffff",
              }}
              whileTap={{ scale: 0.98 }}
              className="border-2 border-gold/75 px-8 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-widest text-gold flex items-center gap-2 transition-colors duration-300 group cursor-pointer"
            >
              <span>View Projects</span>
              <svg className="w-4 h-4 text-gold group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </motion.a>
          </motion.div>
        </div>

        {/* Right column - moved upward by ~50px on desktop (lg breakpoint) to align visual centers */}
        <div className="relative flex items-center justify-center lg:-translate-y-[50px]">
          <HeroProfile />
        </div>
      </div>
    </section>
  );
}