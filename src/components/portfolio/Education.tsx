import { motion } from "framer-motion";
import { FaUniversity, FaSchool, FaGraduationCap } from "react-icons/fa";
import type { IconType } from "react-icons";
import { SectionHeading } from "./SectionHeading";
import { education, sectionHeadings, type EducationItem } from "@/content/portfolio";

const eduIcons: Record<EducationItem["key"], IconType> = {
  university: FaUniversity,
  college: FaGraduationCap,
  school: FaSchool,
};

const items: (EducationItem & { icon: IconType })[] = education.map((e) => ({
  ...e,
  icon: eduIcons[e.key],
}));

export function Education() {
  return (
    <section id="education" className="section-pad relative">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading {...sectionHeadings.education} />
        <div className="space-y-6">
          {items.map((it, i) => {
            const Icon = it.icon;
            return (
              <motion.div
                key={it.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="group grid grid-cols-[auto_1fr] items-center gap-6 border border-gold/30 bg-deep-red-3/50 p-5 transition-all hover:border-gold hover:shadow-[0_20px_60px_-20px_rgba(212,175,55,0.35)] md:gap-8 md:p-7"
              >
                {/* Institution logo box */}
                <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden border border-gold/60 bg-deep-red-2 md:h-28 md:w-28">
                  <img
                    src={it.logoUrl}
                    alt={it.name}
                    className="h-full w-full object-contain p-2"
                    onError={(e) => {
                      const el = e.currentTarget as HTMLImageElement;
                      el.style.display = "none";
                      const next = el.nextElementSibling as HTMLElement | null;
                      if (next) next.style.display = "flex";
                    }}
                  />
                  {/* Fallback icon shown only if image fails */}
                  <div className="hidden h-full w-full items-center justify-center">
                    <Icon className="text-3xl text-gold md:text-5xl" />
                  </div>
                </div>

                <div className="min-w-0">
                  <h3 className="truncate text-lg font-bold text-cream md:text-2xl">
                    {it.name}
                  </h3>
                  <p className="mt-1 text-sm text-cream/80 md:text-base">{it.degree}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
                    <span className="font-semibold text-gold">{it.score}</span>
                    <span className="text-cream/60">{it.years}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
