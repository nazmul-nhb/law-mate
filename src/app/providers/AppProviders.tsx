import { useEffect } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import '@/i18n';
import { useSettingsStore } from '@/stores/settings.store';

function ThemeApplier() {
	const theme = useSettingsStore((s) => s.theme);

	useEffect(() => {
		const root = document.documentElement;

		const applyTheme = (isDark: boolean) => {
			root.classList.toggle('dark', isDark);
		};

		if (theme === 'system') {
			const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
			applyTheme(mediaQuery.matches);

			const handler = (e: MediaQueryListEvent) => applyTheme(e.matches);
			mediaQuery.addEventListener('change', handler);
			return () => mediaQuery.removeEventListener('change', handler);
		}

		applyTheme(theme === 'dark');
	}, [theme]);

	return null;
}

function FontSizeApplier() {
	const fontSize = useSettingsStore((s) => s.fontSize);

	useEffect(() => {
		document.documentElement.style.fontSize = `${fontSize}px`;
	}, [fontSize]);

	return null;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
	return (
		<TooltipProvider>
			<ThemeApplier />
			<FontSizeApplier />
			{children}
		</TooltipProvider>
	);
}
