import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { Nav } from "@/components/portfolio/Nav";
import { Hero } from "@/components/portfolio/Hero";
import { About } from "@/components/portfolio/About";
import { Education } from "@/components/portfolio/Education";
import { Skills } from "@/components/portfolio/Skills";
import { Projects } from "@/components/portfolio/Projects";
import { Certifications } from "@/components/portfolio/Certifications";
import { Experience } from "@/components/portfolio/Experience";
import { Contact } from "@/components/portfolio/Contact";
import { Footer } from "@/components/portfolio/Footer";
import { LoadingScreen } from "@/components/portfolio/LoadingScreen";
import { MouseGlow } from "@/components/portfolio/MouseGlow";
import { ThemeProvider } from "@/components/portfolio/ThemeSelector";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kaushik Kumar Reddy S — Full Stack & AI/ML Engineer" },
      {
        name: "description",
        content:
          "Portfolio of Kaushik Kumar Reddy S — B.Tech CSE (AI & ML) at SRM. Full Stack Engineer building AI-powered, scalable, production-grade products.",
      },
      { property: "og:title", content: "Kaushik Kumar Reddy S — Full Stack & AI/ML Engineer" },
      {
        property: "og:description",
        content:
          "Premium portfolio showcasing full-stack engineering, AI/ML projects, and research work.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <ThemeProvider>
    <div className="relative min-h-screen overflow-x-hidden text-cream">
      <LoadingScreen />
      <MouseGlow />
      <Nav />
      <main className="relative z-10">
        <Hero />
        <About />
        <Education />
        <Skills />
        <Projects />
        <Certifications />
        <Experience />
        <Contact />
      </main>
      <Footer />
      <Toaster theme="dark" position="top-center" />
    </div>
    </ThemeProvider>
  );
}
