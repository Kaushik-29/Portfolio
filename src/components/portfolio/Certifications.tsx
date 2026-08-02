import { motion } from "framer-motion";
import { SectionHeading } from "./SectionHeading";
import { FaAws, FaMicrosoft } from "react-icons/fa";
import {
  SiCisco,
  SiSalesforce,
  SiSap,
  SiUdemy,
  SiCoursera,
} from "react-icons/si";
import type { IconType } from "react-icons";


/* ─────────────────────────────────────────────
   Map brand key → react-icon component + colour
   (all render as inline SVG — no network requests)
───────────────────────────────────────────── */
type BrandConfig = { Icon: IconType; color: string } | { Icon: null; color: string; label: string };

const brandIcons: Record<string, BrandConfig> = {
  AWS:        { Icon: FaAws,       color: "#FF9900" },
  Microsoft:  { Icon: FaMicrosoft, color: "#0078D4" },  // 4-square Windows cubes
  Cisco:      { Icon: SiCisco,     color: "#00b4d8" },
  Salesforce: { Icon: SiSalesforce,color: "#00A1E0" },
  SAP:        { Icon: SiSap,       color: "#008FD3" },
  Udemy:      { Icon: SiUdemy,     color: "#A435F0" },
  Coursera:   { Icon: SiCoursera,  color: "#0056D2" },
  // SiMatlab not available in this react-icons version → initial badge
  MathWorks:  { Icon: null, color: "#D1232A", label: "MW" },
  // NPTEL has no react-icon → styled initial badge
  NPTEL:      { Icon: null, color: "#E76F51", label: "N" },
};

function BrandLogo({ logoKey, color, fallback }: { logoKey: string; color: string; fallback: string }) {
  const cfg = brandIcons[logoKey];
  if (!cfg || !cfg.Icon) {
    // Coloured initial badge
    return (
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-[9px] font-black text-white"
        style={{ backgroundColor: color }}
      >
        {fallback}
      </span>
    );
  }
  const { Icon, color: iconColor } = cfg as { Icon: IconType; color: string };
  return <Icon className="text-2xl shrink-0" style={{ color: iconColor }} />;
}


/* ─────────────────────────────────────────────
   12 certifications  —  4 columns × 3 rows
───────────────────────────────────────────── */
const certificationsList = [
  {
    title: "C Programming For Beginners – Master the C Language",
    issuer: "UDEMY",
    issuerFull: "Udemy",
    date: "Nov 2023",
    logoKey: "Udemy",
    color: "#A435F0",
    fallback: "U",
    desc: "Comprehensive 25.5-hour course covering C fundamentals, memory management, pointers, and systems programming concepts.",
  },
  {
    title: "C++ Data Structures in the STL",
    issuer: "COURSERA",
    issuerFull: "Coursera",
    date: "Apr 2024",
    logoKey: "Coursera",
    color: "#0056D2",
    fallback: "C",
    desc: "Hands-on project certificate covering STL containers, iterators, algorithms, and modern C++ data structure patterns.",
  },
  {
    title: "Programming in Java (NPTEL)",
    issuer: "NPTEL",
    issuerFull: "NPTEL / IIT",
    date: "Jul – Oct 2024",
    logoKey: "NPTEL",
    color: "#E76F51",
    fallback: "N",
    desc: "Elite-ranked course covering core Java, OOP principles, exception handling, and collections with a score of 62%.",
  },
  {
    title: "Deep Learning Onramp",
    issuer: "MATHWORKS",
    issuerFull: "MathWorks",
    date: "Apr 26, 2025",
    logoKey: "MathWorks",
    color: "#D1232A",
    fallback: "MW",
    desc: "Hands-on introduction to deep learning networks, convolutional architectures, and training workflows using MATLAB.",
  },
  {
    title: "Microsoft Certified: Azure AI Fundamentals (AI-900)",
    issuer: "MICROSOFT",
    issuerFull: "Microsoft",
    date: "Aug 28, 2025",
    logoKey: "Microsoft",
    color: "#0078D4",
    fallback: "MS",
    desc: "Demonstrates understanding of machine learning models and artificial intelligence concepts built on Microsoft Azure.",
  },
  {
    title: "Introduction to Machine Learning (NPTEL)",
    issuer: "NPTEL",
    issuerFull: "NPTEL / IIT",
    date: "Jul – Sep 2025",
    logoKey: "NPTEL",
    color: "#E76F51",
    fallback: "N",
    desc: "8-week rigorous course covering supervised learning, regression, classification, clustering, and model evaluation.",
  },
  {
    title: "Networking Basics",
    issuer: "CISCO",
    issuerFull: "Cisco Networking Academy",
    date: "Oct 3, 2025",
    logoKey: "Cisco",
    color: "#00b4d8",
    fallback: "CI",
    desc: "Completed training on network switching, routing principles, protocols, and standard network architectures.",
  },
  {
    title: "Salesforce Certified Agentforce Specialist",
    issuer: "SALESFORCE",
    issuerFull: "Salesforce",
    date: "Dec 2025",
    logoKey: "Salesforce",
    color: "#00A1E0",
    fallback: "SF",
    desc: "Credentialed in building, configuring, and deploying autonomous AI agents with Agentforce technologies.",
  },
  {
    title: "Microsoft Certified: Azure Fundamentals (AZ-900)",
    issuer: "MICROSOFT",
    issuerFull: "Microsoft",
    date: "Dec 2025",
    logoKey: "Microsoft",
    color: "#0078D4",
    fallback: "MS",
    desc: "Validates foundational capabilities across cloud services, operating models, security, privacy, and architecture.",
  },
  {
    title: "SAP Certified – SAP Generative AI Developer",
    issuer: "SAP",
    issuerFull: "SAP",
    date: "Valid thru Mar 2027",
    logoKey: "SAP",
    color: "#008FD3",
    fallback: "SAP",
    desc: "Focuses on deploying Large Language Models (LLMs), orchestration frameworks, and SAP AI Core infrastructure.",
  },
  {
    title: "AWS Certified Cloud Practitioner",
    issuer: "AMAZON",
    issuerFull: "Amazon Web Services (AWS)",
    date: "Valid thru Mar 2029",
    logoKey: "AWS",
    color: "#FF9900",
    fallback: "AWS",
    desc: "Validates foundational knowledge of AWS Cloud platform, architectural principles, services, and security compliance.",
  },
  {
    title: "AWS Certified AI Practitioner",
    issuer: "AMAZON",
    issuerFull: "Amazon Web Services (AWS)",
    date: "Valid thru Jun 2029",
    logoKey: "AWS",
    color: "#FF9900",
    fallback: "AWS",
    desc: "Validates forward-looking expertise in artificial intelligence, machine learning, and generative AI patterns on AWS.",
  },
];

