import { useTranslation } from 'react-i18next';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Nullable } from '@/types/common.types';
import type { Law } from '@/types/laws.types';
import type { Note } from '@/types/note.types';

type Props<T extends Note | Law> = {
	data: Nullable<T>;
};

export default function ExplorerDataView<T extends Note | Law>({ data }: Props<T>) {
	const { t } = useTranslation();

	return (
		<div className="space-y-4 py-2 text-xs">
			<div className="grid grid-cols-2 gap-4 border-b border-border pb-3 text-muted-foreground font-mono">
				<div>
					<span className="font-semibold text-foreground">User ID:</span>{' '}
					{data?.user_id || t('common.anonymous.label')}
				</div>
				{data && 'law_id' in data ? (
					<div>
						<span className="font-semibold text-foreground">Law ID:</span>{' '}
						{data?.law_id || '-'}
					</div>
				) : null}
				<div>
					<span className="font-semibold text-foreground">Version:</span>{' '}
					{data?.version}
				</div>
				<div>
					<span className="font-semibold text-foreground">Created:</span>{' '}
					{data?.created_at}
				</div>
				<div>
					<span className="font-semibold text-foreground">Updated:</span>{' '}
					{data?.updated_at}
				</div>
				{data?.deleted_at ? (
					<div className="col-span-2 text-rose-500 font-semibold">
						Deleted At: {data.deleted_at}
					</div>
				) : null}
			</div>
			<div className="space-y-2">
				<div className="font-semibold text-foreground">
					{t('notes.description.label')}:
				</div>
				<pre className="p-3 bg-muted border rounded-md whitespace-pre-wrap font-mono text-xs leading-relaxed">
					<ScrollArea className="h-24 overflow-auto">
						{data?.description || t('notes.no.description')}
					</ScrollArea>
				</pre>
			</div>
		</div>
	);
}
