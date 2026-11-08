/**
 * Single source of truth for all portfolio facts.
 *
 * Every value here was moved verbatim from the original section components
 * (Hero, About, Education, Skills, Projects, Certifications, Experience,
 * Contact, Footer, Nav). Both the original theme and the Void theme read
 * from this file, so neither can drift from the other.
 *
 * Presentation-only values (icons, brand colours, gradients) stay inside
 * the components that use them.
 */

export const profile = {
  fullName: "Kaushik Kumar Reddy S",
  firstName: "Kaushik",
  nameLines: ["Kaushik Kumar", "Reddy S"],
  degree: "B.Tech CSE (AI & ML)",
  institution: "SRM Institute of Science and Technology",
  graduation: "Expected Graduation: 2027",
  tagline:
    "Full Stack Engineer passionate about AI, Machine Learning, scalable systems, and impactful products.",
  typewriterWords: [
    "an Aspiring AI Engineer",
    "a Full Stack Developer",
    "an AI Product Builder",
    "a Machine Learning Enthusiast",
    "a Problem Solver",
  ],
  resume: {
    href: "/Kaushik_Kumar_Reddy_Resume.pdf",
    fileName: "Kaushik_Kumar_Reddy_Resume.pdf",
  },
} as const;

export const navLinks = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#education", label: "Education" },
  { href: "#skills", label: "Skills" },
  { href: "#projects", label: "Projects" },
  { href: "#certifications", label: "Certifications" },
  { href: "#experience", label: "Experience" },
  { href: "#contact", label: "Contact" },
] as const;

export const sectionHeadings = {
  about: { eyebrow: "Who I Am", title: "About Me" },
  education: { eyebrow: "Academic Path", title: "Education" },
  skills: { eyebrow: "Toolkit", title: "Technical Skills" },
  projects: { eyebrow: "Selected Work", title: "Featured Projects" },
  certifications: { eyebrow: "Credentials", title: "Certifications" },
  experience: { eyebrow: "Journey", title: "Experience" },
  contact: { eyebrow: "Get In Touch", title: "Let's Connect" },
} as const;

export const about = {
  imageAlt: "Kaushik working",
  heading: "Crafting intelligent products.",
  paragraphs: [
    "I'm an undergraduate Computer Science engineer specializing in Artificial Intelligence and Machine Learning. I love bridging the gap between deep research and production-grade software — building scalable full-stack systems, training models, and shipping AI-powered features that solve real problems.",
    "From hackathon prototypes to research-grade projects, I focus on clean architecture, thoughtful UX, and engineering rigor — the kind of work recruiters and product teams can trust on day one.",
  ],
  badges: [
    "AI & ML Enthusiast",
    "Full Stack Developer",
    "Research-Oriented Engineer",
    "Hackathon Participant",
    "Problem Solver",
  ],
  stats: [
    { label: "Projects Completed", value: 15 },
    { label: "Certifications Earned", value: 12 },
    { label: "Hackathons Participated", value: 8 },
    { label: "CGPA", value: 8.94, decimals: 2 },
  ] as { label: string; value: number; decimals?: number }[],
};

export type EducationItem = {
  key: "university" | "college" | "school";
  logoUrl: string;
  name: string;
  degree: string;
  score: string;
  years: string;
};

export const education: EducationItem[] = [
  {
    key: "university",
    logoUrl: "https://skillnest.srmist.edu.in/srm-logo.png",
    name: "SRM Institute of Science and Technology",
    degree: "B.Tech Computer Science Engineering (AI & ML)",
    score: "CGPA: 8.94",
    years: "2023 – 2027",
  },
  {
    key: "college",
    logoUrl:
      "https://play-lh.googleusercontent.com/I5H5lHQojDjCkstsoMn1lCHaVIOkBUSnGIjgfvoS45owHgdqgsj3SQrlLa8hIP38vawQRn7EijA84TuRK5FdPg",
    name: "Sri Chaitanya Junior College",
    degree: "Higher Secondary — MPC (Mathematics, Physics, Chemistry)",
    score: "Percentage: 83.7%",
    years: "2021 – 2023",
  },
  {
    key: "school",
    logoUrl: "https://www.addressedu.com/assets/user_logo/be03d44140886c49e0772cb6752e66dc.jpeg",
    name: "Green Field International School",
    degree: "CBSE — Secondary Education (Class 10)",
    score: "Percentage: 88.8%",
    years: "2020 – 2021",
  },
];

