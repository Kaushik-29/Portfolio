import { useEffect, useState } from "react";

export function Typewriter({ words, className }: { words: string[]; className?: string }) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[index % words.length];
    if (!deleting && text === current) {
      const t = setTimeout(() => setDeleting(true), 1400);
      return () => clearTimeout(t);
    }
    if (deleting && text === "") {
      setDeleting(false);
      setIndex((i) => (i + 1) % words.length);
      return;
    }
    const t = setTimeout(
      () => {
        setText((prev) =>
          deleting ? current.slice(0, prev.length - 1) : current.slice(0, prev.length + 1),
        );
      },
      deleting ? 45 : 85,
    );
    return () => clearTimeout(t);
  }, [text, deleting, index, words]);

  return (
    <span className={className}>
      <span className="gold-gradient-text">{text}</span>
      <span className="ml-1 inline-block h-[1em] w-[2px] translate-y-[3px] bg-gold animate-pulse" />
    </span>
  );
}