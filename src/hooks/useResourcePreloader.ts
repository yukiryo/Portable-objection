import { useState, useEffect, useCallback } from 'react';
import { CHARACTERS, VOICES } from '../constants/gameData';

// Cache API name (same as useAudioCache)
const CACHE_NAME = 'audio-cache-v1';

/**
 * Hook to preload all character audio and image resources on app startup.
 * Uses Cache API for large capacity storage.
 */
export function useResourcePreloader() {
    const [progress, setProgress] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    // Check if audio is already cached in Cache API
    const isAudioCached = useCallback(async (path: string): Promise<boolean> => {
        try {
            const cache = await caches.open(CACHE_NAME);
            const response = await cache.match(path);
            return response !== undefined;
        } catch {
            return false;
        }
    }, []);

    // Download and cache audio to Cache API
    const cacheAudio = useCallback(async (path: string): Promise<boolean> => {
        try {
            const response = await fetch(path);
            if (!response.ok) return false;

            const cache = await caches.open(CACHE_NAME);
            await cache.put(path, response);
            return true;
        } catch {
            return false;
        }
    }, []);

    // Preload a single image
    const preloadImage = useCallback((src: string): Promise<boolean> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = src;
        });
    }, []);

    // Main preload function
    useEffect(() => {
        const preloadAll = async () => {
            // 1. Collect all audio paths from character-voice combinations
            const audioPaths: string[] = [];
            CHARACTERS.forEach(char => {
                char.validVoices.forEach(voiceId => {
                    audioPaths.push(`sound/${char.id}/${voiceId}.mp3`);
                });
            });

            // 2. Collect all image paths from voice IDs
            const imagePaths: string[] = Object.keys(VOICES).map(voiceId => `img/${voiceId}.png`);

            const totalItems = audioPaths.length + imagePaths.length;
            let loadedItems = 0;

            const updateProgress = () => {
                loadedItems++;
                setProgress(Math.round((loadedItems / totalItems) * 100));
            };

            // 3. Preload audio (skip if already cached)
            const audioPromises = audioPaths.map(async (path) => {
                const cached = await isAudioCached(path);
                if (cached) {
                    updateProgress();
                    return;
                }
                await cacheAudio(path);
                updateProgress();
            });

            // 4. Preload images
            const imagePromises = imagePaths.map(async (path) => {
                await preloadImage(path);
                updateProgress();
            });

            // Wait for all to complete
            await Promise.all([...audioPromises, ...imagePromises]);

            setIsComplete(true);
        };

        preloadAll();
    }, [isAudioCached, cacheAudio, preloadImage]);

    return { progress, isComplete };
}
