import type { Timestamp, UUID } from 'locality-idb';
import { getTimestamp } from 'toolbox-x/date';
import { db } from '@/database/db';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';
import { useSettingsStore } from '@/stores/settings.store';
import { useUIStore } from '@/stores/ui.store';
import type { Note } from '@/types/note.types';

export const syncService = {
	async sync(): Promise<void> {
		const user = useAuthStore.getState().user;
		if (!user) {
			console.info('Skipping sync: User not authenticated.');
			return;
		}

		if (!navigator.onLine) {
			console.info('Skipping sync: Device is offline.');
			return;
		}

		const setIsSyncing = useUIStore.getState().setIsSyncing;
		setIsSyncing(true);

		try {
			// 1. Fetch all local notes (including soft-deleted) that belong to this user
			const allLocalNotes = await db.from('notes').findAll();
			const localNotes = allLocalNotes.filter((note) => note.user_id === user.id);

			// 2. Fetch all remote notes from Supabase
			const { data: remoteNotes, error: remoteError } = await supabase
				.from('notes')
				.select('*');

			if (remoteError) {
				throw new Error(`Failed to fetch remote notes: ${remoteError.message}`);
			}

			const remoteMap = new Map<string, Note>();
			for (const rn of (remoteNotes || []) as Note[]) {
				remoteMap.set(rn.id, rn);
			}

			const localMap = new Map<string, Note>();
			for (const ln of localNotes) {
				localMap.set(ln.id, ln);
			}

			const syncTime = getTimestamp();

			// 3. Process notes in local map
			for (const localNote of localNotes) {
				const remoteNote = remoteMap.get(localNote.id);

				if (!remoteNote) {
					// Local only: upload to remote
					const { error: insertError } = await supabase.from('notes').upsert({
						id: localNote.id,
						user_id: user.id,
						title: localNote.title,
						description: localNote.description,
						created_at: localNote.created_at,
						updated_at: localNote.updated_at,
						deleted_at: localNote.deleted_at,
						version: localNote.version,
						last_synced_at: syncTime,
					});

					if (!insertError) {
						await db
							.update('notes')
							.set({ last_synced_at: syncTime, user_id: user.id })
							.where((n) => n.id === localNote.id)
							.run();
					} else {
						console.error(
							`Failed to push local note ${localNote.id}:`,
							insertError
						);
					}
				} else {
					// Exists on both: resolve conflict
					let action: 'push' | 'pull' | 'noop' = 'noop';

					// Rule 1: deleted_at comparison (Deleted always wins)
					if (remoteNote.deleted_at && !localNote.deleted_at) {
						action = 'pull';
					} else if (localNote.deleted_at && !remoteNote.deleted_at) {
						action = 'push';
					} else if (remoteNote.deleted_at && localNote.deleted_at) {
						action = 'noop'; // Both are deleted
					} else {
						// Rule 2: version comparison (Highest version wins)
						if (localNote.version > remoteNote.version) {
							action = 'push';
						} else if (remoteNote.version > localNote.version) {
							action = 'pull';
						} else {
							// Rule 3: updated_at comparison (Most recent wins)
							const localTime = new Date(localNote.updated_at).getTime();
							const remoteTime = new Date(remoteNote.updated_at).getTime();
							if (localTime > remoteTime) {
								action = 'push';
							} else if (remoteTime > localTime) {
								action = 'pull';
							}
						}
					}

					if (action === 'push') {
						const { error: updateError } = await supabase.from('notes').upsert({
							id: localNote.id,
							user_id: user.id,
							title: localNote.title,
							description: localNote.description,
							created_at: localNote.created_at,
							updated_at: localNote.updated_at,
							deleted_at: localNote.deleted_at,
							version: localNote.version,
							last_synced_at: syncTime,
						});

						if (!updateError) {
							await db
								.update('notes')
								.set({ last_synced_at: syncTime, user_id: user.id })
								.where((n) => n.id === localNote.id)
								.run();
						} else {
							console.error(
								`Failed to push local update for note ${localNote.id}:`,
								updateError
							);
						}
					} else if (action === 'pull') {
						await db
							.update('notes')
							.set({
								title: remoteNote.title,
								description: remoteNote.description,
								created_at: remoteNote.created_at,
								updated_at: remoteNote.updated_at,
								deleted_at: remoteNote.deleted_at || undefined,
								version: remoteNote.version,
								last_synced_at: syncTime,
								user_id: user.id,
							})
							.where((n) => n.id === localNote.id)
							.run();
					} else {
						// noop: just update sync time locally
						await db
							.update('notes')
							.set({ last_synced_at: syncTime, user_id: user.id })
							.where((n) => n.id === localNote.id)
							.run();
					}
				}
			}

			// 4. Process notes that are in remote map but NOT in local map
			for (const remoteNote of remoteNotes || []) {
				if (!localMap.has(remoteNote.id)) {
					// Remote only: download to local
					// We only download if it's not deleted, or we can download it as soft-deleted as well
					await db
						.insert('notes')
						.values({
							id: remoteNote.id as UUID<'v4'>,
							user_id: user.id,
							title: remoteNote.title,
							description: remoteNote.description,
							created_at: remoteNote.created_at as Timestamp,
							updated_at: remoteNote.updated_at as Timestamp,
							deleted_at: (remoteNote.deleted_at as Timestamp) || undefined,
							last_synced_at: syncTime,
							version: remoteNote.version,
						})
						.run();
				}
			}

			// 5. Trigger note updated event to refresh active views
			window.dispatchEvent(new CustomEvent('note-updated'));
			useSettingsStore.getState().setLastSyncedAt(syncTime);
		} catch (error) {
			console.error('Synchronization failed:', error);
		} finally {
			setIsSyncing(false);
		}
	},
};
