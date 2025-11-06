/**
 * Live Tracker page - Real-time vehicle tracking
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { getLiveVehicles } from '../lib/api';
import { useAppStore } from '../store/appStore';
import type { LiveVehicle } from '../lib/enhanced-types';
import { CDO_CENTER } from '../lib/constants';
import { getRelativeTime } from '../lib/utils';
import { Bus, Navigation, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import 'leaflet/dist/leaflet.css';
import { logger } from '../lib/logger';

export function LiveTracker() {
  const { t, i18n } = useTranslation();
  const { setStatus } = useAppStore();
  const [vehicles, setVehicles] = useState<LiveVehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<LiveVehicle | null>(null);

  // Fetch live vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      setStatus({ fetching: true });
      try {
        const data = await getLiveVehicles();
        setVehicles(data);
      } catch (error) {
        logger.error('Error fetching live vehicles', error);
      } finally {
        setStatus({ fetching: false });
      }
    };

    fetchVehicles();
    
    // Update every 10 seconds
    const interval = setInterval(fetchVehicles, 10000);
    return () => clearInterval(interval);
  }, []);

  const getCongestionColor = (congestion: string) => {
    switch (congestion) {
      case 'heavy':
        return 'text-red-600';
      case 'moderate':
        return 'text-yellow-600';
      case 'light':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="h-screen w-full relative overflow-hidden bg-gray-50 dark:bg-gray-900 flex flex-col lg:flex-row">
      {/* Map */}
      <div className="flex-1 relative h-64 sm:h-96 lg:h-full">
        <MapContainer
          center={[CDO_CENTER.lat, CDO_CENTER.lon]}
          zoom={13}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {vehicles.map((vehicle) => {
            const icon = new Icon({
              iconUrl: `data:image/svg+xml;base64,${btoa(`
                <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="14" fill="#3b82f6" stroke="white" stroke-width="2"/>
                  <path d="M16 8 L16 12 M8 16 L12 16 M16 20 L16 24 M20 16 L24 16" stroke="white" stroke-width="2"/>
                </svg>
              `)}`,
              iconSize: [32, 32],
              iconAnchor: [16, 16],
            });

            return (
              <Marker
                key={vehicle.id}
                position={[vehicle.position.lat, vehicle.position.lon]}
                icon={icon}
                eventHandlers={{
                  click: () => setSelectedVehicle(vehicle),
                }}
              >
                <Popup>
                  <div className="p-2">
                    <div className="font-bold">{vehicle.route}</div>
                    <div className="text-sm text-gray-600">{vehicle.headsign}</div>
                    <div className="text-sm mt-1">
                      ETA: {getRelativeTime(vehicle.eta, i18n.language)}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-80 xl:w-96 bg-white dark:bg-gray-800 lg:h-full overflow-y-auto shadow-xl">
        <div className="p-3 sm:p-4 md:p-5">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
            {t('live.title')}
          </h1>

          {/* Vehicle list */}
          <div className="space-y-2 sm:space-y-3">
            {vehicles.length === 0 && (
              <div className="text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400">
                <Bus className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm sm:text-base">{t('live.noVehicles')}</p>
              </div>
            )}

            {vehicles.map((vehicle) => (
              <motion.button
                key={vehicle.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedVehicle(vehicle)}
                className={`w-full p-2.5 sm:p-3 rounded-lg border-2 text-left transition-all ${
                  selectedVehicle?.id === vehicle.id
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400'
                    : 'border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                }`}
              >
                <div className="flex items-start justify-between gap-2 sm:gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100 truncate">
                      {vehicle.route}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                      {vehicle.headsign}
                    </div>
                    {vehicle.nextStop && (
                      <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-500 mt-0.5 sm:mt-1 truncate">
                        Next: {vehicle.nextStop}
                      </div>
                    )}
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm">
                      <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      <span className="dark:text-gray-200">{getRelativeTime(vehicle.eta, i18n.language)}</span>
                    </div>
                    <div className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 ${getCongestionColor(vehicle.congestion)}`}>
                      {vehicle.congestion !== 'none' && `${vehicle.congestion} traffic`}
                    </div>
                  </div>
                </div>

                {/* Speed indicator */}
                <div className="mt-1.5 sm:mt-2 flex items-center gap-1.5 sm:gap-2">
                  <Navigation className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2">
                    <div
                      className="bg-blue-600 dark:bg-blue-500 h-1.5 sm:h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((vehicle.speed / 15) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 flex-shrink-0">
                    {Math.round(vehicle.speed * 3.6)} km/h
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

