"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { VideoCarousel } from "./VideoCarousel";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { StationSidebar } from "./StationSidebar";
import { useStationNavigation } from "@/contexts/StationContext";
import { useAudio } from "@/contexts/AudioContext";
import { useDrag } from "@/hooks/useDrag";
import { useKeyboardNav } from "@/hooks/useKeyboardNav";

export function StationCarousel() {
  const {
    stations,
    currentStation,
    currentIndex,
    nextStation,
    previousStation,
    isLoading: stationsLoading,
    error: stationsError,
    goToNext,
    goToPrevious,
    goToStation,
  } = useStationNavigation();

  const {
    isPlaying,
    isLoading: audioLoading,
    isCrossfading,
    error: audioError,
    playStation,
    crossfadeToStation,
    preloadStation,
  } = useAudio();

  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Preload all audio streams on mount
  useEffect(() => {
    if (stations.length > 0) {
      stations.forEach((station) => {
        preloadStation(station);
      });
    }
  }, [stations, preloadStation]);

  // Handle initial autoplay (requires user interaction)
  useEffect(() => {
    if (currentStation && !hasUserInteracted) {
      // Auto-play is blocked by browsers, show prompt
      return;
    }

    if (currentStation && hasUserInteracted && !isPlaying && !audioLoading) {
      playStation(currentStation);
    }
  }, [currentStation, hasUserInteracted, isPlaying, audioLoading, playStation]);

  // Preload next station
  useEffect(() => {
    if (nextStation && isPlaying) {
      preloadStation(nextStation);
    }
  }, [nextStation, isPlaying, preloadStation]);

  // Transition duration constant for sync between animations
  const TRANSITION_DURATION = 400; // ms - faster, snappier feel

  // Handle station navigation
  const handleNext = useCallback(() => {
    if (isCrossfading || isTransitioning || !currentStation || !nextStation) return;

    setIsTransitioning(true);
    goToNext();

    // Reset transitioning state after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, TRANSITION_DURATION);
  }, [isCrossfading, isTransitioning, currentStation, nextStation, goToNext]);

  const handlePrevious = useCallback(() => {
    if (isCrossfading || isTransitioning || !currentStation || !previousStation) return;

    setIsTransitioning(true);
    goToPrevious();

    // Reset transitioning state after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, TRANSITION_DURATION);
  }, [isCrossfading, isTransitioning, currentStation, previousStation, goToPrevious]);

  // Handle station selection from sidebar
  const handleStationSelect = useCallback((index: number) => {
    if (isCrossfading || isTransitioning || !currentStation || !stations[index]) return;

    setIsTransitioning(true);
    goToStation(index);

    // Reset transitioning state after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, TRANSITION_DURATION);
  }, [isCrossfading, isTransitioning, currentStation, stations, goToStation]);

  // Crossfade when station changes (skip initial load)
  const previousStationIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Skip if this is the first station load
    if (!previousStationIdRef.current && currentStation) {
      previousStationIdRef.current = currentStation.id;
      return;
    }

    // Only crossfade if station actually changed
    if (currentStation && previousStationIdRef.current !== currentStation.id && hasUserInteracted) {
      previousStationIdRef.current = currentStation.id;
      crossfadeToStation(currentStation).catch((err) => {
        console.error("Crossfade failed:", err);
      });
    }
  }, [currentStation?.id, hasUserInteracted, crossfadeToStation]);

  // Setup drag gestures with real-time tracking
  const { isDragging, dragOffset } = useDrag({
    onNext: handleNext,
    onPrevious: handlePrevious,
    canGoNext: !!nextStation,
    canGoPrevious: !!previousStation,
  });

  // Setup keyboard navigation
  useKeyboardNav({
    onArrowUp: handlePrevious,
    onArrowDown: handleNext,
  });

  // Handle user interaction to start playback
  const handleStartPlayback = async () => {
    if (!currentStation) return;
    setHasUserInteracted(true);
    await playStation(currentStation);
  };

  // Handle auto-skip on stream error (after 10s timeout in AudioContext)
  useEffect(() => {
    if (audioError && !audioLoading) {
      const timer = setTimeout(() => {
        handleNext();
      }, 2000); // Wait 2s before auto-skipping

      return () => clearTimeout(timer);
    }
  }, [audioError, audioLoading, handleNext]);

  // Loading state
  if (stationsLoading) {
    return <LoadingState message="Loading stations..." />;
  }

  // Error state
  if (stationsError) {
    return <ErrorState message={stationsError} />;
  }

  // No station available
  if (!currentStation) {
    return <ErrorState message="No stations available" />;
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {/* Video carousel - all videos and text rendered and scrolling together */}
      {/* Render immediately to preload all videos */}
      <VideoCarousel
        stations={stations}
        currentIndex={currentIndex >= 0 ? currentIndex : 0}
        isActive={isPlaying}
        transitionDuration={TRANSITION_DURATION}
        dragOffset={dragOffset}
        isDragging={isDragging}
      />

      {/* Show "Tap to start" overlay if user hasn't interacted yet */}
      {!hasUserInteracted && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center cursor-pointer z-[100]"
          onClick={handleStartPlayback}
          role="button"
          aria-label="Tap to start playing"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleStartPlayback();
            }
          }}
        >
          <div className="text-center">
            <p className="text-sm">Tap to start</p>
            <p className="text-sm text-gray-400 mt-2">
              Use swipe or arrow keys to navigate
            </p>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {(audioLoading || isCrossfading) && (
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
          <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full">
            <p className="text-sm text-white">
              {isCrossfading ? "Tuning in..." : "Loading..."}
            </p>
          </div>
        </div>
      )}

      {/* Error message */}
      {audioError && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 max-w-md px-4">
          <div className="px-4 py-3 bg-red-500/90 backdrop-blur-md rounded-lg text-center">
            <p className="text-sm text-white">{audioError}</p>
            <p className="text-xs text-white/80 mt-1">Skipping to next station...</p>
          </div>
        </div>
      )}

      {/* Swipe hint */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 opacity-50 pointer-events-none">
        <p className="text-xs text-gray-400">Swipe or use arrow keys to navigate</p>
      </div>

      {/* Desktop sidebar with station logos */}
      <StationSidebar
        stations={stations}
        currentStation={currentStation}
        onStationSelect={handleStationSelect}
        isTransitioning={isTransitioning}
      />
    </div>
  );
}
