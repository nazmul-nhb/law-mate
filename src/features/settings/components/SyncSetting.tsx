import { Cloud, CloudOff, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { digitToBangla } from 'toolbox-x';
import { formatDate } from 'toolbox-x/date';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { syncService } from '@/services/sync.service';
import { useSettingsStore } from '@/stores/settings.store';
import { useUIStore } from '@/stores/ui.store';

export function SyncSetting() {
	const { t } = useTranslation();
	const { user } = useAuth();
	const { isSyncing } = useUIStore();
	const { lastSyncedAt, language } = useSettingsStore();

	const isSynced = window.navigator.onLine && !!user;

	const handleSync = async () => {
		if (user) {
			await syncService.sync();
		}
	};

	const formattedSyncTime = lastSyncedAt
		? formatDate({ date: lastSyncedAt, format: 'DD-MM-YYYY hh:mm:ss A' })
		: null;

	return (
		<div className="space-y-3">
			<Label className="text-sm font-medium">{t('settings.sync')}</Label>
			<div className="flex flex-col gap-3 rounded-md border border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex sm:flex-row flex-col sm:items-center gap-3">
					{isSynced ? (
						isSyncing ? (
							<Loader2 className="size-5 text-primary animate-spin" />
						) : (
							<Cloud className="size-5 text-emerald-500" />
						)
					) : (
						<CloudOff className="size-5 text-muted-foreground" />
					)}
					<div>
						<p className="text-sm font-medium text-foreground">
							{t('settings.sync.status')}
						</p>
						<p className="text-xs text-muted-foreground">
							{isSynced
								? isSyncing
									? t('common.loading')
									: `${user.email} (${t('settings.sync.connected')})`
								: t('settings.sync.not.connected')}
						</p>
						{user && formattedSyncTime && !isSyncing && (
							<p className="text-xs text-muted-foreground mt-0.5">
								{t('settings.sync.label')}:{' '}
								{language === 'bn'
									? digitToBangla(formattedSyncTime)
											.replace('PM', 'অপরাহ্ন')
											.replace('AM', 'পূর্বাহ্ন')
									: formattedSyncTime}
							</p>
						)}
					</div>
				</div>

				{isSynced ? (
					<Button
						disabled={isSyncing}
						onClick={handleSync}
						size="sm"
						variant="outline"
					>
						{isSyncing && <Loader2 className="mr-2 size-3.5 animate-spin" />}
						{t('settings.sync.manual')}
					</Button>
				) : null}
			</div>
		</div>
	);
}
