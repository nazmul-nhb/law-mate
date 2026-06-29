import { Monitor, Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TooltipSimple } from '@/components/ui/tooltip-simple';
import { useSettingsStore } from '@/stores/settings.store';
import type { Theme } from '@/types/common.types';

const THEME_ICONS: Record<Theme, React.ElementType> = {
	light: Sun,
	dark: Moon,
	system: Monitor,
};

export function ThemeToggle() {
	const { t } = useTranslation();
	const { theme, setTheme } = useSettingsStore();

	const themes: Theme[] = ['light', 'dark', 'system'];
	const currentIndex = themes.indexOf(theme);
	const Icon = THEME_ICONS[theme];

	const cycleTheme = () => {
		const nextIndex = (currentIndex + 1) % themes.length;
		setTheme(themes[nextIndex]);
	};

	return (
		<TooltipSimple content={t(`settings.theme.${theme}`)}>
			<button
				aria-label={t(`settings.theme.${theme}`)}
				className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer"
				onClick={cycleTheme}
				type="button"
			>
				<Icon className="size-5" />
			</button>
		</TooltipSimple>
	);
}
