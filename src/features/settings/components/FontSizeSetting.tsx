import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { FONT_SIZES } from '@/constants/app';
import { useSettingsStore } from '@/stores/settings.store';

export function FontSizeSetting() {
	const { t } = useTranslation();
	const { fontSize, setFontSize } = useSettingsStore();

	return (
		<div className="flex flex-col gap-2">
			<Label className="text-sm font-medium w-fit">{t('settings.fontsize')}</Label>
			<div className="flex flex-wrap items-center gap-1 rounded-md border border-input p-0.5 max-w-full">
				{FONT_SIZES.map((size) => (
					<button
						className={`rounded px-2.5 py-1.5 text-xs font-semibold transition-colors ${
							fontSize === size
								? 'bg-primary text-primary-foreground'
								: 'text-muted-foreground hover:text-foreground hover:bg-accent'
						}`}
						key={size}
						onClick={() => setFontSize(size)}
						type="button"
					>
						{size}px
					</button>
				))}
			</div>
		</div>
	);
}
