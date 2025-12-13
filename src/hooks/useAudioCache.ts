import { useState, useCallback, useRef, useEffect } from 'react';
import { CHARACTERS } from '../data';

type CacheStatus = 'idle' | 'loading' | 'cached' | 'error';

// Global AudioContext (created once, reused)
let audioContext: AudioContext | null = null;

// In-memory cache for decoded AudioBuffers
const audioBufferCache = new Map<string, AudioBuffer>();

export function useAudioCache() {
    const [status, setStatus] = useState<CacheStatus>('idle');
    const [preloadProgress, setPreloadProgress] = useState<number>(0);
    const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

    // Initialize AudioContext on first user interaction (required by browsers)
    const getAudioContext = useCallback(() => {
        if (!audioContext) {
            audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        // Resume if suspended (browsers require user gesture)
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        return audioContext;
    }, []);

    // Fetch and decode a single audio file
    const fetchAndDecode = useCallback(async (path: string): Promise<AudioBuffer | null> => {
        try {
            const response = await fetch(path);
            const arrayBuffer = await response.arrayBuffer();
            const ctx = getAudioContext();
            const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
            return audioBuffer;
        } catch (e) {
            console.error(`Failed to fetch/decode ${path}`, e);
            return null;
        }
    }, [getAudioContext]);

    const playSound = useCallback(async (path: string) => {
        const ctx = getAudioContext();

        // Stop previous sound if playing
        if (currentSourceRef.current) {
            try {
                currentSourceRef.current.stop();
            } catch (e) {
                // Ignore if already stopped
            }
            currentSourceRef.current = null;
        }

        // Check in-memory cache first
        let buffer = audioBufferCache.get(path);

        if (!buffer) {
            // Not in memory, fetch and decode
            setStatus('loading');
            buffer = await fetchAndDecode(path);
            if (buffer) {
                audioBufferCache.set(path, buffer);
            }
        }

        if (buffer) {
            // Create source and play immediately
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            source.start(0);
            currentSourceRef.current = source;
            setStatus('cached');
        } else {
            setStatus('error');
        }
    }, [getAudioContext, fetchAndDecode]);

    const clearCache = useCallback(() => {
        audioBufferCache.clear();
        setStatus('idle');
    }, []);

    const isCached = useCallback((path: string) => {
        return audioBufferCache.has(path);
    }, []);

    // Preload all audio files for all characters into memory
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

        // Filter out already cached in memory
        const uncachedPaths = allPaths.filter(p => !audioBufferCache.has(p));

        if (uncachedPaths.length === 0) {
            setPreloadProgress(100);
            return;
        }

        // Initialize audio context
        getAudioContext();

        let loaded = 0;
        // Use Promise.all for parallel loading (faster)
        const batchSize = 5; // Load 5 files at a time
        for (let i = 0; i < uncachedPaths.length; i += batchSize) {
            const batch = uncachedPaths.slice(i, i + batchSize);
            await Promise.all(batch.map(async (path) => {
                const buffer = await fetchAndDecode(path);
                if (buffer) {
                    audioBufferCache.set(path, buffer);
                }
                loaded++;
                setPreloadProgress(Math.round((loaded / uncachedPaths.length) * 100));
            }));
        }
    }, [getAudioContext, fetchAndDecode]);

    return { playSound, clearCache, status, isCached, preloadAll, preloadProgress };
}
