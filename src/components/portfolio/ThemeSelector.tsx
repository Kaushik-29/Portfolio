import { createContext, useContext, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Palette, Check, X } from "lucide-react";

type Theme = {
  id: string;
  name: string;
  bg: string;
  card: string;
  accent: string;
  text: string;
  bgTop: string;
  bgBottom: string;
};

const THEMES: Theme[] = [
  {
    id: "midnight",
    name: "Midnight Navy & Gold",
    bg: "#0F172A",
    card: "#1E293B",
    accent: "#D4AF37",
    text: "#FFFFFF",
    bgTop: "#1a2747",
    bgBottom: "#070b18",
  },
  {
    id: "genspark",
    name: "Genspark Red & Gold",
    bg: "#8B0000",
    card: "#A00000",
    accent: "#D4AF37",
    text: "#FFFFFF",
    bgTop: "#5e0b0b",
    bgBottom: "#2a0606",
  },
  {
    id: "charcoal",
    name: "Charcoal Black & Gold",
    bg: "#111111",
    card: "#1E1E1E",
    accent: "#D4AF37",
    text: "#FFFFFF",
    bgTop: "#1f1f1f",
    bgBottom: "#050505",
  },
  {
    id: "royal-blue",
    name: "Royal Blue & Platinum",
    bg: "#102A43",
    card: "#243B53",
    accent: "#D9D9D9",
    text: "#FFFFFF",
    bgTop: "#1c3e5e",
    bgBottom: "#081827",
  },
  {
    id: "emerald",
    name: "Emerald & Cream",
    bg: "#0F5132",
    card: "#146C43",
    accent: "#F5E6C8",
    text: "#FFFFFF",
    bgTop: "#177148",
    bgBottom: "#06291a",
  },
  {
    id: "purple",
    name: "Royal Purple & Gold",
    bg: "#2D1B69",
    card: "#44318D",
    accent: "#D4AF37",
    text: "#FFFFFF",
    bgTop: "#3d278f",
    bgBottom: "#1a0e3f",
  },
];

type Ctx = { theme: Theme; setThemeId: (id: string) => void };
const ThemeCtx = createContext<Ctx | null>(null);

export function useTheme() {
  const v = useContext(ThemeCtx);
  if (!v) throw new Error("useTheme outside provider");
  return v;
}

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgba(hex: string, a: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

function applyTheme(t: Theme) {
  if (typeof document === "undefined") return;
  const r = document.documentElement.style;
  // Override existing semantic vars (used throughout the site)
  r.setProperty("--deep-red", t.bg);
  r.setProperty("--deep-red-2", t.bg);
  r.setProperty("--deep-red-3", t.card);
  r.setProperty("--gold", t.accent);
  r.setProperty("--gold-soft", t.accent);
  r.setProperty("--cream", t.text);
  r.setProperty("--background", t.bg);
  r.setProperty("--foreground", t.text);
  r.setProperty("--card", t.card);
  r.setProperty("--card-foreground", t.text);
  r.setProperty("--popover", t.card);
  r.setProperty("--popover-foreground", t.text);
  r.setProperty("--primary", t.accent);
  r.setProperty("--primary-foreground", t.card);
  r.setProperty("--secondary", t.card);
  r.setProperty("--secondary-foreground", t.text);
  r.setProperty("--muted", t.card);
  r.setProperty("--accent", t.accent);
  r.setProperty("--accent-foreground", t.card);
  r.setProperty("--border", rgba(t.accent, 0.28));
  r.setProperty("--input", rgba(t.accent, 0.18));
  r.setProperty("--ring", t.accent);
  r.setProperty("--theme-bg-top", t.bgTop);
  r.setProperty("--theme-bg-bottom", t.bgBottom);
  document.body.classList.add("theme-active");
}

const STORAGE_THEME = "portfolio.theme_v2";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeIdState] = useState<string>(THEMES[0].id);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_THEME);
    const t = THEMES.find((x) => x.id === saved) ?? THEMES[0];
    setThemeIdState(t.id);
    applyTheme(t);
  }, []);

  const setThemeId = (id: string) => {
    const t = THEMES.find((x) => x.id === id) ?? THEMES[0];
    setThemeIdState(t.id);
    applyTheme(t);
    localStorage.setItem(STORAGE_THEME, t.id);
  };

  const theme = THEMES.find((x) => x.id === themeId) ?? THEMES[0];

  return (
    <ThemeCtx.Provider value={{ theme, setThemeId }}>
      {children}
      <ThemeSelector />
    </ThemeCtx.Provider>
  );
}

