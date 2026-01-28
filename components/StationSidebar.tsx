import type { Station } from "@/types/station";
import { VideoEmbed } from "@/components/VideoEmbed";

interface StationSidebarProps {
  stations: Station[];
  currentStation: Station | null;
  onStationSelect: (index: number) => void;
  isAnimating?: boolean;
}

export function StationSidebar({ stations, currentStation, onStationSelect, isAnimating = false }: StationSidebarProps) {
  return (
    <div className="hidden md:flex fixed right-0 top-0 h-full w-24 bg-black/50 backdrop-blur-md border-l border-white/10 flex-col items-center py-8 gap-4 overflow-y-auto scrollbar-hide z-50">
      {stations.map((station, index) => (
        <button
          key={station.id}
          onClick={() => !isAnimating && onStationSelect(index)}
          disabled={isAnimating}
          className={`relative w-16 h-16 rounded-lg overflow-hidden transition-all duration-300 flex-shrink-0 ${
            currentStation?.id === station.id
              ? "ring-2 ring-white scale-110"
              : "opacity-50 hover:opacity-100 hover:scale-105"
          } ${isAnimating ? "cursor-not-allowed" : "cursor-pointer"}`}
          aria-label={`Switch to ${station.name}`}
        >
          <VideoEmbed
            videoUrl={station.video_url}
            videoStartTime={station.video_start_time}
            videoEndTime={station.video_end_time}
            fallbackImageUrl={station.logo_url}
            alt={station.name}
            width={64}
            height={64}
            priority={false}
            className={`object-cover transition-all duration-300 ${
              currentStation?.id === station.id
                ? "grayscale-0"
                : "grayscale"
            }`}
          />
        </button>
      ))}
    </div>
  );
}
