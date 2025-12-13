import { useState, useCallback, useRef } from 'react';
import { CHARACTERS } from '../data';

type CacheStatus = 'idle' | 'loading' | 'cached' | 'error';

export function useAudioCache() {
    const [status, setStatus] = useState<CacheStatus>('idle');
    const [preloadProgress, setPreloadProgress] = useState<number>(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const getCacheKey = (path: string) => `cachedMP3_${path}`;

    const playSound = useCallback(async (path: string) => {
        // Create audio element once and reuse it
        if (!audioRef.current) {
            audioRef.current = new Audio();
        }

        const audio = audioRef.current;

        // Stop and reset if already playing
        audio.pause();
        audio.currentTime = 0;

        const cacheKey = getCacheKey(path);
        const cachedBase64 = localStorage.getItem(cacheKey);

        const playAudio = (src: string) => {
            audio.src = src;
            audio.play().catch(e => console.error("Play failed", e));
            setStatus('cached');
        };

        if (cachedBase64) {
            playAudio(cachedBase64);
            return;
        }

        // Fetch and cache
        setStatus('loading');
        try {
            const response = await fetch(path);
            const blob = await response.blob();

            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
                const base64data = reader.result as string;
                try {
                    localStorage.setItem(cacheKey, base64data);
                    playAudio(base64data);
                } catch (e) {
                    console.error("Storage full or error", e);
                    playAudio(base64data);
                }
            };
        } catch (e) {
            console.error("Fetch failed", e);
            setStatus('error');
        }
    }, []);

    const clearCache = useCallback(() => {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('cachedMP3_')) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        setStatus('idle');
    }, []);

    const isCached = useCallback((path: string) => {
        return !!localStorage.getItem(getCacheKey(path));
    }, []);

    // Preload all audio files for all characters
    const preloadAll = useCallback(async () => {
        // Collect all unique audio paths
        const allPaths: string[] = [];
        for (const char of CHARACTERS) {
            for (const voiceId of char.validVoices) {
                const path = `sound/${char.id}/${voiceId}.mp3`;
                if (!allPaths.includes(path)) {
                    allPaths.push(path);
                }
            }
        }

        // Filter out already cached
        const uncachedPaths = allPaths.filter(p => !localStorage.getItem(getCacheKey(p)));

        if (uncachedPaths.length === 0) {
            setPreloadProgress(100);
            return;
        }

        let loaded = 0;
        for (const path of uncachedPaths) {
            try {
                const response = await fetch(path);
                const blob = await response.blob();
                const reader = new FileReader();

                await new Promise<void>((resolve) => {
                    reader.readAsDataURL(blob);
                    reader.onloadend = () => {
                        const base64data = reader.result as string;
                        try {
                            localStorage.setItem(getCacheKey(path), base64data);
                        } catch (e) {
                            console.warn("Storage full, stopping preload", e);
                        }
                        resolve();
                    };
                });
            } catch (e) {
                console.warn(`Failed to preload ${path}`, e);
            }
            loaded++;
            setPreloadProgress(Math.round((loaded / uncachedPaths.length) * 100));
        }
    }, []);

    return { playSound, clearCache, status, isCached, preloadAll, preloadProgress };
}

