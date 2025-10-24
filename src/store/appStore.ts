/**
 * Enhanced app store with all state management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  UserPreferences,
  SavedPlace,
  SavedRoute,
  RecentSearch,
  AppStatus,
  ToastMessage,
  RouteFilters,
} from '../lib/enhanced-types';
import { STORAGE_KEYS } from '../lib/constants';
import { generateId, isOnline } from '../lib/utils';

interface AppStore {
  // User preferences
  preferences: UserPreferences;
  setPreferences: (preferences: Partial<UserPreferences>) => void;

  // Saved data
  savedPlaces: SavedPlace[];
  savedRoutes: SavedRoute[];
  recentSearches: RecentSearch[];
  addSavedPlace: (place: SavedPlace) => void;
  removeSavedPlace: (id: string) => void;
  updateSavedPlace: (id: string, updates: Partial<SavedPlace>) => void;
  addSavedRoute: (route: SavedRoute) => void;
  removeSavedRoute: (id: string) => void;
  addRecentSearch: (search: Omit<RecentSearch, 'id' | 'timestamp'>) => void;
  clearRecentSearches: () => void;

  // App status (for Nielsen Heuristic #1: Visibility of system status)
  status: AppStatus;
  setStatus: (status: Partial<AppStatus>) => void;
  setError: (
    type: AppStatus['error']['type'],
    message: string,
    recoverable?: boolean
  ) => void;
  clearError: () => void;

  // Toast notifications (for feedback)
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  // Route filters
  filters: RouteFilters;
  setFilters: (filters: Partial<RouteFilters>) => void;
  resetFilters: () => void;

  // UI state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  helpDialogOpen: boolean;
  setHelpDialogOpen: (open: boolean) => void;
  firstVisit: boolean;
  markFirstVisitComplete: () => void;
}

const defaultPreferences: UserPreferences = {
  theme: 'light',
  language: 'en',
  textSize: 'medium',
  highContrast: false,
  reducedMotion: false,
  preferredModes: ['JEEPNEY', 'BUS', 'WALK'],
  notifications: {
    delays: true,
    alternatives: true,
  },
};

const defaultFilters: RouteFilters = {
  sortBy: 'fastest',
  modes: {
    JEEPNEY: 'include',
    BUS: 'include',
    TRICYCLE: 'include',
    WALK: 'include',
    FERRY: 'include',
  },
  maxWalkDistance: 1000,
  maxTransfers: 3,
};

const defaultStatus: AppStatus = {
  online: isOnline(),
  fetching: false,
  gpsLock: false,
  computing: false,
  syncing: false,
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // User preferences
      preferences: defaultPreferences,
      setPreferences: (preferences) =>
        set((state) => ({
          preferences: { ...state.preferences, ...preferences },
        })),

      // Saved data
      savedPlaces: [],
      savedRoutes: [],
      recentSearches: [],

      addSavedPlace: (place) =>
        set((state) => ({
          savedPlaces: [...state.savedPlaces, place],
        })),

      removeSavedPlace: (id) =>
        set((state) => ({
          savedPlaces: state.savedPlaces.filter((p) => p.id !== id),
        })),

      updateSavedPlace: (id, updates) =>
        set((state) => ({
          savedPlaces: state.savedPlaces.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),

      addSavedRoute: (route) =>
        set((state) => {
          // Check if route already exists, increment frequency
          const existing = state.savedRoutes.find((r) => r.id === route.id);
          if (existing) {
            return {
              savedRoutes: state.savedRoutes.map((r) =>
                r.id === route.id ? { ...r, frequency: r.frequency + 1 } : r
              ),
            };
          }
          return {
            savedRoutes: [...state.savedRoutes, route],
          };
        }),

      removeSavedRoute: (id) =>
        set((state) => ({
          savedRoutes: state.savedRoutes.filter((r) => r.id !== id),
        })),

      addRecentSearch: (search) =>
        set((state) => {
          const newSearch: RecentSearch = {
            ...search,
            id: generateId(),
            timestamp: Date.now(),
          };
          // Keep only last 10 searches
          const updated = [newSearch, ...state.recentSearches].slice(0, 10);
          return { recentSearches: updated };
        }),

      clearRecentSearches: () => set({ recentSearches: [] }),

      // App status
      status: defaultStatus,
      setStatus: (status) =>
        set((state) => ({
          status: { ...state.status, ...status, lastUpdate: Date.now() },
        })),

      setError: (type, message, recoverable = true) =>
        set((state) => ({
          status: {
            ...state.status,
            error: { type, message, recoverable },
            lastUpdate: Date.now(),
          },
        })),

      clearError: () =>
        set((state) => ({
          status: { ...state.status, error: undefined },
        })),

      // Toast notifications
      toasts: [],
      addToast: (toast) => {
        const newToast: ToastMessage = {
          ...toast,
          id: generateId(),
        };
        set((state) => ({
          toasts: [...state.toasts, newToast],
        }));

        // Auto-remove after duration
        if (toast.duration !== Infinity) {
          setTimeout(() => {
            get().removeToast(newToast.id);
          }, toast.duration || 3000);
        }
      },

      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),

      // Route filters
      filters: defaultFilters,
      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),

      resetFilters: () => set({ filters: defaultFilters }),

      // UI state
      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      helpDialogOpen: false,
      setHelpDialogOpen: (open) => set({ helpDialogOpen: open }),
      firstVisit: true,
      markFirstVisitComplete: () => set({ firstVisit: false }),
    }),
    {
      name: STORAGE_KEYS.userPreferences,
      partialize: (state) => ({
        preferences: state.preferences,
        savedPlaces: state.savedPlaces,
        savedRoutes: state.savedRoutes,
        recentSearches: state.recentSearches,
        filters: state.filters,
        firstVisit: state.firstVisit,
      }),
    }
  )
);

// Listen to online/offline events
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useAppStore.getState().setStatus({ online: true });
  });

  window.addEventListener('offline', () => {
    useAppStore.getState().setStatus({ online: false });
  });
}

