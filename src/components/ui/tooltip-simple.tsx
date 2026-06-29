import type { ReactElement, ReactNode } from 'react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

interface TooltipSimpleProps {
	content: ReactNode;
	children: ReactElement;
	delay?: number;
}

export function TooltipSimple({ content, children, delay = 0 }: TooltipSimpleProps) {
	if (!content) return children;

	return (
		<TooltipProvider delay={delay}>
			<Tooltip>
				<TooltipTrigger render={children} />
				<TooltipContent>
					{content}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
