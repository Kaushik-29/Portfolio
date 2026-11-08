import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import { BlackHoleEngine } from "./blackHoleEngine";
import { collectAtoms, emerge, jitter, suck } from "./suction";

export type PortfolioMode = "original" | "void";

/** Favicon shown while the Void interface is active (public/favicon-void.ico). */
const VOID_FAVICON = "/favicon-void.ico";

type Ctx = {
  mode: PortfolioMode;
  busy: boolean;
  /** True once the Void layer has been mounted (it stays mounted afterwards). */
  voidMounted: boolean;
  toggle: (origin: HTMLElement) => void;
  registerLayer: (mode: PortfolioMode, el: HTMLElement | null) => void;
};

const TransitionContext = createContext<Ctx | null>(null);

export function usePortfolioTransition() {
  const ctx = useContext(TransitionContext);
  if (!ctx) throw new Error("usePortfolioTransition must be used inside <TransitionCoordinator>");
  return ctx;
}

/** Timeline (ms). Total ≈ 2.5s. */
const T = {
  activate: 160,
  suctionDelay: 380,
  suctionDur: 640,
  suction: 1040,
  collapse: 240,
  glitch: 360,
  awaken: 780,
  emergeDelay: 300,
  emergeDur: 620,
  reducedFade: 420,
};

const wait = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal.aborted) return reject(new DOMException("aborted", "AbortError"));
    const id = window.setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        window.clearTimeout(id);
        reject(new DOMException("aborted", "AbortError"));
      },
      { once: true },
    );
  });

/** Next paint, with a timer fallback so a background tab (rAF paused) can't stall the sequence. */
const nextFrame = () =>
  new Promise<void>((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      resolve();
    };
    const raf = requestAnimationFrame(finish);
    const timer = window.setTimeout(finish, 60);
  });

function visibleBlackHoleButton(layer: HTMLElement | null) {
  if (!layer) return null;
  const btns = Array.from(layer.querySelectorAll<HTMLElement>("[data-blackhole]"));
  return btns.find((b) => b.getClientRects().length > 0) ?? null;
}

function centerOf(el: Element) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

/**
 * Shared coordinator for the original ⇄ Void transformation.
 * Both layers stay mounted (Void lazily, on first use) so each keeps its own
 * state; the inactive one is `hidden` + `inert`.
 */
