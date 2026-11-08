import { useId, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUp } from "lucide-react";
import { FaEnvelope, FaGithub, FaLinkedinIn, FaMapMarkerAlt } from "react-icons/fa";
import type { IconType } from "react-icons";
import {
  contact,
  footer,
  navLinks,
  profile,
  sectionHeadings,
  type ContactLinkKey,
} from "@/content/portfolio";
import { useContactForm } from "@/hooks/use-contact-form";
import {
  InkWaves,
  Reveal,
  VoidEnergy,
  VoidSectionHeading,
  usePauseOffscreen,
} from "./VoidPrimitives";
import { voidHref } from "./VoidNav";

const icons: Record<ContactLinkKey, IconType> = {
  github: FaGithub,
  linkedin: FaLinkedinIn,
  email: FaEnvelope,
  location: FaMapMarkerAlt,
};

const field =
  "peer w-full border-0 border-b-[1.5px] border-void-ink bg-transparent px-0 pb-2.5 pt-6 font-void-serif text-[1.05rem] text-void-ink placeholder:text-transparent focus:border-b-[2.5px] focus:outline-none focus-visible:outline-none";
const label =
  "pointer-events-none absolute left-0 top-6 font-void-ui text-[13px] text-void-ink transition-all duration-200 peer-focus:top-0 peer-focus:text-[11px] peer-focus:tracking-[0.18em] peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:tracking-[0.18em] uppercase tracking-[0.12em]";

