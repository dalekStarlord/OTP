// Normalized data types for unified OTP responses

export type Coord = {
  lat: number;
  lon: number;
  name?: string;
};

export type NormalizedLeg = {
  mode: string;
  from: { lat: number; lon: number; name?: string };
  to: { lat: number; lon: number; name?: string };
  distance: number; // meters
  duration: number; // seconds
  lineName?: string;
  polyline?: string; // encoded
};

export type NormalizedItinerary = {
  id: string;
  source: 'transmodel' | 'gtfs';
  startTime: number; // epoch ms
  endTime: number; // epoch ms
  duration: number; // seconds
  transfers: number;
  legs: NormalizedLeg[];
};

export type AppState = {
  from?: Coord;
  to?: Coord;
  dateTimeISO: string;
  useTransmodel: boolean;
  useGtfs: boolean;
  numItineraries: number;
  itineraries?: NormalizedItinerary[];
  selectedItineraryId?: string;
  pickingMode?: 'from' | 'to' | null;
  isLoading: boolean;
  error?: string;
};

