import {
	Bold,
	Code,
	Heading3,
	Italic,
	Link,
	List,
	ListChecks,
	ListOrdered,
	Loader2,
	Quote,
	ScanText,
	UploadCloud,
} from 'lucide-react';
import { type RefObject, useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MarkdownPreview } from '@/components/MarkdownPreview';
import { OcrResultDialog } from '@/components/OcrResultDialog';
import { TooltipSimple } from '@/components/ui/tooltip-simple';
import type { I18Keys } from '@/i18n';
import { cn } from '@/lib/utils';
import { ocrService } from '@/services/ocr.service';
import type { Nullable } from '@/types/common.types';
import type { OcrInsertionMode } from '@/types/ocr.types';

interface MarkdownEditorProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
}

interface ToolbarAction {
	icon: React.ElementType;
	labelKey: I18Keys;
	prefix: string;
	suffix: string;
	block?: boolean;
}

const TOOLBAR_ACTIONS = [
	{ icon: Bold, labelKey: 'editor.bold', prefix: '**', suffix: '**' },
	{ icon: Italic, labelKey: 'editor.italic', prefix: '_', suffix: '_' },
	{ icon: Heading3, labelKey: 'editor.heading', prefix: '### ', suffix: '', block: true },
	{ icon: Link, labelKey: 'editor.link', prefix: '[', suffix: '](url)' },
	{ icon: Code, labelKey: 'editor.code', prefix: '```\n', suffix: '\n```', block: true },
	{ icon: List, labelKey: 'editor.list', prefix: '- ', suffix: '', block: true },
	{
		icon: ListOrdered,
		labelKey: 'editor.ordered.list',
		prefix: '1. ',
		suffix: '',
		block: true,
	},
	{
		icon: ListChecks,
		labelKey: 'editor.task.list',
		prefix: '- [ ] ',
		suffix: '',
		block: true,
	},
	{ icon: Quote, labelKey: 'editor.quote', prefix: '> ', suffix: '', block: true },
] satisfies Array<ToolbarAction>;

function applyAction(
	textareaRef: RefObject<Nullable<HTMLTextAreaElement>>,
	value: string,
	onChange: (value: string) => void,
	action: ToolbarAction
) {
	const textarea = textareaRef.current;
	if (!textarea) return;

	const start = textarea.selectionStart;
	const end = textarea.selectionEnd;
	const selectedText = value.substring(start, end) || 'text';

	let newText: string;
	let cursorPos: number;

	if (action.block) {
		const lineStart = value.lastIndexOf('\n', start - 1) + 1;
		const before = value.substring(0, lineStart);
		const after = value.substring(start === end ? end : end);
		const selected = start === end ? '' : selectedText;

		newText = `${before}${action.prefix}${selected}${action.suffix}${after}`;
		cursorPos = lineStart + action.prefix.length + selected.length;
	} else {
		const before = value.substring(0, start);
		const after = value.substring(end);

		newText = `${before}${action.prefix}${selectedText}${action.suffix}${after}`;
		cursorPos = start + action.prefix.length + selectedText.length;
	}

	onChange(newText);

	requestAnimationFrame(() => {
		textarea.focus();
		textarea.setSelectionRange(cursorPos, cursorPos);
	});
}

