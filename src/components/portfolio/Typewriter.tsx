import { useTypewriter } from "@/hooks/use-typewriter";

export function Typewriter({ words, className }: { words: string[]; className?: string }) {
  const text = useTypewriter(words);

  return (
    <span className={className}>
      <span className="gold-gradient-text">{text}</span>
      <span className="ml-1 inline-block h-[1em] w-[2px] translate-y-[3px] bg-gold animate-pulse" />
    </span>
  );
}
