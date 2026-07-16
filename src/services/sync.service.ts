import type { $UUID } from 'locality-idb';
import { getTimestamp } from 'toolbox-x/date';
import { getFromLocalStorage, removeFromLocalStorage, saveToLocalStorage } from 'toolbox-x/dom';
import { DELETE_LAWS_QUEUE_KEY, DELETE_NOTES_QUEUE_KEY } from '@/constants/app';
import { idb } from '@/database/db';
import { invalidateLawsAndNotes } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';
import { getTimeDiff } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { useSettingsStore } from '@/stores/settings.store';
import { useUIStore } from '@/stores/ui.store';
import type { SyncType } from '@/types/common.types';
import type { Law } from '@/types/laws.types';
import type { Note } from '@/types/note.types';

export const syncService = {
	async sync(): Promise<void> {
		const { user } = useAuthStore.getState();

		if (!user) {
			console.info('Skipping sync: User not authenticated.');
			return;
		}

		if (!window.navigator.onLine) {
			console.info('Skipping sync: Device is offline.');
			return;
		}

		const { setIsSyncing } = useUIStore.getState();

		try {
			setIsSyncing(true);

			const syncTime = getTimestamp();

			// Auto-claim any unowned laws or notes for the current authenticated user
			const allLocalLaws = await idb.from('laws').findAll();
			for (const law of allLocalLaws) {
				if (!law.user_id) {
					await idb
						.update('laws')
						.set({ user_id: user.id })
						.where('id', law.id)
						.run();
				}
			}

			const allLocalNotes = await idb.from('notes').findAll();
			for (const note of allLocalNotes) {
				if (!note.user_id) {
					await idb
						.update('notes')
						.set({ user_id: user.id })
						.where('id', note.id)
						.run();
				}
			}

			// ==========================================
			// 1. SYNC LAWS
			// ==========================================
			const pendingLaws = getFromLocalStorage<$UUID[]>(DELETE_LAWS_QUEUE_KEY) || [];
			if (pendingLaws.length > 0 && window.navigator.onLine) {
				try {
					const { error } = await supabase
						.from('laws')
						.delete()
						.in('id', pendingLaws);
					if (!error) {
						const currentQueue =
							getFromLocalStorage<$UUID[]>(DELETE_LAWS_QUEUE_KEY) || [];
						const remaining = currentQueue.filter(
							(id) => !pendingLaws.includes(id)
						);
						if (remaining.length > 0) {
							saveToLocalStorage(DELETE_LAWS_QUEUE_KEY, remaining);
						} else {
							removeFromLocalStorage(DELETE_LAWS_QUEUE_KEY);
						}
					} else {
						console.warn('Failed to sync pending laws permanent deletes:', error);
					}
				} catch (err) {
					console.error('Failed to sync pending laws permanent deletes:', err);
				}
			}

			// Fetch local and remote laws
			const localLaws = await idb.from('laws').where('user_id', user.id).findAll();
			const { data: remoteLaws, error: remoteLawsError } = await supabase
				.from('laws')
				.select('*');

			if (remoteLawsError) {
				throw new Error(`Failed to fetch remote laws: ${remoteLawsError.message}`);
			}

			const remoteLawsMap = new Map<string, Law>();
			const validRemoteLawIds = new Set<string>();

			for (const rl of remoteLaws || []) {
				remoteLawsMap.set(rl.id, rl);
				validRemoteLawIds.add(rl.id);
			}

			const localLawsMap = new Map<string, Law>();
			for (const ll of localLaws) {
				localLawsMap.set(ll.id, ll);
			}

			// Process laws conflicts
			for (const localLaw of localLaws) {
				const remoteLaw = remoteLawsMap.get(localLaw.id);

				if (!remoteLaw) {
					// Local only: upload to remote
					const { error: insertError } = await supabase.from('laws').upsert({
						id: localLaw.id,
						user_id: user.id,
						title: localLaw.title,
						description: localLaw.description || null,
						created_at: localLaw.created_at,
						updated_at: localLaw.updated_at,
						deleted_at: localLaw.deleted_at || null,
						version: localLaw.version,
						last_synced_at: syncTime,
					});

					if (!insertError) {
						validRemoteLawIds.add(localLaw.id);
						await idb
							.update('laws')
							.set({ last_synced_at: syncTime, user_id: user.id })
							.where('id', localLaw.id)
							.run();
					} else {
						console.error(`Failed to push local law ${localLaw.id}:`, insertError);
					}
				} else {
					// Exists on both: conflict resolution
					let action: SyncType = 'noop';

					if (localLaw.version > remoteLaw.version) {
						action = 'push';
					} else if (remoteLaw.version > localLaw.version) {
						action = 'pull';
					} else {
						if (remoteLaw.deleted_at && !localLaw.deleted_at) {
							action = 'pull';
						} else if (localLaw.deleted_at && !remoteLaw.deleted_at) {
							action = 'push';
						} else {
							const diff = getTimeDiff(localLaw.updated_at, remoteLaw.updated_at);

							if (diff > 0) {
								action = 'push';
							} else if (diff < 0) {
								action = 'pull';
							}
						}
					}

					if (action === 'push') {
						const { error: updateError } = await supabase.from('laws').upsert({
							id: localLaw.id,
							user_id: user.id,
							title: localLaw.title,
							description: localLaw.description || null,
							created_at: localLaw.created_at,
							updated_at: localLaw.updated_at,
							deleted_at: localLaw.deleted_at || null,
							version: localLaw.version,
							last_synced_at: syncTime,
						});

						if (!updateError) {
							validRemoteLawIds.add(localLaw.id);
							await idb
								.update('laws')
								.set({ last_synced_at: syncTime, user_id: user.id })
								.where('id', localLaw.id)
								.run();
						} else {
							console.error(
								`Failed to push law update ${localLaw.id}:`,
								updateError
							);
						}
					} else if (action === 'pull') {
						await idb
							.update('laws')
							.set({
								title: remoteLaw.title,
								description: remoteLaw.description || null,
								created_at: remoteLaw.created_at,
								updated_at: remoteLaw.updated_at,
								deleted_at: remoteLaw.deleted_at || null,
								version: remoteLaw.version,
								last_synced_at: syncTime,
								user_id: user.id,
							})
							.where('id', localLaw.id)
							.run();
					} else {
						await idb
							.update('laws')
							.set({ last_synced_at: syncTime, user_id: user.id })
							.where('id', localLaw.id)
							.run();
					}
				}
			}

			// Remote only laws: download
			for (const remoteLaw of remoteLaws || []) {
				if (!localLawsMap.has(remoteLaw.id)) {
					await idb
						.insert('laws')
						.values({
							id: remoteLaw.id,
							user_id: user.id,
							title: remoteLaw.title,
							description: remoteLaw.description || undefined,
							created_at: remoteLaw.created_at,
							updated_at: remoteLaw.updated_at,
							deleted_at: remoteLaw.deleted_at || undefined,
							last_synced_at: syncTime,
							version: remoteLaw.version,
						})
						.run();
				}
			}

			// ==========================================
			// 2. SYNC NOTES
			// ==========================================
			const pendingNotes = getFromLocalStorage<$UUID[]>(DELETE_NOTES_QUEUE_KEY) || [];
			if (pendingNotes.length > 0 && window.navigator.onLine) {
				try {
					const { error } = await supabase
						.from('notes')
						.delete()
						.in('id', pendingNotes);
					if (!error) {
						const currentQueue =
							getFromLocalStorage<$UUID[]>(DELETE_NOTES_QUEUE_KEY) || [];
						const remaining = currentQueue.filter(
							(id) => !pendingNotes.includes(id)
						);
						if (remaining.length > 0) {
							saveToLocalStorage(DELETE_NOTES_QUEUE_KEY, remaining);
						} else {
							removeFromLocalStorage(DELETE_NOTES_QUEUE_KEY);
						}
					} else {
						console.warn('Failed to sync pending notes permanent deletes:', error);
					}
				} catch (err) {
					console.error('Failed to sync pending notes permanent deletes:', err);
				}
			}

			// Fetch local and remote notes
			const localNotes = await idb.from('notes').where('user_id', user.id).findAll();
			const { data: remoteNotes, error: remoteNotesError } = await supabase
				.from('notes')
				.select('*');

			if (remoteNotesError) {
				throw new Error(`Failed to fetch remote notes: ${remoteNotesError.message}`);
			}

			const remoteNotesMap = new Map<string, Note>();
			for (const rn of remoteNotes || []) {
				remoteNotesMap.set(rn.id, rn);
			}

			const localNotesMap = new Map<string, Note>();
			for (const ln of localNotes) {
				localNotesMap.set(ln.id, ln);
			}

			// Process notes conflicts
			for (const localNote of localNotes) {
				// Prevent foreign key constraint failure if parent law is not yet synced remotely
				if (localNote.law_id && !validRemoteLawIds.has(localNote.law_id)) {
					console.warn(
						`Skipping push for note ${localNote.id}: Parent law ${localNote.law_id} is not present on remote.`
					);
					continue;
				}

				const remoteNote = remoteNotesMap.get(localNote.id);

				if (!remoteNote) {
					// Local only: upload to remote
					const { error: insertError } = await supabase.from('notes').upsert({
						id: localNote.id,
						user_id: user.id,
						law_id: localNote.law_id,
						title: localNote.title,
						description: localNote.description,
						created_at: localNote.created_at,
						updated_at: localNote.updated_at,
						deleted_at: localNote.deleted_at || null,
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
					// Exists on both: conflict resolution
					let action: SyncType = 'noop';

					if (localNote.version > remoteNote.version) {
						action = 'push';
					} else if (remoteNote.version > localNote.version) {
						action = 'pull';
					} else {
						if (remoteNote.deleted_at && !localNote.deleted_at) {
							action = 'pull';
						} else if (localNote.deleted_at && !remoteNote.deleted_at) {
							action = 'push';
						} else {
							const diff = getTimeDiff(
								localNote.updated_at,
								remoteNote.updated_at
							);

							if (diff > 0) {
								action = 'push';
							} else if (diff < 0) {
								action = 'pull';
							}
						}
					}

					if (action === 'push') {
						const { error: updateError } = await supabase.from('notes').upsert({
							id: localNote.id,
							user_id: user.id,
							law_id: localNote.law_id,
							title: localNote.title,
							description: localNote.description,
							created_at: localNote.created_at,
							updated_at: localNote.updated_at,
							deleted_at: localNote.deleted_at || null,
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
								`Failed to push note update ${localNote.id}:`,
								updateError
							);
						}
					} else if (action === 'pull') {
						await idb
							.update('notes')
							.set({
								law_id: remoteNote.law_id,
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
						await idb
							.update('notes')
							.set({ last_synced_at: syncTime, user_id: user.id })
							.where('id', localNote.id)
							.run();
					}
				}
			}

			// Remote only notes: download
			for (const remoteNote of remoteNotes || []) {
				if (!localNotesMap.has(remoteNote.id)) {
					await idb
						.insert('notes')
						.values({
							id: remoteNote.id,
							user_id: user.id,
							law_id: remoteNote.law_id,
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

			await invalidateLawsAndNotes();

			// Save overall last synced timestamp
			useSettingsStore.getState().setLastSyncedAt(syncTime);
		} catch (error) {
			console.error('Synchronization failed:', error);

			throw error;
		} finally {
			setIsSyncing(false);
		}
	},
};