/** Skill names in their original order. Icons live in the components. */
export const skills = [
  "Python",
  "Java",
  "C++",
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "FastAPI",
  "Flask",
  "TensorFlow",
  "OpenCV",
  "MongoDB",
  "MySQL",
  "Git",
  "Docker",
  "AWS",
] as const;
export type SkillName = (typeof skills)[number];

export type ProjectItem = {
  key: "flex" | "alleivo" | "commodity";
  title: string;
  subtitle: string;
  desc: string;
  stack: string[];
  github: string;
  live?: string;
};

export const projects: ProjectItem[] = [
  {
    key: "flex",
    title: "Flex-Flow-Fusion",
    subtitle: "AI • Computer Vision • Full Stack",
    desc: "AI-powered fitness platform that performs real-time posture analysis using computer vision, delivers instant exercise feedback, and tracks workout progress through an interactive full-stack web application.",
    stack: [
      "React",
      "TypeScript",
      "Tailwind CSS",
      "TensorFlow.js",
      "MoveNet",
      "FastAPI",
      "MongoDB",
    ],
    github: "https://github.com/Kaushik-29/flex-flow-fusion",
    live: "https://flexflowfusion.netlify.app/",
  },
  {
    key: "alleivo",
    title: "Allievo",
    subtitle: "AI • FinTech • Full Stack",
    desc: "Intelligent insurance management platform for gig delivery partners that predicts income disruptions, automates eligibility verification, and enables data-driven policy recommendations through AI-powered risk assessment.",
    stack: ["React", "FastAPI", "PostgreSQL", "Redis", "Celery", "XGBoost", "Tailwind CSS"],
    github: "https://github.com/Kaushik-29/Allievo",
    live: "https://allievo.netlify.app/",
  },
  {
    key: "commodity",
    title: "CommodityIQ",
    subtitle: "Machine Learning • Data Science",
    desc: "AI-driven forecasting platform that predicts agricultural commodity prices using historical market trends and weather data, helping farmers and traders make informed selling and procurement decisions.",
    stack: ["Python", "LSTM", "XGBoost", "Scikit-learn", "Pandas", "Flask", "Matplotlib"],
    github: "https://github.com/Kaushik-29/Agri-Commodity-Price-Predictor",
  },
];

export const projectsMore = {
  text: "Explore more AI, Full Stack, Machine Learning, Cloud, and Open Source projects on my GitHub profile.",
  label: "View All Projects on GitHub",
  href: "https://github.com/Kaushik-29",
};

export type CertLogoKey =
  | "Udemy"
  | "Coursera"
  | "NPTEL"
  | "MathWorks"
  | "Microsoft"
  | "Cisco"
  | "Salesforce"
  | "SAP"
  | "AWS";

export type CertificationItem = {
  title: string;
  issuer: string;
  issuerFull: string;
  date: string;
  logoKey: CertLogoKey;
  desc: string;
};

