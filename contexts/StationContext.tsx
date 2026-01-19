"use client";

import { createContext, useContext, useReducer, ReactNode, useEffect } from "react";
import type { Station } from "@/types/station";
import { useStations } from "@/hooks/useStations";

interface StationState {
  stations: Station[];
  currentIndex: number;
  history: number[];
  isLoading: boolean;
  error: string | null;
}

type StationAction =
  | { type: "SET_STATIONS"; payload: Station[] }
  | { type: "SET_CURRENT_INDEX"; payload: number }
  | { type: "NEXT_STATION" }
  | { type: "PREVIOUS_STATION" }
  | { type: "SET_ERROR"; payload: string }
  | { type: "SET_LOADING"; payload: boolean };

const initialState: StationState = {
  stations: [],
  currentIndex: 0,
  history: [],
  isLoading: true,
  error: null,
};

function stationReducer(state: StationState, action: StationAction): StationState {
  switch (action.type) {
    case "SET_STATIONS":
      return {
        ...state,
        stations: action.payload,
        currentIndex: Math.floor(Math.random() * action.payload.length),
        isLoading: false,
      };

    case "SET_CURRENT_INDEX":
      return {
        ...state,
        currentIndex: action.payload,
        history: [...state.history, state.currentIndex],
      };

    case "NEXT_STATION": {
      const nextIndex = (state.currentIndex + 1) % state.stations.length;
      return {
        ...state,
        currentIndex: nextIndex,
        history: [...state.history, state.currentIndex],
      };
    }

    case "PREVIOUS_STATION": {
      const prevIndex = state.currentIndex === 0 ? state.stations.length - 1 : state.currentIndex - 1;
      return {
        ...state,
        currentIndex: prevIndex,
        history: [...state.history, state.currentIndex],
      };
    }

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };

    default:
      return state;
  }
}

interface StationContextType extends StationState {
  currentStation: Station | null;
  nextStation: Station | null;
  previousStation: Station | null;
  goToNext: () => void;
  goToPrevious: () => void;
  goToStation: (index: number) => void;
}

const StationContext = createContext<StationContextType | null>(null);

export function StationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(stationReducer, initialState);
  const { stations, isLoading, error } = useStations();

  useEffect(() => {
    if (stations.length > 0) {
      dispatch({ type: "SET_STATIONS", payload: stations });
    } else if (error) {
      dispatch({ type: "SET_ERROR", payload: error });
    }
  }, [stations, error]);

  const currentStation = state.stations[state.currentIndex] || null;
  const nextStation = state.stations[(state.currentIndex + 1) % state.stations.length] || null;
  const previousStation =
    state.stations[state.currentIndex === 0 ? state.stations.length - 1 : state.currentIndex - 1] || null;

  const goToNext = () => dispatch({ type: "NEXT_STATION" });
  const goToPrevious = () => dispatch({ type: "PREVIOUS_STATION" });
  const goToStation = (index: number) => dispatch({ type: "SET_CURRENT_INDEX", payload: index });

  const value: StationContextType = {
    ...state,
    currentStation,
    nextStation,
    previousStation,
    goToNext,
    goToPrevious,
    goToStation,
  };

  return <StationContext.Provider value={value}>{children}</StationContext.Provider>;
}

export function useStationNavigation() {
  const context = useContext(StationContext);
  if (!context) {
    throw new Error("useStationNavigation must be used within StationProvider");
  }
  return context;
}
