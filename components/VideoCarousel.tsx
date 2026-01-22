"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
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
}

export interface VideoCarouselRef {
  playAllVideos: () => void;
}

export const VideoCarousel = forwardRef<VideoCarouselRef, VideoCarouselProps>(function VideoCarousel({
  stations,
  currentIndex,
  isActive,
  transitionDuration = 700,
  dragOffset = 0,
  isDragging = false
}, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Map<string, YouTubeLoopPlayerRef>>(new Map());

  // Expose method to play all videos
  useImperativeHandle(ref, () => ({
    playAllVideos: () => {
      videoRefs.current.forEach((videoRef) => {
        videoRef.play();
      });
    },
  }));

  // Update scroll position when current station changes or drag offset updates
  useEffect(() => {
    if (!containerRef.current) return;

    const translateY = -currentIndex * 100;
    containerRef.current.style.transform = `translateY(calc(${translateY}% + ${dragOffset}px))`;

    // Disable transitions during drag for immediate feedback
    if (isDragging) {
      containerRef.current.style.transition = 'none';
    } else {
      containerRef.current.style.transition = `transform ${transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    }
  }, [currentIndex, dragOffset, isDragging, transitionDuration]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        ref={containerRef}
        className="relative w-full h-full will-change-transform"
      >
        {stations.map((station, index) => {
          const videoId = station.video_url
            ? extractYouTubeVideoId(station.video_url)
            : null;
          const isCurrentStation = index === currentIndex;

          return (
            <div
              key={station.id}
              className="absolute inset-0 w-full h-full flex flex-col items-center justify-center px-8"
              style={{
                transform: `translateY(${index * 100}%)`,
              }}
              aria-live={isCurrentStation && isActive ? "polite" : "off"}
              aria-label={`${isCurrentStation && isActive ? "Now playing: " : ""}${station.name}, ${station.city ? `${station.city}, ` : ""}${station.country}`}
            >
              <div className="flex flex-col items-center gap-8 max-w-md">
                {/* Station Video/Logo */}
                <div className="relative w-48 h-48 rounded-2xl overflow-hidden shadow-2xl">
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
                      priority={true}
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
    </div>
  );
});
