import { useState, useCallback } from 'react';

type CacheStatus = 'idle' | 'loading' | 'cached' | 'error';

export function useAudioCache() {
    const [status, setStatus] = useState<CacheStatus>('idle');
    const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

    const getCacheKey = (path: string) => `cachedMP3_${path}`;

    const playSound = useCallback(async (path: string) => {
        // Stop previous audio if playing
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }

        const cacheKey = getCacheKey(path);
        const cachedBase64 = localStorage.getItem(cacheKey);

        const playAudio = (src: string) => {
            const audio = new Audio(src);
            audio.play().catch(e => console.error("Play failed", e));
            setCurrentAudio(audio);
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
                    // Fallback: play directly from blob or original URL if storage fails
                    // But to be safe and 1:1, we just play what we have
                    playAudio(base64data);
                    // Note: if storage full, next time it will fetch again.
                }
            };
        } catch (e) {
            console.error("Fetch failed", e);
            setStatus('error');
        }
    }, [currentAudio]);

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

    return { playSound, clearCache, status, isCached };
}
