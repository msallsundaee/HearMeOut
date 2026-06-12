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
}

const STORAGE_KEY = 'hearmeout_saved_tracks';

function createSavedTracksStore() {
    const initialValue: Track[] = browser ? JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]') : [];
    
    const { subscribe, set, update } = writable<Track[]>(initialValue);

    return {
        subscribe,
        saveTrack: (track: Track) => update(tracks => {
            if (tracks.find(t => t.spotifyId === track.spotifyId)) return tracks; // Don't duplicate
            const newTracks = [track, ...tracks];
            if (browser) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newTracks));
            return newTracks;
        }),
        removeTrack: (spotifyId: string) => update(tracks => {
            const newTracks = tracks.filter(t => t.spotifyId !== spotifyId);
            if (browser) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newTracks));
            return newTracks;
        }),
        clear: () => {
            if (browser) window.localStorage.removeItem(STORAGE_KEY);
            set([]);
        },
        setTracks: (tracks: Track[]) => {
            if (browser) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
            set(tracks);
        }
    };
}

export const savedTracks = createSavedTracksStore();
