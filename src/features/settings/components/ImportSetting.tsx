import type { ExportData, ImportOptions } from 'locality-idb';
import { AlertCircle, CheckCircle2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { extractKeys } from 'toolbox-x';
import type { MapObjectValues } from 'toolbox-x/types/utils';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { idb } from '@/database/db';
import { cn } from '@/lib/utils';
import type { IDBTableNames, LawMateSchema, Nullable } from '@/types/common.types';
import type { Note } from '@/types/note.types';

type ImportMode = NonNullable<ImportOptions<IDBTableNames>['mode']>;
type ImportableData = ExportData<IDBTableNames, LawMateSchema>;

type Preview = {
	insert: number;
	update: number;
	skip: number;
	delete: number;
};

const previewSymbols = {
	insert: '+',
	update: '~',
	skip: '',
	delete: '-',
} as MapObjectValues<Preview, string>;

export function ImportSetting() {
	const { t } = useTranslation();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [importMode, setImportMode] = useState<ImportMode>('merge');
	const [isDragging, setIsDragging] = useState(false);
	const [error, setError] = useState<Nullable<string>>(null);
	const [success, setSuccess] = useState<boolean>(false);
	const [importedData, setImportedData] = useState<Nullable<ImportableData>>(null);
	const [preview, setPreview] = useState<Nullable<Preview>>(null);

	const generatePreview = async (importedNotes: Partial<Note>[], mode: ImportMode) => {
		const currentNotes = await idb.from('notes').findAll();
		const currentIds = new Set<string>(currentNotes.map((n) => String(n.id)));

		let insert = 0;
		let update = 0;
		let skip = 0;
		let deleteCount = 0;

		if (mode === 'replace') {
			insert = importedNotes.length;
			deleteCount = currentNotes.length;
		} else {
			for (const note of importedNotes) {
				if (note.id) {
					if (currentIds.has(note.id)) {
						if (mode === 'upsert') {
							update++;
						} else {
							skip++;
						}
					} else {
						insert++;
					}
				}
			}
		}

		setPreview({ insert, update, skip, delete: deleteCount });
	};

	const processFile = async (file: File) => {
		setError(null);
		setSuccess(false);
		setImportedData(null);
		setPreview(null);

		if (!file.name.endsWith('.json')) {
			setError(t('settings.data.import.error.invalid'));
			return;
		}

		const reader = new FileReader();
		reader.onload = async (e) => {
			try {
				const json = JSON.parse(e.target?.result as string) as ImportableData;
				const notes = json.data?.notes;

				if (!Array.isArray(notes)) {
					setError(t('settings.data.import.error.empty'));
					return;
				}

				setImportedData(json);
				await generatePreview(notes, importMode);
			} catch (err) {
				setError(t('settings.data.import.error.invalid'));
				console.error(err);
			}
		};
		reader.readAsText(file);
	};

	const handleImportConfirm = async () => {
		if (!importedData) return;
		try {
			await idb.$import(importedData, { mode: importMode });
			window.dispatchEvent(new CustomEvent('note-updated'));
			setSuccess(true);
			setPreview(null);
			setImportedData(null);
			if (fileInputRef.current) fileInputRef.current.value = '';
		} catch (err) {
			setError(t('common.error'));
			console.error(err);
		}
	};

	const onDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const onDragLeave = () => {
		setIsDragging(false);
	};

	const onDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		const file = e.dataTransfer.files?.[0];
		if (file) processFile(file);
	};

	return (
		<div className="space-y-4 rounded-lg border border-border p-4 bg-muted/10">
			<div className="space-y-1">
				<h3 className="text-sm font-medium text-foreground">
					{t('settings.data.import.label')}
				</h3>
				<p className="text-xs text-muted-foreground">
					{t('settings.data.import.desc')}
				</p>
			</div>

			<div className="flex items-center gap-2">
				<Label className="text-xs shrink-0">{t('settings.data.import.mode')}:</Label>
				<Select
					onValueChange={(val: Nullable<ImportMode>) => {
						if (val) {
							setImportMode(val);
							if (importedData) {
								const notes = importedData.data?.notes || [];
								generatePreview(notes, val);
							}
						}
					}}
					value={importMode}
				>
					<SelectTrigger className="h-8 text-xs flex-1">
						<SelectValue>
							{t(`settings.data.import.mode.${importMode}`)}
						</SelectValue>
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="merge">
							{t('settings.data.import.mode.merge')}
						</SelectItem>
						<SelectItem value="upsert">
							{t('settings.data.import.mode.upsert')}
						</SelectItem>
						<SelectItem value="replace">
							{t('settings.data.import.mode.replace')}
						</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div
				className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
					isDragging
						? 'border-primary bg-primary/5'
						: 'border-border hover:border-primary bg-transparent'
				}`}
				onClick={() => fileInputRef.current?.click()}
				onDragLeave={onDragLeave}
				onDragOver={onDragOver}
				onDrop={onDrop}
			>
				<Upload className="mx-auto size-6 text-muted-foreground mb-2" />
				<span className="text-xs text-muted-foreground block font-medium">
					{t('settings.data.import.dropzone')}
				</span>
				<input
					accept=".json"
					className="hidden"
					onChange={(e) => {
						const file = e.target.files?.[0];
						if (file) processFile(file);
					}}
					ref={fileInputRef}
					type="file"
				/>
			</div>

			{error ? (
				<div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 p-2 rounded-md">
					<AlertCircle className="size-4 shrink-0" />
					<span>{error}</span>
				</div>
			) : null}

			{success ? (
				<div className="flex items-center gap-2 text-xs text-emerald-500 bg-emerald-500/10 p-2 rounded-md">
					<CheckCircle2 className="size-4 shrink-0" />
					<span>{t('settings.data.import.success')}</span>
				</div>
			) : null}

			<Dialog
				onOpenChange={(open) => !open && setPreview(null)}
				open={!!preview && !error}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>{t('settings.data.import.preview')}</DialogTitle>
						<DialogDescription>
							{t('settings.data.import.confirm')}
						</DialogDescription>
					</DialogHeader>

					{preview ? (
						<div className="grid grid-cols-2 gap-3 py-4">
							{extractKeys(previewSymbols).map((mode) => (
								<PreviewCard key={mode} mode={mode} preview={preview} />
							))}
						</div>
					) : null}

					<DialogFooter className="gap-2 sm:gap-0">
						<Button onClick={() => setPreview(null)} variant="outline">
							{t('notes.cancel')}
						</Button>
						<Button className="cursor-pointer" onClick={handleImportConfirm}>
							{t('settings.data.import.run')}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

type PreviewProps = {
	preview: Preview;
	mode: keyof Preview;
};

function PreviewCard({ preview, mode }: PreviewProps) {
	const { t } = useTranslation();

	return (
		<div className="rounded-lg border border-border p-3 bg-muted/30">
			<p className="text-xs text-muted-foreground">
				{t(`settings.data.import.changes.${mode}`)}
			</p>
			<p
				className={cn('text-xl font-bold mt-1', {
					'text-emerald-500': mode === 'insert',
					'text-amber-500': mode === 'update',
					'text-blue-500': mode === 'skip',
					'text-rose-500': mode === 'delete',
				})}
			>
				{previewSymbols[mode]}
				{preview[mode]}
			</p>
		</div>
	);
}
