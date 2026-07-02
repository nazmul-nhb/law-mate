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
	const lawsId = useId();
	const notesId = useId();

	const [includeMeta, setIncludeMeta] = useState(true);
	const [prettyJson, setPrettyJson] = useState(true);
	const [exportLaws, setExportLaws] = useState(true);
	const [exportNotes, setExportNotes] = useState(true);

	const handleExport = async () => {
		try {
			const tables: ('notes' | 'laws')[] = [];
			if (exportLaws) tables.push('laws');
			if (exportNotes) tables.push('notes');

			if (tables.length === 0) return;

			await idb.$export({
				tables,
				includeMetadata: includeMeta,
				pretty: prettyJson,
			});
		} catch (err) {
			console.error('Failed to export data:', err);
		}
	};

	const isExportDisabled = !exportLaws && !exportNotes;

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
					<Label className="text-xs" htmlFor={lawsId}>
						{t('settings.data.export.laws', 'Export Laws')}
					</Label>
					<Switch
						checked={exportLaws}
						id={lawsId}
						onCheckedChange={setExportLaws}
						size="lg"
					/>
				</div>
				<div className="flex items-center justify-between">
					<Label className="text-xs" htmlFor={notesId}>
						{t('settings.data.export.notes', 'Export Notes')}
					</Label>
					<Switch
						checked={exportNotes}
						id={notesId}
						onCheckedChange={setExportNotes}
						size="lg"
					/>
				</div>
				<div className="flex items-center justify-between">
					<Label className="text-xs" htmlFor={metaId}>
						{t('settings.data.export.meta')}
					</Label>
					<Switch
						checked={includeMeta}
						id={metaId}
						onCheckedChange={setIncludeMeta}
						size="lg"
					/>
				</div>
				<div className="flex items-center justify-between">
					<Label className="text-xs" htmlFor={jsonId}>
						{t('settings.data.export.pretty')}
					</Label>
					<Switch
						checked={prettyJson}
						id={jsonId}
						onCheckedChange={setPrettyJson}
						size="lg"
					/>
				</div>
			</div>

			<Button
				className="w-full flex items-center justify-center gap-2 font-semibold mt-2"
				disabled={isExportDisabled}
				onClick={handleExport}
				size="lg"
			>
				<Download className="size-4" />
				{t('settings.data.export.button')}
			</Button>
		</div>
	);
}
