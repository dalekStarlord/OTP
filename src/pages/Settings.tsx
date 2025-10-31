/**
 * Settings page - User preferences and accessibility options
 */

import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/appStore';
import { Sun, Moon, Languages, Type, Eye } from 'lucide-react';

export function Settings() {
  const { t, i18n } = useTranslation();
  const { preferences, setPreferences } = useAppStore();

  const themes = [
    { id: 'light', icon: Sun, label: t('settings.themeLight') },
    { id: 'dark', icon: Moon, label: t('settings.themeDark') },
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{t('settings.title')}</h1>

        {/* Appearance */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-5 md:p-6 space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
            {t('settings.appearance')}
          </h2>

          {/* Theme */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('settings.theme')}
            </label>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {themes.map((theme) => {
                const IconComponent = theme.icon;
                return (
                  <button
                    key={theme.id}
                    onClick={() => setPreferences({ theme: theme.id as 'light' | 'dark' })}
                    className={`p-2.5 sm:p-3 rounded-lg border-2 transition-all ${
                      preferences.theme === theme.id
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900 dark:border-blue-400 text-gray-900 dark:text-gray-100'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1" />
                    <div className="text-xs sm:text-sm font-medium">{theme.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Languages className="h-3 w-3 sm:h-4 sm:w-4" />
              {t('settings.language')}
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    i18n.changeLanguage(lang.code);
                    setPreferences({ language: lang.code as any });
                  }}
                  className={`p-2 sm:p-3 rounded-lg border-2 text-xs sm:text-sm font-medium transition-all ${
                    preferences.language === lang.code
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 dark:border-blue-400'
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>

          {/* Text size */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Type className="h-3 w-3 sm:h-4 sm:w-4" />
              {t('settings.textSize')}
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {textSizes.map((size) => (
                <button
                  key={size.id}
                  onClick={() => setPreferences({ textSize: size.id as any })}
                  className={`p-2 sm:p-3 rounded-lg border-2 transition-all ${
                    preferences.textSize === size.id
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900 dark:border-blue-400 text-gray-900 dark:text-gray-100'
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  <div className={`font-medium text-xs sm:${size.className}`}>{size.label}</div>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

