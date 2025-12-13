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

    // If not triggered, rely on visible prop (legacy double click hide logic passed down)
    // But wait, the legacy logic is:
    // "double click anywhere to toggle UI"
    // "shake triggers IMAGE visibility"
    // The image is HIDDEN by default in legacy, only shows when shaken?
    // Checking legacy main.js: 
    // Line 29: img1 class="hide"
    // objection() function (Line 451): image.classList.remove("hide"); ... setTimeout ... image.classList.add("hide");

    // So yes, image is transient. 
    // UNLESS the user selects something? No, it's a soundboard toy. You shake -> it screams & shows image -> then hides.

    // Wait, I see `img1` src is set to selected voice.

    // So:
    // Default: Image invisible.
    // Trigger: Image Visible + Shake.
    // After 1.3s: Image invisible.

    return (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-[110]">
            <AnimatePresence>
                {isShaking && (
                    <motion.img
                        key={imageSrc}
                        src={imageSrc}
                        alt="Objection"
                        className="w-full max-w-[700px] object-contain drop-shadow-2xl"
                        variants={shakeVariants}
                        animate="shake"
                        initial={{ scale: 0.8, opacity: 0 }}
                        exit={{ scale: 1.1, opacity: 0, transition: { duration: 0.2 } }}
                        whileInView={{ scale: 1, opacity: 1 }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
