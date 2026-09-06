import { useState } from "react";
import { motion } from "framer-motion";
import { ScrollVideoPortrait } from "./ScrollVideoPortrait";
import { useTheme } from "./ThemeSelector";

// Helper to convert hex to rgba for transparency
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const n = parseInt(h, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function HeroProfile() {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative flex items-center justify-center select-none py-6">
      {/* Floating animation wrapper */}
      <motion.div
        animate={{
          y: [0, -12, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative flex items-center justify-center"
      >
        {/* Ambient Red/Gold Background Glows */}
        <div
          className="pointer-events-none absolute h-[440px] w-[440px] sm:h-[530px] sm:w-[530px] lg:h-[580px] lg:w-[580px] rounded-full blur-[100px] transition-all duration-700 -z-20"
          style={{
            background: `radial-gradient(circle, ${hexToRgba(theme.accent, 0.35)} 0%, rgba(215, 38, 56, 0.25) 50%, transparent 70%)`,
            transform: isHovered ? "scale(1.15)" : "scale(1)",
          }}
        />

        {/* Outer Radiant Luxury Ring */}
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "linear",
          }}
          className="pointer-events-none absolute -inset-5 sm:-inset-6 lg:-inset-7 rounded-full border border-gold/25"
          style={{
            boxShadow: `0 0 35px ${hexToRgba(theme.accent, 0.25)}, inset 0 0 25px rgba(215, 38, 56, 0.2)`,
          }}
        />

        {/* Pulse Ring */}
        <motion.div
          className="pointer-events-none absolute -inset-2.5 sm:-inset-3 rounded-full border"
          style={{
            borderColor: theme.accent,
          }}
          animate={{
            scale: [1, 1.04, 1],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Big Main Circle Frame (530px desktop) */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative z-10 h-[340px] w-[340px] min-[400px]:h-[380px] min-[400px]:w-[380px] sm:h-[470px] sm:w-[470px] lg:h-[530px] lg:w-[530px] rounded-full p-[3px] transition-transform duration-500 hover:scale-[1.02] cursor-pointer"
          style={{
            background: `linear-gradient(135deg, #FFD700 0%, #E6BE8A 30%, #D72638 70%, #FFD700 100%)`,
            boxShadow: isHovered
              ? `0 0 60px ${hexToRgba(theme.accent, 0.75)}, 0 15px 45px rgba(0, 0, 0, 0.9)`
              : `0 0 45px ${hexToRgba(theme.accent, 0.45)}, 0 10px 35px rgba(0, 0, 0, 0.8)`,
          }}
        >
          {/* Inner Circle Video Container */}
          <div className="relative h-full w-full overflow-hidden rounded-full bg-[#0d0305]">
            <ScrollVideoPortrait isHovered={isHovered} />

            {/* Subtle atmospheric vignette gradient overlay */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full transition-opacity duration-500"
              style={{
                background: `radial-gradient(circle, transparent 60%, rgba(10, 2, 4, 0.45) 90%, rgba(10, 2, 4, 0.8) 100%)`,
              }}
            />

            {/* Inner rim glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{
                boxShadow: `inset 0 0 25px rgba(255, 215, 0, 0.35)`,
              }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}



