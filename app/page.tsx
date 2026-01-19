"use client";

import { StationCarousel } from "@/components/StationCarousel";
import { StationProvider } from "@/contexts/StationContext";
import { AudioProvider } from "@/contexts/AudioContext";
import { useEffect, useState } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main className="w-screen h-screen overflow-hidden flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </main>
    );
  }

  return (
    <StationProvider>
      <AudioProvider>
        <main className="w-screen h-screen overflow-hidden">
          <StationCarousel />
        </main>
      </AudioProvider>
    </StationProvider>
  );
}
