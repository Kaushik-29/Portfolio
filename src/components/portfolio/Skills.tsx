import { motion } from "framer-motion";
import { SectionHeading } from "./SectionHeading";
import { skills as skillNames, sectionHeadings } from "@/content/portfolio";
import { skillIcons } from "@/content/icons";

const skills = skillNames.map((name) => ({ name, icon: skillIcons[name] }));

export function Skills() {
  return (
    <section id="skills" className="section-pad relative">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading {...sectionHeadings.skills} />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {skills.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (i % 8) * 0.05 }}
                whileHover={{ scale: 1.04 }}
                className="group flex items-center gap-4 border border-gold/25 bg-deep-red-3/50 p-4 transition-all hover:border-gold hover:shadow-[0_10px_30px_-10px_rgba(212,175,55,0.5)]"
              >
                <div className="grid h-12 w-12 shrink-0 place-items-center border border-gold/40 bg-deep-red-2 transition-colors group-hover:border-gold">
                  <Icon className="text-2xl text-gold" />
                </div>
                <span className="text-sm font-semibold uppercase tracking-wider text-cream md:text-base">
                  {s.name}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}