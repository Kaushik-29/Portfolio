import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import profile from "@/assets/home.jpeg";
import { useTheme } from "./ThemeSelector";

// Helper to convert hex to rgba for canvas transparency
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const n = parseInt(h, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Fixed coordinates in a 600x600 coordinate system (Concentric circles around 300,300)
// Simplified symmetrical circular AI mandala nodes
const generateMandalaNodes = (): Record<string, { x: number; y: number; label: string }> => {
  const nodes: Record<string, { x: number; y: number; label: string }> = {};
  
  // Layer 1: Inner ring (radius 135) - 5 nodes (reduced from 8)
  for (let i = 0; i < 5; i++) {
    const angle = (i * 2 * Math.PI) / 5;
    const key = `I${i + 1}`;
    nodes[key] = {
      x: 300 + 135 * Math.cos(angle),
      y: 300 + 135 * Math.sin(angle),
      label: key,
    };
  }

  // Layer 2: Middle ring (radius 160) - 8 nodes (reduced from 12)
  for (let i = 0; i < 8; i++) {
    const angle = (i * 2 * Math.PI) / 8 + Math.PI / 8;
    const key = `A${i + 1}`;
    nodes[key] = {
      x: 300 + 160 * Math.cos(angle),
      y: 300 + 160 * Math.sin(angle),
      label: key,
    };
  }

  // Layer 3: Outer ring (radius 185) - 8 nodes (reduced from 12)
  for (let i = 0; i < 8; i++) {
    const angle = (i * 2 * Math.PI) / 8;
    const key = `B${i + 1}`;
    nodes[key] = {
      x: 300 + 185 * Math.cos(angle),
      y: 300 + 185 * Math.sin(angle),
      label: key,
    };
  }

  // Structural anchors and compatibility nodes
  nodes["TOP"] = { x: 300, y: 115, label: "TOP" };
  nodes["BOTTOM"] = { x: 300, y: 485, label: "BOTTOM" };
  nodes["O1"] = { x: 300 + 185 * Math.cos(0), y: 300 + 185 * Math.sin(0), label: "O1" };
  nodes["O2"] = { x: 300 + 185 * Math.cos(Math.PI / 2), y: 300 + 185 * Math.sin(Math.PI / 2), label: "O2" };
  nodes["O3"] = { x: 300 + 185 * Math.cos(Math.PI), y: 300 + 185 * Math.sin(Math.PI), label: "O3" };
  nodes["O4"] = { x: 300 + 185 * Math.cos((3 * Math.PI) / 2), y: 300 + 185 * Math.sin((3 * Math.PI) / 2), label: "O4" };

  return nodes;
};

// Symmetrical neural mandala connection links (simplified layout)
const generateMandalaConnections = (): { from: string; to: string }[] => {
  const conns: { from: string; to: string }[] = [];

  // Inner ring circular connections (5 nodes)
  for (let i = 0; i < 5; i++) {
    conns.push({ from: `I${i + 1}`, to: `I${((i + 1) % 5) + 1}` });
  }

  // Middle ring circular connections (8 nodes)
  for (let i = 0; i < 8; i++) {
    conns.push({ from: `A${i + 1}`, to: `A${((i + 1) % 8) + 1}` });
  }

  // Outer ring circular connections (8 nodes)
  for (let i = 0; i < 8; i++) {
    conns.push({ from: `B${i + 1}`, to: `B${((i + 1) % 8) + 1}` });
  }

  // Radial spokes (Inner to Middle)
  for (let i = 0; i < 5; i++) {
    const m = Math.floor((i * 8) / 5) % 8;
    conns.push({ from: `I${i + 1}`, to: `A${m + 1}` });
  }

  // Radial spokes (Middle to Outer)
  for (let i = 0; i < 8; i++) {
    conns.push({ from: `A${i + 1}`, to: `B${i + 1}` });
  }

  // Connect TOP and BOTTOM anchors
  conns.push({ from: "TOP", to: "B1" });
  conns.push({ from: "TOP", to: "I1" });
  conns.push({ from: "TOP", to: "O1" });

  conns.push({ from: "BOTTOM", to: "B5" });
  conns.push({ from: "BOTTOM", to: "I3" });
  conns.push({ from: "BOTTOM", to: "O3" });

  // Connect B-nodes to outputs
  conns.push({ from: "B1", to: "O1" });
  conns.push({ from: "B3", to: "O2" });
  conns.push({ from: "B5", to: "O3" });
  conns.push({ from: "B7", to: "O4" });

  return conns;
};

const NODES = generateMandalaNodes();
const CONNECTIONS = generateMandalaConnections();

// Symmetrical 4-badge layout spaced at 90-degree increments
const LABELS = [
  { id: "projects", label: "15+ Projects", color: "#D72638", angle: -90 },
  { id: "cgpa", label: "8.94 CGPA", color: "#FFD700", angle: 0 },
  { id: "engineer", label: "AI Engineer", color: "#E6BE8A", angle: 90 },
  { id: "azure", label: "Azure AI Certified", color: "#FFD700", angle: 180 },
];

interface SmartNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseSize: number;
  baseAlpha: number;
  pulsePhase: number;
  pulseSpeed: number;
  state: "idle" | "active" | "attention" | "transfer";
  stateTimer: number;
  attentionAnchor: string;
  color: string;
}

