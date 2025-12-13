import { motion } from 'framer-motion';

interface LoadingScreenProps {
    progress: number;
}

export function LoadingScreen({ progress }: LoadingScreenProps) {
    return (
        <div className="fixed inset-0 z-[999] bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center">
            {/* Logo */}
            <motion.img
                src="img/badge.png"
                alt="Logo"
                className="h-20 w-auto mb-6 drop-shadow-lg"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
            />

            {/* Title */}
            <motion.img
                src="img/suishenyiyi_title.png"
                alt="随身异议"
                className="h-16 w-auto mb-8 drop-shadow-xl"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            />

            {/* Progress Bar Container */}
            <motion.div
                className="w-64 h-2 bg-slate-700 rounded-full overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
            >
                {/* Progress Fill */}
                <motion.div
                    className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                />
            </motion.div>

            {/* Progress Text */}
            <motion.p
                className="mt-4 text-slate-400 text-sm font-mono"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                {progress < 100 ? `加载音频资源... ${progress}%` : '准备就绪！'}
            </motion.p>

            {/* Subtitle */}
            <motion.p
                className="mt-8 text-slate-500 text-xs tracking-widest uppercase"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 0.6 }}
            >
                Portable Objection
            </motion.p>
        </div>
    );
}
