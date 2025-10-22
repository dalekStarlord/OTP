/**
 * Mode toggle component for transport mode selection
 * Nielsen Heuristic #6: Recognition rather than recall
 */

import { useTranslation } from 'react-i18next';
import { Bus, Bike, Footprints, Ship } from 'lucide-react';
import { cn, getModeColor } from '../../lib/utils';
import { motion } from 'framer-motion';

interface ModeToggleProps {
  mode: string;
  state: 'include' | 'exclude' | 'prefer';
  onChange: (mode: string, state: 'include' | 'exclude' | 'prefer') => void;
  disabled?: boolean;
}

export function ModeToggle({ mode, state, onChange, disabled }: ModeToggleProps) {
  const { t } = useTranslation();

  const icons: Record<string, any> = {
    JEEPNEY: Bus,
    BUS: Bus,
    TRICYCLE: Bike,
    WALK: Footprints,
    FERRY: Ship,
  };

  const Icon = icons[mode] || Bus;
  const modeKey = mode.toLowerCase();

  const handleClick = () => {
    if (disabled) return;
    
    // Cycle through states: include -> prefer -> exclude -> include
    const nextState =
      state === 'include'
        ? 'prefer'
        : state === 'prefer'
        ? 'exclude'
        : 'include';
    
    onChange(mode, nextState);
  };

  const getStyles = () => {
    if (state === 'exclude') {
      return {
        bg: 'bg-gray-200',
        text: 'text-gray-500',
        border: 'border-gray-300',
        opacity: 'opacity-50',
      };
    }
    
    if (state === 'prefer') {
      return {
        bg: getModeColor(mode),
        text: 'text-white',
        border: 'border-blue-600',
        opacity: 'opacity-100',
        ring: 'ring-2 ring-blue-600 ring-offset-2',
      };
    }

    // include
    return {
      bg: getModeColor(mode),
      text: 'text-white',
      border: 'border-transparent',
      opacity: 'opacity-100',
    };
  };

  const styles = getStyles();

  return (
    <motion.button
      whileTap={disabled ? {} : { scale: 0.95 }}
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'relative px-3 py-2 rounded-lg border-2 transition-all',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        'disabled:cursor-not-allowed',
        styles.bg,
        styles.text,
        styles.border,
        styles.opacity,
        styles.ring
      )}
      aria-label={`${t(`modes.${modeKey}`)}: ${state}`}
      aria-pressed={state !== 'exclude'}
      role="switch"
      aria-checked={state !== 'exclude'}
    >
      <div className="flex flex-col items-center gap-1">
        <Icon className="h-5 w-5" aria-hidden="true" />
        <span className="text-xs font-medium">
          {t(`modes.${modeKey}`)}
        </span>
      </div>

      {state === 'prefer' && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold"
          aria-label="Preferred"
        >
          ★
        </motion.div>
      )}

      {state === 'exclude' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-0.5 h-full bg-red-500 rotate-45 rounded" />
        </div>
      )}
    </motion.button>
  );
}

interface ModeToggleGroupProps {
  modes: Record<string, 'include' | 'exclude' | 'prefer'>;
  onChange: (mode: string, state: 'include' | 'exclude' | 'prefer') => void;
  disabled?: boolean;
}

export function ModeToggleGroup({ modes, onChange, disabled }: ModeToggleGroupProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        {t('settings.defaultModes')}
      </label>
      
      <div className="flex flex-wrap gap-2">
        {Object.entries(modes).map(([mode, state]) => (
          <ModeToggle
            key={mode}
            mode={mode}
            state={state}
            onChange={onChange}
            disabled={disabled}
          />
        ))}
      </div>

      <p className="text-xs text-gray-500">
        Tap once to prefer, twice to exclude, three times to include
      </p>
    </div>
  );
}

