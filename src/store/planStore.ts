import { create } from 'zustand';
import type { AppState, Coord, NormalizedItinerary } from '../lib/types';

type PlanStore = AppState & {
  setFrom: (coord?: Coord) => void;
  setTo: (coord?: Coord) => void;
  setDateTime: (dateTime: string) => void;
  setUseTransmodel: (use: boolean) => void;
  setUseGtfs: (use: boolean) => void;
  setNumItineraries: (num: number) => void;
  setItineraries: (itineraries?: NormalizedItinerary[]) => void;
  setSelectedItineraryId: (id?: string) => void;
  setPickingMode: (mode: 'from' | 'to' | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error?: string) => void;
  clear: () => void;
};

const initialState: AppState = {
  from: undefined,
  to: undefined,
  dateTimeISO: new Date().toISOString(),
  useTransmodel: true,
  useGtfs: true,
  numItineraries: 5,
  itineraries: undefined,
  selectedItineraryId: undefined,
  pickingMode: null,
  isLoading: false,
  error: undefined,
};

export const usePlanStore = create<PlanStore>((set) => ({
  ...initialState,
  setFrom: (coord) => set({ from: coord, error: undefined }),
  setTo: (coord) => set({ to: coord, error: undefined }),
  setDateTime: (dateTime) => set({ dateTimeISO: dateTime }),
  setUseTransmodel: (use) => set({ useTransmodel: use }),
  setUseGtfs: (use) => set({ useGtfs: use }),
  setNumItineraries: (num) => set({ numItineraries: num }),
  setItineraries: (itineraries) => set({ itineraries }),
  setSelectedItineraryId: (id) => set({ selectedItineraryId: id }),
  setPickingMode: (mode) => set({ pickingMode: mode }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clear: () =>
    set({
      from: undefined,
      to: undefined,
      itineraries: undefined,
      selectedItineraryId: undefined,
      error: undefined,
      pickingMode: null,
    }),
}));

