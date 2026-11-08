import { useState } from "react";
import { toast } from "sonner";

// ── Web3Forms config ─────────────────────────────────────────────────────────
// Free plan: unlimited submissions. Sign up / get key at https://web3forms.com
const WEB3FORMS_ACCESS_KEY = "9f1a970a-1e83-42e4-8aa2-154e2b317048";
// ─────────────────────────────────────────────────────────────────────────────

export type ContactFormState = { name: string; email: string; subject: string; message: string };

const empty: ContactFormState = { name: "", email: "", subject: "", message: "" };

/**
 * Contact form state + Web3Forms submission, shared by the original and
 * Void contact sections. Each caller gets its own independent state.
 */
export function useContactForm() {
  const [form, setForm] = useState<ContactFormState>(empty);
  const [sending, setSending] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in name, email, and message.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          name: form.name,
          email: form.email,
          subject: form.subject || "Portfolio Contact Form",
          message: form.message,
          // Honeypot anti-spam field (leave empty)
          botcheck: "",
        }),
      });

      const data = await res.json();

      if (data.success) {
        setForm(empty);
        toast.success("Message sent! I'll get back to you within 24 hours. 🎉");
      } else {
        throw new Error(data.message || "Submission failed");
      }
    } catch (err) {
      console.error("Web3Forms error:", err);
      toast.error("Failed to send message. Please try emailing me directly.");
    } finally {
      setSending(false);
    }
  };

  return { form, setForm, sending, onSubmit };
}
