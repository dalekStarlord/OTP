/**
 * RouteCard component - shows itinerary summary
 * Nielsen Heuristic #8: Aesthetic and minimalist design
 */

import { useTranslation } from 'react-i18next';
import { Clock, DollarSign, ArrowRightLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { cn, formatDuration, formatFare, getModeColor, getModeIcon, calculateTotalFare, calculateFareSavings } from '../../lib/utils';
import type { NormalizedItinerary, FareType } from '../../lib/types';
import { motion } from 'framer-motion';
import { useState } from 'react';
import * as LucideIcons from 'lucide-react';

interface RouteCardProps {
  itinerary: NormalizedItinerary;
  fareType?: FareType;
  selected?: boolean;
  onSelect?: () => void;
  onHover?: (hover: boolean) => void;
  showDetails?: boolean;
}

export function RouteCard({
  itinerary,
  fareType = 'regular',
  selected,
  onSelect,
  onHover,
  showDetails: initialShowDetails = false,
}: RouteCardProps) {
  const { t, i18n } = useTranslation();
  const [showDetails, setShowDetails] = useState(initialShowDetails);

  // Calculate fare based on LTFRB matrix and fare type
  const fare = calculateTotalFare(itinerary, fareType);
  const savings = fareType === 'discount' ? calculateFareSavings(itinerary) : 0;

  const transitLegs = itinerary.legs.filter(leg => 
    ['JEEPNEY', 'BUS', 'TRICYCLE', 'FERRY', 'TRANSIT'].includes(leg.mode)
  );

  const handleClick = () => {
    console.log('💳 RouteCard clicked:', itinerary.id, {
      legs: itinerary.legs.length,
      duration: itinerary.duration,
      hasPolylines: itinerary.legs.filter(l => l.polyline).length,
    });
    if (onSelect) {
      onSelect();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onHoverStart={() => onHover?.(true)}
      onHoverEnd={() => onHover?.(false)}
      className={cn(
        'bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 transition-all cursor-pointer',
        selected
          ? 'border-blue-600 ring-2 ring-blue-600 ring-offset-2 dark:ring-offset-gray-900'
          : 'border-gray-200 dark:border-gray-700 hover:border-blue-400'
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`Route option: ${formatDuration(itinerary.duration, i18n.language)}, ${formatFare(fare)}`}
      aria-pressed={selected}
    >
      <div className="p-4">
        {/* Summary row */}
        <div className="flex items-center justify-between gap-4">
          {/* Duration */}
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" aria-hidden="true" />
            <div>
              <div className="font-bold text-lg text-gray-900 dark:text-gray-100">
                {formatDuration(itinerary.duration, i18n.language)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{t('results.totalTime')}</div>
            </div>
          </div>

          {/* Fare */}
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="font-bold text-lg text-gray-900 dark:text-gray-100">
                {formatFare(fare)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {t('results.fare')}
                {fareType === 'discount' && savings > 0 && (
                  <span className="ml-1 text-green-600 dark:text-green-400 font-medium">
                    (-{formatFare(savings)})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Transfers */}
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" aria-hidden="true" />
            <div>
              <div className="font-bold text-lg text-gray-900 dark:text-gray-100">
                {itinerary.transfers}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
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
        <div className="flex flex-wrap gap-2 mt-3">
          {transitLegs.map((leg, index) => {
            const IconComponent = (LucideIcons as any)[
              getModeIcon(leg.mode).charAt(0).toUpperCase() + 
              getModeIcon(leg.mode).slice(1)
            ] || LucideIcons.Circle;
            
            return (
              <div
                key={index}
                className={cn(
                  'px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1',
                  getModeColor(leg.mode)
                )}
              >
                <IconComponent className="h-3 w-3" aria-hidden="true" />
                <span>{leg.lineName || t(`modes.${leg.mode.toLowerCase()}`)}</span>
              </div>
            );
          })}
        </div>

        {/* Expand/collapse button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowDetails(!showDetails);
          }}
          className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
        >
          {showDetails ? (
            <>
              <ChevronUp className="h-4 w-4" />
              {t('results.hideSteps')}
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              {t('results.viewSteps')}
            </>
          )}
        </button>

        {/* Detailed steps */}
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 space-y-3 border-t border-gray-200 dark:border-gray-700 pt-3"
          >
            {itinerary.legs.map((leg, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center',
                    getModeColor(leg.mode)
                  )}>
                    <span className="text-xs font-bold">{index + 1}</span>
                  </div>
                  {index < itinerary.legs.length - 1 && (
                    <div className="w-0.5 flex-1 bg-gray-300 my-1" />
                  )}
                </div>

                <div className="flex-1 pb-2">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {leg.mode === 'WALK'
                      ? t('steps.walk')
                      : `${t('steps.board')} ${leg.lineName || t(`modes.${leg.mode.toLowerCase()}`)}`}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {leg.from.name} → {leg.to.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {formatDuration(leg.duration, i18n.language)} • {(leg.distance / 1000).toFixed(1)} km
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

