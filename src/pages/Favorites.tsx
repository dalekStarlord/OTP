/**
 * Favorites page - Saved places and routes
 */

import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/appStore';
import { Star, Trash2, MapPin, Route, Home, Briefcase, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import type { SavedPlace } from '../lib/enhanced-types';

export function Favorites() {
  const { t } = useTranslation();
  const { savedPlaces, savedRoutes, removeSavedPlace, removeSavedRoute } = useAppStore();

  const getPlaceIcon = (type: SavedPlace['type']) => {
    switch (type) {
      case 'home':
        return Home;
      case 'work':
        return Briefcase;
      case 'university':
        return GraduationCap;
      default:
        return MapPin;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
          {t('favorites.title')}
        </h1>

        {/* Saved Places */}
        <section>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4 flex items-center gap-2">
            <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
            {t('favorites.places')}
          </h2>

          {savedPlaces.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 sm:p-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-600">
              <Star className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">{t('favorites.noPlaces')}</p>
            </div>
          ) : (
            <div className="grid gap-2 sm:gap-3 md:grid-cols-2">
              {savedPlaces.map((place) => {
                const IconComponent = getPlaceIcon(place.type);
                
                return (
                  <motion.div
                    key={place.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-md border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex gap-2 sm:gap-3 flex-1 min-w-0">
                        <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                          <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100 truncate">{place.name}</h3>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">{place.address}</p>
                          <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 mt-0.5 sm:mt-1">
                            {new Date(place.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => removeSavedPlace(place.id)}
                        className="p-1.5 sm:p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 flex-shrink-0"
                        aria-label={`${t('favorites.remove')} ${place.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* Saved Routes */}
        <section>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4 flex items-center gap-2">
            <Route className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
            {t('favorites.routes')}
          </h2>

          {savedRoutes.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 sm:p-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-600">
              <Route className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">{t('favorites.noRoutes')}</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {savedRoutes.map((route) => (
                <motion.div
                  key={route.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-md border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100 truncate">{route.name}</h3>
                      
                      <div className="mt-1.5 sm:mt-2 space-y-1">
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-500 flex-shrink-0" />
                          <span className="truncate">{route.from.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 dark:text-red-500 flex-shrink-0" />
                          <span className="truncate">{route.to.name}</span>
                        </div>
                      </div>

                      <div className="mt-1.5 sm:mt-2 flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                        <span>Used {route.frequency} times</span>
                        <span>{new Date(route.savedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeSavedRoute(route.id)}
                      className="p-1.5 sm:p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 flex-shrink-0"
                      aria-label={`${t('favorites.remove')} ${route.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

