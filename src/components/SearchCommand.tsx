import { FileText, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { truncateString } from 'toolbox-x';
import { MarkdownPreview } from '@/components/MarkdownPreview';
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command';
import { useSearch } from '@/hooks/useSearch';
import { noteRepository } from '@/repositories/note.repository';
import { useUIStore } from '@/stores/ui.store';
import type { Note } from '@/types/note.types';

export function SearchCommand() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { isSearchOpen, setSearchOpen } = useUIStore();
	const [allNotes, setAllNotes] = useState<Note[]>([]);
	const { query, setQuery, results } = useSearch(allNotes);

	useEffect(() => {
		if (isSearchOpen) {
			noteRepository.getAllForSearch().then(setAllNotes);
		} else {
			setQuery('');
		}
	}, [isSearchOpen, setQuery]);

	const handleSelect = (noteId: string) => {
		setSearchOpen(false);
		navigate(`/note/${noteId}`);
	};

	return (
		<CommandDialog onOpenChange={setSearchOpen} open={isSearchOpen}>
			<CommandInput
				onValueChange={setQuery}
				placeholder={t('search.placeholder')}
				value={query}
			/>
			<CommandList>
				<CommandEmpty>
					<div className="flex flex-col items-center gap-2 py-6">
						<Search className="size-8 text-muted-foreground" />
						<p className="text-sm text-muted-foreground">
							{query.trim() ? t('search.empty') : t('search.hint')}
						</p>
					</div>
				</CommandEmpty>
				{results.length > 0 && (
					<CommandGroup>
						{results.map((note) => (
							<CommandItem
								key={note.id}
								onSelect={() => handleSelect(note.id)}
								value={`${note.title} ${note.description ?? ''}`}
							>
								<FileText className="mr-2 size-4 shrink-0 text-muted-foreground" />
								<div className="min-w-0 flex-1">
									<p className="truncate text-sm font-medium">
										{note.title || t('notes.untitled')}
									</p>
									{note.description && (
										<div className="truncate text-xs text-muted-foreground">
											<MarkdownPreview
												content={truncateString(note.description)}
											/>
										</div>
									)}
								</div>
							</CommandItem>
						))}
					</CommandGroup>
				)}
			</CommandList>
		</CommandDialog>
	);
}
