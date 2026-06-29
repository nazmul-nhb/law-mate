import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { THEME_OPTIONS } from '@/constants/app';
import { useSettingsStore } from '@/stores/settings.store';
import type { Theme } from '@/types/common.types';

export function ThemeSetting() {
	const { t } = useTranslation();
	const { theme, setTheme } = useSettingsStore();

	return (
		<div className="flex items-center justify-between">
			<Label className="text-sm font-medium">{t('settings.theme')}</Label>
			<div className="flex items-center gap-1 rounded-md border border-input p-0.5">
				{THEME_OPTIONS.map((opt) => (
					<button
						className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
							theme === opt
								? 'bg-primary text-primary-foreground'
								: 'text-muted-foreground hover:text-foreground'
						}`}
						key={opt}
						onClick={() => setTheme(opt as Theme)}
						type="button"
					>
						{t(`settings.theme.${opt}`)}
					</button>
				))}
			</div>
		</div>
	);
}
