import { useEffect, useRef, useState } from "react";
import profileLookingLeft from "@/assets/home.jpeg";
import heroVideoSrc from "@/assets/Video Project 8.mp4";

interface ScrollVideoPortraitProps {
  className?: string;
  isHovered?: boolean;
  initialTimeRatio?: number; // e.g. 1.0 for final smile frame
  fixedPose?: boolean;
}

export function ScrollVideoPortrait({
  className = "",
  isHovered = false,
  initialTimeRatio,
  fixedPose = false,
}: ScrollVideoPortraitProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cached decoded frames for zero-stutter 60fps interaction
  const framesCacheRef = useRef<ImageBitmap[]>([]);
  const isCachingRef = useRef(false);

  // Exact target & current smooth state
  const targetProgressRef = useRef(0); // 0.0 (looking left) -> 1.0 (looking center & smiling)
  const currentLerpProgressRef = useRef(0);
  const prevXRef = useRef<number | null>(null);
  const isDirectSeekingRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const startProgress = initialTimeRatio !== undefined ? initialTimeRatio : 0;
    targetProgressRef.current = startProgress;
    currentLerpProgressRef.current = startProgress;

    // Render helper: draws either from cached pre-extracted frames (super fast) or directly from video element
    const renderFrameAtProgress = (progress: number) => {
      const frames = framesCacheRef.current;
      if (frames.length > 0) {
        const index = Math.min(
          Math.max(Math.round(progress * (frames.length - 1)), 0),
          frames.length - 1
        );
        const bitmap = frames[index];
        if (bitmap) {
          if (canvas.width !== bitmap.width) {
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
          }
          ctx.drawImage(bitmap, 0, 0);
          setIsLoaded(true);
          return;
        }
      }

      // Fallback if cache is still building: draw directly from video
      if (video.videoWidth > 0) {
        if (canvas.width !== video.videoWidth) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }
        ctx.drawImage(video, 0, 0);
        setIsLoaded(true);
      }
    };

    // Pre-cache frame sequence in background for silky-smooth scrub
    const extractFrames = async () => {
      if (isCachingRef.current || framesCacheRef.current.length > 0) return;
      if (!video.duration || isNaN(video.duration) || video.duration <= 0) return;

      isCachingRef.current = true;
      const totalFrames = Math.min(Math.round(video.duration * 30), 120); // ~30fps extracted frames
      const step = (video.duration - 0.05) / (totalFrames - 1);
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = video.videoWidth || 720;
      tempCanvas.height = video.videoHeight || 720;
      const tempCtx = tempCanvas.getContext("2d", { alpha: false });

      const bitmaps: ImageBitmap[] = [];

      try {
        for (let i = 0; i < totalFrames; i++) {
          const seekTime = i * step;
          await new Promise<void>((resolve) => {
            const onSeeked = () => {
              video.removeEventListener("seeked", onSeeked);
              resolve();
            };
            video.addEventListener("seeked", onSeeked);
            video.currentTime = seekTime;
          });

          if (tempCtx && video.videoWidth > 0) {
            tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
            if (typeof createImageBitmap !== "undefined") {
              const bmp = await createImageBitmap(tempCanvas);
              bitmaps.push(bmp);
            }
          }
        }

        if (bitmaps.length > 10) {
          framesCacheRef.current = bitmaps;
        }
      } catch (err) {
        console.warn("Background frame cache warning:", err);
      } finally {
        isCachingRef.current = false;
        // Restore current lerp pose
        renderFrameAtProgress(currentLerpProgressRef.current);
      }
    };

    const handleLoaded = () => {
      if (video.videoWidth > 0) {
        if (canvas.width !== video.videoWidth) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }
        ctx.drawImage(video, 0, 0);
        setIsLoaded(true);
      }
      extractFrames();
    };

    const handleSeeked = () => {
      isDirectSeekingRef.current = false;
      renderFrameAtProgress(currentLerpProgressRef.current);
    };

    video.addEventListener("loadeddata", handleLoaded);
    video.addEventListener("canplay", handleLoaded);
    video.addEventListener("seeked", handleSeeked);

    if (video.readyState >= 2) {
      handleLoaded();
    }

    const SENSITIVITY = 0.95;
    const SCROLL_DISTANCE = 400;

    const handleMouseMove = (e: MouseEvent) => {
      if (fixedPose) return;
      const { clientX } = e;
      const { innerWidth } = window;

      if (prevXRef.current === null) {
        prevXRef.current = clientX;
        return;
      }

      const delta = clientX - prevXRef.current;
      prevXRef.current = clientX;

      const offset = (delta / innerWidth) * SENSITIVITY;
      targetProgressRef.current = Math.min(Math.max(targetProgressRef.current + offset, 0), 1);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (fixedPose) return;
      if (e.touches && e.touches.length > 0) {
        const touch = e.touches[0];
        const { clientX } = touch;
        const { innerWidth } = window;

        if (prevXRef.current === null) {
          prevXRef.current = clientX;
          return;
        }

        const delta = clientX - prevXRef.current;
        prevXRef.current = clientX;

        const offset = (delta / innerWidth) * SENSITIVITY;
        targetProgressRef.current = Math.min(Math.max(targetProgressRef.current + offset, 0), 1);
      }
    };

    const handleScroll = () => {
      if (fixedPose) return;
      const scrollY = window.pageYOffset || document.documentElement.scrollTop || window.scrollY || 0;
      const scrollRatio = Math.min(Math.max(scrollY / SCROLL_DISTANCE, 0), 1);
      targetProgressRef.current = scrollRatio;
    };

    const handleResetPrev = () => {
      prevXRef.current = null;
    };

    // Ultra-smooth 60/120fps lerp loop
    let rafId: number;

    const loop = () => {
      if (!fixedPose) {
        const diff = targetProgressRef.current - currentLerpProgressRef.current;
        if (Math.abs(diff) > 0.0005) {
          // Optimized easing factor for silky responsiveness without any judder
          currentLerpProgressRef.current += diff * 0.22;

          // If frame cache is ready, draw immediately from memory with zero seek lag
          if (framesCacheRef.current.length > 0) {
            renderFrameAtProgress(currentLerpProgressRef.current);
          } else if (
            video.duration &&
            !isDirectSeekingRef.current &&
            !isCachingRef.current
          ) {
            // Direct seek fallback while caching
            const targetTime = currentLerpProgressRef.current * (video.duration - 0.05);
            if (Math.abs(video.currentTime - targetTime) > 0.03) {
              isDirectSeekingRef.current = true;
              if ("fastSeek" in video && typeof (video as any).fastSeek === "function") {
                try {
                  (video as any).fastSeek(targetTime);
                } catch {
                  video.currentTime = targetTime;
                }
              } else {
                video.currentTime = targetTime;
              }
            }
          }
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
      cancelAnimationFrame(rafId);
      video.removeEventListener("loadeddata", handleLoaded);
      video.removeEventListener("canplay", handleLoaded);
      video.removeEventListener("seeked", handleSeeked);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mouseleave", handleResetPrev);
      window.removeEventListener("touchend", handleResetPrev);

      // Clean up cached bitmaps
      framesCacheRef.current.forEach((bmp) => {
        try {
          bmp.close();
        } catch {}
      });
      framesCacheRef.current = [];
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

      {/* Fallback image */}
      <img
        src={profileLookingLeft}
        alt="Animated Kaushik Portrait Reference"
        className={`absolute inset-0 h-full w-full object-cover select-none transition-opacity duration-300 ${
          isLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      />

      {/* Hardware-accelerated smooth canvas display */}
      <canvas
        ref={canvasRef}
        className={`h-full w-full object-cover select-none pointer-events-none transition-transform duration-300 ${
          isHovered ? "scale-105" : "scale-100"
        }`}
      />
    </div>
  );
}

