import { column, defineSchema } from 'locality-idb';
import { getTimestamp } from 'toolbox-x/date';

export const schema = defineSchema({
	notes: {
		id: column.uuid().pk(),
		user_id: column.text().optional().index(),
		title: column.text(),
		description: column.text(),
		created_at: column.timestamp(),
		updated_at: column.timestamp().onUpdate(() => getTimestamp()),
		deleted_at: column.timestamp().optional(),
		last_synced_at: column.timestamp().optional(),
		version: column.int().default(1),
	},
});
