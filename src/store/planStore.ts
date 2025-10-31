import { create } from 'zustand';
import type { AppState, Coord, NormalizedItinerary, NavigationState, FareType } from '../lib/types';

type PlanStore = AppState & {
  focusedLegIndex: number | null;
  viewingLegIndex: number | null; // Which leg detail view is active (null = showing legs list)
  setFrom: (coord?: Coord) => void;
  setTo: (coord?: Coord) => void;
  setDateTime: (dateTime: string) => void;
  setNumItineraries: (num: number) => void;
  setFareType: (fareType: FareType) => void;
  setItineraries: (itineraries?: NormalizedItinerary[]) => void;
  setSelectedItineraryId: (id?: string) => void;
  setFocusedLegIndex: (index: number | null) => void;
  setViewingLegIndex: (index: number | null) => void;
  setPickingMode: (mode: 'from' | 'to' | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error?: string) => void;
  setNavigation: (navigation: NavigationState) => void;
  startNavigation: () => void;
  pauseNavigation: () => void;
  resumeNavigation: () => void;
  resetNavigation: () => void;
  updateNavigationProgress: (legIndex: number, progress: number) => void;
  clear: () => void;
};

const initialNavigationState: NavigationState = {
  isNavigating: false,
  isPaused: false,
  currentLegIndex: 0,
  progressOnLeg: 0,
  speed: 10, // 10 m/s (~36 km/h, typical jeepney speed)
};

const initialState: AppState = {
  from: undefined,
  to: undefined,
  dateTimeISO: new Date().toISOString(),
  numItineraries: 5,
  fareType: 'regular',
  itineraries: undefined,
  selectedItineraryId: undefined,
  pickingMode: null,
  isLoading: false,
  error: undefined,
  navigation: initialNavigationState,
};

export const usePlanStore = create<PlanStore>((set) => ({
  ...initialState,
  focusedLegIndex: null,
  viewingLegIndex: null,
  setFrom: (coord) => set({ from: coord, error: undefined }),
  setTo: (coord) => set({ to: coord, error: undefined }),
  setDateTime: (dateTime) => set({ dateTimeISO: dateTime }),
  setNumItineraries: (num) => set({ numItineraries: num }),
  setFareType: (fareType) => set({ fareType }),
  setItineraries: (itineraries) => set({ itineraries }),
  setSelectedItineraryId: (id) => {
    // When selecting an itinerary, preserve focusedLegIndex if it's the same itinerary
    // Only clear it if switching to a different itinerary
    set((state) => {
      if (state.selectedItineraryId === id) {
        // Same itinerary - preserve focused leg
        return { selectedItineraryId: id };
      }
      // Different itinerary - clear focused leg and viewing leg
      return { selectedItineraryId: id, focusedLegIndex: null, viewingLegIndex: null };
    });
  },
  setFocusedLegIndex: (index) => set({ focusedLegIndex: index }),
  setViewingLegIndex: (index) => set({ viewingLegIndex: index }),
  setPickingMode: (mode) => set({ pickingMode: mode }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setNavigation: (navigation) => set({ navigation }),
  startNavigation: () =>
    set({
      navigation: {
        ...initialNavigationState,
        isNavigating: true,
        isPaused: false,
      },
    }),
  pauseNavigation: () =>
    set((state) => ({
      navigation: { ...state.navigation, isPaused: true },
    })),
  resumeNavigation: () =>
    set((state) => ({
      navigation: { ...state.navigation, isPaused: false },
    })),
  resetNavigation: () =>
    set({ navigation: initialNavigationState }),
  updateNavigationProgress: (legIndex, progress) =>
    set((state) => ({
      navigation: {
        ...state.navigation,
        currentLegIndex: legIndex,
        progressOnLeg: progress,
      },
    })),
  clear: () =>
    set({
      from: undefined,
      to: undefined,
      itineraries: undefined,
      selectedItineraryId: undefined,
      focusedLegIndex: null,
      viewingLegIndex: null,
      error: undefined,
      pickingMode: null,
      navigation: initialNavigationState,
    }),
}));

