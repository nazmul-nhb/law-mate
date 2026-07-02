import { type $UUID, column, defineSchema } from 'locality-idb';

export const lawMateSchema = defineSchema({
	notes: {
		id: column.uuid().pk(),
		user_id: column.char<$UUID>(36).optional().index(),
		title: column.text(),
		description: column.text(),
		created_at: column.timestamp(),
		updated_at: column.timestamp(),
		deleted_at: column.timestamp().optional(),
		last_synced_at: column.timestamp().optional(),
		version: column.int().default(1),
	},
});