export function MarkdownEditor({
	value,
	onChange,
	placeholder,
	className,
}: MarkdownEditorProps) {
	const { t } = useTranslation();
	const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [isScanning, setIsScanning] = useState(false);
	const [isDraggingOver, setIsDraggingOver] = useState(false);
	const [ocrText, setOcrText] = useState('');
	const [isOcrModalOpen, setIsOcrModalOpen] = useState(false);
	const [ocrError, setOcrError] = useState<Nullable<string>>(null);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
			if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
				e.preventDefault();
				applyAction(textareaRef, value, onChange, TOOLBAR_ACTIONS[0]);
			} else if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
				e.preventDefault();
				applyAction(textareaRef, value, onChange, TOOLBAR_ACTIONS[1]);
			}
		},
		[value, onChange]
	);

	const processImageFile = async (file: File) => {
		setOcrError(null);
		setIsScanning(true);

		try {
			const result = await ocrService.extractTextFromImage(file);
			if (result.success && result.text) {
				setOcrText(result.text);
				setIsOcrModalOpen(true);
			} else {
				if (result.error === 'MISSING_API_KEY') {
					setOcrError(t('editor.ocr.error.missing_key'));
				} else if (result.error === 'INVALID_IMAGE_TYPE') {
					setOcrError(t('editor.ocr.error.invalid_type'));
				} else if (result.error === 'FILE_TOO_LARGE') {
					setOcrError(t('editor.ocr.error.too_large'));
				} else if (result.error === 'NO_TEXT_FOUND') {
					setOcrError(t('editor.ocr.error.no_text'));
				} else if (result.error === 'NO_INTERNET_CONNECTION') {
					setOcrError(t('admin.offline.title'));
				} else {
					setOcrError(result.error || t('editor.ocr.error.failed'));
				}
			}
		} catch (err) {
			setOcrError(err instanceof Error ? err.message : t('editor.ocr.error.failed'));
		} finally {
			setIsScanning(false);
		}
	};

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			processImageFile(file);
		}
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		if (!isDraggingOver) {
			setIsDraggingOver(true);
		}
	};

	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDraggingOver(false);
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDraggingOver(false);

		const file = e.dataTransfer.files?.[0];
		if (file?.type.startsWith('image/')) {
			processImageFile(file);
		} else if (file) {
			setOcrError(t('editor.ocr.error.invalid_type'));
		}
	};

	const handleApplyOcrText = (extractedText: string, mode: OcrInsertionMode) => {
		if (mode === 'replace') {
			onChange(extractedText);
		} else if (mode === 'prepend') {
			onChange(value.trim() ? `${extractedText}\n\n${value}` : extractedText);
		} else {
			// append
			onChange(value.trim() ? `${value}\n\n${extractedText}` : extractedText);
		}
	};

	return (
		<div
			className={cn(
				'rounded-md border border-input w-full max-w-full relative transition-colors',
				isDraggingOver && 'border-primary ring-2 ring-primary/20 bg-primary/5',
				className
			)}
			onDragLeave={handleDragLeave}
			onDragOver={handleDragOver}
			onDrop={handleDrop}
		>
			{/* Hidden File Input for Image Upload */}
			<input
				accept="image/*"
				className="hidden"
				onChange={handleFileSelect}
				ref={fileInputRef}
				type="file"
			/>

			{/* Drag & Drop Overlay */}
			{Boolean(isDraggingOver) && (
				<div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/90 backdrop-blur-xs rounded-md border-2 border-dashed border-primary p-4 pointer-events-none">
					<UploadCloud className="size-8 text-primary animate-bounce mb-2" />
					<p className="text-xs font-semibold text-foreground">
						{t('editor.ocr.dropzone')}
					</p>
				</div>
			)}

			{/* Tab bar + toolbar */}
			<div className="flex flex-wrap items-center justify-between border-b border-border px-2 gap-2 py-1 sm:py-0">
				<div className="flex">
					<button
						className={cn(
							'px-3 py-2 text-sm font-medium transition-colors',
							activeTab === 'write'
								? 'border-b-2 border-primary text-foreground'
								: 'text-muted-foreground hover:text-foreground'
						)}
						onClick={() => setActiveTab('write')}
						type="button"
					>
						{t('editor.write')}
					</button>
					<button
						className={cn(
							'px-3 py-2 text-sm font-medium transition-colors',
							activeTab === 'preview'
								? 'border-b-2 border-primary text-foreground'
								: 'text-muted-foreground hover:text-foreground'
						)}
						onClick={() => setActiveTab('preview')}
						type="button"
					>
						{t('editor.preview')}
					</button>
				</div>

				{activeTab === 'write' && (
					<div className="flex flex-wrap items-center gap-0.5">
						{TOOLBAR_ACTIONS.map((action) => (
							<TooltipSimple content={t(action.labelKey)} key={action.labelKey}>
								<button
									className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer"
									onClick={() =>
										applyAction(textareaRef, value, onChange, action)
									}
									type="button"
								>
									<action.icon className="size-4" />
								</button>
							</TooltipSimple>
						))}

						{/* OCR Scan Button */}
						<div className="h-4 w-px bg-border mx-1" />
						<TooltipSimple
							content={
								isScanning ? t('editor.ocr.scanning') : t('editor.ocr.scan')
							}
						>
							<button
								className={cn(
									'rounded p-1.5 transition-colors cursor-pointer flex items-center gap-1 text-primary hover:bg-primary/10',
									{
										'opacity-60 pointer-events-none': isScanning,
										'cursor-no-drop': !navigator.onLine,
									}
								)}
								disabled={isScanning}
								onClick={() => fileInputRef.current?.click()}
								type="button"
							>
								{isScanning ? (
									<Loader2 className="size-4 animate-spin" />
								) : (
									<ScanText className="size-4" />
								)}
							</button>
						</TooltipSimple>
					</div>
				)}
			</div>

			{/* OCR Error Banner */}
			{Boolean(ocrError) && (
				<div className="px-3 py-1.5 bg-destructive/10 border-b border-destructive/20 text-xs font-medium text-destructive flex items-center justify-between">
					<span>{ocrError}</span>
					<button
						className="text-destructive hover:underline cursor-pointer ml-2 text-[10px]"
						onClick={() => setOcrError(null)}
						type="button"
					>
						Dismiss
					</button>
				</div>
			)}

			{/* Content */}
			{activeTab === 'write' ? (
				<textarea
					className="min-h-50 w-full resize-y bg-transparent px-3 py-2 text-sm focus:outline-none"
					onChange={(e) => onChange(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={placeholder ?? t('notes.description.placeholder')}
					ref={textareaRef}
					value={value}
				/>
			) : (
				<div className="min-h-50 px-3 py-2">
					{value.trim() ? (
						<MarkdownPreview className="text-sm" content={value} />
					) : (
						<p className="text-sm text-muted-foreground">
							{t('editor.preview.empty')}
						</p>
					)}
				</div>
			)}

			{/* OCR Result Dialog */}
			<OcrResultDialog
				extractedText={ocrText}
				onApply={handleApplyOcrText}
				onOpenChange={setIsOcrModalOpen}
				open={isOcrModalOpen}
			/>
		</div>
	);
}
