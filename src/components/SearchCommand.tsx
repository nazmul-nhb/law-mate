import { FileText, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import removeMd from 'remove-markdown';
import { isNonEmptyString } from 'toolbox-x/guards';
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command';
import { useNoteSearch } from '@/hooks/useNoteSearch';
import { lawRepository } from '@/repositories/law.repository';
import { noteRepository } from '@/repositories/note.repository';
import { useUIStore } from '@/stores/ui.store';
import type { Law } from '@/types/laws.types';
import type { Note } from '@/types/note.types';

export function SearchCommand() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { isSearchOpen, setSearchOpen } = useUIStore();
	const [allNotes, setAllNotes] = useState<Note[]>([]);
	const [laws, setLaws] = useState<Law[]>([]);

	const {
		query,
		setQuery,
		results,
		scopeLawId,
		setScopeLawId,
		searchFields,
		setSearchFields,
	} = useNoteSearch(allNotes);

	useEffect(() => {
		if (isSearchOpen) {
			noteRepository.getAllForSearch().then(setAllNotes);
			lawRepository.getAllForSearch().then(setLaws);
		} else {
			setQuery('');
			setScopeLawId(null);
			setSearchFields('all');
		}
	}, [isSearchOpen, setQuery, setScopeLawId, setSearchFields]);

	const handleSelect = (noteId: string) => {
		setSearchOpen(false);
		navigate(`/note/${noteId}`);
	};

	return (
		<CommandDialog className="top-1/5" onOpenChange={setSearchOpen} open={isSearchOpen}>
			<CommandInput
				onValueChange={setQuery}
				placeholder={t('search.placeholder')}
				value={query}
			/>

			{/* Advanced Filters Row */}
			<div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-border bg-muted/20 shrink-0 select-none">
				<select
					className="text-[11px] h-7 bg-popover text-foreground border border-border rounded px-2 outline-none focus:border-primary shrink-0 max-w-37.5 cursor-pointer"
					onChange={(e) => setScopeLawId(e.target.value || null)}
					value={scopeLawId || ''}
				>
					<option value="">{t('search.all.laws')}</option>
					{laws.map((law) => (
						<option key={law.id} value={law.id}>
							{law.title}
						</option>
					))}
				</select>

				<div className="flex border border-border rounded overflow-hidden h-7">
					{(['all', 'title', 'description'] as const).map((field) => (
						<button
							className={`text-[10px] px-2.5 h-full font-medium transition-colors cursor-pointer ${
								searchFields === field
									? 'bg-primary text-primary-foreground'
									: 'bg-popover text-muted-foreground hover:text-foreground hover:bg-accent/40'
							}`}
							key={field}
							onClick={() => setSearchFields(field)}
							type="button"
						>
							{field === 'all'
								? t('search.fields.all')
								: field === 'title'
									? t('search.fields.title')
									: t('search.fields.desc')}
						</button>
					))}
				</div>
			</div>

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
								className="cursor-pointer"
								key={note.id}
								onSelect={() => handleSelect(note.id)}
								value={`${note.title} ${note.description ?? ''}`}
							>
								<FileText className="mr-2 size-4 shrink-0 text-muted-foreground" />
								<div className="min-w-0 flex-1">
									<p className="truncate text-sm font-medium">
										{note.title || t('notes.untitled')}
									</p>
									{isNonEmptyString(note.description) && (
										<div className="truncate line-clamp-1 text-xs text-muted-foreground">
											{removeMd(note.description)}
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
