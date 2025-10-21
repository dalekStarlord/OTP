import { useState, useEffect, useRef, useCallback } from 'react';
import { usePlanStore } from '../store/planStore';
import {
  geocodeSearch,
  debounce,
  getCachedSelections,
  cacheSelection,
  suggestionToCoord,
  type GeocodeSuggestion,
} from '../lib/geocode';

type SearchBoxProps = {
  type: 'from' | 'to';
};

export default function SearchBox({ type }: SearchBoxProps) {
  const store = usePlanStore();
  const coord = type === 'from' ? store.from : store.to;
  const setCoord = type === 'from' ? store.setFrom : store.setTo;
  const pickingMode = store.pickingMode;
  const setPickingMode = store.setPickingMode;

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodeSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isPicking = pickingMode === type;

  // Update query when coord changes externally (e.g., from map click)
  useEffect(() => {
    if (coord?.name) {
      setQuery(coord.name);
    } else if (coord) {
      setQuery(`${coord.lat.toFixed(6)}, ${coord.lon.toFixed(6)}`);
    }
  }, [coord]);

  // Debounced geocode search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setSuggestions(getCachedSelections());
      setIsSearching(false);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsSearching(true);

    const results = await geocodeSearch(
      searchQuery,
      abortControllerRef.current.signal
    );
    setSuggestions(results);
    setIsSearching(false);
  }, []);

  const debouncedSearch = useRef(debounce(performSearch, 500));

  function handleInputChange(value: string) {
    setQuery(value);
    setShowSuggestions(true);

    if (value.length === 0) {
      setSuggestions(getCachedSelections());
      setIsSearching(false);
    } else if (value.length < 3) {
      setSuggestions([]);
      setIsSearching(false);
    } else {
      debouncedSearch.current(value);
    }
  }

  function handleSelectSuggestion(suggestion: GeocodeSuggestion) {
    const coord = suggestionToCoord(suggestion);
    setCoord(coord);
    setQuery(suggestion.name);
    setShowSuggestions(false);
    cacheSelection(suggestion);
  }

  function handlePickOnMap() {
    if (isPicking) {
      setPickingMode(null);
    } else {
      setPickingMode(type);
      setShowSuggestions(false);
    }
  }

  function handleClear() {
    setQuery('');
    setCoord(undefined);
    setSuggestions(getCachedSelections());
  }

  const label = type === 'from' ? 'From' : 'To';
  const icon = type === 'from' ? '🟢' : '🔴';

  return (
    <div className="relative">
      <div className="flex gap-1.5">
        <div className="flex items-center justify-center w-6 pt-0.5">
          <span className="text-base">{icon}</span>
        </div>
        <div className="relative flex-1">
          <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
            {label}
          </label>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => {
              setShowSuggestions(true);
              if (suggestions.length === 0) {
                setSuggestions(getCachedSelections());
              }
            }}
            onBlur={() => {
              // Delay to allow click on suggestion
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            placeholder={`Choose ${label.toLowerCase()}`}
            className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-xs bg-gray-50 focus:bg-white"
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute right-1.5 top-7 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Suggestions dropdown */}
          {showSuggestions && (suggestions.length > 0 || isSearching) && (
            <div className="absolute z-[1001] w-full mt-1 bg-white border-2 border-blue-200 rounded-lg shadow-2xl max-h-56 overflow-auto">
              {isSearching && (
                <div className="px-3 py-2 text-xs text-gray-500 flex items-center gap-2 bg-gray-50">
                  <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  Searching...
                </div>
              )}
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className="w-full px-3 py-2.5 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors first:rounded-t-lg last:rounded-b-lg bg-white"
                >
                  <div className="flex items-start gap-1.5">
                    <span className="text-gray-400 text-xs mt-0.5">📍</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-xs text-gray-900">{suggestion.name}</div>
                      <div className="text-[10px] text-gray-500 truncate">
                        {suggestion.displayName}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handlePickOnMap}
          className={`self-end mb-0.5 px-2 py-1.5 rounded-lg font-medium transition-all ${
            isPicking
              ? 'bg-blue-600 text-white scale-95'
              : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:bg-blue-50'
          }`}
          title="Pick location on map"
        >
          <span className="text-sm">{isPicking ? '📍' : '🗺️'}</span>
        </button>
      </div>

      {coord && (
        <div className="mt-1 ml-7 text-[10px] text-gray-400 font-mono">
          {coord.lat.toFixed(5)}, {coord.lon.toFixed(5)}
        </div>
      )}
    </div>
  );
}

