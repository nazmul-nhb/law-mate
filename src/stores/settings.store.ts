import { create } from 'zustand';
import { DEFAULT_LANGUAGE, DEFAULT_THEME } from '@/constants/app';
import type { Language, Theme } from '@/types/common.types';

interface SettingsState {
	theme: Theme;
	language: Language;
	setTheme: (theme: Theme) => void;
	setLanguage: (language: Language) => void;
}

const getStoredTheme = (): Theme => {
	const stored = localStorage.getItem('law-mate-theme');
	if (stored === 'light' || stored === 'dark' || stored === 'system') {
		return stored;
	}
	return DEFAULT_THEME;
};

const getStoredLanguage = (): Language => {
	const stored = localStorage.getItem('law-mate-language');
	if (stored === 'bn' || stored === 'en') {
		return stored;
	}
	return DEFAULT_LANGUAGE;
};

export const useSettingsStore = create<SettingsState>((set) => ({
	theme: getStoredTheme(),
	language: getStoredLanguage(),

	setTheme: (theme) => {
		localStorage.setItem('law-mate-theme', theme);
		set({ theme });
	},

	setLanguage: (language) => {
		localStorage.setItem('law-mate-language', language);
		set({ language });
	},
}));
