import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_FONT_SIZE, DEFAULT_LANGUAGE, DEFAULT_THEME } from '@/constants/app';
import type { Language, Theme } from '@/types/common.types';

interface SettingsState {
	theme: Theme;
	language: Language;
	fontSize: number;
	lastSyncedAt: string | null;
	autoSync: boolean;
	setTheme: (theme: Theme) => void;
	setLanguage: (language: Language) => void;
	setFontSize: (size: number) => void;
	setLastSyncedAt: (time: string | null) => void;
	setAutoSync: (autoSync: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
	persist(
		(set) => ({
			theme: DEFAULT_THEME,
			language: DEFAULT_LANGUAGE,
			fontSize: DEFAULT_FONT_SIZE,
			lastSyncedAt: null,
			autoSync: false,

			setTheme: (theme) => set({ theme }),
			setLanguage: (language) => set({ language }),
			setFontSize: (fontSize) => set({ fontSize }),
			setLastSyncedAt: (lastSyncedAt) => set({ lastSyncedAt }),
			setAutoSync: (autoSync) => set({ autoSync }),
		}),
		{
			name: 'law-mate-settings-store',
			partialize: ({ theme, language, fontSize, lastSyncedAt, autoSync }) => ({
				theme,
				language,
				fontSize,
				lastSyncedAt,
				autoSync,
			}),
		}
	)
);
