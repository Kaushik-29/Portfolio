/**
 * Canvas renderer for the black-hole transition.
 *
 * The coordinator moves the engine through phases; this class only draws.
 * One requestAnimationFrame loop, cancelled in destroy().
 */

export type BHPhase = "idle" | "activate" | "suction" | "collapse" | "glitch" | "awaken" | "fade";

type Particle = {
  x: number;
  y: number;
  r: number; // distance to hole
  a: number; // angle around hole
  size: number;
  color: string;
  delay: number; // ms after suction start
  speed: number;
  spin: number;
  alive: boolean;
};

const INK = "8, 9, 9";
const IVORY = "234, 230, 220";
const ASH = "119, 117, 111";
const STONE = "201, 195, 184";
const COLORS = [INK, INK, ASH, STONE, IVORY];

const easeIn = (t: number) => t * t * t;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));

export class BlackHoleEngine {
  private ctx: CanvasRenderingContext2D;
  private raf = 0;
  private phase: BHPhase = "idle";
  private phaseStart = 0;
  private phaseDur = 1;
  private particles: Particle[] = [];
  private ring: { a: number; d: number; s: number; c: string }[] = [];
  private w = 0;
  private h = 0;
  private dpr = 1;
  private maxR = 0;
  private holeR = 0;
  private glitchSeed = 0;
  private glitchBands: { y: number; h: number; dx: number; kind: number }[] = [];
  private lastGlitch = 0;
  private blobNoise: number[] = [];
  private droplets: { a: number; d: number; s: number; v: number }[] = [];
  origin = { x: 0, y: 0 };
  private noisePattern: CanvasPattern | null = null;
  private shards: { x: number; y: number; w: number; h: number; vx: number; c: string }[] = [];
  private shardSeed = -1;
  private lastDraw = 0;

  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D canvas unavailable");
    this.ctx = ctx;
    this.resize();
    const ringCount = window.innerWidth < 768 ? 60 : 120;
    for (let i = 0; i < ringCount; i++) {
      this.ring.push({
        a: Math.random() * Math.PI * 2,
        d: 1.4 + Math.random() * 2.6,
        s: 0.6 + Math.random() * 1.8,
        c: COLORS[(Math.random() * COLORS.length) | 0],
      });
    }
    for (let i = 0; i < 72; i++) this.blobNoise.push(Math.random());
    for (let i = 0; i < 46; i++)
      this.droplets.push({
        a: Math.random() * Math.PI * 2,
        d: 0.9 + Math.random() * 0.5,
        s: 1 + Math.random() * 5,
        v: 0.6 + Math.random() * 0.8,
      });
  }

  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.computeMaxR();
  }

  private computeMaxR() {
    const { x, y } = this.origin;
    this.maxR =
      Math.max(
        Math.hypot(x, y),
        Math.hypot(this.w - x, y),
        Math.hypot(x, this.h - y),
        Math.hypot(this.w - x, this.h - y),
      ) * 1.08;
  }

  setOrigin(x: number, y: number) {
    this.origin = { x, y };
    this.computeMaxR();
  }

  setPhase(phase: BHPhase, durationMs: number) {
    this.phase = phase;
    this.phaseStart = performance.now();
    this.phaseDur = Math.max(1, durationMs);
  }

  /** Break an element's rectangle into particles that spiral into the hole. */
  spawnFrom(rect: DOMRect, delay: number, budget: number) {
    const area = rect.width * rect.height;
    const n = Math.min(budget, Math.max(2, Math.round(area / 9000)));
    for (let i = 0; i < n; i++) {
      const x = rect.left + Math.random() * rect.width;
      const y = rect.top + Math.random() * rect.height;
      const dx = x - this.origin.x;
      const dy = y - this.origin.y;
      this.particles.push({
        x,
        y,
        r: Math.hypot(dx, dy),
        a: Math.atan2(dy, dx),
        size: 0.8 + Math.random() * 2.6,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        delay: delay + Math.random() * 220,
        speed: 0.55 + Math.random() * 0.6,
        spin: 1.4 + Math.random() * 1.8,
        alive: true,
      });
    }
    return n;
  }

  start() {
    this.canvas.style.display = "block";
    const loop = (now: number) => {
      this.draw(now);
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.particles = [];
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.canvas.style.display = "none";
  }

  private draw(now: number) {
    const ctx = this.ctx;
    const t = clamp01((now - this.phaseStart) / this.phaseDur);
    const elapsed = now - this.phaseStart;
    ctx.clearRect(0, 0, this.w, this.h);

    switch (this.phase) {
      case "activate": {
        this.holeR = 2 + easeOut(t) * 16;
        this.drawLensing(this.holeR, 0.35 * t);
        this.drawRing(now, this.holeR, t);
        this.drawHole(this.holeR);
        break;
      }
      case "suction": {
        this.holeR = 18 + easeIn(t) * 34;
        this.drawLensing(this.holeR, 0.35 + 0.35 * t);
        this.drawParticles(elapsed);
        this.drawRing(now, this.holeR, 1);
        this.drawHole(this.holeR);
        break;
      }
      case "collapse": {
        this.holeR = 52 + easeIn(t) * (this.maxR - 52);
        this.drawLensing(this.holeR, 0.7 + 0.3 * t);
        this.drawParticles(elapsed + 1000);
        this.drawRing(now, this.holeR, 1 - t);
        this.drawHole(this.holeR);
        break;
      }
      case "glitch": {
        this.drawGlitch(now, t);
        break;
      }
      case "awaken": {
        this.drawAwaken(now, t);
        break;
      }
      case "fade": {
        // Reduced-motion: a soft dip to ink and back.
        const a = t < 0.5 ? t * 2 : (1 - t) * 2;
        ctx.fillStyle = `rgba(${INK}, ${a})`;
        ctx.fillRect(0, 0, this.w, this.h);
        break;
      }
      default:
        break;
    }
  }

  private drawHole(r: number) {
    const ctx = this.ctx;
    const { x, y } = this.origin;
    // Event horizon
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = "#000";
    ctx.fill();
    // Photon rim
    ctx.beginPath();
    ctx.arc(x, y, r + 1, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${IVORY}, 0.55)`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  private drawLensing(r: number, strength: number) {
    const ctx = this.ctx;
    const { x, y } = this.origin;
    const outer = r * 5 + 40;
    const g = ctx.createRadialGradient(x, y, r * 0.9, x, y, outer);
    g.addColorStop(0, `rgba(${INK}, ${0.85 * strength})`);
    g.addColorStop(0.35, `rgba(${ASH}, ${0.28 * strength})`);
    g.addColorStop(1, `rgba(${INK}, 0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, outer, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawRing(now: number, r: number, alpha: number) {
    const ctx = this.ctx;
    const { x, y } = this.origin;
    for (const p of this.ring) {
      const a = p.a + now * 0.004 * (3 / p.d);
      const d = r * p.d;
      const px = x + Math.cos(a) * d;
      const py = y + Math.sin(a) * d * 0.62;
      ctx.fillStyle = `rgba(${p.c}, ${0.9 * alpha})`;
      ctx.beginPath();
      ctx.arc(px, py, p.s, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawParticles(elapsed: number) {
    const ctx = this.ctx;
    const { x, y } = this.origin;
    for (const p of this.particles) {
      if (!p.alive) continue;
      const local = elapsed - p.delay;
      if (local < 0) {
        ctx.fillStyle = `rgba(${p.color}, 0.9)`;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        continue;
      }
      // Spiral in: radius shrinks with accelerating pull, angle increases faster near the core.
      const pull = Math.min(1, (local / 900) * p.speed);
      const r = p.r * (1 - easeIn(pull) * 1.02);
      if (r <= this.holeR * 0.6) {
        p.alive = false;
        continue;
      }
      const ang = p.a + p.spin * easeIn(pull) * 2.4;
      const px = x + Math.cos(ang) * r;
      const py = y + Math.sin(ang) * r;
      const stretch = 1 + pull * 6;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(ang + Math.PI / 2);
      ctx.fillStyle = `rgba(${p.color}, ${0.95 - pull * 0.3})`;
      ctx.fillRect(-p.size / 2, -(p.size * stretch) / 2, p.size, p.size * stretch);
      ctx.restore();
    }
  }

  private drawGlitch(now: number, t: number) {
    const ctx = this.ctx;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, this.w, this.h);

    if (now - this.lastGlitch > 45) {
      this.lastGlitch = now;
      this.glitchSeed++;
      const count = 6 + ((Math.random() * 10) | 0);
      this.glitchBands = [];
      for (let i = 0; i < count; i++) {
        this.glitchBands.push({
          y: Math.random() * this.h,
          h: 2 + Math.random() * (this.h * 0.09),
          dx: (Math.random() - 0.5) * 80,
          kind: Math.random(),
        });
      }
    }

    // Reveal the newly mounted interface through displaced horizontal slices.
    // The reveal probability grows over the phase, so the new layer "tunes in".
    for (const b of this.glitchBands) {
      if (b.kind < 0.25 + t * 0.55) {
        ctx.clearRect(Math.max(0, b.dx), b.y, this.w, b.h);
      } else if (b.kind < 0.9) {
        ctx.fillStyle = b.kind < 0.6 ? `rgba(${IVORY}, 0.85)` : `rgba(${ASH}, 0.7)`;
        ctx.fillRect(b.dx, b.y, this.w * (0.3 + b.kind * 0.7), Math.max(1, b.h * 0.25));
      }
    }

    // Fragmented blocks
    for (let i = 0; i < 10; i++) {
      const bw = 10 + Math.random() * 120;
      const bh = 4 + Math.random() * 30;
      ctx.fillStyle = i % 3 === 0 ? `rgba(${STONE}, 0.6)` : "#000";
      ctx.fillRect(Math.random() * this.w, Math.random() * this.h, bw, bh);
    }

    // Monochrome static in a few torn bands
    if (!this.noisePattern) {
      const nc = document.createElement("canvas");
      nc.width = nc.height = 96;
      const g = nc.getContext("2d");
      if (g) {
        const img = g.createImageData(96, 96);
        for (let i = 0; i < img.data.length; i += 4) {
          const v = Math.random() < 0.5 ? 8 : 234;
          img.data[i] = v;
          img.data[i + 1] = v > 100 ? 230 : 9;
          img.data[i + 2] = v > 100 ? 220 : 9;
          img.data[i + 3] = Math.random() < 0.6 ? 255 : 0;
        }
        g.putImageData(img, 0, 0);
        this.noisePattern = ctx.createPattern(nc, "repeat");
      }
    }
    if (this.noisePattern) {
      ctx.save();
      ctx.globalAlpha = 0.28 + 0.25 * (1 - t);
      ctx.fillStyle = this.noisePattern;
      for (let i = 0; i < 4; i++) {
        const by = (((this.glitchSeed * 97 + i * 211) % 1000) / 1000) * this.h;
        const bh = 6 + ((this.glitchSeed * 31 + i * 17) % 40);
        ctx.setTransform(
          this.dpr,
          0,
          0,
          this.dpr,
          ((this.glitchSeed * 53 + i * 29) % 96) * this.dpr,
          0,
        );
        ctx.fillRect(0, by, this.w, bh);
      }
      ctx.restore();
    }

    // Horizontal tearing: hairlines broken into offset segments
    ctx.fillStyle = `rgba(${IVORY}, 0.75)`;
    for (let i = 0; i < 4; i++) {
      const y = (((this.glitchSeed * 61 + i * 233) % 997) / 997) * this.h;
      let x = 0;
      while (x < this.w) {
        const seg = 40 + Math.random() * 220;
        const off = (Math.random() - 0.5) * 36;
        ctx.fillRect(x + off, y, seg * 0.8, 1);
        x += seg;
      }
    }

    // Fragmented particles flung sideways through the frame
    if (this.shardSeed < 0 || t < 0.02) {
      if (this.shardSeed !== Math.floor(this.phaseStart)) {
        this.shardSeed = Math.floor(this.phaseStart);
        const count = this.w < 768 ? 28 : 64;
        this.shards = Array.from({ length: count }, () => ({
          x: Math.random() * this.w,
          y: Math.random() * this.h,
          w: 2 + Math.random() * 18,
          h: 1 + Math.random() * 4,
          vx: (Math.random() < 0.5 ? -1 : 1) * (300 + Math.random() * 900),
          c: COLORS[(Math.random() * COLORS.length) | 0],
        }));
        this.lastDraw = now;
      }
    }
    const dt = Math.min(0.05, (now - this.lastDraw) / 1000);
    this.lastDraw = now;
    for (const s of this.shards) {
      s.x += s.vx * dt;
      if (s.x < -30) s.x = this.w + 20;
      else if (s.x > this.w + 30) s.x = -20;
      ctx.fillStyle = `rgba(${s.c}, ${(0.85 * (1 - t * 0.5)).toFixed(3)})`;
      ctx.fillRect(s.x, s.y, s.w, s.h);
    }

    // Scanlines
    ctx.fillStyle = `rgba(${INK}, 0.35)`;
    for (let yy = 0; yy < this.h; yy += 4) ctx.fillRect(0, yy, this.w, 1);
  }

  private drawAwaken(now: number, t: number) {
    const ctx = this.ctx;
    const { x, y } = this.origin;
    const R = easeOut(t) * this.maxR;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, this.w, this.h);

    // Cut an organic, ink-edged opening that blooms outward from the hole.
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    const n = this.blobNoise.length;
    for (let i = 0; i <= n; i++) {
      const k = i % n;
      const a = (k / n) * Math.PI * 2;
      const wobble =
        1 +
        0.16 * Math.sin(a * 5 + now * 0.004) * (1 - t) +
        0.12 * (this.blobNoise[k] - 0.5) * (1 - t * 0.6);
      const rr = R * wobble;
      const px = x + Math.cos(a) * rr;
      const py = y + Math.sin(a) * rr;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";

    // Ink droplets flung outward from the bloom edge
    const fade = 1 - t;
    for (const d of this.droplets) {
      const rr = R * d.d + t * 120 * d.v;
      const px = x + Math.cos(d.a) * rr;
      const py = y + Math.sin(d.a) * rr;
      ctx.fillStyle = `rgba(${INK}, ${0.9 * fade})`;
      ctx.beginPath();
      ctx.ellipse(px, py, d.s * 1.8, d.s * 0.7, d.a, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
