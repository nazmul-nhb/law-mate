import { type $UUID, column, defineSchema, isUUID } from 'locality-idb';

export const lawMateSchema = defineSchema({
	notes: {
		id: column.uuid().pk(),
		user_id: column
			.char<$UUID>(36)
			.nullable()
			.index()
			.validate((value) => (isUUID(value) ? null : 'User ID must be a valid UUID')),
		law_id: column
			.char<$UUID>(36)
			.index()
			.validate((value) => (isUUID(value) ? null : 'Law ID must be a valid UUID')),
		title: column.text(),
		description: column.text(),
		created_at: column.timestamp(),
		updated_at: column.timestamp(),
		deleted_at: column.timestamp().nullable(),
		last_synced_at: column.timestamp().nullable(),
		version: column.int().default(1),
	},
	laws: {
		id: column.uuid().pk(),
		user_id: column
			.char<$UUID>(36)
			.nullable()
			.index()
			.validate((value) => (isUUID(value) ? null : 'User ID must be a valid UUID')),
		title: column.text(),
		description: column.text().nullable(),
		created_at: column.timestamp(),
		updated_at: column.timestamp(),
		deleted_at: column.timestamp().nullable(),
		last_synced_at: column.timestamp().nullable(),
		version: column.int().default(1),
	},
});
