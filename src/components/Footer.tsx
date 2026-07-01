import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router';
import { digitToBangla } from 'toolbox-x';
import { useSettingsStore } from '@/stores/settings.store';

export default function Footer() {
	const { t } = useTranslation();
	const language = useSettingsStore((s) => s.language);

	const year = new Date().getFullYear();

	return (
		<footer className="border-t border-border bg-background/50">
			<div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 py-6 text-xs text-muted-foreground sm:flex-row">
				<div>
					&copy; {language === 'bn' ? digitToBangla(year) : String(year)}{' '}
					{t('app.name')} - {t('footer.rights')}
				</div>
				<div className="flex sm:items-center justify-center gap-4 flex-wrap">
					<NavLink className="hover:text-foreground transition-colors" to="/privacy">
						{t('footer.privacy')}
					</NavLink>
					<NavLink className="hover:text-foreground transition-colors" to="/terms">
						{t('footer.terms')}
					</NavLink>
					<a
						className="hover:text-foreground transition-colors"
						href="https://nazmul-nhb.dev"
						rel="noopener"
						target="_blank"
					>
						{t('footer.created.by')}
					</a>
				</div>
			</div>
		</footer>
	);
}
