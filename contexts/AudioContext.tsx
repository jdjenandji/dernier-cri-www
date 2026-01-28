"use client";

import { createContext, useContext, useRef, useState, useCallback, ReactNode } from "react";
import { AudioCrossfadeEngine } from "@/lib/audio-engine";
import type { Station } from "@/types/station";

interface AudioContextType {
  isPlaying: boolean;
  isLoading: boolean;
  isCrossfading: boolean;
  isMuted: boolean;
  error: string | null;
  currentStation: Station | null;
  playStation: (station: Station) => Promise<void>;
  crossfadeToStation: (station: Station) => Promise<void>;
  pause: () => void;
  resume: () => Promise<void>;
  preloadStation: (station: Station) => void;
  toggleMute: () => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioEngineRef = useRef<AudioCrossfadeEngine | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCrossfading, setIsCrossfading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStation, setCurrentStation] = useState<Station | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio engine on first use
  const getAudioEngine = useCallback(() => {
    if (!audioEngineRef.current) {
      audioEngineRef.current = new AudioCrossfadeEngine();
    }
    return audioEngineRef.current;
  }, []);

  const playStation = useCallback(async (station: Station) => {
    setIsLoading(true);
    setError(null);

    // Set 10-second timeout for stream loading
    loadingTimeoutRef.current = setTimeout(() => {
      setError(`Station unavailable: ${station.name}`);
      setIsLoading(false);
    }, 10000);

    try {
      const engine = getAudioEngine();
      await engine.playStream(station.stream_url);

      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }

      setCurrentStation(station);
      setIsPlaying(true);
      setIsLoading(false);
    } catch (err) {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }

      const errorMessage = err instanceof Error ? err.message : "Failed to play station";
      setError(errorMessage);
      setIsLoading(false);
      setIsPlaying(false);
    }
  }, [getAudioEngine]);

  const crossfadeToStation = useCallback(async (station: Station) => {
    if (isCrossfading) return; // Prevent multiple simultaneous crossfades

    setIsCrossfading(true);
    setError(null);

    try {
      const engine = getAudioEngine();
      console.log("Starting crossfade to:", station.name);
      await engine.crossfadeTo(station.stream_url, 1.8);

      setCurrentStation(station);
      setIsPlaying(true);
      setIsCrossfading(false);
      console.log("Crossfade complete");
    } catch (err) {
      console.error("Crossfade failed, trying direct play:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to change station";
      setError(errorMessage);
      setIsCrossfading(false);

      // Fallback: try playing the station directly
      try {
        const engine = getAudioEngine();
        await engine.playStream(station.stream_url);
        setCurrentStation(station);
        setIsPlaying(true);
      } catch (playErr) {
        console.error("Direct play also failed:", playErr);
      }
    }
  }, [isCrossfading, getAudioEngine]);

  const pause = useCallback(() => {
    const engine = getAudioEngine();
    engine.pause();
    setIsPlaying(false);
  }, [getAudioEngine]);

  const resume = useCallback(async () => {
    try {
      const engine = getAudioEngine();
      await engine.resume();
      setIsPlaying(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to resume playback";
      setError(errorMessage);
    }
  }, [getAudioEngine]);

  const preloadStation = useCallback((station: Station) => {
    const engine = getAudioEngine();
    engine.preload(station.stream_url);
  }, [getAudioEngine]);

  const toggleMute = useCallback(() => {
    const engine = getAudioEngine();
    const newMutedState = engine.toggleMute();
    setIsMuted(newMutedState);
  }, [getAudioEngine]);

  const value: AudioContextType = {
    isPlaying,
    isLoading,
    isCrossfading,
    isMuted,
    error,
    currentStation,
    playStation,
    crossfadeToStation,
    pause,
    resume,
    preloadStation,
    toggleMute,
  };

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within AudioProvider");
  }
  return context;
}
