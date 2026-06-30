import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import bn from '@/i18n/bn';
import en from '@/i18n/en';
import { useSettingsStore } from '@/stores/settings.store';

const { language } = useSettingsStore.getState();

i18n.use(initReactI18next).init({
	resources: { bn, en },
	lng: language,
	fallbackLng: 'en',
	interpolation: {
		escapeValue: false,
	},
});

export default i18n;

export type I18Values = (typeof en)['translation'];
