/**
 * DOM side of the black-hole transition.
 *
 * Every visible "atom" (text block, image, video, icon, card, background box)
 * inside the active layer is animated along a curved gravitational path into
 * the hole using the Web Animations API — no React re-renders, no layout
 * changes, and every animation is cancelled afterwards so the DOM is left
 * exactly as it was.
 */

const MEDIA = new Set([
  "IMG",
  "VIDEO",
  "CANVAS",
  "INPUT",
  "TEXTAREA",
  "SELECT",
  "PICTURE",
  "IFRAME",
]);
const REJECT = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "LINK", "META", "BR", "WBR"]);

export type Atom = {
  el: Element;
  rect: DOMRect;
  kind: "media" | "text" | "box";
};

function isPaintedBox(cs: CSSStyleDeclaration) {
  if (cs.backgroundImage && cs.backgroundImage !== "none") return true;
  const bg = cs.backgroundColor;
  if (bg && bg !== "transparent" && !/rgba\([^)]*,\s*0\)$/.test(bg)) return true;
  if (cs.boxShadow && cs.boxShadow !== "none") return true;
  const bw =
    parseFloat(cs.borderTopWidth) +
    parseFloat(cs.borderRightWidth) +
    parseFloat(cs.borderBottomWidth) +
    parseFloat(cs.borderLeftWidth);
  return bw > 0 && cs.borderTopStyle !== "none";
}

function hasDirectText(el: Element) {
  for (const n of el.childNodes) {
    if (n.nodeType === Node.TEXT_NODE && n.textContent && n.textContent.trim()) return true;
  }
  return false;
}

/** Collect the visible atoms of `root` that intersect the viewport. */
export function collectAtoms(root: HTMLElement, limit = 320): Atom[] {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const seen = new Set<Element>();
  const atoms: Atom[] = [];

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
    acceptNode(node) {
      const el = node as Element;
      if (REJECT.has(el.tagName)) return NodeFilter.FILTER_REJECT;
      if (el instanceof SVGElement && !(el instanceof SVGSVGElement))
        return NodeFilter.FILTER_REJECT;
      if ((el as HTMLElement).dataset?.noSuction !== undefined) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let node = walker.nextNode() as Element | null;
  while (node) {
    const el = node;
    node = walker.nextNode() as Element | null;

    const rect = el.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) continue;
    if (rect.bottom < 0 || rect.top > vh || rect.right < 0 || rect.left > vw) continue;

    const anyEl = el as HTMLElement & { checkVisibility?: (o: object) => boolean };
    if (
      anyEl.checkVisibility &&
      !anyEl.checkVisibility({ opacityProperty: true, visibilityProperty: true })
    )
      continue;

    const cs = getComputedStyle(el);
    let kind: Atom["kind"] | null = null;
    if (MEDIA.has(el.tagName) || el instanceof SVGSVGElement) kind = "media";
    else if (hasDirectText(el)) kind = "text";
    else if (isPaintedBox(cs)) kind = "box";
    if (!kind) continue;

    // Transforms don't apply to inline boxes — promote to the nearest non-inline ancestor.
    let target: Element = el;
    let tcs = cs;
    while (tcs.display === "inline" && target.parentElement && target.parentElement !== root) {
      target = target.parentElement;
      tcs = getComputedStyle(target);
    }
    if (seen.has(target)) continue;
    seen.add(target);
    atoms.push({ el: target, rect: target.getBoundingClientRect(), kind });
  }

  if (atoms.length > limit) {
    // Keep media and text first, then the largest boxes.
    atoms.sort((a, b) => {
      const pa = a.kind === "box" ? 1 : 0;
      const pb = b.kind === "box" ? 1 : 0;
      if (pa !== pb) return pa - pb;
      return b.rect.width * b.rect.height - a.rect.width * a.rect.height;
    });
    atoms.length = limit;
  }
  return atoms;
}

type Point = { x: number; y: number };

