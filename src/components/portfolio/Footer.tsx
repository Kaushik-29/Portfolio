import { footer, profile } from "@/content/portfolio";

export function Footer() {
  return (
    <footer className="relative bg-deep-red-3/80 pt-10 pb-8">
      <div className="gold-divider mx-auto mb-8 max-w-5xl" />
      <div className="mx-auto max-w-7xl px-6 text-center">
        <p className="font-brush gold-gradient-text text-3xl">{profile.fullName}</p>
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.3em] text-cream/70">
          {footer.roles}
        </p>
        <p className="mt-6 text-sm text-cream/60">
          {footer.copyright}
        </p>
      </div>
    </footer>
  );
}