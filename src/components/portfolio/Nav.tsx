import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { navLinks, profile } from "@/content/portfolio";
import { BlackHoleButton } from "@/components/transition/BlackHoleButton";

const links = navLinks;

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 30);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-deep-red-3/85 backdrop-blur-md border-b border-gold/20 shadow-lg" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="#home" className="font-brush text-3xl gold-gradient-text">
          {profile.firstName}
        </a>
        <ul className="hidden items-center gap-8 lg:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="group relative text-sm font-medium tracking-wide text-cream/80 transition-colors hover:text-gold"
              >
                {l.label}
                <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-gold transition-all duration-300 group-hover:w-full" />
              </a>
            </li>
          ))}
          <li className="-mx-3 -my-2">
            <BlackHoleButton />
          </li>
        </ul>
        <a
          href="#contact"
          className="hidden border border-gold/60 bg-transparent px-5 py-2 text-sm font-semibold uppercase tracking-wider text-gold transition-all hover:bg-gold hover:text-deep-red-3 lg:inline-block"
        >
          Hire Me
        </a>
        <div className="flex items-center gap-2 lg:hidden">
          <BlackHoleButton />
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="border border-gold/40 p-2 text-gold"
          >
            <div className="h-0.5 w-5 bg-gold mb-1" />
            <div className="h-0.5 w-5 bg-gold mb-1" />
            <div className="h-0.5 w-5 bg-gold" />
          </button>
        </div>
      </nav>
      {open && (
        <div className="lg:hidden border-t border-gold/20 bg-deep-red-3/95">
          <ul className="flex flex-col gap-1 px-6 py-4">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block py-2 text-sm text-cream/90 hover:text-gold"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.header>
  );
}