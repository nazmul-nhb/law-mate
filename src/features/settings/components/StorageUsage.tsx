import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';

function formatBytes(bytes: number): string {
	if (bytes === 0) return '0 B';
	const units = ['B', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(1024));
	return `${(bytes / 1024 ** i).toFixed(1)} ${units[i]}`;
}

export function StorageUsage() {
	const { t } = useTranslation();
	const [usage, setUsage] = useState<{ used: number; quota: number } | null>(null);

	useEffect(() => {
		if ('storage' in navigator && 'estimate' in navigator.storage) {
			navigator.storage.estimate().then((estimate) => {
				setUsage({
					used: estimate.usage ?? 0,
					quota: estimate.quota ?? 0,
				});
			});
		}
	}, []);

	if (!usage) return null;

	const percentage = usage.quota > 0 ? (usage.used / usage.quota) * 100 : 0;

	return (
		<div className="space-y-2">
			<Label className="text-sm font-medium">{t('settings.storage')}</Label>
			<div className="space-y-1">
				<div className="h-2 w-full overflow-hidden rounded-full bg-muted">
					<div
						className="h-full rounded-full bg-primary transition-all"
						style={{ width: `${Math.min(percentage, 100)}%` }}
					/>
				</div>
				<p className="text-xs text-muted-foreground">
					{formatBytes(usage.used)} {t('settings.storage.used')} /{' '}
					{formatBytes(usage.quota)}
				</p>
			</div>
		</div>
	);
}