function ThemeSelector() {
  const { theme, setThemeId } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.div
        className="fixed bottom-6 right-6 z-[9999]"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
      >
        <button
          aria-label="Open theme selector"
          title="Click to change color palette & theme"
          onClick={() => setOpen((v) => !v)}
          className="group relative grid h-14 w-14 cursor-pointer place-items-center rounded-2xl transition-shadow duration-300"
          style={{
            background: theme.card,
            border: `1px solid ${rgba(theme.accent, 0.5)}`,
            boxShadow: `0 8px 30px ${rgba(theme.accent, 0.35)}, inset 0 0 0 1px ${rgba(theme.accent, 0.15)}`,
            color: theme.accent,
          }}
        >
          <Palette className="h-6 w-6" />
          <span
            className="absolute inset-0 rounded-2xl animate-pulse opacity-40"
            style={{ boxShadow: `0 0 24px ${rgba(theme.accent, 0.55)}` }}
          />
        </button>
      </motion.div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[9998]"
              style={{ background: rgba("#000000", 0.35) }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              role="dialog"
              aria-label="Theme selector"
              className="fixed z-[9999] bottom-24 right-4 sm:right-6 w-[calc(100vw-32px)] sm:w-[400px] max-h-[82vh] overflow-y-auto rounded-2xl p-5 backdrop-blur-xl shadow-2xl"
              style={{
                background: rgba(theme.card, 0.85),
                border: `1px solid ${rgba(theme.accent, 0.4)}`,
                boxShadow: `0 30px 80px ${rgba("#000000", 0.6)}, 0 0 40px ${rgba(theme.accent, 0.25)}`,
                color: theme.text,
              }}
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div
                    className="text-xs font-semibold uppercase tracking-[0.25em]"
                    style={{ color: theme.accent }}
                  >
                    Color Palette
                  </div>
                  <div className="font-display text-lg font-bold">
                    Choose your theme
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="grid h-8 w-8 place-items-center rounded-lg transition-colors hover:bg-white/10"
                  style={{
                    color: theme.text,
                    border: `1px solid ${rgba(theme.accent, 0.3)}`,
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {THEMES.map((t) => {
                  const active = t.id === theme.id;
                  return (
                    <motion.button
                      key={t.id}
                      onClick={() => setThemeId(t.id)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      title={t.name}
                      className="group relative overflow-hidden rounded-xl p-3 text-left transition-all duration-200"
                      style={{
                        background: t.bg,
                        border: `1px solid ${active ? t.accent : rgba(t.accent, 0.35)}`,
                        boxShadow: active
                          ? `0 0 0 2px ${rgba(t.accent, 0.5)}, 0 8px 24px ${rgba(t.accent, 0.35)}`
                          : `0 4px 14px ${rgba("#000000", 0.35)}`,
                        color: t.text,
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className="h-5 w-5 rounded-full"
                          style={{ background: t.card, border: `1px solid ${rgba(t.accent, 0.4)}` }}
                        />
                        <span
                          className="h-5 w-5 rounded-full"
                          style={{ background: t.accent }}
                        />
                        {active && (
                          <span
                            className="ml-auto grid h-4 w-4 place-items-center rounded-full"
                            style={{ background: t.accent, color: t.card }}
                          >
                            <Check className="h-2.5 w-2.5 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <div className="mt-2.5 text-[11px] font-semibold leading-tight sm:text-xs">
                        {t.name}
                      </div>
                      <div
                        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{ boxShadow: `inset 0 0 25px ${rgba(t.accent, 0.4)}` }}
                      />
                    </motion.button>
                  );
                })}
              </div>

              <div
                className="mt-4 text-center text-[10px] font-medium uppercase tracking-[0.25em] opacity-70"
                style={{ color: theme.accent }}
              >
                Instant Theme Customizer
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}