import { MotionConfig } from "framer-motion";
import { usePortfolioTransition } from "@/components/transition/TransitionCoordinator";
import { InkField } from "./InkField";
import { GlitchDirector } from "./GlitchDirector";
import { VoidNav } from "./VoidNav";
import { VoidHero } from "./VoidHero";
import { VoidAbout, VoidEducation, VoidSkills } from "./VoidSections";
import { VoidCertifications, VoidExperience, VoidProjects } from "./VoidWork";
import { VoidContact, VoidFooter } from "./VoidContact";

/** The redesigned Void interface. Mounted lazily the first time it is summoned. */
export function VoidPortfolio() {
  const { mode } = usePortfolioTransition();
  const active = mode === "void";

  return (
    <MotionConfig reducedMotion="user">
      <div className="void-root">
        <InkField active={active} />
        <GlitchDirector active={active} />
        <div aria-hidden className="void-grain" data-no-suction />
        <div aria-hidden className="void-vignette" data-no-suction />
        <VoidNav />
        <main className="relative z-[3]">
          <VoidHero />
          <VoidAbout />
          <VoidEducation />
          <VoidSkills />
          <VoidProjects />
          <VoidCertifications />
          <VoidExperience />
          <VoidContact />
        </main>
        <div className="relative z-[3]">
          <VoidFooter />
        </div>
      </div>
    </MotionConfig>
  );
}
