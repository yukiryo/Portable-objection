import { useState, useEffect, useCallback } from 'react';

interface MotionValues {
    x: number;
    y: number;
    z: number;
}

export function useDeviceMotion(threshold: number = 15) { // Default threshold higher than legacy to avoid accidental
    const [acceleration, setAcceleration] = useState<MotionValues>({ x: 0, y: 0, z: 0 });
    const [maxAcceleration, setMaxAcceleration] = useState<MotionValues>({ x: 0, y: 0, z: 0 });
    const [permissionGranted, setPermissionGranted] = useState(false);

    const requestPermission = useCallback(async () => {
        // iOS 13+ requires permission
        if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
            try {
                const response = await (DeviceMotionEvent as any).requestPermission();
                if (response === 'granted') {
                    setPermissionGranted(true);
                }
            } catch (e) {
                console.error(e);
            }
        } else {
            // Non-iOS or older devices
            setPermissionGranted(true);
        }
    }, []);

    useEffect(() => {
        if (!permissionGranted) return;

        const handleMotion = (event: DeviceMotionEvent) => {
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
        };

        window.addEventListener('devicemotion', handleMotion);
        return () => window.removeEventListener('devicemotion', handleMotion);
    }, [permissionGranted]);

    const isShaking = Math.abs(acceleration.x) > threshold ||
        Math.abs(acceleration.y) > threshold ||
        Math.abs(acceleration.z) > threshold;

    return { acceleration, maxAcceleration, requestPermission, isShaking, permissionGranted };
}
