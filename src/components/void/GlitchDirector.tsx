import { useEffect, useRef } from "react";

/**
 * Reality-distortion glitches for the Void layer — one controller, no React
 * re-renders. Every effect is a short Web Animations burst on real DOM nodes
 * (or temporary clones that are removed afterwards).
 *
 *   [data-glitch-auto]    image tears: horizontal slices of `.void-glitch-src`
 *                         (optional data-glitch-safe="0.45": the top 45% only
 *                         drifts a few px — used to protect the face)
 *   [data-glitch-text]    text splits into offset monochrome layers, snaps back
 *   [data-corruptible]    SVG ink that fragments when the cursor comes near
 *   [data-glitch-reveal]  section gets a flash of static/scanlines on first reveal
 *
 * Idle when the layer is inactive, the tab is hidden, a black-hole transition
 * is running, or the user prefers reduced motion.
 */

const INK = "#080909";
const ASH = "#77756F";

const rand = (a: number, b: number) => a + Math.random() * (b - a);

function makeNoiseUrl() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  if (!g) return "";
  const img = g.createImageData(128, 128);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() < 0.5 ? 8 : 234; // ink or ivory only
    img.data[i] = v;
    img.data[i + 1] = v - (v > 100 ? 4 : 0);
    img.data[i + 2] = v - (v > 100 ? 14 : 0);
    img.data[i + 3] = Math.random() < 0.55 ? 255 : 0;
  }
  g.putImageData(img, 0, 0);
  return c.toDataURL();
}

