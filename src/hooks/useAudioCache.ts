import { useState, useCallback, useRef } from 'react';

// Global audio element (reused for all playback)
const globalAudio = new Audio();
globalAudio.preload = 'auto';

// LocalStorage key prefix
const CACHE_PREFIX = 'cachedMP3_';

export function useAudioCache() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'cached' | 'error'>('idle');
    const isPlayingRef = useRef(false);

    // Check if a file is cached in localStorage
    const isCached = useCallback((path: string): boolean => {
        const key = `${CACHE_PREFIX}${path}`;
        return localStorage.getItem(key) !== null;
    }, []);

    // Download and cache MP3 to localStorage as base64
    const downloadAndCache = useCallback(async (path: string): Promise<string | null> => {
        try {
            setStatus('loading');
            const response = await fetch(path);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();

            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64data = reader.result as string;
                    const key = `${CACHE_PREFIX}${path}`;
                    try {
                        localStorage.setItem(key, base64data);

                        setStatus('cached');
                        resolve(base64data);
                    } catch (e) {
                        // localStorage might be full
                        console.warn('localStorage full, playing without cache:', e);
                        setStatus('cached');
                        resolve(base64data);
                    }
                };
                reader.onerror = () => {
                    reject(new Error('Failed to read blob as base64'));
                };
                reader.readAsDataURL(blob);
            });
        } catch (e) {
            console.error(`Failed to fetch/cache ${path}`, e);
            setStatus('error');
            return null;
        }
    }, []);

    // Play sound - uses cached version if available
    const playSound = useCallback(async (path: string) => {
        // Stop any currently playing audio
        if (isPlayingRef.current) {
            globalAudio.pause();
            globalAudio.currentTime = 0;
        }

        const key = `${CACHE_PREFIX}${path}`;
        let base64Data = localStorage.getItem(key);

        if (base64Data) {
            // Cached - play immediately
            globalAudio.src = base64Data;
            globalAudio.play().catch(console.warn);
            isPlayingRef.current = true;
            setStatus('cached');
        } else {
            // Not cached - download, cache, and play
            const data = await downloadAndCache(path);
            if (data) {
                globalAudio.src = data;
                globalAudio.play().catch(console.warn);
                isPlayingRef.current = true;
            }
        }
    }, [downloadAndCache]);

    // Clear all audio cache from localStorage
    const clearCache = useCallback(() => {
        const keysToRemove: string[] = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(CACHE_PREFIX)) {
                keysToRemove.push(key);
            }
        }

        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
        });


        setStatus('idle');
    }, []);

    // Audio ended event
    globalAudio.onended = () => {
        isPlayingRef.current = false;
    };

    return { playSound, clearCache, status, isCached };
}
