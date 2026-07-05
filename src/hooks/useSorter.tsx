import type { SortDirection } from 'locality-idb';
import { ArrowDownWideNarrow, ArrowUpDown, ArrowUpNarrowWide, Check } from 'lucide-react';
import { type JSX, useState } from 'react';
import { extractEntries } from 'toolbox-x';
import { Button } from '@/components/ui/button';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandItem,
	CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { SORT_FIELDS } from '@/constants/app';
import type { SortableField } from '@/types/common.types';

interface SorterResult {
	sortOrder: SortDirection;
	sortField: SortableField;
	sorter: JSX.Element;
}

type Options = {
	defaultOrder?: SortDirection;
	defaultField?: SortableField;
};

export function useSorter(options?: Options): SorterResult {
	const [open, setOpen] = useState(false);

	const { defaultField = 'title', defaultOrder = 'asc' } = options ?? {};

	const [sortField, setSortField] = useState<SortableField>(defaultField);
	const [sortOrder, setSortOrder] = useState<SortDirection>(defaultOrder);

	const sorter = (
		<div className="flex items-center gap-1.5">
			<Popover onOpenChange={setOpen} open={open}>
				<PopoverTrigger>
					<Button className="text-[0.6rem]" size="sm" variant="outline">
						<ArrowUpDown className="size-3" />
						{SORT_FIELDS[sortField]}
					</Button>
				</PopoverTrigger>

				<PopoverContent align="start" className="w-fit p-0">
					<Command>
						{/* <CommandInput placeholder="Search field to sort" /> */}

						<CommandList>
							<CommandEmpty>No fields found.</CommandEmpty>

							<CommandGroup>
								{extractEntries(SORT_FIELDS).map(([field, label]) => (
									<CommandItem
										key={field}
										onSelect={() => {
											setSortField(field);
											setOpen(false);
										}}
										value={label}
									>
										<Check
											className={`size-3.5 ${
												field === sortField
													? 'opacity-100'
													: 'opacity-0'
											}`}
										/>

										{label}
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>

			<ToggleGroup
				onValueChange={([value]) => {
					if (value === 'asc' || value === 'desc') {
						setSortOrder(value);
					}
				}}
				value={[sortOrder]}
			>
				<ToggleGroupItem aria-label="Ascending" className="p-0" size="sm" value="asc">
					<ArrowUpNarrowWide className="size-3.5" />
				</ToggleGroupItem>

				<ToggleGroupItem aria-label="Descending" className="p-0" size="sm" value="desc">
					<ArrowDownWideNarrow className="size-3.5" />
				</ToggleGroupItem>
			</ToggleGroup>
		</div>
	);

	return {
		sortField,
		sortOrder,
		sorter,
	};
}