export function TransitionCoordinator({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<PortfolioMode>("original");
  const [busy, setBusy] = useState(false);
  const [voidMounted, setVoidMounted] = useState(false);
  const [announce, setAnnounce] = useState("");

  const modeRef = useRef<PortfolioMode>("original");
  const busyRef = useRef(false);
  const layers = useRef<Record<PortfolioMode, HTMLElement | null>>({ original: null, void: null });
  const scrollPos = useRef<Record<PortfolioMode, number>>({ original: 0, void: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const engineRef = useRef<BlackHoleEngine | null>(null);
  const animsRef = useRef<Animation[]>([]);
  const pinY = useRef<number | null>(null);

  const registerLayer = useCallback((m: PortfolioMode, el: HTMLElement | null) => {
    layers.current[m] = el;
  }, []);

  const cancelAnims = () => {
    for (const a of animsRef.current) {
      try {
        a.cancel();
      } catch {
        /* ignore */
      }
    }
    animsRef.current = [];
  };

  const cleanup = useCallback(() => {
    cancelAnims();
    engineRef.current?.destroy();
    engineRef.current = null;
    document.documentElement.classList.remove("bh-lock");
    pinY.current = null;
    busyRef.current = false;
    // Commit synchronously so the (re-enabled) button can receive focus right away.
    flushSync(() => setBusy(false));
  }, []);

  // Keep <html> in sync for page-level background / colour-scheme.
  useEffect(() => {
    document.documentElement.dataset.portfolio = mode;
  }, [mode]);

  // Favicon follows the active interface: the Void icon inside the Void, and
  // whatever icon the page originally declared everywhere else.
  useEffect(() => {
    const links = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]'));
    for (const link of links) {
      if (link.dataset.originalHref === undefined)
        link.dataset.originalHref = link.getAttribute("href") ?? "";
      link.href = mode === "void" ? VOID_FAVICON : link.dataset.originalHref;
    }
  }, [mode]);

  // Abort everything on unmount. While a transition runs, the scroll position is
  // pinned so nothing (e.g. router scroll restoration) can move content mid-animation.
  useEffect(() => {
    const onResize = () => engineRef.current?.resize();
    const onScroll = () => {
      const y = pinY.current;
      if (y !== null && Math.abs(window.scrollY - y) > 1) {
        window.scrollTo({ top: y, left: 0, behavior: "instant" as ScrollBehavior });
      }
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      abortRef.current?.abort();
      cancelAnims();
      engineRef.current?.destroy();
      document.documentElement.classList.remove("bh-lock");
      delete document.documentElement.dataset.portfolio;
    };
  }, []);

  const swap = useCallback((to: PortfolioMode) => {
    const from = modeRef.current;
    scrollPos.current[from] = pinY.current ?? window.scrollY;
    flushSync(() => setMode(to));
    modeRef.current = to;
    const target = scrollPos.current[to];
    if (pinY.current !== null) pinY.current = target;
    window.scrollTo({ top: target, left: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  const toggle = useCallback(
    (originEl: HTMLElement) => {
      if (busyRef.current || !canvasRef.current) return;
      busyRef.current = true;
      setBusy(true);

      const from = modeRef.current;
      const to: PortfolioMode = from === "original" ? "void" : "original";
      if (to === "void") setVoidMounted(true);

      const controller = new AbortController();
      abortRef.current = controller;
      const { signal } = controller;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const engine = new BlackHoleEngine(canvasRef.current);
      engineRef.current = engine;
      const origin = centerOf(originEl);
      engine.setOrigin(origin.x, origin.y);
      pinY.current = window.scrollY;
      document.documentElement.classList.add("bh-lock");

      const run = async () => {
        engine.start();

        if (reduced) {
          engine.setPhase("fade", T.reducedFade);
          await wait(T.reducedFade / 2, signal);
          swap(to);
          await wait(T.reducedFade / 2, signal);
        } else {
          // Phase 1 — activation
          engine.setPhase("activate", T.activate);
          await wait(T.activate, signal);

          // Phase 2 — gravitational suction
          const fromLayer = layers.current[from];
          const atoms = fromLayer ? collectAtoms(fromLayer) : [];
          let budget = window.innerWidth < 768 ? 160 : 420;
          animsRef.current = suck(
            atoms,
            origin,
            { maxDelay: T.suctionDelay, duration: T.suctionDur },
            (atom, delay) => {
              if (budget <= 0 || atom.kind === "text") return;
              budget -= engine.spawnFrom(atom.rect, delay, Math.min(budget, 24));
            },
          );
          engine.setPhase("suction", T.suction);
          await wait(T.suction, signal);

          // Phase 3 — collapse into darkness
          engine.setPhase("collapse", T.collapse);
          await wait(T.collapse, signal);

          // Swap layers under the black frame
          swap(to);
          cancelAnims();
          await nextFrame();
          const toLayer = layers.current[to];

          // Phase 4 — glitch
          engine.setPhase("glitch", T.glitch);
          if (toLayer) animsRef.current = jitter(toLayer, T.glitch);
          await wait(T.glitch, signal);
          cancelAnims();

          // Phase 5 — awakening: new interface blooms out of the hole
          const btn = visibleBlackHoleButton(toLayer);
          const hole = btn ? centerOf(btn) : origin;
          engine.setOrigin(hole.x, hole.y);
          engine.setPhase("awaken", T.awaken);
          if (toLayer) {
            animsRef.current = emerge(collectAtoms(toLayer), hole, {
              maxDelay: T.emergeDelay,
              duration: T.emergeDur,
            });
          }
          await wait(T.awaken, signal);
          // Let the last emerging elements land (bounded, never hangs).
          await Promise.race([
            Promise.allSettled(animsRef.current.map((a) => a.finished)),
            wait(450, signal),
          ]);
        }

        cleanup();
        setAnnounce(to === "void" ? "Void theme activated" : "Original theme restored");
        visibleBlackHoleButton(layers.current[to])?.focus({ preventScroll: true });
      };

      run().catch((err) => {
        if ((err as DOMException)?.name !== "AbortError") console.error(err);
        // Make sure we never leave the UI locked or half-transformed.
        if (modeRef.current !== to && !signal.aborted) swap(to);
        cleanup();
      });
    },
    [cleanup, swap],
  );

  const value = useMemo<Ctx>(
    () => ({ mode, busy, voidMounted, toggle, registerLayer }),
    [mode, busy, voidMounted, toggle, registerLayer],
  );

  return (
    <TransitionContext.Provider value={value}>
      {children}
      <canvas
        ref={canvasRef}
        aria-hidden
        data-no-suction
        className="pointer-events-none fixed inset-0 z-[10000] h-full w-full"
        style={{ display: "none" }}
      />
      {busy && (
        <div aria-hidden data-no-suction className="fixed inset-0 z-[10001] cursor-progress" />
      )}
      <p aria-live="polite" className="sr-only">
        {announce}
      </p>
    </TransitionContext.Provider>
  );
}

/** Wraps one interface. Inactive layers are hidden and inert. */
export function PortfolioLayer({
  mode: layerMode,
  children,
}: {
  mode: PortfolioMode;
  children: ReactNode;
}) {
  const { mode, registerLayer } = usePortfolioTransition();
  const active = mode === layerMode;
  const ref = useCallback(
    (el: HTMLDivElement | null) => registerLayer(layerMode, el),
    [layerMode, registerLayer],
  );
  return (
    <div ref={ref} data-layer={layerMode} hidden={!active} inert={!active} aria-hidden={!active}>
      {children}
    </div>
  );
}
