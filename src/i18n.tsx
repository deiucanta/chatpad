import i18n from "i18next";
import {initReactI18next} from "react-i18next";
import LanguageDetector from 'i18next-browser-languagedetector';
import * as en from './assets/i18n/en.json';
import * as fr from './assets/i18n/fr.json';

export const resources = {
    en,
    fr
};

i18n
    .use(initReactI18next)
    .use(LanguageDetector)
    .init({
        resources,
        fallbackLng: "en",
        interpolation: {
            escapeValue: false
        }
    });
export default i18n;