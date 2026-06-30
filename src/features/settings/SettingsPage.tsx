import { useTranslation } from 'react-i18next';
import { Separator } from '@/components/ui/separator';
import { APP_VERSION } from '@/constants/app';
import { AuthButton } from '@/features/auth/components/AuthButton';
import { FontSizeSetting } from '@/features/settings/components/FontSizeSetting';
import { LanguageSetting } from '@/features/settings/components/LanguageSetting';
import { StorageUsage } from '@/features/settings/components/StorageUsage';
import { SyncSetting } from '@/features/settings/components/SyncSetting';
import { ThemeSetting } from '@/features/settings/components/ThemeSetting';

export function SettingsPage() {
	const { t } = useTranslation();

	return (
		<div className="mx-auto max-w-2xl">
			<h1 className="mb-6 text-xl font-bold text-foreground">{t('settings.title')}</h1>

			<div className="space-y-6 rounded-lg border border-border bg-card p-6">
				<div className="flex items-center justify-between">
					<span className="text-sm font-medium text-foreground">
						{t('settings.auth')}
					</span>
					<AuthButton />
				</div>
				<Separator />
				<LanguageSetting />
				<Separator />
				<ThemeSetting />
				<Separator />
				<FontSizeSetting />
				<Separator />
				<SyncSetting />
				<Separator />
				<StorageUsage />
				<Separator />
				<div className="flex items-center justify-between">
					<span className="text-sm font-medium text-foreground">
						{t('settings.version')}
					</span>
					<span className="text-sm text-muted-foreground">v{APP_VERSION}</span>
				</div>
			</div>
		</div>
	);
}
