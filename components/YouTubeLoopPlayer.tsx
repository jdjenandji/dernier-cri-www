"use client";

import { useEffect, useRef, useCallback } from "react";

// Declare YouTube IFrame API types
declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string | HTMLElement,
        config: {
          videoId: string;
          playerVars?: Record<string, string | number>;
          events?: {
            onReady?: (event: { target: YTPlayer }) => void;
            onStateChange?: (event: { target: YTPlayer; data: number }) => void;
          };
        }
      ) => YTPlayer;
      PlayerState: {
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  destroy: () => void;
  getPlayerState: () => number;
}

interface YouTubeLoopPlayerProps {
  videoId: string;
  startTime?: number | null;
  endTime?: number | null;
  className?: string;
}

// Track if API is loaded globally
let apiLoaded = false;
let apiLoading = false;
const apiReadyCallbacks: (() => void)[] = [];

function loadYouTubeAPI(): Promise<void> {
  return new Promise((resolve) => {
    if (apiLoaded && window.YT) {
      resolve();
      return;
    }

    apiReadyCallbacks.push(resolve);

    if (apiLoading) return;
    apiLoading = true;

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      apiLoaded = true;
      apiReadyCallbacks.forEach((cb) => cb());
      apiReadyCallbacks.length = 0;
    };
  });
}

export function YouTubeLoopPlayer({
  videoId,
  startTime,
  endTime,
  className = "",
}: YouTubeLoopPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const playerIdRef = useRef(`yt-player-${Math.random().toString(36).slice(2, 9)}`);

  const effectiveStart = startTime ?? 0;
  const effectiveEnd = endTime ?? null;

  const checkTimeAndLoop = useCallback(() => {
    if (!playerRef.current) return;

    try {
      const currentTime = playerRef.current.getCurrentTime();
      const state = playerRef.current.getPlayerState();

      // Only check if playing
      if (state !== window.YT?.PlayerState?.PLAYING) return;

      // If we have an end time and we've reached or passed it, seek back to start
      if (effectiveEnd !== null && currentTime >= effectiveEnd) {
        playerRef.current.seekTo(effectiveStart, true);
      }
    } catch {
      // Player might not be ready yet
    }
  }, [effectiveStart, effectiveEnd]);

  // Handle page visibility changes (mobile tab switching, app backgrounding)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && playerRef.current) {
        // Small delay to let the browser fully restore the tab
        setTimeout(() => {
          if (!playerRef.current) return;
          
          try {
            const state = playerRef.current.getPlayerState();
            const currentTime = playerRef.current.getCurrentTime();
            
            // Resume if paused, cued, buffering, or in any non-playing state
            if (state !== window.YT?.PlayerState?.PLAYING) {
              // Seek to current position to "kick" the player out of frozen state
              playerRef.current.seekTo(currentTime || effectiveStart, true);
              playerRef.current.playVideo();
            }
          } catch {
            // Player might not be ready
          }
        }, 100);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [effectiveStart]);

  useEffect(() => {
    let mounted = true;

    async function initPlayer() {
      await loadYouTubeAPI();

      if (!mounted || !containerRef.current) return;

      // Create a div for the player with scaling to cover container
      const playerDiv = document.createElement("div");
      playerDiv.id = playerIdRef.current;
      // Style the player div to scale and center (cover behavior)
      playerDiv.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        width: 300%;
        height: 300%;
        transform: translate(-50%, -50%);
      `;
      containerRef.current.appendChild(playerDiv);

      playerRef.current = new window.YT.Player(playerIdRef.current, {
        videoId,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          start: effectiveStart,
          // Don't use 'end' param - we'll handle it manually for proper looping
        },
        events: {
          onReady: (event) => {
            event.target.playVideo();
          },
          onStateChange: (event) => {
            // When video ends, seek back to start
            if (event.data === window.YT.PlayerState.ENDED) {
              event.target.seekTo(effectiveStart, true);
              event.target.playVideo();
            }
          },
        },
      });

      // Set up interval to check time for end boundary
      if (effectiveEnd !== null) {
        checkIntervalRef.current = setInterval(checkTimeAndLoop, 250);
      }
    }

    initPlayer();

    return () => {
      mounted = false;
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          // Ignore destroy errors
        }
      }
      // Clean up the container
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [videoId, effectiveStart, effectiveEnd, checkTimeAndLoop]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full overflow-hidden ${className}`}
      style={{ pointerEvents: "none", position: "relative" }}
    />
  );
}

// Helper to extract video ID from URL
export function extractYouTubeVideoId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  );
  return match?.[1] ?? null;
}