interface DataPacket {
  currentNode: string;
  nextNode: string;
  progress: number;
  speed: number;
}

interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  life: number;
}

interface AttentionLink {
  fromNode: string;
  toNode: string;
  life: number;
  maxLife: number;
  hasTransferred: boolean;
}

export function HeroProfile() {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCoreHovered, setIsCoreHovered] = useState(false);
  const [isNearCore, setIsNearCore] = useState(false);

  const themeRef = useRef(theme);
  const isCoreHoveredRef = useRef(isCoreHovered);
  const isNearCoreRef = useRef(isNearCore);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);
  useEffect(() => {
    isCoreHoveredRef.current = isCoreHovered;
  }, [isCoreHovered]);
  useEffect(() => {
    isNearCoreRef.current = isNearCore;
  }, [isNearCore]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);

    const dist = Math.sqrt(x * x + y * y);
    setIsNearCore(dist < 0.45);
  };

  const handleMouseLeave = () => {
    setIsNearCore(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 600;
    const height = 600;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const nodeKeys = Object.keys(NODES).filter((k) => k !== "TOP" && k !== "BOTTOM");
    const particleColors = ["#FFD700", "#E6BE8A", "#D72638"];

    // Initialize 40 smart drifting constellation nodes (reduced from 75)
    const nodes: SmartNode[] = Array.from({ length: 40 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
      baseSize: 0.6 + Math.random() * 1.4,
      baseAlpha: 0.15 + Math.random() * 0.35,
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.005 + Math.random() * 0.015,
      state: "idle",
      stateTimer: 0,
      attentionAnchor: nodeKeys[Math.floor(Math.random() * nodeKeys.length)],
      color: particleColors[Math.floor(Math.random() * particleColors.length)],
    }));

    // Initialize 10 data packets flowing through the network (reduced from 20)
    const packets: DataPacket[] = Array.from({ length: 10 }).map(() => {
      const startConn = CONNECTIONS[Math.floor(Math.random() * CONNECTIONS.length)];
      return {
        currentNode: startConn.from,
        nextNode: startConn.to,
        progress: Math.random(),
        speed: 0.008 + Math.random() * 0.006,
      };
    });

    const orbitRadii = [125, 155, 185];
    const orbitBaseAngles = [0, Math.PI / 2, Math.PI];
    const orbitBaseSpeeds = [0.0035, -0.0025, 0.0018];

    let sparks: SparkParticle[] = [];
    let activeAttentionLink: AttentionLink | null = null;
    let nextAttentionTimer = 100;

    let animationFrameId: number;

    const tick = () => {
      ctx.clearRect(0, 0, width, height);

      const activeColor = themeRef.current.accent;
      const speedMultiplier = isCoreHoveredRef.current ? 2.5 : isNearCoreRef.current ? 1.6 : 1.0;

      if (activeAttentionLink === null) {
        nextAttentionTimer -= 1;
        if (nextAttentionTimer <= 0) {
          const inputs = ["I1", "I2", "I3", "I4"];
          const outputs = ["O1", "O2", "O3", "O4"];
          const fromNode = inputs[Math.floor(Math.random() * inputs.length)];
          const toNode = outputs[Math.floor(Math.random() * outputs.length)];

          activeAttentionLink = {
            fromNode,
            toNode,
            life: 140,
            maxLife: 140,
            hasTransferred: false,
          };
          nextAttentionTimer = 150 + Math.random() * 120;
        }
      }

      let attentionProgress = 0;
      let attentionFromX = 0;
      let attentionFromY = 0;
      let attentionToX = 0;
      let attentionToY = 0;

      if (activeAttentionLink !== null) {
        activeAttentionLink.life -= 1;

        const maxL = activeAttentionLink.maxLife;
        const halfL = maxL / 2;
        const life = activeAttentionLink.life;

        let opacity = 0;
        if (life > halfL) {
          opacity = (maxL - life) / halfL;
        } else {
          opacity = life / halfL;
        }
        opacity *= 0.45;

        const pFrom = NODES[activeAttentionLink.fromNode];
        const pTo = NODES[activeAttentionLink.toNode];
        
        if (pFrom && pTo) {
          attentionFromX = pFrom.x;
          attentionFromY = pFrom.y;
          attentionToX = pTo.x;
          attentionToY = pTo.y;

          ctx.beginPath();
          ctx.moveTo(pFrom.x, pFrom.y);
          ctx.lineTo(pTo.x, pTo.y);
          ctx.strokeStyle = hexToRgba(activeColor, opacity);
          ctx.lineWidth = 1.6;
          ctx.setLineDash([5, 4]);
          ctx.stroke();
          ctx.setLineDash([]);

          if (life < halfL) {
            attentionProgress = (halfL - life) / halfL;
            const px = pFrom.x + (pTo.x - pFrom.x) * attentionProgress;
            const py = pFrom.y + (pTo.y - pFrom.y) * attentionProgress;

            ctx.beginPath();
            ctx.arc(px, py, 3.8, 0, Math.PI * 2);
            ctx.fillStyle = activeColor;
            ctx.shadowBlur = 12;
            ctx.shadowColor = activeColor;
            ctx.fill();
            ctx.shadowBlur = 0;

            if (Math.random() < 0.3) {
              sparks.push({
                x: px,
                y: py,
                vx: (Math.random() - 0.5) * 0.8,
                vy: (Math.random() - 0.5) * 0.8,
                alpha: 0.8,
                life: 15,
              });
            }
          }
        }

        if (life <= 0) {
          activeAttentionLink = null;
        }
      }

      nodes.forEach((node) => {
        node.x += node.vx * speedMultiplier;
        node.y += node.vy * speedMultiplier;

        if (node.x < 0) node.x = width;
        if (node.x > width) node.x = 0;
        if (node.y < 0) node.y = height;
        if (node.y > height) node.y = 0;

        let currentSize = node.baseSize;
        let currentOpacity = node.baseAlpha;
        let currentGlow = 0;

        if (isNearCoreRef.current && node.state === "idle") {
          const dx = node.x - width / 2;
          const dy = node.y - height / 2;
          const distFromCore = Math.sqrt(dx * dx + dy * dy);
          if (distFromCore < 180 && Math.random() < 0.015) {
            node.state = "active";
            node.stateTimer = 40;
          }
        }

        const isAttentionAnchor = activeAttentionLink && 
          (activeAttentionLink.fromNode === node.attentionAnchor || activeAttentionLink.toNode === node.attentionAnchor);

        if (isAttentionAnchor) {
          node.state = "attention";
          node.stateTimer = activeAttentionLink!.life;
        }

        if (node.stateTimer > 0) {
          node.stateTimer -= 1;
          if (node.stateTimer <= 0) {
            node.state = "idle";
          }
        }

        if (node.state === "idle" && Math.random() < 0.0004) {
          node.state = "active";
          node.stateTimer = 45;
          
          for (let s = 0; s < 2; s++) {
            sparks.push({
              x: node.x,
              y: node.y,
              vx: (Math.random() - 0.5) * 1.0,
              vy: (Math.random() - 0.5) * 1.0,
              alpha: 0.9,
              life: 18 + Math.random() * 12,
            });
          }
        }

        if (node.state === "idle") {
          packets.forEach((p) => {
            const pFrom = NODES[p.currentNode];
            const pTo = NODES[p.nextNode];
            if (pFrom && pTo) {
              const px = pFrom.x + (pTo.x - pFrom.x) * p.progress;
              const py = pFrom.y + (pTo.y - pFrom.y) * p.progress;

              const dx = node.x - px;
              const dy = node.y - py;
              if (dx * dx + dy * dy < 1024) {
                node.state = "transfer";
                node.stateTimer = 22;
              }
            }
          });

          if (activeAttentionLink && activeAttentionLink.life < activeAttentionLink.maxLife / 2) {
            const px = attentionFromX + (attentionToX - attentionFromX) * attentionProgress;
            const py = attentionFromY + (attentionToY - attentionFromY) * attentionProgress;

            const dx = node.x - px;
            const dy = node.y - py;
            if (dx * dx + dy * dy < 1024) {
              node.state = "transfer";
              node.stateTimer = 22;
            }
          }
        }

        if (node.state === "transfer") {
          currentSize = node.baseSize * 1.8;
          currentOpacity = 0.95;
          currentGlow = 6;
        } else if (node.state === "attention") {
          node.pulsePhase += node.pulseSpeed * 2;
          const pulse = Math.sin(node.pulsePhase) * 0.8;
          currentSize = node.baseSize * 2.3 + pulse;
          currentOpacity = 0.95;
          currentGlow = 10;
        } else if (node.state === "active") {
          currentSize = node.baseSize * 1.5;
          currentOpacity = 0.8;
          currentGlow = 4;
        } else {
          node.pulsePhase += node.pulseSpeed;
          currentOpacity = node.baseAlpha * (0.6 + 0.4 * Math.sin(node.pulsePhase));
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(node.color, currentOpacity * (isCoreHoveredRef.current ? 0.9 : 0.6));
        if (currentGlow > 0) {
          ctx.shadowBlur = currentGlow;
          ctx.shadowColor = node.color;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw constellation connections between nearby drifting nodes (simplified connection distance)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 32) { // reduced from 45px to 32px for less line density
            const baseAlpha = (1 - dist / 32) * 0.05;
            const linkPulse = 0.7 + 0.3 * Math.sin(Date.now() * 0.001 + i + j);
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = hexToRgba(nodes[i].color, baseAlpha * linkPulse * (isCoreHoveredRef.current ? 1.6 : isNearCoreRef.current ? 1.2 : 0.8));
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Update & Draw Orbits Particles
      const colors = ["#FFD700", "#E6BE8A", "#D72638"];
      orbitRadii.forEach((radius, i) => {
        orbitBaseAngles[i] += orbitBaseSpeeds[i] * speedMultiplier;
        const colorForOrbit = colors[i % colors.length];
        
        for (let p = 0; p < 3; p++) {
          const angle = orbitBaseAngles[i] + (p * 2 * Math.PI) / 3;
          const px = width / 2 + radius * Math.cos(angle);
          const py = height / 2 + radius * Math.sin(angle);

          ctx.beginPath();
          ctx.arc(px, py, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = colorForOrbit;
          ctx.shadowBlur = 10;
          ctx.shadowColor = colorForOrbit;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // Update & Draw Network Data Packets
      packets.forEach((packet) => {
        packet.progress += packet.speed * speedMultiplier;

        const pFrom = NODES[packet.currentNode];
        const pTo = NODES[packet.nextNode];

        if (packet.progress >= 1.0) {
          if (pTo) {
            for (let s = 0; s < 3; s++) {
              sparks.push({
                x: pTo.x,
                y: pTo.y,
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5,
                alpha: 1.0,
                life: 25 + Math.random() * 20,
              });
            }
          }

          const nextOptions = CONNECTIONS.filter((c) => c.from === packet.nextNode);
          if (nextOptions.length > 0) {
            const nextConn = nextOptions[Math.floor(Math.random() * nextOptions.length)];
            packet.currentNode = packet.nextNode;
            packet.nextNode = nextConn.to;
          } else {
            const randConn = CONNECTIONS[Math.floor(Math.random() * CONNECTIONS.length)];
            packet.currentNode = randConn.from;
            packet.nextNode = randConn.to;
          }
          packet.progress = 0;
        }

        if (pFrom && pTo) {
          const px = pFrom.x + (pTo.x - pFrom.x) * packet.progress;
          const py = pFrom.y + (pTo.y - pFrom.y) * packet.progress;

          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = activeColor;
          ctx.shadowBlur = 10;
          ctx.shadowColor = activeColor;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // Update & Draw Sparks
      sparks = sparks.filter((spark) => {
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.alpha -= 1 / spark.life;

        if (spark.alpha <= 0) return false;

        ctx.beginPath();
        ctx.arc(spark.x, spark.y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(activeColor, spark.alpha);
        ctx.fill();
        return true;
      });

      animationFrameId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex h-[280px] w-[280px] min-[360px]:h-[320px] min-[360px]:w-[320px] sm:h-[480px] sm:w-[480px] lg:h-[600px] lg:w-[600px] items-center justify-center select-none"
    >
      <style>{`
        @keyframes rotate-bezel {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes counter-rotate-bezel {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .animate-bezel-rotate {
          animation: rotate-bezel 60s linear infinite;
        }
        .animate-bezel-counter-rotate {
          animation: counter-rotate-bezel 60s linear infinite;
        }
      `}</style>

      {/* Floating animation wrapper using framer-motion */}
      <motion.div
        animate={{
          y: [0, -15, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute h-[600px] w-[600px] flex items-center justify-center scale-[0.46] min-[360px]:scale-[0.53] sm:scale-[0.8] lg:scale-100 origin-center transition-all duration-500"
      >
        
        {/* Layer 1: Holographic Coordinate Grid Overlay (Fades in on Core Proximity) */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-700 -z-30"
          style={{
            backgroundImage: `linear-gradient(to right, ${hexToRgba(theme.accent, 0.05)} 1px, transparent 1px), linear-gradient(to bottom, ${hexToRgba(theme.accent, 0.05)} 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
            backgroundPosition: "center",
            opacity: isNearCore || isCoreHovered ? 1 : 0,
          }}
        />

        {/* Layer 1.1: Ambient Red Glow */}
        <div
          className="pointer-events-none absolute h-[450px] w-[450px] rounded-full blur-[120px] transition-all duration-1000 -z-20"
          style={{
            background: `radial-gradient(circle, rgba(215, 38, 56, 0.2) 0%, transparent 70%)`,
            transform: "translate(-60px, -40px)",
            opacity: isCoreHovered ? 0.45 : isNearCore ? 0.35 : 0.25,
          }}
        />

        {/* Layer 1.2: Ambient Gold Glow */}
        <div
          className="pointer-events-none absolute h-[450px] w-[450px] rounded-full blur-[120px] transition-all duration-1000 -z-20"
          style={{
            background: `radial-gradient(circle, rgba(255, 215, 0, 0.2) 0%, transparent 70%)`,
            transform: "translate(60px, 40px)",
            opacity: isCoreHovered ? 0.5 : isNearCore ? 0.4 : 0.3,
          }}
        />

        {/* Layer 3: Interactive Tilted 3D Stack */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {/* Slowly Rotating Watch Bezel Assembly */}
          <div
            style={{
              width: 600,
              height: 600,
              position: "absolute",
              transformStyle: "preserve-3d",
            }}
            className="animate-bezel-rotate"
          >
            {/* Canvas for packets flowing inside the bezel */}
            <canvas ref={canvasRef} className="absolute h-full w-full -z-10" />

            {/* SVG Luxury Watch Bezel + Neural Mandala */}
            <svg
              className="absolute h-full w-full"
              viewBox="0 0 600 600"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="bezelGoldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a8842a" />
                  <stop offset="30%" stopColor="#FFD700" />
                  <stop offset="70%" stopColor="#E6BE8A" />
                  <stop offset="100%" stopColor="#8a691b" />
                </linearGradient>
              </defs>

              {/* 1. Thick Luxury Watch Bezel Ring Body */}
              <path
                d="M 300 95 A 205 205 0 1 0 300 505 A 205 205 0 1 0 300 95 Z M 300 185 A 115 115 0 1 1 300 415 A 115 115 0 1 1 300 185 Z"
                fill="#120608"
                fillOpacity="0.94"
                stroke="url(#bezelGoldBorder)"
                strokeWidth="2.5"
                style={{ filter: "drop-shadow(0 12px 30px rgba(0,0,0,0.75))" }}
              />

              {/* 2. Outer Watch Fluted Bezel Ridges */}
              {Array.from({ length: 120 }).map((_, i) => {
                const angleRad = (i * 2 * Math.PI) / 120;
                const x1 = 300 + 205 * Math.cos(angleRad);
                const y1 = 300 + 205 * Math.sin(angleRad);
                const x2 = 300 + 211 * Math.cos(angleRad);
                const y2 = 300 + 211 * Math.sin(angleRad);
                return (
                  <line
                    key={`ridge-${i}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="url(#bezelGoldBorder)"
                    strokeWidth="1.2"
                    strokeOpacity="0.45"
                  />
                );
              })}

              {/* 3. Inner Watch Minute Ticks */}
              {Array.from({ length: 60 }).map((_, i) => {
                const angleRad = (i * 2 * Math.PI) / 60;
                const x1 = 300 + 115 * Math.cos(angleRad);
                const y1 = 300 + 115 * Math.sin(angleRad);
                const x2 = 300 + 120 * Math.cos(angleRad);
                const y2 = 300 + 120 * Math.sin(angleRad);
                return (
                  <line
                    key={`inner-tick-${i}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#E6BE8A"
                    strokeWidth="0.8"
                    strokeOpacity="0.3"
                  />
                );
              })}

              {/* 4. AI Circuit Trace Engravings inside the Bezel */}
              <circle cx="300" cy="300" r="145" stroke="#D72638" strokeWidth="0.8" strokeOpacity="0.25" strokeDasharray="30 15 80 25" fill="none" />
              <circle cx="300" cy="300" r="175" stroke="#FFD700" strokeWidth="0.8" strokeOpacity="0.25" strokeDasharray="100 40 15 45" fill="none" />
              <circle cx="300" cy="145" r="2" fill="#D72638" fillOpacity="0.65" />
              <circle cx="300" cy="455" r="2" fill="#D72638" fillOpacity="0.65" />
              <circle cx="145" cy="300" r="2" fill="#FFD700" fillOpacity="0.65" />
              <circle cx="455" cy="300" r="2" fill="#FFD700" fillOpacity="0.65" />

              {/* 5. Concentric Neural Network Mandala Rings */}
              <circle cx="300" cy="300" r="135" stroke={theme.accent} strokeWidth="0.8" strokeOpacity="0.18" fill="none" />
              <circle cx="300" cy="300" r="160" stroke={theme.accent} strokeWidth="0.8" strokeOpacity="0.15" fill="none" />
              <circle cx="300" cy="300" r="185" stroke={theme.accent} strokeWidth="0.8" strokeOpacity="0.2" fill="none" />

              {/* 6. Neural Network Connections (embedded inside bezel - simplified opacity and weight) */}
              {CONNECTIONS.map((conn, idx) => {
                const fromNode = NODES[conn.from];
                const toNode = NODES[conn.to];
                if (!fromNode || !toNode) return null;

                const isInner = conn.from.startsWith("I") && conn.to.startsWith("I");
                const isOuter = conn.from.startsWith("B") && conn.to.startsWith("B");
                const strokeColor = isInner ? "#E6BE8A" : isOuter ? "#FFD700" : "#D72638";

                return (
                  <motion.path
                    key={`c-${idx}`}
                    d={`M ${fromNode.x} ${fromNode.y} L ${toNode.x} ${toNode.y}`}
                    stroke={strokeColor}
                    strokeWidth={0.7}
                    animate={{
                      strokeOpacity: [0.05, 0.25, 0.05], // simplified network opacity
                    }}
                    transition={{
                      duration: 3 + (idx % 3) * 0.9,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                );
              })}

              {/* 7. Neural Node Dots */}
              {Object.entries(NODES).map(([key, n]) => {
                const isSpecialNode = key === "TOP" || key === "BOTTOM";
                if (isSpecialNode) return null;

                const nodeColor = key.startsWith("I") ? "#E6BE8A" : key.startsWith("A") ? "#D72638" : "#FFD700";

                return (
                  <motion.circle
                    key={`n-${key}`}
                    cx={n.x}
                    cy={n.y}
                    r={3}
                    fill={nodeColor}
                    animate={{
                      r: [3, 4.8, 3],
                      fillOpacity: [0.55, 0.95, 0.55],
                    }}
                    transition={{
                      duration: 2.2 + (key.charCodeAt(0) % 3) * 0.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{ filter: `drop-shadow(0 0 5px ${nodeColor})` }}
                  />
                );
              })}
            </svg>

            {/* 8. Engraved Nameplate Achievement Labels (highly spaced at 90 deg, premium spring interactions) */}
            {LABELS.map((lbl) => {
              const radius = 160;
              const angleRad = (lbl.angle * Math.PI) / 180;
              const x = 300 + radius * Math.cos(angleRad);
              const y = 300 + radius * Math.sin(angleRad);

              return (
                <div
                  key={lbl.id}
                  style={{
                    position: "absolute",
                    left: `${x}px`,
                    top: `${y}px`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <div className="animate-bezel-counter-rotate pointer-events-auto group">
                    <motion.div
                      whileHover={{
                        scale: 1.12,
                        borderColor: "#ffffff",
                        boxShadow: `0 0 20px ${lbl.color}, inset 0 0 10px ${hexToRgba(lbl.color, 0.4)}`,
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="px-3 py-1.5 rounded bg-[#100406] border border-opacity-35 flex items-center justify-center whitespace-nowrap cursor-default select-none transition-colors duration-300"
                      style={{
                        borderColor: lbl.color,
                        boxShadow: `inset 0 0 6px ${hexToRgba(lbl.color, 0.25)}, 0 3px 8px rgba(0,0,0,0.85)`,
                      }}
                    >
                      <span
                        className="font-display font-black text-[9.5px] sm:text-[10.5px] tracking-[0.18em] uppercase select-none transition-colors duration-300 group-hover:text-white"
                        style={{
                          color: lbl.color,
                          textShadow: `0 1px 2px rgba(0, 0, 0, 0.95), 0 0 8px ${hexToRgba(lbl.color, 0.55)}`,
                        }}
                      >
                        {lbl.label}
                      </span>
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Layer 5: Foreground Fixed AI Core Processor (Circular Portrait Avatar) */}
        <div
          onMouseEnter={() => setIsCoreHovered(true)}
          onMouseLeave={() => setIsCoreHovered(false)}
          className="relative z-20 h-[220px] w-[220px] cursor-pointer"
        >
          {/* AI Core Heartbeat Pulse System */}
          <motion.div
            className="pointer-events-none absolute rounded-full border-2"
            style={{
              inset: -12,
              borderColor: "#D72638",
              boxShadow: `0 0 25px rgba(215, 38, 56, 0.45)`,
            }}
            animate={{
              scale: [1, 1.1, 1.02, 1.18, 1, 1],
              opacity: [0.2, 0.6, 0.3, 0.7, 0.2, 0.2],
            }}
            transition={{
              duration: 4.5,
              times: [0, 0.08, 0.16, 0.28, 0.45, 1.0],
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Soft gold/red glow overlay */}
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              boxShadow: `0 0 30px rgba(255, 215, 0, 0.55), inset 0 0 20px rgba(215, 38, 56, 0.35)`,
              zIndex: 19,
            }}
            animate={{
              opacity: [0.4, 0.8, 0.4],
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Core Profile Image Container */}
          <div
            className="h-full w-full overflow-hidden rounded-full border-2 transition-all duration-700"
            style={{
              borderColor: "#FFD700",
              boxShadow: isCoreHovered
                ? `0 0 65px rgba(255, 215, 0, 0.75), 0 0 30px rgba(0, 0, 0, 0.9)`
                : isNearCore
                ? `0 0 52px rgba(255, 215, 0, 0.55), 0 8px 30px rgba(0, 0, 0, 0.8)`
                : `0 0 45px rgba(255, 215, 0, 0.4), 0 10px 40px -15px rgba(0,0,0,0.85)`,
            }}
          >
            <img
              src={profile}
              alt="Kaushik Kumar Reddy S profile avatar"
              width={300}
              height={300}
              className="h-full w-full object-cover select-none"
              loading="eager"
            />
            <div
              aria-hidden
              className="absolute inset-0 rounded-full transition-all duration-700"
              style={{
                background: `linear-gradient(180deg, transparent 55%, ${hexToRgba(theme.bg, isCoreHovered ? 0.2 : isNearCore ? 0.3 : 0.4)})`,
              }}
            />
          </div>

          {/* Soft inner glow overlay */}
          <div
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              boxShadow: `inset 0 0 28px rgba(255, 215, 0, 0.45)`,
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
