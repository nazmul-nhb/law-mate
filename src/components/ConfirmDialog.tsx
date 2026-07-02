import { AlertTriangle } from 'lucide-react';
import type { ReactNode } from 'react';
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

export type ConfirmDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	onConfirm: () => void | Promise<void>;
	variant?: 'default' | 'destructive';
	icon?: ReactNode;
	cancelText?: string;
	confirmText?: string;
	isLoading?: boolean;
};

export function ConfirmDialog({
	open,
	onOpenChange,
	title,
	description,
	onConfirm,
	variant = 'destructive',
	icon,
	cancelText,
	confirmText,
	isLoading,
}: ConfirmDialogProps) {
	const { t } = useTranslation();

	const handleConfirm = async () => {
		await onConfirm();
		onOpenChange(false);
	};

	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						{icon ?? (
							<AlertTriangle className="size-5 text-destructive animate-pulse" />
						)}
						{title}
					</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<DialogFooter className="gap-2 sm:gap-3">
					<Button
						disabled={isLoading}
						onClick={() => onOpenChange(false)}
						variant="outline"
					>
						{cancelText || t('notes.cancel')}
					</Button>
					<Button
						className="cursor-pointer"
						disabled={isLoading}
						onClick={handleConfirm}
						variant={variant}
					>
						{confirmText || t('common.confirm')}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
