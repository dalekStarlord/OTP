/**
 * Unified Sidebar - Combines Plan Trip functionality with Settings
 * Desktop-only minimalist design
 */

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { usePlanStore } from '../../store/planStore';
import { useAppStore } from '../../store/appStore';
import { EnhancedSearchBar } from './EnhancedSearchBar';
import { RouteCard } from './RouteCard';
import { Button } from './Button';
import RouteDetailsSheet from './RouteDetailsSheet';
import { ArrowLeftRight, SlidersHorizontal, Settings as SettingsIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { SORT_OPTIONS } from '../../lib/constants';
import { Sun, Moon, Languages, Type } from 'lucide-react';

interface UnifiedSidebarProps {
  pickingMode: 'from' | 'to' | null;
  hoveredItineraryId: string | null;
  setHoveredItineraryId: (id: string | null) => void;
}

export function UnifiedSidebar({ pickingMode, hoveredItineraryId: _hoveredItineraryId, setHoveredItineraryId }: UnifiedSidebarProps) {
  const { t, i18n } = useTranslation();
  const { 
    from, 
    to, 
    setFrom, 
    setTo, 
    fareType, 
    setFareType, 
    itineraries, 
    selectedItineraryId, 
    setSelectedItineraryId, 
    clear,
    setItineraries
  } = usePlanStore();
  const { filters, setFilters, preferences, setPreferences, addToast, addRecentSearch } = useAppStore();
  
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'plan' | 'settings'>('plan');

  const themes = [
    { id: 'light', icon: Sun, label: t('settings.themeLight') },
    { id: 'dark', icon: Moon, label: t('settings.themeDark') },
  ];

  const languages = [
    { code: 'en', name: t('settings.languages.en') },
    { code: 'fil', name: t('settings.languages.fil') },
    { code: 'ceb', name: t('settings.languages.ceb') },
  ];

  const textSizes = [
    { id: 'small', label: 'Small', className: 'text-sm' },
    { id: 'medium', label: 'Medium', className: 'text-base' },
    { id: 'large', label: 'Large', className: 'text-lg' },
  ];

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const handleClear = () => {
    clear();
  };

  // Sort itineraries based on filter
  const sortedItineraries = useMemo(() => {
    if (!itineraries || itineraries.length === 0) return itineraries;
    
    return [...itineraries].sort((a, b) => {
      if (filters.sortBy === 'fastest') {
        return a.duration - b.duration;
      }
      if (filters.sortBy === 'cheapest') {
        const fareA = a.legs.filter(l => l.mode !== 'WALK').length * 13;
        const fareB = b.legs.filter(l => l.mode !== 'WALK').length * 13;
        return fareA - fareB;
      }
      if (filters.sortBy === 'fewestTransfers') {
        return a.transfers - b.transfers;
      }
      return 0;
    });
  }, [itineraries, filters.sortBy]);

  const handlePlanRoute = async () => {
    if (!from || !to) {
      addToast({
        type: 'warning',
        message: t('errors.routeFailed'),
      });
      return;
    }

    try {
      // Import the function dynamically to avoid issues
      const { planTripGtfs } = await import('../../lib/otp');
      
      const results = await planTripGtfs(
        from,
        to,
        new Date().toISOString(),
        5
      );

      if (results.length === 0) {
        console.warn('⚠️ No itineraries returned from API!');
      }

      // Store results as-is, sorting will be handled by useMemo
      setItineraries(results);
      setSelectedItineraryId(undefined);
      
      addRecentSearch({ from, to });

      addToast({
        type: 'success',
        message: `Found ${results.length} routes`,
      });
    } catch (error) {
      console.error('Route planning error:', error);
      addToast({
        type: 'error',
        message: t('errors.routeFailed'),
      });
    }
  };


  return (
    <div 
      className={cn(
        "w-full lg:w-96 xl:w-[28rem] max-h-[50vh] lg:max-h-full lg:h-full overflow-y-auto shadow-xl flex flex-col transition-all duration-300",
        pickingMode
          ? "bg-white/90 dark:bg-gray-800/90"
          : "bg-white dark:bg-gray-800"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
           CDO Jeepney Planner
        </h1>
      </div>

      <div className="p-3 sm:p-4 md:p-5 space-y-3 sm:space-y-4 flex-1">
        {/* Tab switcher */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('plan')}
            className={cn(
              "flex-1 py-2 text-center font-medium text-sm transition-colors relative",
              activeTab === 'plan'
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            )}
          >
            {t('nav.home')}
            {activeTab === 'plan' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={cn(
              "flex-1 py-2 text-center font-medium text-sm transition-colors relative",
              activeTab === 'settings'
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            )}
          >
            <SettingsIcon className="h-4 w-4 inline-block mr-1" />
            {t('nav.settings')}
            {activeTab === 'settings' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
            )}
          </button>
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === 'plan' ? (
            <motion.div
              key="plan"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-3 sm:space-y-4"
            >
              {/* Search boxes */}
              <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-1.5 space-y-1.5">
                <EnhancedSearchBar
                  type="from"
                  value={from}
                  onChange={setFrom}
                  autoFocus
                />
                <button
                  onClick={handleSwap}
                  disabled={!from && !to}
                  aria-label={t('search.swap')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-blue-600 text-white shadow-md flex items-center justify-center disabled:opacity-50 hover:bg-blue-700 transition-colors z-10 pointer-events-auto"
                >
                  <ArrowLeftRight className="h-3.5 w-3.5" />
                </button>
                <EnhancedSearchBar
                  type="to"
                  value={to}
                  onChange={setTo}
                />
              </div>

              {/* Clear button */}
              <div className="flex justify-center">
                <button
                  onClick={handleClear}
                  disabled={!from && !to}
                  className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Clear locations"
                  title="Clear all locations"
                >
                  <svg 
                    className="h-4 w-4 text-red-600 dark:text-red-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                    />
                  </svg>
                </button>
              </div>

              {/* Filters toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200 truncate">
                  {t('results.title')} • {t(`sort.${filters.sortBy}`)}
                </span>
                <SlidersHorizontal className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400 flex-shrink-0 ml-2" />
              </button>

              {/* Filters panel */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg p-4"
                  >
                    {/* Sort options */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Sort by
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        {SORT_OPTIONS.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => {
                              setFilters({ sortBy: option.id as any });
                              setShowFilters(false);
                            }}
                            className={`flex-1 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                              filters.sortBy === option.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            {t(option.nameKey)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Plan route button */}
              <Button
                onClick={handlePlanRoute}
                disabled={!from || !to}
                fullWidth
                size="lg"
              >
                Plan Route
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Appearance */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Appearance
                </h2>

                {/* Theme */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('settings.theme')}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {themes.map((theme) => {
                      const IconComponent = theme.icon;
                      return (
                        <button
                          key={theme.id}
                          onClick={() => setPreferences({ theme: theme.id as 'light' | 'dark' })}
                          className={`p-2 rounded-lg border-2 transition-all ${
                            preferences.theme === theme.id
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900 dark:border-blue-400'
                              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                          }`}
                        >
                          <IconComponent className="h-4 w-4 mx-auto mb-1" />
                          <div className="text-xs font-medium">{theme.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Language */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Languages className="h-3 w-3" />
                    {t('settings.language')}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          i18n.changeLanguage(lang.code);
                          setPreferences({ language: lang.code as any });
                        }}
                        className={`p-2 rounded-lg border-2 text-xs font-medium transition-all ${
                          preferences.language === lang.code
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 dark:border-blue-400'
                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                        }`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text size */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Type className="h-3 w-3" />
                    {t('settings.textSize')}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {textSizes.map((size) => (
                      <button
                        key={size.id}
                        onClick={() => setPreferences({ textSize: size.id as any })}
                        className={`p-2 rounded-lg border-2 transition-all ${
                          preferences.textSize === size.id
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900 dark:border-blue-400'
                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                        }`}
                      >
                        <div className={`font-medium text-xs ${size.className}`}>{size.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results list or Route Details - Always visible below tabs */}
        {sortedItineraries && sortedItineraries.length > 0 && (
          selectedItineraryId ? (
            // Show Route Details Sheet when itinerary is selected
            (() => {
              const selectedItinerary = sortedItineraries.find(i => i.id === selectedItineraryId);
              if (!selectedItinerary) return null;
              return (
                <div className="h-full flex flex-col">
                  <RouteDetailsSheet
                    itinerary={selectedItinerary}
                    fareType={fareType}
                  />
                </div>
              );
            })()
          ) : (
            // Show Journey List when no itinerary is selected
            <div className="space-y-2 sm:space-y-3">
              <h2 className="font-bold text-base sm:text-lg text-gray-900 dark:text-gray-100">
                {sortedItineraries.length} {t('results.title')}
              </h2>

              {/* Fare Type Toggle - Compact (one-tap buttons) */}
              <div className="flex gap-1.5 text-xs" role="radiogroup" aria-label="Fare Type">
                <button
                  type="button"
                  onClick={() => setFareType('regular')}
                  role="radio"
                  aria-checked={fareType === 'regular'}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1 cursor-pointer py-1.5 px-2 rounded-lg border transition-colors",
                    fareType === 'regular'
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                      : "border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:border-blue-300"
                  )}
                >
                  <span className="font-medium text-[11px]">Regular</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFareType('discount')}
                  role="radio"
                  aria-checked={fareType === 'discount'}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1 cursor-pointer py-1.5 px-2 rounded-lg border transition-colors",
                    fareType === 'discount'
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                      : "border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:border-green-300"
                  )}
                >
                  <span className="font-medium text-[11px]">Discount</span>
                </button>
              </div>
              
              {sortedItineraries.map((itinerary, index) => (
                <RouteCard
                  key={itinerary.id}
                  itinerary={itinerary}
                  itineraryIndex={index}
                  fareType={fareType}
                  selected={selectedItineraryId === itinerary.id}
                  onSelect={() => {
                    setSelectedItineraryId(itinerary.id);
                  }}
                  onHover={(hover) => setHoveredItineraryId(hover ? itinerary.id : null)}
                />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

