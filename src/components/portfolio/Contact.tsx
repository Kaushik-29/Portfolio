import { useState } from "react";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";
import {
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { SectionHeading } from "./SectionHeading";
import { toast } from "sonner";

// ── EmailJS config ──────────────────────────────────────────────────────────
// 1. Sign up at https://www.emailjs.com (free tier: 200 emails/month)
// 2. Create a service (Gmail) → copy Service ID below
// 3. Create an email template → copy Template ID below
//    Template variables to use: {{from_name}}, {{from_email}}, {{subject}}, {{message}}
// 4. Copy your Public Key from Account → API Keys
const EMAILJS_SERVICE_ID  = "service_we8txbt";
const EMAILJS_TEMPLATE_ID = "template_jwniuln";
const EMAILJS_PUBLIC_KEY  = "kd23OKeoPI5BhANVw8EC7";
// ───────────────────────────────────────────────────────────────────────────

const contactLinks = [
  {
    icon: FaGithub,
    label: "GitHub",
    value: "github.com/Kaushik-29",
    href: "https://github.com/Kaushik-29",
  },
  {
    icon: FaLinkedin,
    label: "LinkedIn",
    value: "linkedin.com/in/kaushik29",
    href: "https://www.linkedin.com/in/kaushik29/",
  },
  {
    icon: FaEnvelope,
    label: "Email",
    value: "29skkr2005@gmail.com",
    href: "mailto:29skkr2005@gmail.com",
  },
  {
    icon: FaMapMarkerAlt,
    label: "Location",
    value: "Rajahmundry, India",
  },
];

export function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in name, email, and message.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setSending(true);
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: form.name,
          from_email: form.email,
          subject: form.subject || "(No subject)",
          message: form.message,
        },
        EMAILJS_PUBLIC_KEY
      );
      setForm({ name: "", email: "", subject: "", message: "" });
      toast.success("Message sent! I'll get back to you within 24 hours.");
    } catch (err) {
      console.error("EmailJS error:", err);
      toast.error("Failed to send message. Please try emailing me directly.");
    } finally {
      setSending(false);
    }
  };

  const field =
    "w-full border border-gold/30 bg-deep-red-3/60 px-4 py-3 text-sm text-cream placeholder:text-cream/40 outline-none transition-colors focus:border-gold";

  return (
    <section id="contact" className="section-pad relative">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading eyebrow="Get In Touch" title="Let's Connect" />
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.2fr]">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-5"
          >
            <p className="text-base leading-relaxed text-cream/85">
              Open to full-time roles, internships, freelance collaborations, and interesting
              research conversations. Drop a message — I respond within 24 hours.
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
                return "href" in c ? (
                  <a
                    key={c.label}
                    href={(c as { href: string }).href}
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                name="from_name"
                className={field}
                placeholder="Your Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                maxLength={100}
              />
              <input
                name="from_email"
                className={field}
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                maxLength={255}
              />
            </div>
            <input
              name="subject"
              className={`${field} mt-4`}
              placeholder="Subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              maxLength={150}
            />
            <textarea
              name="message"
              className={`${field} mt-4 min-h-[160px] resize-y`}
              placeholder="Your message…"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              maxLength={1000}
            />
            <button
              type="submit"
              disabled={sending}
              className="mt-6 w-full bg-gold px-6 py-3 text-sm font-bold uppercase tracking-widest text-deep-red-3 transition-all hover:scale-[1.01] hover:shadow-[0_10px_40px_-10px_rgba(212,175,55,0.7)] disabled:opacity-60"
            >
              {sending ? "Sending…" : "Send Message"}
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}