export const certifications: CertificationItem[] = [
  {
    title: "C Programming For Beginners – Master the C Language",
    issuer: "UDEMY",
    issuerFull: "Udemy",
    date: "Nov 2023",
    logoKey: "Udemy",
    desc: "Comprehensive 25.5-hour course covering C fundamentals, memory management, pointers, and systems programming concepts.",
  },
  {
    title: "C++ Data Structures in the STL",
    issuer: "COURSERA",
    issuerFull: "Coursera",
    date: "Apr 2024",
    logoKey: "Coursera",
    desc: "Hands-on project certificate covering STL containers, iterators, algorithms, and modern C++ data structure patterns.",
  },
  {
    title: "Programming in Java (NPTEL)",
    issuer: "NPTEL",
    issuerFull: "NPTEL / IIT",
    date: "Jul – Oct 2024",
    logoKey: "NPTEL",
    desc: "Elite-ranked course covering core Java, OOP principles, exception handling, and collections with a score of 62%.",
  },
  {
    title: "Deep Learning Onramp",
    issuer: "MATHWORKS",
    issuerFull: "MathWorks",
    date: "Apr 26, 2025",
    logoKey: "MathWorks",
    desc: "Hands-on introduction to deep learning networks, convolutional architectures, and training workflows using MATLAB.",
  },
  {
    title: "Microsoft Certified: Azure AI Fundamentals (AI-900)",
    issuer: "MICROSOFT",
    issuerFull: "Microsoft",
    date: "Aug 28, 2025",
    logoKey: "Microsoft",
    desc: "Demonstrates understanding of machine learning models and artificial intelligence concepts built on Microsoft Azure.",
  },
  {
    title: "Introduction to Machine Learning (NPTEL)",
    issuer: "NPTEL",
    issuerFull: "NPTEL / IIT",
    date: "Jul – Sep 2025",
    logoKey: "NPTEL",
    desc: "8-week rigorous course covering supervised learning, regression, classification, clustering, and model evaluation.",
  },
  {
    title: "Networking Basics",
    issuer: "CISCO",
    issuerFull: "Cisco Networking Academy",
    date: "Oct 3, 2025",
    logoKey: "Cisco",
    desc: "Completed training on network switching, routing principles, protocols, and standard network architectures.",
  },
  {
    title: "Salesforce Certified Agentforce Specialist",
    issuer: "SALESFORCE",
    issuerFull: "Salesforce",
    date: "Dec 2025",
    logoKey: "Salesforce",
    desc: "Credentialed in building, configuring, and deploying autonomous AI agents with Agentforce technologies.",
  },
  {
    title: "Microsoft Certified: Azure Fundamentals (AZ-900)",
    issuer: "MICROSOFT",
    issuerFull: "Microsoft",
    date: "Dec 2025",
    logoKey: "Microsoft",
    desc: "Validates foundational capabilities across cloud services, operating models, security, privacy, and architecture.",
  },
  {
    title: "SAP Certified – SAP Generative AI Developer",
    issuer: "SAP",
    issuerFull: "SAP",
    date: "Valid thru Mar 2027",
    logoKey: "SAP",
    desc: "Focuses on deploying Large Language Models (LLMs), orchestration frameworks, and SAP AI Core infrastructure.",
  },
  {
    title: "AWS Certified Cloud Practitioner",
    issuer: "AMAZON",
    issuerFull: "Amazon Web Services (AWS)",
    date: "Valid thru Mar 2029",
    logoKey: "AWS",
    desc: "Validates foundational knowledge of AWS Cloud platform, architectural principles, services, and security compliance.",
  },
  {
    title: "AWS Certified AI Practitioner",
    issuer: "AMAZON",
    issuerFull: "Amazon Web Services (AWS)",
    date: "Valid thru Jun 2029",
    logoKey: "AWS",
    desc: "Validates forward-looking expertise in artificial intelligence, machine learning, and generative AI patterns on AWS.",
  },
];

export type ExperienceItem = {
  key: "ai" | "fullstack" | "cloud" | "data" | "security";
  title: string;
  org: string;
  duration: string;
  tag: string;
  desc: string;
  skills: string[];
  certUrl: string;
};

