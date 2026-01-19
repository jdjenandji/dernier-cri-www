"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { StationView } from "./StationView";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { StationSidebar } from "./StationSidebar";
import { useStationNavigation } from "@/contexts/StationContext";
import { useAudio } from "@/contexts/AudioContext";
import { useSwipe } from "@/hooks/useSwipe";
import { useKeyboardNav } from "@/hooks/useKeyboardNav";

export function StationCarousel() {
  const {
    stations,
    currentStation,
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
  const [animatingOut, setAnimatingOut] = useState<typeof currentStation>(null);
  const [animatingIn, setAnimatingIn] = useState<typeof currentStation>(null);
  const [slideDirection, setSlideDirection] = useState<"up" | "down" | null>(null);
  const [animationStarted, setAnimationStarted] = useState(false);

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

  // Keep track of visible station
  const visibleStation = animatingIn || animatingOut || currentStation;

  // Preload next station
  useEffect(() => {
    if (nextStation && isPlaying) {
      preloadStation(nextStation);
    }
  }, [nextStation, isPlaying, preloadStation]);

  // Handle station navigation
  const handleNext = useCallback(() => {
    if (isCrossfading || isTransitioning || !currentStation || !nextStation) return;

    setIsTransitioning(true);
    setAnimatingOut(currentStation);
    setAnimatingIn(nextStation);
    setSlideDirection("up");
    setAnimationStarted(false);

    // Trigger animation after a frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimationStarted(true);
      });
    });

    // Change to next station and clean up after animation completes
    setTimeout(() => {
      goToNext();
      setAnimatingOut(null);
      setAnimatingIn(null);
      setSlideDirection(null);
      setAnimationStarted(false);
      setIsTransitioning(false);
    }, 750);
  }, [isCrossfading, isTransitioning, currentStation, nextStation, goToNext]);

  const handlePrevious = useCallback(() => {
    if (isCrossfading || isTransitioning || !currentStation || !previousStation) return;

    setIsTransitioning(true);
    setAnimatingOut(currentStation);
    setAnimatingIn(previousStation);
    setSlideDirection("down");
    setAnimationStarted(false);

    // Trigger animation after a frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimationStarted(true);
      });
    });

    // Change to previous station and clean up after animation completes
    setTimeout(() => {
      goToPrevious();
      setAnimatingOut(null);
      setAnimatingIn(null);
      setSlideDirection(null);
      setAnimationStarted(false);
      setIsTransitioning(false);
    }, 750);
  }, [isCrossfading, isTransitioning, currentStation, previousStation, goToPrevious]);

  // Handle station selection from sidebar
  const handleStationSelect = useCallback((index: number) => {
    if (isCrossfading || isTransitioning || !currentStation || !stations[index]) return;

    const targetStation = stations[index];

    setIsTransitioning(true);
    setAnimatingOut(currentStation);
    setAnimatingIn(targetStation);
    setSlideDirection("up");
    setAnimationStarted(false);

    // Trigger animation after a frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimationStarted(true);
      });
    });

    // Change to selected station and clean up after animation completes
    setTimeout(() => {
      goToStation(index);
      setAnimatingOut(null);
      setAnimatingIn(null);
      setSlideDirection(null);
      setAnimationStarted(false);
      setIsTransitioning(false);
    }, 750);
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

  // Setup swipe gestures
  useSwipe({
    onSwipeUp: handleNext,
    onSwipeDown: handlePrevious,
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

  // Show "Tap to start" overlay if user hasn't interacted yet
  if (!hasUserInteracted) {
    return (
      <div className="relative w-full h-full">
        <StationView station={currentStation} isActive={false} />
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center cursor-pointer"
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
            <p className="text-3xl font-bold">Tap to start</p>
            <p className="text-gray-400 mt-4">
              Use swipe, arrow keys, or scroll to navigate
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {/* Station sliding out */}
      {animatingOut && slideDirection && (
        <div
          key={`out-${animatingOut.id}`}
          className="absolute inset-0 will-change-transform"
          style={{
            transform: animationStarted
              ? (slideDirection === "up" ? "translateY(-100%)" : "translateY(100%)")
              : "translateY(0)",
            transition: "transform 700ms ease-in-out",
          }}
        >
          <StationView station={animatingOut} isActive={false} />
        </div>
      )}

      {/* Station sliding in */}
      {animatingIn && slideDirection && (
        <div
          key={`in-${animatingIn.id}`}
          className="absolute inset-0 will-change-transform"
          style={{
            transform: animationStarted
              ? "translateY(0)"
              : (slideDirection === "up" ? "translateY(100%)" : "translateY(-100%)"),
            transition: "transform 700ms ease-in-out",
          }}
        >
          <StationView station={animatingIn} isActive={false} />
        </div>
      )}

      {/* Current station (when not animating) */}
      {!isTransitioning && currentStation && (
        <div key={`current-${currentStation.id}`} className="absolute inset-0">
          <StationView station={currentStation} isActive={isPlaying} />
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
      {hasUserInteracted && (
        <StationSidebar
          stations={stations}
          currentStation={currentStation}
          onStationSelect={handleStationSelect}
          isTransitioning={isTransitioning}
        />
      )}
    </div>
  );
}
