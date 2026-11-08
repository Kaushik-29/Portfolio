import { lazy, Suspense, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  PortfolioLayer,
  TransitionCoordinator,
  usePortfolioTransition,
} from "@/components/transition/TransitionCoordinator";
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

// The Void interface is code-split and preloaded when the browser is idle,
// so it is ready long before the black hole finishes collapsing.
const loadVoid = () => import("@/components/void/VoidPortfolio");
const VoidPortfolio = lazy(() => loadVoid().then((m) => ({ default: m.VoidPortfolio })));

function Index() {
  return (
    <TransitionCoordinator>
      <PortfolioLayer mode="original">
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
          </div>
        </ThemeProvider>
      </PortfolioLayer>
      <VoidLayer />
      <ModeToaster />
    </TransitionCoordinator>
  );
}

function VoidLayer() {
  const { voidMounted } = usePortfolioTransition();

  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(() => void loadVoid());
    else window.setTimeout(() => void loadVoid(), 2500);
  }, []);

  if (!voidMounted) return null;
  return (
    <PortfolioLayer mode="void">
      <Suspense fallback={null}>
        <VoidPortfolio />
      </Suspense>
    </PortfolioLayer>
  );
}

function ModeToaster() {
  const { mode } = usePortfolioTransition();
  return mode === "void" ? (
    <Toaster
      theme="light"
      position="top-center"
      toastOptions={{
        style: {
          background: "#EAE6DC",
          color: "#080909",
          border: "1.5px solid #080909",
          borderRadius: 0,
          fontFamily: "Inter, sans-serif",
        },
      }}
    />
  ) : (
    <Toaster theme="dark" position="top-center" />
  );
}