export function VoidContact() {
  const { form, setForm, sending, onSubmit } = useContactForm();
  const uid = useId();
  const fid = (n: string) => `${uid}-${n}`;

  return (
    <section
      id="void-contact"
      className="relative overflow-hidden px-5 py-24 sm:px-8 md:py-32 lg:px-12"
    >
      <VoidEnergy
        size={360}
        className="pointer-events-none absolute -left-[250px] bottom-10 hidden opacity-80 2xl:block"
      />
      <div className="relative mx-auto max-w-[1280px]">
        <VoidSectionHeading index="07" {...sectionHeadings.contact} />
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <Reveal>
            <p className="text-[1.15rem] leading-[1.75] text-void-ink">{contact.intro}</p>
            <ul className="mt-10 border-t border-void-ink">
              {contact.links.map((c) => {
                const Icon = icons[c.key];
                const inner = (
                  <>
                    <span className="grid h-11 w-11 shrink-0 place-items-center border border-void-ink text-lg transition-colors duration-500 group-hover:border-void-ivory group-focus-visible:border-void-ivory">
                      <Icon aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-void-ui text-[11px] font-semibold uppercase tracking-[0.3em]">
                        {c.label}
                      </span>
                      <span className="block truncate text-[1.02rem]">{c.value}</span>
                    </span>
                  </>
                );
                return (
                  <li key={c.key} className="border-b border-void-ink">
                    {c.href ? (
                      <a
                        href={c.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="void-ink-fill void-ink-fill-x group -mx-3 flex items-center gap-4 py-4 pl-3 pr-7 text-void-ink"
                      >
                        {inner}
                        <ArrowRight
                          className="ml-auto h-4 w-4 shrink-0 transition-transform duration-500 group-hover:translate-x-1.5"
                          aria-hidden
                        />
                      </a>
                    ) : (
                      <div className="group flex items-center gap-4 py-4 text-void-ink">
                        {inner}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </Reveal>

          <Reveal delay={0.1}>
            <form
              onSubmit={onSubmit}
              className="border-[1.5px] border-void-ink bg-void-ivory p-6 shadow-[12px_12px_0_#080909] transition-[box-shadow,transform] duration-500 focus-within:-translate-x-1 focus-within:-translate-y-1 focus-within:shadow-[18px_18px_0_#080909] md:p-10"
              noValidate={false}
            >
              {/* Honeypot field — hidden from real users, catches bots */}
              <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} aria-hidden />
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="relative">
                  <input
                    id={fid("name")}
                    name="name"
                    className={field}
                    placeholder={contact.placeholders.name}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    maxLength={100}
                    autoComplete="name"
                    required
                  />
                  <label htmlFor={fid("name")} className={label}>
                    {contact.placeholders.name}
                  </label>
                </div>
                <div className="relative">
                  <input
                    id={fid("email")}
                    name="email"
                    type="email"
                    className={field}
                    placeholder={contact.placeholders.email}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    maxLength={255}
                    autoComplete="email"
                    required
                  />
                  <label htmlFor={fid("email")} className={label}>
                    {contact.placeholders.email}
                  </label>
                </div>
              </div>
              <div className="relative mt-6">
                <input
                  id={fid("subject")}
                  name="subject"
                  className={field}
                  placeholder={contact.placeholders.subject}
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  maxLength={150}
                />
                <label htmlFor={fid("subject")} className={`${label} max-w-full truncate`}>
                  {contact.placeholders.subject}
                </label>
              </div>
              <div className="relative mt-6">
                <textarea
                  id={fid("message")}
                  name="message"
                  className={`${field} min-h-[150px] resize-y`}
                  placeholder={contact.placeholders.message}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  maxLength={1000}
                  required
                />
                <label htmlFor={fid("message")} className={label}>
                  {contact.placeholders.message}
                </label>
              </div>
              <button
                type="submit"
                disabled={sending}
                className="void-ink-fill void-ink-fill--ivory mt-9 inline-flex min-h-12 w-full items-center justify-center gap-2 border-[1.5px] border-void-ink bg-void-ink px-6 py-3.5 font-void-ui text-[14px] font-semibold uppercase tracking-[0.2em] text-void-ivory transition-[letter-spacing] duration-500 hover:tracking-[0.28em] active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60"
              >
                {sending ? "Sending…" : "Send Message →"}
              </button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

const footerSocials = contact.links.filter((l) => l.href);

const ivoryLink =
  "bg-[linear-gradient(#EAE6DC,#EAE6DC)] bg-[length:0%_1px] bg-[position:0_100%] bg-no-repeat pb-0.5 transition-[background-size] duration-500 hover:bg-[length:100%_1px] focus-visible:bg-[length:100%_1px]";

export function VoidFooter() {
  const ref = useRef<HTMLElement>(null);
  usePauseOffscreen(ref);
  // Keep a trailing initial with the word before it ("Reddy S") so it never wraps alone.
  const NBSP = String.fromCharCode(160);
  const nameWords = profile.fullName.split(" ").reduce<string[]>((acc, w) => {
    if (w.length <= 2 && acc.length) acc[acc.length - 1] += NBSP + w;
    else acc.push(w);
    return acc;
  }, []);

  return (
    <footer ref={ref} className="relative mt-16 overflow-hidden">
      {/* The tide: layered ink waves with droplets thrown upward */}
      <div aria-hidden className="relative h-32 md:h-48">
        <InkWaves className="inset-0 h-full" />
      </div>

      <div
        data-ink-invert
        className="relative z-[1] -mt-6 overflow-hidden bg-void-ink px-5 pb-10 pt-12 text-void-ivory sm:px-8 md:-mt-10 md:pt-20 lg:px-12"
      >
        {/* Inverted void energy turning slowly behind the name */}
        <svg
          viewBox="0 0 400 400"
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-24 h-[520px] w-[520px] opacity-25 md:-right-16"
        >
          <g className="void-spin" fill="none" stroke="#EAE6DC">
            <circle cx="200" cy="200" r="186" strokeWidth="1" strokeDasharray="2 10" />
            <circle cx="200" cy="200" r="150" strokeWidth="1.5" strokeDasharray="80 30 12 30" />
          </g>
          <g className="void-spin-rev" fill="none" stroke="#C9C3B8">
            <circle
              cx="200"
              cy="200"
              r="116"
              strokeWidth="3"
              strokeDasharray="140 60 20 40"
              strokeLinecap="round"
            />
          </g>
        </svg>

        <div className="relative mx-auto max-w-[1280px]">
          <p className="font-void-display text-[3rem] leading-[0.95] text-void-ivory sm:text-7xl lg:text-[5.6rem] xl:text-[6.6rem]">
            <span className="sr-only">{profile.fullName}</span>
            {nameWords.map((w, i) => (
              <span
                key={`${w}-${i}`}
                aria-hidden
                className="mr-[0.22em] inline-block overflow-hidden align-bottom"
              >
                <motion.span
                  className="inline-block"
                  initial={{ y: "105%" }}
                  whileInView={{ y: "0%" }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.9, delay: i * 0.08, ease: [0.7, 0, 0.2, 1] }}
                >
                  {w}
                </motion.span>
              </span>
            ))}
          </p>
          <p className="mt-5 font-void-ui text-[11px] font-semibold uppercase tracking-[0.3em] text-void-ivory">
            {footer.roles}
          </p>

          <div className="mt-14 grid grid-cols-1 gap-10 border-t border-void-ash/60 pt-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_auto]">
            <nav aria-label="Footer">
              <ul className="grid grid-cols-2 gap-x-8 gap-y-3 font-void-ui text-[14px]">
                {navLinks.map((l) => (
                  <li key={l.href}>
                    <a href={voidHref(l.href)} className={ivoryLink}>
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <ul className="space-y-3 font-void-ui text-[14px]">
              {footerSocials.map((l) => (
                <li key={l.key}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer" className={ivoryLink}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <a
              href="#void-home"
              aria-label="Back to top"
              className="group grid h-16 w-16 place-items-center self-start rounded-full border border-void-ivory/70 transition-colors duration-500 hover:bg-void-ivory hover:text-void-ink focus-visible:bg-void-ivory focus-visible:text-void-ink"
            >
              <ArrowUp
                aria-hidden
                className="h-5 w-5 transition-transform duration-500 group-hover:-translate-y-1"
              />
            </a>
          </div>

          <p className="mt-14 font-void-ui text-[13px] text-void-stone">{footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
