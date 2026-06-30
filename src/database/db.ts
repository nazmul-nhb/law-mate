import { Locality } from 'locality-idb';
import { DB_NAME, DB_VERSION } from '@/constants/app';
import { schema } from '@/database/schema';

export const idb = new Locality({
	dbName: DB_NAME,
	version: DB_VERSION,
	schema,
});
