/**
 * Favorites page - Saved places and routes
 */

import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/appStore';
import { Star, Trash2, MapPin, Route, Home, Briefcase, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('favorites.title')}
        </h1>

        {/* Saved Places */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            {t('favorites.places')}
          </h2>

          {savedPlaces.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border-2 border-dashed border-gray-300">
              <Star className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-500">{t('favorites.noPlaces')}</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {savedPlaces.map((place) => {
                const IconComponent = getPlaceIcon(place.type);
                
                return (
                  <motion.div
                    key={place.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl p-4 shadow-md border border-gray-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3 flex-1">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <IconComponent className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900">{place.name}</h3>
                          <p className="text-sm text-gray-600 truncate">{place.address}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(place.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => removeSavedPlace(place.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        aria-label={`${t('favorites.remove')} ${place.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Route className="h-5 w-5 text-blue-600" />
            {t('favorites.routes')}
          </h2>

          {savedRoutes.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border-2 border-dashed border-gray-300">
              <Route className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-500">{t('favorites.noRoutes')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedRoutes.map((route) => (
                <motion.div
                  key={route.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl p-4 shadow-md border border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{route.name}</h3>
                      
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4 text-green-600" />
                          <span>{route.from.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4 text-red-600" />
                          <span>{route.to.name}</span>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                        <span>Used {route.frequency} times</span>
                        <span>{new Date(route.savedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeSavedRoute(route.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      aria-label={`${t('favorites.remove')} ${route.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
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

