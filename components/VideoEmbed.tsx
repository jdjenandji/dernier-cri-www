"use client";

import { useState } from "react";
import Image from "next/image";
import { getYouTubeEmbedUrl } from "@/lib/youtube";
import { YouTubeLoopPlayer, extractYouTubeVideoId } from "@/components/YouTubeLoopPlayer";

interface VideoEmbedProps {
  videoUrl: string | null;
  videoStartTime?: number | null;
  videoEndTime?: number | null;
  fallbackImageUrl: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
}

export function VideoEmbed({
  videoUrl,
  videoStartTime,
  videoEndTime,
  fallbackImageUrl,
  alt,
  width,
  height,
  priority = false,
  className = "",
}: VideoEmbedProps) {
  const [embedFailed, setEmbedFailed] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Extract video ID and check if we need custom loop handling
  const videoId = videoUrl ? extractYouTubeVideoId(videoUrl) : null;
  const hasCustomTimes = (videoStartTime != null && videoStartTime > 0) || (videoEndTime != null && videoEndTime > 0);
  
  // Use simple iframe for no custom times, YouTubeLoopPlayer for custom times
  const embedUrl = videoUrl && !hasCustomTimes
    ? getYouTubeEmbedUrl(videoUrl, { startTime: videoStartTime, endTime: videoEndTime })
    : null;

  // Show video if available and not failed
  const shouldShowVideo = (embedUrl || (videoId && hasCustomTimes)) && !embedFailed;

  if (shouldShowVideo) {
    return (
      <div className={`relative w-full h-full ${className}`}>
        {hasCustomTimes && videoId ? (
          <YouTubeLoopPlayer
            videoId={videoId}
            startTime={videoStartTime}
            endTime={videoEndTime}
            className="absolute inset-0"
          />
        ) : (
          <iframe
            src={embedUrl!}
            width={width}
            height={height}
            allow="autoplay; encrypted-media"
            allowFullScreen={false}
            className="absolute inset-0 w-full h-full border-0 pointer-events-none"
            loading={priority ? "eager" : "lazy"}
            onLoad={() => {
              // Delay to ensure video starts playing before revealing
              setTimeout(() => setVideoLoaded(true), 1500);
            }}
            onError={() => setEmbedFailed(true)}
            title={alt}
            aria-hidden="true"
          />
        )}
        {/* Fallback image overlay - fades out when video loads */}
        <div className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${videoLoaded || hasCustomTimes ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <Image
            src={fallbackImageUrl}
            alt={alt}
            fill
            className="object-cover"
            sizes={`${width}px`}
            priority={priority}
            onError={() => setImageError(true)}
          />
        </div>
      </div>
    );
  }

  // Show fallback image
  if (!imageError) {
    return (
      <Image
        src={fallbackImageUrl}
        alt={alt}
        fill
        className={className}
        sizes={`${width}px`}
        priority={priority}
        onError={() => setImageError(true)}
      />
    );
  }

  // Ultimate fallback: placeholder
  return (
    <div className={`w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center ${className}`}>
      <span className="text-gray-400 text-xs text-center px-2">{alt}</span>
    </div>
  );
}
