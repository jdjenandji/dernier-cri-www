"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef, useMemo } from "react";
import type { Station } from "@/types/station";
import { YouTubeLoopPlayer, YouTubeLoopPlayerRef, extractYouTubeVideoId } from "@/components/YouTubeLoopPlayer";
import Image from "next/image";

interface VideoCarouselProps {
  stations: Station[];
  currentIndex: number;
  isActive: boolean;
  transitionDuration?: number;
  dragOffset?: number;
  isDragging?: boolean;
  isAnimating?: boolean;
}

export interface VideoCarouselRef {
  playAllVideos: () => void;
}

// Calculate visual properties based on position relative to viewport
function getItemVisuals(
  itemIndex: number,
  currentIndex: number,
  dragOffset: number,
  screenHeight: number
): { opacity: number; scale: number; translateY: number } {
  // Base position in pixels from the current view
  const baseOffset = (itemIndex - currentIndex) * screenHeight;
  // Add drag offset to get actual visual position
  const actualOffset = baseOffset + dragOffset;
  // Normalize to -1 to 1 range (where 0 is center, -1 is one screen up, 1 is one screen down)
  const normalizedPosition = actualOffset / screenHeight;
  
  // Scale: current = 1.0, adjacent = 0.92, further = 0.85
  const absPos = Math.abs(normalizedPosition);
  const scale = absPos < 0.1 
    ? 1.0 
    : absPos < 1.1 
      ? 1.0 - (absPos * 0.08) // 1.0 to 0.92
      : 0.85;

  // Opacity: current = 1.0, adjacent fades
  const opacity = absPos < 0.1 
    ? 1.0 
    : absPos < 1.5 
      ? 1.0 - (absPos * 0.3) // Fade to 0.55 at edges
      : 0.4;

  return {
    opacity: Math.max(0.4, Math.min(1, opacity)),
    scale: Math.max(0.85, Math.min(1, scale)),
    translateY: actualOffset,
  };
}

export const VideoCarousel = forwardRef<VideoCarouselRef, VideoCarouselProps>(function VideoCarousel({
  stations,
  currentIndex,
  isActive,
  transitionDuration = 400,
  dragOffset = 0,
  isDragging = false,
  isAnimating = false,
}, ref) {
  const videoRefs = useRef<Map<string, YouTubeLoopPlayerRef>>(new Map());
  const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

  // Expose method to play all videos
  useImperativeHandle(ref, () => ({
    playAllVideos: () => {
      videoRefs.current.forEach((videoRef) => {
        videoRef.play();
      });
    },
  }));

  // Calculate which stations to render (current + 2 before and after for smooth transitions)
  const visibleRange = useMemo(() => {
    const buffer = 2;
    const start = Math.max(0, currentIndex - buffer);
    const end = Math.min(stations.length - 1, currentIndex + buffer);
    return { start, end };
  }, [currentIndex, stations.length]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {stations.map((station, index) => {
        // Only render stations in visible range for performance
        if (index < visibleRange.start || index > visibleRange.end) {
          return null;
        }

        const videoId = station.video_url
          ? extractYouTubeVideoId(station.video_url)
          : null;
        const isCurrentStation = index === currentIndex;
        
        // Calculate visual properties
        const visuals = getItemVisuals(index, currentIndex, dragOffset, screenHeight);
        
        // Determine if we should use CSS transitions (only when not dragging/animating via JS)
        const shouldTransition = !isDragging && !isAnimating;

        return (
          <div
            key={station.id}
            className="absolute inset-0 w-full h-full flex flex-col items-center justify-center px-8"
            style={{
              transform: `translateY(${visuals.translateY}px) scale(${visuals.scale})`,
              opacity: visuals.opacity,
              transition: shouldTransition 
                ? `transform ${transitionDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity ${transitionDuration}ms ease-out`
                : 'none',
              willChange: 'transform, opacity',
              // GPU acceleration
              backfaceVisibility: 'hidden',
              perspective: 1000,
            }}
            aria-live={isCurrentStation && isActive ? "polite" : "off"}
            aria-label={`${isCurrentStation && isActive ? "Now playing: " : ""}${station.name}, ${station.city ? `${station.city}, ` : ""}${station.country}`}
          >
            <div 
              className="flex flex-col items-center gap-8 max-w-md"
              style={{
                // Subtle parallax effect on content
                transform: `translateY(${dragOffset * 0.05}px)`,
                transition: shouldTransition ? `transform ${transitionDuration}ms ease-out` : 'none',
              }}
            >
              {/* Station Video/Logo */}
              <div 
                className="relative w-48 h-48 rounded-2xl overflow-hidden shadow-2xl"
                style={{
                  // Extra shadow depth when current
                  boxShadow: isCurrentStation 
                    ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                    : '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                }}
              >
                {videoId ? (
                  <YouTubeLoopPlayer
                    ref={(el) => {
                      if (el) {
                        videoRefs.current.set(station.id, el);
                      } else {
                        videoRefs.current.delete(station.id);
                      }
                    }}
                    videoId={videoId}
                    startTime={station.video_start_time}
                    endTime={station.video_end_time}
                    className="absolute inset-0"
                  />
                ) : (
                  <Image
                    src={station.logo_url}
                    alt={`${station.name} logo`}
                    fill
                    className="object-cover"
                    sizes="192px"
                    priority={Math.abs(index - currentIndex) <= 1}
                  />
                )}
              </div>

              {/* Station Info */}
              <div className="text-center">
                <div className="text-sm space-y-1">
                  <p className="text-gray-400">{station.name}</p>
                  <p className="text-gray-400">
                    {station.city && `${station.city}, `}
                    {station.country}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});
