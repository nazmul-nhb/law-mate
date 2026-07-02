import type { ExportData, ExportedTableData, ImportOptions } from 'locality-idb';
import { AlertCircle, CheckCircle2, Info, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { parseJSON } from 'toolbox-x';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { idb } from '@/database/db';
import { SampleDataLayout } from '@/features/settings/components/SampleDataLayout';
import type { IDBTableNames, LawMateSchema, Nullable } from '@/types/common.types';
import type { Law } from '@/types/laws.types';
import type { Note } from '@/types/note.types';

type ImportMode = NonNullable<ImportOptions<IDBTableNames>['mode']>;
type ImportableData =
	| ExportData<IDBTableNames, LawMateSchema>
	| ExportedTableData<IDBTableNames, LawMateSchema>;

type TablePreview = {
	insert: number;
	update: number;
	skip: number;
	delete: number;
};

type Preview = {
	laws: TablePreview;
	notes: TablePreview;
};

function extractNotesFromJSON(data: ImportableData): Partial<Note>[] {
	return 'data' in data ? data.data?.notes || [] : data?.notes || [];
}

function extractLawsFromJSON(data: ImportableData): Partial<Law>[] {
	return 'data' in data ? data.data?.laws || [] : data?.laws || [];
}

export function ImportSetting() {
	const { t } = useTranslation();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [importMode, setImportMode] = useState<ImportMode>('merge');
	const [isDragging, setIsDragging] = useState(false);
	const [error, setError] = useState<Nullable<string>>(null);
	const [success, setSuccess] = useState<boolean>(false);
	const [importedData, setImportedData] = useState<Nullable<ImportableData>>(null);
	const [preview, setPreview] = useState<Nullable<Preview>>(null);

	const generatePreview = async (
		importedLaws: Partial<Law>[],
		importedNotes: Partial<Note>[],
		mode: ImportMode
	) => {
		const currentLaws = await idb.from('laws').findAll();
		const currentNotes = await idb.from('notes').findAll();

		const currentLawIds = new Set<string>(currentLaws.map((l) => l.id));
		const currentNoteIds = new Set<string>(currentNotes.map((n) => n.id));

		const lawsPreview: TablePreview = { insert: 0, update: 0, skip: 0, delete: 0 };
		const notesPreview: TablePreview = { insert: 0, update: 0, skip: 0, delete: 0 };

		if (mode === 'replace') {
			lawsPreview.insert = importedLaws.length;
			lawsPreview.delete = currentLaws.length;
			notesPreview.insert = importedNotes.length;
			notesPreview.delete = currentNotes.length;
		} else {
			for (const law of importedLaws) {
				if (law.id) {
					if (currentLawIds.has(law.id)) {
						if (mode === 'upsert') lawsPreview.update++;
						else lawsPreview.skip++;
					} else {
						lawsPreview.insert++;
					}
				}
			}

			for (const note of importedNotes) {
				if (note.id) {
					if (currentNoteIds.has(note.id)) {
						if (mode === 'upsert') notesPreview.update++;
						else notesPreview.skip++;
					} else {
						notesPreview.insert++;
					}
				}
			}
		}

		setPreview({ laws: lawsPreview, notes: notesPreview });
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
				const json = parseJSON<ImportableData>(String(e.target?.result), false);
				const notes = extractNotesFromJSON(json);
				const laws = extractLawsFromJSON(json);

				if (notes.length === 0 && laws.length === 0) {
					setError(
						t(
							'settings.data.import.error.empty',
							'No valid laws or notes found to import.'
						)
					);
					return;
				}

				setImportedData(json);
				await generatePreview(laws, notes, importMode);
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
			await idb.$import(importedData as ExportData<IDBTableNames, LawMateSchema>, {
				mode: importMode,
			});
			window.dispatchEvent(new CustomEvent('note-updated'));
			window.dispatchEvent(new CustomEvent('law-updated'));
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
				<HoverCard>
					<HoverCardTrigger className="cursor-pointer">
						<h3 className="text-sm font-medium text-foreground flex items-center gap-2">
							<span>{t('settings.data.import.label')}</span>
							<Info className="size-3.5" />
						</h3>
					</HoverCardTrigger>
					<HoverCardContent className="w-96 p-4">
						<ScrollArea className="h-80 w-full pr-3">
							<SampleDataLayout />
						</ScrollArea>
					</HoverCardContent>
				</HoverCard>
				<p className="text-xs text-muted-foreground">
					{t('settings.data.import.desc')}
				</p>
			</div>

			<div className="flex items-center gap-2 flex-wrap">
				<Label className="text-xs shrink-0">{t('settings.data.import.mode')}:</Label>
				<Select
					onValueChange={(val: Nullable<ImportMode>) => {
						if (val) {
							setImportMode(val);
							if (importedData) {
								generatePreview(
									extractLawsFromJSON(importedData),
									extractNotesFromJSON(importedData),
									val
								);
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
						<div className="space-y-4 py-2 text-xs font-mono">
							<div>
								<h4 className="font-semibold text-foreground mb-1 uppercase text-[10px] tracking-wider">
									{t('laws.sidebar.title', 'Laws')}
								</h4>
								<div className="grid grid-cols-4 gap-2">
									<div className="rounded border p-1 text-center bg-muted/20">
										<p className="text-[10px] text-muted-foreground">
											+{preview.laws.insert}
										</p>
									</div>
									<div className="rounded border p-1 text-center bg-muted/20">
										<p className="text-[10px] text-muted-foreground">
											~{preview.laws.update}
										</p>
									</div>
									<div className="rounded border p-1 text-center bg-muted/20">
										<p className="text-[10px] text-muted-foreground">
											{preview.laws.skip}
										</p>
									</div>
									<div className="rounded border p-1 text-center bg-muted/20">
										<p className="text-[10px] text-muted-foreground">
											-{preview.laws.delete}
										</p>
									</div>
								</div>
							</div>

							<div>
								<h4 className="font-semibold text-foreground mb-1 uppercase text-[10px] tracking-wider">
									{t('nav.notes', 'Notes')}
								</h4>
								<div className="grid grid-cols-4 gap-2">
									<div className="rounded border p-1 text-center bg-muted/20">
										<p className="text-[10px] text-muted-foreground">
											+{preview.notes.insert}
										</p>
									</div>
									<div className="rounded border p-1 text-center bg-muted/20">
										<p className="text-[10px] text-muted-foreground">
											~{preview.notes.update}
										</p>
									</div>
									<div className="rounded border p-1 text-center bg-muted/20">
										<p className="text-[10px] text-muted-foreground">
											{preview.notes.skip}
										</p>
									</div>
									<div className="rounded border p-1 text-center bg-muted/20">
										<p className="text-[10px] text-muted-foreground">
											-{preview.notes.delete}
										</p>
									</div>
								</div>
							</div>
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
