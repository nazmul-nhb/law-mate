import { create } from 'zustand';
import { DEFAULT_LANGUAGE, DEFAULT_THEME } from '@/constants/app';
import type { Language, Theme } from '@/types/common.types';

interface SettingsState {
	theme: Theme;
	language: Language;
	fontSize: number;
	setTheme: (theme: Theme) => void;
	setLanguage: (language: Language) => void;
	setFontSize: (size: number) => void;
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

const getStoredFontSize = (): number => {
	const stored = localStorage.getItem('law-mate-font-size');
	if (stored) {
		const parsed = Number.parseInt(stored, 10);
		if (!Number.isNaN(parsed)) return parsed;
	}
	return 16; // default font size
};

export const useSettingsStore = create<SettingsState>((set) => ({
	theme: getStoredTheme(),
	language: getStoredLanguage(),
	fontSize: getStoredFontSize(),

	setTheme: (theme) => {
		localStorage.setItem('law-mate-theme', theme);
		set({ theme });
	},

	setLanguage: (language) => {
		localStorage.setItem('law-mate-language', language);
		set({ language });
	},

	setFontSize: (fontSize) => {
		localStorage.setItem('law-mate-font-size', String(fontSize));
		set({ fontSize });
	},
}));
