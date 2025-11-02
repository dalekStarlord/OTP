/**
 * Service Advisories page
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getServiceAdvisories } from '../lib/api';
import { useAppStore } from '../store/appStore';
import type { ServiceAdvisory } from '../lib/enhanced-types';
import { AlertTriangle, Info, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export function Advisories() {
  const { t } = useTranslation();
  const { setStatus } = useAppStore();
  const [advisories, setAdvisories] = useState<ServiceAdvisory[]>([]);

  useEffect(() => {
    const fetchAdvisories = async () => {
      setStatus({ fetching: true });
      try {
        const data = await getServiceAdvisories();
        setAdvisories(data);
      } catch (error) {
        console.error('Error fetching advisories:', error);
      } finally {
        setStatus({ fetching: false });
      }
    };

    fetchAdvisories();
  }, []);

  const getSeverityIcon = (severity: ServiceAdvisory['severity']) => {
    switch (severity) {
      case 'critical':
        return XCircle;
      case 'warning':
        return AlertTriangle;
      default:
        return Info;
    }
  };

  const getSeverityColor = (severity: ServiceAdvisory['severity']) => {
    switch (severity) {
      case 'critical':
        return 'border-red-600 bg-red-50';
      case 'warning':
        return 'border-yellow-600 bg-yellow-50';
      default:
        return 'border-blue-600 bg-blue-50';
    }
  };

  const getTypeLabel = (type: ServiceAdvisory['type']) => {
    switch (type) {
      case 'closure':
        return t('advisories.routeClosed');
      case 'reroute':
        return t('advisories.reroute');
      case 'delay':
        return t('advisories.delay');
      case 'fareChange':
        return t('advisories.fareChange');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
          {t('advisories.title')}
        </h1>

        {advisories.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 sm:p-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-600">
            <Info className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">{t('advisories.noAdvisories')}</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {advisories.map((advisory) => {
              const IconComponent = getSeverityIcon(advisory.severity);
              
              return (
                <motion.div
                  key={advisory.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-xl p-4 sm:p-5 md:p-6 shadow-md border-2 ${getSeverityColor(
                    advisory.severity
                  )}`}
                >
                  <div className="flex gap-2 sm:gap-3 md:gap-4">
                    <div className="flex-shrink-0">
                      <IconComponent
                        className={`h-5 w-5 sm:h-6 sm:w-6 ${
                          advisory.severity === 'critical'
                            ? 'text-red-600 dark:text-red-500'
                            : advisory.severity === 'warning'
                            ? 'text-yellow-600 dark:text-yellow-500'
                            : 'text-blue-600 dark:text-blue-500'
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                        <span
                          className={`inline-block px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-semibold ${
                            advisory.severity === 'critical'
                              ? 'bg-red-600 text-white'
                              : advisory.severity === 'warning'
                              ? 'bg-yellow-600 text-white'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          {getTypeLabel(advisory.type)}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-1.5 sm:mb-2">
                        {advisory.title}
                      </h3>

                      <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">{advisory.description}</p>

                      {/* Affected routes */}
                      {advisory.affectedRoutes.length > 0 && (
                        <div className="mb-2 sm:mb-3">
                          <div className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-1.5">
                            Affected routes:
                          </div>
                          <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {advisory.affectedRoutes.map((route, index) => (
                              <span
                                key={index}
                                className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs sm:text-sm"
                              >
                                {route}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Alternatives */}
                      {advisory.alternatives && advisory.alternatives.length > 0 && (
                        <div className="mt-2 sm:mt-3 p-2.5 sm:p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                          <div className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                            {t('advisories.viewAlternatives')}:
                          </div>
                          <ul className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 space-y-0.5 sm:space-y-1">
                            {advisory.alternatives.map((alt, index) => (
                              <li key={index}>• {alt}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Timing */}
                      <div className="mt-2 sm:mt-3 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                        {advisory.endTime && (
                          <span>
                            Until {new Date(advisory.endTime).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

