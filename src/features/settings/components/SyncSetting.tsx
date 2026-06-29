import { CloudOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';

export function SyncSetting() {
	const { t } = useTranslation();

	return (
		<div className="space-y-3">
			<Label className="text-sm font-medium">{t('settings.sync')}</Label>
			<div className="flex items-center gap-3 rounded-md border border-border bg-muted/50 p-3">
				<CloudOff className="size-5 text-muted-foreground" />
				<div>
					<p className="text-sm text-foreground">{t('settings.sync.status')}</p>
					<p className="text-xs text-muted-foreground">
						{t('settings.sync.not.connected')}
					</p>
				</div>
			</div>
		</div>
	);
}
