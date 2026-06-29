import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@/stores/settings.store';

export function LanguageToggle() {
	const { i18n } = useTranslation();
	const { language, setLanguage } = useSettingsStore();

	const toggleLanguage = () => {
		const nextLang = language === 'bn' ? 'en' : 'bn';
		setLanguage(nextLang);
		i18n.changeLanguage(nextLang);
	};

	return (
		<button
			className="rounded-md px-2.5 py-2 text-sm font-semibold text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
			onClick={toggleLanguage}
			title={language === 'bn' ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
			type="button"
		>
			{language === 'bn' ? 'EN' : 'বাং'}
		</button>
	);
}
