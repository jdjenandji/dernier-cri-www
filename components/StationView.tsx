import Image from "next/image";
import type { Station } from "@/types/station";

interface StationViewProps {
  station: Station;
  isActive: boolean;
}

export function StationView({ station, isActive }: StationViewProps) {
  return (
    <div
      className="flex flex-col items-center justify-center w-full h-full px-8"
      aria-live={isActive ? "polite" : "off"}
      aria-label={`${isActive ? "Now playing: " : ""}${station.name}, ${station.city ? `${station.city}, ` : ""}${station.country}`}
    >
      <div className="flex flex-col items-center gap-8 max-w-md">
        {/* Station Logo */}
        <div className="relative w-48 h-48 rounded-2xl overflow-hidden shadow-2xl">
          <Image
            src={station.logo_url}
            alt={`${station.name} logo`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 192px, 192px"
            priority={isActive}
          />
        </div>

        {/* Station Info */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {station.name}
          </h1>
          <p className="text-lg md:text-xl text-gray-400">
            {station.city ? `${station.city}, ` : ""}{station.country}
          </p>
          {station.genre && (
            <p className="text-sm md:text-base text-gray-500 mt-2">
              {station.genre}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
