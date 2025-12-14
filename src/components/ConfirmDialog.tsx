import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmText = "确定",
    cancelText = "取消",
    onConfirm,
    onCancel
}: ConfirmDialogProps) {
    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCancel}
                        className="fixed inset-0 bg-black/50 z-[100]"
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[90%] max-w-[320px]"
                    >
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-4">
                                <h3 className="text-white font-bold text-lg">{title}</h3>
                            </div>

                            {/* Content */}
                            <div className="px-6 py-5">
                                <p className="text-slate-600 dark:text-slate-300 text-sm">{message}</p>
                            </div>

                            {/* Actions */}
                            <div className="px-6 pb-5 flex gap-3">
                                {cancelText && (
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={onCancel}
                                        className="flex-1 py-2.5 px-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-medium text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                    >
                                        {cancelText}
                                    </motion.button>
                                )}
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onConfirm}
                                    className="flex-1 py-2.5 px-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-medium text-sm shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-shadow"
                                >
                                    {confirmText}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}