export function GlitchDirector({ active }: { active: boolean }) {
  const anchor = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = anchor.current?.closest<HTMLElement>(".void-root");
    if (!active || !root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const mobile = window.innerWidth < 768;
    const timers = new Set<number>();
    const anims = new Set<Animation>();
    const temps = new Set<Element>();
    const visible = new Set<Element>();
    const busy = new WeakSet<Element>();
    const noiseUrl = makeNoiseUrl();
    let disposed = false;

    const blocked = () =>
      disposed || document.hidden || document.documentElement.classList.contains("bh-lock");

    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        fn();
      }, ms);
      timers.add(id);
    };

    const track = (a: Animation, cleanup?: () => void) => {
      anims.add(a);
      a.finished
        .catch(() => undefined)
        .finally(() => {
          anims.delete(a);
          cleanup?.();
        });
      return a;
    };

    const addTemp = <T extends Element>(parent: Element, el: T) => {
      parent.appendChild(el);
      temps.add(el);
      return el;
    };
    const removeTemp = (el: Element) => {
      el.remove();
      temps.delete(el);
    };

    /* ── 1. Image tear ──────────────────────────────────────────────── */
    const tearImage = (host: HTMLElement) => {
      const src = host.querySelector<HTMLImageElement>(".void-glitch-src");
      const parent = src?.parentElement;
      if (!src || !parent || busy.has(host) || !src.complete) return;
      busy.add(host);
      if (getComputedStyle(parent).position === "static") parent.style.position = "relative";
      const safe = parseFloat(host.dataset.glitchSafe ?? "0");
      const bands = mobile ? 3 : 3 + ((Math.random() * 3) | 0);
      const duration = rand(300, 460);
      let pending = 0;
      const done = () => {
        if (--pending <= 0) busy.delete(host);
      };
      for (let i = 0; i < bands + 1; i++) {
        const shadow = i === bands; // last band: darkened fragment of the silhouette
        const top = rand(shadow ? Math.max(safe, 0.35) : 0, 0.94);
        const h = rand(0.02, shadow ? 0.06 : 0.08);
        const inFace = top < safe;
        const dx =
          (Math.random() < 0.5 ? -1 : 1) * (inFace ? rand(1, 3) : rand(8, mobile ? 14 : 26));
        const slice = src.cloneNode(false) as HTMLImageElement;
        slice.removeAttribute("fetchpriority");
        slice.alt = "";
        slice.setAttribute("aria-hidden", "true");
        slice.classList.remove("void-glitch-src");
        Object.assign(slice.style, {
          position: "absolute",
          inset: "0",
          pointerEvents: "none",
          clipPath: `inset(${(top * 100).toFixed(1)}% 0 ${(Math.max(0, 1 - top - h) * 100).toFixed(1)}% 0)`,
          filter: shadow ? "brightness(0.4) contrast(1.15)" : "contrast(1.08)",
          mixBlendMode: shadow ? "multiply" : "normal",
          opacity: "0",
        });
        addTemp(parent, slice);
        pending++;
        const a = slice.animate(
          [
            { transform: `translateX(${dx}px)`, opacity: shadow ? 0.38 : 1 },
            { transform: `translateX(${(-dx * 0.45).toFixed(1)}px)`, opacity: shadow ? 0.28 : 1 },
            { transform: `translateX(${(dx * 0.25).toFixed(1)}px)`, opacity: shadow ? 0.32 : 1 },
            { transform: "translateX(0px)", opacity: 0 },
          ],
          { duration, delay: rand(0, 90), easing: "steps(4, end)" },
        );
        track(a, () => {
          removeTemp(slice);
          done();
        });
      }
      // Faint scanlines across the image during the tear
      const lines = document.createElement("span");
      lines.setAttribute("aria-hidden", "true");
      Object.assign(lines.style, {
        position: "absolute",
        inset: "0",
        pointerEvents: "none",
        backgroundImage: `repeating-linear-gradient(0deg, rgba(8,9,9,0.14) 0 1px, transparent 1px 4px)`,
        opacity: "0",
      });
      addTemp(parent, lines);
      track(
        lines.animate([{ opacity: 0 }, { opacity: 1 }, { opacity: 0.3 }, { opacity: 0 }], {
          duration,
          easing: "steps(3, end)",
        }),
        () => removeTemp(lines),
      );
    };

    /* ── 2. Text split ──────────────────────────────────────────────── */
    const splitText = (el: HTMLElement) => {
      if (busy.has(el)) return;
      busy.add(el);
      if (getComputedStyle(el).position === "static") el.style.position = "relative";
      const layers: [string, number, number, number][] = [
        // colour, dx, clip top %, clip height %
        [ASH, rand(-7, -3), rand(5, 35), rand(18, 34)],
        [INK, rand(3, 7), rand(45, 70), rand(14, 26)],
      ];
      let pending = layers.length;
      for (const [color, dx, top, h] of layers) {
        const ghost = el.cloneNode(true) as HTMLElement;
        ghost.setAttribute("aria-hidden", "true");
        ghost.removeAttribute("data-glitch-text");
        ghost.removeAttribute("id");
        Object.assign(ghost.style, {
          position: "absolute",
          inset: "0",
          margin: "0",
          pointerEvents: "none",
          color,
          opacity: color === INK ? "0.55" : "0.9",
          transform: "none",
          clipPath: `inset(${top}% 0 ${Math.max(0, 100 - top - h)}% 0)`,
        });
        addTemp(el, ghost);
        const a = ghost.animate(
          [
            { transform: `translateX(${dx}px)`, offset: 0 },
            { transform: `translateX(${(-dx * 0.6).toFixed(1)}px)`, offset: 0.4 },
            { transform: `translateX(${(dx * 0.3).toFixed(1)}px)`, offset: 0.7 },
            { transform: "translateX(0px)", opacity: 0, offset: 1 },
          ],
          { duration: rand(200, 280), easing: "steps(3, end)" },
        );
        track(a, () => {
          removeTemp(ghost);
          if (--pending === 0) busy.delete(el);
        });
      }
    };

    /* ── 3. Shadow corruption (SVG ink near the cursor) ─────────────── */
    const corrupt = (el: Element) => {
      if (busy.has(el)) return;
      busy.add(el);
      const frames: Keyframe[] = [];
      for (let i = 0; i <= 6; i++) {
        const last = i === 6;
        const t = rand(0, 70);
        frames.push({
          transform: last
            ? "translate(0px, 0px)"
            : `translate(${rand(-16, 16).toFixed(1)}px, ${rand(-3, 3).toFixed(1)}px)`,
          clipPath: last
            ? "inset(0% 0% 0% 0%)"
            : `inset(${t.toFixed(0)}% 0% ${rand(0, 100 - t - 12).toFixed(0)}% 0%)`,
          opacity: last ? 1 : rand(0.35, 0.95),
        });
      }
      track(el.animate(frames, { duration: rand(380, 520), easing: "steps(6, end)" }), () => {
        later(() => busy.delete(el), 1600); // cool-down so it never flickers continuously
      });
    };

    /* ── 4. Section reveal static ───────────────────────────────────── */
    const staticFlash = (section: HTMLElement) => {
      const veil = document.createElement("span");
      veil.setAttribute("aria-hidden", "true");
      Object.assign(veil.style, {
        position: "absolute",
        inset: "0",
        zIndex: "20",
        pointerEvents: "none",
        backgroundImage: `repeating-linear-gradient(0deg, rgba(8,9,9,0.16) 0 1px, transparent 1px 3px), url(${noiseUrl})`,
        backgroundSize: "auto, 128px 128px",
        mixBlendMode: "multiply",
        opacity: "0",
      });
      addTemp(section, veil);
      const d = 380;
      track(
        veil.animate(
          [
            { opacity: 0, backgroundPosition: "0 0, 0 0" },
            { opacity: 0.55, backgroundPosition: "0 0, 37px 11px" },
            { opacity: 0.15, backgroundPosition: "0 0, -21px 64px" },
            { opacity: 0.4, backgroundPosition: "0 0, 90px -40px" },
            { opacity: 0, backgroundPosition: "0 0, 12px 3px" },
          ],
          { duration: d, easing: "steps(4, end)" },
        ),
        () => removeTemp(veil),
      );
      // Displace the heading for an instant (uses `translate`, so it never
      // fights the reveal animation's `transform`).
      const heading = section.querySelector("h2");
      if (heading)
        track(
          heading.animate(
            [
              { translate: "0px 0px" },
              { translate: `${rand(-14, -6).toFixed(0)}px 0px` },
              { translate: `${rand(5, 12).toFixed(0)}px 0px` },
              { translate: "0px 0px" },
            ],
            { duration: d, easing: "steps(3, end)" },
          ),
        );
    };

    /* ── Scheduling ─────────────────────────────────────────────────── */
    const autos = Array.from(root.querySelectorAll<HTMLElement>("[data-glitch-auto]"));
    const texts = Array.from(root.querySelectorAll<HTMLElement>("[data-glitch-text]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target);
          else visible.delete(e.target);
        }
      },
      { threshold: 0.2 },
    );
    [...autos, ...texts].forEach((el) => io.observe(el));

    const scheduleAuto = (el: HTMLElement) =>
      later(
        () => {
          if (!blocked() && visible.has(el)) {
            tearImage(el);
            // Sometimes the name echoes the tear.
            if (Math.random() < 0.45)
              texts
                .filter((t) => visible.has(t))
                .forEach((t) => later(() => !blocked() && splitText(t), rand(80, 220)));
          }
          scheduleAuto(el);
        },
        rand(6000, 13000),
      );
    const scheduleText = (el: HTMLElement) =>
      later(
        () => {
          if (!blocked() && visible.has(el)) splitText(el);
          scheduleText(el);
        },
        rand(9000, 16000),
      );
    autos.forEach((el) => later(() => scheduleAuto(el), rand(800, 2500)));
    texts.forEach(scheduleText);

    // First-time reveal static for selected sections
    const revealed = new WeakSet<Element>();
    const revealIo = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          // Ignore sightings during the black-hole transition (sections flash
          // through the viewport then); the reveal stays available for later.
          if (!e.isIntersecting || revealed.has(e.target) || blocked()) continue;
          revealed.add(e.target);
          later(() => staticFlash(e.target as HTMLElement), 120);
        }
      },
      { threshold: 0.18 },
    );
    root.querySelectorAll("[data-glitch-reveal]").forEach((el) => revealIo.observe(el));

    // Cursor proximity → shadow corruption (rAF-throttled, rects read lazily)
    const corruptibles = Array.from(root.querySelectorAll("[data-corruptible]"));
    const near = new WeakSet<Element>(); // edge-trigger: fire on approach, not while hovering
    let px = -1e4;
    let py = -1e4;
    let raf = 0;
    const check = () => {
      raf = 0;
      if (blocked()) return;
      for (const el of corruptibles) {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight || !r.width) continue;
        const dx = Math.max(r.left - px, 0, px - r.right);
        const dy = Math.max(r.top - py, 0, py - r.bottom);
        const d = Math.hypot(dx, dy);
        if (d < 40 && !near.has(el)) {
          near.add(el);
          corrupt(el);
        } else if (d > 90) near.delete(el);
      }
    };
    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      if (!raf) raf = requestAnimationFrame(check);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      disposed = true;
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
      io.disconnect();
      revealIo.disconnect();
      timers.forEach((id) => window.clearTimeout(id));
      anims.forEach((a) => a.cancel());
      temps.forEach((el) => el.remove());
    };
  }, [active]);

  return <span ref={anchor} hidden aria-hidden data-no-suction />;
}
