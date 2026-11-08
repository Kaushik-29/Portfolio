import { motion } from "framer-motion";
import {
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { SectionHeading } from "./SectionHeading";
import { contact, sectionHeadings, type ContactLinkKey } from "@/content/portfolio";
import { useContactForm } from "@/hooks/use-contact-form";
import type { IconType } from "react-icons";

const contactIcons: Record<ContactLinkKey, IconType> = {
  github: FaGithub,
  linkedin: FaLinkedin,
  email: FaEnvelope,
  location: FaMapMarkerAlt,
};

const contactLinks = contact.links.map((c) => ({ ...c, icon: contactIcons[c.key] }));

export function Contact() {
  const { form, setForm, sending, onSubmit } = useContactForm();

  const field =
    "w-full border border-gold/30 bg-deep-red-3/60 px-4 py-3 text-sm text-cream placeholder:text-cream/40 outline-none transition-colors focus:border-gold";

  return (
    <section id="contact" className="section-pad relative">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading {...sectionHeadings.contact} />
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.2fr]">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-5"
          >
            <p className="text-base leading-relaxed text-cream/85">
              {contact.intro}
            </p>
            <div className="space-y-3">
              {contactLinks.map((c) => {
                const Icon = c.icon;
                const inner = (
                  <div className="group flex items-center gap-4 border border-gold/30 bg-deep-red-3/50 p-4 transition-all hover:border-gold hover:shadow-[0_10px_30px_-10px_rgba(212,175,55,0.4)]">
                    <div className="grid h-11 w-11 shrink-0 place-items-center border border-gold/50 bg-deep-red-2 text-gold transition-colors group-hover:bg-gold group-hover:text-deep-red-3">
                      <Icon className="text-lg" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold">
                        {c.label}
                      </p>
                      <p className="truncate text-sm text-cream/90">{c.value}</p>
                    </div>
                  </div>
                );
                return c.href ? (
                  <a
                    key={c.label}
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {inner}
                  </a>
                ) : (
                  <div key={c.label}>{inner}</div>
                );
              })}
            </div>
          </motion.div>

          <motion.form
            onSubmit={onSubmit}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="border border-gold/30 bg-deep-red-3/50 p-6 md:p-8"
          >
            {/* Honeypot field — hidden from real users, catches bots */}
            <input type="checkbox" name="botcheck" className="hidden" />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                name="name"
                className={field}
                placeholder={contact.placeholders.name}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                maxLength={100}
                required
              />
              <input
                name="email"
                className={field}
                placeholder={contact.placeholders.email}
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                maxLength={255}
                required
              />
            </div>
            <input
              name="subject"
              className={`${field} mt-4`}
              placeholder={contact.placeholders.subject}
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              maxLength={150}
            />
            <textarea
              name="message"
              className={`${field} mt-4 min-h-[160px] resize-y`}
              placeholder={contact.placeholders.message}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              maxLength={1000}
              required
            />
            <button
              type="submit"
              disabled={sending}
              className="mt-6 w-full bg-gold px-6 py-3 text-sm font-bold uppercase tracking-widest text-deep-red-3 transition-all hover:scale-[1.01] hover:shadow-[0_10px_40px_-10px_rgba(212,175,55,0.7)] disabled:opacity-60"
            >
              {sending ? "Sending…" : "Send Message →"}
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}