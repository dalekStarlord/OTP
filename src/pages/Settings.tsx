/**
 * Settings page - User preferences and accessibility options
 */

import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/appStore';
import { Sun, Moon, Monitor, Languages, Type, Eye, Zap, Bell, Info } from 'lucide-react';
import { ModeToggleGroup } from '../components/ui/ModeToggle';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';

export function Settings() {
  const { t, i18n } = useTranslation();
  const { preferences, setPreferences, setHelpDialogOpen } = useAppStore();

  const themes = [
    { id: 'light', icon: Sun, label: t('settings.themeLight') },
    { id: 'dark', icon: Moon, label: t('settings.themeDark') },
    { id: 'auto', icon: Monitor, label: t('settings.themeAuto') },
  ];

  const languages = [
    { code: 'en', name: t('settings.languages.en') },
    { code: 'fil', name: t('settings.languages.fil') },
    { code: 'ceb', name: t('settings.languages.ceb') },
  ];

  const textSizes = [
    { id: 'small', label: 'Small', className: 'text-sm' },
    { id: 'medium', label: 'Medium', className: 'text-base' },
    { id: 'large', label: 'Large', className: 'text-lg' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('settings.title')}</h1>

        {/* Appearance */}
        <section className="bg-white rounded-xl shadow-md p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Eye className="h-5 w-5" />
            {t('settings.appearance')}
          </h2>

          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('settings.theme')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {themes.map((theme) => {
                const IconComponent = theme.icon;
                return (
                  <button
                    key={theme.id}
                    onClick={() => setPreferences({ theme: theme.id as any })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      preferences.theme === theme.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    <IconComponent className="h-5 w-5 mx-auto mb-1" />
                    <div className="text-sm font-medium">{theme.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Languages className="h-4 w-4" />
              {t('settings.language')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    i18n.changeLanguage(lang.code);
                    setPreferences({ language: lang.code as any });
                  }}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    preferences.language === lang.code
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Accessibility */}
        <section className="bg-white rounded-xl shadow-md p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Eye className="h-5 w-5" />
            {t('settings.accessibility')}
          </h2>

          {/* Text size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Type className="h-4 w-4" />
              {t('settings.textSize')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {textSizes.map((size) => (
                <button
                  key={size.id}
                  onClick={() => setPreferences({ textSize: size.id as any })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    preferences.textSize === size.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-400'
                  }`}
                >
                  <div className={`font-medium ${size.className}`}>{size.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* High contrast */}
          <label className="flex items-center justify-between p-3 rounded-lg border-2 border-gray-300 cursor-pointer hover:border-blue-400">
            <span className="font-medium text-gray-700">
              {t('settings.highContrast')}
            </span>
            <input
              type="checkbox"
              checked={preferences.highContrast}
              onChange={(e) => setPreferences({ highContrast: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
          </label>

          {/* Reduced motion */}
          <label className="flex items-center justify-between p-3 rounded-lg border-2 border-gray-300 cursor-pointer hover:border-blue-400">
            <span className="font-medium text-gray-700 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              {t('settings.reducedMotion')}
            </span>
            <input
              type="checkbox"
              checked={preferences.reducedMotion}
              onChange={(e) => setPreferences({ reducedMotion: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
          </label>
        </section>

        {/* Preferences */}
        <section className="bg-white rounded-xl shadow-md p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('settings.preferences')}
          </h2>

          {/* Default modes */}
          <ModeToggleGroup
            modes={Object.fromEntries(
              preferences.preferredModes.map((mode) => [mode, 'include' as const])
            )}
            onChange={(mode, state) => {
              const updated = state === 'exclude'
                ? preferences.preferredModes.filter((m) => m !== mode)
                : [...new Set([...preferences.preferredModes, mode])];
              setPreferences({ preferredModes: updated });
            }}
          />
        </section>

        {/* Notifications */}
        <section className="bg-white rounded-xl shadow-md p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t('settings.notifications')}
          </h2>

          <label className="flex items-center justify-between p-3 rounded-lg border-2 border-gray-300 cursor-pointer hover:border-blue-400">
            <span className="font-medium text-gray-700">
              {t('settings.notifyDelays')}
            </span>
            <input
              type="checkbox"
              checked={preferences.notifications.delays}
              onChange={(e) =>
                setPreferences({
                  notifications: { ...preferences.notifications, delays: e.target.checked },
                })
              }
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-lg border-2 border-gray-300 cursor-pointer hover:border-blue-400">
            <span className="font-medium text-gray-700">
              {t('settings.notifyAlternatives')}
            </span>
            <input
              type="checkbox"
              checked={preferences.notifications.alternatives}
              onChange={(e) =>
                setPreferences({
                  notifications: {
                    ...preferences.notifications,
                    alternatives: e.target.checked,
                  },
                })
              }
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
          </label>
        </section>

        {/* About */}
        <section className="bg-white rounded-xl shadow-md p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Info className="h-5 w-5" />
            {t('settings.about')}
          </h2>

          <div className="text-sm text-gray-600">
            <div className="flex justify-between py-2">
              <span>{t('settings.version')}</span>
              <span className="font-medium">0.3.0</span>
            </div>
          </div>

          <Button
            variant="outline"
            fullWidth
            onClick={() => setHelpDialogOpen(true)}
          >
            {t('settings.help')}
          </Button>
        </section>
      </div>
    </div>
  );
}

