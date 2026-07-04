import { ArrowDown, ArrowUp, Replace } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import type { OcrInsertionMode } from '@/types/ocr.types';

interface OcrResultDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	extractedText: string;
	onApply: (text: string, mode: OcrInsertionMode) => void;
}

export function OcrResultDialog({
	open,
	onOpenChange,
	extractedText,
	onApply,
}: OcrResultDialogProps) {
	const { t } = useTranslation();
	const [text, setText] = useState(extractedText);

	useEffect(() => {
		if (open) {
			setText(extractedText);
		}
	}, [open, extractedText]);

	const handleApply = (mode: OcrInsertionMode) => {
		onApply(text, mode);
		onOpenChange(false);
	};

	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent className="max-w-[99%] sm:max-w-xl max-h-[90vh] flex flex-col">
				<DialogHeader>
					<DialogTitle>{t('editor.ocr.dialog.title')}</DialogTitle>
					<DialogDescription>{t('editor.ocr.dialog.desc')}</DialogDescription>
				</DialogHeader>

				<div className="flex-1 min-h-0 py-2">
					<Textarea
						className="min-h-48 max-h-72 font-mono text-xs leading-relaxed resize-y"
						onChange={(e) => setText(e.target.value)}
						value={text}
					/>
				</div>

				<DialogFooter className="flex-col sm:flex-row gap-2 pt-2 border-t border-border">
					<Button
						className="w-full sm:w-auto"
						onClick={() => handleApply('replace')}
						size="sm"
						variant="destructive"
					>
						<Replace className="size-3.5 mr-1.5" />
						{t('editor.ocr.mode.replace')}
					</Button>
					<Button
						className="w-full sm:w-auto"
						onClick={() => handleApply('prepend')}
						size="sm"
						variant="outline"
					>
						<ArrowUp className="size-3.5 mr-1.5" />
						{t('editor.ocr.mode.prepend')}
					</Button>
					<Button
						className="w-full sm:w-auto"
						onClick={() => handleApply('append')}
						size="sm"
					>
						<ArrowDown className="size-3.5 mr-1.5" />
						{t('editor.ocr.mode.append')}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