function pathFrames(atom: Atom, hole: Point, rand: () => number) {
  const cx = atom.rect.left + atom.rect.width / 2;
  const cy = atom.rect.top + atom.rect.height / 2;
  const vx = cx - hole.x;
  const vy = cy - hole.y;
  const area = atom.rect.width * atom.rect.height;
  const big = area > window.innerWidth * window.innerHeight * 0.25;
  const swirl = (0.9 + rand() * 0.9) * (big ? 0.5 : 1);
  const rotMax = (big ? 25 : 120 + rand() * 360) * (rand() < 0.5 ? -1 : 1);
  const skewMax = atom.kind === "text" ? 18 + rand() * 18 : 8;
  const blur = atom.kind !== "text";
  const steps = 8;
  const frames: Keyframe[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const e = t * t * (1.2 - 0.2 * t); // gentle start, hard pull at the end
    const r = 1 - e;
    const ang = swirl * e * Math.PI * 0.9;
    const cos = Math.cos(ang);
    const sin = Math.sin(ang);
    const px = hole.x + (vx * cos - vy * sin) * r;
    const py = hole.y + (vx * sin + vy * cos) * r;
    const tx = px - cx;
    const ty = py - cy;
    const s = Math.max(0.002, 1 - e * 0.998);
    const sx = s * (1 + Math.sin(t * Math.PI) * 0.35); // stretch along the fall
    const sy = s * (1 - Math.sin(t * Math.PI) * 0.2);
    const frame: Keyframe = {
      offset: t,
      transform: `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) rotate(${(rotMax * e).toFixed(1)}deg) skewX(${(skewMax * Math.sin(t * Math.PI)).toFixed(1)}deg) scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`,
      opacity: i === steps ? 0 : t > 0.8 ? 1 - (t - 0.8) * 4 : 1,
    };
    if (blur) frame.filter = `blur(${(e * 5).toFixed(2)}px)`;
    frames.push(frame);
  }
  return frames;
}

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Pull atoms into the hole. Returns the running animations (fill: forwards). */
export function suck(
  atoms: Atom[],
  hole: Point,
  opts: { maxDelay: number; duration: number },
  onAtom?: (atom: Atom, delay: number) => void,
): Animation[] {
  const rand = seeded(7);
  const maxD = Math.max(
    1,
    ...atoms.map((a) =>
      Math.hypot(a.rect.left + a.rect.width / 2 - hole.x, a.rect.top + a.rect.height / 2 - hole.y),
    ),
  );
  const anims: Animation[] = [];
  for (const atom of atoms) {
    const d = Math.hypot(
      atom.rect.left + atom.rect.width / 2 - hole.x,
      atom.rect.top + atom.rect.height / 2 - hole.y,
    );
    const delay = (d / maxD) * opts.maxDelay * (0.75 + rand() * 0.25);
    const duration = opts.duration * (0.85 + rand() * 0.3);
    try {
      const anim = (atom.el as HTMLElement).animate(pathFrames(atom, hole, rand), {
        duration,
        delay,
        easing: "linear",
        fill: "forwards",
      });
      anims.push(anim);
      onAtom?.(atom, delay);
    } catch {
      /* element may have been detached — ignore */
    }
  }
  return anims;
}

/** Reverse of suck(): atoms are flung out of the hole into place. */
export function emerge(
  atoms: Atom[],
  hole: Point,
  opts: { maxDelay: number; duration: number },
): Animation[] {
  const rand = seeded(11);
  const maxD = Math.max(
    1,
    ...atoms.map((a) =>
      Math.hypot(a.rect.left + a.rect.width / 2 - hole.x, a.rect.top + a.rect.height / 2 - hole.y),
    ),
  );
  const anims: Animation[] = [];
  for (const atom of atoms) {
    const d = Math.hypot(
      atom.rect.left + atom.rect.width / 2 - hole.x,
      atom.rect.top + atom.rect.height / 2 - hole.y,
    );
    const frames = pathFrames(atom, hole, rand)
      .reverse()
      .map((f, i, arr) => ({ ...f, offset: i / (arr.length - 1) }));
    try {
      anims.push(
        (atom.el as HTMLElement).animate(frames, {
          duration: opts.duration * (0.85 + rand() * 0.3),
          delay: (d / maxD) * opts.maxDelay,
          easing: "cubic-bezier(0.1, 0.7, 0.3, 1)",
          fill: "backwards",
        }),
      );
    } catch {
      /* ignore */
    }
  }
  return anims;
}

/** Short horizontal-displacement jitter on top-level blocks of a layer. */
export function jitter(root: HTMLElement, duration: number): Animation[] {
  const targets = Array.from(root.querySelectorAll<HTMLElement>("header, section, footer")).filter(
    (el) => {
      const r = el.getBoundingClientRect();
      return r.bottom > 0 && r.top < window.innerHeight;
    },
  );
  const anims: Animation[] = [];
  for (const el of targets) {
    const frames: Keyframe[] = [];
    // Reality displacement: sideways tears, a hint of shear, and brief band cuts.
    for (let i = 0; i <= 8; i++) {
      const last = i === 8;
      const dx = last ? 0 : (Math.random() - 0.5) * 70;
      const skew = last ? 0 : (Math.random() - 0.5) * 4;
      const cut = !last && i % 3 === 1;
      const top = Math.random() * 60;
      frames.push({
        transform: `translateX(${dx.toFixed(1)}px) skewX(${skew.toFixed(2)}deg)`,
        clipPath: cut
          ? `inset(${top.toFixed(0)}% 0% ${(Math.random() * (90 - top)).toFixed(0)}% 0%)`
          : "inset(0% 0% 0% 0%)",
        offset: i / 8,
      });
    }
    try {
      anims.push(el.animate(frames, { duration, easing: "steps(8, end)" }));
    } catch {
      /* ignore */
    }
  }
  return anims;
}
