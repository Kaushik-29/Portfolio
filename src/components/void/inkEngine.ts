/**
 * Living Void ink engine — one rAF loop, two canvases, no React.
 *
 *   back canvas  (behind content): zero-gravity ink particles  +  liquid ribbons / smoke
 *   front canvas (above content):  cursor droplets and ripples, plus ivory ink over
 *                                  dark regions (elements marked `data-ink-invert`)
 *
 * Motion comes from a time-varying curl-noise flow field, so nothing falls in one
 * direction and nothing loops visibly. The cursor (or touch) adds a gravitational
 * pull with a swirl; fast moves throw a ripple. When it rests, ink relaxes back
 * into the flow.
 */

/* ── Palette (strict) ───────────────────────────────────────────────────── */
const INK = "8, 9, 9";
const ASH = "119, 117, 111";
const STONE = "201, 195, 184";
const IVORY = "234, 230, 220";

/* ── Noise: 3D value noise + curl ───────────────────────────────────────── */
const PERM = new Uint8Array(512);
{
  const p = Array.from({ length: 256 }, (_, i) => i);
  let s = 1337;
  for (let i = 255; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) PERM[i] = p[i & 255];
}
const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const hash = (x: number, y: number, z: number) =>
  PERM[PERM[PERM[x & 255] + (y & 255)] + (z & 255)] / 255;

function noise3(x: number, y: number, z: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const xf = x - xi;
  const yf = y - yi;
  const zf = z - zi;
  const u = fade(xf);
  const v = fade(yf);
  const w = fade(zf);
  const x00 = lerp(hash(xi, yi, zi), hash(xi + 1, yi, zi), u);
  const x10 = lerp(hash(xi, yi + 1, zi), hash(xi + 1, yi + 1, zi), u);
  const x01 = lerp(hash(xi, yi, zi + 1), hash(xi + 1, yi, zi + 1), u);
  const x11 = lerp(hash(xi, yi + 1, zi + 1), hash(xi + 1, yi + 1, zi + 1), u);
  return lerp(lerp(x00, x10, v), lerp(x01, x11, v), w) * 2 - 1;
}

/** Two-octave potential; its curl is divergence-free, i.e. swirling, never "falling". */
function potential(x: number, y: number, t: number) {
  return (
    noise3(x * 0.0016, y * 0.0016, t * 0.05) +
    0.45 * noise3(x * 0.0041 + 31, y * 0.0041 - 17, t * 0.09)
  );
}
function curl(x: number, y: number, t: number, out: { x: number; y: number }) {
  const e = 6;
  const p = potential(x, y, t);
  out.x = (potential(x, y + e, t) - p) / e;
  out.y = -(potential(x + e, y, t) - p) / e;
  return out;
}

/* ── Types ──────────────────────────────────────────────────────────────── */
type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  depth: number; // 0.25 (far) .. 1 (near)
  size: number;
  alpha: number;
  kind: "drop" | "fragment";
  rot: number;
  vrot: number;
  shape: number[]; // fragment vertex radii
  wobble: number;
  style: string;
  styleOver: string;
};

type Mote = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
};

type Ribbon = {
  pts: { x: number; y: number }[];
  hx: number;
  hy: number;
  hvx: number;
  hvy: number;
  seg: number;
  width: number;
  thin: boolean;
  alpha: number;
  phase: number;
  twist: number;
  age: number;
  life: number;
  speed: number;
  seed: number;
  /** 0..1 — fragmentation caused by the cursor; relaxes back to 0 (reforms). */
  corrupt: number;
};

type Ripple = { x: number; y: number; r: number; max: number; a: number };

