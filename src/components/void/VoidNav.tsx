import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaGithub, FaLinkedinIn } from "react-icons/fa";
import { FiMail } from "react-icons/fi";
import type { IconType } from "react-icons";
import { contact, navLinks, profile, type ContactLinkKey } from "@/content/portfolio";
import { BlackHoleButton } from "@/components/transition/BlackHoleButton";

/** Void-layer anchors are prefixed so they never collide with the original layer's ids. */
export const voidHref = (href: string) => href.replace("#", "#void-");

const socialIcons: Partial<Record<ContactLinkKey, IconType>> = {
  github: FaGithub,
  linkedin: FaLinkedinIn,
  email: FiMail,
};
const socials = contact.links.filter((l) => l.href && socialIcons[l.key]);

export function VoidNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState("void-home");
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 30);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  // Track the section in view for the active link mark.
  useEffect(() => {
    const ids = navLinks.map((l) => voidHref(l.href).slice(1));
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActiveId(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Full-screen mobile menu: lock scroll, close on Escape, focus first link.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    const toggleBtn = toggleRef.current;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    menuRef.current?.querySelector<HTMLElement>("a")?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      toggleBtn?.focus({ preventScroll: true });
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow] duration-300 ${
        scrolled || open
          ? "bg-void-ivory/90 shadow-[0_1px_0_#C9C3B8] backdrop-blur-sm"
          : "bg-gradient-to-b from-void-ivory via-void-ivory/85 to-void-ivory/0"
      }`}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-8 lg:h-20 lg:px-12"
      >
        <a
          href="#void-home"
          className="flex items-center gap-2.5"
          aria-label={`${profile.fullName} — home`}
        >
          <span
            aria-hidden
            className="font-void-display text-3xl italic leading-none text-void-ink lg:text-4xl"
          >
            {profile.firstName.charAt(0)}
          </span>
          <span className="font-void-ui text-[13px] font-semibold uppercase tracking-[0.28em] text-void-ink">
            {profile.firstName}
          </span>
        </a>

        <div className="hidden items-center lg:flex">
          <span aria-hidden className="mr-6 h-7 w-px bg-void-stone xl:mr-10" />
          <ul className="flex items-center gap-5 xl:gap-8">
            {navLinks.map((l) => {
              const href = voidHref(l.href);
              const current = activeId === href.slice(1);
              return (
                <li key={l.href}>
                  <a
                    href={href}
                    aria-current={current ? "true" : undefined}
                    className="void-link-underline relative py-1 font-void-ui text-[14px] font-medium text-void-ink xl:text-[15px]"
                    style={current ? { backgroundSize: "100% 1.5px" } : undefined}
                  >
                    {l.label}
                  </a>
                </li>
              );
            })}
            <li className="-ml-1">
              <BlackHoleButton />
            </li>
          </ul>
          <span aria-hidden className="mx-6 hidden h-7 w-px bg-void-stone xl:mx-8 xl:block" />
          <ul className="hidden items-center gap-1 xl:flex">
            {socials.map((s) => {
              const Icon = socialIcons[s.key]!;
              return (
                <li key={s.key}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="grid h-10 w-10 place-items-center text-[20px] text-void-ink transition-transform hover:-translate-y-0.5"
                  >
                    <Icon />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <BlackHoleButton />
          <button
            ref={toggleRef}
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="void-mobile-menu"
            onClick={() => setOpen((v) => !v)}
            className="grid h-11 w-11 place-items-center"
          >
            <span aria-hidden className="relative block h-3.5 w-6">
              <span
                className={`absolute left-0 top-0 h-[2px] w-6 bg-void-ink transition-transform duration-300 ${open ? "translate-y-[6px] rotate-45" : ""}`}
              />
              <span
                className={`absolute left-0 top-[6px] h-[2px] w-4 bg-void-ink transition-opacity duration-200 ${open ? "opacity-0" : ""}`}
              />
              <span
                className={`absolute left-0 top-[12px] h-[2px] w-6 bg-void-ink transition-transform duration-300 ${open ? "-translate-y-[6px] -rotate-45" : ""}`}
              />
            </span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="void-mobile-menu"
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ clipPath: "circle(0% at 100% 0%)" }}
            animate={{ clipPath: "circle(150% at 100% 0%)" }}
            exit={{ clipPath: "circle(0% at 100% 0%)" }}
            transition={{ duration: 0.55, ease: [0.7, 0, 0.2, 1] }}
            className="fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col overflow-y-auto bg-void-ivory px-6 pb-10 pt-6 lg:hidden"
          >
            <ul className="flex flex-1 flex-col justify-center gap-1">
              {navLinks.map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.12 + i * 0.04 }}
                >
                  <a
                    href={voidHref(l.href)}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline gap-4 py-2 font-void-display text-[2.1rem] leading-tight text-void-ink sm:text-5xl"
                  >
                    <span
                      aria-hidden
                      className="font-void-ui text-xs tracking-[0.3em] text-void-ash"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {l.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <ul className="mt-8 flex gap-3 border-t border-void-stone pt-6">
              {socials.map((s) => {
                const Icon = socialIcons[s.key]!;
                return (
                  <li key={s.key}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="grid h-12 w-12 place-items-center border border-void-ink text-xl text-void-ink"
                    >
                      <Icon />
                    </a>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
