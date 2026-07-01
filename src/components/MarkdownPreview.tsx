import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import removeMd from 'remove-markdown';
import { cn } from '@/lib/utils';

interface MarkdownPreviewProps {
	/** The content to be rendered */
	content: string;
	/** Optional class names to be applied to the container */
	className?: string;
	/** Remove markdown from content */
	removeMarkdown?: boolean;
	/** Replace new lines with space when {@link removeMarkdown} is `true` */
	replaceNewLine?: boolean;
}

export function MarkdownPreview({
	content,
	className = '',
	removeMarkdown = false,
	replaceNewLine,
}: MarkdownPreviewProps) {
	return (
		<div className={cn(`prose prose-neutral dark:prose-invert max-w-none`, className)}>
			{removeMarkdown ? (
				removeMd(replaceNewLine ? content.replace(/\n/g, ' ') : content)
			) : (
				<Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
			)}
		</div>
	);
}
