import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownPreviewProps {
	content: string;
	className?: string;
}

export function MarkdownPreview({ content, className = '' }: MarkdownPreviewProps) {
	return (
		<div className={`prose prose-neutral dark:prose-invert max-w-none ${className}`}>
			<Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
		</div>
	);
}
