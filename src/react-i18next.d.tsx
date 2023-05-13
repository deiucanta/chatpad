// import the original type declarations
import 'react-i18next';
// import all namespaces (for the default language, only)
import { resources, defaultNS } from './i18n';

declare module 'i18next' {
    interface CustomTypeOptions {
        defaultNS: typeof defaultNS;
        resources: typeof resources['en'];
    }
}