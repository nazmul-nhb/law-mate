import { useTranslation } from 'react-i18next';

export function TermsPage() {
	const { t } = useTranslation();

	return (
		<div className="mx-auto max-w-2xl space-y-6">
			<h1 className="text-2xl font-bold text-foreground">{t('legal.terms.title')}</h1>
			<p className="text-xs text-muted-foreground">
				{t('legal.last.updated')}: {t('legal.last.updated.date')}
			</p>

			<section className="space-y-2">
				<h2 className="text-lg font-semibold text-foreground">
					{t('legal.terms.acceptance.title')}
				</h2>
				<p className="text-sm leading-relaxed text-muted-foreground">
					{t('legal.terms.acceptance.body')}
				</p>
			</section>

			<section className="space-y-2">
				<h2 className="text-lg font-semibold text-foreground">
					{t('legal.terms.description.title')}
				</h2>
				<p className="text-sm leading-relaxed text-muted-foreground">
					{t('legal.terms.description.body')}
				</p>
			</section>

			<section className="space-y-2">
				<h2 className="text-lg font-semibold text-foreground">
					{t('legal.terms.accounts.title')}
				</h2>
				<p className="text-sm leading-relaxed text-muted-foreground">
					{t('legal.terms.accounts.body')}
				</p>
			</section>

			<section className="space-y-2">
				<h2 className="text-lg font-semibold text-foreground">
					{t('legal.terms.content.title')}
				</h2>
				<p className="text-sm leading-relaxed text-muted-foreground">
					{t('legal.terms.content.body')}
				</p>
			</section>

			<section className="space-y-2">
				<h2 className="text-lg font-semibold text-foreground">
					{t('legal.terms.termination.title')}
				</h2>
				<p className="text-sm leading-relaxed text-muted-foreground">
					{t('legal.terms.termination.body')}
				</p>
			</section>

			<section className="space-y-2">
				<h2 className="text-lg font-semibold text-foreground">
					{t('legal.terms.liability.title')}
				</h2>
				<p className="text-sm leading-relaxed text-muted-foreground">
					{t('legal.terms.liability.body')}
				</p>
			</section>

			<section className="space-y-2">
				<h2 className="text-lg font-semibold text-foreground">
					{t('legal.terms.changes.title')}
				</h2>
				<p className="text-sm leading-relaxed text-muted-foreground">
					{t('legal.terms.changes.body')}
				</p>
			</section>
		</div>
	);
}
