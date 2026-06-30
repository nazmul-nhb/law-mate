import { Cloud, CloudOff, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { digitToBangla } from 'toolbox-x';
import { formatDate } from 'toolbox-x/date';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { syncService } from '@/services/sync.service';
import { useSettingsStore } from '@/stores/settings.store';
import { useUIStore } from '@/stores/ui.store';

export function SyncSetting() {
	const { t } = useTranslation();
	const { user } = useAuth();
	const { isSyncing } = useUIStore();
	const { lastSyncedAt, autoSync, setAutoSync, language } = useSettingsStore();

	const isSynced = window.navigator.onLine && !!user;

	const handleSync = async () => {
		if (user) {
			await syncService.sync();
		}
	};

	const handleAutoSync = () => {
		setAutoSync(!autoSync);
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
						<p className="text-xs text-muted-foreground flex items-center min-h-4">
							{isSynced ? (
								isSyncing ? (
									<div className="flex flex-col gap-1.5">
										<span className="inline-block h-3 w-40 animate-pulse rounded bg-muted-foreground/20" />
										<span className="inline-block h-3 w-48 animate-pulse rounded bg-muted-foreground/20" />
									</div>
								) : (
									`${user.email} (${t('settings.sync.connected')})`
								)
							) : (
								t('settings.sync.not.connected')
							)}
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
					<div className="flex items-center gap-3">
						<div className="flex items-center space-x-2">
							<Label className="text-sm" htmlFor="auto-sync">
								{t('settings.sync.auto')}
							</Label>
							<Switch
								checked={autoSync}
								id="auto-sync"
								onCheckedChange={handleAutoSync}
								size="default"
							/>
						</div>
						<Button
							disabled={isSyncing}
							onClick={handleSync}
							size="sm"
							variant="outline"
						>
							{t('settings.sync.manual')}
						</Button>
					</div>
				) : null}
			</div>
		</div>
	);
}
