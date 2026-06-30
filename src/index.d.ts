import type en from './i18n/en';

declare module 'i18next' {
	interface CustomTypeOptions {
		defaultNS: 'translation';
		resources: typeof en;
	}
}

declare module 'react-i18next' {
	interface CustomTypeOptions {
		defaultNS: 'translation';
		resources: typeof en;
	}
}
