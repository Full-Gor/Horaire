import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import fr from './locales/fr.json';
import en from './locales/en.json';
import ar from './locales/ar.json';
import es from './locales/es.json';
import ru from './locales/ru.json';
import zh from './locales/zh.json';
import ja from './locales/ja.json';

const resources = {
  fr: { translation: fr },
  en: { translation: en },
  ar: { translation: ar },
  es: { translation: es },
  ru: { translation: ru },
  zh: { translation: zh },
  ja: { translation: ja },
};

export const supportedLanguages = [
  { code: 'fr', name: 'Français', nativeName: 'Français' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
];

const getDeviceLanguage = (): string => {
  const deviceLocale = Localization.getLocales()[0]?.languageCode || 'fr';
  const supportedCodes = supportedLanguages.map(lang => lang.code);
  return supportedCodes.includes(deviceLocale) ? deviceLocale : 'fr';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getDeviceLanguage(),
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
