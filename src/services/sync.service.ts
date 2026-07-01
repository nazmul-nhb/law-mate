import type { $UUID } from 'locality-idb';
import { getTimestamp } from 'toolbox-x/date';
import { getFromLocalStorage, removeFromLocalStorage } from 'toolbox-x/dom';
import { DELETE_QUEUE_KEY } from '@/constants/app';
import { idb } from '@/database/db';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';
import { useSettingsStore } from '@/stores/settings.store';
import { useUIStore } from '@/stores/ui.store';
import type { Note } from '@/types/note.types';

export const syncService = {
	async sync(): Promise<void> {
		const { user } = useAuthStore.getState();

		if (!user) {
			console.info('Skipping sync: User not authenticated.');
			return;
		}

		const { setIsSyncing } = useUIStore.getState();

		setIsSyncing(true);

		try {
			// Process pending permanent deletes first
			const pending = getFromLocalStorage<$UUID[]>(DELETE_QUEUE_KEY) || [];

			if (pending.length > 0 && window.navigator.onLine) {
				try {
					const { error } = await supabase.from('notes').delete().in('id', pending);

					if (!error) {
						removeFromLocalStorage(DELETE_QUEUE_KEY);
					} else {
						console.warn('Failed to sync pending permanent deletes:', error);
					}
				} catch (err) {
					console.error('Failed to sync pending permanent deletes:', err);
				}
			}
			// 1. Fetch all local notes (including soft-deleted) that belong to this user
			const localNotes = await idb.from('notes').where('user_id', user.id).findAll();

			// 2. Fetch all remote notes from Supabase
			const { data: remoteNotes, error: remoteError } = await supabase
				.from('notes')
				.select('*');

			if (remoteError) {
				throw new Error(`Failed to fetch remote notes: ${remoteError.message}`);
			}

			const remoteMap = new Map<string, Note>();
			for (const rn of remoteNotes || []) {
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

				console.log({ localNote, remoteNote });

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
						await idb
							.update('notes')
							.set({ last_synced_at: syncTime, user_id: user.id })
							.where('id', localNote.id)
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

					// Rule 1: version comparison (Highest version wins)
					if (localNote.version > remoteNote.version) {
						action = 'push';
					} else if (remoteNote.version > localNote.version) {
						action = 'pull';
					} else {
						// Rule 2: deleted_at comparison (Deleted tie-breaker)
						if (remoteNote.deleted_at && !localNote.deleted_at) {
							action = 'pull';
						} else if (localNote.deleted_at && !remoteNote.deleted_at) {
							action = 'push';
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
							await idb
								.update('notes')
								.set({ last_synced_at: syncTime, user_id: user.id })
								.where('id', localNote.id)
								.run();
						} else {
							console.error(
								`Failed to push local update for note ${localNote.id}:`,
								updateError
							);
						}
					} else if (action === 'pull') {
						await idb
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
							.where('id', localNote.id)
							.run();
					} else {
						// noop: just update sync time locally
						await idb
							.update('notes')
							.set({ last_synced_at: syncTime, user_id: user.id })
							.where('id', localNote.id)
							.run();
					}
				}
			}

			// 4. Process notes that are in remote map but NOT in local map
			for (const remoteNote of remoteNotes || []) {
				if (!localMap.has(remoteNote.id)) {
					// Remote only: download to local
					// We only download if it's not deleted, or we can download it as soft-deleted as well
					await idb
						.insert('notes')
						.values({
							id: remoteNote.id,
							user_id: user.id,
							title: remoteNote.title,
							description: remoteNote.description,
							created_at: remoteNote.created_at,
							updated_at: remoteNote.updated_at,
							deleted_at: remoteNote.deleted_at || undefined,
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
