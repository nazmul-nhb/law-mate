import { digitToBangla } from 'toolbox-x';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_FONT_SIZE, DEFAULT_LANGUAGE, DEFAULT_THEME } from '@/constants/app';
import type { Language, Nullable, Theme } from '@/types/common.types';

interface SettingsState {
	theme: Theme;
	language: Language;
	fontSize: number;
	lastSyncedAt: Nullable<string>;
	autoSync: boolean;
	localizeNumber: (value: number | string) => string;
	setTheme: (theme: Theme) => void;
	setLanguage: (language: Language) => void;
	setFontSize: (size: number) => void;
	setLastSyncedAt: (time: Nullable<string>) => void;
	setAutoSync: (autoSync: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
	persist(
		(set, get) => ({
			theme: DEFAULT_THEME,
			language: DEFAULT_LANGUAGE,
			fontSize: DEFAULT_FONT_SIZE,
			lastSyncedAt: null,
			autoSync: false,

			localizeNumber: (value) => {
				return get().language === 'bn' ? digitToBangla(value) : String(value);
			},

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
