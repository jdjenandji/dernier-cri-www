"use client";

import type { Station } from "@/types/station";
import { YouTubeLoopPlayer, extractYouTubeVideoId } from "@/components/YouTubeLoopPlayer";
import Image from "next/image";

interface VideoCarouselProps {
  stations: Station[];
  currentIndex: number;
  isActive: boolean;
  transitionDuration?: number;
  dragOffset?: number;
  isDragging?: boolean;
}

export function VideoCarousel({
  stations,
  currentIndex,
  isActive,
  transitionDuration = 700,
  dragOffset = 0,
  isDragging = false
}: VideoCarouselProps) {
  // Calculate transform directly for immediate feedback (no useEffect delay)
  const translateY = -currentIndex * 100;
  const transform = `translateY(calc(${translateY}% + ${dragOffset}px))`;
  const transition = isDragging 
    ? 'none' 
    : `transform ${transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;

  return (
    <div className="absolute inset-0 overflow-hidden touch-none">
      <div
        className="relative w-full h-full will-change-transform"
        style={{ transform, transition }}
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
                    <p className="text-white">{station.name}</p>
                    <p className="text-gray-400">
                      {station.city && `${station.city}, `}
                      {station.country}
                    </p>
                    {station.genre && <p className="text-gray-400">{station.genre}</p>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
