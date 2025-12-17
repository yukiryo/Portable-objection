import { useState, useCallback, useRef } from 'react';

// Global audio element (reused for all playback)
const globalAudio = new Audio();
globalAudio.preload = 'auto';

// Cache API name
const CACHE_NAME = 'audio-cache-v1';

export function useAudioCache() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'cached' | 'error'>('idle');
    const isPlayingRef = useRef(false);

    // Check if a file is cached in Cache API
    const isCached = useCallback(async (path: string): Promise<boolean> => {
        try {
            const cache = await caches.open(CACHE_NAME);
            const response = await cache.match(path);
            return response !== undefined;
        } catch {
            return false;
        }
    }, []);

    // Download and cache MP3 to Cache API
    const downloadAndCache = useCallback(async (path: string): Promise<Blob | null> => {
        try {
            setStatus('loading');
            const response = await fetch(path);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Clone response and cache it
            const cache = await caches.open(CACHE_NAME);
            await cache.put(path, response.clone());

            const blob = await response.blob();
            setStatus('cached');
            return blob;
        } catch (e) {
            console.error(`Failed to fetch/cache ${path}`, e);
            setStatus('error');
            return null;
        }
    }, []);

    // Get audio URL from cache or fetch
    const getAudioUrl = useCallback(async (path: string): Promise<string | null> => {
        try {
            const cache = await caches.open(CACHE_NAME);
            const response = await cache.match(path);

            if (response) {
                // Cached - create blob URL
                const blob = await response.blob();
                return URL.createObjectURL(blob);
            }

            // Not cached - download and cache
            const blob = await downloadAndCache(path);
            if (blob) {
                return URL.createObjectURL(blob);
            }
            return null;
        } catch {
            return null;
        }
    }, [downloadAndCache]);

    // Play sound - uses cached version if available
    const playSound = useCallback(async (path: string) => {
        // Stop any currently playing audio
        if (isPlayingRef.current) {
            globalAudio.pause();
            globalAudio.currentTime = 0;
            // Revoke previous blob URL to prevent memory leak
            if (globalAudio.src.startsWith('blob:')) {
                URL.revokeObjectURL(globalAudio.src);
            }
        }

        const url = await getAudioUrl(path);
        if (url) {
            globalAudio.src = url;
            globalAudio.play().catch(console.warn);
            isPlayingRef.current = true;
            setStatus('cached');
        }
    }, [getAudioUrl]);

    // Clear all audio cache
    const clearCache = useCallback(async () => {
        try {
            await caches.delete(CACHE_NAME);
            setStatus('idle');
        } catch (e) {
            console.warn('Failed to clear cache:', e);
        }
    }, []);

    // Audio ended event
    globalAudio.onended = () => {
        isPlayingRef.current = false;
        // Revoke blob URL when done
        if (globalAudio.src.startsWith('blob:')) {
            URL.revokeObjectURL(globalAudio.src);
        }
    };

    return { playSound, clearCache, status, isCached };
}
