/**
 * Enhanced SearchBar with autocomplete, recent searches, and geolocation
 * Nielsen Heuristics #2, #3, #5, #6
 */

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, X, Loader2, Navigation, Clock, Star, MapPinned } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAppStore } from '../../store/appStore';
import { usePlanStore } from '../../store/planStore';
import { geocode } from '../../lib/api';
import type { GeocodeResult } from '../../lib/enhanced-types';
import type { Coord } from '../../lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { debounce } from '../../lib/utils';

interface EnhancedSearchBarProps {
  type: 'from' | 'to';
  value?: Coord;
  onChange: (value: Coord | undefined) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function EnhancedSearchBar({
  type,
  value,
  onChange,
  placeholder,
  autoFocus = false,
}: EnhancedSearchBarProps) {
  const { t } = useTranslation();
  const { recentSearches, savedPlaces, setStatus, addToast } = useAppStore();
  const { pickingMode, setPickingMode } = usePlanStore();
  const isPicking = pickingMode === type;
  const [query, setQuery] = useState(value?.name || '');
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search
  const performSearch = useRef(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const searchResults = await geocode(searchQuery);
        setResults(searchResults);
      } catch (error) {
        console.error('Geocode error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300)
  ).current;

  useEffect(() => {
    if (query && focused) {
      setLoading(true);
      performSearch(query);
    } else {
      setResults([]);
    }
  }, [query, focused]);

  // Update input when value changes (e.g., from map pick or clear)
  useEffect(() => {
    if (value?.name) {
      setQuery(value.name);
    } else if (value === undefined) {
      // Clear the input when value is cleared
      setQuery('');
    }
  }, [value, type]);

  // Handle geolocation
  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser');
      addToast({
        type: 'error',
        message: 'Geolocation is not supported by this browser',
      });
      return;
    }

    setStatus({ gpsLock: true });
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coord: Coord = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          name: t('search.useCurrentLocation'),
        };
        onChange(coord);
        setQuery(coord.name);
        setFocused(false);
        setStatus({ gpsLock: false });
      },
      (error) => {
        console.error('Geolocation error:', error);
        setStatus({ gpsLock: false });
        
        let errorMessage = 'Unable to get your location';
        let instructions = '';
        
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Location access is blocked';
          
          // Provide browser-specific instructions
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
          const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
          const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
          const isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
          
          if (isIOS && isSafari) {
            instructions = 'Go to Settings > Safari > Location Services, then turn it on and allow this website.';
          } else if (isChrome) {
            instructions = 'Click the location icon 🔒 in the address bar, then allow location access.';
          } else if (isFirefox) {
            instructions = 'Click the location icon in the address bar, then click "Allow".';
          } else if (isSafari) {
            instructions = 'Go to Safari > Settings for this Website > Location, then select "Allow".';
          } else {
            instructions = 'Click the location icon in your browser\'s address bar and select "Allow".';
          }
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = 'Location information unavailable. Please try again or enter a location manually.';
        } else if (error.code === error.TIMEOUT) {
          errorMessage = 'Location request timed out. Please try again.';
        }
        
        addToast({
          type: 'error',
          message: instructions ? `${errorMessage} ${instructions}` : errorMessage,
          duration: instructions ? 8000 : 5000,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSelect = (result: GeocodeResult) => {
    const coord: Coord = {
      lat: result.coord.lat,
      lon: result.coord.lon,
      name: result.name,
    };
    onChange(coord);
    setQuery(result.name);
    setFocused(false);
    setSelectedIndex(-1);
    // Stop picking mode after selecting a result
    setPickingMode(null);
  };

  const handleClear = () => {
    onChange(undefined);
    setQuery('');
    setResults([]);
    inputRef.current?.focus();
    // Keep picking mode for this field so user can pick on map after clearing
    setPickingMode(type);
  };

  const handleMapPick = () => {
    const { pickingMode: currentMode } = usePlanStore.getState();
    
    if (currentMode === type) {
      // Toggle off if already picking this field
      setPickingMode(null);
    } else {
      // Activate picking mode for this field
      setPickingMode(type);
      setFocused(false);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < results.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      setFocused(false);
      inputRef.current?.blur();
    }
  };

  // Show recent/favorites when focused with no query
  const showSuggestions = focused && !query;
  const relevantRecent = type === 'from'
    ? recentSearches.map((s) => s.from)
    : recentSearches.map((s) => s.to);

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-0.5 sm:mb-1.5">
        <label
          htmlFor={`search-${type}`}
          className="block text-[11px] sm:text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          {type === 'from' ? t('search.from') : t('search.to')}
        </label>
        {/* Map pick button removed intentionally; picking is auto-enabled on focus/click */}
      </div>

      <div className="relative">
        <div className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Search className="h-3.5 w-3.5 sm:h-5 sm:w-5" aria-hidden="true" />
        </div>

        <input
          ref={inputRef}
          id={`search-${type}`}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            // If the user starts typing, disable map picking to avoid confusion
            if (e.target.value.length > 0 && pickingMode) {
              setPickingMode(null);
            }
          }}
          onFocus={() => {
            setFocused(true);
            // Auto-enable map picking for this field when focused
            setPickingMode(type);
          }}
          onClick={() => {
            // Ensure picking mode is active on click
            setPickingMode(type);
          }}
          onBlur={() => {
            // Delay to allow click on results
            setTimeout(() => setFocused(false), 200);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || t(`search.${type}Placeholder`)}
          autoFocus={autoFocus}
          autoComplete="off"
          className={cn(
            'w-full pl-7 sm:pl-10 pr-14 sm:pr-20 py-1.5 sm:py-2.5 md:py-3 border sm:border-2 rounded-md sm:rounded-lg text-[13px] sm:text-base',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'transition-all',
            'dark:bg-gray-700 dark:text-white dark:border-gray-600',
            focused ? 'border-blue-400 dark:border-blue-500' : 'border-gray-300 dark:border-gray-600'
          )}
          aria-label={type === 'from' ? t('search.from') : t('search.to')}
          aria-autocomplete="list"
          aria-expanded={focused && (results.length > 0 || showSuggestions)}
          aria-controls={`search-results-${type}`}
          aria-activedescendant={
            selectedIndex >= 0 ? `result-${selectedIndex}` : undefined
          }
        />

        <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 sm:gap-2">
          {loading && <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin text-gray-400" />}
          
          {query && !loading && (
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              aria-label={t('common.clear')}
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          )}

          <button
            onClick={handleUseLocation}
            className="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label={t('search.useCurrentLocation')}
            title={t('search.useCurrentLocation')}
          >
            <Navigation className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </div>
      </div>

      {/* Dropdown results */}
      <AnimatePresence>
        {focused && (results.length > 0 || showSuggestions) && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            id={`search-results-${type}`}
            role="listbox"
            className="absolute z-50 w-full mt-1 sm:mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 max-h-60 sm:max-h-80 overflow-y-auto"
          >
            {/* Recent searches */}
            {showSuggestions && relevantRecent.length > 0 && (
              <div className="p-1.5 sm:p-2 border-b border-gray-100 dark:border-gray-700">
                <div className="px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5 sm:gap-2">
                  <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  {t('search.recent')}
                </div>
                {relevantRecent.slice(0, 3).map((coord, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelect({
                      id: `recent-${index}`,
                      name: coord.name || '',
                      address: '',
                      coord,
                      type: 'poi',
                    })}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-blue-50 dark:hover:bg-gray-700 rounded text-left flex items-center gap-2 sm:gap-3"
                  >
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm dark:text-gray-200 truncate">{coord.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Saved places */}
            {showSuggestions && savedPlaces.length > 0 && (
              <div className="p-1.5 sm:p-2 border-b border-gray-100 dark:border-gray-700">
                <div className="px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5 sm:gap-2">
                  <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  {t('search.favorites')}
                </div>
                {savedPlaces.slice(0, 3).map((place) => (
                  <button
                    key={place.id}
                    onClick={() => handleSelect({
                      id: place.id,
                      name: place.name,
                      address: place.address,
                      coord: place.coord,
                      type: 'poi',
                    })}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-blue-50 dark:hover:bg-gray-700 rounded text-left flex items-center gap-2 sm:gap-3"
                  >
                    <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-sm font-medium dark:text-gray-200 truncate">{place.name}</div>
                      <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">{place.address}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Search results */}
            {results.length > 0 && (
              <div className="p-1.5 sm:p-2">
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    id={`result-${index}`}
                    role="option"
                    aria-selected={selectedIndex === index}
                    onClick={() => handleSelect(result)}
                    className={cn(
                      'w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded text-left flex items-start gap-2 sm:gap-3',
                      'transition-colors',
                      selectedIndex === index
                        ? 'bg-blue-100 dark:bg-blue-900'
                        : 'hover:bg-blue-50 dark:hover:bg-gray-700'
                    )}
                  >
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 dark:text-gray-500 mt-0.5 sm:mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {result.name}
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">{result.address}</div>
                      {result.landmark && (
                        <div className="text-[10px] sm:text-xs text-blue-600 dark:text-blue-400 mt-0.5 truncate">
                          Near {result.landmark}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* No results */}
            {query && results.length === 0 && !loading && (
              <div className="p-4 sm:p-6 text-center text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                {t('search.noResults')}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