export const experiences: ExperienceItem[] = [
  {
    key: "ai",
    title: "AI-ML Virtual Intern",
    org: "Google for Developers × EduSkills",
    duration: "Apr 2024 – Jun 2024",
    tag: "ARTIFICIAL INTELLIGENCE",
    desc: "Completed a 10-week AI & Machine Learning virtual internship focused on supervised learning, data preprocessing, model evaluation, and real-world AI workflows using Google's tools and frameworks.",
    skills: ["Python", "Machine Learning", "Scikit-Learn", "Data Analysis", "Neural Networks"],
    certUrl: "https://drive.google.com/file/d/1cNteqadIRcs9CGnGDjxDf_F9Ez7S5y49/view?usp=sharing",
  },
  {
    key: "fullstack",
    title: "Python Full Stack Virtual Intern",
    org: "EduSkills",
    duration: "Oct 2024 – Dec 2024",
    tag: "FULL STACK DEVELOPMENT",
    desc: "Developed full-stack web applications using Python, Flask, SQL, REST APIs, backend development, authentication, and deployment while gaining practical industry experience.",
    skills: ["Python", "Flask", "SQL", "REST API", "Authentication", "Deployment"],
    certUrl: "https://drive.google.com/file/d/1CmSo24bCa2vjT9RKvjE6Nefg2LBT_9WN/view?usp=sharing",
  },
  {
    key: "cloud",
    title: "Cloud Virtual Intern",
    org: "AWS Academy",
    duration: "Jan 2025 – Mar 2025",
    tag: "CLOUD COMPUTING",
    desc: "Learned cloud computing fundamentals including compute, storage, networking, virtualization, and deployment using AWS cloud services and best practices for scalable infrastructure.",
    skills: ["AWS", "EC2", "S3", "Cloud Computing", "Networking", "Virtualization"],
    certUrl: "https://drive.google.com/file/d/1rYsOaatZsKSDM7oXLm4A4IpWqSYq4Mfg/view?usp=sharing",
  },
  {
    key: "data",
    title: "Data Science Master Virtual Intern",
    org: "Altair",
    duration: "Apr 2025 – Jun 2025",
    tag: "DATA SCIENCE",
    desc: "Applied data science techniques including statistical analysis, visualization, feature engineering, and machine learning to solve real-world analytical problems using Altair's platform.",
    skills: [
      "Data Science",
      "Python",
      "Data Visualization",
      "Feature Engineering",
      "Machine Learning",
    ],
    certUrl: "https://drive.google.com/file/d/1fmIbt9WgyOFedERN6E33pA1m-m0f7hga/view?usp=sharing",
  },
  {
    key: "security",
    title: "Network Security Associate",
    org: "Fortinet",
    duration: "Jul 2025 – Sep 2025",
    tag: "CYBERSECURITY",
    desc: "Explored modern cybersecurity concepts including network security, firewalls, threat detection, secure communication, and enterprise security best practices using Fortinet's solutions.",
    skills: [
      "Cyber Security",
      "Networking",
      "Firewalls",
      "Threat Detection",
      "Enterprise Security",
    ],
    certUrl: "https://drive.google.com/file/d/1XsM7bafnlp8-XCqM9YrT4VdZu3KJ2Zpc/view?usp=sharing",
  },
];

export type ContactLinkKey = "github" | "linkedin" | "email" | "location";

export const contact = {
  intro:
    "Open to full-time roles, internships, freelance collaborations, and interesting research conversations. Drop a message — I respond within 24 hours.",
  links: [
    {
      key: "github",
      label: "GitHub",
      value: "github.com/Kaushik-29",
      href: "https://github.com/Kaushik-29",
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      value: "linkedin.com/in/kaushik29",
      href: "https://www.linkedin.com/in/kaushik29/",
    },
    {
      key: "email",
      label: "Email",
      value: "29skkr2005@gmail.com",
      href: "mailto:29skkr2005@gmail.com",
    },
    {
      key: "location",
      label: "Location",
      value: "Rajahmundry, India",
    },
  ] as { key: ContactLinkKey; label: string; value: string; href?: string }[],
  placeholders: {
    name: "Your Name",
    email: "Email",
    subject: "Subject (e.g. Hire Me, Collaboration…)",
    message: "Your message…",
  },
};

export const footer = {
  roles: "FULL STACK DEVELOPER • AI/ML DEVELOPER • ASPIRING SOFTWARE ENGINEER",
  copyright: "© 2026 Kaushik Kumar Reddy S. Designed & developed by Kaushik Kumar Reddy S.",
};
