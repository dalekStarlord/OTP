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
  startRealTimeNavigation: () => Promise<boolean>;
  stopRealTimeNavigation: () => void;
  pauseNavigation: () => void;
  resumeNavigation: () => void;
  resetNavigation: () => void;
  updateNavigationProgress: (legIndex: number, progress: number) => void;
  updateGpsPosition: (position: { lat: number; lon: number; accuracy?: number }) => void;
  clear: () => void;
};

const initialNavigationState: NavigationState = {
  isNavigating: false,
  isPaused: false,
  currentLegIndex: 0,
  progressOnLeg: 0,
  speed: 10, // 10 m/s (~36 km/h, typical jeepney speed)
  isRealTimeTracking: false,
  distanceTraveled: 0,
  completedSegments: new Set(),
  segmentPassedTimes: new Map(),
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
        isRealTimeTracking: false,
      },
    }),
  startRealTimeNavigation: () =>
    new Promise<boolean>((resolve) => {
      if (!navigator.geolocation) {
        resolve(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          set({
            navigation: {
              ...initialNavigationState,
              isNavigating: true,
              isPaused: false,
              isRealTimeTracking: true,
              gpsPosition: {
                lat: position.coords.latitude,
                lon: position.coords.longitude,
                accuracy: position.coords.accuracy,
              },
              lastGpsUpdate: Date.now(),
            },
          });
          resolve(true);
        },
        () => {
          resolve(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    }),
  stopRealTimeNavigation: () =>
    set((state) => ({
      navigation: {
        ...state.navigation,
        isNavigating: false,
        isRealTimeTracking: false,
        gpsPosition: undefined,
      },
    })),
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
    set((state) => {
      const newNavigation = { ...state.navigation };
      
      // Track leg completion time for fading effect
      if (legIndex > newNavigation.currentLegIndex) {
        // Leg has been completed
        if (!newNavigation.segmentPassedTimes) {
          newNavigation.segmentPassedTimes = new Map();
        }
        newNavigation.segmentPassedTimes.set(newNavigation.currentLegIndex, Date.now());
      }
      
      // Track segment progress for current leg
      if (legIndex === newNavigation.currentLegIndex && progress > newNavigation.progressOnLeg) {
        // Moving forward on current leg
        if (!newNavigation.segmentPassedTimes) {
          newNavigation.segmentPassedTimes = new Map();
        }
        // Mark previous progress segments as passed
        const prevProgress = Math.floor(newNavigation.progressOnLeg * 10);
        const currProgress = Math.floor(progress * 10);
        for (let i = prevProgress; i < currProgress; i++) {
          newNavigation.segmentPassedTimes.set(legIndex * 1000 + i, Date.now());
        }
      }
      
      return {
        navigation: {
          ...newNavigation,
          currentLegIndex: legIndex,
          progressOnLeg: progress,
        },
      };
    }),
  updateGpsPosition: (position) =>
    set((state) => ({
      navigation: {
        ...state.navigation,
        gpsPosition: position,
        lastGpsUpdate: Date.now(),
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

