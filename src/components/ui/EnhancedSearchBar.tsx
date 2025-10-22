/**
 * Enhanced SearchBar with autocomplete, recent searches, and geolocation
 * Nielsen Heuristics #2, #3, #5, #6
 */

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, X, Loader2, Navigation, Clock, Star } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAppStore } from '../../store/appStore';
import { geocode } from '../../mocks/mockApi';
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
  const { recentSearches, savedPlaces, setStatus } = useAppStore();
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

  // Handle geolocation
  const handleUseLocation = () => {
    if (!navigator.geolocation) {
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
        // Show error toast would go here
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
  };

  const handleClear = () => {
    onChange(undefined);
    setQuery('');
    setResults([]);
    inputRef.current?.focus();
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
      <label
        htmlFor={`search-${type}`}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {type === 'from' ? t('search.from') : t('search.to')}
      </label>

      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Search className="h-5 w-5" aria-hidden="true" />
        </div>

        <input
          ref={inputRef}
          id={`search-${type}`}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            // Delay to allow click on results
            setTimeout(() => setFocused(false), 200);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || t(`search.${type}Placeholder`)}
          autoFocus={autoFocus}
          autoComplete="off"
          className={cn(
            'w-full pl-10 pr-20 py-3 border-2 rounded-lg',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'transition-all',
            focused ? 'border-blue-400' : 'border-gray-300'
          )}
          aria-label={type === 'from' ? t('search.from') : t('search.to')}
          aria-autocomplete="list"
          aria-expanded={focused && (results.length > 0 || showSuggestions)}
          aria-controls={`search-results-${type}`}
          aria-activedescendant={
            selectedIndex >= 0 ? `result-${selectedIndex}` : undefined
          }
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
          
          {query && !loading && (
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              aria-label={t('common.clear')}
            >
              <X className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={handleUseLocation}
            className="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label={t('search.useCurrentLocation')}
            title={t('search.useCurrentLocation')}
          >
            <Navigation className="h-4 w-4" />
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
            className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto"
          >
            {/* Recent searches */}
            {showSuggestions && relevantRecent.length > 0 && (
              <div className="p-2 border-b border-gray-100">
                <div className="px-3 py-2 text-xs font-medium text-gray-500 flex items-center gap-2">
                  <Clock className="h-3 w-3" />
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
                    className="w-full px-3 py-2 hover:bg-blue-50 rounded text-left flex items-center gap-3"
                  >
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{coord.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Saved places */}
            {showSuggestions && savedPlaces.length > 0 && (
              <div className="p-2 border-b border-gray-100">
                <div className="px-3 py-2 text-xs font-medium text-gray-500 flex items-center gap-2">
                  <Star className="h-3 w-3" />
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
                    className="w-full px-3 py-2 hover:bg-blue-50 rounded text-left flex items-center gap-3"
                  >
                    <Star className="h-4 w-4 text-yellow-500" />
                    <div>
                      <div className="text-sm font-medium">{place.name}</div>
                      <div className="text-xs text-gray-500">{place.address}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Search results */}
            {results.length > 0 && (
              <div className="p-2">
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    id={`result-${index}`}
                    role="option"
                    aria-selected={selectedIndex === index}
                    onClick={() => handleSelect(result)}
                    className={cn(
                      'w-full px-3 py-2 rounded text-left flex items-start gap-3',
                      'transition-colors',
                      selectedIndex === index
                        ? 'bg-blue-100'
                        : 'hover:bg-blue-50'
                    )}
                  >
                    <MapPin className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">
                        {result.name}
                      </div>
                      <div className="text-xs text-gray-500">{result.address}</div>
                      {result.landmark && (
                        <div className="text-xs text-blue-600 mt-0.5">
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
              <div className="p-6 text-center text-gray-500 text-sm">
                {t('search.noResults')}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

