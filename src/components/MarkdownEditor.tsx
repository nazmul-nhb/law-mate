import { Bold, Code, Heading2, Italic, Link, List, ListOrdered, Quote } from 'lucide-react';
import { type RefObject, useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MarkdownPreview } from '@/components/MarkdownPreview';
import { TooltipSimple } from '@/components/ui/tooltip-simple';
import { cn } from '@/lib/utils';

interface MarkdownEditorProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
}

interface ToolbarAction {
	icon: React.ElementType;
	labelKey: string;
	prefix: string;
	suffix: string;
	block?: boolean;
}

const TOOLBAR_ACTIONS: ToolbarAction[] = [
	{ icon: Bold, labelKey: 'editor.bold', prefix: '**', suffix: '**' },
	{ icon: Italic, labelKey: 'editor.italic', prefix: '_', suffix: '_' },
	{ icon: Heading2, labelKey: 'editor.heading', prefix: '## ', suffix: '', block: true },
	{ icon: Link, labelKey: 'editor.link', prefix: '[', suffix: '](url)' },
	{ icon: Code, labelKey: 'editor.code', prefix: '`', suffix: '`' },
	{ icon: List, labelKey: 'editor.list', prefix: '- ', suffix: '', block: true },
	{
		icon: ListOrdered,
		labelKey: 'editor.ordered.list',
		prefix: '1. ',
		suffix: '',
		block: true,
	},
	{ icon: Quote, labelKey: 'editor.quote', prefix: '> ', suffix: '', block: true },
];

function applyAction(
	textareaRef: RefObject<HTMLTextAreaElement | null>,
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

	return (
		<div className={cn('rounded-md border border-input', className)}>
			{/* Tab bar + toolbar */}
			<div className="flex items-center justify-between border-b border-border px-2">
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
					<div className="flex items-center gap-0.5">
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
					</div>
				)}
			</div>

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
		</div>
	);
}
