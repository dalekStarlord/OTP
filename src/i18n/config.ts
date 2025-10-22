import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import fil from './locales/fil.json';
import ceb from './locales/ceb.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fil: { translation: fil },
      ceb: { translation: ceb },
    },
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;