export function Certifications() {
  return (
    <section id="certifications" className="section-pad relative">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: `radial-gradient(circle at 80% 50%, rgba(215, 38, 56, 0.05) 0%, transparent 60%)` }}
      />

      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading eyebrow="Credentials" title="Certifications" />

        {/* 4-column × 3-row grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {certificationsList.map((cert, idx) => (
            <motion.div
              key={cert.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (idx % 4) * 0.08 }}
              whileHover={{ y: -8 }}
              className="group relative flex flex-col border border-gold/20 bg-deep-red-3/45 p-6 transition-all duration-300 hover:border-gold hover:shadow-[0_15px_40px_-15px_rgba(212,175,55,0.3)]"
            >
              {/* Brand-colour top accent bar */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px] transition-all duration-300 group-hover:h-[4px]"
                style={{ backgroundColor: cert.color }}
              />

              {/* Row 1: Logo LEFT | Issuer chip RIGHT */}
              <div className="flex items-start justify-between">
                <div className="rounded border border-gold/30 bg-deep-red-2 p-3 transition-colors duration-300 group-hover:border-gold group-hover:bg-deep-red-3">
                  <BrandLogo logoKey={cert.logoKey} color={cert.color} fallback={cert.fallback} />
                </div>
                <span className="text-[10px] font-semibold tracking-wider text-gold uppercase opacity-80 bg-gold/5 px-2.5 py-0.5 border border-gold/10">
                  {cert.issuer}
                </span>
              </div>

              {/* Row 2: Title */}
              <h3 className="mt-5 text-base font-bold leading-snug text-cream transition-colors duration-300 group-hover:text-gold line-clamp-2 min-h-[3rem]">
                {cert.title}
              </h3>

              {/* Row 3: Full issuer */}
              <p className="mt-1 text-xs text-cream/70">{cert.issuerFull}</p>

              {/* Row 4: Description */}
              <p className="mt-3 text-xs text-cream/60 leading-relaxed line-clamp-3 min-h-[3.375rem] group-hover:text-cream/85 transition-colors duration-300">
                {cert.desc}
              </p>

              {/* Row 5: DATE / STATUS footer */}
              <div className="mt-4 flex items-center justify-between border-t border-gold/10 pt-3 text-[10px]">
                <span className="text-cream/40 uppercase tracking-wider">Date / Status:</span>
                <span className="font-semibold text-gold tracking-wide">{cert.date}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

