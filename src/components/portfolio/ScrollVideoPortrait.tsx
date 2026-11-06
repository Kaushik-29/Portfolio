import { useEffect, useRef, useState } from "react";
import profileLookingLeft from "@/assets/home.jpeg";
// 640x640, every frame is a keyframe, no audio, faststart (moov at the front).
// Every seek decodes exactly one small frame, so scrubbing is instant without
// pre-extracting frames into memory. Regenerate with:
// ffmpeg -i "Video Project 8.mp4" -an -vf "crop=ih:ih,scale=640:640:flags=lanczos" \
//   -c:v libx264 -preset slow -crf 23 -g 1 -keyint_min 1 -pix_fmt yuv420p -movflags +faststart portrait-scrub.mp4
import heroVideoSrc from "@/assets/portrait-scrub.mp4";

interface ScrollVideoPortraitProps {
  className?: string;
  isHovered?: boolean;
  initialTimeRatio?: number; // e.g. 1.0 for final smile frame
  fixedPose?: boolean;
}

const SENSITIVITY = 0.95;
const SCROLL_DISTANCE = 400;
const LERP = 0.22;

export function ScrollVideoPortrait({
  className = "",
  isHovered = false,
  initialTimeRatio,
  fixedPose = false,
}: ScrollVideoPortraitProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Poster stays visible until the first video frame is painted on the canvas.
  const [isVideoReady, setIsVideoReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let cancelled = false;
    let ready = false;
    let seeking = false;
    let prevX: number | null = null;

    const start = initialTimeRatio ?? 0;
    let target = start;
    let current = start;

    const timeFor = (progress: number) =>
      Math.max(0, progress * Math.max(video.duration - 0.05, 0));

    const draw = () => {
      if (cancelled || video.videoWidth === 0 || video.readyState < 2) return;
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
      ctx.drawImage(video, 0, 0);
      if (!ready) {
        ready = true;
        setIsVideoReady(true);
      }
    };

    const seekTo = (progress: number) => {
      if (!video.duration || isNaN(video.duration)) return;
      const t = timeFor(progress);
      if (Math.abs(video.currentTime - t) < 0.02) {
        draw();
        return;
      }
      seeking = true;
      video.currentTime = t;
    };

    const handleSeeked = () => {
      seeking = false;
      draw();
      // Keep chasing the target if the cursor moved while we were seeking.
      if (Math.abs(timeFor(current) - video.currentTime) > 0.02) seekTo(current);
    };

    const handleLoaded = () => {
      if (cancelled) return;
      if (start > 0) seekTo(start);
      else draw();
    };

    video.addEventListener("loadeddata", handleLoaded);
    video.addEventListener("seeked", handleSeeked);
    if (video.readyState >= 2) handleLoaded();

    const applyDelta = (clientX: number) => {
      if (prevX === null) {
        prevX = clientX;
        return;
      }
      const delta = clientX - prevX;
      prevX = clientX;
      target = Math.min(Math.max(target + (delta / window.innerWidth) * SENSITIVITY, 0), 1);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!fixedPose) applyDelta(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!fixedPose && e.touches.length > 0) applyDelta(e.touches[0].clientX);
    };

    const handleScroll = () => {
      if (fixedPose) return;
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      target = Math.min(Math.max(scrollY / SCROLL_DISTANCE, 0), 1);
    };

    const handleResetPrev = () => {
      prevX = null;
    };

    // Smooth lerp toward the target; one seek in flight at a time.
    let rafId = 0;
    const loop = () => {
      if (cancelled) return;
      if (!fixedPose) {
        const diff = target - current;
        if (Math.abs(diff) > 0.0005) {
          current += diff * LERP;
          if (!seeking && video.readyState >= 1) seekTo(current);
        }
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mouseleave", handleResetPrev);
    window.addEventListener("touchend", handleResetPrev);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      video.removeEventListener("loadeddata", handleLoaded);
      video.removeEventListener("seeked", handleSeeked);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mouseleave", handleResetPrev);
      window.removeEventListener("touchend", handleResetPrev);
    };
  }, [fixedPose, initialTimeRatio]);

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      {/* Hidden decoding video element */}
      <video
        ref={videoRef}
        src={heroVideoSrc}
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        className="hidden"
        crossOrigin="anonymous"
      />

      {/* Static poster shown instantly, crossfades out once the first video frame is drawn */}
      <img
        src={profileLookingLeft}
        alt="Kaushik Kumar Reddy Portrait"
        fetchPriority="high"
        decoding="async"
        className={`absolute inset-0 h-full w-full object-cover select-none transition-[opacity,transform] duration-500 ease-out ${
          isVideoReady ? "opacity-0 pointer-events-none" : "opacity-100 z-10"
        } ${isHovered ? "scale-105" : "scale-100"}`}
      />

      {/* Canvas the video frames are painted onto */}
      <canvas
        ref={canvasRef}
        className={`h-full w-full object-cover select-none pointer-events-none transition-transform duration-300 ${
          isHovered ? "scale-105" : "scale-100"
        }`}
      />
    </div>
  );
}
