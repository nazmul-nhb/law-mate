import { useTranslation } from 'react-i18next';
import { TooltipSimple } from '@/components/ui/tooltip-simple';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/stores/settings.store';

export function LanguageToggle() {
	const { i18n } = useTranslation();
	const { language, setLanguage } = useSettingsStore();

	const toggleLanguage = () => {
		const nextLang = language === 'bn' ? 'en' : 'bn';
		setLanguage(nextLang);
		i18n.changeLanguage(nextLang);
	};

	const tooltipText = language === 'bn' ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন';

	return (
		<TooltipSimple content={tooltipText}>
			<button
				className={cn(
					'rounded-md px-2.5 py-2 text-sm font-semibold text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer',
					{
						'text-xs': language === 'bn',
					}
				)}
				onClick={toggleLanguage}
				type="button"
			>
				{language === 'bn' ? 'EN' : 'বাং'}
			</button>
		</TooltipSimple>
	);
}
