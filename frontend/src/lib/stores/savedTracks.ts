import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface Track {
    id: string;
    spotifyId: string;
    title: string;
    artist: string;
    albumArt: string;
    previewUrl?: string;
    duration_ms: number;
    explicit?: boolean;
}

const STORAGE_KEY = 'hearmeout_saved_tracks';

function readStorage(): Track[] {
    if (!browser) return [];
    try {
        const item = window.localStorage.getItem(STORAGE_KEY);
        return item ? JSON.parse(item) : [];
    } catch (e) {
        console.warn('Failed to load saved tracks from localStorage:', e);
        return [];
    }
}

function writeStorage(tracks: Track[]) {
    if (!browser) return;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
    } catch (e) {
        console.warn('Failed to persist saved tracks to localStorage:', e);
    }
}

function createSavedTracksStore() {
    const initialValue: Track[] = readStorage();
    const { subscribe, set, update } = writable<Track[]>(initialValue);

    return {
        subscribe,
        saveTrack: (track: Track) => update((tracks) => {
            if (tracks.some((t) => t.spotifyId === track.spotifyId)) return tracks;
            const newTracks = [track, ...tracks];
            writeStorage(newTracks);
            return newTracks;
        }),
        removeTrack: (spotifyId: string) => update((tracks) => {
            const newTracks = tracks.filter((t) => t.spotifyId !== spotifyId);
            writeStorage(newTracks);
            return newTracks;
        }),
        clear: () => {
            if (browser) {
                try {
                    window.localStorage.removeItem(STORAGE_KEY);
                } catch {}
            }
            set([]);
        },
        setTracks: (tracks: Track[]) => {
            writeStorage(tracks);
            set(tracks);
        }
    };
}

export const savedTracks = createSavedTracksStore();
