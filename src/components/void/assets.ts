/**
 * Void-theme visual assets. Swap any of these single references to replace
 * the artwork everywhere it is used.
 */
import characterPlaceholder from "@/assets/void/character-placeholder.webp";
import aboutPhoto from "@/assets/void/about-720.webp";
import aboutPhotoFull from "@/assets/about.jpeg";
import flexShot from "@/assets/void/project-flex.webp";
import alleivoShot from "@/assets/void/project-alleivo.webp";
import commodityShot from "@/assets/void/project-commodity.webp";
import educationArt from "@/assets/void/education-art.webp";
import educationArtSmall from "@/assets/void/education-art-860.webp";
import type { ProjectItem } from "@/content/portfolio";

/**
 * HERO CHARACTER — TEMPORARY PLACEHOLDER.
 * Cropped from the supplied reference mockup (text removed). Replace this one
 * import with the final high-resolution render; layout adapts automatically.
 */
export const VOID_CHARACTER = {
  src: characterPlaceholder,
  width: 1130,
  height: 870,
  alt: "Void character artwork — a figure in a black cloak and scarf dissolving into ink",
  isPlaceholder: true,
};

/** Education artwork (supplied scene; frame cropped, paper retoned to ivory). */
export const VOID_EDUCATION_ART = {
  src: educationArt,
  small: educationArtSmall,
  width: 1433,
  height: 1058,
  alt: "Void artwork — a cloaked figure on a cliff facing a swirling black hole",
};

export const VOID_ABOUT_PHOTO = {
  src: aboutPhoto,
  fallback: aboutPhotoFull,
  width: 720,
  height: 960,
};

/**
 * Real screenshots captured from the live demos. Projects without an entry
 * render a clearly marked placeholder.
 */
export const PROJECT_SCREENSHOTS: Partial<
  Record<ProjectItem["key"], { src: string; width: number; height: number }>
> = {
  flex: { src: flexShot, width: 1280, height: 720 },
  alleivo: { src: alleivoShot, width: 1280, height: 720 },
  commodity: { src: commodityShot, width: 1280, height: 720 },
};

/** Certificate images — none supplied yet; cards render placeholders. */
export const CERTIFICATE_IMAGES: Record<string, string> = {};
