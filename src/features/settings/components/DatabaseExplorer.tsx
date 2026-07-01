import { Database } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';

export function DatabaseExplorer() {
	const { t } = useTranslation();
	const navigate = useNavigate();

	return (
		<div className="flex items-center justify-between rounded-lg border border-border p-4 bg-muted/10">
			<div className="space-y-1">
				<h3 className="text-sm font-medium text-foreground">
					{t('settings.data.explore.label')}
				</h3>
				<p className="text-xs text-muted-foreground">
					{t('settings.data.explore.desc')}
				</p>
			</div>
			<Button
				className="cursor-pointer gap-2 shrink-0"
				onClick={() => navigate('/settings/idb-explorer')}
				size="sm"
				variant="outline"
			>
				<Database className="size-4" />
				{t('settings.data.explore.button')}
			</Button>
		</div>
	);
}
