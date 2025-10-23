/**
 * Live Tracker page - Real-time vehicle tracking
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { getLiveVehicles } from '../lib/api';
import { useAppStore } from '../store/appStore';
import type { LiveVehicle } from '../lib/enhanced-types';
import { CDO_CENTER } from '../lib/constants';
import { getRelativeTime, getModeColor } from '../lib/utils';
import { Bus, Navigation, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import 'leaflet/dist/leaflet.css';

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
        console.error('Error fetching live vehicles:', error);
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
    <div className="h-screen w-full relative overflow-hidden bg-gray-50 flex flex-col md:flex-row">
      {/* Map */}
      <div className="flex-1 relative">
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
      <div className="w-full md:w-80 bg-white md:h-full overflow-y-auto shadow-xl">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {t('live.title')}
          </h1>

          {/* Vehicle list */}
          <div className="space-y-3">
            {vehicles.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Bus className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>{t('live.noVehicles')}</p>
              </div>
            )}

            {vehicles.map((vehicle) => (
              <motion.button
                key={vehicle.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedVehicle(vehicle)}
                className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                  selectedVehicle?.id === vehicle.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-400'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      {vehicle.route}
                    </div>
                    <div className="text-sm text-gray-600">
                      {vehicle.headsign}
                    </div>
                    {vehicle.nextStop && (
                      <div className="text-xs text-gray-500 mt-1">
                        Next: {vehicle.nextStop}
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-3 w-3" />
                      <span>{getRelativeTime(vehicle.eta, i18n.language)}</span>
                    </div>
                    <div className={`text-xs mt-1 ${getCongestionColor(vehicle.congestion)}`}>
                      {vehicle.congestion !== 'none' && `${vehicle.congestion} traffic`}
                    </div>
                  </div>
                </div>

                {/* Speed indicator */}
                <div className="mt-2 flex items-center gap-2">
                  <Navigation className="h-3 w-3 text-gray-400" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((vehicle.speed / 15) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">
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

