import type { LucideIcon } from 'lucide-react';
import { isNonEmptyString } from 'toolbox-x/guards';

interface EmptyStateProps {
	icon: LucideIcon;
	title: string;
	description?: string;
	action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
			<div className="rounded-full bg-muted p-4">
				<Icon className="size-8 text-muted-foreground" />
			</div>
			<div className="space-y-1">
				<h3 className="text-lg font-medium text-foreground">{title}</h3>
				{isNonEmptyString(description) && (
					<p className="text-sm text-muted-foreground">{description}</p>
				)}
			</div>
			{action ? <div className="mt-2">{action}</div> : null}
		</div>
	);
}
