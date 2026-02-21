"use client";

import { useEffect, useState, useCallback, useRef } from "react";

// Helper function to detect if we're on mobile (tablet/phone)
function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768; // Tailwind md breakpoint
}
import Image from "next/image";
import { VideoCarousel, VideoCarouselRef } from "./VideoCarousel";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { StationSidebar } from "./StationSidebar";
import { useStationNavigation } from "@/contexts/StationContext";
import { useAudio } from "@/contexts/AudioContext";
import { useDrag } from "@/hooks/useDrag";
import { useKeyboardNav } from "@/hooks/useKeyboardNav";
import { useListenerCount } from "@/hooks/useListenerCount";

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
    isMuted,
    error: audioError,
    playStation,
    crossfadeToStation,
    preloadStation,
    toggleMute,
  } = useAudio();

  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [mobileView, setMobileView] = useState(false);
  const videoCarouselRef = useRef<VideoCarouselRef>(null);
  const listenerCount = useListenerCount();

  // Track mobile state and update on resize
  useEffect(() => {
    const updateMobileView = () => {
      setMobileView(isMobile());
    };

    updateMobileView(); // Initial check
    window.addEventListener('resize', updateMobileView);
    return () => window.removeEventListener('resize', updateMobileView);
  }, []);

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
  const TRANSITION_DURATION = 350; // ms - snappy feel

  // Handle station navigation (called by drag hook after animation completes)
  const handleNext = useCallback(() => {
    if (!currentStation || !nextStation) return;
    goToNext();
  }, [currentStation, nextStation, goToNext]);

  const handlePrevious = useCallback(() => {
    if (!currentStation || !previousStation) return;
    goToPrevious();
  }, [currentStation, previousStation, goToPrevious]);

  // Handle station selection from sidebar
  const handleStationSelect = useCallback((index: number) => {
    if (!currentStation || !stations[index]) return;
    goToStation(index);
  }, [currentStation, stations, goToStation]);

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

  // Setup drag gestures with real-time tracking and spring physics
  const { isDragging, dragOffset, isAnimating } = useDrag({
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
    // Play all YouTube videos (requires user gesture on mobile)
    videoCarouselRef.current?.playAllVideos();
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

  // Mobile soundboard layout
  if (mobileView) {
    return (
      <div className="relative w-full h-full overflow-hidden bg-black">
        {/* Top section: Current station video/logo and info (50-60% of screen) */}
        <div className="relative h-[60%] flex flex-col items-center justify-center">
          {currentStation && (
            <div className="flex flex-col items-center gap-6 max-w-md px-8">
              {/* Station Video/Logo */}
              <div className="relative w-40 h-40 rounded-2xl overflow-hidden shadow-2xl">
                {currentStation.video_url ? (
                  <div className="absolute inset-0 bg-black">
                    {/* For mobile, we'll keep it simple and show logo instead of video for performance */}
                    <Image
                      src={currentStation.logo_url}
                      alt={`${currentStation.name} logo`}
                      fill
                      className="object-cover"
                      sizes="160px"
                      priority
                    />
                  </div>
                ) : (
                  <Image
                    src={currentStation.logo_url}
                    alt={`${currentStation.name} logo`}
                    fill
                    className="object-cover"
                    sizes="160px"
                    priority
                  />
                )}
              </div>

              {/* Station Info */}
              <div className="text-center">
                <h1 className="text-xl font-medium text-white mb-2">{currentStation.name}</h1>
                <p className="text-gray-400 text-sm">
                  {currentStation.city && `${currentStation.city}, `}
                  {currentStation.country}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom section: Soundboard grid (40-50% of screen) */}
        <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-black/95 border-t border-gray-800">
          <div className="h-full overflow-y-auto p-4">
            <div className="grid grid-cols-2 gap-3 pb-20"> {/* Extra bottom padding for mute button */}
              {stations.map((station, index) => (
                <button
                  key={station.id}
                  onClick={() => handleStationSelect(index)}
                  className={`
                    relative p-4 rounded-xl transition-all duration-200 active:scale-95
                    ${index === currentIndex
                      ? 'bg-white/20 border-2 border-white shadow-lg'
                      : 'bg-white/5 border-2 border-transparent hover:bg-white/10 hover:border-white/20'
                    }
                  `}
                >
                  {/* Station logo */}
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden mb-3 mx-auto">
                    <Image
                      src={station.logo_url}
                      alt={`${station.name} logo`}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>

                  {/* Station name */}
                  <div className="text-center">
                    <p className="text-white text-xs font-medium leading-tight line-clamp-2">
                      {station.name}
                    </p>
                    <p className="text-gray-400 text-xs mt-1 leading-tight">
                      {station.city || station.country}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

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
            <div className="text-center flex flex-col items-center">
              <div className="relative w-48 h-48 mb-8">
                <Image
                  src="/og-image-white.png"
                  alt="Dernier Cri"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <p className="text-sm">Tap to start</p>
              <p className="text-sm text-gray-400 mt-2">
                Tap a station to switch
              </p>
            </div>
          </div>
        )}

        {/* Shared UI elements for mobile */}
        {/* Listener count */}
        {hasUserInteracted && listenerCount > 0 && (
          <div className="fixed top-6 left-6 z-50 pointer-events-none">
            <div className="px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <p className="text-sm text-white">
                {listenerCount} {listenerCount === 1 ? 'listener' : 'listeners'}
              </p>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {(audioLoading || isCrossfading) && (
          <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
            <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full">
              <p className="text-sm text-white">
                {isCrossfading ? "Tuning in..." : "Loading..."}
              </p>
            </div>
          </div>
        )}

        {/* Error message */}
        {audioError && (
          <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 max-w-md px-4 z-50">
            <div className="px-4 py-3 bg-red-500/90 backdrop-blur-md rounded-lg text-center">
              <p className="text-sm text-white">{audioError}</p>
              <p className="text-xs text-white/80 mt-1">Skipping to next station...</p>
            </div>
          </div>
        )}

        {/* Mute button - bottom right, works on mobile */}
        {hasUserInteracted && (
          <div
            role="button"
            tabIndex={0}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => {
              e.stopPropagation();
              e.preventDefault();
              toggleMute();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              toggleMute();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMute();
              }
            }}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-black/60 backdrop-blur-md border border-white/30 flex items-center justify-center z-[9999] cursor-pointer active:scale-95 transition-transform"
            style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
            data-ignore-drag="true"
            aria-label={isMuted ? "Unmute" : "Mute"}
            aria-pressed={isMuted}
          >
            {isMuted ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
            )}
          </div>
        )}
      </div>
    );
  }

  // Desktop layout (original swipe interface)
  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {/* Video carousel - all videos and text rendered and scrolling together */}
      {/* Render immediately to preload all videos */}
      <VideoCarousel
        ref={videoCarouselRef}
        stations={stations}
        currentIndex={currentIndex >= 0 ? currentIndex : 0}
        isActive={isPlaying}
        transitionDuration={TRANSITION_DURATION}
        dragOffset={dragOffset}
        isDragging={isDragging}
        isAnimating={isAnimating}
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
          <div className="text-center flex flex-col items-center">
            <div className="relative w-48 h-48 mb-8">
              <Image
                src="/og-image-white.png"
                alt="Dernier Cri"
                fill
                className="object-contain"
                priority
              />
            </div>
            <p className="text-sm">Tap to start</p>
            <p className="text-sm text-gray-400 mt-2 md:hidden">
              Swipe to navigate
            </p>
            <p className="text-sm text-gray-400 mt-2 hidden md:block">
              Use arrow keys to navigate
            </p>
          </div>
        </div>
      )}

      {/* Desktop sidebar with station logos */}
      <StationSidebar
        stations={stations}
        currentStation={currentStation}
        onStationSelect={handleStationSelect}
        isAnimating={isAnimating}
      />

      {/* Navigation hint for desktop */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 opacity-50 pointer-events-none">
        <p className="text-xs text-gray-400">Use arrow keys to navigate</p>
      </div>

      {/* Shared UI elements for desktop */}
      {/* Listener count */}
      {hasUserInteracted && listenerCount > 0 && (
        <div className="fixed top-6 left-6 z-50 pointer-events-none">
          <div className="px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <p className="text-sm text-white">
              {listenerCount} {listenerCount === 1 ? 'listener' : 'listeners'}
            </p>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {(audioLoading || isCrossfading) && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
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

      {/* Mute button - bottom right */}
      {hasUserInteracted && (
        <div
          role="button"
          tabIndex={0}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => {
            e.stopPropagation();
            e.preventDefault();
            toggleMute();
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            toggleMute();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleMute();
            }
          }}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-black/60 backdrop-blur-md border border-white/30 flex items-center justify-center z-[9999] cursor-pointer active:scale-95 transition-transform"
          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
          data-ignore-drag="true"
          aria-label={isMuted ? "Unmute" : "Mute"}
          aria-pressed={isMuted}
        >
          {isMuted ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          )}
        </div>
      )}
    </div>
  );
}
