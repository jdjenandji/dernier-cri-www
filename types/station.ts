export interface Station {
  id: string;
  name: string;
  logo_url: string;
  stream_url: string;
  country: string;
  city: string | null;
  genre: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AudioState {
  isPlaying: boolean;
  isLoading: boolean;
  isCrossfading: boolean;
  currentStation: Station | null;
  error: string | null;
}

export interface StationNavigationState {
  stations: Station[];
  currentIndex: number;
  history: number[];
  isLoading: boolean;
  error: string | null;
}

export enum SwipeDirection {
  UP = "UP",
  DOWN = "DOWN",
  NONE = "NONE",
}
