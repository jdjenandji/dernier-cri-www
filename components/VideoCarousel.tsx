"use client";

import { useEffect, useRef } from "react";
import type { Station } from "@/types/station";
import { YouTubeLoopPlayer, extractYouTubeVideoId } from "@/components/YouTubeLoopPlayer";
import Image from "next/image";

interface VideoCarouselProps {
  stations: Station[];
  currentIndex: number;
  isActive: boolean;
  transitionDuration?: number;
}

export function VideoCarousel({
  stations,
  currentIndex,
  isActive,
  transitionDuration = 700
}: VideoCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Update scroll position when current station changes
  useEffect(() => {
    if (!containerRef.current) return;

    const translateY = -currentIndex * 100;
    containerRef.current.style.transform = `translateY(${translateY}%)`;
  }, [currentIndex]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        ref={containerRef}
        className="relative w-full h-full will-change-transform"
        style={{
          transition: `transform ${transitionDuration}ms ease-in-out`,
        }}
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
                  <p className="text-sm text-gray-400">
                    {station.name}
                    {station.city && `, ${station.city}`}
                    {`, ${station.country}`}
                    {station.genre && `, ${station.genre}`}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
