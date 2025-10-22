/**
 * AppStatusBar - Nielsen Heuristic #1: Visibility of System Status
 * Shows real-time system status with 100-250ms response time
 */

import { useEffect, useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import {
  Wifi,
  WifiOff,
  Loader2,
  MapPin,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { STATUS_UPDATE_INTERVAL } from '../../lib/constants';

export function AppStatusBar() {
  const { t } = useTranslation();
  const { status } = useAppStore();
  const [show, setShow] = useState(false);

  // Show status bar when there's something to show
  useEffect(() => {
    const shouldShow =
      !status.online ||
      status.fetching ||
      status.gpsLock ||
      status.computing ||
      status.syncing ||
      status.error;

    // Small delay to avoid flicker on quick operations
    const timer = setTimeout(() => {
      setShow(shouldShow);
    }, STATUS_UPDATE_INTERVAL);

    return () => clearTimeout(timer);
  }, [status]);

  if (!show && !status.error) {
    return null;
  }

  const getStatusContent = () => {
    if (status.error) {
      return {
        icon: AlertCircle,
        text: status.error.message,
        color: 'bg-red-600 text-white',
        iconColor: 'text-red-100',
      };
    }

    if (!status.online) {
      return {
        icon: WifiOff,
        text: t('status.offline'),
        color: 'bg-yellow-600 text-white',
        iconColor: 'text-yellow-100',
      };
    }

    if (status.computing) {
      return {
        icon: Loader2,
        text: t('status.computing'),
        color: 'bg-blue-600 text-white',
        iconColor: 'text-blue-100',
        spin: true,
      };
    }

    if (status.gpsLock) {
      return {
        icon: MapPin,
        text: t('status.gpsLock'),
        color: 'bg-blue-600 text-white',
        iconColor: 'text-blue-100',
      };
    }

    if (status.fetching) {
      return {
        icon: Loader2,
        text: t('status.fetching'),
        color: 'bg-blue-600 text-white',
        iconColor: 'text-blue-100',
        spin: true,
      };
    }

    if (status.syncing) {
      return {
        icon: RefreshCw,
        text: t('status.syncing'),
        color: 'bg-blue-600 text-white',
        iconColor: 'text-blue-100',
        spin: true,
      };
    }

    return null;
  };

  const content = getStatusContent();
  if (!content) return null;

  const Icon = content.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.15 }}
        className="fixed top-0 left-0 right-0 z-[1200]"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className={cn('px-4 py-2 shadow-md', content.color)}>
          <div className="flex items-center justify-center gap-2">
            <Icon
              className={cn(
                'h-4 w-4',
                content.iconColor,
                content.spin && 'animate-spin'
              )}
              aria-hidden="true"
            />
            <span className="text-sm font-medium">{content.text}</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

