import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { SUPPORTED_LANGUAGES } from '@/constants/app';
import { useSettingsStore } from '@/stores/settings.store';
import type { Language } from '@/types/common.types';

export function LanguageSetting() {
	const { t, i18n } = useTranslation();
	const { language, setLanguage } = useSettingsStore();

	const handleChange = (lang: Language) => {
		setLanguage(lang);
		i18n.changeLanguage(lang);
	};

	return (
		<div className="flex items-center justify-between">
			<Label className="text-sm font-medium">{t('settings.language')}</Label>
			<div className="flex items-center gap-1 rounded-md border border-input p-0.5">
				{SUPPORTED_LANGUAGES.map((lang) => (
					<button
						className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
							language === lang
								? 'bg-primary text-primary-foreground'
								: 'text-muted-foreground hover:text-foreground'
						}`}
						key={lang}
						onClick={() => handleChange(lang)}
						type="button"
					>
						{t(`settings.language.${lang}`)}
					</button>
				))}
			</div>
		</div>
	);
}
