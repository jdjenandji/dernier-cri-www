import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Station } from "@/types/station";

export function useStations() {
  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStations() {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("stations")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (fetchError) throw fetchError;

        if (!data || data.length === 0) {
          throw new Error("No stations available");
        }

        setStations(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load stations";
        setError(errorMessage);
        console.error("Error fetching stations:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStations();
  }, []);

  return { stations, isLoading, error };
}
