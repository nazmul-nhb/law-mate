import { Download } from 'lucide-react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { idb } from '@/database/db';

export function ExportSetting() {
	const { t } = useTranslation();
	const metaId = useId();
	const jsonId = useId();

	const [includeMeta, setIncludeMeta] = useState(true);
	const [prettyJson, setPrettyJson] = useState(true);

	const handleExport = async () => {
		try {
			await idb.$export({
				includeMetadata: includeMeta,
				pretty: prettyJson,
			});
		} catch (err) {
			console.error('Failed to export data:', err);
		}
	};

	return (
		<div className="space-y-4 rounded-lg border border-border p-4 bg-muted/10">
			<div className="space-y-1">
				<h3 className="text-sm font-medium text-foreground">
					{t('settings.data.export.label')}
				</h3>
				<p className="text-xs text-muted-foreground">
					{t('settings.data.export.desc')}
				</p>
			</div>

			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<Label className="text-xs" htmlFor={metaId}>
						{t('settings.data.export.meta')}
					</Label>
					<Switch
						checked={includeMeta}
						id={metaId}
						onCheckedChange={setIncludeMeta}
					/>
				</div>
				<div className="flex items-center justify-between">
					<Label className="text-xs" htmlFor={jsonId}>
						{t('settings.data.export.pretty')}
					</Label>
					<Switch checked={prettyJson} id={jsonId} onCheckedChange={setPrettyJson} />
				</div>
			</div>

			<Button
				className="w-full flex items-center justify-center gap-2 cursor-pointer mt-2"
				onClick={handleExport}
				size="sm"
			>
				<Download className="size-4" />
				{t('settings.data.export.button')}
			</Button>
		</div>
	);
}
