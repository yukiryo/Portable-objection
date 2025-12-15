import { useState, useEffect, useCallback, useRef } from 'react';

interface MotionValues {
    x: number;
    y: number;
    z: number;
}

// Check if this is an iOS device requiring permission
const isIOSDevice = () => {
    return typeof (DeviceMotionEvent as any).requestPermission === 'function';
};

export function useDeviceMotion(threshold: number = 15) {
    const [acceleration, setAcceleration] = useState<MotionValues>({ x: 0, y: 0, z: 0 });
    const [maxAcceleration, setMaxAcceleration] = useState<MotionValues>({ x: 0, y: 0, z: 0 });
    const [permissionGranted, setPermissionGranted] = useState(false);
    const listenerAddedRef = useRef(false);

    // Motion event handler
    const handleMotion = useCallback((event: DeviceMotionEvent) => {
        const acc = event.acceleration;
        if (!acc) return;

        const x = acc.x || 0;
        const y = acc.y || 0;
        const z = acc.z || 0;

        setAcceleration({ x, y, z });

        setMaxAcceleration(prev => ({
            x: Math.abs(x) > Math.abs(prev.x) ? x : prev.x,
            y: Math.abs(y) > Math.abs(prev.y) ? y : prev.y,
            z: Math.abs(z) > Math.abs(prev.z) ? z : prev.z,
        }));
    }, []);

    // Request permission (only needed for iOS)
    const requestPermission = useCallback(async () => {
        if (isIOSDevice()) {
            try {
                const response = await (DeviceMotionEvent as any).requestPermission();
                if (response === 'granted') {
                    setPermissionGranted(true);
                    if (!listenerAddedRef.current) {
                        window.addEventListener('devicemotion', handleMotion);
                        listenerAddedRef.current = true;
                    }
                }
            } catch (e) {
                console.error(e);
            }
        }
    }, [handleMotion]);

    // For non-iOS devices, start listening immediately on mount
    useEffect(() => {
        if (!isIOSDevice()) {
            if (!listenerAddedRef.current) {
                window.addEventListener('devicemotion', handleMotion);
                listenerAddedRef.current = true;
            }
        }

        return () => {
            if (listenerAddedRef.current) {
                window.removeEventListener('devicemotion', handleMotion);
                listenerAddedRef.current = false;
            }
        };
    }, [handleMotion]);

    const isShaking = Math.abs(acceleration.x) > threshold ||
        Math.abs(acceleration.y) > threshold ||
        Math.abs(acceleration.z) > threshold;

    // isIOS is exported so the UI can conditionally show the authorization hint
    return {
        acceleration,
        maxAcceleration,
        requestPermission,
        isShaking,
        permissionGranted,
        isIOS: isIOSDevice()
    };
}
