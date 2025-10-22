/**
 * Service Advisories page
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getServiceAdvisories } from '../mocks/mockApi';
import { useAppStore } from '../store/appStore';
import type { ServiceAdvisory } from '../lib/enhanced-types';
import { AlertCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistance } from '../lib/utils';

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('advisories.title')}
        </h1>

        {advisories.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border-2 border-dashed border-gray-300">
            <Info className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-500">{t('advisories.noAdvisories')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {advisories.map((advisory) => {
              const IconComponent = getSeverityIcon(advisory.severity);
              
              return (
                <motion.div
                  key={advisory.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-xl p-6 shadow-md border-2 ${getSeverityColor(
                    advisory.severity
                  )}`}
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <IconComponent
                        className={`h-6 w-6 ${
                          advisory.severity === 'critical'
                            ? 'text-red-600'
                            : advisory.severity === 'warning'
                            ? 'text-yellow-600'
                            : 'text-blue-600'
                        }`}
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
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

                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {advisory.title}
                      </h3>

                      <p className="text-gray-700 mb-3">{advisory.description}</p>

                      {/* Affected routes */}
                      {advisory.affectedRoutes.length > 0 && (
                        <div className="mb-3">
                          <div className="text-sm font-medium text-gray-700 mb-1">
                            Affected routes:
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {advisory.affectedRoutes.map((route, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-white border border-gray-300 rounded text-sm"
                              >
                                {route}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Alternatives */}
                      {advisory.alternatives && advisory.alternatives.length > 0 && (
                        <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                          <div className="text-sm font-medium text-gray-700 mb-2">
                            {t('advisories.viewAlternatives')}:
                          </div>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {advisory.alternatives.map((alt, index) => (
                              <li key={index}>• {alt}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Timing */}
                      <div className="mt-3 text-xs text-gray-500">
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

