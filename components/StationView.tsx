import type { Station } from "@/types/station";

interface StationViewProps {
  station: Station;
  isActive: boolean;
}

export function StationView({ station, isActive }: StationViewProps) {
  return (
    <div
      className="flex flex-col items-center justify-center w-full h-full px-8 pointer-events-none"
      aria-live={isActive ? "polite" : "off"}
      aria-label={`${isActive ? "Now playing: " : ""}${station.name}, ${station.city ? `${station.city}, ` : ""}${station.country}`}
    >
      <div className="flex flex-col items-center gap-8 max-w-md">
        {/* Station Info */}
        <div className="text-center mt-64">
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
}
