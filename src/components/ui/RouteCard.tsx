/**
 * RouteCard component - shows itinerary summary
 * Nielsen Heuristic #8: Aesthetic and minimalist design
 */

import { useTranslation } from 'react-i18next';
import { Clock, ArrowRightLeft } from 'lucide-react';
import { cn, formatDuration, formatFare, getModeColor, getModeIcon, calculateTotalFare, calculateFareSavings } from '../../lib/utils';
import type { NormalizedItinerary, FareType } from '../../lib/types';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { getRouteColor } from '../../lib/polyline';

interface RouteCardProps {
  itinerary: NormalizedItinerary;
  itineraryIndex: number; // Add index to determine route color
  fareType?: FareType;
  selected?: boolean;
  onSelect?: () => void;
  onHover?: (hover: boolean) => void;
}

export function RouteCard({
  itinerary,
  itineraryIndex,
  fareType = 'regular',
  selected,
  onSelect,
  onHover,
}: RouteCardProps) {
  const { t, i18n } = useTranslation();
  
  // Get unique color for this route
  const routeColor = getRouteColor(itineraryIndex);

  // Calculate fare based on LTFRB matrix and fare type
  const fare = calculateTotalFare(itinerary, fareType);
  const savings = fareType === 'discount' ? calculateFareSavings(itinerary) : 0;

  const transitLegs = itinerary.legs.filter(leg => 
    ['JEEPNEY', 'BUS', 'TRICYCLE', 'FERRY', 'TRANSIT'].includes(leg.mode)
  );

  const handleClick = () => {
    if (onSelect) {
      onSelect();
    }
  };

  const startTime = new Date(itinerary.startTime);
  const endTime = new Date(itinerary.endTime);
  const walkingLegs = itinerary.legs.filter(leg => leg.mode === 'WALK');
  const totalWalkingDistance = walkingLegs.reduce((sum, leg) => sum + leg.distance, 0);
  const totalWalkingTime = walkingLegs.reduce((sum, leg) => sum + leg.duration, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onHoverStart={() => onHover?.(true)}
      onHoverEnd={() => onHover?.(false)}
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg shadow-sm border transition-all cursor-pointer overflow-hidden relative',
        selected
          ? 'ring-2 ring-offset-1'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-md'
      )}
      style={{
        borderColor: selected ? routeColor : undefined,
        ringColor: selected ? routeColor : undefined,
      }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`Route option: ${formatDuration(itinerary.duration, i18n.language)}, ₱${formatFare(fare)}`}
      aria-pressed={selected}
    >
      {/* Route color indicator bar */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: routeColor }}
      />
      
      <div className="p-3 pl-4">
        {/* Mobile-optimized layout (Sakay style) */}
        <div className="lg:hidden space-y-3">
          {/* Mode icons row */}
          <div className="flex items-center gap-2">
            {transitLegs.map((leg, index) => {
              const IconComponent = (LucideIcons as any)[
                getModeIcon(leg.mode).charAt(0).toUpperCase() + 
                getModeIcon(leg.mode).slice(1)
              ] || LucideIcons.Circle;
              
              const modeColors: Record<string, string> = {
                'JEEPNEY': 'bg-blue-500',
                'BUS': 'bg-purple-500',
                'TRICYCLE': 'bg-yellow-500',
                'FERRY': 'bg-cyan-500',
                'TRANSIT': 'bg-indigo-500',
              };
              
              // Display priority: vehicleName > lineName > mode
              const displayName = leg.mode === 'WALK'
                ? 'Walk'
                : (leg.vehicleName || leg.lineName?.split('-')[0] || leg.mode.slice(0, 4));
              
              return (
                <div key={index} className="flex flex-col items-center gap-1">
                  <div className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center text-white',
                    modeColors[leg.mode] || 'bg-gray-500'
                  )}>
                    <IconComponent className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <span className="text-[9px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    {displayName}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Timeline and times */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
            </span>
            
            {/* Timeline bar */}
            <div className="flex-1 relative h-1">
              <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-full">
                {transitLegs.map((leg, index) => {
                  const legDuration = leg.duration;
                  const totalDuration = itinerary.duration;
                  const widthPercent = (legDuration / totalDuration) * 100;
                  
                  const modeColors: Record<string, string> = {
                    'JEEPNEY': 'bg-blue-500',
                    'BUS': 'bg-purple-500',
                    'TRICYCLE': 'bg-yellow-500',
                    'FERRY': 'bg-cyan-500',
                    'TRANSIT': 'bg-indigo-500',
                  };
                  
                  return (
                    <div
                      key={index}
                      className={cn(
                        'absolute h-full rounded-full',
                        modeColors[leg.mode] || 'bg-gray-400'
                      )}
                      style={{
                        left: `${(leg.startTime ? (new Date(leg.startTime).getTime() - startTime.getTime()) / (itinerary.duration * 1000) * 100 : 0)}%`,
                        width: `${widthPercent}%`
                      }}
                    />
                  );
                })}
              </div>
              {/* Dots for connections */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-400 rounded-full"></div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-400 rounded-full"></div>
            </div>
            
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
            </span>
          </div>

          {/* Duration */}
          <div className="text-center text-xs text-gray-600 dark:text-gray-400">
            {formatDuration(itinerary.duration, i18n.language)}
          </div>

          {/* Bottom row: Fare and Walking info */}
          <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-2">
            <div className="flex items-center gap-1">
              <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
                ₱{formatFare(fare)}
              </span>
              {fareType === 'discount' && savings > 0 && (
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  (-₱{formatFare(savings)})
                </span>
              )}
            </div>
            
            {totalWalkingTime > 0 && (
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {Math.round(totalWalkingTime / 60)} min walk
              </div>
            )}
          </div>
        </div>

        {/* Desktop layout (original) */}
        <div className="hidden lg:block">
          <div className="flex items-center justify-between gap-2 sm:gap-3 md:gap-4">
          {/* Duration */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400 flex-shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <div className="font-bold text-sm sm:text-base md:text-lg text-gray-900 dark:text-gray-100 truncate">
                {formatDuration(itinerary.duration, i18n.language)}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">{t('results.totalTime')}</div>
            </div>
          </div>

          {/* Fare */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0 justify-end">
            <div className="text-right min-w-0">
              <div className="font-bold text-sm sm:text-base md:text-lg text-gray-900 dark:text-gray-100 truncate">
                ₱{formatFare(fare)}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
                {t('results.fare')}
                {fareType === 'discount' && savings > 0 && (
                  <span className="ml-1 text-green-600 dark:text-green-400 font-medium">
                    (-₱{formatFare(savings)})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Transfers */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
            <ArrowRightLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400 flex-shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <div className="font-bold text-sm sm:text-base md:text-lg text-gray-900 dark:text-gray-100">
                {itinerary.transfers}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
                {itinerary.transfers === 0
                  ? t('results.noTransfers')
                  : itinerary.transfers === 1
                  ? t('results.transfer')
                  : t('results.transfers')}
              </div>
            </div>
          </div>
        </div>

        {/* Mode chips */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 sm:mt-3">
          {transitLegs.map((leg, index) => {
            const IconComponent = (LucideIcons as any)[
              getModeIcon(leg.mode).charAt(0).toUpperCase() + 
              getModeIcon(leg.mode).slice(1)
            ] || LucideIcons.Circle;
            
            // Display priority: vehicleName > lineName > mode
            const displayName = leg.mode === 'WALK'
              ? 'Walk'
              : (leg.vehicleName || leg.lineName || t(`modes.${leg.mode.toLowerCase()}`));
            
            return (
              <div
                key={index}
                className={cn(
                  'px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-medium flex items-center gap-1',
                  getModeColor(leg.mode)
                )}
              >
                <IconComponent className="h-2.5 w-2.5 sm:h-3 sm:w-3" aria-hidden="true" />
                <span className="truncate max-w-[120px] sm:max-w-none">{displayName}</span>
              </div>
            );
          })}
        </div>

        </div>
      </div>
    </motion.div>
  );
}

