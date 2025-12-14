import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ObjectionDisplayProps {
    imageSrc: string;
    triggerShake: number; // Changed from boolean to number to detect every change
    onShakeComplete?: () => void;
}

const shakeVariants: Variants = {
    shake: {
        x: [-2, 4, -8, 6, -8, 4, -6, 10, -8, 0],
        y: [2, -4, 8, -6, 8, 4, -6, 10, -8, 0],
        transition: {
            duration: 0.3,
            ease: "easeInOut"
        }
    },
    idle: { x: 0, y: 0 }
};

export function ObjectionDisplay({ imageSrc, triggerShake, onShakeComplete }: ObjectionDisplayProps) {
    const [isShaking, setIsShaking] = useState(false);

    useEffect(() => {
        if (triggerShake > 0) {
            setIsShaking(true);
            const timer = setTimeout(() => {
                setIsShaking(false);
                onShakeComplete?.();
            }, 1000); // Keep visible for 1s like legacy
            return () => clearTimeout(timer);
        }
    }, [triggerShake, onShakeComplete]);

    return (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-[110]">
            <AnimatePresence mode="popLayout">
                {isShaking && (
                    <motion.img
                        key={triggerShake}
                        src={imageSrc}
                        alt="Objection"
                        className="w-full max-w-[700px] object-contain drop-shadow-2xl"
                        variants={shakeVariants}
                        animate={{ scale: 1, opacity: 1, ...shakeVariants.shake }}
                        initial={{ scale: 0.85, opacity: 0 }}
                        transition={{ duration: 0.08, ease: "easeOut" }}
                        exit={{ scale: 1.1, opacity: 0, transition: { duration: 0.15 } }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

