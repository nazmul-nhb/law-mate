import { useTranslation } from 'react-i18next';

export function PrivacyPage() {
	const { t } = useTranslation();

	return (
		<div className="mx-auto max-w-2xl space-y-6">
			<h1 className="text-2xl font-bold text-foreground">{t('legal.privacy.title')}</h1>
			<p className="text-xs text-muted-foreground">
				{t('legal.last.updated')}: {t('legal.last.updated.date')}
			</p>

			<section className="space-y-2">
				<h2 className="text-lg font-semibold text-foreground">
					{t('legal.privacy.intro.title')}
				</h2>
				<p className="text-sm leading-relaxed text-muted-foreground">
					{t('legal.privacy.intro.body')}
				</p>
			</section>

			<section className="space-y-2">
				<h2 className="text-lg font-semibold text-foreground">
					{t('legal.privacy.collect.title')}
				</h2>
				<ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground">
					<li>{t('legal.privacy.collect.email')}</li>
					<li>{t('legal.privacy.collect.name')}</li>
					<li>{t('legal.privacy.collect.avatar')}</li>
					<li>{t('legal.privacy.collect.notes')}</li>
				</ul>
			</section>

			<section className="space-y-2">
				<h2 className="text-lg font-semibold text-foreground">
					{t('legal.privacy.use.title')}
				</h2>
				<ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground">
					<li>{t('legal.privacy.use.auth')}</li>
					<li>{t('legal.privacy.use.sync')}</li>
					<li>{t('legal.privacy.use.improve')}</li>
				</ul>
			</section>

			<section className="space-y-2">
				<h2 className="text-lg font-semibold text-foreground">
					{t('legal.privacy.storage.title')}
				</h2>
				<p className="text-sm leading-relaxed text-muted-foreground">
					{t('legal.privacy.storage.body')}
				</p>
			</section>

			<section className="space-y-2">
				<h2 className="text-lg font-semibold text-foreground">
					{t('legal.privacy.thirdparty.title')}
				</h2>
				<p className="text-sm leading-relaxed text-muted-foreground">
					{t('legal.privacy.thirdparty.body')}
				</p>
			</section>

			<section className="space-y-2">
				<h2 className="text-lg font-semibold text-foreground">
					{t('legal.privacy.contact.title')}
				</h2>
				<p className="text-sm leading-relaxed text-muted-foreground">
					{t('legal.privacy.contact.body')}
				</p>
			</section>
		</div>
	);
}