export type InkEngineOptions = { reducedMotion: boolean };

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const smooth = (e0: number, e1: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

export class InkEngine {
  private back: CanvasRenderingContext2D;
  private front: CanvasRenderingContext2D;
  private w = 0;
  private h = 0;
  private dpr = 1;
  private raf = 0;
  private running = false;
  private last = 0;
  private time = rand(0, 1000);
  private particles: Particle[] = [];
  private ribbons: Ribbon[] = [];
  private motes: Mote[] = []; // ribbon dissolve dust + cursor droplets
  private ripples: Ripple[] = [];
  private flow = { x: 0, y: 0 };
  private pointer = {
    x: -1e4,
    y: -1e4,
    vx: 0,
    vy: 0,
    activity: 0,
    touch: false,
    lastRipple: 0,
    inside: false,
  };
  private lastScroll = 0;
  private invertEls: Element[] = [];
  private invertRects: { top: number; bottom: number; left: number; right: number }[] = [];
  private invertDirty = true;
  private reduced: boolean;
  /** Phones: fewer, shorter ribbons, no smoke halo, smaller dust budget. */
  private lite = false;

  constructor(
    private backCanvas: HTMLCanvasElement,
    private frontCanvas: HTMLCanvasElement,
    private root: HTMLElement,
    opts: InkEngineOptions,
  ) {
    const b = backCanvas.getContext("2d");
    const f = frontCanvas.getContext("2d");
    if (!b || !f) throw new Error("2D canvas unavailable");
    this.back = b;
    this.front = f;
    this.reduced = opts.reducedMotion;
    this.lastScroll = window.scrollY;
    this.resize();
    this.collectInvert();
  }

  /* ── Lifecycle ──────────────────────────────────────────────────────── */
  start() {
    if (this.running) return;
    this.running = true;
    window.addEventListener("resize", this.onResize);
    window.addEventListener("scroll", this.onScroll, { passive: true });
    document.addEventListener("visibilitychange", this.onVisibility);
    if (this.reduced) {
      // One still composition: no loop, no cursor.
      for (let i = 0; i < 120; i++) this.step(1 / 60);
      this.draw();
      return;
    }
    window.addEventListener("pointermove", this.onPointer, { passive: true });
    window.addEventListener("pointerdown", this.onPointer, { passive: true });
    window.addEventListener("pointerup", this.onPointerUp, { passive: true });
    document.documentElement.addEventListener("pointerleave", this.onPointerUp);
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("scroll", this.onScroll);
    document.removeEventListener("visibilitychange", this.onVisibility);
    window.removeEventListener("pointermove", this.onPointer);
    window.removeEventListener("pointerdown", this.onPointer);
    window.removeEventListener("pointerup", this.onPointerUp);
    document.documentElement.removeEventListener("pointerleave", this.onPointerUp);
  }

  destroy() {
    this.stop();
    this.back.clearRect(0, 0, this.w, this.h);
    this.front.clearRect(0, 0, this.w, this.h);
    this.particles = [];
    this.ribbons = [];
    this.motes = [];
    this.ripples = [];
  }

  /** Re-scan elements whose background is dark (ink is drawn ivory over them). */
  refreshRegions() {
    this.invertDirty = true;
  }

  private loop = (now: number) => {
    if (!this.running) return;
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.step(dt);
    this.draw();
    this.raf = requestAnimationFrame(this.loop);
  };

  private onVisibility = () => {
    if (this.reduced) return;
    if (document.hidden) {
      cancelAnimationFrame(this.raf);
    } else if (this.running) {
      this.last = performance.now();
      cancelAnimationFrame(this.raf);
      this.raf = requestAnimationFrame(this.loop);
    }
  };

  private onResize = () => {
    this.resize();
    this.invertDirty = true;
    if (this.reduced) this.draw();
  };

  private onScroll = () => {
    const y = window.scrollY;
    const dy = y - this.lastScroll;
    this.lastScroll = y;
    // Depth parallax: near ink slides more than far ink, like moving through a volume.
    for (const p of this.particles) p.y -= dy * (0.12 + p.depth * 0.28);
    for (const r of this.ribbons) {
      const k = 0.18 * (r.thin ? 1.2 : 0.8);
      r.hy -= dy * k;
      for (const pt of r.pts) pt.y -= dy * k;
    }
    for (const m of this.motes) m.y -= dy * 0.3;
    if (this.reduced) this.draw();
  };

  private onPointer = (e: PointerEvent) => {
    const p = this.pointer;
    const touch = e.pointerType !== "mouse";
    if (p.inside) {
      // Smoothed pointer velocity (px/frame-ish)
      p.vx = lerp(p.vx, e.clientX - p.x, 0.5);
      p.vy = lerp(p.vy, e.clientY - p.y, 0.5);
    } else {
      p.vx = p.vy = 0;
    }
    p.x = e.clientX;
    p.y = e.clientY;
    p.inside = true;
    p.touch = touch;
    const speed = Math.hypot(p.vx, p.vy);
    p.activity = Math.min(1, p.activity + 0.12 + speed * 0.01);
  };

  private onPointerUp = (e?: Event) => {
    if (!e || (e as PointerEvent).pointerType !== "mouse") this.pointer.inside = false;
  };

  private resize() {
    const mobile = window.innerWidth < 768;
    this.lite = mobile;
    this.dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.5);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    for (const [c, ctx] of [
      [this.backCanvas, this.back],
      [this.frontCanvas, this.front],
    ] as const) {
      c.width = Math.round(this.w * this.dpr);
      c.height = Math.round(this.h * this.dpr);
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }
    const nP = this.w >= 1280 ? 170 : this.w >= 768 ? 110 : 42;
    const nR = this.w >= 1024 ? 6 : this.w >= 768 ? 4 : 2;
    if (this.particles.length > nP) this.particles.length = nP;
    while (this.particles.length < nP) this.particles.push(this.makeParticle());
    if (this.ribbons.length > nR) this.ribbons.length = nR;
    while (this.ribbons.length < nR) this.ribbons.push(this.makeRibbon(this.ribbons.length));
  }

  private collectInvert() {
    this.invertEls = Array.from(this.root.querySelectorAll("[data-ink-invert]"));
    this.invertRects = this.invertEls.map((el) => {
      const r = el.getBoundingClientRect();
      return {
        top: r.top + window.scrollY,
        bottom: r.bottom + window.scrollY,
        left: r.left,
        right: r.right,
      };
    });
    this.invertDirty = false;
  }

  /* ── Factories ──────────────────────────────────────────────────────── */
  private makeParticle(): Particle {
    const q = this.makeParticleRaw();
    const col = q.depth > 0.55 ? INK : ASH;
    q.style = `rgba(${col}, ${q.alpha.toFixed(3)})`;
    q.styleOver = `rgba(${q.depth > 0.5 ? IVORY : STONE}, ${Math.min(0.75, q.alpha * 1.25 + 0.12).toFixed(3)})`;
    return q;
  }

  private makeParticleRaw(): Particle {
    const depth = Math.pow(Math.random(), 0.7) * 0.75 + 0.25;
    const fragment = Math.random() < 0.3;
    const shape: number[] = [];
    const sides = 4 + ((Math.random() * 3) | 0);
    for (let i = 0; i < sides; i++) shape.push(rand(0.45, 1));
    return {
      x: rand(-20, this.w + 20),
      y: rand(-20, this.h + 20),
      vx: 0,
      vy: 0,
      depth,
      size: (fragment ? rand(1.6, 4.2) : rand(0.6, 2.4)) * (0.5 + depth * 0.8),
      alpha: rand(0.25, 0.65) * (0.35 + depth * 0.65),
      kind: fragment ? "fragment" : "drop",
      rot: rand(0, Math.PI * 2),
      vrot: rand(-0.4, 0.4),
      shape,
      wobble: rand(0, 100),
      style: "",
      styleOver: "",
    };
  }

  private makeRibbon(i: number): Ribbon {
    const thin = i % 3 !== 0; // roughly 2 thin : 1 thick
    const n = this.lite ? (thin ? 28 : 22) : thin ? 46 : 36;
    const hx = rand(0, this.w);
    const hy = rand(0, this.h);
    const pts = Array.from({ length: n }, () => ({ x: hx, y: hy }));
    return {
      pts,
      hx,
      hy,
      hvx: 0,
      hvy: 0,
      seg: thin ? rand(7, 10) : rand(9, 13),
      width: thin ? rand(1.2, 2.8) : rand(22, 40),
      thin,
      alpha: thin ? rand(0.3, 0.45) : rand(0.1, 0.17),
      phase: rand(0, Math.PI * 2),
      twist: rand(0.12, 0.22),
      age: -rand(0, 6), // staggered births
      life: rand(22, 40),
      speed: thin ? rand(46, 70) : rand(28, 44),
      seed: rand(0, 500),
      corrupt: 0,
    };
  }

  /* ── Simulation ─────────────────────────────────────────────────────── */
  private cursorForce(x: number, y: number, strength: number, out: { x: number; y: number }) {
    out.x = 0;
    out.y = 0;
    const p = this.pointer;
    if (p.activity < 0.01) return out;
    const R = p.touch ? 140 : 190;
    const dx = p.x - x;
    const dy = p.y - y;
    const d = Math.hypot(dx, dy);
    if (d > R || d < 0.001) return out;
    const f = Math.pow(1 - d / R, 2) * p.activity * strength * (p.touch ? 0.6 : 1);
    const nx = dx / d;
    const ny = dy / d;
    const pull = d < 34 ? -1.6 : 1; // gentle pull, soft core so ink orbits instead of clumping
    out.x = (nx * pull * 0.9 + -ny * 1.4) * f; // attraction + swirl
    out.y = (ny * pull * 0.9 + nx * 1.4) * f;
    return out;
  }

  private step(dt: number) {
    this.time += dt;
    const t = this.time;
    const p = this.pointer;
    const f = this.flow;
    const cf = { x: 0, y: 0 };

    // Pointer activity decays so ink returns to its natural drift when the cursor rests.
    p.activity *= Math.pow(p.inside ? 0.35 : 0.08, dt);
    p.vx *= Math.pow(0.02, dt);
    p.vy *= Math.pow(0.02, dt);
    const speed = Math.hypot(p.vx, p.vy);
    if (speed > 22 && t - p.lastRipple > 0.14) {
      p.lastRipple = t;
      this.ripples.push({
        x: p.x,
        y: p.y,
        r: 4,
        max: 90 + speed * 2.4,
        a: Math.min(0.22, 0.08 + speed * 0.003),
      });
    }
    if (speed > 9 && this.motes.length < (this.lite ? 90 : 220)) {
      const n = Math.min(3, Math.floor(speed / 12));
      for (let i = 0; i < n; i++) {
        this.motes.push({
          x: p.x + rand(-6, 6),
          y: p.y + rand(-6, 6),
          vx: -p.vx * rand(0.4, 1.2) + rand(-20, 20),
          vy: -p.vy * rand(0.4, 1.2) + rand(-20, 20),
          life: 0,
          max: rand(0.8, 1.6),
          size: rand(0.6, 1.8),
        });
      }
    }

    // Ripples expand and push nearby ink outward.
    for (const r of this.ripples) r.r += dt * 260;
    this.ripples = this.ripples.filter((r) => r.r < r.max);

    // ── Particles: follow the flow, relax back to it, react to cursor & ripples.
    const W = this.w;
    const H = this.h;
    for (const q of this.particles) {
      curl(q.x + q.wobble * 40, q.y, t, f);
      const sp = 32 * (0.35 + q.depth * 0.75);
      const tx = f.x * sp * 60;
      const ty = f.y * sp * 60;
      const relax = 1 - Math.pow(0.12, dt); // ease toward the flow velocity
      q.vx += (tx - q.vx) * relax;
      q.vy += (ty - q.vy) * relax;
      this.cursorForce(q.x, q.y, 260 * q.depth, cf);
      q.vx += cf.x * dt;
      q.vy += cf.y * dt;
      for (const r of this.ripples) {
        const dx = q.x - r.x;
        const dy = q.y - r.y;
        const d = Math.hypot(dx, dy) || 1;
        const band = 1 - Math.abs(d - r.r) / 18;
        if (band > 0) {
          const k = band * (1 - r.r / r.max) * 1400 * q.depth * dt;
          q.vx += (dx / d) * k;
          q.vy += (dy / d) * k;
        }
      }
      q.x += q.vx * dt;
      q.y += q.vy * dt;
      q.rot += (q.vrot + q.vx * 0.004) * dt;
      // Wrap with margin
      if (q.x < -30) q.x = W + 30;
      else if (q.x > W + 30) q.x = -30;
      if (q.y < -30) q.y = H + 30;
      else if (q.y > H + 30) q.y = -30;
    }

    // ── Ribbons: a head wanders the flow field; the body follows as a chain
    // and is itself nudged by the field, so it bends, stretches and twists.
    for (let i = 0; i < this.ribbons.length; i++) {
      const r = this.ribbons[i];
      r.age += dt;
      if (r.age > r.life) {
        this.dissolve(r);
        this.ribbons[i] = this.makeRibbon(i);
        this.ribbons[i].age = -rand(1, 4);
        continue;
      }
      if (r.age < 0) continue;
      curl(r.hx + r.seed * 13, r.hy - r.seed * 7, t * 0.8, f);
      const mag = Math.hypot(f.x, f.y) || 1;
      let ax = (f.x / mag) * r.speed;
      let ay = (f.y / mag) * r.speed;
      this.cursorForce(r.hx, r.hy, 90, cf);
      ax += cf.x;
      ay += cf.y;
      // Occasional merging: heads drift toward a nearby ribbon, then the flow pulls them apart.
      for (const o of this.ribbons) {
        if (o === r || o.age < 0) continue;
        const dx = o.hx - r.hx;
        const dy = o.hy - r.hy;
        const d = Math.hypot(dx, dy);
        if (d < 160 && d > 1) {
          const k = (1 - d / 160) * 14;
          ax += (dx / d) * k;
          ay += (dy / d) * k;
        }
      }
      const relax = 1 - Math.pow(0.2, dt);
      r.hvx += (ax - r.hvx) * relax;
      r.hvy += (ay - r.hvy) * relax;
      r.hx += r.hvx * dt;
      r.hy += r.hvy * dt;
      // Keep heads loosely inside the viewport by steering, not wrapping (wrapping would tear the ribbon).
      const m = 80;
      if (r.hx < -m) r.hvx += 40 * dt * 60;
      if (r.hx > W + m) r.hvx -= 40 * dt * 60;
      if (r.hy < -m) r.hvy += 40 * dt * 60;
      if (r.hy > H + m) r.hvy -= 40 * dt * 60;

      const pts = r.pts;
      pts[0].x = r.hx;
      pts[0].y = r.hy;
      for (let k = 1; k < pts.length; k++) {
        const a = pts[k - 1];
        const b = pts[k];
        curl(b.x, b.y, t, f);
        b.x += f.x * 900 * dt;
        b.y += f.y * 900 * dt;
        this.cursorForce(b.x, b.y, 40, cf);
        b.x += cf.x * dt;
        b.y += cf.y * dt;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 1;
        const stretch = r.seg * (1 + 0.35 * Math.sin(t * 0.7 + k * 0.3 + r.phase));
        if (d > stretch) {
          b.x = a.x + (dx / d) * stretch;
          b.y = a.y + (dy / d) * stretch;
        }
      }
      // Shadow corruption: a ribbon near the cursor fragments, then slowly reforms.
      let near = 1e9;
      if (p.inside) {
        for (let k = 0; k < pts.length; k += 3) {
          const d = Math.hypot(pts[k].x - p.x, pts[k].y - p.y);
          if (d < near) near = d;
        }
      }
      const target = p.inside ? Math.max(0, 1 - near / 130) : 0;
      const rate = target > r.corrupt ? 0.004 : 0.35; // snap apart fast, reform gently
      r.corrupt += (target - r.corrupt) * (1 - Math.pow(rate, dt));
      if (
        r.corrupt > 0.35 &&
        Math.random() < dt * 10 * r.corrupt &&
        this.motes.length < (this.lite ? 90 : 220)
      ) {
        const src = pts[(Math.random() * pts.length) | 0];
        this.motes.push({
          x: src.x,
          y: src.y,
          vx: rand(-40, 40),
          vy: rand(-12, 12),
          life: 0,
          max: rand(0.6, 1.3),
          size: rand(0.6, 1.6),
        });
      }

      // Tail sheds a little dust as it thins out.
      if (Math.random() < dt * (r.thin ? 1.2 : 2.5) && this.motes.length < (this.lite ? 90 : 220)) {
        const tail = pts[pts.length - 1 - ((Math.random() * 4) | 0)];
        this.motes.push({
          x: tail.x,
          y: tail.y,
          vx: rand(-14, 14),
          vy: rand(-14, 14),
          life: 0,
          max: rand(2, 4),
          size: rand(0.5, 1.4),
        });
      }
    }

    // Motes: droplets & dust that drift with the flow and fade.
    for (const mo of this.motes) {
      mo.life += dt;
      curl(mo.x, mo.y, t, f);
      mo.vx += (f.x * 1400 - mo.vx) * (1 - Math.pow(0.3, dt));
      mo.vy += (f.y * 1400 - mo.vy) * (1 - Math.pow(0.3, dt));
      mo.x += mo.vx * dt;
      mo.y += mo.vy * dt;
    }
    this.motes = this.motes.filter((mo) => mo.life < mo.max);
  }

  /** Ribbon end-of-life: it breaks up into fine particles. */
  private dissolve(r: Ribbon) {
    if (r.age < 0) return;
    for (let k = 0; k < r.pts.length; k += 2) {
      if (this.motes.length > (this.lite ? 110 : 260)) break;
      const pt = r.pts[k];
      this.motes.push({
        x: pt.x,
        y: pt.y,
        vx: rand(-24, 24),
        vy: rand(-24, 24),
        life: 0,
        max: rand(1.5, 3.5),
        size: rand(0.6, r.thin ? 1.4 : 2.2),
      });
    }
  }

  /* ── Rendering ──────────────────────────────────────────────────────── */
  private inInvert(
    x: number,
    y: number,
    rects: { top: number; bottom: number; left: number; right: number }[],
  ) {
    for (const r of rects)
      if (y >= r.top && y <= r.bottom && x >= r.left && x <= r.right) return true;
    return false;
  }

  private draw() {
    if (this.invertDirty) this.collectInvert();
    const b = this.back;
    const fr = this.front;
    b.clearRect(0, 0, this.w, this.h);
    fr.clearRect(0, 0, this.w, this.h);
    const sy = window.scrollY;
    const inv = this.invertRects
      .map((r) => ({ top: r.top - sy, bottom: r.bottom - sy, left: r.left, right: r.right }))
      .filter((r) => r.bottom > 0 && r.top < this.h);

    // Middle layer first (behind particles visually is fine — both are behind content).
    for (const r of this.ribbons) if (r.age >= 0) this.drawRibbon(r, inv);

    // Background particles
    for (const q of this.particles) {
      const over = inv.length > 0 && this.inInvert(q.x, q.y, inv);
      const ctx = over ? fr : b;
      ctx.fillStyle = over ? q.styleOver : q.style;
      if (q.kind === "drop") {
        // Droplets stretch gently along their motion, like ink in water.
        const sp = Math.hypot(q.vx, q.vy);
        const stretch = 1 + Math.min(0.9, sp * 0.012);
        ctx.beginPath();
        ctx.ellipse(
          q.x,
          q.y,
          q.size * stretch,
          q.size / Math.sqrt(stretch),
          Math.atan2(q.vy, q.vx),
          0,
          Math.PI * 2,
        );
        ctx.fill();
      } else {
        const n = q.shape.length;
        ctx.beginPath();
        for (let i = 0; i < n; i++) {
          const ang = q.rot + (i / n) * Math.PI * 2;
          const rr = q.size * q.shape[i];
          const px = q.x + Math.cos(ang) * rr;
          const py = q.y + Math.sin(ang) * rr * 0.7;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
      }
    }

    // Foreground: dissolve dust & cursor droplets
    for (const mo of this.motes) {
      const k = 1 - mo.life / mo.max;
      const over = inv.length > 0 && this.inInvert(mo.x, mo.y, inv);
      fr.fillStyle = over
        ? `rgba(${IVORY}, ${(0.45 * k).toFixed(3)})`
        : `rgba(${INK}, ${(0.5 * k).toFixed(3)})`;
      fr.beginPath();
      fr.arc(mo.x, mo.y, mo.size * (0.6 + 0.4 * k), 0, Math.PI * 2);
      fr.fill();
    }
    // Ripples: faint distortion rings
    for (const r of this.ripples) {
      const k = 1 - r.r / r.max;
      const over = inv.length > 0 && this.inInvert(r.x, r.y, inv);
      fr.strokeStyle = over
        ? `rgba(${IVORY}, ${(r.a * k).toFixed(3)})`
        : `rgba(${INK}, ${(r.a * k).toFixed(3)})`;
      fr.lineWidth = 1 + 1.5 * k;
      fr.beginPath();
      fr.ellipse(r.x, r.y, r.r, r.r * 0.86, 0, 0, Math.PI * 2);
      fr.stroke();
    }
  }

  private drawRibbon(
    r: Ribbon,
    inv: { top: number; bottom: number; left: number; right: number }[],
  ) {
    const pts = r.pts;
    const n = pts.length;
    const t = this.time;
    // Life envelope: ease in, ease out (then it dissolves into dust).
    const env = smooth(0, 3, r.age) * (1 - smooth(r.life - 4, r.life, r.age));
    if (env <= 0.001) return;
    const left: [number, number][] = [];
    const right: [number, number][] = [];
    for (let i = 0; i < n; i++) {
      const a = pts[Math.max(0, i - 1)];
      const c = pts[Math.min(n - 1, i + 1)];
      let tx = c.x - a.x;
      let ty = c.y - a.y;
      const tl = Math.hypot(tx, ty) || 1;
      tx /= tl;
      ty /= tl;
      const u = i / (n - 1);
      const taper = Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.05)), 0.8);
      // Twist: width swings through zero, so the ribbon appears to turn in space.
      const twist = 0.3 + 0.7 * Math.abs(Math.sin(r.phase + i * r.twist + t * 0.55));
      const breathe = 1 + 0.25 * noise3(i * 0.15, r.seed, t * 0.3);
      const w = r.width * taper * twist * breathe * 0.5;
      left.push([pts[i].x - ty * w, pts[i].y + tx * w]);
      right.push([pts[i].x + ty * w, pts[i].y - tx * w]);
    }
    const trace = (ctx: CanvasRenderingContext2D, scale: number) => {
      const cx = (i: number, side: [number, number][]) => {
        const p = pts[i];
        return [p.x + (side[i][0] - p.x) * scale, p.y + (side[i][1] - p.y) * scale] as const;
      };
      ctx.beginPath();
      let [x0, y0] = cx(0, left);
      ctx.moveTo(x0, y0);
      for (let i = 1; i < n - 1; i++) {
        const [x1, y1] = cx(i, left);
        const [x2, y2] = cx(i + 1, left);
        ctx.quadraticCurveTo(x1, y1, (x1 + x2) / 2, (y1 + y2) / 2);
      }
      [x0, y0] = cx(n - 1, right);
      ctx.lineTo(x0, y0);
      for (let i = n - 2; i > 0; i--) {
        const [x1, y1] = cx(i, right);
        const [x2, y2] = cx(i - 1, right);
        ctx.quadraticCurveTo(x1, y1, (x1 + x2) / 2, (y1 + y2) / 2);
      }
      ctx.closePath();
    };

    const mid = pts[n >> 1];
    const over = inv.length > 0 && this.inInvert(mid.x, mid.y, inv);
    const ctx = over ? this.front : this.back;
    const core = over ? IVORY : INK;
    const haze = over ? STONE : ASH;
    // Smoke halo (skipped on phones), then the ink core.
    if (!this.lite) {
      ctx.fillStyle = `rgba(${haze}, ${(r.alpha * 0.35 * env * (over ? 0.8 : 1)).toFixed(3)})`;
      trace(ctx, r.thin ? 5 : 1.9);
      ctx.fill();
    }
    ctx.fillStyle = `rgba(${core}, ${(r.alpha * env * (over ? 0.9 : 1)).toFixed(3)})`;
    if (r.corrupt < 0.04) {
      trace(ctx, 1);
      ctx.fill();
      return;
    }
    // Fragmented core: chunks tear sideways (horizontal displacement only) and
    // some drop out; the jitter re-rolls ~14 times a second, then settles.
    const tick = Math.floor(t * 14);
    const p = this.pointer;
    const step = 3;
    for (let k = 0; k < n - 1; k += step) {
      const e = Math.min(n - 1, k + step);
      const lp = p.inside ? Math.max(0, 1 - Math.hypot(pts[k].x - p.x, pts[k].y - p.y) / 160) : 0;
      const amt = r.corrupt * (0.35 + 0.65 * lp);
      const h1 = hash(k, tick, (r.seed | 0) & 255);
      const h2 = hash(k + 7, tick + 3, (r.seed | 0) & 255);
      if (h2 < amt * 0.3) continue; // gap
      const dx = (h1 - 0.5) * 2 * 28 * amt;
      const dy = (h2 - 0.5) * 4 * amt;
      ctx.beginPath();
      ctx.moveTo(left[k][0] + dx, left[k][1] + dy);
      for (let i = k + 1; i <= e; i++) ctx.lineTo(left[i][0] + dx, left[i][1] + dy);
      for (let i = e; i >= k; i--) ctx.lineTo(right[i][0] + dx, right[i][1] + dy);
      ctx.closePath();
      ctx.fill();
    }
  }
}
