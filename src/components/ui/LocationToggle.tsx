/**
 * LocationToggle - Button to start/stop real-time location tracking
 */

import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/appStore';
import { MapPin, MapPinOff } from 'lucide-react';
import { cn } from '../../lib/utils';

export function LocationToggle() {
  const { t } = useTranslation();
  const {
    isTrackingLocation,
    setIsTrackingLocation,
    status,
  } = useAppStore();

  const handleToggle = () => {
    setIsTrackingLocation(!isTrackingLocation);
  };

  const isLoading = status.gpsLock && !isTrackingLocation;

  return (
    <button
      onClick={handleToggle}
      className={cn(
        'absolute bottom-20 right-4 z-[1000]',
        'flex items-center justify-center',
        'w-12 h-12 rounded-full shadow-lg',
        'transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        isTrackingLocation
          ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
          : isLoading
          ? 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-400 animate-pulse'
          : 'bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
      )}
      aria-label={
        isTrackingLocation
          ? t('location.stopTracking')
          : t('location.startTracking')
      }
      title={
        isTrackingLocation
          ? t('location.stopTracking')
          : t('location.startTracking')
      }
    >
      {isTrackingLocation ? (
        <MapPin size={20} className="animate-pulse" />
      ) : (
        <MapPinOff size={20} />
      )}
    </button>
  );
}

