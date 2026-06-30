import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getFromLocalStorage } from 'toolbox-x/dom';
import { DEFAULT_LANGUAGE } from '@/constants/app';
import bn from '@/i18n/bn';
import en from '@/i18n/en';
import type { Language } from '@/types/common.types';

const storedLanguage = getFromLocalStorage<Language>('law-mate-language');

i18n.use(initReactI18next).init({
	resources: { bn, en },
	lng: storedLanguage || DEFAULT_LANGUAGE,
	fallbackLng: 'en',
	interpolation: {
		escapeValue: false,
	},
});

export default i18n;
